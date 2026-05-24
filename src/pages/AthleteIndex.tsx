import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAthleteSlug, NAME_DISAMBIGUATION } from '@/data/athleteProfiles';

const PAGE_SIZE = 100;

interface ResultEntry {
  r: string; y: number; t: string; p: number; tot: number;
}
interface IndexEntry {
  display: string;
  results: ResultEntry[];
}
type ShardData = Record<string, IndexEntry>;

const shardCache = new Map<string, ShardData>();

async function loadShard(letter: string): Promise<ShardData> {
  if (shardCache.has(letter)) return shardCache.get(letter)!;
  try {
    const res = await fetch(`/data/search/${letter}.json`);
    if (!res.ok) return {};
    const data: ShardData = await res.json();
    shardCache.set(letter, data);
    return data;
  } catch { return {}; }
}

const LABEL_TO_RACE_KEY: Record<string, string> = {
  'Auckland Marathon':     'auckland-full',
  'Auckland Half':         'auckland-half',
  'Christchurch Marathon': 'chc',
  'Christchurch Half':     'chc-half',
  'Rotorua Marathon':      'rotorua',
  'Rotorua Half':          'rotorua-half',
  'Queenstown Marathon':   'qt',
  'Queenstown Half':       'qt-half',
  "Hawke's Bay Marathon":  'hb',
  "Hawke's Bay Half":      'hb-half',
  'Waterfront Half':       'wf-half',
  'Waterfront 10k':        'wf-10k',
  'Devonport Half':        'dev-half',
  'Devonport 10k':         'dev-10k',
  'Coatesville Half':      'coast-half',
  'Omaha Half':            'omaha-half',
  'Omaha 10k':             'omaha-10k',
  'Kerikeri Half':         'kerikeri-half',
  'Maraetai Half':         'maraetai-half',
  'Maraetai 10k':          'maraetai-10k',
  'wellington-half':       'wellington-half',
  'wellington-mar':        'wellington-mar',
};

function raceHref(res: ResultEntry): string | null {
  const r = res.r.toLowerCase();
  let base: string | null = null;
  if (r.includes('auckland marathon') || r === 'auckland half') base = '/races/auckland-marathon';
  else if (r.includes('rotorua'))      base = '/races/rotorua-marathon';
  else if (r.includes('christchurch')) base = '/races/christchurch-marathon';
  else if (r.includes('queenstown'))   base = '/races/queenstown-marathon';
  else if (r.includes('hawke'))        base = '/races/hawkes-bay-marathon';
  else if (r.includes('waterfront'))   base = '/races/waterfront-half-marathon';
  else if (r.includes('devonport'))    base = '/races/devonport-half-marathon';
  else if (r.includes('coatesville')) base = '/races/coatesville-half-marathon';
  else if (r.includes('omaha'))        base = '/races/omaha-half-marathon';
  else if (r.includes('maraetai'))     base = '/races/maraetai-half-marathon';
  else if (r.includes('kerikeri'))     base = '/races/kerikeri-half-marathon';
  else if (r.includes('wellington'))   base = '/races/wellington-marathon';
  if (!base) return null;
  const key = LABEL_TO_RACE_KEY[res.r];
  const params = new URLSearchParams({ year: String(res.y), pos: String(res.p) });
  if (key) params.set('race', key);
  return `${base}?${params}`;
}

