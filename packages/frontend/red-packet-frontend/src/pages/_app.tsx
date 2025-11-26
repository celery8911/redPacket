import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { config } from '../wagmi';

import { createClient, Provider, cacheExchange, fetchExchange } from 'urql';

const client = new QueryClient();

const urqlClient = createClient({
  url: 'https://api.studio.thegraph.com/query/1716172/red-packet-subgraph/version/latest',
  requestPolicy: 'cache-and-network',
  exchanges: [cacheExchange, fetchExchange],
  preferGetMethod: false,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <Provider value={urqlClient}>
            <Component {...pageProps} />
          </Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
