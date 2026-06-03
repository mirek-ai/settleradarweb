import Link from 'next/link';
import Image from 'next/image';
import { getSortedPostsData } from '@/lib/posts';

export const metadata = {
  title: 'Blog | SettleRadar',
  description: 'Expat guides, tax comparisons, and moving abroad tips.',
};

export default function BlogIndex() {
  const posts = getSortedPostsData();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-4xl font-bold mb-8 text-foreground">SettleRadar Blog</h1>
      <p className="text-lg mb-12 text-foreground/70">
        Guides, tips, and insights for your next relocation.
      </p>

      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="glass-card rounded-2xl overflow-hidden block">
              {post.coverImage && (
                <div className="relative w-full h-48">
                  <Image 
                    src={post.coverImage} 
                    alt={post.title} 
                    fill 
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <p className="text-sm text-primary font-semibold mb-2">{post.date}</p>
                <h2 className="text-xl font-bold mb-3 text-foreground line-clamp-2">{post.title}</h2>
                <p className="text-foreground/70 line-clamp-3 text-sm">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
