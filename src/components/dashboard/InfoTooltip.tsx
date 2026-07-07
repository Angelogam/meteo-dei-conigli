import { Info } from "lucide-react";
import { useState } from "react";

interface InfoTooltipProps {
  text: string;
  title?: string;
}

export function InfoTooltip({ text, title }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setOpen(false)}
        className="text-white/30 hover:text-[#00FF8C]/70 transition-colors"
      >
        <Info size={13} />
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 z-50">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-3 shadow-2xl">
            {title && (
              <p className="text-[11px] font-semibold text-white/70 mb-1">{title}</p>
            )}
            <p className="text-[11px] text-white/50 leading-relaxed">{text}</p>
          </div>
        </div>
      )}
    </div>
  );
}