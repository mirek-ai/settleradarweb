import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import { getSortedPostsData } from '@/lib/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://settleradar.com'
  
  // Static pages
  const routes = [
    '',
    '/blog',
    '/compare',
    '/digital-nomad-visa-countries',
    '/privacy',
    '/cookies'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Database (Countries)
  const dbPath = path.join(process.cwd(), 'src', 'data', 'database.json')
  let db: any = { countries: [] }
  try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
  } catch (e) {
    console.error("Failed to load database.json for sitemap", e);
  }
  
  const countries = db.countries.filter((c: any) => Object.keys(c.indicators || {}).length > 5)

  const countryRoutes = countries.map((c: any) => ({
    url: `${baseUrl}/country/${c.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Blog posts
  let postRoutes: any[] = []
  try {
    const posts = getSortedPostsData()
    postRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date).toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch (e) {
    console.error("Failed to load blog posts for sitemap", e);
  }

  return [...routes, ...countryRoutes, ...postRoutes]
}
