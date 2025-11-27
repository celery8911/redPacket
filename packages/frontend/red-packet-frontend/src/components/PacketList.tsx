import { useQuery, gql } from 'urql';
import { formatEther, decodeEventLog } from 'viem';
import { useWriteContract, useAccount, useReadContracts, useWatchContractEvent, useWaitForTransactionReceipt } from 'wagmi';
import { RED_PACKET_ADDRESS, RED_PACKET_ABI } from '../constants';
import { useEffect, useState } from 'react';
import { ClaimSuccessModal } from './ClaimSuccessModal';
import styles from '../styles/Home.module.css';

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
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({ query: PACKETS_QUERY });
  const { data: hash, writeContract, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({ hash });
  const { address } = useAccount();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [successAmount, setSuccessAmount] = useState<string | null>(null);

  // Reset claiming ID if user rejects wallet request or error occurs
  useEffect(() => {
    if (writeError) {
      setClaimingId(null);
      alert(`错误: ${writeError.message}`);
    }
  }, [writeError]);

  // Watch for contract events to refresh the list (External events)
  useWatchContractEvent({
    address: RED_PACKET_ADDRESS,
    abi: RED_PACKET_ABI,
    eventName: 'PacketCreated',
    onLogs: () => {
      reexecuteQuery({ requestPolicy: 'network-only' });
    },
  });

  useWatchContractEvent({
    address: RED_PACKET_ADDRESS,
    abi: RED_PACKET_ABI,
    eventName: 'PacketClaimed',
    onLogs: () => {
      reexecuteQuery({ requestPolicy: 'network-only' });
      refetchStatus();
      refetchPacketData(); // Refresh real-time packet data
    },
  });

  const packets = data?.packets || [];

  // 1. Check if user has claimed
  const { data: claimStatus, refetch: refetchStatus } = useReadContracts({
    contracts: packets.map((packet: any) => ({
      address: RED_PACKET_ADDRESS,
      abi: RED_PACKET_ABI,
      functionName: 'hasClaimed',
      args: [packet.id, address],
    })),
    query: {
      enabled: !!address && packets.length > 0,
    }
  });

  // 2. Fetch REAL-TIME packet data (remainingAmount, remainingCount) from contract
  // This overrides subgraph data which might be delayed
  const { data: realTimePackets, refetch: refetchPacketData } = useReadContracts({
    contracts: packets.map((packet: any) => ({
      address: RED_PACKET_ADDRESS,
      abi: RED_PACKET_ABI,
      functionName: 'packets', // Assuming public getter for Packet struct
      args: [packet.id],
    })),
    query: {
      enabled: packets.length > 0,
    }
  });

  // Refetch data when transaction confirms (Local events)
  useEffect(() => {
    if (isConfirmed && receipt) {
      refetchStatus();
      refetchPacketData();
      reexecuteQuery({ requestPolicy: 'network-only' });
      setClaimingId(null);

      // Parse logs to find PacketClaimed event
      for (const log of receipt.logs) {
        try {
          const decodedLog = decodeEventLog({
            abi: RED_PACKET_ABI,
            data: log.data,
            topics: log.topics,
          });
          if (decodedLog.eventName === 'PacketClaimed') {
            const amount = decodedLog.args.amount;
            setSuccessAmount(formatEther(amount));
            break;
          }
        } catch (e) {
          // Ignore logs that don't match our ABI
        }
      }
    }
  }, [isConfirmed, receipt, refetchStatus, reexecuteQuery, refetchPacketData]);

  // Initial refetch
  useEffect(() => {
    if (packets.length > 0) {
      if (address) refetchStatus();
      refetchPacketData();
    }
  }, [packets, address, refetchStatus, refetchPacketData]);


  if (fetching) return <p style={{ textAlign: 'center', color: '#666' }}>正在加载红包广场...</p>;
  if (error) return <p style={{ textAlign: 'center', color: 'red' }}>加载失败: {error.message}</p>;

  const handleClaim = (id: string) => {
    setClaimingId(id);
    writeContract({
      address: RED_PACKET_ADDRESS,
      abi: RED_PACKET_ABI,
      functionName: 'claimPacket',
      args: [id as `0x${string}`],
    });
  };

  return (
    <div>
      <h3 style={{ color: '#d32f2f', borderBottom: '2px solid #ffebee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>🧧 红包广场</h3>
      <div className={styles.packetGrid}>
        {packets.map((packet: any, index: number) => {
          const isClaimed = claimStatus?.[index]?.result;

          // Use real-time data if available, otherwise fallback to subgraph
          const realTimeData = realTimePackets?.[index]?.result as any;
          // Struct: id, creator, totalAmount, remainingAmount, count, remainingCount, packetType, timestamp
          // Index: 0,  1,       2,           3,               4,     5,              6,          7

          const remainingAmount = realTimeData ? realTimeData[3] : packet.remainingAmount;
          const remainingCount = realTimeData ? realTimeData[5] : packet.remainingCount;

          const isEmpty = remainingCount.toString() === '0';
          const isButtonDisabled = isEmpty || isClaimed || (claimingId === packet.id);

          // Determine button state
          let buttonText = '抢！';
          let buttonBg = 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)';
          let cardBorder = '1px solid #ffebee';
          let cardBg = '#fff';

          if (claimingId === packet.id) {
            if (isWritePending) buttonText = '请签名...';
            else if (isConfirming) buttonText = '抢夺中...';
            else buttonText = '处理中...';
            buttonBg = '#ff9800'; // Orange
          } else if (isClaimed) {
            buttonText = '已领取';
            buttonBg = '#bdbdbd'; // Grey
            cardBg = '#f5f5f5';
          } else if (isEmpty) {
            buttonText = '已抢完';
            buttonBg = '#e0e0e0'; // Light Grey
            cardBg = '#f5f5f5';
          }

          return (
            <div key={packet.id} style={{
              border: cardBorder,
              padding: '1.2rem',
              borderRadius: '16px',
              backgroundColor: cardBg,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative circle */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#ffebee',
                opacity: 0.5
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', position: 'relative' }}>
                <span style={{ fontWeight: 'bold', color: '#d32f2f', fontSize: '1.2rem' }}>{parseFloat(Number(formatEther(packet.totalAmount)).toFixed(4))} ETH</span>
                <span style={{
                  backgroundColor: packet.packetType === 0 ? '#fff3e0' : '#f3e5f5',
                  color: packet.packetType === 0 ? '#ef6c00' : '#7b1fa2',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  border: packet.packetType === 0 ? '1px solid #ffe0b2' : '1px solid #e1bee7'
                }}>
                  {packet.packetType === 0 ? '普通红包' : '拼手气红包'}
                </span>
              </div>

              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                <span style={{ marginRight: '0.5rem' }}>剩余金额:</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{parseFloat(Number(formatEther(remainingAmount)).toFixed(4))} ETH</span>
              </div>

              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.2rem' }}>
                <span style={{ marginRight: '0.5rem' }}>剩余个数:</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{remainingCount.toString()} / {packet.count}</span>
              </div>

              <button
                onClick={() => handleClaim(packet.id)}
                disabled={!!isButtonDisabled}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: buttonBg,
                  color: isButtonDisabled && !isClaimed && !isEmpty ? '#fff' : (isEmpty || isClaimed ? '#fff' : '#fff'),
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  opacity: isButtonDisabled ? 0.8 : 1,
                  transition: 'all 0.2s',
                  boxShadow: isButtonDisabled ? 'none' : '0 4px 6px rgba(211, 47, 47, 0.2)'
                }}
              >
                {buttonText}
              </button>
            </div>
          );
        })}
      </div>

      {successAmount && (
        <ClaimSuccessModal
          amount={successAmount}
          onClose={() => setSuccessAmount(null)}
        />
      )}
    </div>
  );
}
