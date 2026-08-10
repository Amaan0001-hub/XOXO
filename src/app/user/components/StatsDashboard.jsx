"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Award,
  Clock,
  CheckCircle2,
  Zap,
  TrendingUp,
  Infinity as InfinityIcon,
  Users,
  MessageCircle,
  BookOpen,
  Radio,
  Download,
  ArrowRight,
  Crown,
} from "lucide-react";
import { learner, membershipBenefits } from "./lmsData";

const iconMap = {
  infinity: InfinityIcon,
  award: Award,
  users: Users,
  "message-circle": MessageCircle,
  "book-open": BookOpen,
  radio: Radio,
  download: Download,
};

function ProgressRing({ value, size = 120, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="url(#ringGradient)"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function StatTile({ icon: Icon, label, value, accent }) {
  return (
    <div className="card border-0 h-100" style={{ background: "rgba(255,255,255,0.03)", borderRadius: "16px" }}>
      <div className="card-body p-3">
        <div
          className="d-flex align-items-center justify-content-center mb-2 rounded-2"
          style={{ width: 36, height: 36, background: `${accent}20`, color: accent }}
        >
          <Icon size={16} />
        </div>
        <div className="fw-bold text-white" style={{ fontSize: "20px" }}>{value}</div>
        <div className="small text-white-50" style={{ fontSize: "12px" }}>{label}</div>
      </div>
    </div>
  );
}

function LearningTicker() {
  const items = [
    `STREAK ${learner.streakDays}D`,
    `XP +${learner.xp}`,
    `LEVEL ${learner.level} · ${learner.levelTitle.toUpperCase()}`,
    `TODAY ${learner.todayMinutes}M`,
    `CERTS ${learner.certificates}`,
    `LESSONS ${learner.lessonsCompleted}`,
  ];
  const loop = [...items, ...items];

  return (
    <div className="lms-ticker rounded-pill border border-white border-opacity-10 py-2">
      <motion.div
        className="ticker-track px-4 small fw-semibold text-success"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {loop.map((t, i) => (
          <span key={i} className="d-inline-flex align-items-center gap-2 me-4">
            <span className="rounded-circle bg-success" style={{ width: 6, height: 6 }} />
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function StatsDashboard({ onContinueLearning }) {
  return (
    <section className="row g-4 align-items-stretch mb-4">
      <div className="col-12 col-lg-8">
        <div className="card border-0 h-100" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(34,197,94,0.1) 100%)", borderRadius: "20px" }}>
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-md-row align-items-start justify-content-between gap-4">
              <div className="flex-grow-1">
                <h2 className="text-white mb-1" style={{ fontSize: "28px", fontWeight: "600" }}>
                  Welcome back, {learner.name.split(" ")[0]}
                </h2>
                <p className="text-white-50 mb-3" style={{ fontSize: "14px" }}>
                  Continue your learning journey
                </p>
                
                <div className="row g-2">
                  <div className="col-6 col-sm-3">
                    <StatTile icon={Clock} label="Today's Learning" value={`${learner.todayMinutes}m`} accent="#3B82F6" />
                  </div>
                  <div className="col-6 col-sm-3">
                    <StatTile icon={Award} label="Certificates" value={learner.certificates} accent="#FFD54A" />
                  </div>
                  <div className="col-6 col-sm-3">
                    <StatTile icon={CheckCircle2} label="Lessons" value={learner.lessonsCompleted} accent="#22C55E" />
                  </div>
                  <div className="col-6 col-sm-3">
                    <StatTile icon={Flame} label="Streak" value={`${learner.streakDays}d`} accent="#FFD54A" />
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column align-items-center gap-3">
                <div className="position-relative d-flex align-items-center justify-content-center">
                  <ProgressRing value={learner.overallProgress} />
                  <div className="position-absolute d-flex flex-column align-items-center">
                    <span className="fw-bold text-white" style={{ fontSize: "24px" }}>{learner.overallProgress}%</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={onContinueLearning} 
                  className="btn text-white fw-semibold"
                  style={{ 
                    background: "linear-gradient(135deg, #3B82F6 0%, #22C55E 100%)",
                    borderRadius: "12px",
                    padding: "12px 24px",
                    fontSize: "14px"
                  }}
                >
                  Continue Learning
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-4">
        <div className="card border-0 h-100" style={{ background: "rgba(255,213,74,0.08)", borderRadius: "20px", border: "1px solid rgba(255,213,74,0.2)" }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Crown size={20} className="text-warning" />
              <h3 className="text-white mb-0" style={{ fontSize: "18px", fontWeight: "600" }}>Premium Member</h3>
            </div>
            <p className="text-white-50 mb-4" style={{ fontSize: "13px" }}>
              Unlock all courses, live signals & certified completion
            </p>

            <ul className="list-unstyled mb-4 d-flex flex-column gap-2">
              {membershipBenefits.slice(0, 4).map((b) => {
                const Icon = iconMap[b.icon] || TrendingUp;
                return (
                  <li key={b.label} className="d-flex align-items-center gap-2 text-white-75" style={{ fontSize: "13px" }}>
                    <span className="d-flex align-items-center justify-content-center rounded-1" style={{ width: 24, height: 24, background: "rgba(255,213,74,0.15)", color: "#FFD54A" }}>
                      <Icon size={12} />
                    </span>
                    <span>{b.label}</span>
                  </li>
                );
              })}
            </ul>

            <button 
              type="button" 
              className="btn fw-semibold w-100"
              style={{ 
                background: "#FFD54A",
                color: "#0A0F1F",
                borderRadius: "12px",
                padding: "12px",
                fontSize: "14px"
              }}
            >
              Buy Membership
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
