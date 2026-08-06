import { Link } from 'react-router-dom';

import '../styles/methodology.css';
import WMA from '../data/wmaRoad2025.json';

/**
 * /methodology — the archive's standing decisions, in one place.
 *
 * Everything here is an existing decision, not new policy. The page exists
 * because each of these is something a serious runner might reasonably
 * question, and answering them openly is what separates an archive from a
 * results aggregator.
 *
 * Figures that could drift (the age-grade revision, its approval date) are
 * read from the derived data file rather than typed into the copy.
 */

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="meth-section" id={id}>
      <div className="section-rule-bar">
        <div className="line" />
        <h2 className="title">{title}</h2>
        <div className="line" />
      </div>
      {children}
    </section>
  );
}

export default function Methodology() {
  const { revision, approval, url, licence, compiler } = WMA.source;

  return (
    <main className="methodology">
      <div className="page">
        <header className="meth-head">
          <div className="eyebrow mb-16">The archive · How it works</div>
          <h1>Methodology</h1>
          <p className="lede">
            LOGS is a record of what happened, compiled by hand from published results. Where the
            archive makes a judgement — how a time is graded, when two results can be compared,
            whether a name belongs to one runner — that judgement is written down here rather than
            left implicit in the page.
          </p>
          <p className="lede">
            The governing rule is that absence beats invention. Where the archive does not know
            something, it shows nothing: no estimate, no interpolation, no placeholder standing in
            for a fact.
          </p>
        </header>

        <nav className="meth-toc" aria-label="On this page">
          {[
            ['age-grading', 'Age grading'],
            ['trail', 'Trail and ultra'],
            ['identity', 'Categories and identity'],
            ['results', 'Results handling'],
            ['courses', 'Course profiles'],
            ['sources', 'Sources and corrections'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`}>{label}</a>
          ))}
        </nav>

        <Section id="age-grading" title="Age grading">
          <p>
            An age grade expresses a time as a percentage of the standard for that age and gender.
            100% is a world-best-equivalent run; above 80% is broadly national class. It is the
            only way to compare a 3:10 marathon run at 34 with one run at 62 and say something
            true about both.
          </p>
          <p>
            LOGS uses the <strong>WMA/USATF road running age standards, {revision} revision</strong>,
            compiled by {compiler} and published under {licence}. {approval}. The tables are read
            directly from the published workbooks by a committed script; no value is transcribed
            by hand.
          </p>
          <p>
            The standards are natively developed for 5 km, 10 km, half-marathon and marathon, with
            every other distance in the tables interpolated from those four. LOGS records exactly
            those four road distances, so no interpolated value is ever used.
          </p>

          <div className="meth-callout">
            <div className="k">Male and female tables are independent</div>
            <p>
              An earlier version of this site approximated female standards as the male ones
              multiplied by a constant. That was wrong in shape, not merely in precision: the real
              ratio between the female and male standards varies from 1.07 to 1.36 across the
              table. The female tables were re-fitted against real data in 2010 for exactly this
              reason — the previous set was too soft for older women at longer distances, and
              produced grades above 100% for runs that did not merit them. Both tables are now
              taken as published, and no approximation remains in the code.
            </p>
          </div>

          <h3>How age is determined</h3>
          <p>
            The tables are keyed to single years of age. Published results almost never give a
            birth date — they give the age band the runner competed in. The archive therefore
            estimates, and is explicit about it:
          </p>
          <ul className="meth-list">
            <li>
              <span className="k">Exact age</span>
              <span>Used wherever the source publishes one.</span>
            </li>
            <li>
              <span className="k">Band midpoint</span>
              <span>
                Otherwise. <em>M 40–44</em> grades at 42. The midpoint distributes the error
                symmetrically — roughly ±2 years on a five-year band — where taking the band's
                lower bound would bias every estimate the same way, by up to four years, and worst
                at older ages where the curve is steepest.
              </span>
            </li>
            <li>
              <span className="k">Open-ended bands</span>
              <span>
                <em>M 70+</em> has no midpoint. The convention is the lower bound plus three, so
                it grades at 73. Bands written as a catch-all range — <em>M 70–99</em> — are the
                same thing and are treated the same way.
              </span>
            </li>
            <li>
              <span className="k">Unusable bands</span>
              <span>
                Some sources carry bands that cannot be read as an age at all: inverted ranges,
                zero-width ranges, or labels like <em>Open</em> and <em>Elite</em> that record no
                age. These produce no age grade. The figure is simply absent.
              </span>
            </li>
          </ul>
          <p>
            Because most grades rest on a ±2-year estimate, they are shown to whole numbers. A
            grade is quoted to one decimal place only where the source published a real age.
          </p>

          <div className="meth-callout accent">
            <div className="k">Trail results are never age-graded</div>
            <p>
              The tables model road running. They account for neither terrain nor vertical gain,
              so a normalised trail time would systematically flatter the easier course. No trail
              result on this site carries an age grade, and no trail figure is combined with a
              road one.
            </p>
          </div>
        </Section>

        <Section id="trail" title="Trail and ultra">
          <p>
            Road's model — one race, a fixed distance, once a year — does not survive contact with
            trail. Courses are re-measured, rerouted around slips and fire risk, renamed, split and
            merged. The archive models trail as{' '}
            <strong>event family → edition → sub-event → course instance</strong>, and stores the
            real measured distance for each year rather than rounding it to a nominal one.
          </p>
          <ul className="meth-list">
            <li>
              <span className="k">Never a personal best</span>
              <span>
                A trail time is a result in context, not a best. Because the course changes between
                editions, two times at the same event are not measuring the same thing. The only
                honest time comparison on trail is the same course instance, run again — and that
                is the only comparison the site draws.
              </span>
            </li>
            <li>
              <span className="k">Never summed with road</span>
              <span>
                Road and trail totals are kept apart everywhere: no combined career distance, no
                blended ranking, no shared progression line.
              </span>
            </li>
            <li>
              <span className="k">Altered editions are shown as altered</span>
              <span>
                A cancelled year is shown cancelled rather than skipped — 2022 Tarawera. Contingency
                courses are marked and excluded from course-era records: the 2014 cyclone
                replacements, and the altered courses of 2013 and 2023.
              </span>
            </li>
            <li>
              <span className="k">Vertical gain is not published</span>
              <span>
                Not until surveyed figures exist per course instance. An estimated climb would be
                indistinguishable from a measured one on the page, so the slot is left visibly
                empty instead.
              </span>
            </li>
          </ul>
        </Section>

        <Section id="identity" title="Categories and identity">
          <p>
            The category a race printed is preserved exactly as <code>catRaw</code>. A normalised
            World Athletics-style band is stored alongside it for comparison across events. Neither
            overwrites the other, so a normalisation decision can always be re-examined against
            what the source actually said.
          </p>
          <p>
            Athletes are grouped by name matching. New Zealand is small, but it is not small enough
            for that to be safe: there is more than one Dave Wilson, and the archive cannot always
            tell them apart from a results file.
          </p>
          <div className="meth-callout accent">
            <div className="k">Where a profile may combine several runners</div>
            <p>
              It says so, and it withholds everything that assumes one person: career totals, wins
              and podiums, progression lines, age grades. What remains is the results table, because
              every individual result in it is accurate and correctly recorded. Only the grouping is
              uncertain. Runners will be able to claim their own records.
            </p>
          </div>
          <p>
            The flag is derived, not curated. It is recomputed from the evidence on every build —
            two finishes in one edition, or two incompatible age bands in one year — so a profile
            that is genuinely resolved stops being flagged automatically, and one that is not stays
            flagged whatever anyone believes about it.
          </p>
        </Section>

        <Section id="results" title="Results handling">
          <ul className="meth-list">
            <li>
              <span className="k">Individual finishers only</span>
              <span>
                Relay legs and team entries are excluded — this is an archive of individual
                performances. Because official placings are drawn from the source, positions may
                skip where a team occupied one.
              </span>
            </li>
            <li>
              <span className="k">Times as published</span>
              <span>
                The archive stores the official published time, which is <strong>gun time</strong>{' '}
                where a source publishes both. This is a consistency requirement, not a preference:
                finishing positions are determined by gun time, so displaying net times against
                gun-derived positions would let a results table contradict itself — showing a runner
                as faster than the person recorded ahead of them. Where a source publishes a net
                time as well, it is kept, but it is not what the position was scored on and so is
                not what is shown.
              </span>
            </li>
            <li>
              <span className="k">Repairs must be provable</span>
              <span>
                A known source defect is corrected only where the correction follows from the data
                itself. Some ultra exports store elapsed time modulo 24 hours, so a 25-hour finish
                appears as one hour; this is repaired using finish order, which determines the
                answer unambiguously. Implausible values that cannot be repaired that way are
                preserved as published rather than guessed at.
              </span>
            </li>
            <li>
              <span className="k">Field percentile</span>
              <span>
                Computed as finishing position over the number of finishers in that event and year.
                For a top-three finish the placing is shown instead — a percentile understates a
                win.
              </span>
            </li>
          </ul>
        </Section>

        <Section id="courses" title="Course profiles">
          <p>
            Elevation profiles on race pages are <strong>indicative</strong>. They are drawn from
            known route characteristics to convey the shape of a course — where the climbing sits,
            roughly how much there is — and they are not surveyed or GPS-derived. They should be
            read as illustration, not measurement, and no figure on the site is calculated from
            them.
          </p>
        </Section>

        <Section id="sources" title="Sources and corrections">
          <p>
            Results are compiled from published race results, timing-provider records, official
            PDFs and files supplied by organisers. Sources are logged per race-year, and external
            reference data is archived in the repository alongside what derives from it — the
            age-grade workbooks are kept as files rather than as a link, on the same principle that
            keeps the original results PDFs.
          </p>
          <p>
            The archive is maintained by hand and it will contain errors. Corrections are genuinely
            welcome — a wrong time, a missing finish, two people merged into one, a course distance
            that was never right.
          </p>
          <div className="meth-actions">
            <a className="btn" href="mailto:dyl.logannz@gmail.com?subject=LOGS%20correction">
              Submit a correction →
            </a>
            <Link className="btn" to="/races">Browse the archive →</Link>
          </div>
          <p className="meth-credit">
            Age-grading tables compiled by {compiler} for World Masters Athletics and USATF,{' '}
            <a href={url} target="_blank" rel="noreferrer noopener">
              published on GitHub
            </a>{' '}
            under {licence}. Used with thanks.
          </p>
        </Section>
      </div>
    </main>
  );
}
