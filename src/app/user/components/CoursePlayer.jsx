"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  ShieldAlert,
  FileText,
  Bookmark,
  List,
  User,
  Download,
  ChevronRight,
  Sparkles,
  Award,
  MessageSquare,
} from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import Quiz from "./Quiz";
import Certificate from "./Certificate";
import { communityThreads } from "./lmsData";

const TABS = [
  { id: "notes", label: "Notes", icon: FileText },
  { id: "resources", label: "Resources", icon: Download },
  { id: "chapters", label: "Chapters", icon: List },
  { id: "instructor", label: "Instructor", icon: User },
  { id: "transcript", label: "Transcript", icon: FileText },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
];

export default function CoursePlayer({ course, onBack }) {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [stage, setStage] = useState("overview");
  const [completed, setCompleted] = useState(new Set());
  const [videoWatched, setVideoWatched] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [activeTab, setActiveTab] = useState("chapters");
  const [notes, setNotes] = useState("");
  const [bookmarks, setBookmarks] = useState([]);

  const lessons = course.lessons;
  const lesson = lessons[lessonIndex];
  const totalLessons = lessons.length;
  const courseProgress = Math.round((completed.size / totalLessons) * 100);

  function goLesson(i) {
    if (i > lessonIndex && !completed.has(lessons[lessonIndex].id)) return;
    setLessonIndex(i);
    setStage("overview");
    setVideoWatched(false);
    setActiveTab("chapters");
  }

  function handleQuizPass() {
    const next = new Set(completed);
    next.add(lesson.id);
    setCompleted(next);
    setXpEarned((x) => x + 50);
    setStage("lessonComplete");
  }

  function nextLesson() {
    if (lessonIndex + 1 < totalLessons) {
      setLessonIndex((i) => i + 1);
      setStage("overview");
      setVideoWatched(false);
      setActiveTab("chapters");
    } else {
      setStage("courseComplete");
    }
  }

  if (stage === "courseComplete") {
    return (
      <div className="container py-4">
        <button type="button" onClick={onBack} className="btn btn-link text-white-50 p-0 mb-4 d-inline-flex align-items-center gap-2">
          <ArrowLeft size={15} /> Back to catalog
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 160, damping: 10, delay: 0.1 }}
            className="mx-auto d-flex align-items-center justify-content-center rounded-circle text-dark" style={{ width: 80, height: 80, background: "linear-gradient(135deg, #FFD54A 0%, #f0b429 100%)" }}
          >
            <Award size={36} />
          </motion.div>
          <h1 className="mt-4 h3 text-white">Congratulations!</h1>
          <p className="mt-2 text-white-50">
            You&apos;ve completed <span className="text-warning">{course.title}</span>
          </p>
          <div className="mx-auto mt-4 d-flex justify-content-center gap-4 small text-white-50">
            <span className="d-flex align-items-center gap-2 text-warning"><Sparkles size={14} /> +{xpEarned + 50} XP</span>
            <span className="d-flex align-items-center gap-2 text-success"><CheckCircle2 size={14} /> Badge Unlocked</span>
          </div>
        </motion.div>

        <div className="mt-5">
          <Certificate course={course} onDownload={() => {}} onShare={() => {}} />
        </div>

        <button type="button" onClick={onBack} className="btn btn-outline-light mt-4 d-inline-flex align-items-center gap-2">
          Continue to Next Course <ChevronRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button type="button" onClick={onBack} className="btn btn-link text-white-50 p-0 mb-4 d-inline-flex align-items-center gap-2">
        <ArrowLeft size={15} /> Back to catalog
      </button>

      <div className="mb-4">
        <p className="small text-uppercase fw-semibold text-warning mb-2">{course.title}</p>
        <div className="progress lms-progress" style={{ maxWidth: 440 }}>
          <div className="progress-bar" style={{ width: `${courseProgress}%` }} />
        </div>
        <p className="small text-white-50 mt-2 mb-0">{courseProgress}% of course complete</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <AnimatePresence mode="wait">
            {stage === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <LessonOverview lesson={lesson} lessonNumber={lessonIndex + 1} onStart={() => setStage("video")} />
              </motion.div>
            )}

            {stage === "video" && (
              <motion.div key="video" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="h4 text-white">{lesson.title}</h2>
                <p className="small text-white-50 mt-1">
                  Lesson {lessonIndex + 1} of {totalLessons} · {lesson.estimatedMinutes} min
                </p>

                <div className="mt-4">
                  <VideoPlayer videoId={lesson.videoId} provider={lesson.videoProvider} onComplete={() => setVideoWatched(true)} />
                </div>

                <div className="mt-4 d-flex flex-wrap gap-2 border-bottom border-white border-opacity-10 pb-2">
                  {TABS.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id)}
                        className={`btn btn-sm ${activeTab === t.id ? "lms-tab-btn active" : "btn-outline-secondary"}`}
                      >
                        <Icon size={13} className="me-2" /> {t.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 min-h-140 rounded-4 lms-card p-4">
                  <TabContent tab={activeTab} lesson={lesson} course={course} notes={notes} setNotes={setNotes} bookmarks={bookmarks} setBookmarks={setBookmarks} />
                </div>

                <div className="mt-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 rounded-4 lms-card p-4">
                  <div className="small text-white-50">
                    {videoWatched ? (
                      <span className="d-inline-flex align-items-center gap-2 text-success"><CheckCircle2 size={14} /> Playback completed</span>
                    ) : (
                      <span className="d-inline-flex align-items-center gap-2"><Clock size={14} /> Watch the full lesson to unlock the quiz</span>
                    )}
                  </div>
                  <button type="button" disabled={!videoWatched} onClick={() => setStage("quiz")} className={`btn ${videoWatched ? "lms-btn-primary" : "btn-secondary disabled"}`}>
                    {videoWatched ? "Start Knowledge Check" : "Locked"} <ChevronRight size={15} className="ms-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {stage === "quiz" && (
              <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="h4 text-white">Knowledge Check</h2>
                <p className="small text-white-50 mt-1">Score {lesson.quiz.passingScore}% or higher to unlock the next lesson.</p>
                <div className="mt-4">
                  {lesson.quiz.questions.length > 0 ? (
                    <Quiz quiz={lesson.quiz} onPass={handleQuizPass} />
                  ) : (
                    <div className="card border-0 lms-card p-5 text-center">
                      <div className="small text-white-50">This lesson has no quiz configured yet.</div>
                      <button type="button" onClick={() => handleQuizPass(100)} className="btn lms-btn-primary mt-3">
                        Mark Lesson Complete
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {stage === "lessonComplete" && (
              <motion.div key="complete" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="card border-0 lms-card p-5 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }} className="mx-auto d-flex align-items-center justify-content-center rounded-circle text-success" style={{ width: 64, height: 64, background: "rgba(34,197,94,0.14)" }}>
                    <CheckCircle2 size={30} />
                  </motion.div>
                  <h3 className="mt-4 h5 text-white">Lesson Completed</h3>
                  <p className="mt-2 small text-white-50">{lesson.title} is now marked complete.</p>
                  <p className="mt-3 small text-warning">+50 XP Earned</p>
                  <button type="button" onClick={nextLesson} className="btn lms-btn-primary mt-4 d-inline-flex align-items-center gap-2">
                    {lessonIndex + 1 < totalLessons ? `Continue to Lesson ${lessonIndex + 2}` : "Finish Course"}
                    <ChevronRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="col-12 col-xl-4">
          <div className="card border-0 lms-card p-4 sticky-top" style={{ top: "1rem" }}>
            <h4 className="h6 text-white">Course Outline</h4>
            <p className="small text-white-50 mt-1 mb-3">
              {completed.size}/{totalLessons} lessons · {course.duration}
            </p>
            <div className="d-flex flex-column gap-2">
              {lessons.map((l, i) => {
                const isDone = completed.has(l.id);
                const isCurrent = i === lessonIndex;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => goLesson(i)}
                    disabled={i > lessonIndex && !completed.has(lessons[lessonIndex].id)}
                    className={`btn btn-sm text-start d-flex align-items-center gap-2 ${isCurrent ? "lms-outline-active" : isDone ? "btn-outline-light" : "btn-outline-secondary"}`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={16} className="text-success" />
                    ) : i > lessonIndex && !completed.has(lessons[lessonIndex]?.id) ? (
                      <Lock size={14} />
                    ) : (
                      <PlayCircle size={16} />
                    )}
                    <span className="flex-grow-1 text-truncate">Lesson {i + 1}: {l.title}</span>
                    <span className="small text-white-50">{l.estimatedMinutes}m</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card border-0 lms-card p-4 mt-4">
            <h4 className="h6 text-white d-flex align-items-center gap-2">
              <MessageSquare size={14} className="text-warning" /> Ask a Mentor
            </h4>
            <div className="mt-3 d-flex flex-column gap-2">
              {communityThreads.slice(0, 2).map((t) => (
                <div key={t.id} className="rounded-3 p-3 lms-list-card">
                  <p className="small text-white-75 mb-2">{t.question}</p>
                  <p className="small text-white-50 mb-0">
                    {t.user} · {t.replies} replies {t.mentorAnswered && "· Mentor answered"}
                  </p>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-outline-light w-100 mt-3">
              Ask a question
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LessonOverview({ lesson, lessonNumber, onStart }) {
  return (
    <div className="card border-0 lms-card p-4 p-md-5">
      <span className="small text-uppercase fw-semibold text-warning">Lesson {lessonNumber}</span>
      <h2 className="mt-2 h3 text-white">{lesson.title}</h2>
      <p className="mt-2 text-white-50">{lesson.objective}</p>

      <div className="mt-4 d-flex flex-wrap gap-2">
        <InfoChip label="Difficulty" value={lesson.difficulty} />
        <InfoChip label="Duration" value={`${lesson.estimatedMinutes} min`} />
        <InfoChip label="Requires" value={lesson.requiredKnowledge} />
      </div>

      {lesson.learningOutcomes?.length > 0 && (
        <div className="mt-4">
          <h3 className="h6 text-white">In this lesson you will understand</h3>
          <div className="row g-2 mt-3">
            {(lesson.importantConcepts || lesson.learningOutcomes).map((c) => (
              <div key={c} className="col-12 col-sm-6">
                <div className="d-flex align-items-center gap-2 rounded-3 p-3 lms-list-card">
                  <CheckCircle2 size={14} className="text-success" /> <span className="small text-white-75">{c}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson.riskWarning && (
        <div className="alert mt-4 lms-alert">
          <ShieldAlert size={18} className="me-2" />
          <span>{lesson.riskWarning}</span>
        </div>
      )}

      <div className="mt-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <span className="small text-white-50 d-inline-flex align-items-center gap-2">
          <Clock size={13} /> Estimated time: {lesson.estimatedMinutes} minutes
        </span>
        <button type="button" onClick={onStart} className="btn lms-btn-primary d-inline-flex align-items-center gap-2">
          <PlayCircle size={16} /> Start Lesson
        </button>
      </div>
    </div>
  );
}

function InfoChip({ label, value }) {
  if (!value) return null;
  return (
    <div className="card border-0 lms-info-chip">
      <div className="card-body p-3">
        <p className="small text-uppercase text-white-50 mb-1">{label}</p>
        <p className="mb-0 small text-white">{value}</p>
      </div>
    </div>
  );
}

function TabContent({ tab, lesson, course, notes, setNotes, bookmarks, setBookmarks }) {
  if (tab === "notes") {
    return <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Jot down key takeaways from this lesson…" className="form-control lms-textarea" />;
  }
  if (tab === "resources") {
    return lesson.resources?.length ? (
      <div className="d-flex flex-column gap-2">
        {lesson.resources.map((r) => (
          <div key={r.label} className="d-flex align-items-center justify-content-between rounded-3 p-3 lms-list-card">
            <span className="d-inline-flex align-items-center gap-2 small text-white-75"><Download size={13} className="text-warning" /> {r.label}</span>
            <span className="small text-uppercase text-white-50">{r.type}</span>
          </div>
        ))}
      </div>
    ) : (
      <EmptyTab text="No downloadable resources for this lesson." />
    );
  }
  if (tab === "chapters") {
    return lesson.chapters?.length ? (
      <div className="d-flex flex-column gap-2">
        {lesson.chapters.map((c) => (
          <div key={c.time} className="d-flex align-items-center gap-3 rounded-3 p-3 lms-list-card">
            <span className="small fw-semibold text-warning">{c.time}</span> <span className="small text-white-75">{c.label}</span>
          </div>
        ))}
      </div>
    ) : (
      <EmptyTab text="No chapter markers for this lesson." />
    );
  }
  if (tab === "instructor") {
    return (
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center justify-content-center rounded-circle fw-semibold text-dark" style={{ width: 48, height: 48, background: "linear-gradient(135deg, #3B82F6 0%, #FFD54A 100%)" }}>
          {course.instructor.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <p className="mb-1 text-white fw-semibold">{course.instructor}</p>
          <p className="mb-0 small text-white-50">{course.instructorTitle}</p>
        </div>
      </div>
    );
  }
  if (tab === "transcript") {
    return lesson.transcriptExcerpt ? <p className="small text-white-75 mb-0">{lesson.transcriptExcerpt}</p> : <EmptyTab text="Transcript not available for this lesson yet." />;
  }
  if (tab === "bookmarks") {
    return (
      <div>
        <button type="button" onClick={() => setBookmarks([...bookmarks, `Marked at lesson "${lesson.title}"`])} className="btn btn-outline-light btn-sm mb-3">
          + Add bookmark at current point
        </button>
        {bookmarks.length ? (
          <div className="d-flex flex-column gap-2">
            {bookmarks.map((b, i) => (
              <div key={i} className="d-flex align-items-center gap-2 rounded-3 p-3 lms-list-card">
                <Bookmark size={13} className="text-warning" /> <span className="small text-white-75">{b}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyTab text="No bookmarks yet." />
        )}
      </div>
    );
  }
  return null;
}

function EmptyTab({ text }) {
  return <p className="small text-white-50 mb-0">{text}</p>;
}
