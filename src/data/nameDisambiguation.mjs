/**
 * Results that appear under a profiled athlete's name but belong to a
 * *different* person who happens to share it.
 *
 * Shared by the app and the generate pipeline (like trailEvents.mjs), because
 * the split is now applied when the search index is BUILT rather than when a
 * query runs. Search shards carry pointer records, not result arrays, so there
 * is nothing left at runtime to partition — the two people are emitted as two
 * separate pointers under the same name key instead.
 *
 * Keys must match the display name exactly as the search index stores it
 * (Title Case, as produced by build-search-index.mjs). Values use the exact
 * race label from RACE_LABELS in that same script.
 */
export const NAME_DISAMBIGUATION = {
  'Kylie Brown': [
    { r: 'Queenstown Half',   y: 2016 },
    { r: 'Christchurch Half', y: 2017 },
    { r: 'Queenstown Half',   y: 2017 },
  ],
};
