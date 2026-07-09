interface HourSliderProps {
  value: number;
  onChange: (hour: number) => void;
}

export function HourSlider({ value, onChange }: HourSliderProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 15, marginBottom: 15,
      padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: 10
    }}>
      <label style={{ fontSize: "0.85rem", color: "#888" }}>⏰ Ora:</label>
      <input
        type="range" min="9" max="19" value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ flex: 1, accentColor: "#ff6b6b" }}
      />
      <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#fff", minWidth: 50 }}>
        {String(value).padStart(2, '0')}:00
      </span>
    </div>
  );
}