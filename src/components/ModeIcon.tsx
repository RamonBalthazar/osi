import type { Mode } from "../data/lines";
import { NationalRailLogo } from "./NationalRailLogo";
import { Roundel } from "./Roundel";
import styles from "./StationLines.module.css";

export function ModeIcon({ mode }: { mode: Mode }) {
  return mode === "national-rail" ? (
    <NationalRailLogo className={`${styles.icon} ${styles.square}`} />
  ) : (
    <Roundel type={mode} className={styles.icon} />
  );
}
