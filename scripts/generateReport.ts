/**
 * Generate an athlete career report using the Anthropic API.
 *
 * Usage:
 *   npx tsx scripts/generateReport.ts <slug>
 *   npx tsx scripts/generateReport.ts --all
 *
 * Requires: ANTHROPIC_API_KEY environment variable
 * Output:   public/data/reports/<slug>.json
 *
 * The generated JSON is fetched by the /athletes/:slug/report page.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { buildAthletePayload } from '../src/lib/athletePayload';
import { computeDerivedMetrics, type EnrichedPayload } from '../src/lib/athleteMetrics';
import { getAllAthletes } from '../src/data/allAthletes';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const REPORTS_DIR = join(PROJECT_ROOT, 'public', 'data', 'reports');

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is required.');
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
  "trajectory": "2-3 sentences. Direction of travel, rate, peak year if identifiable. Reference specific numbers.",
  "best_result": "1-2 sentences. Their highest percentile finish and why it stands out vs. their fastest time.",
  "distance_profile": "1-2 sentences. Based on age-graded scores, where is their relative strength? Only include if there is a meaningful difference (>=1.5 points).",
  "where_to_race": "2-3 sentences. Which NZ events would give them a strong placing, which would genuinely test them. Frame as intelligence, not advice — 'the data suggests' not 'you should'.",
  "qualifying_note": "1 sentence. Only include if they are close to or have crossed a notable qualifier standard. Omit key entirely if not relevant."
}

RULES:
- Do not invent statistics not present in the data
- Do not reference anything outside the provided data
- If a section cannot be written from the available data, write null for that key
- Times should be written as h:mm:ss (e.g. 2:21:01), percentiles as X.X%
- distance_profile should be null if age-graded difference is less than 1.5 points

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
      model: 'claude-sonnet-4-6',
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

  console.log(`  [gen]  ${slug} — calling Anthropic API...`);
  const report = await callAnthropicAPI(buildReportPrompt(enriched));

  const output: ReportFile = {
    slug,
    generated_at: new Date().toISOString(),
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
  const filteredArgs = args.filter(a => a !== '--force');

  if (filteredArgs.length === 0 || filteredArgs[0] === '--all') {
    const athletes = getAllAthletes();
    console.log(`Generating reports for ${athletes.length} athletes...\n`);
    for (const athlete of athletes) {
      await generateForSlug(athlete.slug, force);
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
