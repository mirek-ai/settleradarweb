import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;
  const hasPrev = prevPage >= 1;
  const hasNext = nextPage <= totalPages;

  return (
    <div className="flex items-center justify-between mt-12 mb-8 border-t border-black/10 dark:border-white/10 pt-8">
      <div>
        {hasPrev ? (
          <Link
            href={prevPage === 1 ? basePath : `${basePath}/page/${prevPage}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-semibold text-slate-700 dark:text-slate-300"
            rel="prev"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/5 dark:border-white/5 opacity-50 cursor-not-allowed font-semibold text-slate-500">
            <ArrowLeft className="w-4 h-4" /> Previous
          </span>
        )}
      </div>
      
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Page {currentPage} of {totalPages}
      </div>

      <div>
        {hasNext ? (
          <Link
            href={`${basePath}/page/${nextPage}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-semibold text-slate-700 dark:text-slate-300"
            rel="next"
          >
            Next <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/5 dark:border-white/5 opacity-50 cursor-not-allowed font-semibold text-slate-500">
            Next <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  );
}
