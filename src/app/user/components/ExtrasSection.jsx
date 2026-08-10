"use client";

import { Download, FileText, MessageSquare, Trophy, Flame, Coins, Award, Send } from "lucide-react";
import { downloadableResources, communityThreads, leaderboard, learner } from "./lmsData";

const fileTone = { pdf: "#3B82F6", xlsx: "#22C55E", zip: "#FFD54A" };

export default function ExtrasSection() {
  return (
    <section className="row g-4">
      <div className="col-12 col-lg-4">
        <div className="card border-0 h-100" style={{ background: "rgba(255,255,255,0.03)", borderRadius: "20px" }}>
          <div className="card-body p-4">
            <h3 className="text-white d-flex align-items-center gap-2 mb-3" style={{ fontSize: "16px", fontWeight: "600" }}>
              <Download size={18} className="text-warning" /> Downloadable Resources
            </h3>
            <div className="d-flex flex-column gap-2">
              {downloadableResources.map((r) => (
                <div key={r.label} className="d-flex align-items-center justify-content-between rounded-3 p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex align-items-center justify-content-center rounded-2" style={{ width: 40, height: 40, background: `${fileTone[r.type] || "#3B82F6"}20`, color: fileTone[r.type] || "#3B82F6" }}>
                      <FileText size={16} />
                    </span>
                    <div>
                      <p className="mb-1 fw-semibold text-white" style={{ fontSize: "13px" }}>{r.label}</p>
                      <p className="mb-0 text-white-50 text-uppercase" style={{ fontSize: "11px" }}>
                        {r.type} · {r.size}
                      </p>
                    </div>
                  </div>
                  <Download size={16} className="text-white-50" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-4">
        <div className="card border-0 h-100" style={{ background: "rgba(255,255,255,0.03)", borderRadius: "20px" }}>
          <div className="card-body p-4">
            <h3 className="text-white d-flex align-items-center gap-2 mb-3" style={{ fontSize: "16px", fontWeight: "600" }}>
              <MessageSquare size={18} className="text-warning" /> Community & Mentor Q&A
            </h3>
            <div className="d-flex flex-column gap-2">
              {communityThreads.map((t) => (
                <div key={t.id} className="rounded-3 p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-white-75 mb-2" style={{ fontSize: "13px" }}>{t.question}</p>
                  <div className="text-white-50 d-flex flex-wrap align-items-center gap-2" style={{ fontSize: "11px" }}>
                    <span>{t.user}</span>
                    <span>·</span>
                    <span>{t.replies} replies</span>
                    {t.mentorAnswered && <span className="text-success">· Mentor answered</span>}
                  </div>
                </div>
              ))}
            </div>
            <button 
              type="button" 
              className="btn fw-semibold w-100 mt-3"
              style={{ 
                background: "rgba(255,213,74,0.15)",
                color: "#FFD54A",
                borderRadius: "12px",
                padding: "10px",
                fontSize: "13px",
                border: "1px solid rgba(255,213,74,0.3)"
              }}
            >
              <Send size={14} className="me-2" /> Ask the Mentor Desk
            </button>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-4">
        <div className="card border-0 h-100" style={{ background: "rgba(255,255,255,0.03)", borderRadius: "20px" }}>
          <div className="card-body p-4">
            <h3 className="text-white d-flex align-items-center gap-2 mb-3" style={{ fontSize: "16px", fontWeight: "600" }}>
              <Trophy size={18} className="text-warning" /> Leaderboard
            </h3>
            <div className="d-flex flex-column gap-2">
              {leaderboard.map((l) => (
                <div 
                  key={l.rank} 
                  className={`d-flex align-items-center justify-content-between rounded-3 px-3 py-2 ${
                    l.isYou 
                      ? "" 
                      : ""
                  }`}
                  style={{ 
                    background: l.isYou ? "rgba(255,213,74,0.15)" : "rgba(255,255,255,0.02)",
                    border: l.isYou ? "1px solid rgba(255,213,74,0.4)" : "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <span className="d-flex align-items-center gap-2">
                    <span className="text-white-50" style={{ fontSize: "12px" }}>#{l.rank}</span>
                    <span className={`${l.isYou ? "fw-semibold text-warning" : "text-white-75"}`} style={{ fontSize: "13px" }}>{l.name}</span>
                  </span>
                  <span className="text-white-50" style={{ fontSize: "12px" }}>{l.xp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 row g-2" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="col-4 text-center">
                <Flame size={16} className="mx-auto text-warning" />
                <p className="mt-2 text-white-75 mb-0" style={{ fontSize: "12px" }}>{learner.streakDays}d</p>
              </div>
              <div className="col-4 text-center">
                <Coins size={16} className="mx-auto text-warning" />
                <p className="mt-2 text-white-75 mb-0" style={{ fontSize: "12px" }}>{learner.coins}</p>
              </div>
              <div className="col-4 text-center">
                <Award size={16} className="mx-auto text-warning" />
                <p className="mt-2 text-white-75 mb-0" style={{ fontSize: "12px" }}>Lv {learner.level}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
