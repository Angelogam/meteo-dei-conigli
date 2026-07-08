"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";

/* ============================
   DATI DECOLLI
   ============================ */

const DECOLLI = [
  { id: "malanotte", name: "Malanotte", lat: 44.25874571728482, lon: 7.794304664370852, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 3 },
  { id: "colle_di_tenda", name: "Colle di Tenda", lat: 44.15093973937469, lon: 7.569262924652476, exposure: "S", valley: "Valle Roya/Vermenagna", difficulty: 2 },
  { id: "boves", name: "Boves", lat: 44.32113720462757, lon: 7.544697617792515, exposure: "S", valley: "Cuneese", difficulty: 1 },
  { id: "monte_male", name: "Monte Male – Dronero", lat: 44.43163071064606, lon: 7.362886778152897, exposure: "S", valley: "Valle Maira", difficulty: 3 },
  { id: "iretta", name: "Iretta", lat: 44.49893744007536, lon: 7.382036612070795, exposure: "S", valley: "Valle Maira", difficulty: 2 },
  { id: "val_mala", name: "Pratoni di Val Mala", lat: 44.50780117336976, lon: 7.346618978966227, exposure: "S", valley: "Valle Maira", difficulty: 2 },
  { id: "birrone", name: "Monte Birrone", lat: 44.5398927839592, lon: 7.25293945830122, exposure: "S", valley: "Valle Maira", difficulty: 4 },
  { id: "agnello", name: "Colle dell'Agnello", lat: 44.68282592463814, lon: 6.978200601250462, exposure: "S", valley: "Valle Varaita", difficulty: 5 },
  { id: "pian_mune_alto", name: "Pian Munè – Seggiovia", lat: 44.63861029121272, lon: 7.230889474766025, exposure: "S/SW", valley: "Valle Po", difficulty: 2 },
  { id: "pian_mune_basso", name: "Pian Munè – Bric Lombatera", lat: 44.65736521807557, lon: 7.260017009542715, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "martiniana_po", name: "Martiniana Po", lat: 44.60695265332723, lon: 7.38322612877631, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "rucas_alto", name: "Rucas alto", lat: 44.74213930591463, lon: 7.220118689737356, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 2 },
  { id: "montoso_basso", name: "Montoso – decollo basso", lat: 44.7643723437882, lon: 7.249757926713178, exposure: "SE", valley: "Valle Infernotto", difficulty: 1 },
  { id: "vandalino", name: "Monte Vandalino", lat: 44.83671231480542, lon: 7.173866924055591, exposure: "S/SE", valley: "Val Pellice", difficulty: 4 },
  { id: "pian_dell_alpe", name: "Pian dell'Alpe", lat: 45.06396153999711, lon: 7.028266530872771, exposure: "S", valley: "Val Chisone", difficulty: 3 },
  { id: "roletto", name: "Roletto – Piggi", lat: 44.93249288285819, lon: 7.310959031722244, exposure: "S", valley: "Pinerolese", difficulty: 1 },
  { id: "piossasco", name: "Piossasco – Monte S. Giorgio", lat: 44.99671840144012, lon: 7.44800217882953, exposure: "S", valley: "Collina Torinese", difficulty: 1 },
  { id: "truccetti", name: "Truccetti", lat: 45.07973511679036, lon: 7.342018342463826, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "val_della_torre", name: "Val della Torre", lat: 45.16262748864921, lon: 7.463716167415302, exposure: "S", valley: "Val della Torre", difficulty: 1 },
  { id: "rocca_canavese", name: "Rocca Canavese – M. della Neve", lat: 45.32757754837493, lon: 7.572793582322621, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "s_elisabetta", name: "Santa Elisabetta", lat: 45.4182733880574, lon: 7.641945041749434, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "s_elisabetta_alto", name: "Santa Elisabetta alto", lat: 45.44019393073506, lon: 7.648025947229948, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "cavallaria", name: "Monte Cavallaria", lat: 45.51729363773779, lon: 7.798808327293107, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "andrate", name: "Andrate", lat: 45.55063933418272, lon: 7.880775591143394, exposure: "S", valley: "Canavese", difficulty: 1 },
];

/* ============================
   FETCH METEO COMPLETA
   ============================ */

async function fetchMeteoCompleta(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,dewpoint_2m,relativehumidity_2m,cloudcover,precipitation,visibility,` +
    `wind_speed_10m,wind_gusts_10m,wind_direction_10m,` +
    `wind_speed_80m,wind_direction_80m,wind_speed_120m,wind_direction_120m,` +
    `uv_index,is_day,weathercode,pressure_msl` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,` +
    `uv_index_max,precipitation_sum,precipitation_hours,` +
    `wind_speed_10m_max,wind_direction_10m_dominant` +
    `&timezone=auto&forecast_days=3`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    
    const hours = data.hourly.time;
    const hourlyData = hours.map((time, index) => ({
      time: new Date(time),
      temperature: data.hourly.temperature_2m[index],
      dewPoint: data.hourly.dewpoint_2m[index],
      humidity: data.hourly.relativehumidity_2m[index],
      cloudCover: data.hourly.cloudcover[index],
      precipitation: data.hourly.precipitation[index] || 0,
      visibility: data.hourly.visibility ? data.hourly.visibility[index] / 1000 : 40,
      windSpeed: data.hourly.wind_speed_10m[index],
      windGust: data.hourly.wind_gusts_10m ? data.hourly.wind_gusts_10m[index] : data.hourly.wind_speed_10m[index] + 8,
      windDir: data.hourly.wind_direction_10m[index],
      wind80m: data.hourly.wind_speed_80m ? data.hourly.wind_speed_80m[index] : null,
      windDir80m: data.hourly.wind_direction_80m ? data.hourly.wind_direction_80m[index] : null,
      wind120m: data.hourly.wind_speed_120m ? data.hourly.wind_speed_120m[index] : null,
      windDir120m: data.hourly.wind_direction_120m ? data.hourly.wind_direction_120m[index] : null,
      uvIndex: data.hourly.uv_index ? data.hourly.uv_index[index] : 0,
      isDay: data.hourly.is_day ? data.hourly.is_day[index] : 1,
      weatherCode: data.hourly.weathercode ? data.hourly.weathercode[index] : 0,
      pressure: data.hourly.pressure_msl ? data.hourly.pressure_msl[index] : 1013,
    }));

    const dailyData = data.daily.time.map((date, index) => ({
      date: new Date(date),
      weatherCode: data.daily.weathercode[index],
      tempMax: data.daily.temperature_2m_max[index],
      tempMin: data.daily.temperature_2m_min[index],
      sunrise: new Date(data.daily.sunrise[index]),
      sunset: new Date(data.daily.sunset[index]),
      uvMax: data.daily.uv_index_max[index],
      precipitationSum: data.daily.precipitation_sum[index],
      precipitationHours: data.daily.precipitation_hours[index],
      windMax: data.daily.wind_speed_10m_max[index],
      windDirDominant: data.daily.wind_direction_10m_dominant[index],
    }));

    return {
      hourly: hourlyData,
      daily: dailyData,
    };
  } catch (error) {
    console.error("Errore fetch meteo:", error);
    throw error;
  }
}

