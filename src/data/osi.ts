import data from "./osi.json";

export interface Connection {
  // null when the interchange is between gatelines of the same station.
  station: string | null;
  // Time allowed leaving this station and touching in at the other one.
  minutesOut: number;
  minutesBack: number;
  magneticMinutes: number | null;
  ticketTypes: string;
  between: string | null;
}

export interface Station {
  name: string;
  key: string;
  connections: Connection[];
}

interface StationRef {
  nlc: number;
  name: string;
}

interface RawInterchange {
  a: StationRef;
  b: StationRef | null;
  minutesAToB: number;
  minutesBToA: number;
  magneticMinutes: number | null;
  ticketTypes: string;
  between: string | null;
}

export const source: string = data.source;
export const dataAsOf: string | null = data.dataAsOf;

// Normalises names so "King's Cross St. Pancras" matches "kings cross st pancras".
export function normalise(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildStations(interchanges: RawInterchange[]): Map<string, Station> {
  // Stations are grouped by name: TfL lists some, like King's Cross, under several codes.
  const stations = new Map<string, Station>();
  const add = (name: string, connection: Connection) => {
    const key = normalise(name);
    let station = stations.get(key);
    if (!station) {
      station = { name, key, connections: [] };
      stations.set(key, station);
    }
    const id = JSON.stringify(connection);
    if (!station.connections.some((c) => JSON.stringify(c) === id)) {
      station.connections.push(connection);
    }
  };
  for (const {
    a,
    b,
    minutesAToB,
    minutesBToA,
    magneticMinutes,
    ticketTypes,
    between,
  } of interchanges) {
    const shared = { magneticMinutes, ticketTypes, between };
    add(a.name, {
      station: b?.name ?? null,
      minutesOut: minutesAToB,
      minutesBack: minutesBToA,
      ...shared,
    });
    if (b) {
      add(b.name, {
        station: a.name,
        minutesOut: minutesBToA,
        minutesBack: minutesAToB,
        ...shared,
      });
    }
  }
  for (const station of stations.values()) {
    // Same-station interchanges first, then alphabetical.
    station.connections.sort((x, y) =>
      x.station === null ? -1 : y.station === null ? 1 : x.station.localeCompare(y.station),
    );
  }
  return stations;
}

const stations = buildStations(data.interchanges as RawInterchange[]);

export const stationList: Station[] = [...stations.values()].toSorted((a, b) =>
  a.name.localeCompare(b.name),
);

export function findStation(name: string): Station | undefined {
  return stations.get(normalise(name));
}

export function searchStations(query: string, limit = 10): Station[] {
  const q = normalise(query);
  if (!q) return [];
  const scored: Array<{ station: Station; score: number }> = [];
  for (const station of stationList) {
    const words = station.key.split(" ");
    let score: number;
    if (station.key === q) score = 0;
    else if (station.key.startsWith(q)) score = 1;
    else if (words.some((w) => w.startsWith(q))) score = 2;
    else if (station.key.includes(q)) score = 3;
    else if (q.split(" ").every((part) => words.some((w) => w.startsWith(part)))) score = 4;
    else continue;
    scored.push({ station, score });
  }
  return scored
    .toSorted((a, b) => a.score - b.score || a.station.name.localeCompare(b.station.name))
    .slice(0, limit)
    .map((s) => s.station);
}
