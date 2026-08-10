"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CandlestickChart,
  Bitcoin,
  TrendingUp,
  Layers,
  Compass,
  Star,
  Users,
  Clock,
  BookOpen,
  Lock,
  CheckCircle2,
  PlayCircle,
  Globe,
  GraduationCap,
} from "lucide-react";
import { categories, filterPills, courses } from "./lmsData";

const categoryIcon = {
  candlestick: CandlestickChart,
  bitcoin: Bitcoin,
  "trending-up": TrendingUp,
  layers: Layers,
  compass: Compass,
};

const accentHex = { blue: "#3B82F6", gold: "#FFD54A", green: "#22C55E" };

const thumbGradient = {
  "candlestick-blue": "linear-gradient(135deg, #0f2a52 0%, #13315f 60%, #0A0F1F 100%)",
  "candlestick-gold": "linear-gradient(135deg, #3a2c0c 0%, #4a3810 65%, #0A0F1F 100%)",
  "candlestick-green": "linear-gradient(135deg, #0f3320 0%, #123d27 65%, #0A0F1F 100%)",
};

function MiniCandles({ tone = "#3B82F6" }) {
  const bars = [40, 65, 30, 80, 55, 70, 45, 90, 35, 60];

  return (
    <svg viewBox="0 0 200 90" className="position-absolute top-0 start-0 w-100 h-100 opacity-40">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={10 + i * 19}
          y={90 - h}
          width="8"
          height={h}
          rx="1.5"
          fill={i % 3 === 0 ? "#22C55E" : tone}
          opacity={0.55 + (i % 4) * 0.1}
        />
      ))}
    </svg>
  );
}

function CategoryCard({ cat, active, onClick }) {
  const Icon = categoryIcon[cat.icon] || CandlestickChart;
  const hex = accentHex[cat.accent];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      className={`btn text-start p-3 ${active ? "" : ""}`}
      style={{ 
        background: active ? `${hex}20` : "rgba(255,255,255,0.03)",
        borderRadius: "16px",
        border: active ? `2px solid ${hex}` : "1px solid rgba(255,255,255,0.08)",
        minWidth: "160px",
        maxWidth: "180px"
      }}
    >
      <div className="d-flex align-items-center justify-content-center rounded-2 mb-2" style={{ width: 48, height: 48, background: `${hex}25`, color: hex }}>
        <Icon size={22} />
      </div>
      <h4 className="text-white fw-semibold mb-1" style={{ fontSize: "14px" }}>{cat.name}</h4>
      <p className="mb-0 text-white-50" style={{ fontSize: "11px" }}>{cat.tagline}</p>
      <span className="mt-2 small text-white-50" style={{ fontSize: "11px" }}>{cat.courseCount} courses</span>
    </motion.button>
  );
}

function DifficultyTag({ level }) {
  const tone = level === "Beginner" ? "#22C55E" : level === "Intermediate" ? "#FFD54A" : "#3B82F6";
  return (
    <span className="rounded-pill px-2 py-1 small fw-semibold" style={{ background: `${tone}1A`, color: tone }}>
      {level}
    </span>
  );
}