/* ============================
   UTILITY METEO
   ============================ */

function getWeatherIcon(code, isDay) {
  const icons = {
    0: isDay ? '☀️' : '🌙',
    1: isDay ? '🌤️' : '🌤️',
    2: isDay ? '⛅' : '☁️',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌦️',
    53: '🌧️',
    55: '🌧️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    71: '❄️',
    73: '❄️',
    75: '❄️',
    80: '🌧️',
    81: '🌧️',
    82: '⛈️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️',
  };
  return icons[code] || (isDay ? '☀️' : '🌙');
}

function getWeatherDescription(code) {
  const weatherCodes = {
    0: 'Sereno',
    1: 'Poco nuvoloso',
    2: 'Parzialmente nuvoloso',
    3: 'Nuvoloso',
    45: 'Nebbia',
    48: 'Nebbia ghiacciata',
    51: 'Pioviggine leggera',
    53: 'Pioviggine moderata',
    55: 'Pioviggine densa',
    61: 'Pioggia leggera',
    63: 'Pioggia moderata',
    65: 'Pioggia forte',
    71: 'Neve leggera',
    73: 'Neve moderata',
    75: 'Neve forte',
    80: 'Rovescio di pioggia',
    81: 'Rovescio moderato',
    82: 'Rovescio forte',
    95: 'Temporale',
    96: 'Temporale con grandine',
    99: 'Temporale forte con grandine',
  };
  return weatherCodes[code] || 'Variabile';
}

function getWindDirection(degrees) {
  if (!degrees && degrees !== 0) return '--';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}

function getWindArrow(degrees) {
  if (!degrees && degrees !== 0) return '➡️';
  const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
  return arrows[Math.round(degrees / 45) % 8];
}

function getCloudCondition(cloudCover) {
  if (cloudCover < 20) return { text: 'Sereno', icon: '☀️', color: '#ffd93d' };
  if (cloudCover < 40) return { text: 'Poco nuvoloso', icon: '🌤️', color: '#f9a825' };
  if (cloudCover < 60) return { text: 'Nuvoloso', icon: '⛅', color: '#90a4ae' };
  if (cloudCover < 80) return { text: 'Molto nuvoloso', icon: '☁️', color: '#78909c' };
  return { text: 'Coperto', icon: '☁️', color: '#546e7a' };
}

function getThermalIndex(temp, cloud, humidity, delta) {
  let score = 0;
  if (temp > 22) score += 2;
  else if (temp > 18) score += 1;
  if (cloud < 30) score += 2;
  else if (cloud < 50) score += 1;
  if (humidity < 50) score += 1;
  if (delta > 10) score += 2;
  else if (delta > 6) score += 1;
  
  if (score >= 6) return { level: 'Forte', icon: '🔥', color: '#ff1744', desc: 'Ottima attività termica' };
  if (score >= 4) return { level: 'Media', icon: '💪', color: '#ff6d00', desc: 'Buona attività termica' };
  if (score >= 2) return { level: 'Debole', icon: '🫤', color: '#ffd600', desc: 'Termiche deboli' };
  return { level: 'Assente', icon: '❄️', color: '#4fc3f7', desc: 'Nessuna attività termica' };
}

/* ============================
   ANALISI AVANZATA
   ============================ */

function generateAIAnalysis(meteoData, site, dayData, thermalDelta) {
  if (!meteoData || !dayData) return null;

  const analysis = {
    general: {
      title: "📋 Panoramica Generale",
      description: generateGeneralDescription(dayData, site),
    },
    wind: {
      title: "💨 Analisi del Vento",
      description: generateWindAnalysis(dayData, site),
    },
    thermal: {
      title: "🔥 Analisi Termiche",
      description: generateThermalAnalysis(dayData, thermalDelta),
    },
    altitude: {
      title: "🏔️ Quote e Plafond",
      description: generateAltitudeAnalysis(dayData, site, thermalDelta),
    },
    advice: {
      title: "💡 Consigli per il Volo",
      description: generateFlightAdvice(dayData, site, thermalDelta),
    },
    hourly: {
      title: "⏰ Svolgimento della Giornata",
      description: generateHourlyBreakdown(dayData),
    },
  };

  return analysis;
}

function generateGeneralDescription(dayData, site) {
  const temps = dayData.map(h => h.temperature).filter(t => t !== undefined);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const avgCloud = dayData.reduce((sum, h) => sum + h.cloudCover, 0) / dayData.length;
  const maxWind = Math.max(...dayData.map(h => h.windSpeed));
  const hasRain = dayData.some(h => h.precipitation > 0.5);
  const totalRain = dayData.reduce((sum, h) => sum + h.precipitation, 0);
  
  let desc = `🌅 La giornata al decollo di ${site.name} si presenta `;
  
  if (avgCloud < 30) desc += `con cielo prevalentemente sereno e temperature che varieranno tra ${Math.round(minTemp)}°C e ${Math.round(maxTemp)}°C, con una media di ${Math.round(avgTemp)}°C. `;
  else if (avgCloud < 60) desc += `con cielo parzialmente nuvoloso e temperature tra ${Math.round(minTemp)}°C e ${Math.round(maxTemp)}°C. `;
  else desc += `con cielo nuvoloso e temperature fresche tra ${Math.round(minTemp)}°C e ${Math.round(maxTemp)}°C. `;
  
  if (maxWind > 25) desc += `💨 Attenzione al vento che raggiungerà raffiche fino a ${Math.round(maxWind)} km/h, condizione che potrebbe rendere il volo impegnativo. `;
  else if (maxWind > 15) desc += `💨 Vento moderato con raffiche fino a ${Math.round(maxWind)} km/h, condizioni generalmente favorevoli. `;
  else desc += `💨 Vento debole con raffiche fino a ${Math.round(maxWind)} km/h, ideale per voli tranquilli. `;
  
  if (hasRain) desc += `🌧️ Sono previste precipitazioni per un totale di ${Math.round(totalRain)} mm, si consiglia di valutare attentamente le condizioni. `;
  else desc += `✅ Nessuna precipitazione prevista, condizioni ideali per il volo. `;
  
  if (avgCloud < 60 && maxWind < 25 && !hasRain) desc += `🎯 Le condizioni complessive sono favorevoli per il volo in parapendio. `;
  else desc += `⚠️ Verificare attentamente le condizioni meteo prima di decidere di volare. `;
  
  desc += `📍 Il sito è esposto a ${site.exposure}, orientamento che richiede attenzione alla direzione del vento.`;
  
  return desc;
}

