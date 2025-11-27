import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { RED_PACKET_ADDRESS, RED_PACKET_ABI } from '../constants';
import { CreateSuccessModal } from './CreateSuccessModal';

export function CreatePacket() {
  const [totalAmount, setTotalAmount] = useState('');
  const [count, setCount] = useState('');
  const [packetType, setPacketType] = useState<0 | 1>(0); // 0: Equal, 1: Random
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      setTotalAmount('');
      setCount('');
      setShowSuccessModal(true);
    }
  }, [isConfirmed]);

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
    <div style={{
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      marginBottom: '2rem',
      border: '1px solid #ffebee'
    }}>
      <h3 style={{
        color: '#d32f2f',
        marginBottom: '1.5rem',
        fontSize: '1.5rem',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>🧧 发红包</h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>总金额 (ETH)</label>
          <input
            type="number"
            step="0.0001"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            required
            placeholder="0.01"
            style={{
              padding: '0.8rem',
              width: '100%',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontSize: '1rem',
              backgroundColor: '#fafafa'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>红包个数</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            required
            placeholder="10"
            style={{
              padding: '0.8rem',
              width: '100%',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontSize: '1rem',
              backgroundColor: '#fafafa'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>红包类型</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setPacketType(0)}
              style={{
                flex: 1,
                padding: '0.8rem',
                borderRadius: '8px',
                border: packetType === 0 ? '2px solid #d32f2f' : '1px solid #e0e0e0',
                backgroundColor: packetType === 0 ? '#ffebee' : '#fff',
                color: packetType === 0 ? '#d32f2f' : '#666',
                cursor: 'pointer',
                fontWeight: packetType === 0 ? 'bold' : 'normal'
              }}
            >
              普通红包 (均分)
            </button>
            <button
              type="button"
              onClick={() => setPacketType(1)}
              style={{
                flex: 1,
                padding: '0.8rem',
                borderRadius: '8px',
                border: packetType === 1 ? '2px solid #d32f2f' : '1px solid #e0e0e0',
                backgroundColor: packetType === 1 ? '#ffebee' : '#fff',
                color: packetType === 1 ? '#d32f2f' : '#666',
                cursor: 'pointer',
                fontWeight: packetType === 1 ? 'bold' : 'normal'
              }}
            >
              拼手气红包 (随机)
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || isConfirming}
          style={{
            marginTop: '1rem',
            padding: '1rem',
            cursor: (isPending || isConfirming) ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(211, 47, 47, 0.3)',
            transition: 'transform 0.1s'
          }}
        >
          {isPending ? '请在钱包确认...' : isConfirming ? '正在塞钱进红包...' : '塞钱进红包'}
        </button>
      </form>

      {showSuccessModal && (
        <CreateSuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
    </div>
  );
}

