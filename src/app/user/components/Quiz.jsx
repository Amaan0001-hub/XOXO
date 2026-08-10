"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, RotateCcw, ArrowRight, Sparkles } from "lucide-react";

const QUESTION_SECONDS = 30;

export default function Quiz({ quiz, onPass, xpReward = 50 }) {
  const questions = quiz.questions;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [finished, setFinished] = useState(false);

  const current = questions[index];

  useEffect(() => {
    if (finished || selected !== null) return;
    if (timeLeft <= 0) {
      commitAnswer(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, selected, finished]);

  function commitAnswer(optionIndex) {
    setSelected(optionIndex);
    const isCorrect = optionIndex === current.correctIndex;
    const next = [...answers, { questionId: current.id, optionIndex, isCorrect }];
    setAnswers(next);

    setTimeout(() => {
      if (index + 1 < questions.length) {
        setIndex((i) => i + 1);
        setSelected(null);
        setTimeLeft(QUESTION_SECONDS);
      } else {
        setFinished(true);
      }
    }, 900);
  }

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const scorePct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  const passed = scorePct >= quiz.passingScore;

  function retry() {
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setTimeLeft(QUESTION_SECONDS);
    setFinished(false);
  }

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-8 text-center"
      >
        {passed ? (
          <>
            <motion.div
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#22C55E]/15 text-[#22C55E]"
            >
              <CheckCircle2 size={30} />
            </motion.div>
            <h3 className="mt-4 text-xl font-semibold text-white">Congratulations!</h3>
            <p className="mt-1 text-sm text-white/55">You passed the knowledge check.</p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-400">
              <XCircle size={30} />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">Not quite there yet</h3>
            <p className="mt-1 text-sm text-white/55">
              You need {quiz.passingScore}% to continue. Review the lesson and try again.
            </p>
          </>
        )}

        <div className="mx-auto mt-6 grid max-w-xs grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] py-3">
            <div className="font-mono text-lg font-bold text-white">{scorePct}%</div>
            <div className="text-[10px] uppercase tracking-wide text-white/40">Score</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] py-3">
            <div className="font-mono text-lg font-bold text-white">
              {correctCount}/{questions.length}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-white/40">Correct</div>
          </div>
          <div className="rounded-xl border border-[#FFD54A]/20 bg-[#FFD54A]/[0.06] py-3">
            <div className="flex items-center justify-center gap-1 font-mono text-lg font-bold text-[#FFD54A]">
              <Sparkles size={14} /> {passed ? xpReward : 0}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-[#FFD54A]/60">XP Earned</div>
          </div>
        </div>

        {passed ? (
          <button
            onClick={() => onPass(scorePct)}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#FFD54A] px-6 py-3 text-sm font-semibold text-[#0A0F1F] transition hover:brightness-105 active:scale-[0.98]"
          >
            Continue <ArrowRight size={15} />
          </button>
        ) : (
          <button
            onClick={retry}
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5 active:scale-[0.98]"
          >
            <RotateCcw size={15} /> Retry Quiz
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wide text-white/40">
          Question {index + 1} / {questions.length}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-xs text-white/50">
          <Clock size={13} className={timeLeft <= 10 ? "text-red-400" : ""} />
          <span className={timeLeft <= 10 ? "text-red-400" : ""}>{timeLeft}s</span>
        </span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#FFD54A] transition-[width] duration-1000 ease-linear"
          style={{ width: `${(timeLeft / QUESTION_SECONDS) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="mt-6 text-lg font-semibold text-white sm:text-xl">{current.question}</h3>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {current.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrectOpt = i === current.correctIndex;
              const showState = selected !== null;
              return (
                <button
                  key={i}
                  disabled={selected !== null}
                  onClick={() => commitAnswer(i)}
                  className={`group relative rounded-xl border p-4 text-left text-sm transition ${
                    showState && isCorrectOpt
                      ? "border-[#22C55E]/50 bg-[#22C55E]/10 text-white"
                      : showState && isSelected && !isCorrectOpt
                      ? "border-red-500/50 bg-red-500/10 text-white"
                      : "border-white/[0.08] bg-white/[0.02] text-white/80 hover:border-[#FFD54A]/30 hover:bg-white/[0.05]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 font-mono text-xs text-white/50">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {showState && isCorrectOpt && <CheckCircle2 size={16} className="ml-auto text-[#22C55E]" />}
                    {showState && isSelected && !isCorrectOpt && <XCircle size={16} className="ml-auto text-red-400" />}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
