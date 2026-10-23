// TfL's sheet uses abbreviated, fare-system station names (e.g. "Charing X LU").
// These tables turn them into names people search for. Unlisted names pass through.

// Trailing network codes, shown in brackets after the station name.
const SUFFIXES: Record<string, string> = {
  LU: "Underground",
  NR: "National Rail",
  DLR: "DLR",
  EL: "Elizabeth line",
  LO: "Overground",
  Tlnk: "Thameslink",
};

// Base names (after the suffix is removed) that need expanding.
const BASE_NAMES: Record<string, string> = {
  "Battersea Pwr S": "Battersea Power Station",
  "Cannon St": "Cannon Street",
  "Charing X": "Charing Cross",
  "Clapham High St": "Clapham High Street",
  "Dalston Kingsld": "Dalston Kingsland",
  "Edgware Rd B": "Edgware Road (Bakerloo)",
  "Edgware Rd C&H": "Edgware Road (Circle & H&C)",
  "Elephant & C": "Elephant & Castle",
  "Fenchurch St": "Fenchurch Street",
  "Finchley Rd Fgnl": "Finchley Road & Frognal",
  "Finsbury Pk": "Finsbury Park",
  "Hammersmith C&H": "Hammersmith (Circle & H&C)",
  "Hammersmith D&P": "Hammersmith (District & Piccadilly)",
  "Harringay Grn Ln": "Harringay Green Lanes",
  "Kentish Tn West": "Kentish Town West",
  "Kings Cross": "King's Cross",
  "Leytonstone H Rd": "Leytonstone High Road",
  "Liverpool St": "Liverpool Street",
  "Oxford Circ": "Oxford Circus",
  "Shepherds Bsh": "Shepherd's Bush",
  "St Pancras Intl": "St Pancras International",
  "Sudbury Hil": "Sudbury Hill",
  "Sudbury Hill Hrw": "Sudbury Hill Harrow",
  "Tottenham Ct Rd": "Tottenham Court Road",
  "Tottenham H": "Tottenham Hale",
  "Tower Gatewy": "Tower Gateway",
  "Victoria D": "Victoria (District & Circle)",
  "Victoria V": "Victoria (Victoria line)",
  "W Hampstead": "West Hampstead",
  "W India Quay": "West India Quay",
  "Walthamstow C": "Walthamstow Central",
  "Walthmstow C": "Walthamstow Central",
  "Walthamstow Q Rd": "Walthamstow Queen's Road",
  "Walthamstw Qns Rd": "Walthamstow Queen's Road",
  "Waterloo E": "Waterloo East",
  "Woolwch Arsn": "Woolwich Arsenal",
};

export function displayName(sheetName: string): string {
  const trimmed = sheetName.replace(/\s+/g, " ").trim();
  const match = /^(.*) (\S+)$/.exec(trimmed);
  const suffix = match && SUFFIXES[match[2]!];
  const base = suffix ? match[1]! : trimmed;
  const name = BASE_NAMES[base] ?? base;
  if (!suffix) return name;
  // "Edgware Road (Bakerloo)" + LU reads better without a second bracket.
  return name.endsWith(")") ? name : `${name} (${suffix})`;
}
