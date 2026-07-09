"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, CloudSun, Wind, Thermometer, Droplets, Gauge, AlertTriangle, ThumbsUp, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fetchWeatherData,
  getWeatherDescription,
  getWeatherIcon,
  type WeatherData,
} from "@/lib/meteo";
import { getWindCondition } from "@/lib/volo";
import type { Metadata } from "@/lib/volo";

interface AnalisiMeteoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metadata?: Metadata;
}

export default function AnalisiMeteoDialog({ open, onOpenChange, metadata }: AnalisiMeteoDialogProps) {
  const [lat, setLat] = useState(metadata?.lat?.toString() ?? "45.52");
  const [lon, setLon] = useState(metadata?.lon?.toString() ?? "11.72");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const caricaMeteo = useCallback(async () => {
    setLoading(true);
    setError("");
    setWeather(null);
    try {
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
      if (isNaN(latNum) || isNaN(lonNum)) {
        setError("Inserisci latitudine e longitudine valide.");
        setLoading(false);
        return;
      }
      const data = await fetchWeatherData(latNum, lonNum);
      setWeather(data);
    } catch (e: any) {
      setError(e.message ?? "Errore nel recupero meteo");
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    if (open) caricaMeteo();
  }, [open, caricaMeteo]);

  const icon = weather ? getWeatherIcon(weather.weatherCode) : "☀️";
  const desc = weather ? getWeatherDescription(weather.weatherCode) : "";
  const ventoCond = weather ? getWindCondition(weather.windSpeed) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CloudSun className="h-6 w-6 text-amber-500" />
            Analisi Meteo per Volo Libero
          </DialogTitle>
          <DialogDescription>
            Dati meteo in tempo reale da Open-Meteo per valutare le condizioni di volo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Coordinate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lat">Latitudine</Label>
              <Input
                id="lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="es. 45.52"
              />
            </div>
            <div>
              <Label htmlFor="lon">Longitudine</Label>
              <Input
                id="lon"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="es. 11.72"
              />
            </div>
          </div>

          <Button onClick={caricaMeteo} disabled={loading} className="w-full gap-2">
            <MapPin className="h-4 w-4" />
            {loading ? "Caricamento..." : "Carica Meteo"}
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Dati meteo reali */}
          {weather && (
            <>
              <Card className="bg-gradient-to-br from-blue-50 to-sky-100 border-sky-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{icon}</span>
                    <span className="text-2xl font-bold">{weather.temperature}°C</span>
                  </div>
                  <p className="text-sm text-sky-800 mt-1 font-medium">{desc}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border shadow-sm">
                  <Wind className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Vento</p>
                    <p className="font-semibold">{weather.windSpeed} km/h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border shadow-sm">
                  <Wind className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Raffiche</p>
                    <p className="font-semibold">{weather.windGusts} km/h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border shadow-sm">
                  <Droplets className="h-5 w-5 text-cyan-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Umidità</p>
                    <p className="font-semibold">{weather.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border shadow-sm">
                  <Gauge className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pressione</p>
                    <p className="font-semibold">{weather.pressure} hPa</p>
                  </div>
                </div>
              </div>

              {/* Analisi condizioni volo */}
              <div className="bg-white border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-sm">
                  <Info className="h-4 w-4 text-blue-600" />
                  Analisi per il Volo Libero
                </h4>

                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <span className="text-sm">
                    Temperatura: <strong>{weather.temperature}°C</strong>
                    {weather.temperature > 25
                      ? " — Buona per termica, possibili nuvole cumuliformi."
                      : weather.temperature > 15
                      ? " — Condizioni moderate per termica."
                      : " — Termica debole, meglio cercare vento dinamico."}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    Vento: <strong>{weather.windSpeed} km/h</strong>
                    {ventoCond && (
                      <Badge
                        variant={
                          ventoCond.type === "buono"
                            ? "default"
                            : ventoCond.type === "attenzione"
                            ? "secondary"
                            : "destructive"
                        }
                        className="ml-2 text-xs"
                      >
                        {ventoCond.label}
                      </Badge>
                    )}
                  </span>
                </div>

                {weather.windGusts > 20 && (
                  <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-2 rounded text-sm">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      Raffiche fino a <strong>{weather.windGusts} km/h</strong>. Prestare attenzione in decollo e atterraggio.
                    </span>
                  </div>
                )}

                {weather.precipitation > 0 && (
                  <div className="flex items-start gap-2 text-red-700 bg-red-50 p-2 rounded text-sm">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      Precipitazioni in corso ({weather.precipitation} mm). Sconsigliato il volo.
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded text-sm mt-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>
                    {weather.precipitation > 0
                      ? "Condizioni non favorevoli al volo libero a causa della pioggia."
                      : weather.windSpeed < 5
                      ? "Vento debole — poco sfruttabile per volo dinamico."
                      : weather.windSpeed < 20
                      ? "Condizioni favorevoli per il volo libero."
                      : "Vento forte — volo consigliato solo a piloti esperti."}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
</｜｜DSML｜｜tool_calls>Ok, ho capito — vuoi che la **finestra di analisi AI** usi **dati meteo reali da Open-Meteo** invece della logica inventata. Niente DeepSeek, solo Open-Meteo per avere previsioni reali.

Attualmente l'app fa già chiamate a Open-Meteo nell'`useEffect` principale. Il problema è che la sezione "Analisi AI della Giornata" usa una logica inline basata sui dati scaricati — il che è **già corretto**, perché quei dati vengono da Open-Meteo.

Quindi **cosa manca esattamente**? Cosa intendi per "collega lap a data meteo"?

- Vuoi aggiungere un pulsante / link per visualizzare i dati meteo in una **finestra a parte** (dialog/modal)?
- Vuoi che l'analisi AI sia più dettagliata e leggibile, magari in un componente separato?
- Vuoi che la posizione del decollo venga automaticamente passata alla chiamata meteo?

Dimmi cosa vorresti vedere di diverso rispetto a ora!Hai capito — continuo ad aggiungere il componente di analisi meteo. Ho già creato il file `src/lib/volo.ts` per supportare `getWindCondition` e `Metadata`. Ora lo creo:

<dyad-write path="src/lib/volo.ts" description="Utility per condizioni di volo libero">
"use client";

export interface Metadata {
  lat?: number;
  lon?: number;
  name?: string;
  altitude?: number;
}

export function getWindCondition(windSpeed: number): {
  label: string;
  type: "buono" | "attenzione" | "pericoloso";
} {
  if (windSpeed < 5) return { label: "Vento debole", type: "attenzione" };
  if (windSpeed <= 18) return { label: "Vento ideale", type: "buono" };
  if (windSpeed <= 25) return { label: "Vento forte", type: "attenzione" };
  return { label: "Vento pericoloso", type: "pericoloso" };
}