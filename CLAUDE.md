# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

LOGS is a New Zealand competitive running archive — a static SPA that displays historical race results, course records, and athlete profiles for major NZ road events. It is deployed on Vercel with a catch-all SPA rewrite.

## Commands

```bash
npm run dev        # start dev server (Vite)
npm run build      # production build → dist/
npm run lint       # ESLint
npm run preview    # preview production build locally

# Data pipeline scripts (run from repo root):
node scripts/csvToJson.mjs          # Auckland Marathon CSVs → public/data/
node scripts/chcToJson.mjs          # Christchurch CSVs → public/data/
node scripts/qtHbToJson.mjs         # Queenstown + Hawke's Bay CSVs → public/data/
node scripts/rotoruaToJson.mjs      # Rotorua CSVs → public/data/

# Athlete career report generation (requires ANTHROPIC_API_KEY):
npx tsx scripts/generateReport.ts <slug>   # single athlete
npx tsx scripts/generateReport.ts --all    # all athletes
```

Scripts print stats rows formatted for copy-paste into the relevant data file.

## Architecture

### Data flow

```
Race Files/<Race>/<Year>.csv
    → scripts/xxxToJson.mjs
    → public/data/results-<year>.json   (full field, lazy-loaded at runtime)

src/data/<race>Data.ts                  (hardcoded stats: finishers, avg, winner per year)
src/data/allAthletes.ts                 (canonical athlete profiles + full results)
src/data/latestRace.ts                  (pointer to the most recent published race)
```

JSON files under `public/data/` are fetched by async loader functions at runtime (not bundled). The stats arrays (field size, avg, winners per year) are hardcoded in TypeScript and bundled.

### Key data files

| File | Purpose |
|---|---|
| `src/data/logsData.ts` | Auckland Marathon course info, records, `upcoming[]` array, full result set for featured year |
| `src/data/logsDataExt.ts` | Auckland Mar/Half year stats (`yearStats`, `halfStats`), async JSON loaders (`loadResults`, etc.) |
| `src/data/chcData.ts` | Christchurch year stats + loaders |
| `src/data/hbData.ts` | Hawke's Bay year stats + loaders |
| `src/data/qtData.ts` | Queenstown year stats + loaders |
| `src/data/waterfrontData.ts` | Waterfront Half stats + loaders |
| `src/data/devonportData.ts` | Devonport Half stats + loaders |
| `src/data/allAthletes.ts` | Canonical `ALL_ATHLETES` array with full `results[]` per athlete; used by Compare, AthleteReport, AI generator |
| `src/data/athleteProfiles.ts` | `PROFILE_MAP` (name → slug) for athlete linking in results tables; `getAthleteSlug()` |
| `src/data/latestRace.ts` | `LATEST_RACE` object — determines what appears in the landing page "Recent results" section |

### Athlete data duplication (important)

Each `src/pages/AthleteXxx.tsx` page contains its own local `RESULTS` array and `PBs` object, mirroring the same athlete's entry in `allAthletes.ts`. **Both must be kept in sync.** `allAthletes.ts` is used by the AI report generator, the Compare page, and the search overlay. The page file is what the athlete's profile page renders.

### Landing page stats (hardcoded — must be maintained)

In `src/pages/Index.tsx`, three stats are hardcoded in JSX:
- **Tracked events** (number of races with full result archives)
- **Finisher records** (total count across all archived editions)
- **Earliest edition** (year of earliest archived result)

Update these whenever new race archives are added or a new race is onboarded.

## Rules

### Ordering

- **`src/pages/Races.tsx` `races` array**: always keep alphabetically sorted by race name.
- **`src/pages/Athletes.tsx` `athletes` array**: always keep alphabetically sorted by athlete last name, then first name.

### When a new race edition is published (new year of results)

