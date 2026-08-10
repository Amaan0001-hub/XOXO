'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import ProcessSection from './ProcessSection';
import BlogSection from './BlogSection';
import IntegrationSection from './IntegrationSection';


export default function AllSection() {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // ── 1. Load external scripts sequentially ──────────────────────────
    const scripts = [
      'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/wow/1.1.2/wow.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/jquery.magnific-popup.min.js',
    ];

    const loadScript = (src) =>
      new Promise((res) => {
        if (document.querySelector(`script[src="${src}"]`)) return res();
        const s = document.createElement('script');
        s.src = src;
        s.onload = res;
        document.body.appendChild(s);
      });

    const loadStyles = () => {
      const hrefs = [
        'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/magnific-popup.min.css',
      ];
      hrefs.forEach((href) => {
        if (!document.querySelector(`link[href="${href}"]`)) {
          const l = document.createElement('link');
          l.rel = 'stylesheet';
          l.href = href;
          document.head.appendChild(l);
        }
      });
    };

    const init = async () => {
      loadStyles();
      for (const src of scripts) await loadScript(src);

      const $ = window.jQuery;
      if (!$) return;

      // ── 2. WOW Animations ─────────────────────────────────────────────
      if (window.WOW) {
        new window.WOW({ live: false, offset: 100 }).init();
      }

      // ── 3. Counter Animation ──────────────────────────────────────────
      const animateCounter = (el) => {
        const target = parseFloat(el.getAttribute('data-target'));
        const isDecimal = target % 1 !== 0;
        const duration = 2000;
        const step = 16;
        const steps = duration / step;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
        }, step);
      };

      const observeCounters = () => {
        const counters = document.querySelectorAll('.counter-number');
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting && !e.target.dataset.animated) {
                e.target.dataset.animated = '1';
                animateCounter(e.target);
              }
            });
          },
          { threshold: 0.5 }
        );
        counters.forEach((c) => {
          const raw = c.textContent.trim();
          c.setAttribute('data-target', raw);
          c.textContent = '0';
          io.observe(c);
        });
      };
      observeCounters();

      // ── 4. Swiper – helper ────────────────────────────────────────────
      const initSwiper = (selector, opts) => {
        const el = document.querySelector(selector);
        if (!el || el.swiper) return;
        new window.Swiper(selector, opts);
      };

      // ── 5. Marquee Slider 1 (LTR) ─────────────────────────────────────
      initSwiper('.marquee-slider-ltr', {
        loop: true,
        slidesPerView: 'auto',
        speed: 6000,
        autoplay: { delay: 0, disableOnInteraction: false },
        spaceBetween: 30,
        allowTouchMove: false,
      });

      // ── 6. Marquee Slider 2 (RTL) ─────────────────────────────────────
      initSwiper('.marquee-slider-rtl', {
        loop: true,
        slidesPerView: 'auto',
        speed: 4000,
        autoplay: { delay: 0, disableOnInteraction: false },
        spaceBetween: 30,
        allowTouchMove: false,
        rtl: true,
      });

      // ── 7. Testimonials Slider ────────────────────────────────────────
      initSwiper('#testiSlide1', {
        loop: true,
        spaceBetween: 24,
        autoplay: { delay: 3500, disableOnInteraction: false },
        breakpoints: {
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1200: { slidesPerView: 3 },
        },
      });

      // ── 8. Blog Slider ────────────────────────────────────────────────
      initSwiper('#blogSlider1', {
        loop: true,
        spaceBetween: 24,
        autoplay: { delay: 3000, disableOnInteraction: false },
        breakpoints: {
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          992: { slidesPerView: 2 },
          1200: { slidesPerView: 3 },
        },
      });

      // ── 9. Magnific Popup (video) ─────────────────────────────────────
      if ($.fn.magnificPopup) {
        $('.popup-video').magnificPopup({ type: 'iframe' });
      }

      // ── 10. Smooth scroll for anchor links ───────────────────────────
      $(document).on('click', 'a[href^="#"]', function (e) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
          e.preventDefault();
          $('html,body').animate({ scrollTop: target.offset().top - 80 }, 600);
        }
      });

      // ── 11. Text split animation (simple fade-in per word) ───────────
      document.querySelectorAll('.text-anime-style-2, .text-anime-style-3').forEach((el) => {
        el.style.opacity = '1';
      });
    };

    init();
  }, []);

  // ── Data updated from XOXO FX V2.pdf ───────────────────────────────────

  const features = [
    { icon: 'service_1_1.svg', title: 'Crypto Ecosystem', text: 'Trillion-dollar blockchain infrastructure with 24/7 continuous trading & high volatility dynamics.' },
    { icon: 'service_1_2.svg', title: 'The Forex Engine', text: '$9.5 Trillion daily liquidity with structured, macro-driven trading and tight spreads.' },
    { icon: 'service_1_3.svg', title: 'Strategic Positioning', text: 'Macro trend analysis combined with institutional adoption and fundamental precision.' },
    { icon: 'service_1_4.svg', title: 'Technical Precision', text: 'Fundamental analysis integrated with advanced technical execution for optimal entries.' },
    { icon: 'service_1_5.svg', title: 'Institutional Risk Management', text: 'Prioritizing capital preservation and long-term sustainability over impulsive speculation.' },
    { icon: 'service_1_1.svg', title: 'AI Robotic Trading', text: 'Automation meets human discipline with accurate market predictions eliminating emotional decision-making.' },
  ];

 

 
  const counters = [
    { num: '9.5', suffix: 'T+', label: 'Daily Liquidity (Forex)' },
    { num: '24', suffix: '/7', label: 'Continuous Trading' },
    { num: '50', suffix: '%', label: 'Max ROI Distribution' },
    { num: '30', suffix: 'Levels', label: 'Leadership Trading Rewards' },
  ];

 
