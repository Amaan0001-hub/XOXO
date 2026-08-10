'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

const integrations = [
  {
    title: 'Crypto Ecosystem',
    text: 'Trillion-dollar blockchain infrastructure with 24/7 continuous trading and high volatility dynamics. Strategic positioning based on macro trends and institutional adoption.',
    icon: '/assets/images/icons-img.png',
  },
  {
    title: 'Forex Engine',
    text: '$9.5 Trillion daily liquidity with structured, macro-driven trading and tight spreads. Fundamental analysis integrated with technical precision.',
    icon: '/assets/images/icons-img.png',
  },
  {
    title: 'XOXO FX Intelligence Bridge',
    text: 'AI Robotic Trading that delivers accurate market predictions, significantly increasing probability of higher, consistent profits while eliminating emotional decision-making.',
    icon: '/assets/images/icons-img.png',
  },
  {
    title: 'Wealth Multiplier Framework',
    text: 'Ecosystem limits designed for maximum aggressive growth and platform sustainability. Enter for AI-driven passive ROI; stay and scale for exponential leadership multiplier.',
    icon: '/assets/images/icons-img.png',
  },
];

export default function IntegrationSection() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const loadScript = (src) =>
      new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        document.body.appendChild(script);
      });

    const initWOW = async () => {
      await loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/wow/1.1.2/wow.min.js'
      );

      if (window.WOW) {
        new window.WOW({
          live: false,
          offset: 100,
        }).init();
      }

      document
        .querySelectorAll('.text-anime-style-2, .text-anime-style-3')
        .forEach((el) => {
          el.style.opacity = '1';
        });
    };

    initWOW();
  }, []);

  return (
    <section className="download-area overflow-hidden space-top">
      <div className="container">
        <div className="row gy-4 justify-content-center align-items-center">
          <div className="col-xl-10">
            <div className="title-area mb-80 text-center">
              <span
                className="sub-title text-white text-anime-style-2 wow fadeInUp"
                data-wow-delay=".1s"
              >
                Market Convergence: Bridging Two Financial Titans
              </span>

              <h2
                className="sec-title text-white text-anime-style-3 wow fadeInUp"
                data-wow-delay=".2s"
              >
                The Unified Ecosystem Thesis
              </h2>
            </div>
  
          </div>
        </div>

        {/* Integration Cards */}
        <div className="row gy-4 mt-lg-50">
          {integrations.map((item, index) => (
            <div
              className="col-md-6 col-xl-3 wow fadeInUp"
              data-wow-delay={`${(index + 1) * 0.15}s`}
              key={index}
            >
              <div className="integration-card">
                <div className="box-content">
                 

                  <h3 className="box-title">{item.title}</h3>
                </div>

                <p className="box-text">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}