import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';
import '../styles/presentation.css';

/* ------------------------------------------------------------------ */
/* PRESENTATION DAY — week 4's show requirements, distilled from the  */
/* two school task sheets: the 5-part timing plan, the 5-page PPT     */
/* framework, production specs, the six submission items, and the     */
/* file-naming rule.                                                  */
/* ------------------------------------------------------------------ */

const TIMELINE = [
  { t: '≈ 30 s', en: 'OPENING', cn: '开场', d: 'Introduce the group and the theme, and issue the challenge invitation.' },
  { t: '1–2 min', en: 'CULTURE DISCOVERY', cn: '文化发现', d: 'What we studied, and the most important findings.' },
  { t: '1–2 min', en: 'WHY RECOMMEND', cn: '推荐理由', d: 'Cultural highlights, the hometown link, and our reasons.' },
  { t: '1–2 min', en: 'ENGLISH GUIDE', cn: '英文导览', d: 'The 60–90 second English recommendation, live.' },
  { t: '≈ 1 min', en: 'INTERACTION', cn: '互动结展', d: 'One question — or a quick vote — then close.' },
];

const PAGES = [
  { p: '01', role: 'COVER & GUIDE', must: 'Theme name · group number & members · one representative image · an English welcome line' },
  { p: '02', role: 'WHAT WE FOUND', must: 'A one-sentence intro · 1–2 images · three key facts' },
  { p: '03', role: 'WHY IT MATTERS', must: '2–3 highlights · the hometown link · one recommendation line' },
  { p: '04', role: 'ENGLISH GUIDE', must: 'A 60–80 word guide · keywords · image with its source credited' },
  { p: '05', role: 'THE CHALLENGE', must: 'The challenge task · an English invitation · one discussion question' },
];

const SUBMISSIONS = [
  'Final presentation PPT — about 5 pages, in PPTX',
  'Final English guide page — 60–80 words, with the image source',
  'Presentation script or outline — CN points + the EN guide',
  'Sources list — texts, images and interviews',
  'Roles & process record — every member, plus one major revision',
  'Group reflection — what worked, what to improve',
];

const SPECS = [
  ['01', 'One slide, one idea — body under 6 lines, readable from the back row'],
  ['02', '1–2 images per slide, and every image is credited'],
  ['03', 'Keywords on the screen — the details are spoken, never pasted'],
  ['04', 'Face the class, never read the slide — and every member speaks'],
];

export default function Presentation() {
  const openDeck = () => {
    location.hash = '#deck';
  };

  return (
    <section id="presentation" className="section presentation-section">
      <div className="container">
        <SectionHeader number="09" en="PRESENTATION DAY" cn="展示日 · 四周收官" week="Week 04" />

        <div className="pres-grid">
          <Reveal className="pres-col">
            <div className="pres-col__head">
              TIMELINE
              <span>5–9 MIN TOTAL</span>
            </div>
            <div className="pres-tl">
              {TIMELINE.map((row) => (
                <div className="pres-tl__row" key={row.en}>
                  <div className="pres-tl__time">{row.t}</div>
                  <div>
                    <div className="pres-tl__name">
                      {row.en}
                      <i>{row.cn}</i>
                    </div>
                    <div className="pres-tl__desc">{row.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="pres-col" delay={140}>
            <div className="pres-col__head">
              PPT FRAMEWORK
              <span>5 PAGES</span>
            </div>
            <div className="pres-pages">
              {PAGES.map((pg) => (
                <div className="pres-pages__row" key={pg.p}>
                  <div className="pres-pages__num">{pg.p}</div>
                  <div>
                    <div className="pres-pages__role">{pg.role}</div>
                    <div className="pres-pages__must">{pg.must}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal className="pres-subs">
          <div className="pres-col__head">
            SUBMISSIONS
            <span>SIX ITEMS BEFORE THE SHOW</span>
          </div>
          <div className="pres-subs__grid">
            {SUBMISSIONS.map((s) => (
              <div className="pres-subs__item" key={s}>
                <span className="pres-subs__box" aria-hidden="true" />
                {s}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="pres-specs">
          <div className="pres-col__head">
            HOW TO BUILD THE SLIDES
          </div>
          <div className="pres-specs__row">
            {SPECS.map(([n, s]) => (
              <div className="pres-specs__chip" key={n}>
                <b>{n}</b>
                {s}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="pres-foot">
          <div className="pres-naming">
            <span>FILE NAMING</span>
            <code>907G6_乌镇水道_展示PPT</code>
          </div>
          <button type="button" className="pres-deck-btn" onClick={openDeck}>
            OPEN THE PRESENTATION DECK
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Reveal>
      </div>
    </section>
  );
}
