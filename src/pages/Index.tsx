import { useState, useMemo } from "react";
import { useWeatherData } from "@/hooks/useWeatherData";
import { Header } from "@/components/Header";
import { SiteCard } from "@/components/SiteCard";
import { DayTabs } from "@/components/DayTabs";
import { launchSites } from "@/data/launchSites";
import { Search, Loader2, AlertCircle, Compass } from "lucide-react";

export default function Index() {
  const {
    allForecasts,
    selectedSite,
    setSelectedSite,
    selectedForecast,
    loading,
    error,
  } = useWeatherData();

  const [searchQuery, setSearchQuery] = useState("");

  const sortedForecasts = useMemo(() => {
    const list = [...allForecasts].sort((a, b) => b.overallScore - a.overallScore);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((f) => f.siteName.toLowerCase().includes(q));
  }, [allForecasts, searchQuery]);

  const migliori = allForecasts.filter((f) => f.overallScore >= 4).length;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <Header siteCount={allForecasts.length} />

        {/* Stats bar */}
        {!loading && allForecasts.length > 0 && (
          <div className="flex items-center gap-4 mb-6 text-sm text-white/40 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-1.5">
              <Compass size={14} className="text-[#00FF8C]" />
              <span><strong className="text-white/70">{allForecasts.length}</strong> decolli monitorati</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#00FF8C]" />
              <span><strong className="text-white/70">{migliori}</strong> con punteggio ≥ 4.0</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span>3 giorni di previsioni</span>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={16} className="text-white/30" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca un decollo..."
            className="w-full py-3.5 pl-11 pr-4 rounded-2xl bg-[#181818] border border-[#252525] text-sm text-white/80 placeholder:text-white/25 outline-none transition-all focus:border-[#00FF8C]/30 focus:bg-[#1A1A1A]"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-[#FF4E4E]/10 border border-[#FF4E4E]/20 text-sm text-[#FF4E4E] animate-fade-in">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && allForecasts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
            <Loader2 size={32} className="text-[#00FF8C] animate-spin" />
            <p className="text-sm text-white/40">Caricamento dati meteo...</p>
          </div>
        )}

        {/* Site cards */}
        {!loading && sortedForecasts.length > 0 && (
          <div className="space-y-3">
            {sortedForecasts.map((f, i) => (
              <SiteCard
                key={f.siteId}
                forecast={f}
                isActive={f.siteId === selectedSite?.id}
                onClick={() => {
                  const site = launchSites.find((s) => s.id === f.siteId);
                  if (site) {
                    setSelectedSite(site);
                  }
                }}
                index={i}
              />
            ))}
          </div>
        )}

        {/* Dettaglio decollo selezionato */}
        {selectedForecast && selectedSite && (
          <div className="mt-6 animate-scale-in">
            <DayTabs days={selectedForecast.days} />
          </div>
        )}

        {/* Empty state */}
        {!loading && searchQuery && sortedForecasts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center">
              <Search size={24} className="text-white/20" />
            </div>
            <p className="text-base text-white/60 font-medium">Nessun decollo trovato</p>
            <p className="text-sm text-white/30">Prova a modificare la ricerca</p>
          </div>
        )}

        {/* Footer */}
        {!loading && allForecasts.length > 0 && (
          <div className="mt-10 pt-4 border-t border-[#252525] text-center animate-fade-in" style={{ animationDelay: "500ms" }}>
            <p className="text-xs text-white/25">
              Dati forniti da Open-Meteo · Aggiornamento ogni 3 ore
            </p>
          </div>
        )}
      </div>
    </div>
  );
}