function generateWindAnalysis(dayData, site) {
  const windData = dayData.map(h => ({
    hour: h.time.getHours(),
    speed: h.windSpeed,
    gust: h.windGust,
    dir: h.windDir,
    dir80: h.wind80m,
    dir120: h.wind120m,
    speed80: h.wind80m,
    speed120: h.wind120m,
  })).filter(h => h.hour >= 9 && h.hour <= 19);
  
  if (windData.length === 0) return "Dati vento non disponibili per la fascia oraria.";
  
  const avgSpeed = windData.reduce((sum, h) => sum + h.speed, 0) / windData.length;
  const maxSpeed = Math.max(...windData.map(h => h.speed));
  const maxGust = Math.max(...windData.map(h => h.gust));
  const avgDir = windData.reduce((sum, h) => sum + h.dir, 0) / windData.length;
  const dominantDir = getWindDirection(avgDir);
  
  const has80mData = windData.some(h => h.speed80 !== null);
  const has120mData = windData.some(h => h.speed120 !== null);
  
  let desc = `💨 Analisi vento per la giornata:\n\n`;
  desc += `📊 **Vento superficiale (10m):**\n`;
  desc += `   • Velocità media: ${Math.round(avgSpeed)} km/h\n`;
  desc += `   • Raffica massima: ${Math.round(maxGust)} km/h\n`;
  desc += `   • Direzione dominante: ${dominantDir}\n`;
  
  const expDirs = site.exposure.split('/').map(d => d.trim());
  const isFav = expDirs.some(exp => dominantDir === exp || dominantDir === exp + 'E' || dominantDir === exp + 'W');
  desc += `   • Rispetto al sito: ${isFav ? '✅ Favorevole' : '⚠️ Non favorevole'}\n\n`;
  
  if (has80mData) {
    const avg80 = windData.reduce((sum, h) => sum + (h.speed80 || 0), 0) / windData.filter(h => h.speed80 !== null).length;
    const avgDir80 = windData.reduce((sum, h) => sum + (h.dir80 || 0), 0) / windData.filter(h => h.dir80 !== null).length;
    desc += `📊 **Vento a 80m (quota termica):**\n`;
    desc += `   • Velocità media: ${Math.round(avg80)} km/h\n`;
    desc += `   • Direzione: ${getWindDirection(avgDir80)}\n`;
    desc += `   • Differenza con superficie: ${Math.round(avg80 - avgSpeed)} km/h\n\n`;
  }
  
  if (has120mData) {
    const avg120 = windData.reduce((sum, h) => sum + (h.speed120 || 0), 0) / windData.filter(h => h.speed120 !== null).length;
    const avgDir120 = windData.reduce((sum, h) => sum + (h.dir120 || 0), 0) / windData.filter(h => h.dir120 !== null).length;
    desc += `📊 **Vento a 120m (alta quota):**\n`;
    desc += `   • Velocità media: ${Math.round(avg120)} km/h\n`;
    desc += `   • Direzione: ${getWindDirection(avgDir120)}\n`;
    desc += `   • Differenza con superficie: ${Math.round(avg120 - avgSpeed)} km/h\n\n`;
  }
  
  const shear = has120mData ? Math.round((windData.reduce((sum, h) => sum + (h.speed120 || 0), 0) / windData.filter(h => h.speed120 !== null).length) - avgSpeed) : 0;
  if (Math.abs(shear) > 10) {
    desc += `⚠️ **Attenzione:** Forte shear del vento (${Math.abs(shear)} km/h di differenza tra 10m e 120m), possibili turbolenze significative.\n`;
  } else if (Math.abs(shear) > 5) {
    desc += `⚡ Shear moderato (${Math.abs(shear)} km/h), possibili turbolenze localizzate.\n`;
  } else {
    desc += `✅ Shear ridotto (${Math.abs(shear)} km/h), condizioni stabili.\n`;
  }
  
  return desc;
}

function generateThermalAnalysis(dayData, thermalDelta) {
  const temps = dayData.map(h => h.temperature).filter(t => t !== undefined);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const maxTemp = Math.max(...temps);
  const avgCloud = dayData.reduce((sum, h) => sum + h.cloudCover, 0) / dayData.length;
  const avgHumidity = dayData.reduce((sum, h) => sum + h.humidity, 0) / dayData.length;
  
  const thermalIndex = getThermalIndex(avgTemp, avgCloud, avgHumidity, thermalDelta);
  
  let desc = `🔥 Analisi delle termiche per la giornata:\n\n`;
  desc += `📊 **Dati termici:**\n`;
  desc += `   • Temperatura media: ${Math.round(avgTemp)}°C\n`;
  desc += `   • Delta termico: ${thermalDelta}°C\n`;
  desc += `   • Nuvolosità media: ${Math.round(avgCloud)}%\n`;
  desc += `   • Umidità media: ${Math.round(avgHumidity)}%\n\n`;
  
  desc += `📈 **Attività termica:** ${thermalIndex.icon} ${thermalIndex.level} - ${thermalIndex.desc}\n\n`;
  
  desc += `⏰ **Sviluppo orario delle termiche:**\n`;
  const thermalHours = dayData.filter(h => h.time.getHours() >= 10 && h.time.getHours() <= 18);
  thermalHours.forEach(h => {
    const hour = h.time.getHours();
    const index = getThermalIndex(h.temperature, h.cloudCover, h.humidity, thermalDelta);
    const icon = index.level === 'Forte' ? '🔥' : index.level === 'Media' ? '💪' : '🫤';
    desc += `   • ${String(hour).padStart(2, '0')}:00 → ${icon} ${index.level} (${Math.round(h.temperature)}°C, ${Math.round(h.cloudCover)}% nuvole)\n`;
  });
  
  return desc;
}

function generateAltitudeAnalysis(dayData, site, thermalDelta) {
  const temps = dayData.map(h => h.temperature).filter(t => t !== undefined);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  
  const baseStart = 1500;
  const thermalMultiplier = 80;
  const baseEstimate = Math.round(baseStart + (thermalDelta * thermalMultiplier));
  const dewPoint = dayData.reduce((sum, h) => sum + h.dewPoint, 0) / dayData.length;
  const cloudBase = Math.round((avgTemp - dewPoint) * 120 + baseStart);
  
  let desc = `🏔️ Analisi delle quote e plafond:\n\n`;
  desc += `📊 **Quote stimate:**\n`;
  desc += `   • Base decollo: ~${baseStart}m\n`;
  desc += `   • Base termica stimata: ${baseEstimate}m\n`;
  desc += `   • Base delle nuvole: ${cloudBase}m\n`;
  desc += `   • Delta termico: ${thermalDelta}°C\n\n`;
  
  const maxReachable = Math.max(baseEstimate, cloudBase);
  desc += `📈 **Plafond massimo raggiungibile:** ${maxReachable}m\n`;
  
  if (thermalDelta > 8 && maxReachable > 2500) desc += `✅ **Cross Country:** Condizioni eccellenti per voli di distanza. Ottima attività termica e buon plafond.\n`;
  else if (thermalDelta > 5 && maxReachable > 2000) desc += `👍 **Cross Country:** Buone condizioni per cross country. Termiche sufficienti per voli di media distanza.\n`;
  else desc += `🫤 **Cross Country:** Condizioni limitate per cross country. Termiche deboli, plafond ridotto.\n`;
  
  if (maxReachable > 3000) desc += `📌 **Consiglio:** Quota elevata raggiungibile, utilizzare attrezzatura adeguata per alte quote.\n`;
  else if (maxReachable < 2000) desc += `📌 **Consiglio:** Quota limitata, concentrarsi su voli locali.\n`;
  
  return desc;
}

