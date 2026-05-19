import { useState } from 'react';
import ElevationChart from '@/components/ElevationChart';

const devHalfElevation: [number, number][] = [
  [0,5],[1,8],[2,10],[3,10],[3.7,8],
  [4.5,8],[5,10],[6,15],[6.5,40],[7.5,87],[8,55],[8.5,8],
  [9,5],[9.3,5],[10,5],
  [11,8],[12,10],[13,10],[13.7,8],
  [14.5,8],[15,10],[16,15],[16.5,40],[17.5,87],[18,55],[18.5,8],
  [19,5],[19.3,5],[20,5],
  [20.5,5],[21.1,5],
];

const devHalfAnnotations = [
  { km: 0,    label: 'Start' },
  { km: 3.7,  label: 'Narrow Neck' },
  { km: 7.5,  label: 'North Head' },
  { km: 13.7, label: 'Narrow Neck' },
  { km: 17.5, label: 'North Head' },
  { km: 21.1, label: 'Finish' },
];

const dev10kElevation: [number, number][] = [
  [0,5],[1,8],[2,10],[3,10],[3.7,8],
  [4.5,8],[5,10],[6,15],[6.5,40],[7.5,87],[8,55],[8.5,8],
  [9,5],[9.3,5],[10,5],
];

const dev10kAnnotations = [
  { km: 0,   label: 'Start' },
  { km: 3.7, label: 'Narrow Neck' },
  { km: 7.5, label: 'North Head' },
  { km: 10,  label: 'Finish' },
];

export default function Devonport() {
  const [distId, setDistId] = useState<'half' | '10k'>('half');
  const isHalf = distId === 'half';

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Auckland · Devonport</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Devonport Half Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                <button className={`pill ${isHalf ? 'active' : ''}`} onClick={() => setDistId('half')}>21.1 km</button>
                <button className={`pill ${!isHalf ? 'active' : ''}`} onClick={() => setDistId('10k')}>10 km</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Devonport, Auckland</div></div>
              <div><div className="label mb-8">Course</div><div>{isHalf ? '2-lap loop' : 'Peninsula loop'}</div></div>
              <div><div className="label mb-8">Next edition</div><div>27 Sep 2026</div></div>
              <div>
                <div className="label mb-8">Entry</div>
                <div><a href="https://devonport.werun.nz/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 }}>devonport.werun.nz ↗</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course profile */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Race overview · {isHalf ? '21.1 km' : '10 km'}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                {isHalf ? 'Half marathon' : '10 km'} course profile
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
              Mixed · road, trail & seawall · Devonport peninsula
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart
                data={isHalf ? devHalfElevation : dev10kElevation}
                annotations={isHalf ? devHalfAnnotations : dev10kAnnotations}
              />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: isHalf ? '~170 m' : '~85 m', sub: '↑ cumulative' },
                  { label: 'Descent', val: isHalf ? '~170 m' : '~85 m', sub: '↓ cumulative' },
                  { label: 'Net',     val: '0 m',                        sub: 'loop to start' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '20px 16px', borderRight: i < 2 ? '0.5px solid var(--rule-soft)' : 'none' }}>
                    <div className="label">{item.label}</div>
                    <div className="serif mt-8" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>{item.val}</div>
                    <div className="dimmed mt-8" style={{ fontSize: 10.5 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              <div className="mt-24" style={{ fontSize: 12, lineHeight: 1.6 }}>
                <div className="label mb-8">Surface</div>
                <div>Mixed · sealed road, trail path, shell seawall</div>
                <div className="label mt-16 mb-8">Character</div>
                <div>{isHalf
                  ? "Two laps of the Devonport peninsula loop, finishing with a short out-and-back. The course climbs North Head twice, rewarding runners with panoramic views of Rangitoto Island and the Auckland city skyline. One of the most scenic — and most challenging — half marathons in Auckland."
                  : "A single loop tour of the eastern Devonport peninsula. Mostly flat with a turnaround at Narrow Neck Beach before the challenging climb up North Head, with views of Rangitoto Island and the city skyline on the descent."
                }</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
