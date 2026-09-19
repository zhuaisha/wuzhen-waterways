import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeader from './SectionHeader.jsx';
import { GROUP_PHOTO, GROUP_HEADCOUNT, MEMBERS } from '../data/team.js';

gsap.registerPlugin(ScrollTrigger);

/*
 * OUR TEAM — an editorial spread: one group plate as the section's anchor,
 * six portraits beneath it as entry points into a glass detail panel.
 *
 * Nothing here pairs a portrait with a person inside the group photo. The six
 * uniformed boys are too similar to match up by eye, and a wrong mapping would
 * be worse than none, so hovering a member only brightens the group plate as a
 * whole rather than spotlighting a guessed spot.
 */
const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Pointer work is desktop-only; touch devices get none of the follow. */
const canHover = () =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(hover: none)').matches;

/*
 * One entrance tween. `gsap.context()` runs its callback synchronously while
 * the context variable is still unassigned, so the callback may only call
 * `gsap` directly — context() tracks those tweens and reverts them. Same
 * pattern as Reveal.jsx. Reduced motion leaves elements at their natural
 * visible state; no fade, no movement.
 */
function addReveal(el, { at = 0, duration = 0.85, y = 34, blur = 8 } = {}) {
  if (!el || prefersReduced()) return;
  gsap.fromTo(
    el,
    { opacity: 0, y, filter: `blur(${blur}px)` },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration,
      delay: at,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: document.querySelector('#team'),
        start: 'top 74%',
        end: 'top 28%',
        toggleActions: 'play none none reverse',
      },
    }
  );
}

/* AVIF -> WebP -> JPG, so a browser that cannot decode AVIF still gets a file.
 * `src` is always a plain-URL map; `srcSet` (optional) is a srcset string map
 * that only belongs on <source>. The <img src> must stay a single URL —
 * feeding it a srcset string ("a.avif 4096w, b.avif 1120w") makes the browser
 * request a nonsense URL and the image 404s. */
function Picture({ src, alt, className, sizes, srcSet, width, height, ...rest }) {
  return (
    <picture>
      {srcSet ? (
        <source type="image/avif" srcSet={srcSet.avif} sizes={sizes} />
      ) : (
        <source type="image/avif" srcSet={src.avif} sizes={sizes} />
      )}
      <img
        src={src.webp}
        alt={alt}
        width={width}
        height={height}
        className={className}
        {...rest}
        onError={(e) => {
          const t = e.currentTarget;
          if (t.dataset.step !== '2') {
            t.dataset.step = '2';
            t.src = src.jpg;
          }
        }}
      />
    </picture>
  );
}

