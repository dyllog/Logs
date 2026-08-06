#!/usr/bin/env python3
"""
dunedinPdfToJson.py — Convert Emerson's Dunedin Marathon results PDFs to LOGS JSON.

Usage: python3 dunedinPdfToJson.py <input.pdf> <output.json> [--distance mar|half|10k]

Requires: pdfplumber  (pip install pdfplumber)
          node        (for scripts/lib/normalizeCatCli.mjs — see `cat` below)

Parses ONLY the main results section (the PDF repeats the same finishers in
age-group and club re-sort views; those are redundant — but their totals are
used as a cross-check).

Output row shape matches the existing LOGS results-*.json convention:
  { pos, name, bib, cat, catRaw, club, time, sec, age, city, splits? }

- Gender is derived from which gender-position column is populated (Men/Women).
- `cat` is computed from the exact Age column — richer than the PDF's own coarse
  categories (Senior U35 / 35-49 / 50+), which are preserved in catRaw — and is
  then passed through the archive's normalizeCat so the spelling matches every
  other source. See `normalize_cats` below for why that round-trip exists.
- `time`/`sec` use GUN time — the LOGS archive convention, because finish
  positions derive from gun time, so displaying net against gun-ordered
  positions would let a table contradict itself. Net (chip) time is preserved
  separately in netTime/netSec where the source publishes it.
- NO `nat` FIELD IS EMITTED. See the note under `parse()`.
- `age` is an exact published age, which almost no other LOGS source carries.
  Note for whoever wires up the ingest: buildAthleteCanon.mjs does not yet
  carry `age` through to the profile shards. Until it does, these ages stop at
  the results file and the exact-age age-grading path stays dormant.
- DNFs and manually-timed (*) rows are excluded from the main array and
  reported in the summary (stored in a `dnf` sidecar list).
"""
import sys, json, re, subprocess, shutil
from pathlib import Path

import pdfplumber

REPO_ROOT = Path(__file__).resolve().parent.parent
NORMALIZE_CLI = REPO_ROOT / 'scripts' / 'lib' / 'normalizeCatCli.mjs'


def tsec(t):
    if not t: return None
    t = t.strip().rstrip('*')
    m = re.match(r'^(\d+):(\d{2}):(\d{2})$', t)
    if not m: return None
    return int(m.group(1))*3600 + int(m.group(2))*60 + int(m.group(3))


