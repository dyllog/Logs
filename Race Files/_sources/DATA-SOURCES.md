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

### Taupō Marathon — 2023 and 2025 halves recovered from PDF

The organiser shipped `Half Results - 2023.csv` and `Half Results - 2025.csv`
**byte-identical to that year's marathon file** — an export error, not a
publication gap. Ingesting either as a half would have credited a marathon
field with a half marathon they never ran.

Those two editions are therefore read from the family's own all-distance PDFs
(`All Results - 2023.pdf`, `All Results - 2025.pdf`), which are the sole
surviving source for them. Every other Taupō edition comes from its CSV, which
is the better source where both exist.

| | |
|---|---|
| **Recovered** | Half marathon 2023 (925 finishers), 2025 (1,817 finishers) |
| **From** | `All Results - {year}.pdf`, section "Half Marathon Run" |
| **Read by** | `scripts/lib/taupoPdf.mjs`, split by `scripts/lib/splitMultiEvent.mjs` |
| **Verified by** | `scripts/verifyTaupoPdf.mjs` |

**How the reader is trusted.** Six Taupō marathons exist in BOTH formats, so
the PDF reader is checked against the CSV-derived files already in the archive:
it reproduces 1,408 finishers across 2019–2024 exactly on position and time.
Without that gate the extraction mode would have shipped silently wrong —
`pdftotext -layout` interleaves this layout's two column blocks and pairs each
runner with a *different* runner's time, rendering the 2023 winner beside
2:54:48 where he ran 2:36:04. `-raw` pairs correctly, and `-enc UTF-8` is
required as well: the default drops diacritics, turning "Andris Pētersons"
into "Andris Ptersons".

**Known limits of the PDF text layer.** Three names in the 2023 half and nine
in the 2025 half are published without a surname in the PDF itself (position
286 of the 2024 marathon is simply "Sarah"). These are recorded as they appear;
the CSV is more complete wherever it exists, which is why it takes precedence.

**Walk sections are not ingested.** Each PDF holds eight tables — marathon,
half, 10 km and 5 km, each as Run and Walk. LOGS is a running archive, and
merging walkers into running fields would corrupt both the fields and the
course records. The walk headings are listed explicitly in the reader so they
are excluded by decision rather than by falling through.

**PDF-sourced distances, distinct from the CSV years.** The 10 km and 5 km
fields were never shipped as CSV in most years, so they are read from these
same PDFs by the same verified path:

| Distance | PDF-sourced years | From CSV |
|---|---|---|
| Half marathon | 2023, 2025 | 2019–2022, 2024 |
| 10 km | 2020–2024 | 2025 |
| 5 km | 2020–2025 | none — no CSV exists in any year |
| Marathon | none | 2019–2025 |

All of it passes `scripts/verifyMultiEventSplit.mjs`: no bib appears in two
distances of one edition, every winning time is plausible for its distance,
and no field size departs from its series.

**Known-incomplete records.** 45 results are published without a surname in
the PDF text layer — position 286 of the 2024 marathon is simply "Sarah". They
are stored as published, but a name without a surname canonicalises as its own
athlete and can never be matched to the rest of that person's results, so they
are listed in `public/data/incomplete-records.json` with their recordId rather
than left to look like ordinary data. That file is written by the converter,
not maintained by hand, and is the natural feed for a contribute page.

### Whanganui Three Bridges — distance label varies by year

The quarter marathon is published as `105K` (10.5 km) in 2018, 2020 and
2023–25, and as `10K` in 2017, 2019 and 2022. It is one event at 10.55 km —
one lap of the four-lap marathon course — and is stored under a single
`quarter` distance key. See `ROAD_FAMILIES` in `scripts/roadToJson.mjs`.
