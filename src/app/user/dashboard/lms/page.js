"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StatsDashboard from "../../components/StatsDashboard";
import CourseCatalog from "../../components/CourseCatalog";
import ExtrasSection from "../../components/ExtrasSection";
import CoursePlayer from "../../components/CoursePlayer";
import { courses } from "../../components/lmsData";

export default function LMSPage() {
  const [activeCourse, setActiveCourse] = useState(null);

  return (
    <div
      className="lms-page min-vh-100 w-100 text-white"
      style={{
        backgroundColor: "#0A0F1F",
        fontFamily: "var(--font-body, ui-sans-serif)",
      }}
    >
      <div className="position-fixed top-0 start-0 w-100 h-100 overflow-hidden pointer-events-none">
        <div className="position-absolute rounded-circle" style={{ left: "-8rem", top: "-8rem", width: 24 + "rem", height: 24 + "rem", background: "rgba(59,130,246,0.07)", filter: "blur(120px)" }} />
        <div className="position-absolute rounded-circle" style={{ right: "-8rem", top: "30%", width: 24 + "rem", height: 24 + "rem", background: "rgba(255,213,74,0.06)", filter: "blur(120px)" }} />
        <div className="position-absolute rounded-circle" style={{ left: "30%", bottom: 0, width: 24 + "rem", height: 24 + "rem", background: "rgba(34,197,94,0.05)", filter: "blur(120px)" }} />
      </div>

      <div className="position-relative">
        <AnimatePresence mode="wait">
          {activeCourse ? (
            <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CoursePlayer course={activeCourse} onBack={() => setActiveCourse(null)} />
            </motion.div>
          ) : (
            <motion.div
              key="catalog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container-fluid py-4 py-lg-5"
              style={{ maxWidth: 1380 }}
            >
              <StatsDashboard onContinueLearning={() => setActiveCourse(courses.find((c) => c.progress > 0) || courses[0])} />
              <CourseCatalog onOpenCourse={setActiveCourse} />
              <ExtrasSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
