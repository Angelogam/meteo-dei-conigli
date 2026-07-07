import { Wind, Search } from "lucide-react";

interface EmptyStateDashboardProps {
  searchQuery?: string;
}

export function EmptyStateDashboard({ searchQuery }: EmptyStateDashboardProps) {
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search size={40} className="text-white/15 mb-4" />
        <p className="text-base text-white/50">Nessun decollo trovato per "{searchQuery}"</p>
        <p className="text-sm text-white/30 mt-1">Prova a cercare un altro nome</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Wind size={40} className="text-white/15 mb-4" />
      <p className="text-base text-white/50">Nessun dato meteo disponibile</p>
      <p className="text-sm text-white/30 mt-1">Riprova più tardi o aggiorna i dati</p>
    </div>
  );
}