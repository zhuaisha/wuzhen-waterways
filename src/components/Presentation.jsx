import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';
import '../styles/presentation.css';

/* ------------------------------------------------------------------ */
/* PRESENTATION DAY — week 4's show requirements, matching the        */
/* reference screenshot: two side-by-side cards (the 5-part timing    */
/* plan + the 5-page PPT framework). No submissions grid, no spec     */
/* chips. The standalone .pptx is linked from the team / summary pages. */
/* ------------------------------------------------------------------ */

const TIMELINE = [
  { t: '≈ 30 s', en: 'OPENING', cn: '开场', d: 'Introduce the group and the theme.' },
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

export default function Presentation() {
  return (
    <section id="presentation" className="section presentation-section">
      <div className="container">
        <SectionHeader number="09" en="PRESENTATION DAY" cn="SHOW-DAY REQUIREMENTS" week="Week 04" />

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
      </div>
    </section>
  );
}
