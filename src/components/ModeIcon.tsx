import type { Mode } from "../data/lines";
import styles from "./StationLines.module.css";

const LABELS: Record<Mode, string> = {
  underground: "Underground",
  overground: "Overground",
  dlr: "DLR",
  elizabeth: "Elizabeth line",
  "national-rail": "National Rail",
};

// Ring colours of the TfL roundels; the bar is always TfL blue.
const RING: Record<Exclude<Mode, "national-rail">, string> = {
  underground: "#DC241F",
  overground: "#EE7C0E",
  dlr: "#00A4A7",
  elizabeth: "#6950A1",
};

// TfL roundel (bar-and-circle) and the National Rail double arrow. The arrow path is from
// Simple Icons (CC0), https://simpleicons.org/?q=national+rail
export function ModeIcon({ mode }: { mode: Mode }) {
  const label = LABELS[mode];
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} role="img" aria-label={label}>
      <title>{label}</title>
      {mode === "national-rail" ? (
        <>
          <circle cx="12" cy="12" r="12" fill="#E21836" />
          <path
            fill="#fff"
            d="m6.195 6.158 6.076 2.794H2.835v1.884h9.499l-4.616 2.246H2.835v1.868h4.883l5.778 2.795h4.333l-6.092-2.795h9.469v-1.868h-9.453l4.616-2.246h4.837V8.952h-4.868l-5.777-2.794H6.195"
          />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="7.875" fill="none" stroke={RING[mode]} strokeWidth="3.75" />
          <rect x="0" y="9.75" width="24" height="4.5" fill="#0019A8" />
        </>
      )}
    </svg>
  );
}
