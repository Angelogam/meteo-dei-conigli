"use client";

import React, { useEffect, useState, useMemo } from "react";

/* ============================
   DATI DECOLLI (dal tuo KML)
   ============================ */

const DECOLLI = [
  { id: "malanotte", name: "Malanotte", lat: 44.25874571728482, lon: 7.794304664370852, elevation: 1350, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 3 },
  { id: "colle_di_tenda", name: "Colle di Tenda", lat: 44.15093973937469, lon: 7.569262924652476, elevation: 1870, exposure: "S", valley: "Valle Roya/Vermenagna", difficulty: 2 },
  { id: "boves", name: "Boves", lat: 44.32113720462757, lon: 7.544697617792515, elevation: 900, exposure: "S", valley: "Cuneese", difficulty: 1 },
  { id: "monte_male", name: "Monte Male – Dronero", lat: 44.43163071064606, lon: 7.362886778152897, elevation: 1500, exposure: "S", valley: "Valle Maira", difficulty: 3 },
  { id: "iretta", name: "Iretta", lat: 44.49893744007536, lon: 7.382036612070795, elevation: 1300, exposure: "S", valley: "Valle Maira", difficulty: 2 },
  { id: "val_mala", name: "Pratoni di Val Mala", lat: 44.50780117336976, lon: 7.346618978966227, elevation: 1400, exposure: "S", valley: "Valle Maira", difficulty: 2 },
  { id: "birrone", name: "Monte Birrone", lat: 44.5398927839592, lon: 7.25293945830122, elevation: 2130, exposure: "S", valley: "Valle Maira", difficulty: 4 },
  { id: "agnello", name: "Colle dell'Agnello", lat: 44.68282592463814, lon: 6.978200601250462, elevation: 2684, exposure: "S", valley: "Valle Varaita", difficulty: 5 },
  { id: "pian_mune_alto", name: "Pian Munè – Seggiovia", lat: 44.63861029121272, lon: 7.230889474766025, elevation: 1500, exposure: "S/SW", valley: "Valle Po", difficulty: 2 },
  { id: "pian_mune_basso", name: "Pian Munè – Bric Lombatera", lat: 44.65736521807557, lon: 7.260017009542715, elevation: 1350, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "martiniana_po", name: "Martiniana Po", lat: 44.60695265332723, lon: 7.38322612877631, elevation: 900, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "rucas_alto", name: "Rucas alto", lat: 44.74213930591463, lon: 7.220118689737356, elevation: 1500, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 2 },
  { id: "montoso_basso", name: "Montoso – decollo basso", lat: 44.7643723437882, lon: 7.249757926713178, elevation: 1250, exposure: "SE", valley: "Valle Infernotto", difficulty: 1 },
  { id: "vandalino", name: "Monte Vandalino", lat: 44.83671231480542, lon: 7.173866924055591, elevation: 2120, exposure: "S/SE", valley: "Val Pellice", difficulty: 4 },
  { id: "pian_dell_alpe", name: "Pian dell'Alpe", lat: 45.06396153999711, lon: 7.028266530872771, elevation: 1700, exposure: "S", valley: "Val Chisone", difficulty: 3 },
  { id: "roletto", name: "Roletto – Piggi", lat: 44.93249288285819, lon: 7.310959031722244, elevation: 820, exposure: "S", valley: "Pinerolese", difficulty: 1 },
  { id: "piossasco", name: "Piossasco – Monte S. Giorgio", lat: 44.99671840144012, lon: 7.44800217882953, elevation: 673, exposure: "S", valley: "Collina Torinese", difficulty: 1 },
  { id: "truccetti", name: "Truccetti", lat: 45.07973511679036, lon: 7.342018342463826, elevation: 900, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "val_della_torre", name: "Val della Torre", lat: 45.16262748864921, lon: 7.463716167415302, elevation: 970, exposure: "S", valley: "Val della Torre", difficulty: 1 },
  { id: "rocca_canavese", name: "Rocca Canavese – M. della Neve", lat: 45.32757754837493, lon: 7.572793582322621, elevation: 1100, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "s_elisabetta", name: "Santa Elisabetta", lat: 45.4182733880574, lon: 7.641945041749434, elevation: 900, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "s_elisabetta_alto", name: "Santa Elisabetta alto", lat: 45.44019393073506, lon: 7.648025947229948, elevation: 1100, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "cavallaria", name: "Monte Cavallaria", lat: 45.51729363773779, lon: 7.798808327293107, elevation: 1300, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "andrate", name: "Andrate", lat: 45.55063933418272, lon: 7.880775591143394, elevation: 1000, exposure: "S", valley: "Canavese", difficulty: 1 },
];

