import { useState, useEffect, useMemo } from "react";
import { launchSites } from "@/data/launchSites";
import { fetchForecast } from "@/utils/api";
import type { HourlyData, DailyData } from "@/utils/api";

export interface DayForecast {
  date: string;
  hours: HourlyData[];
  daily: DailyData;
}

export interface SiteForecast {
  siteId: string;
  siteName: string;
  elevation: number;
  valley: string;
  overallScore: number;
  rating: string;
  color: string;
  days: DayForecast[];
}

export function useWeatherData() {
  const [allForecasts, setAllForecasts] = useState<SiteForecast[]>([]);
  const [selectedSite, setSelectedSite] = useState(launchSites[0] || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let dead = false;
    setLoading(true);
    setError(null);

    (async () => {
      const results: SiteForecast[] = [];

      for (const site of launchSites) {
        if (dead) break;
        try {
          const raw = await fetchForecast(site.lat, site.lon);

          const dailyForecasts: DailyData[] = raw.daily;
          const days: DayForecast[] = dailyForecasts.map((d) => {
            const hours = raw.hourly.filter((h) => h.time.startsWith(d.date));
            return { date: d.date, hours, daily: d };
          });

          // Calcola punteggio complessivo
          const todayHours = days[0]?.hours || [];
          const peak = todayHours.filter((h) => {
            const hr = parseInt(h.time.slice(11, 13), 10);
            return hr >= 10 && hr <= 16;
          });
          let score = 0;
          if (peak.length > 0) {
            const avgWind = peak.reduce((s, h) => s + h.windSpeed10m, 0) / peak.length;
            const avgCloud = peak.reduce((s, h) => s + h.cloudCover, 0) / peak.length;
            score = 50;
            if (avgWind >= 8 && avgWind <= 20) score += 25;
            else if (avgWind < 5) score -= 15;
            else if (avgWind > 25) score -= 30;
            if (avgCloud < 30) score += 15;
            else if (avgCloud > 70) score -= 15;
            score = Math.max(0, Math.min(100, score));
          }

          const normalizedScore = score / 25; // 0-4 scale
          let rating = "Sconsigliato";
          let color = "#FF4E4E";
          if (normalizedScore >= 3.6) { rating = "Eccellente"; color = "#00FF8C"; }
          else if (normalizedScore >= 2.8) { rating = "Buono"; color = "#4DA3FF"; }
          else if (normalizedScore >= 2.0) { rating = "Discreto"; color = "#FFC857"; }
          else if (normalizedScore >= 1.2) { rating = "Difficile"; color = "#FF9F1C"; }

          results.push({
            siteId: site.id,
            siteName: site.name,
            elevation: site.elevation,
            valley: site.valley,
            overallScore: normalizedScore,
            rating,
            color,
            days,
          });
        } catch (e) {
          console.error(`Errore per ${site.name}:`, e);
        }
        if (!dead) await new Promise((r) => setTimeout(r, 50));
      }

      if (!dead) {
        setAllForecasts(results);
        setLoading(false);
        if (results.length === 0) {
          setError("Impossibile caricare i dati meteo. Riprova più tardi.");
        }
      }
    })();

    return () => {
      dead = true;
    };
  }, []);

  const selectedForecast = useMemo(() => {
    return allForecasts.find((f) => f.siteId === selectedSite?.id) || null;
  }, [allForecasts, selectedSite]);

  return {
    allForecasts,
    selectedSite,
    setSelectedSite,
    selectedForecast,
    loading,
    error,
  };
}