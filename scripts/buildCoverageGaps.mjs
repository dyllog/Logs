#!/usr/bin/env node
/**
 * Editions the archive knows exist but does not hold.
 *
 * Distinct from public/data/incomplete-records.json, which lists results we DO
 * hold but know to be defective. This is the other half of being honest about
 * coverage: a race page showing 2019 and 2022-2026 looks complete unless
 * something says the event has run since 1981.
 *
 * AUTHORED, not derived — a gap is by definition absent from the data, so it
 * cannot be computed from it. Each entry records what is missing, how it is
 * known to exist, and where it might be recovered from, which is exactly what
 * a contribute page or an approach to an organiser needs.
 *
 * Run as part of `npm run generate`.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(path.resolve(__dirname, '..'), 'public', 'data', 'coverage-gaps.json');

const GAPS = [
  {
    raceSlug: 'huntly-half-marathon',
    race: 'Huntly Half Marathon',
    missing: 'Half marathon, 1981–2018 and 2020–2021',
    held: '2019, 2022–2026',
    evidence: "The organiser bills it as New Zealand's longest-running standalone half marathon, "
            + 'established 1981, with the 2026 running its 46th. Their history pages carry a '
            + 'year-by-year account back to the first race — 150 starters outside the Huntly '
            + 'Police Station on 22 February 1981, won by John Graham in 66:38 with Alison Roe '
            + '15th; John Walker won in 64:45 the following year from 540 runners.',
    lead: 'https://huntlyhalf.co.nz/history/',
    note: 'Roughly 39 editions of a nationally significant event, with the organiser holding the record.',
  },
  {
    raceSlug: 'huntly-half-marathon',
    race: 'Huntly Half Marathon',
    missing: '10 km, all years',
    held: 'none',
    evidence: 'The 10 km has run since 1996, when the Hamilton club took over organising. Every '
            + '"10K Results" CSV supplied is byte-identical to that year\'s half marathon file, '
            + 'and its own Course column reads "Half marathon" — the 10 km results were never '
            + 'actually exported.',
    lead: 'https://huntlyhalf.co.nz/',
    note: 'An export error at source, not a gap in the event. Re-requesting the files would close it.',
  },
  {
    raceSlug: 'taupo-marathon',
    race: 'Taupō Marathon',
    missing: '10 km and 5 km, 2019',
    held: '10 km 2020–2025, 5 km 2020–2025',
    evidence: "The 2019 all-results PDF contains a marathon table only, unlike 2020-2025 which "
            + 'carry all four distances. Whether the shorter events ran in 2019 is not '
            + 'established by the sources held.',
    lead: 'https://www.taupomarathon.co.nz/',
    note: 'Confirm first whether these distances were run in 2019 at all.',
  },
  {
    raceSlug: 'saint-clair-vineyard-half-marathon',
    race: 'Saint Clair Vineyard Half',
    missing: 'Half marathon, 2007',
    held: '2008–2010, 2012–2019, 2021–2026',
    evidence: 'Held as a PDF in the source set and not yet ingested. 2011 and 2020 appear to be '
            + 'editions that did not run rather than missing data.',
    lead: 'Race Files/Saint Clair Vineyard Half/Half Results - 2007.pdf',
    note: 'Recoverable from a source already in hand, via the PDF path built for Taupō.',
  },
  {
    raceSlug: 'whanganui-three-bridges-marathon',
    race: 'Whanganui Three Bridges',
    missing: 'All distances, 2016',
    held: '2017–2020, 2022–2025',
    evidence: 'Held as "All Results - 2016.pdf" in the source set and not yet ingested. 2021 '
            + 'appears to be an edition that did not run.',
    lead: 'Race Files/Whanganui Three Bridges Marathon/All Results - 2016.pdf',
    note: 'Recoverable from a source already in hand; a multi-event PDF, so it needs a heading map.',
  },
];

fs.writeFileSync(OUT, JSON.stringify({
  note: 'Editions known to exist but not held by the archive. Authored, not derived — a gap '
      + 'cannot be computed from the data that is missing. Each entry records how the edition '
      + 'is known to exist and where it might be recovered from.',
  authoredIn: 'scripts/buildCoverageGaps.mjs',
  count: GAPS.length,
  gaps: GAPS,
}, null, 2));

console.log(`\n   Coverage gaps      : ${GAPS.length} recorded → public/data/coverage-gaps.json`);
