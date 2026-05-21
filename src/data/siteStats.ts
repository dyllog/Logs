// Update these values when new race editions or athlete profiles are added.
// finisherRecords can be recomputed by running: node scripts/computeStats.js
export const SITE_STATS = {
  trackedEvents: 11,       // Auckland, Christchurch, Hawke's Bay, Rotorua, Queenstown, Waterfront, Devonport, Coatesville, Omaha, Maraetai, Kerikeri
  finisherRecords: 329042, // sum of all records across public/data/*.json
  earliestEdition: 1992,   // Auckland Marathon inaugural year
} as const;
