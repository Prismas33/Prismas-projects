/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Improve hydration stability
  reactStrictMode: false, // Desativar para evitar double render
  swcMinify: true,  // Headers para evitar cache em desenvolvimento e CORS
  async headers() {
    const headers = [];
    
    if (process.env.NODE_ENV === 'development') {
      headers.push({
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      });
    }
    
    // CORS headers para permitir linkmind.space
    headers.push({
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: 'https://linkmind.space, https://www.linkmind.space, http://localhost:3000',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization',
        },
      ],
    });
    
    return headers;
  },
};

module.exports = nextConfig;