export default function Team() {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const photoWrapRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [groupReady, setGroupReady] = useState(false);
  const [avReady, setAvReady] = useState(() => new Set());

  /* Entrance: header -> lede -> group plate -> 01..06. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      addReveal(root.querySelector('.section-header'), { at: 0, duration: 0.8, y: 26, blur: 6 });
      addReveal(root.querySelector('.team__lede'), { at: 0.18, duration: 0.8, y: 22, blur: 6 });
      addReveal(root.querySelector('.team__group'), { at: 0.36, duration: 1.15, y: 52, blur: 10 });
      [...root.querySelectorAll('.team-member')].forEach((btn, i) =>
        addReveal(btn, { at: 0.72 + i * 0.08, duration: 0.75, y: 26, blur: 7 })
      );
    }, root);
    return () => ctx.revert();
  }, []);

  /* Gentle parallax over the group plate. */
  useEffect(() => {
    const root = rootRef.current;
    const photo = photoWrapRef.current;
    if (!root || !photo || prefersReduced() || !canHover()) return;
    let raf = 0;
    const onMove = (e) => {
      const r = root.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        photo.style.setProperty('--px', ((e.clientX - r.left) / r.width).toFixed(3));
        photo.style.setProperty('--py', ((e.clientY - r.top) / r.height).toFixed(3));
      });
    };
    root.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      root.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
      photo.style.removeProperty('--px');
      photo.style.removeProperty('--py');
    };
  }, []);

  /* 1-3px drift on whichever avatars the cursor is near. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReduced() || !canHover()) return;
    const members = [...root.querySelectorAll('.team-member')];
    const RADIUS = 240;
    const MAX = 3;
    let raf = 0;
    const onMove = (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        for (const m of members) {
          const r = m.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const d = Math.hypot(dx, dy);
          if (d > RADIUS || d === 0) {
            m.style.removeProperty('--mx');
            m.style.removeProperty('--my');
            continue;
          }
          const k = 1 - d / RADIUS;
          m.style.setProperty('--mx', (Math.sign(dx) * MAX * k).toFixed(2) + 'px');
          m.style.setProperty('--my', (Math.sign(dy) * MAX * k).toFixed(2) + 'px');
        }
      });
    };
    root.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      root.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
      for (const m of members) {
        m.style.removeProperty('--mx');
        m.style.removeProperty('--my');
      }
    };
  }, []);

  /* Panel: body lock, focus in, Tab trap, ESC out, focus restore. */
  useEffect(() => {
    if (selected == null) return;
    const panel = panelRef.current;
    const body = document.body.style;
    const prev = document.activeElement;
    const bar = window.innerWidth - document.documentElement.clientWidth;
    body.overflow = 'hidden';
    if (bar > 0) body.paddingRight = `${bar}px`;
    const t = setTimeout(() => panel?.querySelector('.team-panel__close')?.focus(), 80);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSelected(null);
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const f = [...panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')];
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      body.overflow = '';
      body.paddingRight = '';
      if (prev && prev.isConnected) prev.focus({ preventScroll: true });
    };
  }, [selected]);

  const closePanel = () => setSelected(null);
  const member = selected == null ? null : MEMBERS[selected];
  const pad2 = (n) => String(n).padStart(2, '0');

  return (
    <section id="team" className="team" ref={rootRef}>
      <div className="team__chrome" aria-hidden="true">
        <span>WUZHEN / 2026</span>
        <span>{pad2(GROUP_HEADCOUNT)} MEMBERS</span>
      </div>

      <div className="container team__grid">
        <SectionHeader number="08" en="OUR TEAM" />
        <p className="team__lede">
          Seven people. One journey through Wuzhen.
          <span>七个人，一段乌镇。</span>
        </p>

        {/* the group plate — the team as a single image */}
        <figure className="team__group" aria-label="Group photograph">
          <div className="team__group-wrap" ref={photoWrapRef}>
            <Picture
              src={GROUP_PHOTO.wide}
              srcSet={GROUP_PHOTO.srcSet}
              sizes="min(1040px, 92vw)"
              alt={GROUP_PHOTO.alt}
              width="4096"
              height="2048"
              className={`team__group-img ${groupReady ? 'is-ready' : ''}`}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              onLoad={() => setGroupReady(true)}
            />
          </div>
          <div className="team__group-veil" aria-hidden="true" />
          <figcaption className="team__group-cap">
            <span>GROUP PHOTO</span>
            <span className="team__group-cap-num">
              {pad2(GROUP_HEADCOUNT)}
              <small>/ {pad2(GROUP_HEADCOUNT)}</small>
            </span>
          </figcaption>
        </figure>

        {/* six portraits — entry points into the panel */}
        <div className="team__members" aria-label="Team members">
          {MEMBERS.map((m, i) => (
            <button
              key={m.n}
              type="button"
              className={`team-member ${hovered === i ? 'is-active' : ''}`}
              onClick={() => setSelected(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered((h) => (h === i ? null : h))}
              aria-label={`Member ${m.n} — open details`}
            >
              <span className="team-member__n">{m.n}</span>
              <span className="team-member__photo">
                <Picture
                  src={m.av}
                  alt={m.alt}
                  width="200"
                  height="200"
                  className={`team-member__img ${avReady.has(i) ? 'is-ready' : ''}`}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  onLoad={() =>
                    setAvReady((prev) => {
                      const next = new Set(prev);
                      next.add(i);
                      return next;
                    })
                  }
                />
              </span>
              <span className="team-member__label">
                <b className="team-member__name">{m.name}</b>
                <i className="team-member__pinyin">{m.pinyin}</i>
              </span>
            </button>
          ))}
        </div>

        <p className="team__note">
          Roles and contributions are filled in by the group. The portraits are shown in
          the order the photos were taken.
        </p>
      </div>

      {/* glass panel — side sheet on desktop, bottom sheet on phone */}
      {createPortal(
        <>
          <div
            className={`team-scrim ${selected != null ? 'is-active' : ''}`}
            onClick={closePanel}
            aria-hidden="true"
          />
          <aside
            ref={panelRef}
            className={`team-panel ${selected != null ? 'is-active' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={member ? `team-panel-name-${member.n}` : undefined}
          >
            <button
              type="button"
              className="team-panel__close"
              onClick={closePanel}
              aria-label="Close member details"
              tabIndex={selected != null ? 0 : -1}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {member && (
              <div className="team-panel__body" key={member.n}>
                <div className="team-panel__photo-wrap">
                  <Picture
                    src={member.sq}
                    alt={member.alt}
                    width="900"
                    height="900"
                    className="team-panel__photo"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <div className="team-panel__meta">
                  <p className="team-panel__index">
                    MEMBER <b>{member.n}</b>
                    <span>{GROUP_HEADCOUNT} MEMBERS</span>
                  </p>
                  <h3 id={`team-panel-name-${member.n}`}>
                    <span className="team-panel__name-cn">{member.name}</span>
                    <span className="team-panel__name-pinyin">{member.pinyin}</span>
                  </h3>
                  <dl>
                    <div>
                      <dt>ROLE</dt>
                      <dd>{member.role}</dd>
                    </div>
                    <div>
                      <dt>CONTRIBUTION</dt>
                      <dd>{member.contribution}</dd>
                    </div>
                  </dl>
                </div>
                <div className="team-panel__foot" aria-hidden="true">
                  <span>WUZHEN / 2026</span>
                  <span>
                    {member.n} / {pad2(GROUP_HEADCOUNT)}
                  </span>
                </div>
              </div>
            )}
          </aside>
        </>,
        document.body
      )}
    </section>
  );
}