/* ============================
   FETCH METEO REALE
   ============================ */

async function fetchMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,dewpoint_2m,relativehumidity_2m,cloudcover,precipitation,visibility,wind_speed_10m,wind_gusts_10m,wind_direction_10m` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&timezone=auto`;

  const r = await fetch(url);
  const d = await r.json();

  const h = d.hourly;
  const i = 12; // mezzogiorno

  // Calcola delta termico (differenza tra max e min del giorno)
  const dailyMax = d.daily.temperature_2m_max[0] || h.temperature_2m[i] + 5;
  const dailyMin = d.daily.temperature_2m_min[0] || h.temperature_2m[i] - 5;
  const thermalDelta = dailyMax - dailyMin;

  return {
    temperature: h.temperature_2m[i],
    dewPoint: h.dewpoint_2m[i],
    humidity: h.relativehumidity_2m[i],
    cloudCover: h.cloudcover[i],
    precipitation: h.precipitation[i] || 0,
    visibilityKm: h.visibility ? h.visibility[i] / 1000 : 40,
    windSurface: h.wind_speed_10m[i],
    windGust: h.wind_gusts_10m ? h.wind_gusts_10m[i] : h.wind_speed_10m[i] + 8,
    windDir: h.wind_direction_10m[i],
    thermalDelta: Math.round(thermalDelta),
  };
}

/* ============================
   ALGORITMI AVANZATI
   ============================ */

function calculateDetailedScore(m, site) {
  let scores = {
    wind: 0,
    thermal: 0,
    cloud: 0,
    visibility: 0,
    precipitation: 0,
    total: 0
  };

  // Vento (peso 30%)
  if (m.windSurface < 10) scores.wind = 5;
  else if (m.windSurface < 18) scores.wind = 4;
  else if (m.windSurface < 25) scores.wind = 3;
  else if (m.windSurface < 35) scores.wind = 2;
  else scores.wind = 1;

  // Termica (peso 25%)
  const thermalScore = m.thermalDelta;
  if (thermalScore > 12) scores.thermal = 5;
  else if (thermalScore > 8) scores.thermal = 4;
  else if (thermalScore > 5) scores.thermal = 3;
  else if (thermalScore > 3) scores.thermal = 2;
  else scores.thermal = 1;

  // Nuvolosità (peso 20%)
  if (m.cloudCover < 20) scores.cloud = 5;
  else if (m.cloudCover < 40) scores.cloud = 4;
  else if (m.cloudCover < 60) scores.cloud = 3;
  else if (m.cloudCover < 80) scores.cloud = 2;
  else scores.cloud = 1;

  // Visibilità (peso 15%)
  if (m.visibilityKm > 20) scores.visibility = 5;
  else if (m.visibilityKm > 10) scores.visibility = 4;
  else if (m.visibilityKm > 5) scores.visibility = 3;
  else if (m.visibilityKm > 2) scores.visibility = 2;
  else scores.visibility = 1;

  // Precipitazioni (peso 10%)
  if (m.precipitation === 0) scores.precipitation = 5;
  else if (m.precipitation < 0.5) scores.precipitation = 4;
  else if (m.precipitation < 1) scores.precipitation = 3;
  else if (m.precipitation < 2) scores.precipitation = 2;
  else scores.precipitation = 1;

  // Calcolo totale ponderato
  scores.total = Math.round(
    scores.wind * 0.30 +
    scores.thermal * 0.25 +
    scores.cloud * 0.20 +
    scores.visibility * 0.15 +
    scores.precipitation * 0.10
  );

  // Aggiustamento per difficoltà del sito
  if (site.difficulty >= 4 && scores.total > 3) {
    scores.total = Math.max(1, scores.total - 1);
  }

  return scores;
}

function getScoreColor(score) {
  return ["#ff1744", "#ff6d00", "#ffd600", "#00e676", "#00c853"][score - 1];
}

function getScoreLabel(score) {
  return ["Pericoloso", "Difficile", "Discreto", "Buono", "Eccellente"][score - 1];
}

function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}

function isWindFavorable(windDir, exposure) {
  const windStr = getWindDirection(windDir);
  const expDirs = exposure.split('/').map(d => d.trim());
  return expDirs.some(exp => windStr === exp || windStr === exp + 'E' || windStr === exp + 'W');
}

