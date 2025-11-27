export const RED_PACKET_ADDRESS = '0xc2F536F5746c812EA681F6b60fBB2EA0cf42E8fD';

export const RED_PACKET_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: '_count', type: 'uint256' },
      { internalType: 'enum RedPacket.PacketType', name: '_type', type: 'uint8' },
    ],
    name: 'createPacket',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_id', type: 'bytes32' }],
    name: 'claimPacket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'hasClaimed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'totalAmount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'count', type: 'uint256' },
      { indexed: false, internalType: 'uint8', name: 'packetType', type: 'uint8' },
    ],
    name: 'PacketCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'claimer', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'PacketClaimed',
    type: 'event',
  },
] as const;
