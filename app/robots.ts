import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://leagueroulette.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/test-verify/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}