import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { RED_PACKET_ADDRESS, RED_PACKET_ABI } from '../constants';

export function CreatePacket() {
  const [totalAmount, setTotalAmount] = useState('');
  const [count, setCount] = useState('');
  const [packetType, setPacketType] = useState<0 | 1>(0); // 0: Equal, 1: Random

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalAmount || !count) return;

    writeContract({
      address: RED_PACKET_ADDRESS,
      abi: RED_PACKET_ABI,
      functionName: 'createPacket',
      args: [BigInt(count), packetType],
      value: parseEther(totalAmount),
    });
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
      <h3>Create Red Packet</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Total Amount (ETH): </label>
          <input
            type="number"
            step="0.0001"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            required
            style={{ padding: '0.5rem', width: '100%' }}
          />
        </div>
        <div>
          <label>Count: </label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            required
            style={{ padding: '0.5rem', width: '100%' }}
          />
        </div>
        <div>
          <label>Type: </label>
          <select
            value={packetType}
            onChange={(e) => setPacketType(Number(e.target.value) as 0 | 1)}
            style={{ padding: '0.5rem', width: '100%' }}
          >
            <option value={0}>Equal Split</option>
            <option value={1}>Random Split</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending || isConfirming}
          style={{ padding: '0.5rem', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {isPending ? 'Confirming...' : isConfirming ? 'Waiting for Receipt...' : 'Create Packet'}
        </button>
      </form>
      {isConfirmed && <div style={{ marginTop: '1rem', color: 'green' }}>Transaction Confirmed!</div>}
      {hash && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Tx Hash: {hash}</div>}
    </div>
  );
}