function generateFlightAdvice(dayData, site, thermalDelta) {
  const maxWind = Math.max(...dayData.map(h => h.windSpeed));
  const maxGust = Math.max(...dayData.map(h => h.windGust));
  const avgCloud = dayData.reduce((sum, h) => sum + h.cloudCover, 0) / dayData.length;
  const hasRain = dayData.some(h => h.precipitation > 0.5);
  const temps = dayData.map(h => h.temperature).filter(t => t !== undefined);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  
  let desc = `💡 Consigli pratici per il volo:\n\n`;
  
  let riskScore = 0;
  if (maxWind > 25) riskScore += 2;
  if (maxGust > 35) riskScore += 2;
  if (avgCloud > 80) riskScore += 1;
  if (hasRain) riskScore += 2;
  if (thermalDelta > 12) riskScore += 1;
  
  desc += `📊 **Valutazione del rischio:** `;
  if (riskScore >= 5) desc += `🔴 ALTO - Condizioni pericolose, sconsigliato volare.\n`;
  else if (riskScore >= 3) desc += `🟡 MEDIO - Condizioni impegnative, richiesta esperienza.\n`;
  else desc += `🟢 BASSO - Condizioni favorevoli per il volo.\n`;
  desc += `\n`;
  
  desc += `📌 **Consigli specifici:**\n`;
  
  if (maxWind > 25) desc += `   • ⚠️ VENTO FORTE (>25 km/h): Volo sconsigliato. Attendere condizioni migliori.\n`;
  else if (maxWind > 18) desc += `   • ⚠️ Vento sostenuto (18-25 km/h): Decollo impegnativo, richiesta esperienza.\n`;
  else if (maxWind < 5) desc += `   • 💨 Vento debole (<5 km/h): Possibili difficoltà di decollo. Attendere brezza.\n`;
  else desc += `   • ✅ Vento ideale (5-18 km/h): Condizioni perfette per il decollo.\n`;
  
  const thermalIdx = getThermalIndex(avgTemp, avgCloud, dayData.reduce((sum, h) => sum + h.humidity, 0) / dayData.length, thermalDelta);
  if (thermalIdx.level === 'Forte') desc += `   • 🔥 Termiche forti: Ottime per cross, ma attenzione a turbolenze e vento in quota.\n`;
  else if (thermalIdx.level === 'Media') desc += `   • 💪 Termiche medie: Buona attività, ideale per voli di media durata.\n`;
  else desc += `   • 🫤 Termiche deboli: Voli locali, poca attività termica.\n`;
  
  if (avgCloud > 80) desc += `   • ☁️ Cielo coperto: Visibilità ridotta, attenzione alle condizioni.\n`;
  else if (avgCloud < 30) desc += `   • ☀️ Cielo sereno: Ottima visibilità, ideale per voli di distanza.\n`;
  
  if (hasRain) desc += `   • 🌧️ Precipitazioni previste: VOLO SCONSIGLIATO! Attendere condizioni migliori.\n`;
  
  desc += `\n⏰ **Momenti migliori della giornata:**\n`;
  
  const goodHours = dayData.filter(h => {
    const hour = h.time.getHours();
    return hour >= 10 && hour <= 17 && h.windSpeed < 22 && h.cloudCover < 70 && h.precipitation < 0.5;
  });
  
  if (goodHours.length > 0) {
    const hours = goodHours.map(h => `${String(h.time.getHours()).padStart(2, '0')}:00`).join(', ');
    desc += `   • 🕐 Ore consigliate: ${hours}\n`;
  } else {
    desc += `   • ⚠️ Nessuna ora ottimale identificata. Valutare le condizioni al momento.\n`;
  }
  
  desc += `\n🎯 **Consiglio finale:** `;
  if (riskScore < 3 && !hasRain && maxWind < 22) desc += `Condizioni favorevoli! Preparati e vola in sicurezza. Divertiti! 🪂\n`;
  else if (riskScore < 5) desc += `Condizioni accettabili ma impegnative. Valuta attentamente e vola solo se hai esperienza. ⚠️\n`;
  else desc += `Condizioni sfavorevoli. Sconsigliato volare oggi. Attendere miglioramenti meteo. ❌\n`;
  
  return desc;
}

function generateHourlyBreakdown(dayData) {
  let desc = `⏰ **Svolgimento della giornata ora per ora (9:00 - 19:00):**\n\n`;
  
  for (let hour = 9; hour <= 19; hour++) {
    const data = dayData.find(h => h.time.getHours() === hour);
    if (!data) continue;
    
    const weatherIcon = getWeatherIcon(data.weatherCode || 0, data.isDay);
    const cloud = getCloudCondition(data.cloudCover);
    const windDir = getWindDirection(data.windDir);
    const thermal = getThermalIndex(data.temperature, data.cloudCover, data.humidity, 0);
    
    desc += `🕐 **${String(hour).padStart(2, '0')}:00** ${weatherIcon} ${Math.round(data.temperature)}°C\n`;
    desc += `   • Vento: ${getWindArrow(data.windDir)} ${Math.round(data.windSpeed)} km/h (${windDir}) - raffiche ${Math.round(data.windGust)} km/h\n`;
    desc += `   • Nuvolosità: ${cloud.icon} ${Math.round(data.cloudCover)}% - ${cloud.text}\n`;
    desc += `   • Termiche: ${thermal.icon} ${thermal.level}\n`;
    if (data.precipitation > 0.5) desc += `   • 🌧️ Pioggia: ${Math.round(data.precipitation)} mm/h\n`;
    if (hour < 19) desc += `\n`;
  }
  
  return desc;
}

/* ============================
   APP PRINCIPALE
   ============================<dyad-write path="src/App.tsx" description="Complete the App component with the weather app UI">
import React, { useEffect, useState, useMemo, useCallback } from "react";

/* ============================
   DATI DECOLLI
   ============================ */

