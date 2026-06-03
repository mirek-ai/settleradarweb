import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  coverImage: string;
  excerpt: string;
  country?: string;
}

export function getSortedPostsData(): PostMetadata[] {
  if (!fs.existsSync(postsDirectory)) return [];
  
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      const matterResult = matter(fileContents);
      
      return {
        slug,
        title: matterResult.data.title || slug,
        date: matterResult.data.date || '2026-01-01',
        coverImage: matterResult.data.coverImage || '',
        excerpt: matterResult.data.excerpt || '',
        country: matterResult.data.country || null,
        ...matterResult.data
      } as PostMetadata;
  });
  
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);
  
  return {
    slug,
    content: matterResult.content,
    title: matterResult.data.title || slug,
    date: matterResult.data.date || '2026-01-01',
    coverImage: matterResult.data.coverImage || '',
    excerpt: matterResult.data.excerpt || '',
    country: matterResult.data.country || null,
  };
}
