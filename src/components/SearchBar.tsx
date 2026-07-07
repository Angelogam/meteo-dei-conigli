import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div
      className={`
        relative rounded-2xl border transition-all duration-300
        ${focused
          ? "border-[#00FF8C]/20 bg-[#181818] shadow-[0_0_20px_rgba(0,255,140,0.03)]"
          : "border-white/[0.06] bg-[#121212]"
        }
      `}
    >
      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Cerca un decollo..."
        className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/35 py-3.5 pl-11 pr-10 outline-none"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
        >
          <X size={14} />
        </button>
      )}
      <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-white/25 font-mono border border-white/[0.06] rounded-md px-1.5 py-0.5 hidden sm:block">
        ⌘K
      </kbd>
    </div>
  );
}