import { getPostData, getSortedPostsData } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import GithubSlugger from 'github-slugger';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MapPin, List } from 'lucide-react';
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

  // Generate Table of Contents
  const slugger = new GithubSlugger();
  const headings: { level: number; text: string; id: string }[] = [];
  const regex = /^(##|###)\s+(.*)$/gm;
  let match;
  while ((match = regex.exec(postData.content)) !== null) {
    const text = match[2].replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_~`]/g, '').trim();
    headings.push({
      level: match[1].length,
      text: text,
      id: slugger.slug(text)
    });
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
    <div className="flex flex-col lg:flex-row gap-8 pb-24 relative max-w-[1400px] mx-auto pt-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ═══════ STICKY SIDEBAR ═══════ */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 glass-panel rounded-2xl p-4 shadow-xl border border-white/10 dark:border-white/5 space-y-1">
          <Link href="/blog" className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors mb-4 border-b border-black/5 dark:border-white/5">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          {headings.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Table of Contents</div>
              {headings.map((heading, idx) => (
                <a 
                  key={idx} 
                  href={`#${heading.id}`} 
                  className={`flex items-start gap-3 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${heading.level === 3 ? 'pl-8 pr-4 text-slate-500 dark:text-slate-400' : 'px-4 text-slate-700 dark:text-slate-300'}`}
                >
                  {heading.level === 2 && <List className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />}
                  <span className="leading-tight">{heading.text}</span>
                </a>
              ))}
            </>
          )}
        </div>
      </aside>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main className="flex-1 min-w-0 max-w-3xl">
        <article>
          <div className="lg:hidden mb-8">
            <Link href="/blog" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
            </Link>
          </div>
          
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
          <div className="flex items-center gap-4 mb-10">
            <p className="text-primary font-semibold m-0">{formatDate(postData.date)}</p>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Reading: "${postData.title}"\n\n`)}&url=${encodeURIComponent(`https://settleradar.com/blog/${postData.slug}`)}&via=settleradar`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-800 dark:hover:bg-slate-600 px-3 py-1.5 rounded-full"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3 h-3 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              Share
            </a>
          </div>
          
          <div className="prose prose-lg dark:prose-invert prose-blue max-w-none prose-table:w-full prose-table:text-left prose-th:bg-foreground/5 prose-th:p-4 prose-td:p-4 prose-tr:border-b prose-tr:border-foreground/10">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw, rehypeSlug]}
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
                    href={`/compare/${cSlug}/poland`}
                    className="inline-flex w-full sm:w-auto justify-center items-center px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    Compare {cName} to Poland
                    <ArrowRight className="w-5 h-5 ml-2 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
            );
          })()}
        </article>
      </main>
    </div>
  );
}
