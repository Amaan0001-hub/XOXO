'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

const blogs = [
  {
    img: 'blog_1_1.png',
    cat: 'AI Trading',
    date: '15 May, 2025',
    comments: '24 Comments',
    title: 'XOXO FX: The Future of Intelligent Trading – AI Bot Platform Launch'
  },
  {
    img: 'blog_1_2.png',
    cat: 'Market Convergence',
    date: '10 May, 2025',
    comments: '18 Comments',
    title: 'Bridging Crypto & Forex: $9.5 Trillion Daily Liquidity Meets Blockchain'
  },
  {
    img: 'blog_1_3.png',
    cat: 'Risk Management',
    date: '05 May, 2025',
    comments: '12 Comments',
    title: 'Institutional Risk Management: Capital Preservation Over Impulsive Speculation'
  },
  {
    img: 'blog_1_4.png',
    cat: 'AI Robotic Bots',
    date: '28 Apr, 2025',
    comments: '31 Comments',
    title: 'The Intelligence Bridge: AI Robotic Trading Eliminates Emotional Decisions'
  },
  {
    img: 'blog_1_1.png',
    cat: 'Passive Income',
    date: '20 Apr, 2025',
    comments: '27 Comments',
    title: 'AI Bot Packages: Passive Wealth Generation with 2X Self Investment, 3X Working Limit'
  },
  {
    img: 'blog_1_2.png',
    cat: 'Rewards Program',
    date: '12 Apr, 2025',
    comments: '19 Comments',
    title: 'Leadership Trading Income: Earn Team-Based Rewards Across 30 Levels'
  },
];

export default function BlogSection() {
  const swiperRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Load Swiper CSS
    const loadCSS = (href) => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    loadCSS('https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.css');

    // Load Swiper JS then initialize
    const loadScript = (src) =>
      new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        document.body.appendChild(s);
      });

    const init = async () => {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.js');

      // Wait for DOM element to be ready
      const waitForEl = () =>
        new Promise((res) => {
          const check = () => {
            const el = document.querySelector('#blogSliderSection');
            if (el) return res(el);
            requestAnimationFrame(check);
          };
          check();
        });

      await waitForEl();

      if (window.Swiper) {
        const el = document.querySelector('#blogSliderSection');
        if (el && !el.swiper) {
          new window.Swiper('#blogSliderSection', {
            loop: true,
            spaceBetween: 24,
            autoplay: { delay: 3000, disableOnInteraction: false },
            pagination: {
              el: '#blogSliderSection .swiper-pagination',
              clickable: true,
            },
            breakpoints: {
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              992: { slidesPerView: 2 },
              1200: { slidesPerView: 3 },
            },
          });
        }
      }
    };

    init();
  }, []);

  return (
    <section className="overflow-hidden space bg-smoke2 mt-5" id="blog-sec">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 col-xxl-12">
            <div className="row justify-content-lg-between justify-content-center align-items-center">
              <div className="col-lg-8 col-xxl-6">
                <div className="title-area text-center text-lg-start">
                  <span className="sub-title text-anime-style-2 wow fadeInUp" data-wow-delay=".1s">
                    Latest Updates
                  </span>
                  <h2 className="sec-title text-anime-style-3 wow fadeInUp" data-wow-delay=".2s">
                    XOXOFX News & Insights
                  </h2>
                </div>
              </div>
              <div className="col-auto wow fadeInUp" data-wow-delay=".3s">
                <div className="sec-btn">
                  <Link href="/blog" className="th-btn">
                    VIEW ALL ARTICLES{' '}
                    <span className="icon">
                      <Image src="/assets/img/icon/arrow-right.svg" alt="" width={16} height={16} />
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Blog Swiper Slider */}
            <div className="slider-area">
              <div className="swiper th-slider has-shadow" id="blogSliderSection">
                <div className="swiper-wrapper">
                  {blogs.map((blog, index) => (
                    <div className="swiper-slide" key={index}>
                      <div className="blog-card">
                        <div className="box-img global-img">
                          <Image
                            src={`/assets/img/blog/${blog.img}`}
                            alt="blog image"
                            width={400}
                            height={260}
                          />
                        </div>
                        <div className="box-content">
                          <span className="cat">{blog.cat}</span>
                          <h3 className="box-title">
                            <Link href="/blog-details">{blog.title}</Link>
                          </h3>
                        </div>
                        <div className="blog-meta">
                          <Link href="/blog">{blog.date}</Link>{' '}
                          <Link href="/blog">{blog.comments}</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="swiper-pagination"></div>
              </div>
            </div>
          </div>
 
        </div>
      </div>
    </section>
  );
}