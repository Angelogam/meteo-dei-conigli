"use client";

export type CondizioniVolo = {
  punteggio: number; // 0-10
  giudizio: "Ottimo" | "Buono" | "Medio" | "Difficile" | "Sconsigliato";
  icone: string;
  termica: string;
  ventoSuperficie: string;
  ventoQuota: string;
  visibilita: string;
  pioggia: string;
  consiglio: string;
};

export function analisiCompleta(
  dayData: any[],
  site: { name: string; exposure: string; difficulty: number }
): CondizioniVolo {
  // Estrai medie e massimi dai dati orari
  const temps = dayData.map((h: any) => h.temp).filter((t: any) => t != null);
  if (!temps.length) {
    return {
      punteggio: 0,
      giudizio: "Sconsigliato",
      icone: "❌",
      termica: "Dati insufficienti",
      ventoSuperficie: "—",
      ventoQuota: "—",
      visibilita: "—",
      pioggia: "—",
      consiglio: "Dati meteo non disponibili per questo giorno.",
    };
  }

  const tempMedia = temps.reduce((a: number, b: number) => a + b, 0) / temps.length;
  const delta = Math.round(Math.max(...temps) - Math.min(...temps));

  // Nuvole
  const cloudMedia = dayData.reduce((s: number, h: any) => s + h.cloud, 0) / dayData.length;
  const cloudDesc = cloudMedia < 20 ? "Cielo sereno" : cloudMedia < 40 ? "Poco nuvoloso" : cloudMedia < 60 ? "Nuvole sparse" : cloudMedia < 80 ? "Molto nuvoloso" : "Coperto";

  // Vento
  const venti = dayData.filter((h: any) => h.time.getHours() >= 9 && h.time.getHours() <= 19).map((h: any) => h.wind);
  const ventoMedio = venti.length ? venti.reduce((a: number, b: number) => a + b, 0) / venti.length : 0;
  const ventoMax = Math.max(...dayData.map((h: any) => h.wind));
  const rafficheMax = Math.max(...dayData.map((h: any) => h.gust));

  const ventoSuperficieDesc =
    ventoMedio < 5 ? "Molto debole (<5 km/h)" :
    ventoMedio < 12 ? "Leggero (5-12 km/h)" :
    ventoMedio < 20 ? "Moderato (12-20 km/h)" :
    ventoMedio < 28 ? "Forte (20-28 km/h)" :
    "Molto forte (>28 km/h)";

  // Vento in quota (80m e 120m se presenti)
  const w80 = dayData.map((h: any) => h.w80).filter((w: any) => w != null);
  const w120 = dayData.map((h: any) => h.w120).filter((w: any) => w != null);
  const ventoQuotaDesc =
    w120.length
      ? `${Math.round(w120.reduce((a: number, b: number) => a + b, 0) / w120.length)} km/h (120m)`
      : w80.length
      ? `${Math.round(w80.reduce((a: number, b: number) => a + b, 0) / w80.length)} km/h (80m)`
      : "Non disponibile";

  // Umidità e pioggia
  const umiditaMedia = dayData.reduce((s: number, h: any) => s + h.hum, 0) / dayData.length;
  const pioggiaTotale = dayData.reduce((s: number, h: any) => s + h.prec, 0);
  const orePioggia = dayData.filter((h: any) => h.prec > 0.3).length;
  const pioggiaDesc = orePioggia > 0 ? `${pioggiaTotale.toFixed(1)}mm (${orePioggia} ore con pioggia)` : "Assente";

  // Visibilità
  const visMedia = dayData.reduce((s: number, h: any) => s + h.vis, 0) / dayData.length;
  const visDesc = visMedia > 30 ? "Ottima (+30 km)" : visMedia > 15 ? "Buona (15-30 km)" : visMedia > 8 ? "Discreta (8-15 km)" : "Ridotta (<8 km)";

  // Calcolo punteggio
  let score = 5;
  if (tempMedia > 18 && tempMedia < 30) score += 1.5;
  if (delta > 8) score += 1;
  if (cloudMedia < 40 && cloudMedia > 10) score += 1;
  if (ventoMedio >= 8 && ventoMedio <= 18) score += 1.5;
  if (ventoMax > 25) score -= 2;
  if (rafficheMax > 30) score -= 1.5;
  if (pioggiaTotale > 1) score -= 3;
  if (orePioggia > 2) score -= 1;
  if (visMedia < 10) score -= 1;
  if (umiditaMedia > 80) score -= 0.5;

  score = Math.max(0, Math.min(10, score));

  const giudizio: CondizioniVolo["giudizio"] =
    score >= 8 ? "Ottimo" : score >= 6 ? "Buono" : score >= 4 ? "Medio" : score >= 2 ? "Difficile" : "Sconsigliato";

  // Consiglio personalizzato
  let consiglio = "";
  if (score >= 8) {
    consiglio = "✅ Condizioni ideali per il volo libero. Termica ben sviluppata, vento nei range ottimali. Decolla con tranquillità!";
  } else if (score >= 6) {
    consiglio = "👍 Buone condizioni. Verifica vento in loco prima di decollare, ma le prospettive sono positive.";
  } else if (score >= 4) {
    consiglio = "⚠️ Condizioni mediocri. Valuta attentamente vento e nuvolosità prima di decidere. Meglio se sei un pilota esperto.";
  } else if (score >= 2) {
    consiglio = "🔴 Condizioni difficili. Vento forte o pioggia. Volo sconsigliato ai piloti meno esperti.";
  } else {
    consiglio = "⛔ Condizioni pericolose. Volo fortemente sconsigliato.";
  }

  if (pioggiaTotale > 1) consiglio += " 🌧️ Pioggia prevista: attendere schiarite.";
  if (ventoMedio < 5) consiglio += " 💨 Vento debole: meglio attendere brezza più sostenuta per decolli dinamici.";
  if (site.difficulty >= 4 && score < 5) consiglio += " 🏔️ Decollo difficile: richiede esperienza e condizioni buone.";

  // Icone riassuntive
  const icone = score >= 7 ? "🟢" : score >= 4 ? "🟡" : "🔴";

  const termica = `T media ${Math.round(tempMedia)}°C, Δ${delta}°C, nuvole ${Math.round(cloudMedia)}% — ${
    tempMedia > 20 && cloudMedia > 15 && cloudMedia < 50 ? "termica attiva prevista" :
    tempMedia > 15 ? "termica moderata" :
    "termica debole"
  }`;

  return {
    punteggio: Math.round(score * 10) / 10,
    giudizio,
    icone,
    termica,
    ventoSuperficie: `${ventoSuperficieDesc} (max ${Math.round(ventoMax)} km/h, raffiche ${Math.round(rafficheMax)} km/h)`,
    ventoQuota: ventoQuotaDesc,
    visibilita: visDesc,
    pioggia: pioggiaDesc,
    consiglio,
  };
}