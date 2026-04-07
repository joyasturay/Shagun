import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/collector/'], 
    },
    sitemap: 'https://shagun-e1ex.vercel.app/sitemap.xml',
  }
}