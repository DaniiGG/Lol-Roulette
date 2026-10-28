import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { LEGACY_SPANISH_BLOG_SLUGS, SPANISH_BLOG_SLUGS, SPANISH_GUIDE_SLUGS } from './lib/blog/localized-slugs';
import { LEGACY_LOCALIZED_PATHS } from './lib/seo/legacy-localized-paths';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

type Redirect = {
  source: string;
  destination: string;
  statusCode: 301;
};

/**
 * Permanent redirects for paths that changed during the localized URL
 * migration. next-intl handles rewrites from public localized paths to the
 * internal App Router routes, but historical URLs must keep their SEO value
 * with an explicit 301 instead of a temporary middleware redirect.
 */
function buildLegacyRedirects(): Redirect[] {
  const redirects: Redirect[] = [];
  const seen = new Set<string>();

  const add = (source: string, destination: string) => {
    if (source === destination || seen.has(source)) return;
    seen.add(source);
    redirects.push({ source, destination, statusCode: 301 });
  };

  // Localized static path segments used before the URL simplification.
  for (const [source, destination] of Object.entries(LEGACY_LOCALIZED_PATHS)) {
    add(source, destination);
  }

  // Spanish blog posts that used the canonical English slug.
  for (const [canonical, localized] of Object.entries(SPANISH_BLOG_SLUGS)) {
    add(`/es/blog/${canonical}`, `/es/blog/${localized}`);
  }

  // Older Spanish slugs that predate the current canonical set.
  for (const [legacy, localized] of Object.entries(LEGACY_SPANISH_BLOG_SLUGS)) {
    add(`/es/blog/${legacy}`, `/es/blog/${localized}`);
  }

  // Spanish champion guides that used the canonical or English public slug.
  for (const [canonical, localized] of Object.entries(SPANISH_GUIDE_SLUGS)) {
    add(`/es/blog/guias/${canonical}`, `/es/blog/guides/${localized}`);
    add(`/es/blog/guias/how-to-play-${canonical}`, `/es/blog/guides/${localized}`);
    add(`/es/blog/guias/${localized}`, `/es/blog/guides/${localized}`);
    add(`/es/blog/guides/${canonical}`, `/es/blog/guides/${localized}`);
    add(`/es/blog/guides/how-to-play-${canonical}`, `/es/blog/guides/${localized}`);
  }

  return redirects;
}

const nextConfig: NextConfig = {
  async redirects() {
    return buildLegacyRedirects();
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
