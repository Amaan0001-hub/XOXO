'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const processSteps = [
  {
    num: '01',
    title: 'Data → Analysis',
    img: '/assets/images/step1.png',
    list: [
      'Real-time on-chain data capture',
      'Fund flow & token movement tracking',
      'Smart money flow identification',
      'Market trend analysis',
      'Key on-chain signal detection',
    ],
  },
  {
    num: '02',
    title: 'Analysis → Decision',
    img: '/assets/images/step2.png',
    list: [
      'AI-powered opportunity detection',
      'Cross-DEX price comparison',
      'Risk assessment & validation',
      'Profitability calculation',
      'Strategy selection optimization',
    ],
  },
  {
    num: '03',
    title: 'Decision → Execution',
    img: '/assets/images/step3.png',
    list: [
      '<1 second execution speed',
      'MEV-resistant transaction routing',
      'Cross-DEX arbitrage execution',
      'Low latency infrastructure',
      'Automated trade settlement',
    ],
  },
  {
    num: '04',
    title: 'Execution → Learning',
    img: '/assets/images/step4.png',
    list: [
      'Post-trade performance analysis',
      'Strategy optimization feedback',
      'Pattern recognition update',
      'Model refinement',
      'Continuous improvement loop',
    ],
  },
  {
    num: '05',
    title: 'The Compounding Flywheel',
    img: '/assets/images/step5.png',
    list: [
      'Revenue-backed ecosystem growth',
      'Multi-layer value capture',
      'Network effect amplification',
      'Sustainable yield generation',
      'Protocol expansion & adoption',
    ],
  },
];

export default function ProcessSection() {
  const wrapperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Har card ke liye kitna scroll (px mein window height ka 80%)
  const PX_PER_STEP = typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const wrapperTop = wrapper.getBoundingClientRect().top;
      const scrolledPx = -wrapperTop;

      if (scrolledPx < 0) {
        setActiveIndex(0);
        return;
      }

      const pxPerStep = window.innerHeight * 0.8;
      const rawIndex = Math.floor(scrolledPx / pxPerStep);
      const index = Math.max(0, Math.min(processSteps.length - 1, rawIndex));

      setActiveIndex(index);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  if (!mounted) {
    return (
      <section
        className="process-area position-relative space"
        data-overlay="black2"
        data-opacity="6"
      >
        <div className="container">
          <div className="title-area text-center pe-xl-5 ps-xl-5">
            <span className="sub-title text-anime-style-2 style2">DEXX AI Engine</span>
            <h2 className="sec-title text-white text-anime-style-3">How DEXX MEV+ High-Frequency Arbitrage Works</h2>
          </div>
        </div>
      </section>
    );
  }

  // Total wrapper height = 5 cards x 80vh each + 100vh for last card to settle
  const totalHeight = `${processSteps.length * 80 + 100}vh`;

  return (
    <>
      {/* Outer wrapper — scroll space deta hai */}
      <div
        ref={wrapperRef}
        style={{ height: totalHeight, position: 'relative' }}
      >
        {/* Sticky container — screen pe chipka rahega */}
        <div className='add-positioning'>
          {/* Dark overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              zIndex: 0,
            }}
          />

          {/* Content */}
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>

            {/* Title */}
            <div
              className="title-area text-center pe-xl-5 ps-xl-5 margin-mng"
            >
              <span className="sub-title style2" style={{ color: '#000' }}>
                DEXX Quantum-Scale Compute Engine
              </span>
              <h2 className="sec-title font-size-add" style={{ color: '#fff', marginBottom: 0 }}>
                Data → Analysis → Decision → Execution → Learning
              </h2>
            </div>

            {/* Cards */}
            <div style={{ position: 'relative', minHeight: '380px' }}>
              {processSteps.map((step, index) => {
                const isActive = activeIndex === index;
                const isPast = index < activeIndex;

                return (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      left: 0,
                      top: '50%',
                      transform: isActive
                        ? 'translateY(-50%)'
                        : isPast
                          ? 'translateY(-120%)'
                          : 'translateY(30%)',
                      opacity: isActive ? 1 : 0,
                      transition: 'opacity 0.6s ease, transform 0.6s ease',
                      pointerEvents: isActive ? 'auto' : 'none',
                    }}
                  >
                    <div className="row justify-content-center">
                      <div className="col-lg-8">
                        <div className="process-wrapper">
                          <div className="process-item">
                            <div className="box-wrapp">
                              <span className="box-num">
                                <span className="number">{step.num}</span> PHASE
                              </span>
                              <div className="box-content">
                                <h3 className="box-title">{step.title}</h3>
                                <p className="box-text">
                                  {step.title === 'Data → Analysis' && 'Real-time on-chain data capture analyzing fund flows, token movements, and key signals to reveal where capital is moving.'}
                                  {step.title === 'Analysis → Decision' && 'AI-powered engine identifies market trends, smart money flows, and generates precise trading strategies.'}
                                  {step.title === 'Decision → Execution' && 'Automated on-chain execution with sub-second speed, MEV protection, and cross-DEX routing.'}
                                  {step.title === 'Execution → Learning' && 'Post-trade analysis refines AI models, improving future strategy selection and execution efficiency.'}
                                  {step.title === 'The Compounding Flywheel' && 'Each successful trade strengthens the system, creating network effects and compounding returns over time.'}
                                </p>
                                <div className="checklist">
                                  <ul>
                                    {step.list.map((item, i) => (
                                      <li key={i}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="box-img">
                              <Image
                                src={step.img}
                                alt={step.title}
                                width={640}
                                height={420}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress dots */}
          <div
            style={{
              position: 'absolute',
              right: '30px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              zIndex: 2,
            }}
          >
            {processSteps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: activeIndex === i ? '#fff' : 'rgba(255,255,255,0.3)',
                  transform: activeIndex === i ? 'scale(1.4)' : 'scale(1)',
                  transition: 'background 0.3s ease, transform 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Step counter */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '14px',
              letterSpacing: '2px',
              zIndex: 2,
            }}
          >
            {String(activeIndex + 1).padStart(2, '0')} / {String(processSteps.length).padStart(2, '0')}
          </div>
        </div>
      </div>
    </>
  );
}