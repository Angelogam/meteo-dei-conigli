export function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-8 md:mb-12">
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] loading-shimmer" />
        <div className="space-y-2">
          <div className="w-40 h-6 rounded-lg bg-white/[0.04] loading-shimmer" />
          <div className="w-52 h-3 rounded-md bg-white/[0.03] loading-shimmer" />
        </div>
      </div>

      {/* Card skeletons */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/[0.06] bg-[#141414] p-6 mb-4"
          style={{ animationDelay: `${i * 150}ms` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] loading-shimmer" />
            <div className="flex-1 space-y-2">
              <div className="w-48 h-5 rounded-lg bg-white/[0.04] loading-shimmer" />
              <div className="w-64 h-3 rounded-md bg-white/[0.03] loading-shimmer" />
              <div className="w-36 h-3 rounded-md bg-white/[0.03] loading-shimmer" />
            </div>
            <div className="hidden sm:block w-40 h-10 rounded-lg bg-white/[0.04] loading-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}