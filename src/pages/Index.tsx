import { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InlineSearchDropdown from '@/components/InlineSearch';
import { recordsMen } from '@/data/logsData';
import { upcoming } from '@/data/logsData';
import { SITE_STATS } from '@/data/siteStats';
import { RECENTLY_ADDED } from '@/data/recentlyAdded';

const EXAMPLES = [
  { label: 'Daniel Balchin', href: '/athletes/daniel-balchin' },
  { label: 'Auckland Marathon 2025', href: '/races/auckland-marathon' },
  { label: 'Christchurch Marathon', href: '/races/christchurch-marathon' },
  { label: 'Cameron Graves', href: '/athletes/cameron-graves' },
  { label: 'Rotorua 2024', href: '/races/rotorua-marathon' },
];

const HOLES = [
  {
    num: 'No. 01 · All-time',
    title: 'Fastest marathon performances, NZ soil',
    desc: 'Every sub-2:25 ever recorded on a certified New Zealand road course, men\'s field.',
    items: [
      { nm: 'Beyn, I.', vv: '2:19:32', faded: false },
      { nm: 'Balchin, D.', vv: '2:19:55', faded: false },
      { nm: 'Baynes, O.', vv: '2:20:36', faded: false },
      { nm: 'Voss, M.', vv: '2:21:01', faded: true },
      { nm: 'Graves, C.', vv: '2:21:04', faded: true },
    ],
    more: 'See all performances →',
    href: '/records',
  },
  {
    num: 'No. 02 · Career',
    title: 'Sub-2:30 New Zealand marathoners',
    desc: 'Every athlete to break two-thirty over the marathon in NZ, ranked by lifetime best.',
    items: [
      { nm: 'Beyn, I.', vv: '2:19:32', faded: false },
      { nm: 'Balchin, D.', vv: '2:19:55', faded: false },
      { nm: 'Voss, M.', vv: '2:21:01', faded: false },
      { nm: 'Faherty, C.', vv: '2:24:12', faded: true },
      { nm: 'Graves, C.', vv: '2:25:18', faded: true },
    ],
    more: 'See all athletes →',
    href: '/athletes',
  },
  {
    num: 'No. 03 · Progressions',
    title: 'Course-record progressions',
    desc: 'How marks at the country\'s major events have come down since the archive began.',
    items: [
      { nm: 'Auckland · M', vv: '−7:54', faded: false },
      { nm: 'Rotorua · M', vv: '−12:04', faded: false },
      { nm: 'Auckland · W', vv: '−3:21', faded: false },
      { nm: 'Christchurch · M', vv: '−9:41', faded: true },
      { nm: 'Queenstown · W', vv: '−6:18', faded: true },
    ],
    more: 'Open progression atlas →',
    href: '/records',
  },
  {
    num: 'No. 04 · Rivalries',
    title: 'Head-to-heads, decided over years',
    desc: 'Two athletes, same race, repeated meetings. The archive keeps the ledger.',
    items: [
      { nm: 'Balchin v Voss', vv: '3–2', faded: false },
      { nm: 'Faherty v Graves', vv: '4–3', faded: false },
      { nm: 'Beyn v Baynes', vv: '2–1', faded: false },
      { nm: 'Logan v Twyman', vv: '2–3', faded: true },
      { nm: 'Thorby v Thorby', vv: '3–3', faded: true },
    ],
    more: 'See all rivalries →',
    href: '/compare',
  },
  {
    num: 'No. 05 · Longevity',
    title: 'Most-finished — Auckland Marathon',
    desc: 'Athletes with five or more recorded finishes at a single event, sorted by total starts.',
    items: [
      { nm: 'Godfrey, B.', vv: '8×', faded: false },
      { nm: 'Pulford, A.', vv: '7×', faded: false },
      { nm: 'Logan, D.', vv: '6×', faded: false },
      { nm: 'Thorburn, D.', vv: '5×', faded: true },
      { nm: 'McWhirter, B.', vv: '5×', faded: true },
    ],
    more: 'See all longevity holders →',
    href: '/athletes',
  },
  {
    num: 'No. 06 · Records',
    title: 'Current course records, by event',
    desc: 'The standing marks at every archived race — men\'s and women\'s, all distances.',
    items: [
      { nm: 'Auckland · 42k M', vv: '2:19:32', faded: false },
      { nm: 'Auckland · 42k W', vv: '2:38:10', faded: false },
      { nm: 'Rotorua · 42k M', vv: '2:21:44', faded: false },
      { nm: 'Christchurch · 42k M', vv: '2:22:08', faded: true },
      { nm: 'Queenstown · 42k W', vv: '2:51:03', faded: true },
    ],
    more: 'Open records →',
    href: '/records',
  },
];


export default function Index() {
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [searchQ,  setSearchQ]  = useState('');
  const [dropOpen, setDropOpen] = useState(false);

  // ⌘K / / keyboard shortcut — focus the landing input
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault(); inputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shellRef.current && !shellRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hideCaret = () => { if (caretRef.current) caretRef.current.style.display = 'none'; };
  const showCaret = () => { if (caretRef.current && !searchQ) caretRef.current.style.display = ''; };

  const closeDropdown = () => {
    setDropOpen(false);
    setSearchQ('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleExampleClick = (_label: string, href: string) => {
    setTimeout(() => navigate(href), 180);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setDropOpen(false);
      inputRef.current?.blur();
    }
  };

  // Featured record progression (from actual data, trim to 8)
  const prog = recordsMen.progression.slice(-8);

  return (
    <main>

      {/* Hero */}
      <section className="lp-hero">
        <div className="page">
          <div className="lp-hero-eyebrow">The New Zealand Running Archive</div>
          <h1 className="lp-hero-title">
            Every result. Every runner.<br />
            <em>New Zealand Running: <span style={{ color: 'var(--accent)' }}>Archived</span></em>
          </h1>
          <p className="lp-hero-sub">
            Results, records, athlete histories, and course progression from across New Zealand road, trail, and ultra running.
          </p>

          <div
            className="lp-search-shell"
            ref={shellRef}
            onClick={() => inputRef.current?.focus()}
          >
            <div style={{ position: 'relative' }}>
              <div className="lp-search-bar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ flex: '0 0 auto', color: 'var(--ink)' }}>
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <line x1="15.5" y1="15.5" x2="21" y2="21" />
                </svg>
                <input
                  ref={inputRef}
                  className="lp-search-input"
                  type="text"
                  placeholder="Search athletes, races, years…"
                  autoComplete="off"
                  onFocus={hideCaret}
                  onBlur={showCaret}
                  onKeyDown={handleKeyDown}
                  onChange={e => {
                    const v = e.target.value;
                    setSearchQ(v);
                    setDropOpen(v.length >= 2);
                    if (!v) showCaret();
                    else hideCaret();
                  }}
                />
                <span ref={caretRef} className="lp-search-caret" />
              </div>

              {dropOpen && (
                <InlineSearchDropdown query={searchQ} onClose={closeDropdown} />
              )}
            </div>

            <div className="lp-search-examples">
              <span className="lp-label-x">Try</span>
              {EXAMPLES.map((ex, i) => (
                <span key={ex.label} style={{ display: 'contents' }}>
                  {i > 0 && <span className="lp-sep">·</span>}
                  <Link to={ex.href} onClick={() => handleExampleClick(ex.label, ex.href)}>{ex.label}</Link>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Scale strip */}
      <div className="lp-scale">
        <div className="lp-scale-cell">
          <span className="label">Finisher records</span>
          <div className="lp-scale-num">{SITE_STATS.finisherRecords.toLocaleString()}</div>
          <div className="lp-scale-note">Certified field data</div>
        </div>
        <div className="lp-scale-cell">
          <span className="label">Athlete profiles</span>
          <div className="lp-scale-num">{SITE_STATS.athleteProfiles.toLocaleString()}</div>
          <div className="lp-scale-note">Two or more races logged</div>
        </div>
        <div className="lp-scale-cell">
          <span className="label">Tracked events</span>
          <div className="lp-scale-num">{SITE_STATS.trackedEvents}</div>
          <div className="lp-scale-note">Road · trail · ultra</div>
        </div>
        <div className="lp-scale-cell">
          <span className="label">Course records</span>
          <div className="lp-scale-num">{SITE_STATS.courseRecords}</div>
          <div className="lp-scale-note">Across all distances</div>
        </div>
        <div className="lp-scale-cell">
          <span className="label">Data from</span>
          <div className="lp-scale-num">{SITE_STATS.earliestEdition}</div>
          <div className="lp-scale-note">Wellington Half · first on record</div>
        </div>
      </div>

      {/* Front page — featured record + featured athlete */}
      <section style={{ padding: '80px 0 0' }}>
        <div className="page">
          <div className="lp-section-head">
            <div className="lp-line" />
            <h2 className="lp-title">On the front page</h2>
            <div className="lp-line" />
          </div>

          <div className="lp-twoup">
            {/* Featured record */}
            <div className="lp-cell">
              <div className="lp-cell-kicker">
                <span>Course record · Featured</span>
                <span>Auckland Marathon · {recordsMen.year}</span>
              </div>
              <h3>
                The current Auckland Marathon men's mark.{' '}
                <em>{recordsMen.time}.</em>
              </h3>
              <p className="lp-cell-lede">
                {recordsMen.holder} set the standing Auckland Marathon course record in {recordsMen.year},
                taking the mark down from the previous {recordsMen.previous.split('—')[0].trim()}.
                The Auckland course — point-to-point via the Harbour Bridge — is not considered fast, making the mark significant.
              </p>

              <div className="lp-record-hl">
                <div className="lp-record-time">{recordsMen.time}</div>
                <div className="lp-record-meta">
                  Men · 42.2 km<br />
                  Set {recordsMen.year}<br />
                  Auckland Marathon
                </div>
              </div>

              <div className="lp-mprog" aria-label="Record progression" style={{ gridTemplateColumns: `repeat(${prog.length}, 1fr)` }}>
                {prog.map((p, i) => (
                  <div key={i} className={`lp-mprog-step${p.current ? ' current' : ''}`}>
                    <div className="lp-mprog-yr">{p.y}</div>
                    <div className="lp-mprog-tt">{p.t}</div>
                    <div className="lp-mprog-nm">{p.name}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24 }}>
                <Link to="/races/auckland-marathon" className="lp-read-more">Open race page →</Link>
              </div>
            </div>

            {/* Featured athlete */}
            <div className="lp-cell">
              <div className="lp-cell-kicker">
                <span>Athlete · Featured</span>
                <span>Profile · 6 starts on file</span>
              </div>
              <h3>Dylan Logan — <em>consistent across the distance.</em></h3>
              <p className="lp-cell-lede">
                Auckland-based runner with finishes across Auckland, Christchurch, and Waterfront.
                Multiple sub-3:15 performances on file. Competed across half and full marathon distances since 2019.
              </p>

              <div className="lp-athlete-row">
                <div className="lp-portrait">Portrait</div>
                <div style={{ flex: 1 }}>
                  <div className="label" style={{ letterSpacing: '0.16em' }}>NZL · Auckland</div>
                  <div className="serif" style={{ fontSize: 38, lineHeight: 1, letterSpacing: '-0.015em', marginTop: 8 }}>3:06:28</div>
                  <div className="label" style={{ marginTop: 6 }}>Marathon PB · Christchurch 2025</div>
                </div>
              </div>

              <div className="lp-athlete-stats">
                <div>
                  <span className="label">42.2 km PB</span>
                  <div className="lp-stat-val">3:06:28</div>
                </div>
                <div>
                  <span className="label">21.1 km PB</span>
                  <div className="lp-stat-val">1:27:18</div>
                </div>
                <div>
                  <span className="label">Starts on file</span>
                  <div className="lp-stat-val">6</div>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <Link to="/athletes/dylan-logan" className="lp-read-more">Open athlete page →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Through the archive — rabbit holes */}
      <section style={{ padding: '80px 0 0' }}>
        <div className="page">
          <div className="lp-section-head">
            <div className="lp-line" />
            <h2 className="lp-title">Through the archive</h2>
            <div className="lp-line" />
          </div>
          <p style={{ textAlign: 'center', fontFamily: "'DM Mono', monospace", fontSize: 13, color: 'var(--meta)', margin: '-16px auto 36px', maxWidth: 560 }}>
            Curated lists. Updated by hand. Each opens into the underlying results.
          </p>

          <div className="lp-holes">
            {HOLES.map((hole) => (
              <div key={hole.num} className="lp-hole" onClick={() => navigate(hole.href)}>
                <div className="lp-hole-num">{hole.num}</div>
                <h4>{hole.title}</h4>
                <div className="lp-hole-desc">{hole.desc}</div>
                <ol>
                  {hole.items.map((item, i) => (
                    <li key={i} className={item.faded ? 'faded' : ''}>
                      <span className="lp-nm">{item.nm}</span>
                      <span className="lp-vv">{item.vv}</span>
                    </li>
                  ))}
                </ol>
                <span className="lp-more">{hole.more}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ledger — recently added */}
      <section style={{ padding: '80px 0 0' }}>
        <div className="page">
          <div className="lp-section-head">
            <div className="lp-line" />
            <h2 className="lp-title">Recently added to the record</h2>
            <div className="lp-line" />
          </div>

          <div className="lp-ledger">
            {RECENTLY_ADDED.map((row, i) => (
              <div key={i} className="lp-ledger-row">
                <div className="lp-ledger-date">{row.date}</div>
                <div className="lp-ledger-what">
                  <span className="lp-em">{row.em}</span>
                  <span className="lp-rest">{row.rest}</span>
                </div>
                {row.href
                  ? <Link to={row.href} className="lp-ledger-arrow" aria-label={`Go to ${row.em}`}>→</Link>
                  : <span className="lp-ledger-arrow lp-ledger-arrow--empty" />
                }
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A–Z index tease */}
      <section style={{ padding: '80px 0 0' }}>
        <div className="page">
          <div className="lp-section-head">
            <div className="lp-line" />
            <h2 className="lp-title">Athlete index</h2>
            <div className="lp-line" />
          </div>
          <div className="lp-az-bar">
            <div>
              <h3>140+ names,<br />arranged alphabetically.</h3>
              <p>
                Browse the index when you don't have a specific name in mind. Each entry links through to the athlete's career results and PB progressions.
              </p>
            </div>
            <div>
              <div className="lp-az">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                  <Link key={letter} to={`/athletes/letter/${letter.toLowerCase()}`}>{letter}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* bottom spacing before footer */}
      <div style={{ height: 80 }} />

    </main>
  );
}
