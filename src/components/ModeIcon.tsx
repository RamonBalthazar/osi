import dlr from "../assets/dlr.svg";
import elizabeth from "../assets/elizabeth.svg";
import nationalRail from "../assets/national-rail.svg";
import overground from "../assets/overground.svg";
import underground from "../assets/underground.svg";
import type { Mode } from "../data/lines";
import styles from "./StationLines.module.css";

// Roundels without text and the National Rail double arrow, from Wikimedia Commons.
// The Elizabeth line roundel is the Underground one with a purple ring.
const ICONS: Record<Mode, { src: string; label: string }> = {
  underground: { src: underground, label: "Underground" },
  overground: { src: overground, label: "Overground" },
  dlr: { src: dlr, label: "DLR" },
  elizabeth: { src: elizabeth, label: "Elizabeth line" },
  "national-rail": { src: nationalRail, label: "National Rail" },
};

export function ModeIcon({ mode }: { mode: Mode }) {
  const { src, label } = ICONS[mode];
  return <img src={src} alt={label} title={label} className={styles.icon} />;
}
