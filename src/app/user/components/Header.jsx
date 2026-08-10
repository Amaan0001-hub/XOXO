'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// ─── Data ────────────────────────────────────────────────────────────────────
const recentPosts = [
  {
    img: '/assets/img/blog/recent-post-1-1.jpg',
    date: 'January 02, 2026',
    title: 'Developing AI systems that scale efficiently as data.',
    href: '/',
  },
  {
    img: '/assets/img/blog/recent-post-1-2.jpg',
    date: 'January 25, 2026',
    title: 'Addressing issues related to AI fairness, transparency',
    href: '/',
  },
  {
    img: '/assets/img/blog/recent-post-1-3.jpg',
    date: '26 January, 2026',
    title: 'AI chatbot integration refers to embedding.',
    href: '/',
  },
];

const colorOptions = ['#3E66F3', '#684DF4', '#008080', '#323F7C', '#FC3737', '#8a2be2'];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [colorSwitchOpen, setColorSwitchOpen] = useState(false);

  // Sticky on scroll
  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ✅ FIX: Mobile-safe scroll lock (iOS Safari ke liye position:fixed trick)
  useEffect(() => {
    const isOpen = mobileOpen || sideOpen;

    if (isOpen) {
      // Current scroll position save karo
      const scrollY = window.scrollY;

      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Scroll position restore karo
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Unmount pe bhi sab reset
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [mobileOpen, sideOpen]);

  const openMobileNav = () => { setMobileOpen(true); setSideOpen(false); };
  const closeMobileNav = () => { setMobileOpen(false); };
  const openSideMenu = () => { setSideOpen(true); setMobileOpen(false); };
  const closeSideMenu = () => setSideOpen(false);

  const applyThemeColor = (color) => {
    document.documentElement.style.setProperty('--theme-color', color);
    document.documentElement.style.setProperty('--theme-color2', color);
  };

  return (
    <>
      {/* ═══════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════ */}
      <header
        className={`th-header header-layout2 header-absolute onepage-nav${isSticky ? ' sticky' : ''}`}
      >
        <div className="sticky-wrapper">
          <div className="menu-area">
            <div className="container th-container">
              <div className="row align-items-center justify-content-between">

                {/* Logo */}
                <div className="col-auto">
                  <div className="header-logo">
                    <Link href="/">
                      <Image
                        src="/assets/img/Logo.png"
                        alt="Aior"
                        width={80}
                        height={50}
                        priority
                      />
                    </Link>
                  </div>
                </div>

                {/* ── Desktop Navigation (lg and above) ── */}
                <div className="col-auto d-none d-lg-block">
                  <nav className="main-menu style2">
                    <ul>
                      <li><a href="/">Home</a></li>
                      <li><a href="#about-sec">About Us</a></li>
                      <li><a href="#features-sec">Features</a></li>
                    </ul>
                  </nav>
                </div>

                {/* ── Desktop Right Buttons (xl and above) ── */}
                <div className="col-auto d-none d-xl-block">
                  <div className="header-button">
                    <Link href="/user/register" className="th-btn2 style2">
                      Register
                      <Image
                        src="/assets/img/icon/user.svg"
                        alt="Login"
                        width={15}
                        height={15}
                      />
                    </Link>
                    <Link href="/user/login" className="th-btn2">
                      Login 
                    </Link>
                    {/* Side-menu trigger (3 bars icon) */}
                    <button
                      type="button"
                      className="sideMenuInfo th-sidemenu-btn"
                      onClick={openSideMenu}
                      aria-label="Open side info panel"
                    >
                      <span></span>
                      <span></span>
                      <span></span>
                    </button>
                  </div>
                </div>

                {/* ── Mobile Hamburger (below lg) ── */}
                <div className="col-auto d-lg-none">
                  <div className="header-button">
                    <button
                      type="button"
                      className="th-menu-toggle"
                      onClick={openMobileNav}
                      aria-label="Open mobile navigation"
                      aria-expanded={mobileOpen}
                    >
                      <span style={{ border: "1px solid #fff", margin: "0 2px", transform: "rotate(45deg)" }}></span>
                      <span style={{ border: "1px solid #fff", margin: "0 2px", transform: "rotate(45deg)" }}></span>
                      <span style={{ border: "1px solid #fff", margin: "0 2px", transform: "rotate(45deg)" }}></span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          SIDE MENU  (.sidemenu-wrapper)
      ═══════════════════════════════════════════ */}
      <div
        className={`sidemenu-overlay${sideOpen ? ' open' : ''}`}
        onClick={closeSideMenu}
        aria-hidden="true"
      />
      <div className={`sidemenu-wrapper${sideOpen ? ' show' : ''}`}>
        <div className="sidemenu-content">

          <button
            className="closeButton sideMenuCls"
            onClick={closeSideMenu}
            aria-label="Close side menu"
          >
            <span style={{ border: "1px solid #18a34d", margin: "0 2px" }}></span>
            <span style={{ border: "1px solid #18a34d", margin: "0 2px" }}></span>
          </button>

          {/* About widget */}
          <div className="widget footer-widget mb-0">
            <div className="th-widget-about">
              <div className="about-logo">
                <Link href="/" onClick={closeSideMenu}>
                  <Image src="/assets/img/Logo.png" alt="Aior" width={120} height={40} />
                </Link>
              </div>

              <p className="about-text">
                The all-in-one intelligent arbitrage system for DeFi markets. Built onchain with 
  real-time transparency and non-custodial security.
              </p>
              <div className="col-auto d-none d-xl-block">
                <div className="header-button mb-5">
                  <Link href="/user/register" className="th-btn2 style2">
                    Register{' '}
                    <Image
                      src="/assets/img/icon/user.svg"
                      alt="Login"
                      width={15}
                      height={15}
                    />
                  </Link>
                  <Link href="/user/login" className="th-btn2">
                    Login 
                  </Link>
                </div>
              </div>
              <div className="th-social mb-40">
                <a href="/" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="/" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="/" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE MENU
      ═══════════════════════════════════════════ */}
      <div className={`th-menu-wrapper${mobileOpen ? ' th-body-visible' : ''}`}>
        <div className="th-menu-area text-center">

          {/* Close button */}
          <button
            className="th-menu-toggle"
            onClick={closeMobileNav}
            aria-label="Close mobile navigation"
          >
            <i className="fal fa-times"></i>
          </button>

          {/* Mobile logo */}
          <div className="mobile-logo">
            <Link href="/" onClick={closeMobileNav}>
              <Image src="/assets/img/Logo.png" alt="Aior" width={130} height={45} />
            </Link>
          </div>

          {/* Mobile nav list — no dropdowns */}
          <div className="th-mobile-menu">
            <ul>
              <li><a href="/" onClick={closeMobileNav}>Home</a></li>
              <li><a href="#about-sec" onClick={closeMobileNav}>About Us</a></li>
              <li><a href="#features-sec" onClick={closeMobileNav}>Features</a></li>
              <li><a href="/user/register" onClick={closeMobileNav}>Register</a></li>
              <li><a href="/user/login" onClick={closeMobileNav}>Login </a></li>
            </ul>
          </div>
          <div className="widget footer-widget mb-0">
            <div className="th-widget-about">
              <p className="about-text">
             The all-in-one intelligent arbitrage system for DeFi markets. Built onchain with 
  real-time transparency and non-custodial security.
              </p>
              <div className="th-social mb-40">
                <a href="/" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="/" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="/" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

    </>
  );
}
