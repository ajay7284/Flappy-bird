'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';

import { config } from '../wagmi';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
        theme={{
            lightMode: lightTheme({
              accentColor: '#F61F44',  // Button color for light theme
              accentColorForeground: 'white',  // Text color on the button
            }),
            darkMode: darkTheme({
              accentColor: '#F61F44',  // Button color for dark theme
              accentColorForeground: 'white',  // Text color on the button
            }),
          }}
        >{children}  </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