/* ============================
   APP PRINCIPALE
   ============================ */

export default function App() {
  const [selected, setSelected] = useState(DECOLLI[0].id);
  const [meteo, setMeteo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const site = useMemo(() => DECOLLI.find((x) => x.id === selected), [selected]);
  const scores = meteo ? calculateDetailedScore(meteo, site) : null;
  const totalScore = scores ? scores.total : 3;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMeteo(site.lat, site.lon);
        setMeteo(data);
      } catch (err) {
        setError("Errore nel caricamento dei dati meteo");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selected, site]);

  const windFavorable = meteo && site ? isWindFavorable(meteo.windDir, site.exposure) : false;

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>🪂 FlyCast Pro</h1>
        <p style={styles.subtitle}>Previsioni per volo in parapendio</p>
      </header>

      <div style={styles.grid}>
        {/* LISTA DECOLLI */}
        <div style={styles.left}>
          <h2 style={styles.sectionTitle}>📍 Decolli</h2>
          <div style={styles.cardList}>
            {DECOLLI.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelected(d.id)}
                style={{
                  ...styles.card,
                  borderColor: d.id === selected ? '#4fc3f7' : '#333',
                  background: d.id === selected ? 'rgba(79, 195, 247, 0.1)' : '#222',
                }}
              >
                <div style={styles.cardTitle}>{d.name}</div>
                <div style={styles.cardDetails}>
                  <span style={styles.cardSmall}>{d.valley}</span>
                  <span style={styles.cardSmall}>
                    {d.elevation}m • {d.exposure}
                  </span>
                </div>
                <div style={styles.cardBadges}>
                  <span style={{
                    ...styles.badge,
                    background: d.difficulty <= 2 ? '#4caf50' : d.difficulty <= 3 ? '#ff9800' : '#f44336'
                  }}>
                    {d.difficulty <= 2 ? 'Facile' : d.difficulty <= 3 ? 'Medio' : 'Difficile'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* DETTAGLIO */}
        <div style={styles.right}>
          <div style={styles.siteHeader}>
            <h2 style={styles.siteName}>{site.name}</h2>
            <span style={styles.siteInfo}>
              {site.elevation}m • {site.exposure} • {site.valley}
            </span>
          </div>

          {loading && (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Caricamento meteo...</p>
            </div>
          )}

          {error && (
            <div style={styles.errorContainer}>
              <p style={styles.errorText}>{error}</p>
              <button style={styles.retryButton} onClick={() => window.location.reload()}>
                Riprova
              </button>
            </div>
          )}

          {meteo && scores && (
            <div style={styles.meteoContainer}>
              {/* SCORE PRINCIPALE */}
              <div style={{...styles.scoreBox, borderColor: getScoreColor(totalScore)}}>
                <div style={styles.scoreMain}>
                  <div style={styles.scoreNumber}>{totalScore}</div>
                  <div style={styles.scoreLabel}>{getScoreLabel(totalScore)}</div>
                </div>
                <div style={styles.scoreDetails}>
                  <div style={styles.scoreDetail}>
                    <span>💨 Vento</span>
                    <span style={{color: getScoreColor(scores.wind)}}>{scores.wind}/5</span>
                  </div>
                  <div style={styles.scoreDetail}>
                    <span>🔥 Termica</span>
                    <span style={{color: getScoreColor(scores.thermal)}}>{scores.thermal}/5</span>
                  </div>
                  <div style={styles.scoreDetail}>
                    <span>☁️ Nuvolosità</span>
                    <span style={{color: getScoreColor(scores.cloud)}}>{scores.cloud}/5</span>
                  </div>
                </div>
              </div>

              {/* METEO DETTAGLIATO */}
              <div style={styles.meteoGrid}>
                <div style={styles.meteoCard}>
                  <div style={styles.meteoLabel}>🌡️ Temperatura</div>
                  <div style={styles.meteoValue}>{meteo.temperature}°C</div>
                  <div style={styles.meteoSub}>Delta termico: {meteo.thermalDelta}°C</div>
                </div>
                <div style={styles.meteoCard}>
                  <div style={styles.meteoLabel}>💧 Umidità</div>
                  <div style={styles.meteoValue}>{meteo.humidity}%</div>
                  <div style={styles.meteoSub}>Punto di rugiada: {meteo.dewPoint}°C</div>
                </div>
                <div style={styles.meteoCard}>
                  <div style={styles.meteoLabel}>☁️ Nuvolosità</div>
                  <div style={styles.meteoValue}>{meteo.cloudCover}%</div>
                  <div style={styles.meteoSub}>
                    <span style={{color: meteo.cloudCover < 40 ? '#4caf50' : meteo.cloudCover < 70 ? '#ff9800' : '#f44336'}}>
                      {meteo.cloudCover < 40 ? 'Buona visibilità' : meteo.cloudCover < 70 ? 'Nuvolosità moderata' : 'Cielo coperto'}
                    </span>
                  </div>
                </div>
                <div style={styles.meteoCard}>
                  <div style={styles.meteoLabel}>💨 Vento</div>
                  <div style={styles.meteoValue}>{meteo.windSurface} km/h</div>
                  <div style={styles.meteoSub}>
                    {getWindDirection(meteo.windDir)} • Raffiche: {meteo.windGust} km/h
                    {windFavorable && <span style={{color: '#4caf50', marginLeft: 8}}>✅ Favorevole</span>}
                  </div>
                </div>
                <div style={styles.meteoCard}>
                  <div style={styles.meteoLabel}>🌧️ Precipitazioni</div>
                  <div style={styles.meteoValue}>
                    {meteo.precipitation === 0 ? 'Assenti' : `${meteo.precipitation} mm/h`}
                  </div>
                  <div style={styles.meteoSub}>
                    {meteo.precipitation === 0 ? '✅ Ideale per volare' : '⚠️ Possibili piogge'}
                  </div>
                </div>
                <div style={styles.meteoCard}>
                  <div style={styles.meteoLabel}>👁️ Visibilità</div>
                  <div style={styles.meteoValue}>{meteo.visibilityKm} km</div>
                  <div style={styles.meteoSub}>
                    {meteo.visibilityKm > 15 ? 'Ottima' : meteo.visibilityKm > 8 ? 'Buona' : 'Limitata'}
                  </div>
                </div>
              </div>

              {/* PLAFOND E CONSIGLI */}
              <div style={styles.advancedInfo}>
                <div style={styles.plafondBox}>
                  <h3 style={styles.adviceTitle}>📊 Plafond stimato</h3>
                  <div style={styles.plafondVisual}>
                    <div style={styles.plafondBarContainer}>
                      <div style={{
                        ...styles.plafondBar,
                        height: `${Math.min(100, (site.elevation + 1500) / 3000 * 100)}%`,
                        background: `linear-gradient(to top, #4fc3f7, #00e676)`
                      }}></div>
                    </div>
                    <div style={styles.plafondInfo}>
                      <div style={styles.plafondValue}>{site.elevation + 1500} m</div>
                      <div style={styles.plafondLabel}>Quota massima raggiungibile</div>
                      <div style={styles.plafondSub}>Base decollo: {site.elevation}m</div>
                    </div>
                  </div>
                </div>

                <div style={styles.adviceBox}>
                  <h3 style={styles.adviceTitle}>💡 Consigli per il volo</h3>
                  <ul style={styles.adviceList}>
                    {totalScore >= 4 && (
                      <li style={styles.adviceItem}>✅ Condizioni eccellenti per volare!</li>
                    )}
                    {totalScore === 3 && (
                      <li style={styles.adviceItem}>⚠️ Condizioni discrete, valutare attentamente</li>
                    )}
                    {totalScore <= 2 && (
                      <li style={styles.adviceItem}>❌ Condizioni difficili, sconsigliato volare</li>
                    )}
                    {meteo.windSurface > 25 && (
                      <li style={styles.adviceItem}>⚠️ Vento forte ({meteo.windSurface} km/h), attenzione</li>
                    )}
                    {meteo.windSurface < 8 && (
                      <li style={styles.adviceItem}>ℹ️ Vento debole, possibili difficoltà di decollo</li>
                    )}
                    {meteo.cloudCover < 30 && meteo.thermalDelta > 10 && (
                      <li style={styles.adviceItem}>🔥 Buona attività termica, ideale per cross country</li>
                    )}
                    {site.difficulty >= 4 && (
                      <li style={styles.adviceItem}>⚠️ Sito difficile, richiesta esperienza avanzata</li>
                    )}
                    {windFavorable && meteo.windSurface >= 8 && meteo.windSurface <= 20 && (
                      <li style={styles.adviceItem}>✅ Vento favorevole all'orientamento del sito</li>
                    )}
                    {!windFavorable && (
                      <li style={styles.adviceItem}>⚠️ Vento non favorevole, potrebbe causare turbolenze</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================
   STILI INLINE MIGLIORATI
   ============================ */

const styles = {
  app: {
    background: "linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%)",
    color: "#eee",
    minHeight: "100vh",
    padding: 20,
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
    padding: "20px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: 5,
    background: "linear-gradient(135deg, #4fc3f7, #00e676)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 800,
  },
  subtitle: {
    fontSize: "1rem",
    color: "#888",
    WebkitTextFillColor: "#888",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: 20,
    maxWidth: "1400px",
    margin: "0 auto",
  },
  left: {
    background: "rgba(255,255,255,0.05)",
    padding: 15,
    borderRadius: 15,
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    height: "calc(100vh - 200px)",
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    marginBottom: 15,
    color: "#4fc3f7",
    fontWeight: 600,
  },
  cardList: {
    overflowY: "auto",
    height: "calc(100% - 50px)",
    paddingRight: 5,
  },
  right: {
    background: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 15,
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  card: {
    background: "#222",
    border: "2px solid #333",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "all 0.3s ease",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  cardDetails: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardSmall: {
    fontSize: "0.8rem",
    color: "#aaa",
  },
  cardBadges: {
    display: "flex",
    gap: 5,
    marginTop: 4,
  },
  badge: {
    fontSize: "0.7rem",
    padding: "2px 8px",
    borderRadius: 12,
    color: "#fff",
    fontWeight: 600,
  },
  siteHeader: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  siteName: {
    fontSize: "1.8rem",
    marginBottom: 5,
    color: "#fff",
  },
  siteInfo: {
    fontSize: "0.9rem",
    color: "#aaa",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid rgba(255,255,255,0.1)",
    borderTopColor: "#4fc3f7",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: 15,
    color: "#aaa",
  },
  errorContainer: {
    textAlign: "center",
    padding: 40,
  },
  errorText: {
    color: "#ff1744",
    marginBottom: 15,
  },
  retryButton: {
    background: "#4fc3f7",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  meteoContainer: {
    animation: "fadeIn 0.5s ease",
  },
  scoreBox: {
    border: "3px solid",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    textAlign: "center",
    background: "rgba(0,0,0,0.3)",
  },
  scoreMain: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    marginBottom: 10,
  },
  scoreNumber: {
    fontSize: "3rem",
    fontWeight: "bold",
    color: "#fff",
  },
  scoreLabel: {
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#fff",
  },
  scoreDetails: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    flexWrap: "wrap",
  },
  scoreDetail: {
    display: "flex",
    gap: 8,
    fontSize: "0.9rem",
    color: "#ccc",
  },
  meteoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 15,
    marginBottom: 20,
  },
  meteoCard: {
    background: "rgba(0,0,0,0.3)",
    padding: 15,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  meteoLabel: {
    fontSize: "0.9rem",
    color: "#aaa",
    marginBottom: 8,
  },
  meteoValue: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  meteoSub: {
    fontSize: "0.8rem",
    color: "#888",
  },
  advancedInfo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginTop: 20,
  },
  plafondBox: {
    background: "rgba(0,0,0,0.3)",
    padding: 15,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  plafondVisual: {
    display: "flex",
    gap: 20,
    alignItems: "center",
    height: 150,
  },
  plafondBarContainer: {
    width: 30,
    height: "100%",
    background: "rgba(255,255,255,0.1)",
    borderRadius: 15,
    position: "relative",
    overflow: "hidden",
  },
  plafondBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderRadius: 15,
    transition: "height 1s ease",
  },
  plafondInfo: {
    flex: 1,
  },
  plafondValue: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#fff",
  },
  plafondLabel: {
    fontSize: "0.9rem",
    color: "#aaa",
    marginTop: 4,
  },
  plafondSub: {
    fontSize: "0.8rem",
    color: "#666",
    marginTop: 2,
  },
  adviceBox: {
    background: "rgba(0,0,0,0.3)",
    padding: 15,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
  },
  adviceTitle: {
    fontSize: "1rem",
    color: "#4fc3f7",
    marginBottom: 10,
  },
  adviceList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  adviceItem: {
    fontSize: "0.9rem",
    color: "#ddd",
    padding: "4px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
};

/* Aggiungi CSS per animazioni */
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    borderRadius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.3);
  }
`;
document.head.appendChild(styleSheet);