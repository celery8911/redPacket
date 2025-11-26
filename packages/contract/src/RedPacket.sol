// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RedPacket {
    enum PacketType { Equal, Random }

    struct Packet {
        bytes32 id;
        address creator;
        uint256 totalAmount;
        uint256 remainingAmount;
        uint256 count;
        uint256 remainingCount;
        PacketType packetType;
        uint256 timestamp;
    }

    event PacketCreated(
        bytes32 indexed id,
        address indexed creator,
        uint256 totalAmount,
        uint256 count,
        uint8 packetType
    );

    event PacketClaimed(
        bytes32 indexed id,
        address indexed claimer,
        uint256 amount
    );

    mapping(bytes32 => Packet) public packets;
    mapping(bytes32 => mapping(address => bool)) public hasClaimed;

    function createPacket(uint256 _count, PacketType _type) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_count > 0, "Count must be greater than 0");
        
        // Generate a unique ID
        bytes32 id = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            block.prevrandao,
            msg.value,
            _count
        ));

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

    function claimPacket(bytes32 _id) external {
        Packet storage packet = packets[_id];
        require(packet.id != bytes32(0), "Packet does not exist");
        require(packet.remainingCount > 0, "Packet is empty");
        require(!hasClaimed[_id][msg.sender], "Already claimed");

        uint256 claimAmount;

        if (packet.remainingCount == 1) {
            claimAmount = packet.remainingAmount;
        } else if (packet.packetType == PacketType.Equal) {
            claimAmount = packet.remainingAmount / packet.remainingCount;
        } else {
            // Random amount logic
            // Simple random algorithm: random between 1 and 2 * average
            uint256 maxClaim = (packet.remainingAmount / packet.remainingCount) * 2;
            
            // Generate pseudo-random number
            uint256 random = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                msg.sender,
                block.prevrandao,
                packet.remainingAmount,
                packet.remainingCount
            )));
            
            // Avoid 0 amount if possible, though with 1 wei it's hard.
            // We use modulo to get a value between 0 and maxClaim - 1, then add 1.
            if (maxClaim > 1) {
                 claimAmount = (random % (maxClaim - 1)) + 1;
            } else {
                 claimAmount = 1;
            }
        }

        // Safety check to ensure we don't overflow or leave dust that can't be claimed
        // If the calculated amount is greater than remaining, just give remaining (shouldn't happen with logic above but good for safety)
        if (claimAmount > packet.remainingAmount) {
            claimAmount = packet.remainingAmount;
        }

        // Update state
        packet.remainingCount--;
        packet.remainingAmount -= claimAmount;
        hasClaimed[_id][msg.sender] = true;

        // Transfer
        (bool success, ) = payable(msg.sender).call{value: claimAmount}("");
        require(success, "Transfer failed");

        emit PacketClaimed(_id, msg.sender, claimAmount);
    }

    function getPacketDetails(bytes32 _id) external view returns (Packet memory) {
        return packets[_id];
    }
}
