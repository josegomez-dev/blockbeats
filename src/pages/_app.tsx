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
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';

import Layout from '@/components/Layout'

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
                <Analytics />
                {process.env.NEXT_PUBLIC_ANALYTICS_MEASUREMENT_ID && (
                  <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_ANALYTICS_MEASUREMENT_ID} />
                )}
            </Layout>
        </GlobalProvider>
      </AuthProvider>
    </StarknetConfig>
  )
}

export default MyApp