const pricingPlans = [
  { 
    title: 'BO StartX', 
    subtitle: '$50 – $499 Range',  
    active: false, 
    delay: '.2s', 
    list: ['6% Profit Target', 'AI-powered execution', 'Daily growth projections', 'Standard support'] 
  },
  { 
    title: 'BO TitanX', 
    subtitle: '$500 – $1,999 Range',   
    active: false, 
    delay: '.3s', 
    list: ['7% Profit Target', 'Smart AI strategies', 'Consistent daily returns', 'Priority support'] 
  },
  { 
    title: 'BO QuantumX', 
    subtitle: '$2,000 – $4,999 Range',  
    active: false, 
    delay: '.4s', 
    list: ['8% Profit Target', 'Enhanced AI algorithms', 'Flexible goal settings', 'Real-time analytics'] 
  },
  { 
    title: 'BO MegaBullX', 
    subtitle: '$5,000+ Range',   
    active: true, 
    delay: '.6s', 
    list: ['10% Profit Target ', 'Premium AI strategies', 'Self Investment 2X', 'Working 3X Limit'] 
  },
];
  const testimonials = [
    { img: 'testi_1_1.png', text: 'XOXO FX has transformed how we approach market trading. The AI Robotic Bots capture opportunities for consistent profits.', name: 'Ava Chen', role: 'CEO, XOXO FX' },
    { img: 'testi_1_2.png', text: 'The unified ecosystem bridging Forex and Crypto delivers quantum-scale opportunities for traders worldwide.', name: 'Ethan Cole', role: 'CTO, XOXO FX' },
    { img: 'testi_1_3.png', text: 'Our mission is to make intelligent trading accessible through AI automation and institutional-grade risk management.', name: 'Alex Morgan', role: 'CMO, XOXO FX' },
    { img: 'testi_1_1.png', text: 'From macro-driven Forex to high-volatility Crypto, we provide structured yield across both financial titans.', name: 'XOXO FX', role: 'Intelligent Trading Platform' },
    { img: 'testi_1_2.png', text: 'The future of trading is AI-powered, emotionless, and built on sustainable ecosystem limits for maximum growth.', name: 'Global Community', role: 'Trading Ecosystem' },
  ];

 

  return (
    <>
      {/* ===== HERO SECTION (VIDEO BACKGROUND) ===== */}
      <div className="sd-hero-area sd-hero-bg p-relative z-index-1">
        <div className="sd-hero-video">
          <video loop muted autoPlay playsInline>
            <source src="/assets/BG-Video.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="sd-hero-title-box text-center">
                <h1 className="sd-hero-title" id="heroText">
                  <span style={{ translate: 'none', rotate: 'none', scale: 'none', transform: 'translate(0px, 0px)', opacity: 1 }}>X</span>
                  <span style={{ translate: 'none', rotate: 'none', scale: 'none', transform: 'translate(0px, 0px)', opacity: 1 }}>O</span>
                  <span style={{ translate: 'none', rotate: 'none', scale: 'none', transform: 'translate(0px, 0px)', opacity: 1 }}>X</span>
                  <span style={{ translate: 'none', rotate: 'none', scale: 'none', transform: 'translate(0px, 0px)', opacity: 1 }}>O</span>
                  <span style={{ translate: 'none', rotate: 'none', scale: 'none', transform: 'translate(0px, 0px)', opacity: 1 }}>F</span>
                  <span style={{ translate: 'none', rotate: 'none', scale: 'none', transform: 'translate(0px, 0px)', opacity: 1 }}>X</span>
                </h1>
                <h6>The Future of Intelligent Trading → Built to automate and optimize market performance.</h6>
                <span>
                  A cutting-edge AI bot trading platform built to automate and optimize market performance.
                </span>

                    <div className="header-button banner-button">
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
                  
                  </div>
              </div>
            </div>
          </div>

          <div className="row align-items-center phone-screen-none">
            <div className="col-md-6 col-sm-7">
              <div className="sd-hero-info d-flex align-items-center mb-40">
                <img src="/assets/avater-1.png" alt="" />
                <span>
                  Trade The <br /> Markets. Today
                </span>
              </div>
            </div>
            <div className="col-md-6 col-sm-5">
              <div className="sd-hero-info text-start text-sm-end mb-40">
                <a href="mailto:trade@XOXOFXfx.com">trade@xoxofx.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ABOUT SECTION ===== */}
      <div className="about-area overflow-hidden space" id="about-sec">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-8 mb-30 mb-xl-0">
              <div className="title-area pe-xl-5">
                <span className="sub-title text-anime-style-2 wow fadeInUp" data-wow-delay=".1s">The Unified Ecosystem</span>
                <h2 className="sec-title text-anime-style-3 wow fadeInUp" data-wow-delay=".2s">
                  <span>Market Convergence:</span>{' '}
                  <span className="title">Bridging Two Financial Titans</span>
                </h2>
              </div>
            </div>
          </div>
          <div className="row gy-4">
            <div className="col-lg-5 col-xxl-5 wow fadeInLeft" data-wow-delay=".2s">
            
                  <Image src="/assets/images/Capital-Migration-img1.png" alt="About" width={350} height={350} className='img-fluid' style={{display:'flex',margin:'0 auto'}} />
            
            </div>
            <div className="col-lg-7 col-xxl-6">
              <div className="ps-xxl-5">
                <p className="pe-xl-5 me-xl-5 mb-35 wow fadeInUp" data-wow-delay=".4s">
                  XOXO FX brings together global blockchain engineers and quantitative trading specialists, dedicated to building the next generation of intelligent trading infrastructure that bridges Forex and Crypto markets. Our vision is to redefine global trading by bringing every market, every asset, and every strategy under one unified AI-powered ecosystem.
                </p>
                <div className="checklist list-two-column about-checklist wow fadeInUp" data-wow-delay=".6s">
                  <ul>
                    {['Crypto Ecosystem', 'The Forex Engine', '24/7 Trading', 'Macro-Driven Strategy', 'Institutional Risk Mgmt', 'AI Robotic Trading'].map(
                      (item, i) => (
                        <li className="wow fadeInUp" data-wow-delay={`${(i + 1) * 0.1}s`} key={i}>
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div className="btn-group mt-45 wow fadeInUp" data-wow-delay=".8s">
                  <Link href="#about" className="th-btn">
                    Learn More{' '}
                    <span className="icon">
                      <Image src="/assets/img/icon/arrow-right.svg" alt="" width={16} height={16} />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="shape-mockup jumpAni d-none d-xxl-block" data-top="25%" data-right="0%">
          <Image src="/assets/img/shape/element-1.png" alt="" width={100} height={100} />
        </div>
      </div>

      {/* ===== FEATURES SECTION ===== */}
      <section className="service-area position-relative overflow-hidden space" id="features-sec">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="title-area text-center">
                <span className="sub-title style2 text-anime-style-2 wow fadeInUp" data-wow-delay=".1s">Core Systems</span>
                <h2 className="sec-title text-anime-style-3 wow fadeInUp" data-wow-delay=".2s">The Unified Ecosystem Architecture</h2>
              </div>
            </div>
          </div>
          <div className="row gy-4 justify-content-center">
            {features.map((feature, index) => (
              <div className="col-md-6 col-xl-4 wow fadeInUp" data-wow-delay={`${(index % 3 + 1) * 0.2}s`} key={index}>
                <div className="service-card">
                  <div className="box-icon">
                    <Image src={`/assets/img/icon/${feature.icon}`} alt="icon" width={50} height={50} />
                  </div>
                  <div className="box-content">
                    <h3 className="box-title">
                      <Link href="/features">{feature.title}</Link>
                    </h3>
                    <p className="box-text">{feature.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProcessSection />
    
      {/* ===== COUNTER SECTION ===== */}
      <div className="overflow-hidden space">
        <div className="container">
          <div className="title-area text-center">
            <h2 className="sec-title style2 text-anime-style-3 wow fadeInUp" data-wow-delay=".1s">Market Leadership Metrics</h2>
            <p className="wow fadeInUp" data-wow-delay=".3s">
              Bridging trillion-dollar crypto infrastructure with $9.5 trillion daily forex liquidity
            </p>
          </div>
          <div className="counter-area bounce_animation">
            {counters.map((counter, index) => (
              <div className="counter-card_wrapp wow fadeInUp" data-wow-delay={`${(index + 1) * 0.15}s`} key={index}>
                <div className="counter-card bounce__anim">
                  <div className="media-body">
                    <h3 className="box-number">
                      {/* counter-number value is used by the JS counter animation */}
                      <span className="counter-number">{counter.num}</span>
                      {counter.suffix}
                    </h3>
                    <p className="box-text">{counter.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* ===== FEATURES / BENEFITS SECTION ===== */}
      <div className="position-relative space overflow-hidden">
        <div className="container">
          <div className="row gy-4 gx-0 justify-content-end flex-row-reverse">
            <div className="col-lg-10 col-xl-8">
              <div className="ps-xl-5 ms-xxl-5">
                <div className="about-wrapper">
                  <div className="title-area">
                    <span className="sub-title text-anime-style-2 wow fadeInUp" data-wow-delay=".1s">The Intelligence Bridge</span>
                    <h2 className="sec-title text-anime-style-3 wow fadeInUp" data-wow-delay=".2s">
                      AI Robotic Trading <span className="d-block">Automation meets human discipline</span>
                    </h2>
                  </div>
                  <div className="about-wrapp">
                    <div>
                      <div className="checklist style2 wow fadeInUp" data-wow-delay=".6s">
                        <ul>
                          {['Accurate Market Predictions', 'AI Robotic Bots', 'Higher Consistent Profits', 'Eliminates Emotional Decisions', '24/7 Automated Execution', 'Institutional Grade Logic'].map(
                            (item, i) => (
                              <li className="wow fadeInUp" data-wow-delay={`${(i + 1) * 0.1}s`} key={i}>
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      <div className="btn-group mt-60 wow fadeInUp" data-wow-delay=".8s">
                        <Link href="/" className="th-btn">
                          Join Ecosystem{' '}
                          <span className="icon">
                            <Image src="/assets/img/icon/arrow-right.svg" alt="" width={16} height={16} />
                          </span>
                        </Link>
                      </div>
                    </div> 
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 col-xl-4 wow fadeInLeft" data-wow-delay=".3s">
              <div className="feature-img global-img">
                <div className="box-img">
                  <Image src="/assets/img/normal/feature_1.png" alt="" width={400} height={500} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <IntegrationSection />

      {/* ===== PRICING SECTION ===== */}
   
<section className="overflow-hidden space">
  <div className="container">
    <div className="title-area text-center">
      <span className="sub-title text-anime-style-2 wow fadeInUp" data-wow-delay=".1s">AI Bot Packages</span>
      <h2 className="sec-title text-anime-style-3 wow fadeInUp" data-wow-delay=".2s">Passive Wealth Generation</h2>
    </div>
    <div className="row gy-4 justify-content-center">
      {pricingPlans.map((plan, index) => (
        <div className="col-xl-4 col-xxl-3 col-md-6" key={index}>
          <div
            className={`price-box th-ani wow fadeInUp${plan.active ? ' active' : ''}`}
            data-wow-delay={plan.delay}
          >
            <div className="box-wrapp">
              <div className="box-icon">
                <Image src="/assets/img/icon/star.svg" alt="" width={30} height={30} />
              </div>
              <div className="box-content">
                <h3 className="box-title">{plan.title}</h3>
                <p className="box-text">{plan.subtitle}</p>
              </div>
            </div>
           
            <div className="box-content">
              <div className="available-list">
                <h4 className="subtitle">Profit Target</h4>
                <ul>
                  {plan.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <Link href="/user/login" className="th-btn black-border fw-btn add-hover">
                Get Started{' '}
                <span className="icon">
                  <Image src="/assets/img/icon/arrow-right.svg" alt="" width={16} height={16} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="position-relative overflow-hidden" id="testi-sec">
        <div className="container">
          <div className="row justify-content-lg-between justify-content-center align-items-center">
            <div className="col-lg-6">
              <div className="title-area text-center text-lg-start">
                <span className="sub-title text-anime-style-2 wow fadeInUp" data-wow-delay=".1s">Leadership</span>
                <h2 className="sec-title text-anime-style-3 wow fadeInUp" data-wow-delay=".2s">
                  Built by Industry Experts
                </h2>
              </div>
            </div>
            <div className="col-auto wow fadeInUp" data-wow-delay=".3s">
              <div className="sec-btn">
                <Link href="/testimonial" className="th-btn">
                  View Team{' '}
                  <span className="icon">
                    <Image src="/assets/img/icon/arrow-right.svg" alt="" width={16} height={16} />
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Swiper Testimonial Slider */}
          <div className="slider-wrap">
            <div className="swiper th-slider has-shadow" id="testiSlide1">
              <div className="swiper-wrapper">
                {testimonials.map((testi, index) => (
                  <div className="swiper-slide" key={index}>
                    <div className="testi-card">
                      <div className="box-wrapp">
                        <span className="rating">
                          {[...Array(5)].map((_, i) => (
                            <i className="fa-solid fa-star" key={i}></i>
                          ))}
                        </span>
                        <div className="box-quote">
                          <Image src="/assets/img/icon/quote.svg" alt="" width={30} height={30} />
                        </div>
                      </div>
                      <p className="box-text">{testi.text}</p>
                      <div className="box-wrapp">
                        <div className="box-profile">
                          <div className="box-author">
                            <Image src={`/assets/img/testimonial/${testi.img}`} alt="Avatar" width={50} height={50} />
                          </div>
                          <div className="box-info">
                            <h3 className="box-title">{testi.name}</h3>
                            <span className="box-desig">{testi.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Swiper navigation dots */}
              <div className="swiper-pagination"></div>
            </div>
          </div>
        </div>
      </section>
      <BlogSection />

    </>
  );
}