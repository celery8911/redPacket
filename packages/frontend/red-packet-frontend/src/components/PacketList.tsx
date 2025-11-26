import { useQuery, gql } from 'urql';
import { formatEther } from 'viem';
import { useWriteContract } from 'wagmi';
import { RED_PACKET_ADDRESS, RED_PACKET_ABI } from '../constants';

const PACKETS_QUERY = gql`
  query GetPackets {
    packets(orderBy: timestamp, orderDirection: desc, first: 20) {
      id
      creator
      totalAmount
      remainingAmount
      count
      remainingCount
      packetType
      timestamp
    }
  }
`;

export function PacketList() {
  const [{ data, fetching, error }] = useQuery({ query: PACKETS_QUERY });
  const { writeContract } = useWriteContract();

  if (fetching) return <p>Loading packets...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleClaim = (id: string) => {
    writeContract({
      address: RED_PACKET_ADDRESS,
      abi: RED_PACKET_ABI,
      functionName: 'claimPacket',
      args: [id as `0x${string}`],
    });
  };

  return (
    <div>
      <h3>Recent Red Packets</h3>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {data.packets.map((packet: any) => (
          <div key={packet.id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <p><strong>ID:</strong> {packet.id.slice(0, 10)}...</p>
            <p><strong>Type:</strong> {packet.packetType === 0 ? 'Equal' : 'Random'}</p>
            <p><strong>Total:</strong> {formatEther(packet.totalAmount)} ETH</p>
            <p><strong>Remaining:</strong> {formatEther(packet.remainingAmount)} ETH</p>
            <p><strong>Count:</strong> {packet.remainingCount} / {packet.count}</p>
            <button
              onClick={() => handleClaim(packet.id)}
              disabled={packet.remainingCount === '0'}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: packet.remainingCount === '0' ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: packet.remainingCount === '0' ? 'not-allowed' : 'pointer'
              }}
            >
              {packet.remainingCount === '0' ? 'Empty' : 'Claim'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
