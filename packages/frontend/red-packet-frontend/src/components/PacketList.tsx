import { useQuery, gql } from 'urql';
import { formatEther, decodeEventLog } from 'viem';
import { useWriteContract, useAccount, useReadContracts, useWatchContractEvent, useWaitForTransactionReceipt } from 'wagmi';
import { RED_PACKET_ADDRESS, RED_PACKET_ABI } from '../constants';
import { useEffect, useState } from 'react';

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

  // Reset claiming ID if user rejects wallet request or error occurs
  useEffect(() => {
    if (writeError) {
      setClaimingId(null);
      alert(`Error: ${writeError.message}`);
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
      refetchStatus(); // Also refetch status to update "Claimed" buttons
    },
  });

  // Prepare contract calls to check if user has claimed each packet
  const packets = data?.packets || [];
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

  // Refetch data when transaction confirms (Local events)
  useEffect(() => {
    if (isConfirmed && receipt) {
      refetchStatus();
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
            alert(`🎉 Congratulations! You claimed ${formatEther(amount)} ETH!`);
            break;
          }
        } catch (e) {
          // Ignore logs that don't match our ABI
        }
      }
    }
  }, [isConfirmed, receipt, refetchStatus, reexecuteQuery]);

  // Refetch claim status when packets change
  useEffect(() => {
    if (packets.length > 0 && address) {
      refetchStatus();
    }
  }, [packets, address, refetchStatus]);


  if (fetching) return <p>Loading packets...</p>;
  if (error) return <p>Error: {error.message}</p>;

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
      <h3>Recent Red Packets</h3>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {packets.map((packet: any, index: number) => {
          const isClaimed = claimStatus?.[index]?.result;
          const isEmpty = packet.remainingCount === '0';
          const isButtonDisabled = isEmpty || isClaimed || (claimingId === packet.id);

          // Determine button state
          let buttonText = 'Claim';
          let buttonColor = '#28a745'; // Green

          if (claimingId === packet.id) {
            if (isWritePending) buttonText = 'Confirming...';
            else if (isConfirming) buttonText = 'Claiming...';
            else buttonText = 'Processing...';
            buttonColor = '#007bff'; // Blue for loading
          } else if (isClaimed) {
            buttonText = 'Claimed';
            buttonColor = '#6c757d'; // Grey
          } else if (isEmpty) {
            buttonText = 'Empty';
            buttonColor = '#dc3545'; // Red
          }

          return (
            <div key={packet.id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', backgroundColor: '#fafafa', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                ID: {packet.id.slice(0, 6)}...{packet.id.slice(-4)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{formatEther(packet.totalAmount)} ETH</span>
                <span style={{ backgroundColor: packet.packetType === 0 ? '#e3f2fd' : '#f3e5f5', color: packet.packetType === 0 ? '#1976d2' : '#7b1fa2', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                  {packet.packetType === 0 ? 'Equal' : 'Random'}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1rem' }}>
                Remaining: {formatEther(packet.remainingAmount)} ETH ({packet.remainingCount}/{packet.count})
              </div>

              <button
                onClick={() => handleClaim(packet.id)}
                disabled={!!isButtonDisabled}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: buttonColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: isButtonDisabled ? 0.7 : 1,
                  transition: 'opacity 0.2s, background-color 0.2s'
                }}
              >
                {buttonText}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
