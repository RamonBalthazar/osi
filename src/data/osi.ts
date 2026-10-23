import data from "./osi.json";

export interface Connection {
  station: string;
  minutes: number | null;
  extra: Record<string, string>;
}

export interface Station {
  name: string;
  key: string;
  connections: Connection[];
}

interface RawInterchange {
  from: string;
  to: string;
  minutes: number | null;
  extra: Record<string, string>;
}

export const source: string = data.source;
export const generatedAt: string | null = data.generatedAt;

// Normalises names so "King's Cross St. Pancras" matches "kings cross st pancras".
export function normalise(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildStations(interchanges: RawInterchange[]): Map<string, Station> {
  const stations = new Map<string, Station>();
  const getStation = (name: string) => {
    const key = normalise(name);
    let station = stations.get(key);
    if (!station) {
      station = { name, key, connections: [] };
      stations.set(key, station);
    }
    return station;
  };
  const link = (a: string, b: string, minutes: number | null, extra: Record<string, string>) => {
    const station = getStation(a);
    const otherKey = normalise(b);
    const existing = station.connections.find((c) => normalise(c.station) === otherKey);
    if (!existing) {
      station.connections.push({ station: getStation(b).name, minutes, extra });
    } else if (minutes != null && (existing.minutes == null || minutes > existing.minutes)) {
      // If the sheet lists a pair twice with different limits, show the more generous one.
      existing.minutes = minutes;
    }
  };
  for (const { from, to, minutes, extra } of interchanges) {
    // OSIs work in both directions.
    link(from, to, minutes, extra);
    link(to, from, minutes, extra);
  }
  for (const station of stations.values()) {
    station.connections.sort((a, b) => a.station.localeCompare(b.station));
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
