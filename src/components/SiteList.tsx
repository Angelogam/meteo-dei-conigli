import type { LaunchSite } from "@/data/launchSites";

interface SiteListProps {
  sites: LaunchSite[];
  selected: string;
  onSelect: (id: string) => void;
}

export function SiteList({ sites, selected, onSelect }: SiteListProps) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 15,
      border: "1px solid rgba(255,255,255,0.1)", height: "calc(100vh - 200px)", overflow: "hidden"
    }}>
      <h2 style={{ fontSize: "1.1rem", marginBottom: 15, color: "#ff6b6b", fontWeight: 600 }}>📍 Decolli</h2>
      <div style={{ overflowY: "auto", height: "calc(100% - 50px)", paddingRight: 5 }}>
        {sites.map((d) => (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
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
  );
}