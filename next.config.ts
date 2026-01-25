/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: { resolve: { fallback: { fs: boolean; }; }; }) => {
    config.resolve.fallback = { fs: false }; // a veces ayuda con Turbopack y node_modules
    return config;
  },
  experimental: {
    // desactivar Turbopack para build en Vercel
    turbo: false,
  },
};

module.exports = nextConfig;