export function CourseCard({ course, onOpen }) {
  const isPremium = course.access === "premium";
  const isFree = course.access === "free";
  const isCompleted = course.progress >= 100;

  return (
    <motion.div whileHover={{ y: -4 }} className="card h-100 border-0" style={{ background: "rgba(255,255,255,0.03)", borderRadius: "20px" }}>
      <div className="position-relative overflow-hidden" style={{ minHeight: 180, background: thumbGradient[course.thumbnail] || thumbGradient["candlestick-blue"], borderRadius: "20px 20px 0 0" }}>
        <MiniCandles tone={accentHex.blue} />
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(10,15,31,.85) 100%)" }} />
        <div className="position-relative p-4 d-flex justify-content-between align-items-start">
          <div className="d-flex flex-wrap gap-2">
            <DifficultyTag level={course.level} />
            {isCompleted && (
              <span className="rounded-pill px-2 py-1 small fw-semibold d-inline-flex align-items-center gap-1" style={{ background: "rgba(34,197,94,0.2)", color: "#22C55E" }}>
                <CheckCircle2 size={11} /> Done
              </span>
            )}
          </div>
          {isPremium && (
            <span className="rounded-pill px-2 py-1 small fw-semibold d-inline-flex align-items-center gap-1 text-warning" style={{ background: "rgba(0,0,0,0.5)" }}>
              <Lock size={10} /> Premium
            </span>
          )}
        </div>
        {course.progress > 0 && course.progress < 100 && (
          <div className="position-absolute bottom-0 start-0 w-100" style={{ height: 4, background: "rgba(0,0,0,0.4)" }}>
            <div className="h-100" style={{ width: `${course.progress}%`, background: "linear-gradient(90deg, #22C55E 0%, #3B82F6 100%)" }} />
          </div>
        )}
      </div>

      <div className="card-body d-flex flex-column p-4">
        <h3 className="text-white mb-2" style={{ fontSize: "16px", fontWeight: "600" }}>{course.title}</h3>
        <p className="text-white-50 mb-3" style={{ fontSize: "13px" }}>{course.subtitle}</p>

        <div className="d-flex flex-wrap gap-3 text-white-50" style={{ fontSize: "12px" }}>
          <span className="d-inline-flex align-items-center gap-1"><BookOpen size={12} /> {course.lessonsCount} lessons</span>
          <span className="d-inline-flex align-items-center gap-1"><Clock size={12} /> {course.duration}</span>
          <span className="d-inline-flex align-items-center gap-1"><Users size={12} /> {(course.students / 1000).toFixed(1)}k</span>
        </div>

        <div className="mt-3 d-flex align-items-center gap-2" style={{ fontSize: "12px" }}>
          <div className="d-flex align-items-center gap-1 text-warning">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} fill={i < Math.round(course.rating) ? "currentColor" : "none"} strokeWidth={1.5} />
            ))}
          </div>
          <span className="text-white-50">{course.rating} ({course.ratingCount})</span>
        </div>

        <div className="mt-3 d-flex align-items-center gap-2 text-white-50" style={{ fontSize: "12px" }}>
          <GraduationCap size={13} /> {course.instructor}
          {course.certificate && <span className="ms-auto d-inline-flex align-items-center gap-1 text-success"><CheckCircle2 size={12} /> Certificate</span>}
        </div>

        {course.progress > 0 && course.progress < 100 && (
          <div className="mt-3">
            <div className="progress" style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px" }}>
              <div className="progress-bar" style={{ width: `${course.progress}%`, background: "linear-gradient(90deg, #22C55E 0%, #3B82F6 100%)", borderRadius: "3px" }} />
            </div>
            <p className="mt-2 text-white-50 mb-0" style={{ fontSize: "12px" }}>{course.progress}% complete</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => onOpen(course)}
          className={`btn mt-4 fw-semibold ${
            isFree
              ? "btn-outline-success"
              : course.progress > 0
              ? ""
              : "btn-outline-light"
          }`}
          style={{ 
            borderRadius: "12px",
            fontSize: "13px"
          }}
        >
          {isFree ? (
            <><PlayCircle size={15} className="me-2" /> Start Free</>
          ) : course.progress > 0 ? (
            <>Continue Learning</>
          ) : (
            <><Lock size={13} className="me-2" /> Included in Membership</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default function CourseCatalog({ onOpenCourse }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [activePill, setActivePill] = useState("all");

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (activeCategory && c.category !== activeCategory) return false;
      if (activePill === "all") return true;
      if (activePill === "free") return c.access === "free";
      if (activePill === "premium") return c.access === "premium";
      if (activePill === "completed") return c.progress >= 100;
      return c.category === activePill;
    });
  }, [activeCategory, activePill]);

  return (
    <section className="mb-4">
      <h2 className="text-white mb-3" style={{ fontSize: "20px", fontWeight: "600" }}>Course Categories</h2>

      <div className="d-flex gap-3 overflow-auto pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            active={activeCategory === cat.id}
            onClick={() => {
              setActiveCategory(activeCategory === cat.id ? null : cat.id);
              setActivePill(activeCategory === cat.id ? "all" : cat.id);
            }}
          />
        ))}
      </div>

      <div className="mt-4 d-flex flex-wrap gap-2">
        {filterPills.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setActivePill(p.id);
              setActiveCategory(["all", "free", "premium", "completed"].includes(p.id) ? null : p.id);
            }}
            className={`btn btn-sm ${
              activePill === p.id 
                ? "text-white fw-semibold" 
                : "text-white-50"
            }`}
            style={{ 
              background: activePill === p.id ? "#22C55E" : "rgba(255,255,255,0.05)",
              borderRadius: "20px",
              padding: "8px 16px",
              fontSize: "13px",
              border: activePill === p.id ? "none" : "1px solid rgba(255,255,255,0.1)"
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="row g-4 mt-3">
        {filtered.map((course) => (
          <div key={course.id} className="col-12 col-md-6 col-xl-4">
            <CourseCard course={course} onOpen={onOpenCourse} />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-12">
            <div className="card border-0 text-center py-5" style={{ background: "rgba(255,255,255,0.02)", borderRadius: "20px" }}>
              <div className="card-body text-white-50">No courses match this filter yet.</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
