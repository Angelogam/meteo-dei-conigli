import { useState, useMemo } from "react";
import { useWeatherData } from "@/hooks/useWeatherData";
import { DashboardHeader } from "./DashboardHeader";
import { LaunchCardDashboard } from "./LaunchCardDashboard";
import { DetailDashboard } from "./DetailDashboard";
import { LoadingSkeletonDashboard } from "./LoadingSkeletonDashboard";
import { EmptyStateDashboard } from "./EmptyStateDashboard";
import { SearchBar } from "../SearchBar";
import { launchSites } from "@/data/launchSites";
import { LaunchForecast } from "@/types/weather";
import { getQualityColor, getQualityLabel } from "@/utils/weatherCalculations";
import { Sun, Cloud, Wind, TrendingUp, Info } from "lucide-react";
import { useInViewAnimation } from "@/hooks/useAnimationOnMount";

function StatsBar({ forecasts }: { forecasts: LaunchForecast[] }) {
  const { ref, inView } = useInViewAnimation(0.1);

  if (!forecasts.length) return null;

  const best = forecasts.reduce((a, b) => a.overallScore > b.overallScore ? a : b);
  const avgScore = forecasts.reduce((s, f) => s + f.overallScore, 0) / forecasts.length;
  const goodCount = forecasts.filter(f => f.overallScore >= 3.5).length;

  return (
    <div ref={ref} className={`grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 transition-all duration-700 ${inView ? "opacity-100" : "opacity-0 translate-y-4"}`}>
      <StatCard
        icon={<Sun size={14} />}
        label="Miglior decollo"
        value={best.siteName}
        sub={`${best.overallScore}/5 · ${getQualityLabel(best.overallScore)}`}
        color={getQualityColor(best.overallScore)}
      />
      <StatCard
        icon={<TrendingUp size={14} />}
        label="Media generale"
        value={avgScore.toFixed(1)}
        sub={`su ${forecasts.length} decolli`}
        color="#4DA3FF"
      />
      <StatCard
        icon={<Wind size={14} />}
        label="Condizioni buone"
        value={`${goodCount}/${forecasts.length}`}
        sub={`${Math.round((goodCount / forecasts.length) * 100)}% dei decolli`}
        color="#00FF8C"
      />
      <StatCard
<dyad-write path="src/components/dashboard/DashboardLayout.tsx" description="Aggiornamento del file DashboardLayout completo">
      <StatCard
        icon={<Info size={14} />}
        label="Aggiornamento"
        value="3 ore"
        sub="Dati Open-Meteo LIVE"
        color="#FFC857"
      />
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.04] bg-[#121212] p-3 transition-all duration-300 hover:border-white/[0.08]">
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-bold text-white/90 truncate">{value}</div>
      <div className="text-[10px] text-white/35 mt-0.5">{sub}</div>
    </div>
  );
}

export function DashboardLayout() {
  const {
    allForecasts,
    selectedSite,
    setSelectedSite,
    selectedForecast,
    loading,
    error,
    lastUpdated,
    refresh,
  } = useWeatherData();

  const [searchQuery, setSearchQuery] = useState("");

  // Sort by overall quality score
  const sortedForecasts = useMemo(() => {
    const list = [...allForecasts].sort((a, b) => b.overallScore - a.overallScore);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((f) => f.siteName.toLowerCase().includes(q));
  }, [allForecasts, searchQuery]);

  // Detail view
  if (selectedForecast) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white">
        <DashboardHeader
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          loading={loading}
          sitesCount={allForecasts.length}
        />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <DetailDashboard
            forecast={selectedForecast}
            onBack={() => setSelectedSite(null)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <DashboardHeader
        lastUpdated={lastUpdated}
        onRefresh={refresh}
        loading={loading}
        sitesCount={allForecasts.length}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero headline + search */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">
            Dashboard Meteo Volo Libero
          </h2>
          <p className="text-sm text-white/50 mt-1">
            {loading
              ? "Caricamento dati meteo in corso..."
              : `${allForecasts.length} decolli monitorati · Previsioni 3 giorni · Open-Meteo LIVE`
            }
          </p>
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Statistiche rapide */}
        {!loading && allForecasts.length > 0 && <StatsBar forecasts={allForecasts} />}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-[#FF4E4E]/20 bg-[#FF4E4E]/8 p-4 mb-4">
            <p className="text-sm text-[#FF4E4E]/90">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && allForecasts.length === 0 && <LoadingSkeletonDashboard />}

        {/* Lista decolli */}
        {!loading && sortedForecasts.length > 0 && (
          <div className="space-y-2">
            {sortedForecasts.map((f, idx) => (
              <LaunchCardDashboard
                key={f.siteId}
                forecast={f}
                onSelect={() => {
                  const site = launchSites.find((s) => s.id === f.siteId);
                  if (site) setSelectedSite(site);
                }}
                index={idx}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && searchQuery && sortedForecasts.length === 0 && (
          <EmptyStateDashboard searchQuery={searchQuery} />
        )}

        {!loading && allForecasts.length === 0 && !searchQuery && (
          <EmptyStateDashboard />
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-white/[0.04] text-center">
          <p className="text-xs text-white/30">
            Dati Open-Meteo · Aggiornamento ogni 3 ore · {lastUpdated?.toLocaleTimeString() ?? "--"}
          </p>
        </div>
      </main>
    </div>
  );
}