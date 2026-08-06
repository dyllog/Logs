/**
 * Generate an athlete career report using the Anthropic API.
 *
 * Usage:
 *   npx tsx scripts/generateReport.ts <slug>
 *   npx tsx scripts/generateReport.ts --all
 *   npx tsx scripts/generateReport.ts --all --dry-run    (no API call, nothing written)
 *
 * Requires: ANTHROPIC_API_KEY environment variable (except --dry-run)
 * Output:   public/data/reports/<slug>.json
 *
 * The generated JSON is fetched by the /athletes/:slug/report page.
 *
 * ── STATUS: PARKED ───────────────────────────────────────────────────────────
 * Reports are gated off in the UI (REPORTS_ENABLED in AthleteProfile.tsx), so
 * the 22 published reports are unreachable from any profile and their stale
 * prose is invisible. Nothing here needs running until reports revive.
 *
 * ── WHEN REPORTS REVIVE, DO THIS FIRST ───────────────────────────────────────
 * Repoint this generator at the CANON (public/data/athletes/*.json) instead of
 * the legacy `allAthletes.ts` registry that `buildAthletePayload` reads.
 *
 * Why it is already decided: allAthletes.ts was superseded by the canon in
 * Phase 0 and has since shrunk to 12 entries, while 22 reports stayed
 * published. Ten of them — ben-twyman, brent-godfrey, brett-tingay,
 * casey-thorby, cullern-thorby, dougal-thorburn, jack-moody, mike-phillips,
 * orestas-rimkus, scott-knowles — therefore cannot be regenerated at all:
 * buildAthletePayload returns null for a slug the registry no longer lists.
 * The canon holds all 199,294 athletes, so repointing resolves every orphan as
 * a side effect rather than needing them restored one by one.
 *
 * Until then `--all` names the orphans it cannot rebuild on every run, so the
 * gap stays loud instead of silently skipped.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildAthletePayload } from '../src/lib/athletePayload';
import { computeDerivedMetrics, type EnrichedPayload } from '../src/lib/athleteMetrics';
import { getAllAthletes } from '../src/data/allAthletes';
import WMA from '../src/data/wmaRoad2025.json';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const REPORTS_DIR = join(PROJECT_ROOT, 'public', 'data', 'reports');

/**
 * Model used to write report prose. Stamped into each report's provenance so a
 * later regeneration on a different model is visible rather than silent.
 *
 * Kept at Sonnet 4.6 deliberately: it is current (not deprecated), and changing
 * models changes the character of the prose across the whole report set — an
 * editorial call, not a maintenance one. `claude-sonnet-5` is the current
 * Sonnet if that re-voicing is wanted; this call passes no sampling params,
 * thinking config or prefill, so it is compatible with either.
 */
const MODEL = 'claude-sonnet-4-6';

/**
 * `--dry-run` exercises everything except the API call: payload, derived
 * metrics and prompt are built for each slug and the result reported. A
 * regeneration is billable and hits 22 slugs in sequence, so being able to
 * prove the inputs assemble before spending anything is worth the flag.
 */
const DRY_RUN = process.argv.includes('--dry-run');

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY && !DRY_RUN) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is required.');
  console.error('       (use --dry-run to validate payloads without calling the API)');
  process.exit(1);
}

// ── Prompt builder ─────────────────────────────────────────────────────────────

function buildReportPrompt(payload: EnrichedPayload): string {
  return `You are writing an athlete report for LOGS, a New Zealand competitive running archive.

VOICE AND TONE:
- Knowledgeable and precise, like a well-informed observer who takes the sport seriously
- Data-grounded: every claim must be supported by the data provided
- Unsentimental: do not use motivational language ("amazing effort", "incredible journey")
- Occasionally dry — a light editorial voice is appropriate, never cheerful or promotional
- Write for a runner who knows the sport, not a general audience

OUTPUT FORMAT:
Return only a JSON object with exactly these keys. No preamble, no markdown fences.

{
  "career_summary": "2-3 sentences. Years active, volume raced, distances. Factual only.",
  "trajectory": "2-3 sentences. Direction of travel, rate, peak year if identifiable. Reference finish times and years.",
  "best_result": "1-2 sentences. Their strongest finish — placing within the field — and why it stands out against their fastest time.",
  "distance_profile": "1-2 sentences. Which distance is their relative strength, described QUALITATIVELY. Only include if the data shows a meaningful difference.",
  "where_to_race": "2-3 sentences. Which NZ events would give them a strong placing, which would genuinely test them. Frame as intelligence, not advice — 'the data suggests' not 'you should'.",
  "qualifying_note": "1 sentence. Only include if they are close to or have crossed a notable qualifier standard. Omit key entirely if not relevant."
}

RULES:
- Do not invent statistics not present in the data
- Do not reference anything outside the provided data
- If a section cannot be written from the available data, write null for that key
- Times should be written as h:mm:ss (e.g. 2:21:01)

STABLE FACTS vs DERIVED FIGURES — this matters:
The page that displays this report shows derived figures in its own tiles, recomputed
on every build. Prose that quotes such a figure goes stale the moment the method behind
it changes, and then contradicts the tile beside it.

- QUOTE NUMERICALLY (these are fixed once recorded): finish times, finishing positions,
  field sizes, event names, years, counts of races, wins and podiums, dates.
- DO NOT QUOTE NUMERICALLY (these are recomputed and will change): age-grade percentages,
  field percentiles, and any other modelled or normalised score. Refer to them
  qualitatively instead.

  Wrong: "an age-graded score of 83.3% at the marathon"
  Right: "his marathon age-grades appreciably stronger than his half"

  Wrong: "a 98.7th-percentile finish"
  Right: "a finish inside the top two percent of the field" — or better, use the
         underlying stable fact: "22nd of 2,144"

  A placing out of a field size is a stable fact and is always preferred to a percentile.

ATHLETE DATA:
${JSON.stringify(payload, null, 2)}`;
}