def raw_band(gender, age):
    """
    Band from an exact age, in RAW form — deliberately not the final spelling.

    This is input to normalizeCat, not output. The archive's canonical band
    spelling (en-dash, plus a set of historical-band rules) is owned by
    scripts/normalizeCats.mjs and nowhere else; emitting a finished string here
    would make this file a second authority on it, which is how you end up with
    "M 35–39" and "M 35-39" coexisting as distinct bands in the same profile.
    """
    g = 'M' if gender == 'M' else 'W'
    if age is None: return f'{g} Open'
    a = int(age)
    if a < 20: return f'{g} 18-19' if a >= 18 else f'{g} U18'
    if a >= 75: return f'{g} 75+'
    lo = (a // 5) * 5
    return f'{g} {lo}-{lo+4}'


def normalize_cats(bands):
    """
    Map raw bands → archive-canonical bands via scripts/lib/normalizeCatCli.mjs.

    Shelling out to the real implementation keeps a single source of truth for
    category spelling across a Python converter and six JS ones. One subprocess
    call per file, passing only the distinct bands (a few dozen at most).
    """
    distinct = sorted({b for b in bands if b})
    if not distinct:
        return {}
    if shutil.which('node') is None:
        sys.exit('error: `node` not found on PATH — required to normalise categories.')
    if not NORMALIZE_CLI.exists():
        sys.exit(f'error: missing {NORMALIZE_CLI}')
    proc = subprocess.run(
        ['node', str(NORMALIZE_CLI)],
        input=json.dumps(distinct), capture_output=True, text=True, encoding='utf-8',
    )
    if proc.returncode != 0:
        sys.exit(f'error: category normalisation failed — {proc.stderr.strip()}')
    mapping = json.loads(proc.stdout)
    missing = [b for b in distinct if b not in mapping]
    if missing:
        sys.exit(f'error: normaliser returned no value for: {missing}')
    return mapping


def clean(s):
    return re.sub(r'\s+', ' ', (s or '')).strip()


def parse(pdf_path):
    """
    NO NATIONALITY IS DERIVED HERE, DELIBERATELY.

    The source publishes a City column — "Dunedin", "Wagga Wagga - Australia",
    "Kamloops - Canada". That is place of residence, not nationality: a New
    Zealander living in Sydney appears as "Sydney - Australia". Mapping it to
    `nat` is a category error however carefully it is done, and emitting it for
    only the "evidenced" overseas rows would just produce a smaller set of
    confident-looking wrong values.

    Because national placing is computed only where a race-year's nationality
    coverage is near-complete, emitting nothing means Dunedin sits at 0%
    coverage and national placing is correctly withheld — rather than being
    computed over invented data and looking authoritative.

    The location is still kept, as what it actually is: the `city` field.
    """
    rows, dnfs = [], []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            head = (page.extract_text() or '')[:200]
            # Main section only: "Full Marathon" (not "age groups", not "clubs")
            if 'age groups' in head or 'clubs and/or Teams' in head:
                continue
            table = page.extract_table()
            if not table: continue
            header = [clean(c) for c in table[0]]
            if 'First Name' not in header: continue
            idx = {h: i for i, h in enumerate(header)}
            def col(r, name):
                i = idx.get(name)
                return clean(r[i]) if i is not None and i < len(r) else ''
            for r in table[1:]:
                first, last = col(r,'First Name'), col(r,'Last Name')
                if not first and not last: continue
                gun, net = col(r,'Gun Time'), col(r,'Net Time')
                overall = col(r,'Overall Pos')
                men, women = col(r,'Men'), col(r,'Women')
                age = col(r,'Age')
                city = col(r,'City')
                club = col(r,'Club and/or Team')
                bib = col(r,'Bib')
                name = f'{first} {last}'.strip()
                gender = 'M' if men and men != 'DNF' else ('F' if women and women != 'DNF' else None)
                if overall == 'DNF' or (not tsec(net) and not tsec(gun)):
                    dnfs.append({'name': name, 'bib': bib, 'gender': gender,
                                 'age': int(age) if age.isdigit() else None, 'city': city})
                    continue
                # raw category = which of the PDF's category columns is populated
                catRaw = None
                for cr, label in [('Senior Men (U35)','Senior Men (U35)'), ('Senior Women (U35)','Senior Women (U35)'),
                                  ('M35- 49','M35-49'), ('W35- 49','W35-49'), ('M50+','M50+'), ('W50+','W50+')]:
                    if col(r, cr):
                        catRaw = label; break
                a = int(age) if age.isdigit() else None
                sec = tsec(gun) or tsec(net)
                manually_timed = '*' in (gun or '') or '*' in (net or '')
                row = {
                    'pos': int(overall) if overall.isdigit() else None,
                    'name': name,
                    'bib': int(bib) if bib.isdigit() else bib,
                    'cat': raw_band(gender, a),   # normalised in a batch below
                    'catRaw': catRaw or '',
                    'club': club or '—',
                    'time': gun.rstrip('*') or net,
                    'sec': sec,
                    'netTime': net or None,
                    'netSec': tsec(net),
                    'age': a,
                    'city': city,
                }
                s33, s39 = tsec(col(r,'33 km')), tsec(col(r,'39 km'))
                if s33 or s39:
                    row['splits'] = {}
                    if s33: row['splits']['33km'] = col(r,'33 km')
                    if s39: row['splits']['39km'] = col(r,'39 km')
                if manually_timed: row['manuallyTimed'] = True
                rows.append(row)

    # Single batched round-trip through the archive's category normaliser.
    mapping = normalize_cats([r['cat'] for r in rows])
    for r in rows:
        r['cat'] = mapping.get(r['cat'], r['cat'])

    rows.sort(key=lambda x: (x['pos'] is None, x['pos']))
    return rows, dnfs


def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    inp, outp = sys.argv[1], sys.argv[2]
    rows, dnfs = parse(inp)
    with open(outp, 'w', encoding='utf-8') as f:
        json.dump(rows, f, indent=1, ensure_ascii=False)
    # Summary + sanity checks
    men = sum(1 for r in rows if r['cat'].startswith('M'))
    women = sum(1 for r in rows if r['cat'].startswith('W'))
    missing_age = sum(1 for r in rows if r['age'] is None)
    missing_sec = sum(1 for r in rows if r['sec'] is None)
    pos_list = [r['pos'] for r in rows if r['pos']]
    gaps = [p for p in range(1, max(pos_list)+1) if p not in set(pos_list)] if pos_list else []
    bands = sorted({r['cat'] for r in rows})
    print(f'finishers: {len(rows)}  (M {men} / W {women})   DNF: {len(dnfs)}')
    print(f'missing age: {missing_age}   missing time: {missing_sec}')
    print(f'position gaps: {gaps if gaps else "none"}')
    print(f'bands: {" ".join(bands)}')
    print('nationality: not emitted (source publishes residence, not nationality)')
    if dnfs:
        with open(outp.replace('.json', '-dnf.json'), 'w', encoding='utf-8') as f:
            json.dump(dnfs, f, indent=1, ensure_ascii=False)


if __name__ == '__main__':
    main()
