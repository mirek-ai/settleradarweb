import { getPostData, getSortedPostsData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const postData = getPostData(params.slug);
  if (!postData) return { title: 'Post Not Found' };
  
  return {
    title: `${postData.title} | SettleRadar`,
    description: postData.excerpt,
  };
}

export default async function BlogPost(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const postData = getPostData(params.slug);
  
  if (!postData) {
    notFound();
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: postData.title,
    image: postData.coverImage ? `https://settleradar.com${postData.coverImage}` : undefined,
    datePublished: postData.date,
    author: {
      '@type': 'Person',
      name: (postData as any).author || 'SettleRadar',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://settleradar.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://settleradar.com/blog' },
      { '@type': 'ListItem', position: 3, name: postData.title, item: `https://settleradar.com/blog/${postData.slug}` }
    ]
  };

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Link href="/blog" className="inline-flex items-center text-primary hover:underline mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
      </Link>
      
      {postData.coverImage && (
        <div className="relative w-full h-[400px] mb-10 rounded-2xl overflow-hidden glass-border">
          <Image 
            src={postData.coverImage} 
            alt={postData.title} 
            fill 
            className="object-cover"
            priority
          />
        </div>
      )}
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground leading-tight">
        {postData.title}
      </h1>
      <p className="text-primary font-semibold mb-10">{formatDate(postData.date)}</p>
      
      <div className="prose prose-lg dark:prose-invert prose-blue max-w-none prose-table:w-full prose-table:text-left prose-th:bg-foreground/5 prose-th:p-4 prose-td:p-4 prose-tr:border-b prose-tr:border-foreground/10">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw]}
        >
          {postData.content
            .replace(/^#\s+.*$/m, '') // Remove the duplicated H1 title from markdown
            .replace(/\[\^(\d+)\](?!:)/g, '<sup><a href="#ref-$1" class="text-primary no-underline hover:underline">[$1]</a></sup>')
            .replace(/\[\^(\d+)\]:/g, '<br/><a id="ref-$1"></a>**[$1]** ')
            .replace(/^(\d+)\.\s+(?=\[)/gm, '$1. <a id="ref-$1" class="scroll-mt-24"></a>')
          }
        </ReactMarkdown>
      </div>

      {postData.country && (() => {
        const cName = postData.country.charAt(0).toUpperCase() + postData.country.slice(1);
        const cSlug = postData.country.toLowerCase().replace(/\s+/g, '-');
        return (
        <div className="mt-16 glass-panel rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 text-center shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 opacity-5 pointer-events-none">
             <MapPin className="w-64 h-64 text-blue-500" />
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
              Want to see how {cName} stacks up?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Are you seriously considering a move? Use our interactive tools to explore {cName}'s climate, tax brackets, and nomad visas, or compare it directly against your home country.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href={`/country/${cSlug}`}
                className="inline-flex w-full sm:w-auto justify-center items-center px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                View {cName} Profile
              </Link>
              <Link 
                href={`/compare?country=${cSlug}`}
                className="inline-flex w-full sm:w-auto justify-center items-center px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Compare {cName}
                <ArrowRight className="w-5 h-5 ml-2 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
        );
      })()}
    </article>
  );
}
