import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { CreatePacket } from '../components/CreatePacket';
import { PacketList } from '../components/PacketList';
import { useAccount } from 'wagmi';

const Home: NextPage = () => {
  const { isConnected } = useAccount();

  return (
    <div className={styles.container}>
      <Head>
        <title>Red Packet App</title>
        <meta
          content="Decentralized Red Packet App"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <ConnectButton />
        </div>

        <h1 className={styles.title} style={{ marginBottom: '2rem' }}>
          Red Packet DApp
        </h1>

        {isConnected ? (
          <div style={{ width: '100%', maxWidth: '800px' }}>
            <CreatePacket />
            <PacketList />
          </div>
        ) : (
          <p>Please connect your wallet to use the app.</p>
        )}
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ❤️ by your frens at 🌈
        </a>
      </footer>
    </div>
  );
};


export default Home;