1. Add the CSV to `Race Files/<Race Name>/` using the naming convention `<Race Name> - <Distance> Results - <Year>.csv`.
2. Run the relevant conversion script; copy the output stats row into the matching data file (e.g., append to `chcStats` in `chcData.ts`).
3. Add the year to the `YEARS` (or equivalent) constant in that data file.
4. Update `LATEST_RACE` in `src/data/latestRace.ts` to point to this race.
5. Update the **Finisher records** count on the landing page (`src/pages/Index.tsx`).
6. Check `allAthletes.ts` — if any tracked athlete competed, add their result to that athlete's `results[]` array and update `pbs` if a new PB was set.
7. Mirror those result/PB changes in the matching `AthleteXxx.tsx` page file.
8. Update `src/pages/Athletes.tsx` `pb` and `pbRace` fields for any affected athlete.
9. Regenerate AI reports for affected athletes: `npx tsx scripts/generateReport.ts <slug>`.

### When an entirely new race is added to the archive

All steps above, plus:

1. Create `src/pages/<RaceName>.tsx` — follow the structure of an existing race page (e.g., `Rotorua.tsx`): distance toggle, records section, averages chart, CR/winner chart, elevation chart, results block.
2. Add the route in `src/App.tsx`.
3. Add an entry to the `races` array in `src/pages/Races.tsx` (alphabetically).
4. Add to `upcoming` in `src/data/logsData.ts` if it has a known future date.
5. Update the **Tracked events** count on the landing page.
6. Add a `raceKey` mapping in `allAthletes.ts` `getRaceKey()`.
7. Add a `getRaceStats()` case in `src/lib/athletePayload.ts`.
8. Add a `getAllRaceSnapshots()` entry in `src/lib/athletePayload.ts`.

### When a new athlete profile is added

1. Add the `AthleteProfile` entry to `ALL_ATHLETES` in `src/data/allAthletes.ts`.
2. Add name variants (lowercase) to `PROFILE_MAP` in `src/data/athleteProfiles.ts`.
3. Create `src/pages/AthleteXxx.tsx` — copy structure from an existing athlete page; include the local `RESULTS` array, `PBs` object, and inline progression chart.
4. Add the route in `src/App.tsx`.
5. Add to the `athletes` array in `src/pages/Athletes.tsx` (alphabetically by last name).
6. Generate the AI career report: `npx tsx scripts/generateReport.ts <slug>` (requires `ANTHROPIC_API_KEY`). Output lands in `public/data/reports/<slug>.json`.

## Design conventions

- **Fonts**: DM Mono (body, monospace data) and DM Serif Display (headings, athlete names). Apply via `.mono` / `.serif` classes.
- **Theming**: CSS custom properties (`--bg`, `--ink`, `--meta`, etc.) with a `html[data-theme="dark"]` override. Never use Tailwind colour utilities directly for brand colours — use CSS vars.
- **Layout classes**: `.page` (centred container), `.section`, `.tbl-wrap` + `.tbl` (result tables), `.card-dark`, `.pill`, `.label`, `.eyebrow` — defined in `src/index.css`.
- **Mobile**: hide non-essential columns with `.hide-mobile`; test overflow behaviour.
- **Time format**: always `h:mm:ss` for times ≥ 1 hour, `m:ss` for shorter. Use `toSec()` from `logsData.ts` and the local `fmtSec()` pattern found in each file.
- **Race result rows** use the `Result` / `ResultRow` interface (pos, name, cat, club, time, nat, sec). `sec` is always pre-computed from `toSec(time)`.
- **Athlete results** use `AthleteResult` from `allAthletes.ts`; `dateNum` is `year + month/12` (fractional year) used as the x-axis for progression charts.

## Script conventions

The conversion scripts (`scripts/*.mjs`) all:
- Read CSVs from `Race Files/` (relative to repo root)
- Write JSON to `public/data/`
- Print a formatted stats row for the data file to stdout

Column layout differs between old-format CSVs (pre-2021, no nationality column, gender encoded in category code) and new-format CSVs (2021+, separate nationality and gender columns). See `csvToJson.mjs` for the detection logic — replicate it in any new script.