interface Row { name: string; slug: string | null; results: ResultEntry[]; }

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AthleteIndex() {
  const { letter } = useParams<{ letter: string }>();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const ltr = (letter ?? 'a').toLowerCase();

  useEffect(() => {
    setLoading(true);
    setPage(0);
    setExpanded(null);
    loadShard(ltr).then(shard => {
      const built: Row[] = [];
      for (const [, entry] of Object.entries(shard)) {
        const slug = getAthleteSlug(entry.display);
        const conflicts = NAME_DISAMBIGUATION[entry.display];
        if (slug && conflicts?.length) {
          const isConflict = (r: ResultEntry) => conflicts.some(c => c.r === r.r && c.y === r.y);
          built.push({ name: entry.display, slug, results: entry.results.filter(r => !isConflict(r)) });
          const others = entry.results.filter(r => isConflict(r));
          if (others.length) built.push({ name: entry.display, slug: null, results: others });
        } else {
          built.push({ name: entry.display, slug, results: entry.results });
        }
      }
      built.sort((a, b) => {
        const cmp = a.name.localeCompare(b.name);
        if (cmp !== 0) return cmp;
        // Profiled entry sorts before unproﬁled when names match
        return (b.slug ? 1 : 0) - (a.slug ? 1 : 0);
      });
      setRows(built);
      setLoading(false);
    });
  }, [ltr]);

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <main>
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-16">Archive · NZ competitive running</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <h1 className="serif" style={{ fontSize: 48, lineHeight: 1, margin: 0, letterSpacing: '-0.025em' }}>
              Athletes — {ltr.toUpperCase()}
            </h1>
            {!loading && (
              <div className="dimmed" style={{ fontSize: 13, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
                {rows.length.toLocaleString()} names on record
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: '20px 0', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="lp-az">
            {LETTERS.map(l => (
              <span
                key={l}
                onClick={() => navigate(`/athletes/letter/${l.toLowerCase()}`)}
                style={l.toLowerCase() === ltr ? { background: 'var(--ink)', color: 'var(--bg)', pointerEvents: 'none' } : {}}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 0 80px' }}>
        <div className="page">
          {loading && (
            <div className="dimmed" style={{ padding: '48px 0', fontSize: 13, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Loading…
            </div>
          )}
          {!loading && rows.length === 0 && (
            <div className="dimmed" style={{ padding: '48px 0', fontSize: 13, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
              No names on record for "{ltr.toUpperCase()}".
            </div>
          )}
          {!loading && pageRows.length > 0 && (
            <>
              {pageRows.map((row, i) => {
                const expandKey = `${page}_${i}`;
                const isExpanded = expanded === expandKey;
                return (
                  <div key={expandKey} style={{ borderBottom: '0.5px solid var(--rule-soft)' }}>
                    <div
                      className="lp-search-dropdown-row"
                      style={{ padding: '11px 0' }}
                      onClick={() => {
                        if (row.slug) navigate(`/athletes/${row.slug}`);
                        else setExpanded(isExpanded ? null : expandKey);
                      }}
                    >
                      <span className="lp-search-dropdown-count">{row.results.length}×</span>
                      <span className="lp-search-dropdown-name">
                        {row.name}
                        {row.slug && <span className="lp-search-dropdown-pill">profile</span>}
                      </span>
                      <span className="lp-search-dropdown-meta">
                        {row.results.length === 1 ? '1 result' : `${row.results.length} results`}
                      </span>
                      <span
                        className="lp-search-dropdown-chevron"
                        style={!row.slug ? { transform: isExpanded ? 'rotate(180deg)' : 'none' } : undefined}
                      >
                        {row.slug ? '→' : '▾'}
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="lp-search-dropdown-results">
                        {row.results.map((res, j) => {
                          const href = raceHref(res);
                          return (
                            <div
                              key={j}
                              className={`lp-search-dropdown-result-row${href ? ' clickable' : ''}`}
                              style={{ paddingLeft: 36 }}
                              onClick={href ? () => navigate(href) : undefined}
                            >
                              <span className="lp-search-dropdown-time">{res.t}</span>
                              <span className="lp-search-dropdown-race">
                                {res.r} <span className="lp-search-dropdown-year">{res.y}</span>
                              </span>
                              <span className="lp-search-dropdown-pos">{res.p}/{res.tot}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {totalPages > 1 && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 40, justifyContent: 'center' }}>
                  <button
                    disabled={page === 0}
                    onClick={() => { setPage(p => p - 1); setExpanded(null); window.scrollTo(0, 0); }}
                    style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.35 : 1, background: 'none', border: '0.5px solid var(--rule)', padding: '7px 16px', color: 'var(--ink)' }}
                  >← Prev</button>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--meta)', letterSpacing: '0.06em' }}>
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages - 1}
                    onClick={() => { setPage(p => p + 1); setExpanded(null); window.scrollTo(0, 0); }}
                    style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: page === totalPages - 1 ? 'default' : 'pointer', opacity: page === totalPages - 1 ? 0.35 : 1, background: 'none', border: '0.5px solid var(--rule)', padding: '7px 16px', color: 'var(--ink)' }}
                  >Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
