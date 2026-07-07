"use client";

import { Navigation, Wind } from "lucide-react";

interface HeaderProps {
  siteCount: number;
}

export function Header({ siteCount }: HeaderProps) {
  return (
    <header className="relative mb-8 animate-fade-in-up">
      {/* Background glow */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#00FF8C]/[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#4DA3FF]/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative flex items-center justify-between gap-4 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00FF8C]/20 to-[#00FF8C]/5 border border-[#00FF8C]/20 flex items-center justify-center animate-float">
            <Wind size={24} className="text-[#00FF8C]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Meteo Volo
            </h1>
            <p className="text-sm text-white/40 mt-0.5">
              Previsioni per parapendio e deltaplano · {siteCount} decolli monitorati
            </p>
          </div>
        </div>

        {/* Data */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <Navigation size={14} className="text-white/30" />
          <span className="text-sm text-white/50 font-mono">
            {new Date().toLocaleDateString("it-IT", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Decorative line */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </header>
  );
}