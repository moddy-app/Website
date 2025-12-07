/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  // Permet l'utilisation de Web Components (Material Web 3)
  experimental: {
    optimizePackageImports: ['@material/web'],
  },
}

module.exports = nextConfig