const DECOLLI = [
  { id: "malanotte", name: "Malanotte", lat: 44.25874571728482, lon: 7.794304664370852, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 3 },
  { id: "colle_di_tenda", name: "Colle di Tenda", lat: 44.15093973937469, lon: 7.569262924652476, exposure: "S", valley: "Valle Roya/Vermenagna", difficulty: 2 },
  { id: "boves", name: "Boves", lat: 44.32113720462757, lon: 7.544697617792515, exposure: "S", valley: "Cuneese", difficulty: 1 },
  { id: "monte_male", name: "Monte Male – Dronero", lat: 44.43163071064606, lon: 7.362886778152897, exposure: "S", valley: "Valle Maira", difficulty: 3 },
  { id: "iretta", name: "Iretta", lat: 44.49893744007536, lon: 7.382036612070795, exposure: "S", valley: "Valle Maira", difficulty: 2 },
  { id: "val_mala", name: "Pratoni di Val Mala", lat: 44.50780117336976, lon: 7.346618978966227, exposure: "S", valley: "Valle Maira", difficulty: 2 },
  { id: "birrone", name: "Monte Birrone", lat: 44.5398927839592, lon: 7.25293945830122, exposure: "S", valley: "Valle Maira", difficulty: 4 },
  { id: "agnello", name: "Colle dell'Agnello", lat: 44.68282592463814, lon: 6.978200601250462, exposure: "S", valley: "Valle Varaita", difficulty: 5 },
  { id: "pian_mune_alto", name: "Pian Munè – Seggiovia", lat: 44.63861029121272, lon: 7.230889474766025, exposure: "S/SW", valley: "Valle Po", difficulty: 2 },
  { id: "pian_mune_basso", name: "Pian Munè – Bric Lombatera", lat: 44.65736521807557, lon: 7.260017009542715, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "martiniana_po", name: "Martiniana Po", lat: 44.60695265332723, lon: 7.38322612877631, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "rucas_alto", name: "Rucas alto", lat: 44.74213930591463, lon: 7.220118689737356, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 2 },
  { id: "montoso_basso", name: "Montoso – decollo basso", lat: 44.7643723437882, lon: 7.249757926713178, exposure: "SE", valley: "Valle Infernotto", difficulty: 1 },
  { id: "vandalino", name: "Monte Vandalino", lat: 44.83671231480542, lon: 7.173866924055591, exposure: "S/SE", valley: "Val Pellice", difficulty: 4 },
  { id: "pian_dell_alpe", name: "Pian dell'Alpe", lat: 45.06396153999711, lon: 7.028266530872771, exposure: "S", valley: "Val Chisone", difficulty: 3 },
  { id: "roletto", name: "Roletto – Piggi", lat: 44.93249288285819, lon: 7.310959031722244, exposure: "S", valley: "Pinerolese", difficulty: 1 },
  { id: "piossasco", name: "Piossasco – Monte S. Giorgio", lat: 44.99671840144012, lon: 7.44800217882953, exposure: "S", valley: "Collina Torinese", difficulty: 1 },
  { id: "truccetti", name: "Truccetti", lat: 45.07973511679036, lon: 7.342018342463826, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "val_della_torre", name: "Val della Torre", lat: 45.16262748864921, lon: 7.463716167415302, exposure: "S", valley: "Val della Torre", difficulty: 1 },
  { id: "rocca_canavese", name: "Rocca Canavese – M. della Neve", lat: 45.32757754837493, lon: 7.572793582322621, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "s_elisabetta", name: "Santa Elisabetta", lat: 45.4182733880574, lon: 7.641945041749434, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "s_elisabetta_alto", name: "Santa Elisabetta alto", lat: 45.44019393073506, lon: 7.648025947229948, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "cavallaria", name: "Monte Cavallaria", lat: 45.51729363773779, lon: 7.798808327293107, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "andrate", name: "Andrate", lat: 45.55063933418272, lon: 7.880775591143394, exposure: "S", valley: "Canavese", difficulty: 1 },
];

/* ============================
   FETCH METEO COMPLETA
   ============================ */

async function fetchMeteoCompleta(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,dewpoint_2m,relativehumidity_2m,cloudcover,precipitation,visibility,` +
    `wind_speed_10m,wind_gusts_10m,wind_direction_10m,` +
    `wind_speed_80m,wind_direction_80m,wind_speed_120m,wind_direction_120m,` +
    `uv_index,is_day,weathercode,pressure_msl` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,` +
    `uv_index_max,precipitation_sum,precipitation_hours,` +
    `wind_speed_10m_max,wind_direction_10m_dominant` +
    `&timezone=auto&forecast_days=3`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    
    const hours = data.hourly.time;
    const hourlyData = hours.map((time, index) => ({
      time: new Date(time),
      temperature: data.hourly.temperature_2m[index],
      dewPoint: data.hourly.dewpoint_2m[index],
      humidity: data.hourly.relativehumidity_2m[index],
      cloudCover: data.hourly.cloudcover[index],
      precipitation: data.hourly.precipitation[index] || 0,
      visibility: data.hourly.visibility ? data.hourly.visibility[index] / 1000 : 40,
      windSpeed: data.hourly.wind_speed_10m[index],
      windGust: data.hourly.wind_gusts_10m ? data.hourly.wind_gusts_10m[index] : data.hourly.wind_speed_10m[index] + 8,
      windDir: data.hourly.wind_direction_10m[index],
      wind80m: data.hourly.wind_speed_80m ? data.hourly.wind_speed_80m[index] : null,
      windDir80m: data.hourly.wind_direction_80m ? data.hourly.wind_direction_80m[index] : null,
      wind120m: data.hourly.wind_speed_120m ? data.hourly.wind_speed_120m[index] : null,
      windDir120m: data.hourly.wind_direction_120m ? data.hourly.wind_direction_120m[index] : null,
      uvIndex: data.hourly.uv_index ? data.hourly.uv_index[index] : 0,
      isDay: data.hourly.is_day ? data.hourly.is_day[index] : 1,
      weatherCode: data.hourly.weathercode ? data.hourly.weathercode[index] : 0,
      pressure: data.hourly.pressure_msl ? data.hourly.pressure_msl[index] : 1013,
    }));

    const dailyData = data.daily.time.map((date, index) => ({
      date: new Date(date),
      weatherCode: data.daily.weathercode[index],
      tempMax: data.daily.temperature_2m_max[index],
      tempMin: data.daily.temperature_2m_min[index],
      sunrise: new Date(data.daily.sunrise[index]),
      sunset: new Date(data.daily.sunset[index]),
      uvMax: data.daily.uv_index_max[index],
      precipitationSum: data.daily.precipitation_sum[index],
      precipitationHours: data.daily.precipitation_hours[index],
      windMax: data.daily.wind_speed_10m_max[index],
      windDirDominant: data.daily.wind_direction_10m_dominant[index],
    }));

    return {
      hourly: hourlyData,
      daily: dailyData,
    };
  } catch (error) {
    console.error("Errore fetch meteo:", error);
    throw error;
  }
}

/* ============================
   UTILITY METEO
   ============================ */

function getWeatherIcon(code, isDay) {
  const icons = {
    0: isDay ? '☀️' : '🌙',
    1: isDay ? '🌤️' : '🌤️',
    2: isDay ? '⛅' : '☁️',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌦️',
    53: '🌧️',
    55: '🌧️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    71: '❄️',
    73: '❄️',
    75: '❄️',
    80: '🌧️',
    81: '🌧️',
    82: '⛈️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️',
  };
  return icons[code] || (isDay ? '☀️' : '🌙');
}

function getWindDirection(degrees) {
  if (!degrees && degrees !== 0) return '--';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}

function getWindArrow(degrees) {
  if (!degrees && degrees !== 0) return '➡️';
  const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
  return arrows[Math.round(degrees / 45) % 8];
}

function getCloudCondition(cloudCover) {
  if (cloudCover < 20) return { text: 'Sereno', icon: '☀️', color: '#ffd93d' };
  if (cloudCover < 40) return { text: 'Poco nuvoloso', icon: '🌤️', color: '#f9a825' };
  if (cloudCover < 60) return { text: 'Nuvoloso', icon: '⛅', color: '#90a4ae' };
  if (cloudCover < 80) return { text: 'Molto nuvoloso', icon: '☁️', color: '#78909c' };
  return { text: 'Coperto', icon: '☁️', color: '#546e7a' };
}

