"use client";

import { getDefaultConfig } from "connectkit";
import { ConnectKitProvider } from "connectkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

const defaultConfig = getDefaultConfig({
  chains: [base],
  walletConnectProjectId: 'cc7abb6eebc730db581ea67ccc0ca75b',
  appName: "Farstore",
  transports: {
    [base.id]: http(),
  },
});
// @ts-expect-error: TS2339
defaultConfig.connectors?.push(farcasterFrame());
export const config = createConfig(defaultConfig);

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
