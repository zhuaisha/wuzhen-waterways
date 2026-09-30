import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import '../styles/deck.css';

/* ------------------------------------------------------------------ */
/* Presentation deck — a fullscreen 5-page slideshow built to the      */
/* PPT framework from the school task sheet. Page data is real,        */
/* reused from the site: 3 facts, 7–9 keywords, the 60–80 word English */
/* guide, and the closing challenge.                                    */
/* Navigation: arrows, keys (←/→/space), fullscreen (F / Esc), and    */
/* the page dots. Transitions run on transform/opacity only.          */
/* ------------------------------------------------------------------ */

const BASE = import.meta.env.BASE_URL;
const img = (k) => ({ webp: `${BASE}images/${k}-webp.webp`, jpg: `${BASE}images/${k}-jpg.jpg` });

/* 60–80 word English guide (the required "one page + image" deliverable) */
const GUIDE_WORDS = 74;
const GUIDE = [
  'Wuzhen is a water town in Zhejiang, where canals came first and the streets came later.',
  'Boats still cross its 72 stone bridges, and houses face the water the way they did a thousand years ago.',
  'Lanterns and reflections make the evening a second sightseeing tour.',
  'If you love quiet canals, old stone and a living old town, come — and take a boat with us.',
];

/* 7 keywords (7–9 allowed; the "keywords" requirement from the PPT frame) */
const KEYWORDS = ['WATER', 'BRIDGES', 'CANAL', 'BOATS', 'REFLECTION', 'LIFE', 'NIGHT'];

/* Three facts for "WHAT WE FOUND" — reused from the site */
const FACTS = [
  { n: '≈ 10,000 m', label: 'of waterways in Xizha', en: 'The canal system runs nearly ten kilometres through the old town.' },
  { n: '72', label: 'ancient stone bridges', en: 'Stone arches link the two banks — boats duck beneath them on the way through.' },
  { n: '1st', label: 'came the water', en: 'The canals were dug before the streets were paved; the town grew around the water.' },
];

const COUNT = 5;

