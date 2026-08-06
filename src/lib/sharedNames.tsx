import { useEffect, useState } from 'react';

/**
 * Shared-name (knownMultiPerson) slugs, for the chip that renders on the
 * profile, in the athlete index and in search results.
 *
 * Deliberately NOT rendered on rows inside race results tables: a single
 * finish is unambiguous — it happened, to whoever crossed the line — and the
 * uncertainty only exists once finishes are grouped under one name.
 *
 * The list is derived every `npm run generate` by flagInconsistentClusters.mjs,
 * so it clears automatically when a cluster is partitioned by an encoded split.
 */

let cache: Set<string> | null = null;
let inflight: Promise<Set<string>> | null = null;

export function loadSharedNames(): Promise<Set<string>> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetch('/data/flagged-slugs.json')
    .then(r => (r.ok ? r.json() : []))
    .then((slugs: unknown) => {
      cache = new Set(Array.isArray(slugs) ? slugs : []);
      return cache;
    })
    // A missing list must never break a page — it just means no chips.
    .catch(() => { cache = new Set(); return cache; })
    .finally(() => { inflight = null; });
  return inflight;
}

export function useSharedNames(): Set<string> {
  const [set, setSet] = useState<Set<string>>(() => cache ?? new Set());
  useEffect(() => {
    let cancelled = false;
    loadSharedNames().then(s => { if (!cancelled) setSet(s); });
    return () => { cancelled = true; };
  }, []);
  return set;
}

/** The chip itself — small, mono, terracotta, no icon. */
export function SharedNameChip() {
  return (
    <span className="shared-chip shared-chip-sm" title="Records under this name may span several runners">
      Shared name
    </span>
  );
}
