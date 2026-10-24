import nationalRail from "../assets/national-rail.svg";
import type { Mode } from "../data/lines";
import { Roundel } from "./Roundel";
import styles from "./StationLines.module.css";

// National Rail double arrow from Wikimedia Commons.
export function ModeIcon({ mode }: { mode: Mode }) {
  if (mode === "national-rail") {
    return (
      <img src={nationalRail} alt="National Rail" title="National Rail" className={styles.icon} />
    );
  }
  return <Roundel type={mode} className={styles.icon} />;
}
