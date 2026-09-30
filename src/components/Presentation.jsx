import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';
import '../styles/presentation.css';

/* ------------------------------------------------------------------ */
/* PRESENTATION DAY — week 4's show requirements, distilled from the  */
/* two school task sheets: the 5-part timing plan and the 5-page PPT  */
/* framework, with the file-naming rule. The full 5-page deck is a    */
/* standalone .pptx — wuzhen_waterways_presentation.pptx in public/.  */
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

export default function Presentation() {
  return (
    <section id="presentation" className="section presentation-section">
      <div className="container">
        <SectionHeader number="09" en="PRESENTATION DAY" cn="WEEK FOUR · THE FINAL SHOW" week="Week 04" />

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

        <Reveal className="pres-foot">
          <div className="pres-naming">
            <span>FILE NAMING</span>
            <code>907G6_乌镇水道_展示PPT</code>
          </div>
          <a
            className="pres-deck-btn"
            href={`${import.meta.env.BASE_URL}assets/wuzhen_waterways_presentation.pptx`}
            download
          >
            DOWNLOAD THE FULL 10-PAGE PPTX
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
