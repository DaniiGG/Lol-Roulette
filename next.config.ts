import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/es/blog/tier-list-lol-parche-26-21',
        destination: '/es/blog/lol-patch-26-21-tier-list',
        statusCode: 301,
      },
    ];
  },
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