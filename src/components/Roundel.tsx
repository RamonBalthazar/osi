export type RoundelType = "underground" | "overground" | "dlr" | "elizabeth";

// Ring colours from the Wikimedia Commons "(no text)" roundels; the bar is always TfL blue.
const RING: Record<RoundelType, string> = {
  underground: "#E1251B",
  overground: "#EE7623",
  dlr: "#00AFAA",
  elizabeth: "#6950A1",
};

const LABELS: Record<RoundelType, string> = {
  underground: "Underground",
  overground: "Overground",
  dlr: "DLR",
  elizabeth: "Elizabeth line",
};

// TfL roundel without text. Geometry from Wikimedia Commons' "Underground (no text).svg".
export function Roundel({ type, className }: { type: RoundelType; className?: string }) {
  const label = LABELS[type];
  return (
    <svg viewBox="0 0 500 406.289" className={className} role="img" aria-label={label}>
      <title>{label}</title>
      <path
        fill={RING[type]}
        d="M381.468,203.13c0,72.383-58.715,131.08-131.098,131.08c-72.401,0-131.068-58.697-131.068-131.08c0-72.371,58.668-131.05,131.068-131.05C322.753,72.079,381.468,130.759,381.468,203.13 M250.37,0C138.162,0,47.211,90.951,47.211,203.13C47.211,315.332,138.162,406.289,250.37,406.289c112.184,0,203.13-90.957,203.13-203.159C453.5,90.951,362.554,0,250.37,0"
      />
      <rect y="162.121" width="500" height="82.173" fill="#000F9F" />
    </svg>
  );
}
