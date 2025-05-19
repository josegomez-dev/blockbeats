import './../app/globals.css'

import { GlobalProvider } from '@/context/GlobalContext'
import { AuthProvider } from '@/context/AuthContext'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'

import Layout from '@/components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <GlobalProvider>
          <Layout>
              <Toaster/>
              <Component {...pageProps} />
          </Layout>
      </GlobalProvider>
    </AuthProvider>
  )
}

export default MyApp
