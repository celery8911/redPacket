import { useQuery, gql } from 'urql';
import { formatEther } from 'viem';
import { useAccount, useWatchContractEvent } from 'wagmi';
import { RED_PACKET_ADDRESS, RED_PACKET_ABI } from '../constants';

const MY_CLAIMS_QUERY = gql`
  query GetMyClaims($claimer: Bytes!) {
    claims(where: { claimer: $claimer }, orderBy: timestamp, orderDirection: desc) {
      id
      amount
      timestamp
      packet {
        id
      }
    }
  }
`;

export function MyClaims() {
  const { address } = useAccount();
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: MY_CLAIMS_QUERY,
    variables: { claimer: address },
    pause: !address,
  });

  useWatchContractEvent({
    address: RED_PACKET_ADDRESS,
    abi: RED_PACKET_ABI,
    eventName: 'PacketClaimed',
    onLogs: () => {
      reexecuteQuery({ requestPolicy: 'network-only' });
    },
  });

  if (!address) return null;
  if (fetching) return <p style={{ textAlign: 'center', color: '#666' }}>加载战绩中...</p>;
  if (error) return <p style={{ textAlign: 'center', color: 'red' }}>加载失败: {error.message}</p>;

  const claims = data?.claims || [];
  const totalAmount = claims.reduce((acc: number, claim: any) => acc + Number(formatEther(claim.amount)), 0);

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      marginTop: '2rem'
    }}>
      <h3 style={{
        color: '#d32f2f',
        borderBottom: '2px solid #ffebee',
        paddingBottom: '0.5rem',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>我的战绩 🏆</span>
        <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
          共抢到 <span style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '1.1rem' }}>{parseFloat(totalAmount.toFixed(4))}</span> ETH
        </span>
      </h3>

      {claims.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', padding: '1rem' }}>还没有抢到红包，快去试试手气！</p>
      ) : (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {claims.map((claim: any) => (
            <div key={claim.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.8rem 0',
              borderBottom: '1px solid #f5f5f5'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#333' }}>抢到红包</div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>
                  {new Date(Number(claim.timestamp) * 1000).toLocaleString()}
                </div>
              </div>
              <div style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                +{parseFloat(Number(formatEther(claim.amount)).toFixed(4))} ETH
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
