import { Navigation } from "lucide-react";

interface HeaderProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
  loading: boolean;
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "ora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min fa`;
  return `${Math.floor(diff / 3600)}h fa`;
}

export function Header({ lastUpdated, onRefresh, loading }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0D0D0D]/80 border-b border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00FF8C]/10 border border-[#00FF8C]/20 flex items-center justify-center">
            <Navigation size={16} color="#00FF8C" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              Thermik<span className="text-[#00FF8C]">Vision</span>
            </h1>
            <p className="text-[11px] text-white/50 uppercase tracking-widest">
              Free Flight Meteo
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-white/50 hidden sm:block">
              {timeAgo(lastUpdated)}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`
              text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-300
              ${loading
                ? "border-white/[0.04] text-white/20 cursor-not-allowed"
                : "border-white/[0.08] text-white/60 hover:border-[#00FF8C]/30 hover:text-[#00FF8C] hover:bg-[#00FF8C]/5"
              }
            `}
          >
            {loading ? "Caricamento..." : "Aggiorna"}
          </button>
        </div>
      </div>
    </header>
  );
}
