# London out-of-station interchanges

Search a London station and see which stations you can change to outside the gateline (an
out-of-station interchange, or OSI), with the time limit for each.

Built with TypeScript, TanStack Start in SPA mode (everything runs in the browser), Radix UI
primitives, CSS Modules (one `*.module.css` per component; tokens in `src/global.css`), oxlint and
oxfmt.

## Getting started

```sh
npm install
npm run data   # downloads TfL's spreadsheet and writes src/data/osi.json
npm run dev
```

`npm run data -- path/to/out-of-station-interchanges.xlsx` converts a local copy instead of downloading.
TfL's download sits behind a Cloudflare check that blocks many cloud and CI machines, so the local
path is the fallback there. The generated `src/data/osi.json` is committed.

The converter reads TfL's columns by name (`Station_A_Name`, `InterchangeTimeAB`, …) and fails if
any are missing. Times are kept per direction. Abbreviated names such as "Charing X LU" are
expanded via `scripts/station-names.ts`; the original name is kept as `sheetName`.

## Deploying

`.github/workflows/pages.yml` checks, builds and deploys to GitHub Pages on every push to
`main` (other branches are built and checked only). Turn it on once under
**Settings → Pages → Build and deployment → Source: GitHub Actions**. The site is served at
`https://<user>.github.io/<repo>/`; set `BASE_PATH` when building for any other sub-path.

## Scripts

| Script              | What it does                                                    |
| ------------------- | --------------------------------------------------------------- |
| `npm run dev`       | Dev server                                                      |
| `npm run build`     | Static build; deploy `dist/client` (SPA shell at `_shell.html`) |
| `npm run typecheck` | `tsc --noEmit`                                                  |
| `npm run lint`      | oxlint                                                          |
| `npm run format`    | oxfmt                                                           |

Source data: [TfL out-of-station interchanges](https://tfl.gov.uk/cdn/static/cms/documents/out-of-station-interchanges.xlsx).
