# London out-of-station interchanges

Search a London station and see which stations you can change to outside the gateline (an
out-of-station interchange, or OSI), with the time limit for each.

Built with TypeScript, TanStack Start in SPA mode (everything runs in the browser), oxlint and oxfmt.

## Getting started

```sh
npm install
npm run data   # downloads TfL's spreadsheet and writes src/data/osi.json
npm run dev
```

`npm run data -- path/to/out-of-station-interchanges.xlsx` converts a local copy instead of downloading.
The converter finds the header row by its labels (station names and a time/minutes column) and keeps
any other columns as extra details on each interchange.

## Scripts

| Script              | What it does                                                    |
| ------------------- | --------------------------------------------------------------- |
| `npm run dev`       | Dev server                                                      |
| `npm run build`     | Static build; deploy `dist/client` (SPA shell at `_shell.html`) |
| `npm run typecheck` | `tsc --noEmit`                                                  |
| `npm run lint`      | oxlint                                                          |
| `npm run format`    | oxfmt                                                           |

Source data: [TfL out-of-station interchanges](https://tfl.gov.uk/cdn/static/cms/documents/out-of-station-interchanges.xlsx).
