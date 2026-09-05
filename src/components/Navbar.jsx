import { useState, useEffect, useRef } from 'react';

const navLinks = [
  { label: 'Focus', href: '#focus' },
  { label: 'Questions', href: '#questions' },
  { label: 'Facts', href: '#facts' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Keywords', href: '#keywords' },
  { label: 'Sources', href: '#sources' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        <a href="#" className="navbar__brand">
          <img src="./assets/wuzhen-icon.png" alt="Wuzhen" className="navbar__brand-icon" />
          <span className="navbar__brand-text">WUZHEN</span>
        </a>

        <ul className={`navbar__links ${open ? 'navbar__links--open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setOpen(false)}>
                {link.label}
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
