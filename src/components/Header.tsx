import { CloudSun, Info } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="relative mb-8 md:mb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icona glow */}
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#00FF8C] to-[#00CC70] flex items-center justify-center shadow-lg shadow-[#00FF8C]/20">
              <CloudSun size={22} className="text-black" />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-[#00FF8C]/20 blur-lg animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Sky<span className="text-[#00FF8C]">Wise</span>
            </h1>
            <p className="text-[11px] md:text-xs text-white/30 font-medium tracking-wide">
              Previsioni meteo per il volo libero
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="relative group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-colors">
            <Info size={15} className="text-white/40 group-hover:text-white/70 transition-colors" />
          </div>
        </button>
      </div>

      {/* Info panel esplicativo */}
      {showInfo && (
        <div className="mt-4 p-4 rounded-xl bg-[#0D0D0D] border border-white/[0.06] animate-fadeIn">
          <p className="text-xs md:text-sm text-white/60 leading-relaxed">
            <strong className="text-white/80">Come leggere i punteggi:</strong> Ogni decollo ha un punteggio da 1 a 5 che
            indica la qualità complessiva delle condizioni. <strong style={{ color: "#00FF8C" }}>5</strong> = condizioni
            perfette, <strong style={{ color: "#4DA3FF" }}>4</strong> = buone, <strong style={{ color: "#FFC857" }}>3</strong> = medie,
            <strong style={{ color: "#FF9F1C" }}> 2</strong> = scarse, <strong style={{ color: "#FF4E4E" }}>1</strong> = non volabile.
            Espandi ogni decollo per vedere i dettagli ora per ora.
          </p>
        </div>
      )}
    </header>
  );
}