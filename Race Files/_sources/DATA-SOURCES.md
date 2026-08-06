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
