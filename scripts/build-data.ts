// Downloads TfL's out-of-station interchange (OSI) spreadsheet and converts it
// to src/data/osi.json. Pass a local path to skip the download:
//   npm run data -- ./data/out-of-station-interchanges.xlsx
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import ExcelJS from "exceljs";

const SOURCE_URL = "https://tfl.gov.uk/cdn/static/cms/documents/out-of-station-interchanges.xlsx";
const OUT_FILE = new URL("../src/data/osi.json", import.meta.url);

interface Interchange {
  from: string;
  to: string;
  minutes: number | null;
  extra: Record<string, string>;
}

async function loadWorkbook(path: string | undefined): Promise<ExcelJS.Workbook> {
  let buffer: ArrayBuffer;
  if (path) {
    const file = await readFile(path);
    buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
  } else {
    console.log(`Downloading ${SOURCE_URL}`);
    const res = await fetch(SOURCE_URL);
    if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
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
    if (value instanceof Date) {
      // Excel durations such as 00:15 come through as dates on 1899-12-30.
      return String(value.getUTCHours() * 60 + value.getUTCMinutes());
    }
  }
  return String(value).trim();
}

function parseMinutes(text: string): number | null {
  const clock = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(text);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  const match = /\d+(\.\d+)?/.exec(text);
  return match ? Math.round(Number(match[0])) : null;
}

interface Columns {
  headerRow: number;
  headers: string[];
  from: number;
  to: number;
  minutes: number;
}

// The sheet layout isn't guaranteed, so locate the header row by its labels.
function findColumns(sheet: ExcelJS.Worksheet): Columns | null {
  for (let r = 1; r <= Math.min(sheet.rowCount, 30); r++) {
    const headers: string[] = [];
    sheet.getRow(r).eachCell({ includeEmpty: true }, (cell, c) => {
      headers[c] = cellText(cell);
    });
    const lower = headers.map((h) => (h ?? "").toLowerCase());
    const minutes = lower.findIndex((h) => /time|minute|limit|mins/.test(h));
    const stationCols = lower
      .map((h, i) =>
        /station|from|to\b|between|and\b|interchange/.test(h) && i !== minutes ? i : -1,
      )
      .filter((i) => i > 0);
    if (minutes > 0 && stationCols.length >= 2) {
      const from =
        stationCols.find((i) => /from|first|^station 1|between/.test(lower[i]!)) ?? stationCols[0]!;
      const to =
        stationCols.find((i) => i !== from && /to\b|second|^station 2|and\b/.test(lower[i]!)) ??
        stationCols.find((i) => i !== from)!;
      return { headerRow: r, headers, from, to, minutes };
    }
  }
  return null;
}

async function main() {
  const workbook = await loadWorkbook(process.argv[2]);
  const interchanges: Interchange[] = [];

  workbook.eachSheet((sheet) => {
    const columns = findColumns(sheet);
    if (!columns) {
      console.warn(
        `Skipping sheet "${sheet.name}": no header row with station and time columns found.`,
      );
      return;
    }
    const { headerRow, headers, from, to, minutes } = columns;
    console.log(
      `Sheet "${sheet.name}": from="${headers[from]}", to="${headers[to]}", time="${headers[minutes]}"`,
    );
    for (let r = headerRow + 1; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const fromName = cellText(row.getCell(from));
      const toName = cellText(row.getCell(to));
      if (!fromName || !toName) continue;
      const extra: Record<string, string> = {};
      headers.forEach((header, c) => {
        if (!header || c === from || c === to || c === minutes) return;
        const text = cellText(row.getCell(c));
        if (text) extra[header] = text;
      });
      interchanges.push({
        from: fromName,
        to: toName,
        minutes: parseMinutes(cellText(row.getCell(minutes))),
        extra,
      });
    }
  });

  if (interchanges.length === 0) {
    throw new Error(
      "No interchanges found. The spreadsheet layout may have changed; update findColumns().",
    );
  }

  const generated = {
    source: SOURCE_URL,
    generatedAt: new Date().toISOString(),
    interchanges,
  };
  await mkdir(dirname(OUT_FILE.pathname), { recursive: true });
  await writeFile(OUT_FILE, `${JSON.stringify(generated, null, 2)}\n`);
  console.log(`Wrote ${interchanges.length} interchanges to ${OUT_FILE.pathname}`);
}

await main();
