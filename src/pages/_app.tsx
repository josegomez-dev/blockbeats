import './../app/globals.css'

import { sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  publicProvider,
  argent,
  braavos,
} from "@starknet-react/core";

import { GlobalProvider } from '@/context/GlobalContext'
import { AuthProvider } from '@/context/AuthContext'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'

import Layout from '@/components/Layout'
import SidebarChatPanel from '@/components/SidebarChatPanel';

function MyApp({ Component, pageProps }: AppProps) {
  const chains = [sepolia];
  const provider = publicProvider();
  const connectors = [braavos(), argent()];
  
  return (
    <StarknetConfig chains={chains} provider={provider} connectors={connectors}>
      <AuthProvider>
        <GlobalProvider>
            <Layout>
                <Toaster/>
                <Component {...pageProps} />
                <SidebarChatPanel />
            </Layout>
        </GlobalProvider>
      </AuthProvider>
    </StarknetConfig>
  )
}

export default MyApp
