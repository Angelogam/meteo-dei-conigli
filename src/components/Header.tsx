"use client";

import { Wind } from "lucide-react";

interface HeaderProps {
  siteCount: number;
}

export function Header({ siteCount }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00FF8C]/10 flex items-center justify-center">
          <Wind size={22} className="text-[#00FF8C]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Meteo Decolli</h1>
          <p className="text-xs text-white/40">Previsioni per il volo libero</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-lg bg-[#181818] border border-[#252525]">
          <span className="text-xs text-white/50">
            <strong className="text-[#00FF8C]">{siteCount}</strong> decolli
          </span>
        </div>
      </div>
    </header>
  );
}