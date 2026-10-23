import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { StationSearch } from "../components/StationSearch";
import {
  findStation,
  generatedAt,
  normalise,
  source,
  stationList,
  type Connection,
} from "../data/osi";

interface Search {
  from?: string;
  to?: string;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    from: typeof search.from === "string" && search.from ? search.from : undefined,
    to: typeof search.to === "string" && search.to ? search.to : undefined,
  }),
  component: Home,
});

function Home() {
  const { from, to } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const fromStation = from ? findStation(from) : undefined;
  const toStation = to ? findStation(to) : undefined;
  const candidates = fromStation
    ? fromStation.connections.flatMap((c) => findStation(c.station) ?? [])
    : undefined;
  const shown = fromStation
    ? toStation
      ? fromStation.connections.filter((c) => normalise(c.station) === toStation.key)
      : fromStation.connections
    : [];

  return (
    <main>
      <header>
        <h1>Out-of-station interchanges</h1>
        <p className="lede">
          Some London stations let you leave the gateline, walk to a nearby station and carry on as
          one journey, as long as you touch in again within the time limit.
        </p>
      </header>

      {stationList.length === 0 ? (
        <p className="notice">
          No interchange data has been loaded yet. Run <code>npm run data</code> to download TfL's
          spreadsheet.
        </p>
      ) : (
        <section className="searches" aria-label="Search">
          <StationSearch
            label="Station"
            placeholder="e.g. Bank, Hammersmith"
            value={fromStation?.name ?? ""}
            onSelect={(station) =>
              navigate({ search: { from: station?.name, to: undefined }, replace: !station })
            }
          />
          <StationSearch
            label="Interchange with (optional)"
            placeholder={fromStation ? "Filter its interchanges" : "Pick a station first"}
            value={toStation?.name ?? ""}
            candidates={candidates}
            onSelect={(station) =>
              navigate({ search: (prev) => ({ ...prev, to: station?.name }), replace: true })
            }
          />
        </section>
      )}

      {from && !fromStation && (
        <p className="notice">No station called “{from}” has an out-of-station interchange.</p>
      )}

      {fromStation && (
        <section className="results" aria-live="polite">
          <h2>
            {fromStation.name}
            <span className="count">
              {fromStation.connections.length} interchange
              {fromStation.connections.length === 1 ? "" : "s"}
            </span>
          </h2>
          {to && shown.length === 0 && (
            <p className="notice">
              There is no out-of-station interchange between {fromStation.name} and{" "}
              {toStation?.name ?? to}.
            </p>
          )}
          <ul className="connections">
            {shown.map((connection) => (
              <ConnectionCard key={connection.station} connection={connection} />
            ))}
          </ul>
        </section>
      )}

      <footer>
        Data: <a href={source}>TfL out-of-station interchanges</a>
        {generatedAt && <> · updated {new Date(generatedAt).toLocaleDateString("en-GB")}</>}. Always
        check before you travel.
      </footer>
    </main>
  );
}

function ConnectionCard({ connection }: { connection: Connection }) {
  const extras = Object.entries(connection.extra);
  return (
    <li className="connection">
      <div className="connection-main">
        <Link to="/" search={{ from: connection.station }} className="station-link">
          {connection.station}
        </Link>
        {extras.length > 0 && (
          <dl>
            {extras.map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="limit" title="Time allowed to touch in at the second station">
        {connection.minutes == null ? (
          <span className="limit-value">–</span>
        ) : (
          <>
            <span className="limit-value">{connection.minutes}</span>
            <span className="limit-unit">min</span>
          </>
        )}
      </div>
    </li>
  );
}
