// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RedPacket {
    /// @notice Enum representing the type of red packet
    /// @dev Equal: Everyone gets the same amount. Random: Amounts are randomized.
    enum PacketType {
        Equal,
        Random
    }

    /// @notice Structure to store red packet details
    struct Packet {
        bytes32 id; // Unique identifier for the packet
        address creator; // Address of the packet creator
        uint256 totalAmount; // Total ETH deposited
        uint256 remainingAmount; // Amount left to be claimed
        uint256 count; // Total number of packets
        uint256 remainingCount; // Number of packets left
        PacketType packetType; // Type of the packet (Equal or Random)
        uint256 timestamp; // Creation timestamp
    }

    /// @notice Emitted when a new red packet is created
    event PacketCreated(
        bytes32 indexed id,
        address indexed creator,
        uint256 totalAmount,
        uint256 count,
        uint8 packetType
    );

    /// @notice Emitted when a user claims a red packet
    event PacketClaimed(
        bytes32 indexed id,
        address indexed claimer,
        uint256 amount
    );

    /// @notice Stores all red packets by their ID
    mapping(bytes32 => Packet) public packets;

    /// @notice Tracks if an address has claimed a specific packet to prevent double claiming
    mapping(bytes32 => mapping(address => bool)) public hasClaimed;

    /**
     * @notice Creates a new red packet
     * @param _count The number of people who can claim this packet
     * @param _type The type of packet (Equal or Random)
     * @dev Msg.value is the total amount of ETH in the red packet
     */
    function createPacket(uint256 _count, PacketType _type) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_count > 0, "Count must be greater than 0");

        // Generate a unique ID using block data and user input
        bytes32 id = keccak256(
            abi.encodePacked(
                block.timestamp,
                msg.sender,
                block.prevrandao,
                msg.value,
                _count
            )
        );

        packets[id] = Packet({
            id: id,
            creator: msg.sender,
            totalAmount: msg.value,
            remainingAmount: msg.value,
            count: _count,
            remainingCount: _count,
            packetType: _type,
            timestamp: block.timestamp
        });

        emit PacketCreated(id, msg.sender, msg.value, _count, uint8(_type));
    }

    /**
     * @notice Claims a red packet
     * @param _id The unique ID of the red packet to claim
     */
    function claimPacket(bytes32 _id) external {
        Packet storage packet = packets[_id];

        // Validations
        require(packet.id != bytes32(0), "Packet does not exist");
        require(packet.remainingCount > 0, "Packet is empty");
        require(!hasClaimed[_id][msg.sender], "Already claimed");

        uint256 claimAmount;

        // Logic to calculate claim amount
        if (packet.remainingCount == 1) {
            // If it's the last one, take everything remaining to avoid dust
            claimAmount = packet.remainingAmount;
        } else if (packet.packetType == PacketType.Equal) {
            // Equal split
            claimAmount = packet.remainingAmount / packet.remainingCount;
        } else {
            // Random split logic (Simple implementation)
            // Algorithm: Random value between 1 and 2 * average
            uint256 maxClaim = (packet.remainingAmount /
                packet.remainingCount) * 2;

            // Generate pseudo-random number
            uint256 random = uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        msg.sender,
                        block.prevrandao,
                        packet.remainingAmount,
                        packet.remainingCount
                    )
                )
            );

            // Ensure amount is at least 1 wei and within range
            if (maxClaim > 1) {
                claimAmount = (random % (maxClaim - 1)) + 1;
            } else {
                claimAmount = 1;
            }
        }

        // Safety check: Ensure we don't withdraw more than available
        if (claimAmount > packet.remainingAmount) {
            claimAmount = packet.remainingAmount;
        }

        // Update state BEFORE transfer to prevent reentrancy
        packet.remainingCount--;
        packet.remainingAmount -= claimAmount;
        hasClaimed[_id][msg.sender] = true;

        // Transfer ETH to claimer
        (bool success, ) = payable(msg.sender).call{value: claimAmount}("");
        require(success, "Transfer failed");

        emit PacketClaimed(_id, msg.sender, claimAmount);
    }

    /**
     * @notice Returns the details of a red packet
     * @param _id The unique ID of the packet
     * @return Packet struct containing all details
     */
    function getPacketDetails(
        bytes32 _id
    ) external view returns (Packet memory) {
        return packets[_id];
    }
}
