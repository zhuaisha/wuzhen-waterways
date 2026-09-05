import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const navLinks = [
  { label: 'Focus', href: '#focus', section: 'focus' },
  { label: 'Questions', href: '#questions', section: 'questions' },
  { label: 'Facts', href: '#facts', section: 'facts' },
  { label: 'Gallery', href: '#gallery', section: 'gallery' },
  { label: 'Keywords', href: '#keywords', section: 'keywords' },
  { label: 'Sources', href: '#sources', section: 'sources' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('focus');
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
      
      // 使用 IntersectionObserver 检测活动 Section
      const scrollPos = window.scrollY;
      let current = 'focus';
      
      // 从下往上检查，确保找到最接近视口中心的 section
      for (const link of navLinks) {
        const el = document.querySelector(link.href);
        if (el) {
          const rect = el.getBoundingClientRect();
          // 如果 section 的顶部已经进入视口，或者当前在 section 范围内
          if (rect.top <= window.innerHeight * 0.5) {
            current = link.section;
          }
        }
      }
      
      setActiveSection(current);
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
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        <a href="#" className="navbar__brand">
          <img src="./assets/wuzhen-icon.png" alt="Wuzhen" className="navbar__brand-icon" />
          <span className="navbar__brand-text">WUZHEN</span>
        </a>

        <ul className={`navbar__links ${open ? 'navbar__links--open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href} className="navbar__link-item">
              <a
                href={link.href}
                className={`navbar__link ${activeSection === link.section ? 'navbar__link--active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  smoothScrollTo(link.href, e);
                }}
              >
                {link.label}
                {activeSection === link.section && (
                  <span className="navbar__link-indicator" />
                )}
              </a>
            </li>
          ))}
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