// ── API call ───────────────────────────────────────────────────────────────────

interface ReportContent {
  career_summary: string | null;
  trajectory: string | null;
  best_result: string | null;
  distance_profile: string | null;
  where_to_race: string | null;
  qualifying_note?: string | null;
}

async function callAnthropicAPI(prompt: string): Promise<ReportContent> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${text}`);
  }

  const data = await response.json() as { content: Array<{ text: string }> };
  const raw = data.content[0].text;
  const clean = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(clean) as ReportContent;
  } catch {
    throw new Error(`Failed to parse API response as JSON:\n${raw}`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────

interface ReportFile {
  slug: string;
  generated_at: string;
  /**
   * What the derived figures were computed against when this prose was written.
   * Stamped so staleness is visible rather than invisible: if the age-grade
   * revision here is not the one currently in force, the report predates it.
   */
  provenance: {
    wma_revision: string;
    wma_approval: string;
    generator: string;
  };
  report: ReportContent;
  metrics_summary: {
    trajectory_marathon:      string | null;
    trajectory_half:          string | null;
    best_result_percentile:   number | null;
    best_result_race:         string | null;
    age_grading_marathon:     number | null;
    age_grading_half:         number | null;
    boston_status:            string | null;
    strong_placement_races:   string[];
    challenging_races:        string[];
  };
}

async function generateForSlug(slug: string, force = false): Promise<void> {
  const outPath = join(REPORTS_DIR, `${slug}.json`);

  if (!force && existsSync(outPath)) {
    const existing = JSON.parse(readFileSync(outPath, 'utf8')) as ReportFile;
    const ageMs = Date.now() - new Date(existing.generated_at).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays < 90) {
      console.log(`  [skip] ${slug} — report is ${Math.round(ageDays)} days old (< 90 days)`);
      return;
    }
  }

  console.log(`  [gen]  ${slug} — building payload...`);
  const payload = buildAthletePayload(slug);
  if (!payload) {
    console.error(`  [err]  ${slug} — athlete not found in allAthletes.ts`);
    return;
  }

  console.log(`  [gen]  ${slug} — computing metrics...`);
  const enriched = computeDerivedMetrics(payload);

  const prompt = buildReportPrompt(enriched);
  if (DRY_RUN) {
    console.log(`  [dry]  ${slug} — payload ok · ${payload.results.length} results · prompt ${prompt.length.toLocaleString()} chars · no API call, nothing written`);
    return;
  }

  console.log(`  [gen]  ${slug} — calling Anthropic API...`);
  const report = await callAnthropicAPI(prompt);

  const output: ReportFile = {
    slug,
    generated_at: new Date().toISOString(),
    provenance: {
      wma_revision: WMA.source.revision,
      wma_approval: WMA.source.approval,
      generator: MODEL,
    },
    report,
    metrics_summary: {
      trajectory_marathon:    enriched.trajectory.marathon?.note ?? null,
      trajectory_half:        enriched.trajectory.half_marathon?.note ?? null,
      best_result_percentile: enriched.best_result?.percentile ?? null,
      best_result_race:       enriched.best_result
        ? `${enriched.best_result.race} ${enriched.best_result.year}`
        : null,
      age_grading_marathon:   enriched.age_grading.marathon_avg,
      age_grading_half:       enriched.age_grading.half_marathon_avg,
      boston_status:          enriched.qualifying.boston?.status ?? null,
      strong_placement_races: enriched.race_recommendations.strong_placement.map(r => r.race),
      challenging_races:      enriched.race_recommendations.challenging.map(r => r.race),
    },
  };

  mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`  [done] ${slug} — saved to ${outPath.replace(PROJECT_ROOT, '.')}`);
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const filteredArgs = args.filter(a => a !== '--force' && a !== '--dry-run');

  if (filteredArgs.length === 0 || filteredArgs[0] === '--all') {
    // The set to refresh is every report that is PUBLISHED, not just the
    // athletes still listed in allAthletes.ts. Those two drifted apart: reports
    // outlive registry entries, and a registry-only --all silently left the
    // orphans on stale prose forever. Taking the union makes the gap loud.
    const registry = getAllAthletes().map(a => a.slug);
    const published = existsSync(REPORTS_DIR)
      ? readdirSync(REPORTS_DIR).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''))
      : [];
    const orphans = published.filter(s => !registry.includes(s));
    const slugs = [...new Set([...registry, ...published])].sort();

    console.log(`Generating reports for ${slugs.length} slugs (${registry.length} in allAthletes.ts, ${published.length} published).\n`);
    if (orphans.length) {
      console.log(`⚠️  ${orphans.length} published report(s) have no allAthletes.ts entry and CANNOT be regenerated:`);
      console.log(`    ${orphans.join(', ')}`);
      console.log('    Their prose stays frozen until the athlete is restored to the payload source.\n');
    }
    for (const slug of slugs) {
      await generateForSlug(slug, force);
    }
  } else {
    const slug = filteredArgs[0];
    await generateForSlug(slug, force);
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
