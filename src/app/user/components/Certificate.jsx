"use client";

import { motion } from "framer-motion";
import { Award, Download, Share2, ShieldCheck } from "lucide-react";
import { learner } from "./lmsData";


function QRPattern() {
  // Deterministic decorative QR-like pattern (not a functional code)
  const cells = Array.from({ length: 49 }, (_, i) => (i * 37) % 5 < 2);
  return (
    <div className="grid grid-cols-7 gap-[2px] rounded-md bg-white p-1.5">
      {cells.map((on, i) => (
        <span key={i} className={`h-1.5 w-1.5 ${on ? "bg-[#0A0F1F]" : "bg-transparent"}`} />
      ))}
    </div>
  );
}

export default function Certificate({ course, onDownload, onShare }) {
  const certNumber = `XOXFX-${course.id.slice(0, 4).toUpperCase()}-${new Date().getFullYear()}-${String(
    Math.abs(hashCode(course.id)) % 9000 + 1000
  )}`;
  const issueDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border-2 border-[#FFD54A]/40 bg-gradient-to-br from-[#141a12] via-[#0A0F1F] to-[#0A0F1F] p-8 sm:p-12"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: "repeating-linear-gradient(45deg, #FFD54A 0, #FFD54A 1px, transparent 1px, transparent 14px)"
        }} />
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#FFD54A]/10 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#FFD54A]/40 bg-[#FFD54A]/10 text-[#FFD54A]">
            <Award size={26} />
          </span>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-[#FFD54A]/70">Certificate of Completion</p>
          <h2 className="mt-3 font-[var(--font-display)] text-2xl font-semibold text-white sm:text-3xl">{learner.name}</h2>
          <p className="mt-2 max-w-md text-sm text-white/50">has successfully completed the full curriculum of</p>
          <h3 className="mt-2 text-xl font-bold text-[#FFD54A] sm:text-2xl">{course.title}</h3>

          <div className="mt-8 grid w-full max-w-lg grid-cols-2 gap-6 border-t border-white/10 pt-6 text-left sm:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/35">Instructor</p>
              <p className="mt-1 text-sm text-white/80">{course.instructor}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/35">Issue Date</p>
              <p className="mt-1 text-sm text-white/80">{issueDate}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/35">Certificate No.</p>
              <p className="mt-1 font-mono text-xs text-white/80">{certNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <QRPattern />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-white/35">Verify</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#22C55E]">
                  <ShieldCheck size={12} /> xoxfx.com/verify
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onDownload}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFD54A] py-3.5 text-sm font-semibold text-[#0A0F1F] transition hover:brightness-105 active:scale-[0.98]"
        >
          <Download size={16} /> Download Certificate
        </button>
        <button
          onClick={onShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 py-3.5 text-sm font-semibold text-white transition hover:bg-white/5 active:scale-[0.98]"
        >
          <Share2 size={16} /> Share on LinkedIn
        </button>
      </div>
    </div>
  );
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}
