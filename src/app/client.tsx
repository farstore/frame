'use client';

import { Provider } from 'react-redux';
import WagmiProvider from "~/components/providers/WagmiProvider";
import Navigation from "~/components/Navigation";
import { store } from '~/store';

export default function Client({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <Provider store={store}>
      <WagmiProvider>
        <Navigation />
        {children}
      </WagmiProvider>
    </Provider>
  );
}
