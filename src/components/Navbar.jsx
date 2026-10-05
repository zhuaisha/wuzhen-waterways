import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const navLinks = [
  { label: 'Story', href: '#chapter-water', section: 'story', journey: 0.06 },
  { label: 'Water', href: '#atlas', section: 'water', journey: 0.1 },
  { label: 'Bridges', href: '#chapter-bridges', section: 'bridges', journey: 0.18 },
  { label: 'Facts', href: '#facts', section: 'facts', journey: 0.3 },
  { label: 'Gallery', href: '#gallery', section: 'gallery', journey: 0.42 },
  { label: 'History', href: '#timeline', section: 'history', journey: 0.72 },
  { label: 'Team', href: '#team', section: 'team', journey: 0.94 },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lenisRef = useRef(null);

  // 获取 Lenis 实例
  useEffect(() => {
    if (window.__lenis) {
      lenisRef.current = window.__lenis;
    }
  }, []);

  // 滚动监听
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 平滑滚动
  const smoothScrollTo = (targetId, event) => {
    const target = document.querySelector(targetId);
    if (!target) return;

    // 按钮点击反馈
    if (event) {
      gsap.to(event.currentTarget, {
        scale: 0.96,
        opacity: 0.75,
        duration: 0.12,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(event.currentTarget, {
            scale: 1,
            opacity: 1,
            duration: 0.18,
            ease: 'power2.inOut'
          });
        }
      });
    }

    // 页面内容转场
    gsap.to('main', {
      opacity: 0.7,
      y: 8,
      duration: 0.3,
      ease: 'power2.out'
    });

    // 使用 Lenis 平滑滚动
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        offset: -80
      });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 恢复
    setTimeout(() => {
      gsap.to('main', {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      });
    }, 800);

    setOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} aria-label="Main navigation">
      <div className="navbar__container">
        <a href="#hero" className="navbar__brand">
          <img src={`${import.meta.env.BASE_URL}assets/wuzhen-icon.png`} alt="Wuzhen" className="navbar__brand-icon" />
          <span className="navbar__brand-text">WUZHEN</span>
        </a>

        <ul className={`navbar__links ${open ? 'navbar__links--open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href} className="navbar__link-item">
              <a
                href={link.href}
                className="navbar__link"
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollTo(link.href, e);
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="navbar__link-item navbar__link-item--explore">
            <a
              href="#hero"
              className="navbar__explore"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo('#hero', e);
              }}
            >
              Explore <span aria-hidden="true">↓</span>
            </a>
          </li>
        </ul>

        <button
          className={`navbar__toggle ${open ? 'navbar__toggle--active' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
