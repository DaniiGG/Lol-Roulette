
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://lol-roulette-nine.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'], // Bloquear APIs y admin
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}