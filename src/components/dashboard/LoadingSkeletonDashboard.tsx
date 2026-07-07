import { useInViewAnimation } from "@/hooks/useAnimationOnMount";

export function LoadingSkeletonDashboard() {
  const { ref, inView } = useInViewAnimation(0.1);
  return (
    <div ref={ref} className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/[0.04] bg-[#121212] p-4 transition-all duration-500"
          style={{ opacity: inView ? 1 : 0, animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-white/[0.04] animate-pulse hidden sm:block" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-white/[0.06] rounded animate-pulse" />
              <div className="h-2 w-48 bg-white/[0.04] rounded animate-pulse" />
              <div className="flex gap-3">
                <div className="h-2 w-14 bg-white/[0.03] rounded animate-pulse" />
                <div className="h-2 w-14 bg-white/[0.03] rounded animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-white/[0.03] rounded-lg animate-pulse" />
                <div className="h-8 w-20 bg-white/[0.03] rounded-lg animate-pulse" />
                <div className="h-8 w-20 bg-white/[0.03] rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/[0.04] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}