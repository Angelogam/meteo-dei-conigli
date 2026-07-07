import { useState, useMemo } from "react";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { LaunchCard } from "@/components/LaunchCard";
import { DetailView } from "@/components/DetailView";
import { useInViewAnimation } from "@/hooks/useAnimationOnMount";
import { launchSites } from "@/data/launchSites";
import { LaunchForecast } from "@/types/weather";
import { Navigation, Wind } from "lucide-react";

function LoadingSkeleton() {
  const { ref, inView } = useInViewAnimation(0.1);
  return (
    <div ref={ref} className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`
            rounded-xl border border-white/[0.04] bg-[#121212] p-4
            transition-all duration-500
            ${inView ? "opacity-100" : "opacity-0"}
          `}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-white/[0.04] animate-pulse hidden sm:block" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-white/[0.06] rounded animate-pulse" />
              <div className="h-2 w-48 bg-white/[0.04] rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-2 w-16 bg-white/[0.03] rounded animate-pulse" />
                <div className="h-2 w-16 bg-white/[0.03] rounded animate-pulse" />
                <div className="h-2 w-16 bg-white/[0.03] rounded animate-pulse" />
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/[0.04] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Wind size={36} className="text-white/20 mb-4" />
      <p className="text-base text-white/50">Nessun decollo trovato</p>
      <p className="text-sm text-white/30 mt-1">Prova a modificare la ricerca</p>
    </div>
  );
}

export default function Index() {
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

  // Find matching launch sites for sites without data yet
  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return launchSites.filter(
      (s) =>
        s.name.toLowerCase().includes(q) &&
        !allForecasts.find((f) => f.siteId === s.id)
    );
  }, [searchQuery, allForecasts]);

  // Pass through the index for staggered animation
  const indexedForecasts = sortedForecasts.map((f, idx) => ({ ...f, _index: idx }));

  // Detail view
  if (selectedForecast) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white">
        <Header lastUpdated={lastUpdated} onRefresh={refresh} loading={loading} />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <DetailView
            forecast={selectedForecast}
            onBack={() => setSelectedSite(null)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <Header lastUpdated={lastUpdated} onRefresh={refresh} loading={loading} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero headline */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">
            Previsioni Volo Libero
          </h2>
          <p className="text-sm text-white/50 mt-1">
            {loading
              ? "Caricamento dati meteo in corso..."
              : `${allForecasts.length} decolli · 3 giorni · Dati Open-Meteo LIVE`
            }
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Regions filter */}
        {!searchQuery && allForecasts.length > 0 && (
          <div className="flex gap-2 mb-4">
            <button
              className="text-xs px-3 py-1.5 rounded-full border border-[#00FF8C]/30 text-[#00FF8C]/80 bg-[#00FF8C]/8 font-medium"
            >
              Tutti ({allForecasts.length})
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-[#FF4E4E]/20 bg-[#FF4E4E]/8 p-4 mb-4">
            <p className="text-sm text-[#FF4E4E]/90">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && allForecasts.length === 0 && <LoadingSkeleton />}

        {/* Forecast list */}
        {!loading && sortedForecasts.length > 0 && (
          <div className="space-y-2">
            {indexedForecasts.map((f) => (
              <LaunchCard
                key={f.siteId}
                forecast={f}
                onSelect={() => {
                  const site = launchSites.find((s) => s.id === f.siteId);
                  if (site) setSelectedSite(site);
                }}
                index={f._index}
                visible={true}
              />
            ))}
          </div>
        )}

        {/* Unloaded sites matching search */}
        {filteredSites.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2 font-medium">
              In attesa di dati
            </p>
            <div className="space-y-1">
              {filteredSites.map((site) => (
                <div
                  key={site.id}
                  className="rounded-lg border border-white/[0.06] bg-[#121212] px-4 py-2.5 text-sm text-white/60"
                >
                  {site.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && searchQuery && sortedForecasts.length === 0 && filteredSites.length === 0 && (
          <EmptyState />
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
