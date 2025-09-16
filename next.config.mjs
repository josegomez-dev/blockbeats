/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep console logs in production for debugging
  compiler: {
    removeConsole: false,
  },
  
  // Ensure client-side code runs properly
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Ensure client-side code works in production
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
