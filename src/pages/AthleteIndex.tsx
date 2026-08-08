import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getAthleteSlug, preloadAthleteIndex } from '@/data/athleteProfiles';
import { loadSearchShard, displayFromKey, loadHitResults, letterOf, type SearchResult, type NameHit } from '@/lib/searchIndex';
import { SharedNameChip, useSharedNames } from '@/lib/sharedNames';
import { raceHrefFor } from '@/lib/raceLinks';

const PAGE_SIZE = 100;

interface Row {
  id: string;
  name: string;
  slug: string | null;
  count: number;
  hit: NameHit;
  /** Loaded on expand — shards carry pointers, not result arrays. */
  results?: SearchResult[];
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AthleteIndex() {
  const { letter } = useParams<{ letter: string }>();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const sharedNames = useSharedNames();

  const ltr = (letter ?? 'a').toLowerCase();

  useEffect(() => {
    setLoading(true);
    setPage(0);
    setExpanded(null);
    Promise.all([loadSearchShard(ltr), preloadAthleteIndex(ltr)]).then(([shard]) => {
      const built: Row[] = [];
      for (const [key, pointers] of Object.entries(shard)) {
        // Shards also carry entries keyed by SURNAME so surname search works.
        // An A–Z browse is by name, so those copies are skipped here — without
        // this, "A" would list every John Adams in the archive.
        // letterOf folds diacritics, so "Ānaru" files under A rather than into
        // a bucket the A–Z strip does not link to.
        if (letterOf(key) !== ltr) continue;
        const name = displayFromKey(key);
        pointers.forEach((pointer, idx) => {
          const slug = idx === 0 ? getAthleteSlug(name) : null;
          built.push({
            id: `${key}#${idx}`,
            name, slug,
            count: pointer.n,
            hit: { key, name, idx, pointer, slug },
          });
        });
      }
      built.sort((a, b) => {
        const cmp = a.name.localeCompare(b.name);
        if (cmp !== 0) return cmp;
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
              <Link
                key={l}
                to={`/athletes/letter/${l.toLowerCase()}`}
                className={l.toLowerCase() === ltr ? 'lp-az-active' : ''}
              >
                {l}
              </Link>
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
                        if (row.slug) { navigate(`/athletes/${row.slug}`); return; }
                        if (isExpanded) { setExpanded(null); return; }
                        setExpanded(expandKey);
                        // Shards hold pointers; the results arrive on expand.
                        if (row.results === undefined) {
                          loadHitResults(row.hit).then(res => {
                            setRows(prev => prev.map(x => (x.id === row.id ? { ...x, results: res } : x)));
                          });
                        }
                      }}
                    >
                      <span className="lp-search-dropdown-count">{row.count}×</span>
                      <span className="lp-search-dropdown-name">
                        {row.name}
                        {row.slug && <span className="lp-search-dropdown-pill">profile</span>}
                        {row.slug && sharedNames.has(row.slug) && <SharedNameChip />}
                      </span>
                      <span className="lp-search-dropdown-meta">
                        {row.count === 1 ? '1 result' : `${row.count} results`}
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
                        {row.results === undefined && (
                          <div className="lp-search-dropdown-result-row" style={{ paddingLeft: 36 }}>
                            <span className="lp-search-dropdown-race">Loading results…</span>
                          </div>
                        )}
                        {(row.results ?? []).map((res, j) => {
                          const href = raceHrefFor(res.r, res.y, res.p);
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
