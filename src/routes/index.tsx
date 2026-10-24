import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { StationSearch } from "../components/StationSearch";
import { dataAsOf, findStation, source, stationList, type Connection } from "../data/osi";

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
        <StationSearch
          label="Station"
          placeholder="e.g. Bank, Hammersmith"
          value={fromStation?.name ?? ""}
          onSelect={(station) => navigate({ search: { from: station?.name }, replace: !station })}
        />
      )}

      {from && !fromStation && (
        <p className="notice">No station called “{from}” has an out-of-station interchange.</p>
      )}

      {fromStation && (
        <section className="results" aria-live="polite">
          <h2>
            {fromStation.name}
            <span className="count">
              {count} interchange{count === 1 ? "" : "s"}
            </span>
          </h2>
          <ul className="connections">
            {fromStation.connections.map((connection, i) => (
              <ConnectionCard key={i} from={fromStation.name} connection={connection} />
            ))}
          </ul>
        </section>
      )}

      <footer>
        Data: <a href={source}>TfL out-of-station interchanges</a>
        {dataAsOf && <>, up to {new Date(dataAsOf).toLocaleDateString("en-GB")}</>}. Station names
        are expanded from TfL's abbreviations. Always check before you travel.
      </footer>
    </main>
  );
}

function ConnectionCard({ from, connection }: { from: string; connection: Connection }) {
  const { station, minutesOut, minutesBack, magneticMinutes, ticketTypes, between } = connection;
  return (
    <li className="connection">
      <div className="connection-main">
        {station ? (
          <Link to="/" search={{ from: station }} className="station-link">
            {station}
          </Link>
        ) : (
          <span className="station-same">Within {from}</span>
        )}
        {between && <p className="between">{between}</p>}
        <p className="tags">
          <span className="tag">{ticketTypes}</span>
          {magneticMinutes != null && (
            <span className="tag">Paper tickets: {magneticMinutes} min</span>
          )}
          {station && minutesBack !== minutesOut && (
            <span className="tag">Other way: {minutesBack} min</span>
          )}
        </p>
      </div>
      <div
        className="limit"
        title={
          station ? `Touch in at ${station} within this time` : "Time allowed between gatelines"
        }
      >
        <span className="limit-value">{minutesOut}</span>
        <span className="limit-unit">min</span>
      </div>
    </li>
  );
}
