import { Link } from "@tanstack/react-router";
import type { Connection } from "../data/osi";
import styles from "./ConnectionCard.module.css";
import { StationLines } from "./StationLines";

export function ConnectionCard({ from, connection }: { from: string; connection: Connection }) {
  const { station, minutesOut, minutesBack, magneticMinutes, ticketTypes, between } = connection;
  return (
    <li className={styles.card}>
      <div className={styles.main}>
        {station ? (
          <Link to="/" search={{ from: station }} className={styles.station}>
            {station}
          </Link>
        ) : (
          <span className={styles.station}>Within {from}</span>
        )}
        {station && (
          <div className={styles.lines}>
            <StationLines name={station} />
          </div>
        )}
        {between && <p className={styles.between}>{between}</p>}
        <p className={styles.tags}>
          <span className={styles.tag}>{ticketTypes}</span>
          {magneticMinutes != null && (
            <span className={styles.tag}>Paper tickets: {magneticMinutes} min</span>
          )}
          {station && minutesBack !== minutesOut && (
            <span className={styles.tag}>Other way: {minutesBack} min</span>
          )}
        </p>
      </div>
      <div
        className={styles.limit}
        title={
          station ? `Touch in at ${station} within this time` : "Time allowed between gatelines"
        }
      >
        <span className={styles.limitValue}>{minutesOut}</span>
        <span className={styles.limitUnit}>min</span>
      </div>
    </li>
  );
}
