"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import Chart from 'chart.js/auto';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { getUserDashboardDetails } from "../../redux/slices/authSlice";
import { getallusernotification } from "../../redux/slices/ticketSlice";
import { useDispatch, useSelector } from "react-redux";
import { getUserId } from "@/app/api/auth";
import { botActivate } from "@/app/redux/slices/fundManagerSlice"
import { useRouter } from 'next/navigation';
import XoxoFxChatbot from '../components/Xoxofxchatbot';  
import RankProgress from '../components/RankProgress';


export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const chartEarnRef = useRef(null);
  const chartPieRef = useRef(null);
  const chartPortRef = useRef(null);
  const oppLRef = useRef(null);
  const heatmapRef = useRef(null);
  const execGridRef = useRef(null);
  const fuTrackRef = useRef(null);
  const timerNumRef = useRef(null);

  // Popup States
  const [showBotPopup, setShowBotPopup] = useState(false);
  const [showSimplePopup, setShowSimplePopup] = useState(false);
  const [showRefPopup, setShowRefPopup] = useState(false);
  const [showBuyPackagePopup, setShowBuyPackagePopup] = useState(false);
  const [showCongratsPopup, setShowCongratsPopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  // Timer states
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [botStartTime, setBotStartTime] = useState(null);
  const [botTime, setBotTime] = useState(null);

  const [isBotActive, setIsBotActive] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [botActiveTime, setBotActiveTime] = useState(null);

  const BOT_SESSION_KEY = 'xoxoBotActive';
  const BOT_START_KEY = 'xoxoBotStartTime';


  function formatElapsedTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  function formatBotTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  const userURID = getUserId();


  const botStatus = Number(dashboardData?.[0]?.chktodayBotStatus ?? 0);
  const notifications = useSelector((state) => state.ticket?.notificationData);

  const notificationList = notifications?.notificationList ?? notifications?.notificationList ?? [];

  const notificationCount = notificationList?.length || 0;
  const unseenTotal = Array.isArray(notificationList) ? notificationList.filter(n => !n.Seen).length : 0;
  const botIsActive = isBotActive || botStatus === 1;

  // IMPORTANT: Bot should only be considered active if Kid === 1
  const shouldBotBeActive = botIsActive && dashboardData?.[0]?.Kid === 1;
  const isKidNotOne = dashboardData?.[0]?.Kid !== 1;
  const isKidFive = dashboardData?.[0]?.Kid === 5;
  const isKidOne = dashboardData?.[0]?.Kid === 1;

  useEffect(() => {
    // if (!userURID) return;

    const fetchNotifications = async () => {
      try {
        await dispatch(getallusernotification()).unwrap();
      } catch (err) {
        try {
          dispatch(Getusernotification());
        } catch (e) {
          console.error('Failed to fetch user notifications:', e || err);
        }
      }
    };

    fetchNotifications();
  }, [dispatch]);

  // Show SIMPLE popup when Kid = 1 and bot is not active (auto on page load)
  useEffect(() => {
    if (dashboardData && !shouldBotBeActive) {
      if (isKidFive) {
        setShowBuyPackagePopup(true);
      } else if (isKidOne) {
        // Show simple message popup when Kid = 1
        setShowSimplePopup(true);
      }
    }
  }, [dashboardData, shouldBotBeActive, isKidFive, isKidOne]);

  // Restore bot state from API and localStorage on page load/refresh
  useEffect(() => {
    try {
      const apiBotTime = dashboardData?.[0]?.BotActiveTime;

      if (apiBotTime && botStatus === 1) {
        let startTime;
        if (typeof apiBotTime === 'number') {
          startTime = apiBotTime;
        } else if (typeof apiBotTime === 'string') {
          startTime = new Date(apiBotTime).getTime();
        }

        if (apiBotTime && !isNaN(apiBotTime)) {
          setBotStartTime(apiBotTime);
          const elapsed = (apiBotTime);
          setElapsedSeconds(elapsed > 0 ? elapsed : 0);
          setIsBotActive(true);

          if (timerNumRef.current) {
            timerNumRef.current.textContent = formatElapsedTime(elapsed > 0 ? elapsed : 0);
          }
        }
      } else {
        const storedActive = localStorage.getItem(BOT_SESSION_KEY) === 'true';

        if (storedActive && storedStart && !Number.isNaN(storedStart)) {
          setBotStartTime(storedStart);
          const elapsed = Math.floor((Date.now() - storedStart) / 1000);
          setElapsedSeconds(elapsed > 0 ? elapsed : 0);
          setIsBotActive(true);

          if (timerNumRef.current) {
            timerNumRef.current.textContent = formatElapsedTime(elapsed > 0 ? elapsed : 0);
          }
        }
      }
    } catch (err) {
      console.warn('Could not restore bot timer from localStorage', err);
    }
  }, [dashboardData, botStatus]);

  // Handle botStatus changes from API
  useEffect(() => {
    if (botStatus === 1) {
      const apiBotTime = dashboardData?.[0]?.BotActiveTime;

      if (apiBotTime) {
        let startTime;
        if (typeof apiBotTime === 'number') {
          startTime = apiBotTime * 1000;
        } else if (typeof apiBotTime === 'string') {
          startTime = new Date(apiBotTime).getTime();
        }

        if (startTime && !isNaN(startTime)) {
          setBotStartTime(startTime);
          setBotActiveTime(startTime);
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setElapsedSeconds(elapsed > 0 ? elapsed : 0);

          if (timerNumRef.current) {
            timerNumRef.current.textContent = formatElapsedTime(elapsed > 0 ? elapsed : 0);
          }
        }
      } else {
        const storedStart = Number(localStorage.getItem(BOT_START_KEY));
        if (storedStart && !Number.isNaN(storedStart)) {
          setBotStartTime(storedStart);
          const elapsed = Math.floor((Date.now() - storedStart) / 1000);
          setElapsedSeconds(elapsed > 0 ? elapsed : 0);

          if (timerNumRef.current) {
            timerNumRef.current.textContent = formatElapsedTime(elapsed > 0 ? elapsed : 0);
          }
        } else {
          const now = Date.now();
          setBotStartTime(now);
          setElapsedSeconds(0);

          if (timerNumRef.current) {
            timerNumRef.current.textContent = formatElapsedTime(0);
          }
        }
      }
      setIsBotActive(true);
      // Close any open popups when bot becomes active
      setShowBotPopup(false);
      setShowSimplePopup(false);
      setShowBuyPackagePopup(false);
    } else {
      setIsBotActive(false);
      setBotStartTime(null);
      setElapsedSeconds(0);
      setBotActiveTime(null);
      localStorage.removeItem(BOT_SESSION_KEY);
      localStorage.removeItem(BOT_START_KEY);

      if (timerNumRef.current) {
        timerNumRef.current.textContent = formatElapsedTime(0);
      }
    }
  }, [botStatus, dashboardData]);

  const totalIncome = Number(dashboardData?.[0]?.TotalIncome ?? 0);
  const earningLimit = Number(dashboardData?.[0]?.EarningLimit ?? 0);
  const remainingLimit = Number(dashboardData?.[0]?.RemainingLimit ?? Math.max(0, earningLimit - totalIncome));
  const usedPercentage = earningLimit > 0 ? Math.min(100, (totalIncome / earningLimit) * 100) : 0;
  const visualPercent = Number(usedPercentage.toFixed(1));
  const strokeOffset = 339 - (339 * visualPercent) / 100;

  const slides = [
    { id: 0, image: "/assets/images/forex.png", alt: "Forex" },
    { id: 1, image: "/assets/images/crypto.png", alt: "Crypto" },
    { id: 2, image: "/assets/images/stock.png", alt: "Stock" },
  ];

  useEffect(() => {
    const fetchDashboardDetails = async () => {
      // if (!userURID) return;

      setIsLoading(true);
      try {
        const result = await dispatch(getUserDashboardDetails()).unwrap();

        if (result?.data) {
          setDashboardData(result.data);

          const botTime = result.data[0]?.BotActiveTime;
          if (botTime && botStatus === 1) {
            setBotActiveTime(botTime);

            let startTime;
            if (typeof botTime === 'number') {
              startTime = botTime * 1000;
            } else if (typeof botTime === 'string') {
              startTime = new Date(botTime).getTime();
            }

            if (startTime && !isNaN(startTime)) {
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              setElapsedSeconds(elapsed > 0 ? elapsed : 0);
              setBotStartTime(startTime);
              setIsBotActive(true);
            }
          }
        } else if (result) {
          setDashboardData(result);

          const botTime = result[0]?.BotActiveTime;
          if (botTime && botStatus === 1) {
            setBotActiveTime(botTime);

            let startTime;
            if (typeof botTime === 'number') {
              startTime = botTime * 1000;
            } else if (typeof botTime === 'string') {
              startTime = new Date(botTime).getTime();
            }

            if (startTime && !isNaN(startTime)) {
              localStorage.setItem(BOT_START_KEY, startTime.toString());
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              setElapsedSeconds(elapsed > 0 ? elapsed : 0);
              setBotStartTime(startTime);
              setIsBotActive(true);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardDetails();
  }, [dispatch]);

  // Popup Functions
  const openBotFullPopup = () => {
    if (isKidOne && !shouldBotBeActive) {
      setShowSimplePopup(false); // Close simple popup
      setShowBotPopup(true); // Open full popup with checkbox
    }
  };

  const closeBotFullPopup = () => {
    setShowBotPopup(false);
    setIsCheckboxChecked(false);
  };

  const closeSimplePopup = () => {
    setShowSimplePopup(false);
  };

  const closeBuyPackagePopup = () => {
    setShowBuyPackagePopup(false);
  };

  const closeCongratsPopup = () => {
    setShowCongratsPopup(false);
  };

  const openRef = () => {
    setShowRefPopup(true);
  };

  const closeRef = () => {
    setShowRefPopup(false);
  };

  const copyRef = async () => {
    const refLink = "https://arbion.ai/ref/ARB-a9x7k2-premium";
    try {
      await navigator.clipboard.writeText(refLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareOn = (platform) => {
    const refLink = "https://arbion.ai/ref/ARB-a9x7k2-premium";
    const text = "Join me on XOXO AI Engine - earn up to 8% commission!";
    let url = "";
    switch (platform) {
      case "WhatsApp":
        url = `https://wa.me/?text=${encodeURIComponent(text + " " + refLink)}`;
        break;
      case "Facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(refLink)}`;
        break;
      case "Instagram":
        navigator.clipboard.writeText(`${text} ${refLink}`);
        alert("Link copied! Share it on Instagram.");
        return;
      case "Telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(text)}`;
        break;
    }
    if (url) window.open(url, "_blank");
  };

  useEffect(() => {
    let interval;
    if (shouldBotBeActive && botStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - botStartTime) / 1000);
        setElapsedSeconds(elapsed > 0 ? elapsed : 0);

        if (timerNumRef.current) {
          timerNumRef.current.textContent = formatElapsedTime(elapsed > 0 ? elapsed : 0);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [shouldBotBeActive, botStartTime]);

  useEffect(() => {
    if (timerNumRef.current && shouldBotBeActive) {
      timerNumRef.current.textContent = formatElapsedTime(elapsedSeconds);
    }
  }, [elapsedSeconds, shouldBotBeActive]);

  useEffect(() => {
    if (!shouldBotBeActive) return;

    const refreshDashboard = async () => {
      try {
        const result = await dispatch(getUserDashboardDetails()).unwrap();
        const apiBotTime = result?.[0]?.BotActiveTime;
        if (apiBotTime !== undefined) {
          setBotTime(apiBotTime);
        }
      } catch (error) {
        console.error("Failed to refresh dashboard:", error);
      }
    };

    refreshDashboard();
    const interval = setInterval(refreshDashboard, 5000);
    return () => clearInterval(interval);
  }, [shouldBotBeActive, dispatch]);

  const activateBot = async () => {
    if (shouldBotBeActive ) return;

    const now = Date.now();

    try {
      const response = await dispatch(botActivate()).unwrap();

      localStorage.setItem(BOT_SESSION_KEY, 'true');
      localStorage.setItem(BOT_START_KEY, now.toString());
      setBotStartTime(now);
      setBotActiveTime(now);
      setElapsedSeconds(0);
      setIsBotActive(true);
      setShowBotPopup(false);
      setShowSimplePopup(false);
      setIsCheckboxChecked(false);

      // Show congratulation popup after successful activation
      setShowCongratsPopup(true);

      if (timerNumRef.current) {
        timerNumRef.current.textContent = formatElapsedTime(0);
      }

      const result = await dispatch(getUserDashboardDetails()).unwrap();
      if (result?.data) {
        setDashboardData(result.data);
      }

      // Auto close congratulation popup after 5 seconds
      setTimeout(() => {
        setShowCongratsPopup(false);
      }, 5000);

    } catch (error) {
      console.error('Failed to activate bot:', error);
      return;
    }

    const botNotif = document.getElementById('botNotif');
    const timerBox = document.getElementById('timerBox');
    const botActArea = document.getElementById('botActArea');
    if (botNotif) botNotif.style.display = 'flex';
    if (timerBox) timerBox.style.display = 'flex';
    if (botActArea) botActArea.style.display = 'none';
  };

  const pauseBot = () => {
    setIsBotActive(false);
    setBotStartTime(null);
    setElapsedSeconds(0);
    setBotActiveTime(null);
    localStorage.removeItem(BOT_SESSION_KEY);
    localStorage.removeItem(BOT_START_KEY);

    if (timerNumRef.current) {
      timerNumRef.current.textContent = formatElapsedTime(0);
    }
  };

  const closeAnnouncement = () => {
    setShowAnnouncement(false);
  };

  // Initialize charts
  useEffect(() => {
    if (chartEarnRef.current) {
      const ctx = chartEarnRef.current.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Earned',
              data: [1240, 2890, 4520, 8241],
              borderColor: '#a78bfa',
              backgroundColor: 'rgba(167, 139, 250, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Limit',
              data: [3000, 6000, 9000, 12000],
              borderColor: 'rgba(239, 68, 68, 0.5)',
              borderDash: [5, 5],
              backgroundColor: 'transparent',
              tension: 0.4,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    if (chartPieRef.current) {
      const ctx = chartPieRef.current.getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Trading', 'Level', 'Affiliate', 'Compound'],
          datasets: [{
            data: [4286, 1841, 841, 1274],
            backgroundColor: ['#22d3ee', '#34d399', '#a78bfa', '#fbbf24'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    if (chartPortRef.current) {
      const ctx = chartPortRef.current.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
          datasets: [{
            data: Array.from({ length: 30 }, (_, i) => 38000 + (i * 320)),
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }

    return () => {
      const charts = Chart.instances;
      Object.values(charts).forEach(chart => chart.destroy());
    };
  }, []);

  useEffect(() => {
    if (oppLRef.current && dashboardData && dashboardData.length > 0) {
      const userData = dashboardData[0];

      const opportunities = [
        {
          pair: 'Trading Withdrawal',
          profit: `+$${userData?.TradingWithdrawal || 0}`
        },
        {
          pair: 'Income Withdrawal',
          profit: `+$${userData?.IncomeWithdrawal || 0}`
        },
        {
          pair: 'Level Open',
          profit: `${userData.LevelOpen || 0}`
        },
        {
          pair: 'Income Wallet',
          profit: `+$${userData.IncomeWallet || 0}`
        },
        {
          pair: 'Deposit Wallet',
          profit: `+$${userData.DepositWallet || 0}`
        },
        {
          pair: 'Trading Wallet',
          profit: `+$${userData.TradingWallet || 0}`
        },
      ];
      oppLRef.current.innerHTML = opportunities.map(opp => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--b1)">
          <div><span>${opp.pair}</span></div>
          <div>${opp.profit}</div>
        </div>
      `).join('');
    }

    if (execGridRef.current) {
      const executions = [
        { hash: '0x7a3f...b291', profit: '+$342.50', time: '12s ago', chain: 'SOL' },
        { hash: '0x2e8c...d174', profit: '+$218.30', time: '34s ago', chain: 'ETH' },
        { hash: '0x9b4d...f823', profit: '+$156.20', time: '1m ago', chain: 'BSC' },
      ];
      execGridRef.current.innerHTML = executions.map(exec => `
        <div class="exec-item">
          <div style="display:flex;align-items:center;gap:8px"><span class="tag ${exec.chain.toLowerCase()}">${exec.chain}</span><span style="font-family:var(--mono);font-size:11px;cursor:pointer;color:var(--pb)">${exec.hash}</span></div>
          <div style="font-family:var(--mono);color:var(--brand-cyan);font-weight:900">+${exec.profit}</div>
          <div style="font-size:10px;color:var(--t2)">${exec.time}</div>
        </div>
      `).join('');
    }

    if (fuTrackRef.current) {
      const users = [
        { name: 'Alex***', country: '🇺🇸', amount: '$1,240' },
        { name: 'Maria***', country: '🇬🇧', amount: '$892' },
        { name: 'Wei***', country: '🇸🇬', amount: '$2,100' },
        { name: 'Carlos***', country: '🇧🇷', amount: '$567' },
      ];
      fuTrackRef.current.innerHTML = [...users, ...users].map(user => `
        <div class="fu-item">
          <div style="display:flex;align-items:center;gap:6px"><span style="font-size:16px">${user.country}</span><span style="font-weight:600">${user.name}</span></div>
          <div style="font-family:var(--mono);color:var(--t2);font-weight:700">${user.amount}</div>
        </div>
      `).join('');
    }

    if (heatmapRef.current) {
      const days = 28;
      let html = '';
      for (let i = 0; i < days; i++) {
        const profit = Math.random() * 100;
        let intensity = '';
        if (profit > 80) intensity = 'h4';
        else if (profit > 60) intensity = 'h3';
        else if (profit > 40) intensity = 'h2';
        else intensity = 'h1';
        html += `<div class="hcell ${intensity}" title="+$${Math.floor(profit * 10)}"></div>`;
        if ((i + 1) % 7 === 0 && i !== days - 1) html += '<div style="grid-column:1/-1;height:2px"></div>';
      }
      heatmapRef.current.innerHTML = html;
    }

    let oppCount = 142;
    const opmElement = document.getElementById('opm');
    if (opmElement) {
      const oppInterval = setInterval(() => {
        oppCount = Math.floor(140 + Math.random() * 20);
        opmElement.textContent = `${oppCount}/m`;
      }, 3000);
      return () => clearInterval(oppInterval);
    }
  }, [dashboardData]);

  return (
    <>
      <div className="content">

        {/* SIMPLE POPUP - ONLY FOR Kid = 1 (Auto appears on page load) */}
        {showSimplePopup && isKidOne && !shouldBotBeActive && (
          <div className="overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeSimplePopup();
            }
          }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="popup" style={{ maxWidth: '450px', width: '90%', animation: 'fadeInUp 0.4s ease-out' }}>
              <div style={{ height: "4px", background: "linear-gradient(90deg, #a78bfa, #06b6d4, #fbbf24)", borderRadius: "2px 2px 0 0" }}></div>

              <div onClick={closeSimplePopup} style={{ position: "absolute", top: "12px", right: "16px", cursor: "pointer", fontSize: "20px", color: "#94a3b8", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}>✕</div>

              <div style={{ padding: "28px 24px" }}>
                {/* Robot Icon */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                  <div style={{
                    width: "70px",
                    height: "70px",
                    background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="42" height="42" viewBox="0 0 64 64" fill="none">
                      <rect x="10" y="18" width="44" height="34" rx="9" stroke="#a78bfa" strokeWidth="1.8" />
                      <rect x="10" y="18" width="44" height="12" rx="9" fill="rgba(124,58,237,0.2)" />
                      <rect x="19" y="28" width="8" height="8" rx="3" fill="#06b6d4" />
                      <rect x="37" y="28" width="8" height="8" rx="3" fill="#7c3aed" />
                      <circle cx="23" cy="32" r="2" fill="#fff" opacity=".7" />
                      <circle cx="41" cy="32" r="2" fill="#fff" opacity=".7" />
                      <path d="M22 42h20" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M26 18V13M38 18V13" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="26" cy="11" r="3" fill="#7c3aed" />
                      <circle cx="38" cy="11" r="3" fill="#7c3aed" />
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div style={{ fontSize: "22px", fontWeight: "bold", background: "linear-gradient(135deg, #a78bfa, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    🤖 Trading Bot Activation Required
                  </div>
                </div>

                {/* Message */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <p style={{ fontSize: "14px", color: "#cbd5e1", marginBottom: "12px" }}>
                    Dear Investor,
                  </p>
                  <p style={{ fontSize: "14px", color: "#e2e8f0", marginBottom: "16px" }}>
                    To start receiving your trading income, please activate the AI Trading Bot once from your dashboard.
                  </p>

                  <div style={{ background: "rgba(6,182,212,0.1)", borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "13px", color: "#a78bfa" }}>
                      ⚡ After activation, the system will automatically connect your account with the trading engine and your trading income process will begin.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BUY PACKAGE POPUP - ONLY FOR Kid = 5 */}
        {showBuyPackagePopup && isKidFive && !shouldBotBeActive && (
          <div className="overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeBuyPackagePopup();
            }
          }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="popup" style={{ maxWidth: '450px', width: '90%', animation: 'fadeInUp 0.4s ease-out' }}>
              <div style={{ height: "4px", background: "linear-gradient(90deg, #fbbf24, #f59e0b, #ef4444)", borderRadius: "2px 2px 0 0" }}></div>

              <div onClick={closeBuyPackagePopup} style={{ position: "absolute", top: "12px", right: "16px", cursor: "pointer", fontSize: "20px", color: "#94a3b8", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}>✕</div>

              <div style={{ padding: "28px 24px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                  <div style={{
                    width: "70px",
                    height: "70px",
                    background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.15))",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5">
                      <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" />
                      <path d="M16 21V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V21" />
                      <path d="M12 7V5" />
                      <path d="M9 13H15" />
                      <path d="M12 10V16" />
                    </svg>
                  </div>
                </div>

                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div style={{ fontSize: "22px", fontWeight: "bold", background: "linear-gradient(135deg, #fbbf24, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    📦 Package Purchase Required
                  </div>
                </div>

                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <p style={{ fontSize: "14px", color: "#cbd5e1", marginBottom: "12px" }}>
                    Dear Investor,
                  </p>
                  <p style={{ fontSize: "14px", color: "#e2e8f0", marginBottom: "16px" }}>
                    Please purchase a trading package to activate your AI Trading Bot.
                  </p>

                  <div style={{ background: "rgba(251,191,36,0.1)", borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
                    <span style={{ fontSize: "13px", color: "#fbbf24" }}>
                      🛒 Choose a package that suits your investment goals and start Earning!
                    </span>
                  </div>
                </div>


              </div>
            </div>
          </div>
        )}

        {/* CONGRATULATION POPUP - Shown after bot activation */}
        {showCongratsPopup && (
          <div className="overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeCongratsPopup();
            }
          }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease-out' }}>
            <div className="popup" style={{ maxWidth: '500px', width: '90%', animation: 'celebrateIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)' }}>
              <div style={{ height: "4px", background: "linear-gradient(90deg, #10b981, #34d399, #fbbf24, #a78bfa)", borderRadius: "2px 2px 0 0" }}></div>

              {/* Sparkle elements */}
              <div style={{ position: 'absolute', top: '-20px', left: '-20px', fontSize: '30px', opacity: 0.8, animation: 'sparkle1 0.8s ease-in-out infinite' }}>✨</div>
              <div style={{ position: 'absolute', top: '-30px', right: '-10px', fontSize: '35px', opacity: 0.9, animation: 'sparkle2 0.9s ease-in-out infinite 0.2s' }}>⭐</div>
              <div style={{ position: 'absolute', bottom: '-20px', left: '50%', fontSize: '28px', opacity: 0.7, animation: 'sparkle3 0.7s ease-in-out infinite 0.4s' }}>✨</div>
              <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontSize: '32px', opacity: 0.8, animation: 'sparkle4 0.85s ease-in-out infinite 0.1s' }}>🌟</div>
              <div style={{ position: 'absolute', top: '20%', left: '-25px', fontSize: '25px', opacity: 0.6, animation: 'floatSparkle 1.2s ease-in-out infinite' }}>⚡</div>
              <div style={{ position: 'absolute', top: '60%', right: '-25px', fontSize: '28px', opacity: 0.7, animation: 'floatSparkle 1s ease-in-out infinite 0.3s' }}>💫</div>

              <div onClick={closeCongratsPopup} style={{ position: "absolute", top: "12px", right: "16px", cursor: "pointer", fontSize: "20px", color: "#94a3b8", transition: "color 0.2s", zIndex: 10 }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}>✕</div>

              <div style={{ padding: "32px 28px", textAlign: "center" }}>
                {/* Animated celebration icon */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", position: "relative" }}>
                  <div style={{
                    width: "90px",
                    height: "90px",
                    background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(139,92,246,0.2))",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "pulseCelebrate 0.6s ease-in-out infinite alternate"
                  }}>
                    <div style={{
                      width: "70px",
                      height: "70px",
                      background: "linear-gradient(135deg, #10b981, #34d399, #8b5cf6)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "rotateCelebrate 1s ease-in-out infinite"
                    }}>
                      <span style={{ fontSize: "45px" }}>🤖</span>
                    </div>
                  </div>
                  <div style={{ position: "absolute", top: "-10px", right: "20px", fontSize: "40px", animation: "bounce 0.5s ease-in-out infinite" }}>🎉</div>
                  <div style={{ position: "absolute", bottom: "-10px", left: "20px", fontSize: "35px", animation: "bounce 0.5s ease-in-out infinite 0.15s" }}>🎊</div>
                </div>

                {/* Woo Hoo! text */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "36px", fontWeight: "bold", background: "linear-gradient(135deg, #fbbf24, #f59e0b, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "8px", animation: "shake 0.3s ease-in-out" }}>
                    🎉 Woo Hoo! 🎉
                  </div>
                  <div style={{ fontSize: "26px", fontWeight: "bold", background: "linear-gradient(135deg, #a78bfa, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Bot Activated Successfully!
                  </div>
                </div>

                {/* Message */}
                <div style={{ marginBottom: "24px" }}>
                  <p style={{ fontSize: "15px", color: "#e2e8f0", marginBottom: "12px", lineHeight: 1.6 }}>
                    Your AI Trading Bot is now live and actively monitoring the markets!
                  </p>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "8px" }}>
                    🚀 The bot has started scanning for profitable opportunities
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* BOT ACTIVATION FULL POPUP - WITH CHECKBOX & BUTTON - Opens when user clicks "Activate Bot" button */}
        {showBotPopup && isKidOne && !shouldBotBeActive && (
          <div className="overlay" id="botOv" onClick={(e) => { if (e.target === e.currentTarget) closeBotFullPopup(); }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="popup">
              <div className="popup-bar" style={{ height: "4px", background: "linear-gradient(90deg, #a78bfa, #06b6d4)", borderRadius: "2px" }}></div>
              <div className="popup-x" onClick={closeBotFullPopup} style={{ position: "absolute", top: "12px", right: "16px", cursor: "pointer", fontSize: "20px", color: "var(--t2)" }}>✕</div>
              <div className="popup-body" style={{ padding: "20px" }}>
                <div className="bp-hero" style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                  <div className="bp-img" style={{ position: "relative" }}>
                    <div className="bp-ring" style={{ position: "absolute", inset: "-4px", borderRadius: "50%", border: "2px solid #a78bfa", opacity: 0.5 }}></div>
                    <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
                      <rect x="10" y="18" width="44" height="34" rx="9" stroke="#a78bfa" strokeWidth="1.5" />
                      <rect x="10" y="18" width="44" height="12" rx="9" fill="rgba(124,58,237,0.15)" />
                      <rect x="19" y="28" width="8" height="8" rx="3" fill="#06b6d4" opacity=".9" />
                      <rect x="37" y="28" width="8" height="8" rx="3" fill="#7c3aed" opacity=".9" />
                      <circle cx="23" cy="32" r="2" fill="#fff" opacity=".7" />
                      <circle cx="41" cy="32" r="2" fill="#fff" opacity=".7" />
                      <path d="M22 42h20" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M26 18V13M38 18V13" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="26" cy="11" r="3" fill="#7c3aed" />
                      <circle cx="38" cy="11" r="3" fill="#7c3aed" />
                      <path d="M10 32H5M59 32H54" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="4" cy="32" r="2.5" fill="#06b6d4" />
                      <circle cx="60" cy="32" r="2.5" fill="#06b6d4" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <div style={{ fontSize: "19px", fontWeight: 900, letterSpacing: "-.3px", color: "#fff" }}>
                        🤖 Trading <span style={{ color: "#a78bfa" }}>Bot Activation Required</span>
                      </div>
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--t2)", lineHeight: 1.7, marginBottom: "8px" }}>
                      Dear Investor, To start receiving your trading income, please activate the AI Trading Bot once from your dashboard.
                    </div>
                  </div>
                </div>

                <div style={{ background: "rgba(6,182,212,0.1)", borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "13px", color: "#a78bfa" }}>
                    ⚡ After activation, the system will automatically connect your account with the trading engine and your trading income process will begin.
                  </span>
                </div>

                <div className="bp-feats" style={{ marginBottom: "16px" }}>
                  <div className="bp-feat" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "11px" }}>
                    <div className="bp-dot" style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#a78bfa" }}></div>
                    The bot may execute automated buy/sell orders
                  </div>
                  <div className="bp-feat" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "11px" }}>
                    <div className="bp-dot" style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#a78bfa" }}></div>
                    Perform arbitrage and MEV trading
                  </div>
                  <div className="bp-feat" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "11px" }}>
                    <div className="bp-dot" style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#a78bfa" }}></div>
                    Monitor market opportunities 24/7
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", marginBottom: "16px", fontSize: "12px", color: "#fff" }}>
                  <input
                    type="checkbox"
                    id="approveTrading"
                    checked={isCheckboxChecked}
                    onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#8b5cf6", cursor: "pointer", flexShrink: 0 }}
                  />
                  <label htmlFor="approveTrading" style={{ cursor: "pointer", fontSize: "12px", color: "#fff", margin: 0, lineHeight: 1.4 }}>
                    I understand and approve automated trading execution.
                  </label>
                </div>

                <button
                  className="btn btn-p"
                  style={{
                    width: "100%",
                    padding: "13px",
                    fontSize: "14px",
                    background: shouldBotBeActive
                      ? 'rgba(255,255,255,0.12)'
                      : (isCheckboxChecked
                        ? 'linear-gradient(135deg, #7c3aed, #06b6d4)'
                        : 'rgba(255,255,255,0.2)'),
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontWeight: "bold",
                    cursor: (shouldBotBeActive || !isCheckboxChecked) ? 'not-allowed' : 'pointer',
                    opacity: (shouldBotBeActive || !isCheckboxChecked) ? 0.6 : 1,
                    transition: "all 0.3s ease",
                  }}
                  onClick={activateBot}
                  disabled={shouldBotBeActive || !isCheckboxChecked}
                >
                  {shouldBotBeActive ? '✔ Bot Active' : '🔴 Activate Bot — Start Earning Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REFERRAL POPUP */}
        {showRefPopup && (
          <div className="overlay" id="refOv" onClick={(e) => { if (e.target === e.currentTarget) closeRef(); }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="popup">
              <div className="popup-bar" style={{ height: "4px", background: "linear-gradient(90deg, #a78bfa, #fbbf24)", borderRadius: "2px" }}></div>
              <div className="popup-x" onClick={closeRef} style={{ position: "absolute", top: "12px", right: "16px", cursor: "pointer", fontSize: "20px", color: "var(--t2)" }}>✕</div>
              <div className="popup-body" style={{ padding: "20px" }}>
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div style={{ fontSize: "21px", fontWeight: 900, letterSpacing: "-.4px", marginBottom: "4px", color: "#fff" }}>
                    Invite &amp; <span style={{ color: "#a78bfa" }}>Earn</span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--t2)", lineHeight: 1.6 }}>
                    Share your link · Earn up to <strong style={{ color: "#fbbf24" }}>8% commission</strong> on every trade — 3 levels deep, paid daily
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "7px", marginBottom: "14px" }}>
                  <div className="bps" style={{ textAlign: "center", padding: "8px", background: "var(--card2)", borderRadius: "8px" }}><div className="bps-v" style={{ color: "var(--c)", fontSize: "18px", fontWeight: "bold" }}>12</div><div className="bps-l" style={{ fontSize: "10px", color: "var(--t2)" }}>Referrals</div></div>
                  <div className="bps" style={{ textAlign: "center", padding: "8px", background: "var(--card2)", borderRadius: "8px" }}><div className="bps-v" style={{ color: "var(--g)", fontSize: "18px", fontWeight: "bold" }}>$841</div><div className="bps-l" style={{ fontSize: "10px", color: "var(--t2)" }}>Earned</div></div>
                  <div className="bps" style={{ textAlign: "center", padding: "8px", background: "var(--card2)", borderRadius: "8px" }}><div className="bps-v" style={{ color: "var(--pb)", fontSize: "18px", fontWeight: "bold" }}>$92k</div><div className="bps-l" style={{ fontSize: "10px", color: "var(--t2)" }}>Team Vol</div></div>
                </div>
                <div style={{ fontSize: "10px", color: "var(--t2)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: "6px" }}>
                  Your Unique Referral Link
                </div>
                <div className="ref-link">https://arbion.ai/ref/ARB-a9x7k2-premium</div>
                <button className="copy-btn" onClick={copyRef}>
                  {copySuccess ? "✓ Copied!" : "Copy Referral Link"}
                </button>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px", marginBottom: "14px" }}>
                  <div style={{ background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--g)" }}>8%</div>
                    <div style={{ fontSize: "9px", color: "var(--t2)", fontWeight: 700, textTransform: "uppercase" }}>Level 1</div>
                  </div>
                  <div style={{ background: "rgba(6,182,212,.08)", border: "1px solid rgba(6,182,212,.2)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--c)" }}>5%</div>
                    <div style={{ fontSize: "9px", color: "var(--t2)", fontWeight: 700, textTransform: "uppercase" }}>Level 2</div>
                  </div>
                  <div style={{ background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.2)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--pb)" }}>3%</div>
                    <div style={{ fontSize: "9px", color: "var(--t2)", fontWeight: 700, textTransform: "uppercase" }}>Level 3</div>
                  </div>
                </div>
                <div style={{ fontSize: "10px", color: "var(--t2)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: "8px" }}>
                  Share on Social Media
                </div>
                <div className="soc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
                  <button className="soc-btn soc-wa" onClick={() => shareOn('WhatsApp')} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "8px", background: "#25D366", border: "none", borderRadius: "8px", color: "white", fontSize: "11px", cursor: "pointer" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.898-1.425A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2" /></svg>
                    WA
                  </button>
                  <button className="soc-btn soc-fb" onClick={() => shareOn('Facebook')} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "8px", background: "#1877F2", border: "none", borderRadius: "8px", color: "white", fontSize: "11px", cursor: "pointer" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    FB
                  </button>
                  <button className="soc-btn soc-ig" onClick={() => shareOn('Instagram')} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "8px", background: "#E4405F", border: "none", borderRadius: "8px", color: "white", fontSize: "11px", cursor: "pointer" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                    IG
                  </button>
                  <button className="soc-btn soc-tg" onClick={() => shareOn('Telegram')} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "8px", background: "#0088cc", border: "none", borderRadius: "8px", color: "white", fontSize: "11px", cursor: "pointer" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.012 9.481c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.875.74z" /></svg>
                    TG
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='row'>
          {/* <div className='col-md-3 mb-2'>
            <span className="ann new-ann-badge">
              🏆 {dashboardData?.[0]?.UserRank}
            </span>
          </div> */}
          <div className='col-md-12  mb-2'>
            {/* ANNOUNCEMENT SECTION */}
            {showAnnouncement && dashboardData?.[0]?.News && (() => {
              const newsText = dashboardData[0].News.replace(/<[^>]*>/g, '');
              return (
                <div className="ann" id="annEl">
                  <span className="ann-badge">📢 LIVE</span>
                  <div className="ann-ticker"><div className="ann-track">
                    <span className="ann-item">{newsText}</span>
                    <span className="ann-item">{newsText}</span>
                  </div></div>
                </div>
              );
            })()}
          </div>
        </div>

        
  <RankProgress activeRank = {dashboardData?.[0]?.UserRank}/>
  

        {/* INCOME GRID */}
        <div className="it-grid">
          <div className="it bg-p gl gl-p"
            onClick={() => {
              router.push('/user/dashboard/income-statement?tab=SingleLegIncome');
            }} >
            <div className="it-ic">
              <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.5" className="svg-size">
                <circle cx="7" cy="5.5" r="3" />
                <circle cx="14" cy="6.5" r="2.5" />
                <path d="M1 17c0-2.8 2.7-5 6-5s6 2.2 6 5" strokeLinecap="round" />
                <path d="M14 10.5c2 .4 3.5 2 3.5 4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="it-lbl">Single Leg Income</div>
            <div className="it-val">${dashboardData?.[0]?.SingleSpillIncome || "0.00"}</div>
            <span className="it-chg">▲ {dashboardData?.[0]?.SingleSpillIncomeToday || "0.00"} today</span>
          </div>

          <div className="it bg-c gl gl-c"
            onClick={() => {
              router.push('/user/dashboard/income-statement?tab=PairVolumeIncome');
            }} >
            <div className="it-ic">
              <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.5" className="svg-size">
                <polyline points="2,14 6,8 10,11 14,5 18,8" />
                <path d="M14 3h4v4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="it-lbl">Pair Volume Income</div>
            <div className="it-val">${dashboardData?.[0]?.PairVolumeIncome || "0.00"}</div>
            <span className="it-chg">▲ {dashboardData?.[0]?.PairVolumeIncomeToday || "0.00"} today</span>
          </div>

          <div className="it bg-g gl gl-g"
            onClick={() => {
              router.push('/user/dashboard/income-statement?tab=TradingBotIncome');
            }}  >
            <div className="it-ic">
              <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.5" className="svg-size">
                <path d="M10 2L3 6.5v7L10 18l7-4.5v-7z" strokeLinejoin="round" />
                <path d="M10 11V8M8 9.5h4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="it-lbl">Trading Bot Income</div>
            <div className="it-val">${dashboardData?.[0]?.TradingBotIncome || "0.00"}</div>
            <span className="it-chg">▲ {dashboardData?.[0]?.TradingBotIncomeToday || "0.00"} today</span>
          </div>

          <div className="it bg-a gl gl-a"
            onClick={() => {
              router.push('/user/dashboard/income-statement?tab=LeadershipRecurringIncome');
            }} >
            <div className="it-ic">
              <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.5" className="svg-size">
                <circle cx="10" cy="10" r="4" />
                <path d="M10 2v2M10 16v2M2 10h2M16 10h2" strokeLinecap="round" />
                <path d="M10 8v2l1.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="it-lbl">Leadership Recurring Income</div>
            <div className="it-val">${dashboardData?.[0]?.LeadershipTradingIncome || "0.00"}</div>
            <span className="it-chg">▲ {dashboardData?.[0]?.LeadershipTradingIncomeToday || "0.00"} today</span>
          </div>
          <div className="it bg-p gl gl-p"
            onClick={() => {
              router.push('/user/dashboard/income-statement?tab=PowerBoostIncome');
            }} >
            <div className="it-ic">
              <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.5" className="svg-size">
                <circle cx="7" cy="5.5" r="3" />
                <circle cx="14" cy="6.5" r="2.5" />
                <path d="M1 17c0-2.8 2.7-5 6-5s6 2.2 6 5" strokeLinecap="round" />
                <path d="M14 10.5c2 .4 3.5 2 3.5 4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="it-lbl">Power Boost Income</div>
            <div className="it-val">${dashboardData?.[0]?.PowerBoostIncome || "0.00"}</div>
            <span className="it-chg">▲ {dashboardData?.[0]?.PowerBoostIncomeToday || "0.00"} today</span>
          </div>
          <div className="it bg-c gl gl-c"
            onClick={() => {
              router.push('/user/dashboard/income-statement?tab=RewardIncome');
            }} >
            <div className="it-ic">
              <svg viewBox="0 0 20 20" fill="none" strokeWidth="1.5" className="svg-size">
                <polyline points="2,14 6,8 10,11 14,5 18,8" />
                <path d="M14 3h4v4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="it-lbl">Reward Income</div>
            <div className="it-val">${dashboardData?.[0]?.RewardIncome || "0.00"}</div>
            <span className="it-chg">▲ {dashboardData?.[0]?.RewardIncomeToday || "0.00"} today</span>
          </div>
        </div>

        {/* MID */}
        <div className="mid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="botcard">
            <div className="botbg"></div>
            <div className="bhead" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div className="owrap" style={{ position: 'relative' }}>
                <div className="orb" style={{ fontSize: '32px' }}>🤖</div>
                <div className="r1"></div>
                <div className="r2"></div>
              </div>
              <div>
                <div className="bname" style={{ fontWeight: 'bold' }}>XOXO AI Engine</div>
                <div className="bstatus" style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                  <div className="alive" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="pls" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#015c3b' }}></span>ACTIVE — EXECUTING</div>
                  <div className="bupt">· Uptime {formatElapsedTime(elapsedSeconds)}</div>
                </div>
              </div>
            </div>
            <div className="bdesc" style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '12px' }}>AI-driven Forex & Crypto trading engine operating 24/7 — automatically scanning market trends and executing profitable trading opportunities with high-speed precision.</div>
            <div className="mgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '12px', textAlign: 'center' }}>
              <div className="mcell"><div className="mv" style={{ fontSize: '16px', fontWeight: 'bold' }}>{dashboardData?.[0]?.Bot || 'N/A'}</div><div className="ml" style={{ fontSize: '12px', color: 'var(--t2)' }}>Bot</div></div>
              <div className="mcell"><div className="mv" style={{ fontSize: '16px', fontWeight: 'bold' }}>~{dashboardData?.[0]?.APY}</div><div className="ml" style={{ fontSize: '12px', color: 'var(--t2)' }}>APY</div></div>
              <div className="mcell"><div className="mv" id="powerBoosterStatus" style={{ fontSize: '16px', fontWeight: 'bold' }}>{dashboardData?.[0]?.PowerBoosterStatus}</div><div className="ml" style={{ fontSize: '12px', color: 'var(--t2)' }}>Boost Status</div></div>
              <div className="mcell"><div className="mv" style={{ fontSize: '16px', fontWeight: 'bold' }}>{dashboardData?.[0]?.BoosterValue}</div><div className="ml" style={{ fontSize: '12px', color: 'var(--t2)' }}>Boost Power</div></div>
            </div>
            <div className="bbtns" style={{ display: 'flex', gap: '8px' }}>
              <button
                className="bdep w-100"
                onClick={() => {
                  if (isKidFive && !shouldBotBeActive) {
                    setShowBuyPackagePopup(true);
                  } else if (isKidOne && !shouldBotBeActive) {
                    openBotFullPopup();
                  }
                }}
                disabled={shouldBotBeActive || isKidFive || (!isKidOne && !isKidFive)}
                style={{
                  opacity: (shouldBotBeActive || isKidFive || (!isKidOne && !isKidFive)) ? 0.5 : 1,
                  cursor: (shouldBotBeActive || isKidFive || (!isKidOne && !isKidFive)) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {shouldBotBeActive ? '✔ Bot Active' :
                  (isKidFive ? '🔒 Bot Unavailable' :
                    (isKidOne ? '▶ Activate Bot' : '🔒 Not Available'))}
              </button>
            </div>
            <div className="notif-bar" id="botNotif2" style={{
              display: shouldBotBeActive ? 'flex' : 'none',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))',
              border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', alignItems: 'center', gap: '10px'
            }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <polyline points="2,8 5.5,11.5 14,3.5" stroke="var(--t2)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className='cbs'>
                <strong>Your Bot is now ACTIVATED!</strong> — Scanning 142+ opportunities/min across SOL, ETH &amp; BSC. First profit expected within 60 seconds.
              </span>
              <div className="timer-box" id="timerBox2" style={{
                display: shouldBotBeActive ? 'flex' : 'none', alignItems: 'center', gap: '6px',
                background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: '20px', marginTop: "15px"
              }}>
                <div className="timer-num" >{formatBotTime(botTime)}</div>
                <div className="timer-lbl">🟢 Bot Running</div>
              </div>
            </div>
          </div>

          <div className="botcard">
            <div className="ch" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div className="ct" style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Summary Report Status
                </div>
              </div>
              <div className="va" onClick={openRef} style={{ cursor: "pointer", fontSize: '11px', color: '#a78bfa' }}>
                <span className="lb">
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--brand-green)", display: "inline-block" }}></span>
                  {dashboardData?.[0]?.PowerBoosterStatus || "N/A"}
                </span>
              </div>
            </div>
            <div className="olist" id="ol" ref={oppLRef}></div>
          </div>
        </div>

        {/* CHAIN BAR */}
        <div className="chbar">
          <div>
            <div className="bname">
              Network Status
            </div>
            <div className="cbdiv" style={{ height: '2px', background: 'var(--b1, #e2e8f0)', marginBottom: '20px' }} />
          </div>

          <div className="cbitems" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <div className="it bg-p gl gl-p">
              <div className="cblogo" style={{ background: 'rgba(240,185,11,.09)', color: '#f0b90b', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                🎯
              </div>
              <div className="cbd" style={{ flex: 1 }}>
                <div className="it-lbl">
                  Direct Downline
                </div>
                <div className="cbm" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                  <div className="cbs">
                    Direct Ids: <span>{dashboardData?.[0]?.DirectIds || 0}</span>
                  </div>
                  <div className="cbs">
                    Business: <span>${(dashboardData?.[0]?.DirectBusiness ?? dashboardData?.[0]?.DirectBussiness ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="it bg-c gl gl-c" >
              <div className="cblogo" style={{ background: 'rgba(98,126,234,.12)', color: '#627eea', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                ◀
              </div>
              <div className="cbd" style={{ flex: 1 }}>
                <div className="it-lbl">
                  Left Downline
                </div>
                <div className="cbm" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                  <div className="cbs">
                    Left Users: <span>{dashboardData?.[0]?.LeftTeam || 0}</span>
                  </div>
                  <div className="cbs">
                    Business: <span>${(dashboardData?.[0]?.LeftBussiness || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="it bg-g gl gl-g">
              <div className="cblogo" style={{ background: 'rgba(0,255,163,.07)', color: '#00ffa3', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                ▶
              </div>
              <div className="cbd" style={{ flex: 1 }}>
                <div className="it-lbl">
                  Right Downline
                </div>
                <div className="cbm" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                  <div className="cbs">
                    Right users: <span>{dashboardData?.[0]?.RightTeam || 0}</span>
                  </div>
                  <div className="cbs">
                    Business: <span>${(dashboardData?.[0]?.RightBussiness || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="it bg-a gl gl-a">
              <div className="cblogo" style={{ background: 'rgba(6,182,212,.08)', color: '#06b6d4', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                Σ
              </div>
              <div className="cbd" style={{ flex: 1 }}>
                <div className="it-lbl" style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>
                  Total Downline
                </div>
                <div className="cbm" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                  <div className="cbs">
                    Total Users: <span>{(dashboardData?.[0]?.LeftTeam || 0) + (dashboardData?.[0]?.RightTeam || 0)}</span>
                  </div>
                  <div className="cbs">
                    Business: <span>${((dashboardData?.[0]?.LeftBussiness || 0) + (dashboardData?.[0]?.RightBussiness || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="row" >
          <div className="bc col-md-4 botcard" style={{ height: '420px' }}>
            <div className="ch" style={{ marginBottom: 0 }}>
              <div className="ct" style={{ fontWeight: 'bold' }}>
                Trading Bot Package <span className="lb">${dashboardData?.[0]?.TotalInvestment || "0.00"}</span>
              </div>
            </div>
            <div className="erw" style={{ display: 'flex', justifyContent: 'center', margin: '12px 0', position: 'relative', width: '100%' }}>
              <svg width="100" height="100" viewBox="0 0 128 128">
                <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0099cc" /><stop offset="100%" stopColor="#00d4ff" /></linearGradient></defs>
                <circle className="rb" cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle className="rf rcyn" cx="64" cy="64" r="54" fill="none" stroke="url(#rg)" strokeWidth="8" strokeDasharray="339" strokeDashoffset={strokeOffset} transform="rotate(-90 64 64)" />
              </svg>
              <div className="rc" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div className="rpct" style={{ fontSize: '18px', fontWeight: 'bold' }}>{visualPercent}%</div>
                <div className="rlbl" style={{ fontSize: '9px', color: 'var(--t2)' }}>
                  used
                </div>
              </div>
            </div>
            <div className="etiles" style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
              <div className="etile" style={{ textAlign: 'center' }}><div className="etl" style={{ fontSize: '12px', color: 'var(--t2)' }}>Total Income</div><div className="etv" style={{ fontSize: '16px', fontWeight: 'bold', color: "var(--brand-cyan)" }}>${(dashboardData?.[0]?.TotalIncome || 0).toFixed(2) || "0.00"}</div></div>
              <div className="etile s2" style={{ textAlign: 'center' }}><div className="etl" style={{ fontSize: '12px', color: 'var(--t2)' }}>Max. Income Limit</div><div className="etv" style={{ fontSize: '16px', fontWeight: 'bold', color: "var(--brand-gold)" }}>${(dashboardData?.[0]?.EarningLimit || 0).toFixed(2) || "0.00"}</div></div>
              <div className="etile" style={{ textAlign: 'center' }}><div className="etl" style={{ fontSize: '12px', color: 'var(--t2)' }}>Remaining Limit</div><div className="etv" style={{ fontSize: '16px', fontWeight: 'bold', color: "var(--brand-green)" }}>${(dashboardData?.[0]?.RemainingLimit || 0).toFixed(2) || "0.00"}</div></div>
            </div>
          </div>

          <div className="bc col-md-4 botcard" style={{ padding: 0, height: '420px' }}>
            <XoxoFxChatbot />
          </div>

          <div className="bc col-md-4 botcard" style={{ height: '420px' }}>
            <div className="ch" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="ct" style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📰 XOXO Notification</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{notificationCount} items</div>
            </div>

            <div className="ncards2" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
              {notificationList && notificationList.length > 0 ? (
                notificationList.map((n, i) => (
                  <div
                    key={(n.URID || i) + i}
                    className="ncard"
                    style={{
                      padding: '8px',
                      background: n.Seen ? 'rgba(31,41,55,0.03)' : 'rgba(245,158,11,0.06)',
                      borderRadius: '8px',
                      border: n.Seen ? 'none' : '1px solid rgba(245,158,11,0.12)'
                    }}
                  >
                    <div className="ntop" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div className="ntxt" style={{ fontSize: '11px' }}>{n.AdminRemarks || ''}</div>
                      <div className="ntm" style={{ fontSize: '12px', color: 'var(--t2)' }}>{n.Amount || ''}</div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="ncard" style={{ padding: '8px', background: 'rgba(124,58,237,0.05)', borderRadius: '8px' }}>
                    <div className="ntop" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="ntag2 ntu" style={{ fontSize: '9px', color: '#a78bfa' }}>UPDATE</span>
                      <span className="ntm" style={{ fontSize: '9px', color: 'var(--t2)' }}>2m ago</span>
                    </div>
                    <div className="ntxt" style={{ fontSize: '11px' }}>Arbitrum One now live — 3 chains running simultaneously. SOL/USDC spreads widening.</div>
                  </div>
                  <div className="ncard" style={{ padding: '8px', background: 'rgba(239,68,68,0.05)', borderRadius: '8px' }}>
                    <div className="ntop" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="ntag2 nta" style={{ fontSize: '9px', color: '#ef4444' }}>ALERT</span>
                      <span className="ntm" style={{ fontSize: '9px', color: 'var(--t2)' }}>8m ago</span>
                    </div>
                    <div className="ntxt" style={{ fontSize: '11px' }}>High ETH volatility — bot in opportunistic mode. Execution frequency up 34%.</div>
                  </div>
                  <div className="ncard" style={{ padding: '8px', background: 'rgba(16,185,129,0.05)', borderRadius: '8px' }}>
                    <div className="ntop" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="ntag2 ntn" style={{ fontSize: '9px', color: '#015c3b' }}>NEWS</span>
                      <span className="ntm" style={{ fontSize: '9px', color: 'var(--t2)' }}>15m ago</span>
                    </div>
                    <div className="ntxt" style={{ fontSize: '11px' }}>BSC gas at 3 gwei — optimal conditions for cross-chain arb operations today.</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes celebrateIn {
          0% {
            opacity: 0;
            transform: scale(0.7) rotate(-10deg);
          }
          60% {
            opacity: 1;
            transform: scale(1.05) rotate(2deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        
        @keyframes pulseCelebrate {
          from {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          to {
            transform: scale(1.05);
            box-shadow: 0 0 0 20px rgba(16, 185, 129, 0);
          }
        }
        
        @keyframes rotateCelebrate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        
        @keyframes sparkle1 {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.3) rotate(10deg);
          }
        }
        
        @keyframes sparkle2 {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.4) rotate(-15deg);
          }
        }
        
        @keyframes sparkle3 {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.25) rotate(20deg);
          }
        }
        
        @keyframes sparkle4 {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.35) rotate(-10deg);
          }
        }
        
        @keyframes floatSparkle {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(15deg);
          }
        }
      `}</style>
    </>
  );
}