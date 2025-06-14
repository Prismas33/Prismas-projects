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
  // Adiciona suporte para recursos estáticos
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  // Configuração do output
  output: 'standalone',
  // Desabilitar compressions para desenvolvimento
  compress: process.env.NODE_ENV === 'production',
  // Melhorar a detecção de pacotes de estilos
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
