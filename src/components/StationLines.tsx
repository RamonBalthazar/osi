import { stationLines } from "../data/lines";
import { ModeIcon } from "./ModeIcon";
import styles from "./StationLines.module.css";

// Mode logos and coloured line names for a station.
export function StationLines({ name, compact = false }: { name: string; compact?: boolean }) {
  const { modes, lines } = stationLines(name);
  if (modes.length === 0) return null;
  return (
    <span className={compact ? `${styles.root} ${styles.compact}` : styles.root}>
      <span className={styles.modes}>
        {modes.map((mode) => (
          <ModeIcon key={mode} mode={mode} />
        ))}
      </span>
      {lines.map((line) => (
        <span
          key={line.name}
          className={styles.line}
          style={{ background: line.colour, color: line.text }}
        >
          {line.name}
        </span>
      ))}
    </span>
  );
}
