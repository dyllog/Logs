// Update these values when new race editions or athlete profiles are added.
// finisherRecords can be recomputed by running: node scripts/computeStats.js
export const SITE_STATS = {
  trackedEvents: 9,        // Auckland, Christchurch, Hawke's Bay, Rotorua, Queenstown, Waterfront, Devonport, Coatesville, Omaha
  finisherRecords: 297362, // sum of all records across public/data/*.json
  earliestEdition: 2007,   // earliest year in the database (Christchurch Half Marathon)
} as const;