function getThermalIndex(temp, cloud, humidity, delta) {
  let score = 0;
  if (temp > 22) score += 2;
  else if (temp > 18) score += 1;
  if (cloud < 30) score += 2;
  else if (cloud < 50) score += 1;
  if (humidity < 50) score += 1;
  if (delta > 10) score += 2;
  else if (delta > 6) score += 1;
  
  if (score >= 6) return { level: 'Forte', icon: '🔥', color: '#ff1744', desc: 'Ottima attività termica' };
  if (score >= 4) return { level: 'Media', icon: '💪', color: '#ff6d00', desc: 'Buona attività termica' };
  if (score >= 2) return { level: 'Debole', icon: '🫤', color: '#ffd600', desc: 'Termiche deboli' };
  return { level: 'Assente', icon: '❄️', color: '#4fc3f7', desc: 'Nessuna attività termica' };
}

/* ============================
   ANALISI AVANZATA
   ============================ */

function generateAIAnalysis(meteoData, site, dayData, thermalDelta) {
  if (!meteoData || !dayData) return null;

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
    
    thermal: `🔥 **Attività termica:** ${getThermalIndex(avgTemp, avgCloud, avgHumidity, thermalDelta).icon} ${getThermalIndex(avgTemp, avgCloud, avgHumidity, thermalDelta).level}\n` +
      `📊 **Dati:** T media ${Math.round(avgTemp)}°C, Δ${thermalDelta}°C, nuvole ${Math.round(avgCloud)}%, umidità ${Math.round(avgHumidity)}%\n` +
      `📈 **Plafond stimato:** ~${Math.round(1500 + (thermalDelta * 80))}m (base) / ${Math.round((avgTemp - dewPoint) * 120 + 1500)}m (nuvole)`,
    
    wind: `💨 **Vento superficiale (10m):** media ${Math.round(dayData.filter(h => h.time.getHours() >= 9 && h.time.getHours() <= 19).reduce((s, h) => s + h.windSpeed, 0) / Math.max(1, dayData.filter(h => h.time.getHours() >= 9 && h.time.getHours() <= 19).length))} km/h, max ${Math.round(maxWind)} km/h, raffiche ${Math.round(maxGust)} km/h\n` +
      `📍 Direzione: ${getWindDirection(dayData.reduce((s, h) => s + h.windDir, 0) / dayData.length)} - Esposizione sito: ${site.exposure}`,
    
    advice: (maxWind > 25 ? `⚠️ **VENTO FORTE** (>25 km/h): Volo sconsigliato.` :
             maxWind > 18 ? `⚠️ Vento sostenuto (18-25 km/h): Decollo impegnativo.` :
             maxWind < 5 ? `💨 Vento debole (<5 km/h): Attendere brezza.` :
             `✅ Vento ideale (5-18 km/h): Condizioni perfette.`) +
      (hasRain ? `\n🌧️ **Precipitazioni previste:** Volo sconsigliato.` : `\n✅ Assenza di pioggia.`) +
      (avgCloud > 80 ? `\n☁️ Cielo coperto: Visibilità ridotta.` : avgCloud < 30 ? `\n☀️ Cielo sereno: Ottima visibilità.` : ``),
  };
}

/* ============================
   APP PRINCIPALE
   ============================ */

