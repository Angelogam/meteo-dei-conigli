import { useState, useEffect, useCallback, useRef } from "react";
import { LaunchForecast } from "@/types/weather";
import { LaunchSite, launchSites } from "@/data/launchSites";
import { fetchSiteWeather } from "@/services/openMeteo";

interface UseWeatherDataReturn {
  forecasts: Map<string, LaunchForecast>;
  selectedSite: LaunchSite | null;
  setSelectedSite: (site: LaunchSite | null) => void;
  selectedForecast: LaunchForecast | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
  allForecasts: LaunchForecast[];
}

export function useWeatherData(): UseWeatherDataReturn {
  const [forecasts, setForecasts] = useState<Map<string, LaunchForecast>>(new Map());
  const [selectedSite, setSelectedSite] = useState<LaunchSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const allForecasts = Array.from(forecasts.values());

  const fetchAll = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // Batch fetch in groups of 5 to avoid rate limiting
      const batchSize = 5;
      const results = new Map<string, LaunchForecast>();

      for (let i = 0; i < launchSites.length; i += batchSize) {
        if (controller.signal.aborted) break;

        const batch = launchSites.slice(i, i + batchSize);
        const batchPromises = batch.map((site) =>
          fetchSiteWeather(site).catch((err) => {
            console.warn(`Failed to fetch ${site.name}:`, err);
            return null;
          })
        );

        const batchResults = await Promise.all(batchPromises);
        for (const result of batchResults) {
          if (result) {
            results.set(result.siteId, result);
          }
        }
      }

      if (!controller.signal.aborted) {
        setForecasts(results);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Errore nel caricamento dei dati");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAll();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchAll]);

  // Auto-refresh every 3 hours
  useEffect(() => {
    const interval = setInterval(fetchAll, 3 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const selectedForecast = selectedSite ? forecasts.get(selectedSite.id) ?? null : null;

  return {
    forecasts,
    selectedSite,
    setSelectedSite,
    selectedForecast,
    loading,
    error,
    lastUpdated,
    refresh: fetchAll,
    allForecasts,
  };
}
