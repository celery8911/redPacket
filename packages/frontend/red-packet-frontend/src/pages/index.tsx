import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { CreatePacket } from '../components/CreatePacket';
import { PacketList } from '../components/PacketList';
import { MyClaims } from '../components/MyClaims';
import { useAccount } from 'wagmi';

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
            🧧 去中心化红包
          </h1>
          <ConnectButton />
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
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧧</div>
            <h2 style={{ color: '#333', marginBottom: '1rem' }}>欢迎来到红包 DApp</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>连接钱包，开始发红包、抢红包！</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ConnectButton />
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
