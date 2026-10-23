// Downloads TfL's out-of-station interchange (OSI) spreadsheet and converts it
// to src/data/osi.json. Pass a local path to skip the download:
//   npm run data -- ./out-of-station-interchanges.xlsx
import { readFile, writeFile } from "node:fs/promises";
import ExcelJS from "exceljs";
import { displayName } from "./station-names.ts";

const SOURCE_URL = "https://tfl.gov.uk/cdn/static/cms/documents/out-of-station-interchanges.xlsx";
const OUT_FILE = new URL("../src/data/osi.json", import.meta.url);

// Column headers in TfL's sheet. The script fails if any are missing.
const COLUMNS = {
  aCode: "Station_A",
  aName: "Station_A_Name",
  bCode: "Station_B",
  bName: "Station_B_Name",
  timeAB: "InterchangeTimeAB",
  timeBA: "InterchangeTimeBA",
  magneticTime: "SameNLCMagneticTime",
  type: "Type",
  between: "Interchange between",
} as const;

// Station_B is 0 when the interchange is between gatelines of the same station.
const SAME_STATION_CODE = 0;

interface StationRef {
  nlc: number;
  name: string;
  sheetName: string;
}

interface Interchange {
  a: StationRef;
  b: StationRef | null;
  minutesAToB: number;
  minutesBToA: number;
  magneticMinutes: number | null;
  ticketTypes: string;
  between: string | null;
}

async function loadWorkbook(path: string | undefined): Promise<ExcelJS.Workbook> {
  let buffer: ArrayBuffer;
  if (path) {
    const file = await readFile(path);
    buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
  } else {
    console.log(`Downloading ${SOURCE_URL}`);
    const res = await fetch(SOURCE_URL);
    if (!res.ok || res.headers.get("content-type")?.includes("text/html")) {
      // TfL's CDN sits behind a Cloudflare challenge that rejects many cloud/CI IPs.
      throw new Error(
        `Download failed: ${res.status} ${res.statusText}. If TfL is blocking this machine, ` +
          "download the file in a browser and run: npm run data -- path/to/file.xlsx",
      );
    }
    buffer = await res.arrayBuffer();
  }
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
}

function cellText(cell: ExcelJS.Cell): string {
  const { value } = cell;
  if (value == null) return "";
  if (typeof value === "object") {
    if ("richText" in value)
      return value.richText
        .map((part) => part.text)
        .join("")
        .trim();
    if ("result" in value) return String(value.result ?? "").trim();
    if ("text" in value) return String(value.text).trim();
  }
  return String(value).trim();
}

function cellNumber(cell: ExcelJS.Cell, label: string): number {
  const n = Number(cellText(cell));
  if (!Number.isFinite(n)) throw new Error(`Row ${cell.row}: ${label} is not a number`);
  return n;
}

// "Payg Only" and "PAYG only" both appear; normalise the casing.
function ticketTypes(text: string): string {
  const lower = text.toLowerCase();
  return (lower.charAt(0).toUpperCase() + lower.slice(1)).replace(/\bpayg\b/gi, "PAYG");
}

function findHeaderRow(sheet: ExcelJS.Worksheet): Map<string, number> {
  for (let r = 1; r <= Math.min(sheet.rowCount, 20); r++) {
    const headers = new Map<string, number>();
    sheet.getRow(r).eachCell((cell, c) => headers.set(cellText(cell), c));
    if (headers.has(COLUMNS.aCode) && headers.has(COLUMNS.timeAB)) {
      const missing = Object.values(COLUMNS).filter((name) => !headers.has(name));
      if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}`);
      headers.set("__row", r);
      return headers;
    }
  }
  throw new Error(`No header row with "${COLUMNS.aCode}" found; the sheet layout has changed.`);
}

// e.g. "Data up to 01/03/2026" in the title row -> "2026-03-01".
function findDataDate(sheet: ExcelJS.Worksheet): string | null {
  for (let r = 1; r <= 2; r++) {
    for (const value of sheet.getRow(r).values as unknown[]) {
      if (value instanceof Date) return value.toISOString().slice(0, 10);
      const match = /(\d{2})\/(\d{2})\/(\d{4})/.exec(String(value ?? ""));
      if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    }
  }
  return null;
}

async function main() {
  const workbook = await loadWorkbook(process.argv[2]);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("The workbook has no sheets.");
  const headers = findHeaderRow(sheet);
  const col = (key: keyof typeof COLUMNS) => headers.get(COLUMNS[key])!;

  const rows: Array<{ row: ExcelJS.Row; aCode: number; bCode: number }> = [];
  // One code can be spelled several ways ("Oxford Circ", "Oxford Circus"); keep the longest.
  const sheetNames = new Map<number, string>();
  const noteName = (code: number, name: string) => {
    if (code !== SAME_STATION_CODE && name.length > (sheetNames.get(code)?.length ?? 0)) {
      sheetNames.set(code, name);
    }
  };
  for (let r = headers.get("__row")! + 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    if (!cellText(row.getCell(col("aCode")))) continue;
    const aCode = cellNumber(row.getCell(col("aCode")), COLUMNS.aCode);
    const bCode = cellNumber(row.getCell(col("bCode")), COLUMNS.bCode);
    noteName(aCode, cellText(row.getCell(col("aName"))));
    noteName(bCode, cellText(row.getCell(col("bName"))));
    rows.push({ row, aCode, bCode });
  }

  const station = (nlc: number): StationRef => {
    const sheetName = sheetNames.get(nlc)!;
    return { nlc, name: displayName(sheetName), sheetName };
  };
  const interchanges: Interchange[] = rows.map(({ row, aCode, bCode }) => {
    const magnetic = cellNumber(row.getCell(col("magneticTime")), COLUMNS.magneticTime);
    return {
      a: station(aCode),
      b: bCode === SAME_STATION_CODE ? null : station(bCode),
      minutesAToB: cellNumber(row.getCell(col("timeAB")), COLUMNS.timeAB),
      minutesBToA: cellNumber(row.getCell(col("timeBA")), COLUMNS.timeBA),
      magneticMinutes: magnetic > 0 ? magnetic : null,
      ticketTypes: ticketTypes(cellText(row.getCell(col("type")))),
      between: cellText(row.getCell(col("between"))) || null,
    };
  });

  if (interchanges.length === 0) throw new Error("No interchanges found in the sheet.");

  const generated = {
    source: SOURCE_URL,
    dataAsOf: findDataDate(sheet),
    interchanges,
  };
  await writeFile(OUT_FILE, `${JSON.stringify(generated, null, 2)}\n`);
  console.log(`Wrote ${interchanges.length} interchanges to ${OUT_FILE.pathname}`);
}

await main();
