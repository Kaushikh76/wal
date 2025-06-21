import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { arbitrum } from 'viem/chains';
import { http } from 'viem';
import { createConfig } from 'wagmi';

export const wagmiConfig = createConfig({
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(),
  },
});

export const privyConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  config: {
    loginMethods: ['email', 'wallet'],
    appearance: {
      theme: 'light',
      accentColor: '#676FFF',
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      requireUserPasswordOnCreate: false,
    },
    externalWallets: {
      coinbaseWallet: {
        connectionOptions: 'all',
      },
      metamask: {
        connectionOptions: 'all',
      },
      walletConnect: {
        connectionOptions: 'all',
      },
    },
  },
};