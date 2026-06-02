export default function Loading() {
  return (
    <div className="space-y-12 pb-24 animate-pulse">
      {/* Skeleton Hero */}
      <section className="glass-panel rounded-3xl p-8 md:p-12 overflow-hidden border border-white/20 dark:border-white/10 shadow-2xl">
        <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl mb-8"></div>
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-32 h-24 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="flex-1">
            <div className="flex gap-2 mb-3">
              <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
              <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            </div>
            <div className="w-3/4 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4"></div>
            <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
        </div>
      </section>

      {/* Skeleton Quick Facts */}
      <section>
        <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl h-40 flex flex-col justify-between">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="w-1/2 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
              <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Skeleton Climate */}
      <section>
        <div className="w-64 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg mb-6"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="glass-panel p-4 rounded-2xl h-32 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="w-full h-8 bg-slate-200 dark:bg-slate-800 rounded mt-2"></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
