// app/robots.ts
import { MetadataRoute } from 'next'

const baseUrl = 'https://alromoni.vercel.app/'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '*',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}