/* one page: role + required content */
function Page({ i, active, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll('[data-d]');
    if (!active) {
      gsap.set(el, { autoAlpha: 0 });
      gsap.set(items, { autoAlpha: 0, y: 24 });
      return;
    }
    el.style.visibility = 'visible';
    const tl = gsap.timeline();
    tl.set(items, { autoAlpha: 0, y: 24 })
      .to(el, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' })
      .to(items, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out' }, 0.22)
      .to(el.querySelectorAll('[data-d="last"]'), { autoAlpha: 1, duration: 0.5 }, '>-0.2');
    return () => { tl.kill(); };
  }, [active]);
  return (
    <div ref={ref} className={`deck-page ${active ? 'is-active' : ''}`} aria-hidden={!active}>
      {children}
    </div>
  );
}

export default function Deck() {
  const [i, setI] = useState(0);
  const [fs, setFs] = useState(false);
  const rootRef = useRef(null);
  const go = (n) => setI(Math.max(0, Math.min(COUNT - 1, n)));

  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  };

  /* keyboard + fullscreen */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); setI((v) => Math.min(COUNT - 1, v + 1)); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); setI((v) => Math.max(0, v - 1)); }
      else if (e.key === 'Home') { e.preventDefault(); setI(0); }
      else if (e.key === 'End') { e.preventDefault(); setI(COUNT - 1); }
      else if (e.key === 'f' || e.key === 'F') toggleFs();
    };
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, []);

  return (
    <div ref={rootRef} className="deck" role="presentation">
      <div className="deck__stage">

        {/* 01 — COVER & GUIDE */}
        <Page i={0} active={i === 0}>
          <div className="deck-cover__bg" style={{ backgroundImage: `url(${BASE}images/hero_wuzhen-1920.webp)` }} />
          <div className="deck-cover__scrim" />
          <div className="deck-cover__inner" data-d>
            <div className="deck-cover__eyebrow" data-d>WUZHEN · GROUP 907 · WATERWAYS &amp; BRIDGES</div>
            <h1 className="deck-cover__title" data-d>WUZHEN</h1>
            <div className="deck-cover__sub" data-d>Waterways &amp; Bridges — why water is the main line of the ancient town</div>
            <div className="deck-cover__welcome" data-d>WELCOME TO OUR TOUR OF WUZHEN</div>
            <div className="deck-cover__members" data-d>
              <span data-d>01 蒋盛熠</span><span data-d>02 汪瀚宇</span><span data-d>03 鲁昂</span>
              <span data-d>04 朱钟乐</span><span data-d>05 沈毅程</span><span data-d>06 沈煜程</span>
            </div>
          </div>
        </Page>

        {/* 02 — WHAT WE FOUND */}
        <Page i={1} active={i === 1}>
          <div className="deck-page__head">
            <div className="deck-page__num">02</div>
            <div className="deck-page__role">WHAT WE FOUND</div>
          </div>
          <div className="deck-found">
            <figure className="deck-found__img" data-d>
              <img src={img('waterway').webp} alt="Wuzhen canal" loading="lazy" />
              <figcaption>A canal carries the whole town — the water came first.</figcaption>
            </figure>
            <div className="deck-found__facts">
              {FACTS.map((f, k) => (
                <div className="deck-found__fact" data-d key={f.n}>
                  <div className="deck-found__fact-n">{f.n}</div>
                  <div>
                    <div className="deck-found__fact-label">{f.label}</div>
                    <p className="deck-found__fact-en">{f.en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Page>

        {/* 03 — WHY IT MATTERS */}
        <Page i={2} active={i === 2}>
          <div className="deck-page__head">
            <div className="deck-page__num">03</div>
            <div className="deck-page__role">WHY IT MATTERS</div>
          </div>
          <div className="deck-why">
            <div className="deck-why__diagram" data-d>
              <div className="deck-node">WATER</div>
              <div className="deck-why__arrow">↓</div>
              <div className="deck-node">CONNECTS</div>
              <div className="deck-why__arrow">↓</div>
              <div className="deck-why__row">
                <span>HOUSES</span><span>BRIDGES</span><span>STREETS</span><span>PEOPLE</span><span>BOATS</span>
              </div>
              <div className="deck-why__arrow">↓</div>
              <div className="deck-node deck-node--soft">TRADITIONAL LIFE</div>
            </div>
            <div className="deck-why__side">
              <div className="deck-why__hl" data-d>Three things the water did for Wuzhen</div>
              <ul className="deck-why__list">
                <li data-d><b>It is the road.</b> Canals came before streets — the water is how the town connected.</li>
                <li data-d><b>It is home.</b> Laundry, trade and neighbours all happened at the water's edge.</li>
                <li data-d><b>It is the look.</b> Lanterns on the water at dusk are Wuzhen's signature image.</li>
              </ul>
              <div className="deck-why__hometown" data-d>
                <i>HOMELINK</i>
                <p>Wuzhen shows how a town can grow around water — and keep its shape around it.</p>
              </div>
            </div>
          </div>
        </Page>

        {/* 04 — ENGLISH GUIDE (60–80 words + image + source) */}
        <Page i={3} active={i === 3}>
          <div className="deck-page__head">
            <div className="deck-page__num">04</div>
            <div className="deck-page__role">OUR ENGLISH GUIDE</div>
            <div className="deck-page__count">{GUIDE_WORDS} words</div>
          </div>
          <div className="deck-guide">
            <div className="deck-guide__text" data-d>
              {GUIDE.map((s, k) => <p key={k}>{s}</p>)}
            </div>
            <figure className="deck-guide__img" data-d>
              <img src={img('night').webp} alt="Wuzhen at night, lanterns over the water" loading="lazy" />
              <figcaption>Wuzhen at night — lanterns over the water. <a href="#sources" onClick={(e) => { e.preventDefault(); location.hash = ''; }}>Source &amp; license</a></figcaption>
            </figure>
          </div>
        </Page>

        {/* 05 — THE CHALLENGE */}
        <Page i={4} active={i === 4}>
          <div className="deck-page__head">
            <div className="deck-page__num">05</div>
            <div className="deck-page__role">THE CHALLENGE</div>
          </div>
          <div className="deck-challenge">
            <div className="deck-challenge__task" data-d>
              <div className="deck-challenge__label">YOUR TURN</div>
              <p>Can you spot where water still runs the town today?</p>
            </div>
            <div className="deck-challenge__invite" data-d>
              <div className="deck-challenge__label">IN ENGLISH</div>
              <p>“Visit Wuzhen by boat — the water is the road.”</p>
            </div>
            <div className="deck-challenge__q" data-d>
              <div className="deck-challenge__label">QUESTION</div>
              <p>If the canals were blocked, what would Wuzhen lose?</p>
            </div>
          </div>
          <div className="deck-challenge__foot" data-d>
            <span>907G6 · WUZHEN WATERWAYS &amp; BRIDGES</span>
            <span>THANK YOU</span>
          </div>
        </Page>
      </div>

      {/* controls */}
      <div className="deck__hud">
        <button className="deck__btn" type="button" onClick={() => go(i - 1)} aria-label="Previous" disabled={i === 0}>←</button>
        <div className="deck__dots">
          {Array.from({ length: COUNT }).map((_, k) => (
            <button
              key={k}
              type="button"
              className={`deck__dot ${k === i ? 'is-on' : ''}`}
              aria-label={`Page ${k + 1}`}
              onClick={() => go(k)}
            />
          ))}
        </div>
        <button className="deck__btn" type="button" onClick={() => go(i + 1)} aria-label="Next" disabled={i === COUNT - 1}>→</button>
        <button className="deck__btn deck__btn--fs" type="button" onClick={toggleFs} aria-label="Fullscreen">
          {fs ? '✕' : '⛶'}
        </button>
        <span className="deck__count">{i + 1} / {COUNT}</span>
      </div>
    </div>
  );
}
