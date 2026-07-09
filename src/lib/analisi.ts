"use client";

export type AnalisiVolo = {
  punteggio: number;
  giudizio: "Ottimo" | "Buono" | "Medio" | "Difficile" | "Sconsigliato";
  iconePunteggio: string;
  panoramica: string;
  termica: string;
  vento: string;
  pioggiaVisibilita: string;
  consiglio: string;
};

const weatherIcons: Record<number, { icon: string; label: string }> = {
  0: { icon: "☀️", label: "Sereno" },
  1: { icon: "🌤️", label: "Poco nuvoloso" },
  2: { icon: "⛅", label: "Parz. nuvoloso" },
  3: { icon: "☁️", label: "Coperto" },
  45: { icon: "🌫️", label: "Nebbia" },
  48: { icon: "🌫️", label: "Nebbia" },
  51: { icon: "🌦️", label: "Pioggia leggera" },
  53: { icon: "🌦️", label: "Pioggia mod." },
  55: { icon: "🌧️", label: "Pioggia" },
  61: { icon: "🌦️", label: "Pioggia leggera" },
  63: { icon: "🌧️", label: "Pioggia mod." },
  65: { icon: "🌧️", label: "Pioggia forte" },
  80: { icon: "🌦️", label: "Rovesci" },
  81: { icon: "🌧️", label: "Rovesci mod." },
  82: { icon: "🌧️", label: "Rovesci forti" },
  95: { icon: "⛈️", label: "Temporale" },
  96: { icon: "⛈️", label: "Temporale" },
  99: { icon: "⛈️", label: "Temporale forte" },
};

export function getWeatherIcon(code: number, isDay: number): string {
  if (code === 0) return isDay ? "☀️" : "🌙";
  return weatherIcons[code]?.icon ?? (isDay ? "☀️" : "🌙");
}

function giudizioDaPunteggio(score: number): AnalisiVolo["giudizio"] {
  if (score >= 8) return "Ottimo";
  if (score >= 6) return "Buono";
  if (score >= 4) return "Medio";
  if (score >= 2) return "Difficile";
  return "Sconsigliato";
}

