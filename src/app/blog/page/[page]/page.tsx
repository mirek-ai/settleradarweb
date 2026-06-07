import Link from 'next/link';
import Image from 'next/image';
import { getSortedPostsData } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import Pagination from '@/components/Pagination';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Blog | SettleRadar',
  description: 'Expat guides, tax comparisons, and moving abroad tips.',
};

const POSTS_PER_PAGE = 15;

export async function generateStaticParams() {
  const allPosts = getSortedPostsData();
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  
  // Return paths for page 2, 3, etc. Page 1 is handled by /blog/page.tsx
  const paths = [];
  for (let i = 2; i <= totalPages; i++) {
    paths.push({ page: i.toString() });
  }
  
  return paths;
}

export default async function PaginatedBlogIndex(props: { params: Promise<{ page: string }> }) {
  const params = await props.params;
  const currentPage = parseInt(params.page, 10);
  const allPosts = getSortedPostsData();
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  if (isNaN(currentPage) || currentPage < 1 || currentPage > totalPages) {
    notFound();
  }

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-4xl font-bold mb-8 text-foreground">SettleRadar Blog</h1>
      <p className="text-lg mb-12 text-foreground/70">
        Guides, tips, and insights for your next relocation.
      </p>

      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="glass-card rounded-2xl overflow-hidden block group">
                {post.coverImage && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image 
                      src={post.coverImage} 
                      alt={post.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  <p className="text-sm text-primary font-semibold mb-2">{formatDate(post.date)}</p>
                  <h2 className="text-xl font-bold mb-3 text-foreground line-clamp-3 group-hover:text-primary transition-colors">{post.title}</h2>
                  <p className="text-foreground/70 line-clamp-3 text-sm">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
          
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            basePath="/blog" 
          />
        </>
      )}
    </div>
  );
}
