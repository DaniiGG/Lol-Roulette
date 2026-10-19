import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
        pathname: '/cdn/**',
      },
    ],
  },
  webpack: (config: { resolve: { fallback: { fs: boolean } } }) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default withNextIntl(nextConfig);