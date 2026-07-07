import { Navigation, RefreshCw, Info } from "lucide-react";

interface DashboardHeaderProps {
  lastUpdated: Date | null;
  onRefresh: () => void;
  loading: boolean;
  sitesCount: number;
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "ora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min fa`;
  return `${Math.floor(diff / 3600)}h fa`;
}

export function DashboardHeader({ lastUpdated, onRefresh, loading, sitesCount }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header-inner">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="dashboard-logo">
            <Navigation size={18} className="text-[#00FF8C]" />
          </div>
          <div>
            <h1 className="dashboard-title">
              Meteo dei <span className="text-[#00FF8C]">Conigli</span>
            </h1>
            <p className="dashboard-subtitle">
              Previsioni Volo Libero · {sitesCount} decolli
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/40">
              <Info size={12} />
              <span>Aggiornato {timeAgo(lastUpdated)}</span>
            </div>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`dashboard-refresh-btn ${loading ? "opacity-40 cursor-not-allowed" : "hover:border-[#00FF8C]/30 hover:text-[#00FF8C] hover:bg-[#00FF8C]/5"}`}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{loading ? "Caricamento..." : "Aggiorna"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}