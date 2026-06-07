import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { getSortedPostsData } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const dbPath = path.join(process.cwd(), 'src', 'data', 'database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const baseUrl = 'https://settleradar.com';

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Add individual country pages
  const validCountries = db.countries.filter((c: any) => Object.keys(c.indicators || {}).length > 10 && c.is_territory !== true);
  validCountries.forEach((c: any) => {
    routes.push({
      url: `${baseUrl}/country/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // Add top comparisons (example combinations, sorted alphabetically to match canonical)
  const topCountries = ['poland', 'czechia', 'spain', 'portugal', 'united-states', 'united-kingdom', 'germany'];
  for (let i = 0; i < topCountries.length; i++) {
    for (let j = i + 1; j < topCountries.length; j++) {
      const c1 = topCountries[i];
      const c2 = topCountries[j];
      const [slug1, slug2] = [c1, c2].sort();
      routes.push({
        url: `${baseUrl}/compare/${slug1}/${slug2}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  // Add blog listing page
  routes.push({
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  });

  // Add individual blog posts
  const posts = getSortedPostsData();
  posts.forEach(post => {
    routes.push({
      url: `${baseUrl}/blog/${post.slug}`,
      // Use the post date if available, otherwise fallback to current date
      lastModified: new Date(post.date || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  return routes;
}
