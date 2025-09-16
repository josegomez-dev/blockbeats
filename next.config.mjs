/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['firebase', 'starknetkit', '@starknet-react/core']
  },
  
  // Optimize images
  images: {
    domains: ['blockbeats-tau.vercel.app'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Webpack configuration for better builds
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize for production builds
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          }
        }
      };
    }
    
    return config;
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Output configuration for Vercel
  // output: 'standalone', // Removed as it can cause issues with Vercel
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Build-time environment validation
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
