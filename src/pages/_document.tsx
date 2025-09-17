import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logos/logo.webp" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/logos/logo.webp" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/logos/logo.webp" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#00FFFF" />
        <meta name="msapplication-TileColor" content="#00FFFF" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* DNS Prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//vercel.live" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
