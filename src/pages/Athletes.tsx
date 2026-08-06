import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { normalise } from '@/data/athleteProfiles';
import { searchNames } from '@/lib/searchIndex';
import { SITE_STATS } from '@/data/siteStats';

/**
 * /athletes — the archive's athlete landing page.
 *
 * Everything here reads the canon. It previously read ATHLETE_REGISTRY, a
 * 25-entry Phase 0 fossil, which made the search box answer "No athletes found"
 * for real archived runners — a confident false negative aimed at exactly the
 * visitor the site is for. There is deliberately no default table: a fossil
 * listing of 25 arbitrary athletes was worse than none, and 74k rows have no
 * sensible default order. Browsing is the A–Z; finding is the search.
 */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MIN_QUERY = 2;
const PAGE_SIZE = 25;

interface Hit { id: string; display: string; races: number; span: string; slug: string | null }

export default function Athletes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);
  const runId = useRef(0);

  useEffect(() => {
    const q = normalise(search.trim());
    setShown(PAGE_SIZE);
    if (q.length < MIN_QUERY) { setHits([]); setSearched(false); setLoading(false); return; }

    const runToken = ++runId.current;
    setLoading(true);
    const t = setTimeout(async () => {
      const found = await searchNames(search.trim());
      if (runToken !== runId.current) return;          // a later keystroke won

      const out: Hit[] = found.map(h => ({
        id: `${h.key}#${h.idx}`,
        display: h.name,
        races: h.pointer.n,
        span: h.pointer.a ? (h.pointer.a === h.pointer.b ? `${h.pointer.a}` : `${h.pointer.a}–${h.pointer.b}`) : '',
        slug: h.slug,
      })).sort((a, b) => b.races - a.races || a.display.localeCompare(b.display));

      setHits(out);
      setLoading(false);
      setSearched(true);
    }, 180);
    return () => clearTimeout(t);
  }, [search]);

  const page = hits.slice(0, shown);

  return (
    <main>
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-16">Archive · NZ competitive running</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <h1 className="serif" style={{ fontSize: 48, lineHeight: 1, margin: 0, letterSpacing: '-0.025em' }}>Athletes</h1>
            {/* Derived from the canon by computeSiteStats, so it matches the
                homepage and cannot drift. Not "verified" — the archive records
                published results, it does not verify them. */}
            <div className="dimmed" style={{ fontSize: 13, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {SITE_STATS.athleteProfiles.toLocaleString()} profiles with results on record
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '20px 0', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div style={{ marginBottom: 8 }}>
            <div className="label mb-8" style={{ color: 'var(--meta)' }}>Browse all names by letter</div>
          </div>
          <div className="lp-az">
            {LETTERS.map(l => (
              <Link key={l} to={`/athletes/letter/${l.toLowerCase()}`}>{l}</Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 0 80px' }}>
        <div className="page">
          <div style={{ marginBottom: 24, maxWidth: 400 }}>
            <div className="label mb-8">Search</div>
            <input className="input" placeholder="Athlete name…"
                   value={search} onChange={e => setSearch(e.target.value)} />
            <div className="label mt-8" style={{ color: 'var(--meta)' }}>
              {loading ? 'Searching…'
                : searched ? `${hits.length.toLocaleString()} match${hits.length === 1 ? '' : 'es'}`
                : 'Search by first name or surname.'}
            </div>
          </div>

          {searched && hits.length > 0 && (
            <>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Athlete</th>
                      <th className="hide-mobile" style={{ width: 90 }}>Results</th>
                      <th className="hide-mobile" style={{ width: 110 }}>Years</th>
                      <th style={{ width: 90, textAlign: 'right' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.map(h => (
                      <tr key={h.id} className={h.slug ? 'row' : ''}
                          style={h.slug ? { cursor: 'pointer' } : undefined}
                          onClick={() => h.slug && navigate(`/athletes/${h.slug}`)}>
                        <td><span className="serif" style={{ fontSize: 16 }}>{h.display}</span></td>
                        <td className="dimmed hide-mobile">{h.races}</td>
                        <td className="dimmed hide-mobile time">{h.span}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ color: 'var(--meta)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
                            {h.slug ? 'View →' : 'Searchable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {shown < hits.length && (
                <button className="btn-ghost mt-24" onClick={() => setShown(s => s + PAGE_SIZE * 2)}>
                  Show more ({(hits.length - shown).toLocaleString()} remaining) →
                </button>
              )}

              <div className="dimmed mt-16" style={{ fontSize: 11, lineHeight: 1.6 }}>
                A profile page exists for athletes with two or more results. Everyone else stays
                searchable here and appears in full race results.
              </div>
            </>
          )}

          {searched && hits.length === 0 && !loading && (
            <div className="dimmed" style={{ padding: '48px 0', fontSize: 13, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
              No athletes found for “{search}”. Try a different spelling, or browse by
              letter above.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
