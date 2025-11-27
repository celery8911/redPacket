import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ClaimSuccessModalProps {
  amount: string;
  onClose: () => void;
}

export function ClaimSuccessModal({ amount, onClose }: ClaimSuccessModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: '#d32f2f',
        padding: '2rem',
        borderRadius: '16px',
        textAlign: 'center',
        maxWidth: '90%',
        width: '320px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        border: '4px solid #fbc02d',
        animation: 'popIn 0.3s ease-out'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧧</div>
        <h2 style={{ color: '#fbc02d', margin: '0 0 1rem 0', fontSize: '1.8rem' }}>恭喜发财！</h2>
        <p style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>您抢到了</p>
        <p style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 1.5rem 0' }}>
          {parseFloat(Number(amount).toFixed(4))} <span style={{ fontSize: '1rem' }}>ETH</span>
        </p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#fbc02d',
            color: '#d32f2f',
            border: 'none',
            padding: '0.8rem 2rem',
            borderRadius: '25px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
            transition: 'transform 0.1s'
          }}
        >
          开心收下
        </button>
      </div>
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
}