export default function App() {
  const [selected, setSelected] = useState(DECOLLI[0].id);
  const [meteoData, setMeteoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState(12);
  
  const site = DECOLLI.find((x) => x.id === selected);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMeteoCompleta(site.lat, site.lon);
        setMeteoData(data);
      } catch (err) {
        setError("Errore nel caricamento dei dati meteo");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selected, site.lat, site.lon]);

  const getDayData = useCallback(() => {
    if (!meteoData) return null;
    const today = new Date();
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() + selectedDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return meteoData.hourly.filter(h => h.time >= dayStart && h.time < dayEnd);
  }, [meteoData, selectedDay]);

  const thermalDelta = useMemo(() => {
    const dayData = getDayData();
    if (!dayData || dayData.length === 0) return 0;
    const temps = dayData.map(h => h.temperature).filter(t => t !== undefined && t !== null);
    if (temps.length === 0) return 0;
    return Math.round(Math.max(...temps) - Math.min(...temps));
  }, [getDayData]);

  const dayData = getDayData();
  const currentData = useMemo(() => {
    if (!dayData || dayData.length === 0) return null;
    const idx = dayData.findIndex(h => h.time.getHours() === selectedHour);
    return idx >= 0 ? dayData[idx] : dayData[Math.min(selectedHour - 9, dayData.length - 1)];
  }, [dayData, selectedHour]);

  const enrichedDailyData = useMemo(() => {
    if (!meteoData || !meteoData.daily) return [];
    return meteoData.daily.map((day, index) => {
      const dayHours = meteoData.hourly.filter(h => 
        h.time.getDate() === day.date.getDate() &&
        h.time.getMonth() === day.date.getMonth()
      );
      const temps = dayHours.map(h => h.temperature).filter(t => t !== undefined && t !== null);
      const delta = temps.length > 0 ? Math.round(Math.max(...temps) - Math.min(...temps)) : 0;
      return { ...day, thermalDelta: delta, dayIndex: index };
    });
  }, [meteoData]);

  const aiAnalysis = useMemo(() => {
    if (!meteoData || !dayData || !site) return null;
    return generateAIAnalysis(meteoData, site, dayData, thermalDelta);
  }, [meteoData, dayData, site, thermalDelta]);

  const hoursRange = Array.from({ length: 11 }, (_, i) => i + 9);

  if (loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#0a0e27", color: "#eee", fontFamily: "'Segoe UI', Arial, sans-serif"
      }}>
        <div style={{ width: 50, height: 50, border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "#ff6b6b", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ marginTop: 20, fontSize: "1.2rem", color: "#fff" }}>Caricamento previsioni meteo...</p>
        <p style={{ marginTop: 10, fontSize: "0.9rem", color: "#888" }}>Open-Meteo • Free Flight Forecast</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#0a0e27", color: "#eee", fontFamily: "'Segoe UI', Arial, sans-serif"
      }}>
        <p style={{ color: "#ff6b6b", fontSize: "1.2rem", marginBottom: 20 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{
          background: "#ff6b6b", color: "#fff", border: "none", padding: "12px 30px", borderRadius: 8,
          cursor: "pointer", fontWeight: 600, fontSize: "1rem"
        }}>
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: "#0a0e27", color: "#eee", minHeight: "100vh", padding: 20,
      fontFamily: "'Segoe UI', Arial, sans-serif"
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
      `}</style>

      <header style={{ textAlign: "center", marginBottom: 30, padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <h1 style={{
          fontSize: "2.2rem", marginBottom: 5,
          background: "linear-gradient(135deg, #ff6b6b, #ffd93d)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800
        }}>
          🐰 Meteo dei Conigli 🪂
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#888" }}>Previsioni per volo libero con Analisi AI • Dati da Open-Meteo</p>
      </header>

      <div style={{
        display: "grid", gridTemplateColumns: "320px 1fr", gap: 20,
        maxWidth: "1400px", margin: "0 auto"
      }}>
        {/* SX - LISTA DECOLLI */}
        <div style={{
          background: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 15,
          border: "1px solid rgba(255,255,255,0.1)", height: "calc(100vh - 200px)", overflow: "hidden"
        }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: 15, color: "#ff6b6b", fontWeight: 600 }}>📍 Decolli</h2>
          <div style={{ overflowY: "auto", height: "calc(100% - 50px)", paddingRight: 5 }}>
            {DECOLLI.map((d) => (
              <button
                key={d.id}
                onClick={() => { setSelected(d.id); setSelectedDay(0); setSelectedHour(12); }}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer", transition: "all 0.3s ease",
                  background: d.id === selected ? 'rgba(255,107,107,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${d.id === selected ? '#ff6b6b' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 10, padding: 12, marginBottom: 8, color: "#fff"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: "bold" }}>{d.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.75rem", color: "#888" }}>{d.valley}</span>
                  <span style={{ fontSize: "0.75rem", color: "#888" }}>{d.exposure}</span>
                </div>
                <span style={{
                  fontSize: "0.65rem", padding: "2px 8px", borderRadius: 12, color: "#fff", fontWeight: 600,
                  background: d.difficulty <= 2 ? '#4caf50' : d.difficulty <= 3 ? '#ff9800' : '#f44336'
                }}>
                  {d.difficulty <= 2 ? 'Facile' : d.difficulty <= 3 ? 'Medio' : 'Difficile'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* DX - DETTAGLIO */}
        <div style={{
          background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 15,
          border: "1px solid rgba(255,255,255,0.1)", maxHeight: "calc(100vh - 200px)", overflowY: "auto"
        }}>
          {currentData && site && (
            <>
              {/* HEADER SITO */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 15, paddingBottom: 15, borderBottom: "1px solid rgba(255,255,255,0.1)"
              }}>
                <div>
                  <h2 style={{ fontSize: "1.6rem", marginBottom: 5, color: "#fff" }}>{site.name}</h2>
                  <span style={{ fontSize: "0.85rem", color: "#888" }}>{site.exposure} • {site.valley}</span>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.1)", padding: "8px 15px", borderRadius: 30
                }}>
                  <span style={{ fontSize: "2rem" }}>{getWeatherIcon(currentData.weatherCode || 0, currentData.isDay)}</span>
                  <span style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{Math.round(currentData.temperature)}°C</span>
                </div>
              </div>

              {/* SELEZIONE GIORNO */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 15 }}>
                {enrichedDailyData.map((day, index) => (
                  <button key={index} onClick={() => { setSelectedDay(index); setSelectedHour(12); }} style={{
                    background: selectedDay === index ? 'rgba(255,107,107,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${selectedDay === index ? '#ff6b6b' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 10, padding: 10, cursor: "pointer", textAlign: "center", color: "#fff",
                    transition: "all 0.3s ease"
                  }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                      {day.date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ fontSize: "1.5rem", marginTop: 2 }}>{getWeatherIcon(day.weatherCode, true)}</div>
                    <div style={{ fontSize: "1rem", color: "#ff6b6b", marginTop: 4 }}>
                      {Math.round(day.tempMax)}°/{Math.round(day.tempMin)}°
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#888" }}>Δ{day.thermalDelta}°C</div>
                  </button>
                ))}
              </div>

              {/* SELEZIONE ORA */}
              <div style={{
                display: "flex", alignItems: "center", gap: 15, marginBottom: 15,
                padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: 10
              }}>
                <label style={{ fontSize: "0.85rem", color: "#888" }}>⏰ Ora:</label>
                <input
                  type="range" min="9" max="19" value={selectedHour}
                  onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: "#ff6b6b" }}
                />
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#fff", minWidth: 50 }}>
                  {String(selectedHour).padStart(2, '0')}:00
                </span>
              </div>

              {/* ANALISI AI */}
              {aiAnalysis && (
                <div style={{
                  marginBottom: 20, background: "rgba(0,0,0,0.3)", borderRadius: 12,
                  border: "1px solid rgba(255,107,107,0.2)", overflow: "hidden"
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 15px",
                    background: "rgba(255,107,107,0.1)", borderBottom: "1px solid rgba(255,107,107,0.2)"
                  }}>
                    <span style={{ fontSize: "1.5rem" }}>🤖</span>
                    <h3 style={{ fontSize: "1rem", color: "#ff6b6b", margin: 0, fontWeight: 600 }}>Analisi AI della Giornata</h3>
                  </div>
                  <div style={{ padding: "15px" }}>
                    <div style={{ marginBottom: 12, padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
                      <h4 style={{ fontSize: "0.95rem", color: "#4fc3f7", marginBottom: 8, fontWeight: 600 }}>📋 Panoramica</h4>
                      <p style={{ fontSize: "0.85rem", color: "#ddd", lineHeight: 1.6 }}>{aiAnalysis.general}</p>
                    </div>
                    <div style={{ marginBottom: 12, padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
                      <h4 style={{ fontSize: "0.95rem", color: "#4fc3f7", marginBottom: 8, fontWeight: 600 }}>🔥 Analisi Termiche</h4>
                      <p style={{ fontSize: "0.85rem", color: "#ddd", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{aiAnalysis.thermal}</p>
                    </div>
                    <div style={{ marginBottom: 12, padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
                      <h4 style={{ fontSize: "0.95rem", color: "#4fc3f7", marginBottom: 8, fontWeight: 600 }}>💨 Analisi Vento</h4>
                      <p style={{ fontSize: "0.85rem", color: "#ddd", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{aiAnalysis.wind}</p>
                    </div>
                    <div style={{ padding: "10px 15px",      {/* ANALISI AI */}
      {aiAnalysis && (
        <div style={{
          marginBottom: 20, background: "rgba(0,0,0,0.3)", borderRadius: 12,
          border: "1px solid rgba(255,107,107,0.2)", overflow: "hidden"
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 15px",
            background: "rgba(255,107,107,0.1)", borderBottom: "1px solid rgba(255,107,107,0.2)"
          }}>
            <span style={{ fontSize: "1.5rem" }}>🤖</span>
            <h3 style={{ fontSize: "1rem", color: "#ff6b6b", margin: 0, fontWeight: 600 }}>Analisi AI della Giornata</h3>
          </div>
          <div style={{ padding: "15px" }}>
            <div style={{ marginBottom: 12, padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
              <h4 style={{ fontSize: "0.95rem", color: "#4fc3f7", marginBottom: 8, fontWeight: 600 }}>📋 Panoramica</h4>
              <p style={{ fontSize: "0.85rem", color: "#ddd", lineHeight: 1.6 }}>{aiAnalysis.general}</p>
            </div>
            <div style={{ marginBottom: 12, padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
              <h4 style={{ fontSize: "0.95rem", color: "#4fc3f7", marginBottom: 8, fontWeight: 600 }}>🔥 Analisi Termiche</h4>
              <p style={{ fontSize: "0.85rem", color: "#ddd", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{aiAnalysis.thermal}</p>
            </div>
            <div style={{ marginBottom: 12, padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
              <h4 style={{ fontSize: "0.95rem", color: "#4fc3f7", marginBottom: 8, fontWeight: 600 }}>💨 Analisi Vento</h4>
              <p style={{ fontSize: "0.85rem", color: "#ddd", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{aiAnalysis.wind}</p>
            </div>
            <div style={{ padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
              <h4 style={{ fontSize: "0.95rem", color: "#ffd93d", marginBottom: 8, fontWeight: 600 }}>💡 Consigli per il Volo</h4>
              <p style={{ fontSize: "0.85rem", color: "#ddd", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{aiAnalysis.advice}</p>
            </div>
          </div>
        </div>
      )}

      {/* METEO GRIGLIA */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 15
      }}>
        <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 2 }}>🌡️ Temperatura</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>{Math.round(currentData.temperature)}°C</div>
          <div style={{ fontSize: "0.65rem", color: "#666", marginTop: 2 }}>Delta: {thermalDelta}°C</div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 2 }}>💧 Umidità</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>{Math.round(currentData.humidity)}%</div>
          <div style={{ fontSize: "0.65rem", color: "#666", marginTop: 2 }}>Rugiada: {Math.round(currentData.dewPoint)}°C</div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 2 }}>☁️ Nuvolosità</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>{Math.round(currentData.cloudCover)}%</div>
          <div style={{ fontSize: "0.65rem", color: "#666", marginTop: 2 }}>{getCloudCondition(currentData.cloudCover).text}</div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 2 }}>🌧️ Precipitazioni</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>{currentData.precipitation === 0 ? 'Assenti' : `${currentData.precipitation} mm`}</div>
          <div style={{ fontSize: "0.65rem", color: "#666", marginTop: 2 }}>{currentData.precipitation === 0 ? '✅ Asciutto' : '⚠️ Pioggia'}</div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 2 }}>👁️ Visibilità</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>{Math.round(currentData.visibility)} km</div>
          <div style={{ fontSize: "0.65rem", color: "#666", marginTop: 2 }}>{currentData.visibility > 20 ? 'Ottima' : currentData.visibility > 10 ? 'Buona' : 'Limitata'}</div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 2 }}>☀️ UV</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>{Math.round(currentData.uvIndex)}</div>
          <div style={{ fontSize: "0.65rem", color: "#666", marginTop: 2 }}>{currentData.uvIndex < 3 ? 'Basso' : currentData.uvIndex < 6 ? 'Medio' : 'Alto ⚠️'}</div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 2 }}>🔥 Termiche</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>{getThermalIndex(currentData.temperature, currentData.cloudCover, currentData.humidity, thermalDelta).icon} {getThermalIndex(currentData.temperature, currentData.cloudCover, currentData.humidity, thermalDelta).level}</div>
          <div style={{ fontSize: "0.65rem", color: "#666", marginTop: 2 }}>Δ{thermalDelta}°C</div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 2 }}>💨 Vento</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>{getWindArrow(currentData.windDir)} {Math.round(currentData.windSpeed)} km/h</div>
          <div style={{ fontSize: "0.65rem", color: "#666", marginTop: 2 }}>{getWindDirection(currentData.windDir)} • Raffiche: {Math.round(currentData.windGust)} km/h</div>
        </div>
      </div>

      {/* VENTO A DIFFERENTI QUOTE */}
      <div style={{
        marginBottom: 15, padding: 15, background: "rgba(0,0,0,0.3)",
        borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)"
      }}>
        <h3 style={{ fontSize: "0.95rem", color: "#4fc3f7", marginBottom: 10 }}>💨 Vento a differenti quote</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <div style={{ textAlign: "center", padding: 10, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 4 }}>10 m (superficie)</div>
            <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#fff" }}>{getWindArrow(currentData.windDir)} {Math.round(currentData.windSpeed)} km/h</div>
            <div style={{ fontSize: "0.75rem", color: "#aaa" }}>{getWindDirection(currentData.windDir)}</div>
            <div style={{ fontSize: "0.65rem", color: "#ff6b6b", marginTop: 2 }}>⚡ {Math.round(currentData.windGust)} km/h</div>
          </div>
          <div style={{ textAlign: "center", padding: 10, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 4 }}>80 m (quota termica)</div>
            <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#fff" }}>{currentData.wind80m ? `${getWindArrow(currentData.windDir80m)} ${Math.round(currentData.wind80m)} km/h` : 'N/D'}</div>
            <div style={{ fontSize: "0.75rem", color: "#aaa" }}>{currentData.wind80m ? getWindDirection(currentData.windDir80m) : '--'}</div>
            <div style={{ fontSize: "0.65rem", color: "#ff6b6b", marginTop: 2 }}>⚡ {currentData.wind80m ? Math.round(currentData.wind80m * 1.3) : '--'} km/h</div>
          </div>
          <div style={{ textAlign: "center", padding: 10, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
            <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 4 }}>120 m (alta quota)</div>
            <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#fff" }}>{currentData.wind120m ? `${getWindArrow(currentData.windDir120m)} ${Math.round(currentData.wind120m)} km/h` : 'N/D'}</div>
            <div style={{ fontSize: "0.75rem", color: "#aaa" }}>{currentData.wind120m ? getWindDirection(currentData.windDir120m) : '--'}</div>
            <div style={{ fontSize: "0.65rem", color: "#ff6b6b", marginTop: 2 }}>⚡ {currentData.wind120m ? Math.round(currentData.wind120m * 1.35) : '--'} km/h</div>
          </div>
        </div>
      </div>

      {/* PREVISIONE ORARIA VENTO */}
      <div style={{
        marginBottom: 15, padding: 15, background: "rgba(0,0,0,0.3)",
        borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)"
      }}>
        <h3 style={{ fontSize: "0.95rem", color: "#4fc3f7", marginBottom: 10 }}>📊 Vento orario (9:00 - 19:00)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 4, overflowX: "auto" }}>
          {hoursRange.map(hour => {
            const hourData = dayData?.find(h => h.time.getHours() === hour);
            if (!hourData) return null;
            return (
              <div key={hour} style={{ textAlign: "center", padding: 6, background: "rgba(255,255,255,0.03)", borderRadius: 6, minWidth: 50 }}>
                <div style={{ fontSize: "0.6rem", color: "#888", marginBottom: 2 }}>{String(hour).padStart(2, '0')}:00</div>
                <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#fff" }}>{getWindArrow(hourData.windDir)}</div>
                <div style={{ fontSize: "0.7rem", color: "#fff" }}>{Math.round(hourData.windSpeed)}</div>
                <div style={{ fontSize: "0.55rem", color: "#666" }}>{getWindDirection(hourData.windDir)}</div>
                <div style={{ fontSize: "0.7rem", marginTop: 2 }}>{getWeatherIcon(hourData.weatherCode || 0, hourData.isDay)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  )}
</div>
</div>

<footer style={{ textAlign: "center", marginTop: 30, padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
  <p style={{ fontSize: "0.75rem", color: "#666" }}>Dati meteo forniti da Open-Meteo.com • Analisi AI per volo libero</p>
  <p style={{ fontSize: "0.65rem", color: "#444", marginTop: 5 }}>🐰 Vola sicuro e divertiti! 🪂</p>
</footer>
</div>
);
}