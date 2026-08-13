# LOGS — Data Sources log

External data brought into the archive, recorded so that any published figure
can be traced back to the thing it came from. The principle is the same one the
archive applies to race results: keep the source file, don't trust a URL to
persist.

Each entry records what was taken, from where, which revision, when it was
accessed, the licence, and what in the repo derives from it.

---

## WMA / USATF road running age standards — 2025 revision

| | |
|---|---|
| **Source** | Age-Grade-Tables, compiled by Alan Jones for WMA/USATF |
| **URL** | https://github.com/AlanLyttonJones/Age-Grade-Tables |
| **Directory** | `2025 Files` |
| **Files** | `MaleRoadStd2025.xlsx`, `FemaleRoadStd2025.xlsx` |
| **Revision** | 2025 — approved 2025-01-10 by the USATF Masters Long Distance Running (MLDR) Council |
| **Version stamp** | Male workbook: `Version 2025-07-27`. Female workbook carries no version stamp; both carry the same approval line. |
| **Accessed** | 2026-08-02 |
| **Licence** | CC0-1.0 (public domain dedication) — attribution given on `/methodology` as a courtesy, not a requirement |
| **Archived at** | `Race Files/_sources/wma-age-grading/` |
| **Derived file** | `src/data/wmaRoad2025.json` |
| **Derived by** | `scripts/buildWmaTables.mjs` |
| **Verified by** | `scripts/verifyAgeGrading.mjs` |

### What is consumed

The `AgeStdSec` sheet — the age standard in seconds, per single year of age,
per distance. Only the four distances the tables are natively developed for are
read: **5 km, 10 km, Half-Marathon, Marathon**. Every other column in the
workbooks is interpolated from those four; LOGS races exactly these four, so no
interpolated value enters the archive.

Age grade % = age standard seconds ÷ actual time × 100.

Standards and factors are taken as a matched pair from one revision. The build
refuses to proceed if the two workbooks disagree on their approval line or
revision year.

### Notes on the source

Recorded because they are surprising, and because a future re-run will hit them
again:

- **The two workbooks are not laid out identically.** The female file names its
  sheets `Age Facctors` / `AgeStanSec` (the typo is in the source) against the
  male file's `Age Factors` / `AgeStdSec`. The female factors sheet also carries
  a duplicated leading `Age` column, shifting every distance one column right.
  The parser resolves sheets by relationship id and columns by header label, per
  sheet — never by position.
- **One cell disagrees with itself.** In `FemaleRoadStd2025.xlsx`, age 100,
  10 km: the `AgeStanSec` value (12172 s) and the value implied by the factors
  sheet (11686 s) differ by 4.0%. Every other adult cell in both workbooks
  agrees exactly. The published `AgeStanSec` value is kept, and the exception is
  listed explicitly in `buildWmaTables.mjs` rather than hidden by a loosened
  tolerance.
- **Child ages diverge by design.** Below 18, the longer-distance standards are
  capped independently of the factor curve, so the two representations do not
  agree there. LOGS never grades those ages; the published values are stored
  unaltered regardless.
- **The female workbook's H:MM:SS sheet is titled "Proposed".** Its seconds
  sheet — the one consumed — is not, and both workbooks carry the same
  2025-01-10 approval line. Worth re-checking on the next revision.

### Replaced

This source replaced a hand-written approximation that derived female factors
as male × 1.10. The real female/male standard ratio varies between 1.073 and
1.364 across the table, so a constant multiplier was the wrong shape, not just
imprecise — worst at exactly the ages where age grading carries the most
meaning. No fallback to the approximation remains in the codebase.

---

## Race result sources — recorded provenance changes

Race results are archived as the organiser published them (`Race Files/`), and
the converters read those files rather than a live URL. Where a source changes
shape mid-history, the change is recorded here: a shift in what the source
records is not a data error to repair, but it does change what the archive can
honestly say about those years.

### Saint Clair Vineyard Half — timing provider changed at the 2022 edition

Three anomalies appear together in the 2022 exports, and they are one event
rather than three:

| | Before 2022 | 2022 onward |
|---|---|---|
| **Position column** | `Position` | dropped; only `Net Pos` |
| **Ranking basis** | gun order | net order — published positions follow the net column with zero inversions, against 28–135 for the gun column |
| **Category / gender** | `Category`, `Gender` | absent entirely |

The 2022 half and 12 km files therefore carry **414 rows with no category or
gender at all**. These are stored as `—`, and age grading declines to grade
them; no band is inferred from a runner's other results, because that would
assert a grouping the source never published.

From 2023 the `Category` and `Gender` columns return, but the net-ranked
positions do not revert. Saint Clair is consequently the one road family in
the archive recorded on **net** time rather than gun — see the note in
`ROAD_FAMILIES`, `scripts/roadToJson.mjs`. Its times read very slightly fast
against gun-timed families, on the order of a minute over the half.

### Saint Clair Vineyard Half — 2014 half is a partial publication

The 2014 source contains 157 finishers, positions 1–157, between editions of
roughly 1,100 and 1,200. It is internally complete — no gaps in the position
sequence — so this is what the organiser published rather than a truncated
file or a parse failure. Recorded as-is; re-sourcing would be the only fix.

### Whanganui Three Bridges — distance label varies by year

The quarter marathon is published as `105K` (10.5 km) in 2018, 2020 and
2023–25, and as `10K` in 2017, 2019 and 2022. It is one event at 10.55 km —
one lap of the four-lap marathon course — and is stored under a single
`quarter` distance key. See `ROAD_FAMILIES` in `scripts/roadToJson.mjs`.
