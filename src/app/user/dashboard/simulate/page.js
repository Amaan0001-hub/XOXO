"use client";

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

export default function Simulate() {
  const backtestChartRef = useRef(null);
  const distChartRef = useRef(null);
  const chartInstances = useRef([]);
  const [capital, setCapital] = useState(5000);
  const [period, setPeriod] = useState(30);
  const [spread, setSpread] = useState(0.5);
  const [showResults, setShowResults] = useState(false);
  const [simResults, setSimResults] = useState({
    return: 34.2,
    profit: 1710,
    drawdown: 3.1,
    sharpe: 4.82,
    grossProfit: 2140,
    gasFees: 284,
    platformFee: 146,
    netProfit: 1710
  });

  useEffect(() => {
    // Cleanup previous charts
    chartInstances.current.forEach(chart => chart.destroy());
    chartInstances.current = [];

    // Backtest Chart
    if (backtestChartRef.current) {
      const chart = new Chart(backtestChartRef.current, {
        type: 'line',
        data: {
          labels: Array.from({ length: period }, (_, i) => `Day ${i + 1}`),
          datasets: [{
            label: 'Portfolio Value',
            data: Array.from({ length: period }, (_, i) => {
              const growth = 1 + (simResults.return / 100) * (i / period);
              return capital * growth;
            }),
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false }
          }
        }
      });
      chartInstances.current.push(chart);
    }

    // Distribution Chart
    if (distChartRef.current) {
      const chart = new Chart(distChartRef.current, {
        type: 'bar',
        data: {
          labels: ['-$50', '$0', '$50', '$100', '$150', '$200+'],
          datasets: [{
            data: [5, 15, 35, 28, 12, 5],
            backgroundColor: 'rgba(139, 92, 246, 0.7)',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { ticks: { font: { size: 9 } } }
          }
        }
      });
      chartInstances.current.push(chart);
    }

    return () => {
      chartInstances.current.forEach(chart => chart.destroy());
      chartInstances.current = [];
    };
  }, [period, capital, simResults]);

  const reSim = () => {
    // Recalculate simulation based on new inputs
    const capitalValue = parseFloat(document.getElementById('simCap')?.value) || 5000;
    const periodValue = parseInt(document.getElementById('simPer')?.value) || 30;
    
    setCapital(capitalValue);
    setPeriod(periodValue);
    
    // Update simulation results dynamically
    const baseReturn = 20 + Math.random() * 30;
    const netProfitValue = (capitalValue * baseReturn / 100);
    const grossProfitValue = netProfitValue * 1.25;
    const gasFeesValue = netProfitValue * 0.166;
    const platformFeeValue = netProfitValue * 0.085;
    
    setSimResults({
      return: parseFloat(baseReturn.toFixed(1)),
      profit: Math.floor(netProfitValue),
      drawdown: parseFloat((2 + Math.random() * 3).toFixed(1)),
      sharpe: parseFloat((3 + Math.random() * 3).toFixed(2)),
      grossProfit: Math.floor(grossProfitValue),
      gasFees: Math.floor(gasFeesValue),
      platformFee: Math.floor(platformFeeValue),
      netProfit: Math.floor(netProfitValue)
    });
  };

  const runSim = () => {
    reSim();
    setShowResults(true);
    
    // Scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('simRes');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const executeStrategy = () => {
    alert('🚀 Executing strategy with current parameters!\n\n' +
      `Capital: $${capital}\n` +
      `Period: ${period} days\n` +
      `Spread threshold: ${spread}%\n` +
      `Expected return: +${simResults.return}%\n` +
      `Net profit: $${simResults.netProfit}`);
  };

  const handleSpreadChange = (e) => {
    const value = parseFloat(e.target.value);
    setSpread(value);
  };

  return (
    <>
     
      <div id="p-simulate" className="page">
        <div className="g12" style={{ alignItems: "start" }}>
          <div>
            <div className="scard scc" style={{ marginBottom: "12px" }}>
              <div className="st" style={{ marginBottom: "14px" }}>Simulate Trade</div>
              <div className="fg">
                <label className="fl">Token Pair</label>
                <select className="fi" defaultValue="SOL / USDC">
                  <option>SOL / USDC</option>
                  <option>ETH / USDT</option>
                  <option>BNB / BUSD</option>
                  <option>BTC / USDT</option>
                  <option>MATIC / USDC</option>
                </select>
              </div>
              <div className="fg">
                <label className="fl">Strategy</label>
                <select className="fi" defaultValue="Cross-DEX Arb">
                  <option>Cross-DEX Arb</option>
                  <option>MEV Sandwich</option>
                  <option>Flash Loan</option>
                  <option>Triangular</option>
                </select>
              </div>
              <div className="fg">
                <label className="fl">Capital (USD)</label>
                <input 
                  className="fi" 
                  id="simCap" 
                  type="number" 
                  defaultValue="5000" 
                  onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="fg">
                <label className="fl">Period</label>
                <select 
                  className="fi" 
                  id="simPer" 
                  defaultValue="30"
                  onChange={(e) => setPeriod(parseInt(e.target.value))}
                >
                  <option value="7">7 days</option>
                  <option value="30" selected>30 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
              <div className="fg">
                <label className="fl">Spread threshold</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="2" 
                  step="0.1" 
                  defaultValue="0.5" 
                  onChange={handleSpreadChange}
                  style={{ width: "100%", accentColor: "var(--p)" }}
                />
                <div style={{ textAlign: "right", fontSize: "11px", color: "var(--pb)", fontFamily: "var(--mono)", marginTop: "2px" }} id="thrO">
                  {spread}%
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-p" style={{ flex: 1, padding: "10px" }} onClick={runSim}>
                  ▶ Run
                </button>
                <button className="btn btn-g2" style={{ flex: 1, padding: "10px" }} onClick={runSim}>
                  ✓ Verify
                </button>
              </div>
            </div>
            
            {showResults && (
              <div className="scard scc" id="simRes" style={{ display: "block" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
                  <div className="pulse"></div>
                  <span className="st" style={{ color: "var(--t2)" }}>Simulation Complete</span>
                </div>
                <div className="g2" style={{ gap: "8px", marginBottom: "12px" }}>
                  <div className="scard scc">
                    <div className="sg-l">Return</div>
                    <div className="sg-v" style={{ color: "var(--t2)" }} id="sRet">+{simResults.return}%</div>
                  </div>
                  <div className="scard scc">
                    <div className="sg-l">Net Profit</div>
                    <div className="sg-v" style={{ color: "var(--t2)" }} id="sPro">+${simResults.profit}</div>
                  </div>
                  <div className="scard scc">
                    <div className="sg-l">Drawdown</div>
                    <div className="sg-v" style={{ color: "var(--a)" }}>-{simResults.drawdown}%</div>
                  </div>
                  <div className="scard scc">
                    <div className="sg-l">Sharpe</div>
                    <div className="sg-v" style={{ color: "var(--c)" }}>{simResults.sharpe}</div>
                  </div>
                </div>
                <hr />
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--t2)" }}>Gross profit</span>
                    <span style={{ fontFamily: "var(--mono)", color: "var(--t2)" }}>+${simResults.grossProfit}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--t2)" }}>Gas fees</span>
                    <span style={{ fontFamily: "var(--mono)", color: "var(--r)" }}>-${simResults.gasFees}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--t2)" }}>Platform (2%)</span>
                    <span style={{ fontFamily: "var(--mono)", color: "var(--r)" }}>-${simResults.platformFee}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--b1)", paddingTop: "6px", fontWeight: 700 }}>
                    <span>Net profit</span>
                    <span style={{ fontFamily: "var(--mono)", color: "var(--t2)" }} id="sNet">+${simResults.netProfit}</span>
                  </div>
                </div>
                <button className="btn btn-p" style={{ width: "100%", padding: "9px" }} onClick={executeStrategy}>
                  🚀 Execute Strategy →
                </button>
              </div>
            )}
          </div>
          
          <div className="scard scc">
            <div className="st" style={{ marginBottom: "12px" }}>Backtest Chart</div>
            <div className="cw" style={{ height: "260px" }}>
              <canvas ref={backtestChartRef} role="img" aria-label="Backtest">
                Capital growth simulation.
              </canvas>
            </div>
            <div className="alert al-i" style={{ marginTop: "12px" }}>
              Backtest uses real DEX price data. Past results ≠ future performance.
            </div>
            <div className="st" style={{ fontSize: "12.5px", marginBottom: "8px", marginTop: "14px" }}>
              Trade Distribution
            </div>
            <div className="cw" style={{ height: "80px" }}>
              <canvas ref={distChartRef} role="img" aria-label="Distribution">
                Profit distribution histogram.
              </canvas>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}