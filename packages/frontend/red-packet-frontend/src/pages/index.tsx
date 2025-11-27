import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { CreatePacket } from '../components/CreatePacket';
import { PacketList } from '../components/PacketList';
import { MyClaims } from '../components/MyClaims';
import { useAccount } from 'wagmi';

const CustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button" style={{
                    background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                    transition: 'transform 0.1s',
                  }}>
                    连接钱包
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button" style={{
                    background: '#ff5252',
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}>
                    Wrong network
                  </button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={openChainModal}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#fff',
                      border: '1px solid #ffebee',
                      borderRadius: '12px',
                      padding: '8px 16px',
                      color: '#333',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button onClick={openAccountModal} type="button" style={{
                    background: '#fff',
                    border: '1px solid #ffebee',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    color: '#d32f2f',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {account.ensAvatar && (
                      <img
                        src={account.ensAvatar}
                        alt="ENS Avatar"
                        style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 8 }}
                      />
                    )}
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

const Home: NextPage = () => {
  const { isConnected } = useAccount();

  return (
    <div className={styles.container}>
      <Head>
        <title>Red Packet DApp - 抢红包</title>
        <meta
          content="Decentralized Red Packet App"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>
            <span className={styles.logo}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.925 23.96L15.996 24.18L23.656 19.65L15.925 23.96ZM16.004 0L15.869 0.455L8.25 13.09L16.004 17.69L23.754 13.09L16.004 0ZM15.925 19.09L8.349 14.63L15.925 25.29V19.09ZM16.004 18.99L23.664 14.63L16.004 25.29V18.99ZM8.25 13.09L16.004 17.69V0L8.25 13.09ZM16.004 26.63L15.949 26.7L8.25 15.86L16.004 26.63ZM16.004 26.63V32L23.754 15.86L16.004 26.63Z" fill="white" />
              </svg>
            </span> 去中心化红包
          </h1>
          <CustomConnectButton />
        </div>

        {isConnected ? (
          <div className={styles.contentGrid}>
            <div className={styles.stickySidebar}>
              <CreatePacket />
              <MyClaims />
            </div>
            <div>
              <PacketList />
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: '#fff',
              borderRadius: '24px',
              boxShadow: '0 10px 30px rgba(211, 47, 47, 0.15)',
              border: '2px solid #ffebee',
              maxWidth: '600px',
              width: '100%',
              background: 'linear-gradient(180deg, #fff 0%, #fffbfb 100%)'
            }}>
              <div style={{
                fontSize: '6rem',
                marginBottom: '1.5rem',
                animation: 'bounce 2s infinite ease-in-out'
              }}>🧧</div>
              <h2 style={{
                color: '#d32f2f',
                marginBottom: '1rem',
                fontSize: '2.5rem',
                fontWeight: '800'
              }}>
                欢迎来到红包 DApp
              </h2>
              <p style={{
                color: '#666',
                marginBottom: '3rem',
                fontSize: '1.2rem',
                lineHeight: '1.6'
              }}>
                连接钱包，体验去中心化的
                <br />
                <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>发红包</span> 与 <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>抢红包</span> 乐趣！
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', transform: 'scale(1.1)' }}>
                <CustomConnectButton />
              </div>
              <style>{`
                @keyframes bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
              `}</style>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <a href="https://github.com/celery8911/redPacket" rel="noopener noreferrer" target="_blank">
          Built with ❤️ on Sepolia
        </a>
      </footer>
    </div>
  );
};

export default Home;
