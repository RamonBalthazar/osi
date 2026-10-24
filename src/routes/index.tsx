import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ConnectionCard } from "../components/ConnectionCard";
import { StationSearch } from "../components/StationSearch";
import { dataAsOf, findStation, source, stationList } from "../data/osi";
import styles from "./index.module.css";

interface Search {
  from?: string;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    from: typeof search.from === "string" && search.from ? search.from : undefined,
  }),
  component: Home,
});

function Home() {
  const { from } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const fromStation = from ? findStation(from) : undefined;
  const count = fromStation?.connections.length ?? 0;

  return (
    <main className={styles.page}>
      <header>
        <h1 className={styles.title}>Out-of-station interchanges</h1>
        <p className={styles.lede}>
          Some London stations let you leave the gateline, walk to a nearby station and carry on as
          one journey, as long as you touch in again within the time limit.
        </p>
      </header>

      {stationList.length === 0 ? (
        <p className={styles.notice}>
          No interchange data has been loaded yet. Run <code>npm run data</code> to download TfL's
          spreadsheet.
        </p>
      ) : (
        <StationSearch
          label="Station"
          placeholder="e.g. Bank, Hammersmith"
          value={fromStation?.name ?? ""}
          onSelect={(station) => navigate({ search: { from: station?.name }, replace: !station })}
        />
      )}

      {from && !fromStation && (
        <p className={styles.notice}>
          No station called “{from}” has an out-of-station interchange.
        </p>
      )}

      {fromStation && (
        <section aria-live="polite">
          <h2 className={styles.heading}>
            {fromStation.name}
            <span className={styles.count}>
              {count} interchange{count === 1 ? "" : "s"}
            </span>
          </h2>
          <ul className={styles.connections}>
            {fromStation.connections.map((connection, i) => (
              <ConnectionCard key={i} from={fromStation.name} connection={connection} />
            ))}
          </ul>
        </section>
      )}

      <footer className={styles.footer}>
        Data: <a href={source}>TfL out-of-station interchanges</a>
        {dataAsOf && <>, up to {new Date(dataAsOf).toLocaleDateString("en-GB")}</>}. Station names
        are expanded from TfL's abbreviations. Always check before you travel.
      </footer>
    </main>
  );
}
