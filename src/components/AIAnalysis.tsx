interface AIAnalysisProps {
  analysis: { general: string; thermal: string; wind: string; advice: string } | null;
}

export function AIAnalysis({ analysis }: AIAnalysisProps) {
  if (!analysis) return null;

  return (
    <div style={{
      marginBottom: 20, background: "rgba(0,0,0,0.3)", borderRadius: 12,
      border: "1px solid rgba(255,107,107,0.2)", overflow: "hidden"
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 15px",
        background: "rgba(255,107,107,0.1)", borderBottom: "1px solid rgba(255,107,107,0.2)"
      }}>
        <span style={{ fontSize: "1.5rem" }}>🤖</span>
        <h3 style={{ fontSize: "1rem", color: "#ff6b6b", margin: 0, fontWeight: 600 }}>Analisi AI della Giornata</h3>
      </div>
      <div style={{ padding: "15px" }}>
        <AISection title="📋 Panoramica" color="#4fc3f7" text={analysis.general} />
        <AISection title="🔥 Analisi Termiche" color="#4fc3f7" text={analysis.thermal} />
        <AISection title="💨 Analisi Vento" color="#4fc3f7" text={analysis.wind} />
        <AISection title="💡 Consigli per il Volo" color="#ffd93d" text={analysis.advice} />
      </div>
    </div>
  );
}

function AISection({ title, color, text }: { title: string; color: string; text: string }) {
  return (
    <div style={{ marginBottom: 12, padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
      <h4 style={{ fontSize: "0.95rem", color, marginBottom: 8, fontWeight: 600 }}>{title}</h4>
      <p style={{ fontSize: "0.85rem", color: "#ddd", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{text}</p>
    </div>
  );
}