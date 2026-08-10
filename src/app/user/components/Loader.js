"use client";
import React from "react";
import { motion } from "framer-motion";

export default function Loader() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="loader-overlay"
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              repeat: Infinity,
              ease: "linear",
              duration: 1,
            },
            scale: {
              repeat: Infinity,
              ease: "easeInOut",
              duration: 1.5,
            },
          }}
          className="loader-container"
        >
          <div className="spinner"></div>
          <div className="loader-dot"></div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .loader-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(4px);
        }

        .loader-container {
          position: relative;
          width: 5rem;
          height: 5rem;
        }

        .spinner {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 4px solid transparent;
          background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 0%,
            #4f46e5 30%,
            #ec4899 70%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          padding: 4px;
        }

        .loader-dot {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loader-dot::before {
          content: "";
          display: block;
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 9999px;
          background: linear-gradient(to right, #4f46e5, #ec4899);
        }
      `}</style>
    </>
  );
}