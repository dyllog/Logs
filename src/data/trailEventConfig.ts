/**
 * trailEventConfig.ts — trail data model: types + app-side helpers.
 * ─────────────────────────────────────────────────────────────────────────────
 * Event Family → Sub-Event → Edition → Course Instance.
 *
 * The authored config lives in ./trailEvents.mjs so the generate pipeline
 * (plain node .mjs scripts) can import the same source of truth. This module
 * types it and exposes the lookups the app needs.
 *
 * Model rules (per the trail data-model handoff):
 *   • Sub-event id is the stable, era-independent spine — display names and
 *     distances vary per year via course instances; the id never changes.
 *   • A course instance belongs to exactly one sub-event; which one is a
 *     curated call recorded in the config, never inferred from labels.
 *   • Editions exist even when cancelled, so timelines show honest gaps.
 *   • Trail results are results-in-context only: no PBs, excluded from
 *     Compare (road-only, standing decision).
 */

import { TRAIL_EVENT_FAMILIES, trailResultsFile } from './trailEvents.mjs';

export interface SubEvent {
  /** Stable, era-independent id: 'miler', 't102', … RecordIds use it in the distId slot. */
  id: string;
  /** Current-era name shown on pills and rows: 'T102'. */
  displayName: string;
  /** Historic names for display/search: ['TUM 102', 'Tarawera 102K', 'Tarawera 100K']. */
  aliases?: string[];
  /** Sub-events sharing a band may chart together WITH course-change markers. */
  comparabilityBand?: string;
  /** Lineage ended (e.g. Tarawera 85K/87K after the 2019 restructure). */
  retired?: boolean;
  /** Existed only as a contingency artifact (2014 cyclone courses) pending curation. */
  oneOff?: boolean;
}

export type EditionStatus = 'held' | 'cancelled' | 'restricted';

export interface CourseInstance {
  /** Which sub-event this year's course belongs to — a curated call. */
  subEventId: string;
  /** The REAL measured distance that year: 43, 45, 100, 102, 161… never normalised. */
  distanceKm: number;
  /** What it was called that year, verbatim from the source file: 'TUM 102', 'Tarawera 100K'. */
  label: string;
  /** 'reversed direction', 'landslip contingency course'… always visible in the UI. */
  courseNote?: string;
  /** Contingency courses are never presented as a normal year and are excluded from era records. */
  contingency?: boolean;
  /** Derived at load time from the naming convention — never authored. */
  resultsFile: string;
}

export interface Edition {
  year: number;
  status: EditionStatus;
  /** 'COVID — NZ residents only', 'Cancelled — …' — rendered beside the year. */
  note?: string;
  courses: CourseInstance[];
}

export interface TrailEventFamily {
  /** The /races/:slug route, and the raceSlug segment of recordIds. */
  familySlug: string;
  name: string;
  /** Prefixes sub-event labels in canon/search rows: 'Tarawera' → 'Tarawera T102'. */
  shortName: string;
  location: string;
  surface: string;
  /** Approximate race month — intra-year ordering on athlete profiles. */
  seasonMonth?: number;
  /** First edition year on public record (archive coverage may start later). */
  established?: number;
  nextEdition?: string;
  entryUrl?: string;
  entryText?: string;
  blurb?: string;
  /** Folder name under Race Files/ the converter reads from. */
  sourceDir: string;
  /** Races-page map dot (viewBox 0 0 140 290). */
  mapX?: number;
  mapY?: number;
  /** Authored order = switcher display order (current by distance desc, then retired, then one-offs). */
  subEvents: SubEvent[];
  editions: Edition[];
}

/** One sub-event year-strip entry. `course` is absent for cancelled editions
 *  and for held editions where this sub-event had no course (honest gaps). */
export interface SubEventYear {
  year: number;
  status: EditionStatus;
  note?: string;
  course?: CourseInstance;
}

// ── Load + derive ────────────────────────────────────────────────────────────

function materialise(raw: TrailEventFamily): TrailEventFamily {
  return {
    ...raw,
    editions: raw.editions.map(ed => ({
      ...ed,
      courses: ed.courses.map(ci => ({
        ...ci,
        resultsFile: trailResultsFile(raw.familySlug, ci.subEventId, ed.year),
      })),
    })),
  };
}

export const TRAIL_FAMILIES: TrailEventFamily[] =
  (TRAIL_EVENT_FAMILIES as TrailEventFamily[]).map(materialise);

const BY_SLUG = new Map(TRAIL_FAMILIES.map(f => [f.familySlug, f]));

export function getTrailFamily(slug: string | undefined): TrailEventFamily | undefined {
  return slug ? BY_SLUG.get(slug) : undefined;
}

export function getSubEvent(family: TrailEventFamily, subEventId: string): SubEvent | undefined {
  return family.subEvents.find(s => s.id === subEventId);
}

export function courseFor(family: TrailEventFamily, subEventId: string, year: number): CourseInstance | undefined {
  return family.editions.find(e => e.year === year)?.courses.find(c => c.subEventId === subEventId);
}

/** Latest course a sub-event ran — its current-era distance/label. */
export function latestCourse(family: TrailEventFamily, subEventId: string): CourseInstance | undefined {
  for (let i = family.editions.length - 1; i >= 0; i--) {
    const c = family.editions[i].courses.find(ci => ci.subEventId === subEventId);
    if (c) return c;
  }
  return undefined;
}

/**
 * Year strip for one sub-event, newest first. Spans the sub-event's first to
 * last course year and keeps the in-between editions that DIDN'T run it —
 * cancelled 2022 renders greyed, and a held edition with no course for this
 * sub-event (Tarawera 2014: cyclone contingency only) renders as an honest,
 * annotated gap rather than vanishing.
 */
export function subEventYears(family: TrailEventFamily, subEventId: string): SubEventYear[] {
  const withCourse = family.editions.filter(e => e.courses.some(c => c.subEventId === subEventId));
  if (withCourse.length === 0) return [];
  const first = withCourse[0].year;
  const last = withCourse[withCourse.length - 1].year;
  return family.editions
    .filter(e => e.year >= first && e.year <= last)
    .map(e => ({
      year: e.year,
      status: e.status,
      note: e.note,
      course: e.courses.find(c => c.subEventId === subEventId),
    }))
    .reverse();
}

/** Years a sub-event actually ran (for the race directory / year search). */
export function subEventCourseYears(family: TrailEventFamily, subEventId: string): number[] {
  return family.editions
    .filter(e => e.courses.some(c => c.subEventId === subEventId))
    .map(e => e.year);
}

/** First/last archived edition years, for "Archive 2012–2026" eyebrows. */
export function archiveSpan(family: TrailEventFamily): { from: number; to: number } {
  return {
    from: family.editions[0].year,
    to: family.editions[family.editions.length - 1].year,
  };
}

/** All sub-event ids across every trail family — the app-side trail test for
 *  result rows (canon also stamps `trail: true` on rows at build time). */
export function isTrailRaceSlug(slug: string): boolean {
  return BY_SLUG.has(slug);
}
