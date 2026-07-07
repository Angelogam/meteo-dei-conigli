import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard shortcut
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
        relative rounded-xl border transition-all duration-300
        ${focused
          ? "border-[#00FF8C]/30 bg-[#181818] shadow-[0_0_20px_rgba(0,255,140,0.04)]"
          : "border-white/[0.06] bg-[#121212]"
        }
      `}
    >
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Cerca decollo..."
        className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/40 py-3 pl-9 pr-8 outline-none"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
        >
          <X size={15} />
        </button>
      )}
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/30 font-mono border border-white/[0.08] rounded px-1.5 py-0.5 hidden sm:block">
        ⌘K
      </kbd>
    </div>
  );
}