export function analisiDaDatiMeteo(
  oreGiornata: Array<{
    temp: number;
    cloud: number;
    hum: number;
    prec: number;
    vis: number;
    wind: number;
    gust: number;
    wdir: number;
    w80: number | null;
    w120: number | null;
    time: Date;
    wcode: number;
    isDay: number;
  }>,
  nomeSito: string,
  esposizione: string,
  difficolta: number
): AnalisiVolo | null {
  if (!oreGiornata || oreGiornata.length === 0) return null;

  const temps = oreGiornata.map(h => h.temp).filter(t => t != null);
  if (temps.length === 0) return null;

  // Calcoli reali
  const tempMedia = temps.reduce((a, b) => a + b, 0) / temps.length;
  const delta = Math.round(Math.max(...temps) - Math.min(...temps));
  const cloudMedia = oreGiornata.reduce((s, h) => s + h.cloud, 0) / oreGiornata.length;
  const umiditaMedia = oreGiornata.reduce((s, h) => s + h.hum, 0) / oreGiornata.length;
  const pioggiaTotale = oreGiornata.reduce((s, h) => s + h.prec, 0);
  const orePioggia = oreGiornata.filter(h => h.prec > 0.3).length;

  // Vento nelle ore di volo (9-19)
  const ventiVolo = oreGiornata
    .filter(h => h.time.getHours() >= 9 && h.time.getHours() <= 19)
    .map(h => h.wind);
  const ventoMedio = ventiVolo.length > 0
    ? ventiVolo.reduce((a, b) => a + b, 0) / ventiVolo.length
    : oreGiornata.reduce((s, h) => s + h.wind, 0) / oreGiornata.length;
  const ventoMax = Math.max(...oreGiornata.map(h => h.wind));
  const rafficheMax = Math.max(...oreGiornata.map(h => h.gust));
  const visMedia = oreGiornata.reduce((s, h) => s + h.vis, 0) / oreGiornata.length;

  // Punteggio basato su dati reali
  let score = 5;
  if (tempMedia > 18 && tempMedia < 30) score += 1.5;
  if (delta > 8) score += 1;
  if (cloudMedia >= 15 && cloudMedia <= 45) score += 1;
  if (ventoMedio >= 8 && ventoMedio <= 18) score += 1.5;
  if (ventoMax > 25) score -= 2;
  if (rafficheMax > 30) score -= 1.5;
  if (pioggiaTotale > 1) score -= 3;
  if (orePioggia > 2) score -= 1;
  if (visMedia < 10) score -= 1;
  if (umiditaMedia > 80) score -= 0.5;
  score = Math.max(0, Math.min(10, score));

  const giudizio = giudizioDaPunteggio(score);
  const iconePunteggio = score >= 7 ? "🟢" : score >= 4 ? "🟡" : "🔴";

  // Panoramica
  const cielo = cloudMedia < 25 ? "sereno" : cloudMedia < 50 ? "variabile" : cloudMedia < 75 ? "nuvoloso" : "molto nuvoloso";
  const ventoDesc = ventoMax > 25 ? `⚠️ Vento forte ${Math.round(ventoMax)} km/h` : ventoMax > 15 ? `💨 Vento ${Math.round(ventoMax)} km/h` : `💨 Vento debole ${Math.round(ventoMax)} km/h`;
  const pioggiaText = orePioggia > 0 ? ` 🌧️ ${pioggiaTotale.toFixed(1)}mm (${orePioggia}h)` : " ✅ Nessuna pioggia";

  const panoramica = `📍 ${nomeSito} (${esposizione})\n☁️ Cielo: ${cielo} (${Math.round(cloudMedia)}% copertura)\n🌡️ Temp media: ${Math.round(tempMedia)}°C (Δ${delta}°C)\n${ventoDesc}${pioggiaText}`;

  // Termica
  const termicaText =
    tempMedia > 20 && cloudMedia >= 15 && cloudMedia <= 50
      ? "🔥 Termica ATTIVA prevista — ottima per voli termici"
      : tempMedia > 15
      ? "🔥 Termica MODERATA — condizioni mediamente sfruttabili"
      : "❄️ Termica DEBOLE — meglio cercare vento dinamico in pendio";
  const termica = `${termicaText}\n📊 → Range orario 11:00-16:00\n📈 Plafond stimato ~${Math.round(1500 + delta * 80)}m`;

  // Vento
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const wdirMedio = oreGiornata.reduce((s, h) => s + h.wdir, 0) / oreGiornata.length;
  const dirPrincipale = dirs[Math.round(wdirMedio / 45) % 8];
  const vento = `💨 Vento medio: ${Math.round(ventoMedio)} km/h\n💨 Raffiche max: ${Math.round(rafficheMax)} km/h\n🧭 Direzione: ${dirPrincipale}\n📍 Esposizione decollo: ${esposizione}`;

  // Pioggia e visibilità
  const visDesc = visMedia > 30 ? "Ottima" : visMedia > 15 ? "Buona" : visMedia > 8 ? "Discreta" : "Ridotta";
  const pioggiaVis = `🌧️ Pioggia: ${pioggiaTotale.toFixed(1)}mm totali${orePioggia > 0 ? ` (${orePioggia}h con precipitazioni)` : ""}\n👁️ Visibilità: ${visDesc} (${Math.round(visMedia)} km)`;

  // Consiglio
  let consiglio = "";
  if (score >= 8) consiglio = "✅ Condizioni ideali per il volo libero. Termica ben sviluppata, vento nei range ottimali. Decolla con tranquillità!";
  else if (score >= 6) consiglio = "👍 Buone condizioni. Verifica vento in loco prima di decollare, ma le prospettive sono positive.";
  else if (score >= 4) consiglio = "⚠️ Condizioni mediocri. Valuta attentamente vento e nuvolosità prima di decidere. Meglio se sei un pilota esperto.";
  else if (score >= 2) consiglio = "🔴 Condizioni difficili. Vento forte o pioggia. Volo sconsigliato ai piloti meno esperti.";
  else consiglio = "⛔ Condizioni pericolose. Volo fortemente sconsigliato.";

  if (pioggiaTotale > 1) consiglio += " 🌧️ Pioggia prevista, attendere schiarite.";
  if (ventoMedio < 5) consiglio += " 💨 Vento debole, meglio attendere brezza più sostenuta per decolli dinamici.";
  if (difficolta >= 4 && score < 5) consiglio += " 🏔️ Decollo difficile, richiede esperienza e condizioni buone.";

  return {
    punteggio: Math.round(score * 10) / 10,
    giudizio,
    iconePunteggio,
    panoramica,
    termica,
    vento,
    pioggiaVisibilita: pioggiaVis,
    consiglio,
  };
}