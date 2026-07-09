import type { HourlyData } from "./api";
import type { LaunchSite } from "@/data/launchSites";
import { getThermalIndex, getWindDirection } from "./meteo";

export function generateAIAnalysis(
  dayData: HourlyData[],
  site: LaunchSite,
  thermalDelta: number
): { general: string; thermal: string; wind: string; advice: string } | null {
  if (!dayData || dayData.length === 0) return null;

  const temps = dayData.map(h => h.temperature).filter(t => t !== undefined);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const avgCloud = dayData.reduce((sum, h) => sum + h.cloudCover, 0) / dayData.length;
  const avgHumidity = dayData.reduce((sum, h) => sum + h.humidity, 0) / dayData.length;
  const maxWind = Math.max(...dayData.map(h => h.windSpeed));
  const maxGust = Math.max(...dayData.map(h => h.windGust));
  const hasRain = dayData.some(h => h.precipitation > 0.5);
  const totalRain = dayData.reduce((sum, h) => sum + h.precipitation, 0);
  const dewPoint = dayData.reduce((sum, h) => sum + h.dewPoint, 0) / dayData.length;
  const avgWindDir = dayData.reduce((s, h) => s + h.windDir, 0) / dayData.length;
  const avgWindSpeed = dayData.filter(h => h.time.getHours() >= 9 && h.time.getHours() <= 19).reduce((s, h) => s + h.windSpeed, 0) / Math.max(1, dayData.filter(h => h.time.getHours() >= 9 && h.time.getHours() <= 19).length);

  const thermalIdx = getThermalIndex(avgTemp, avgCloud, avgHumidity, thermalDelta);
  const cloudBase = Math.round((avgTemp - dewPoint) * 120 + 1500);
  const thermalBase = Math.round(1500 + (thermalDelta * 80));

  return {
    general: `🌅 La giornata al decollo di ${site.name} si presenta ` +
      (avgCloud < 30 ? `con cielo prevalentemente sereno e temperature che varieranno tra ${Math.round(minTemp)}°C e ${Math.round(maxTemp)}°C, con una media di ${Math.round(avgTemp)}°C.` : 
       avgCloud < 60 ? `con cielo parzialmente nuvoloso e temperature tra ${Math.round(minTemp)}°C e ${Math.round(maxTemp)}°C.` :
       `con cielo nuvoloso e temperature fresche tra ${Math.round(minTemp)}°C e ${Math.round(maxTemp)}°C.`) +
      (maxWind > 25 ? ` 💨 Attenzione al vento che raggiungerà raffiche fino a ${Math.round(maxWind)} km/h.` :
       maxWind > 15 ? ` 💨 Vento moderato con raffiche fino a ${Math.round(maxWind)} km/h.` :
       ` 💨 Vento debole con raffiche fino a ${Math.round(maxWind)} km/h.`) +
      (hasRain ? ` 🌧️ Previste precipitazioni per ${Math.round(totalRain)} mm.` : ` ✅ Nessuna precipitazione.`) +
      (avgCloud < 60 && maxWind < 25 && !hasRain ? ` 🎯 Condizioni favorevoli per il volo!` : ` ⚠️ Valutare attentamente le condizioni.`),
    
    thermal: `🔥 **Attività termica:** ${thermalIdx.icon} ${thermalIdx.level}\n` +
      `📊 **Dati:** T media ${Math.round(avgTemp)}°C, Δ${thermalDelta}°C, nuvole ${Math.round(avgCloud)}%, umidità ${Math.round(avgHumidity)}%\n` +
      `📈 **Plafond stimato:** ~${thermalBase}m (base) / ${cloudBase}m (nuvole)`,
    
    wind: `💨 **Vento superficiale (10m):** media ${Math.round(avgWindSpeed)} km/h, max ${Math.round(maxWind)} km/h, raffiche ${Math.round(maxGust)} km/h\n` +
      `📍 Direzione: ${getWindDirection(avgWindDir)} - Esposizione sito: ${site.exposure}`,
    
    advice: (maxWind > 25 ? `⚠️ **VENTO FORTE** (>25 km/h): Volo sconsigliato.` :
             maxWind > 18 ? `⚠️ Vento sostenuto (18-25 km/h): Decollo impegnativo.` :
             maxWind < 5 ? `💨 Vento debole (<5 km/h): Attendere brezza.` :
             `✅ Vento ideale (5-18 km/h): Condizioni perfette.`) +
      (hasRain ? `\n🌧️ **Precipitazioni previste:** Volo sconsigliato.` : `\n✅ Assenza di pioggia.`) +
      (avgCloud > 80 ? `\n☁️ Cielo coperto: Visibilità ridotta.` : avgCloud < 30 ? `\n☀️ Cielo sereno: Ottima visibilità.` : ``),
  };
}