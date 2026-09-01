"use client";

import React from "react";
export default function RankProgress({
  completed = 0,
  NextRank = "",
  totQualifyRnk = 0,
  total = 7,
  activeRank = "No Rank",
  nextReward = "$100",
  progressPercent = 0,
  note = "Remaining days from a completed rank carry over and are added to the next rank's deadline.",
  description = "Complete each rank within its time window to earn bonus rewards.",
  title = "Rank Progress",
}) {
  const pct = Math.min(100, Math.max(0, Math.round((totQualifyRnk / total) * 100)));
  const getRankImage = (rank) => {

    console.log("rank", rank);
    switch (rank?.toUpperCase()) {
      case "MANAGER":
        return "/Rank/manager.mp4";

      case "BRONZE":
        return "/Rank/2.png";

      case "SILVER":
        return "/Rank/3.png";

      case "GOLD":
        return "/Rank/gold.mp4";

      case "RUBY":
        return "/Rank/ruby.mp4";

      case "PLATINUM":
        return "/Rank/platinum.mp4";

      case "DIAMOND":
        return "/Rank/7.png";

      default:
        return "/Rank/default.png"; // agar koi aur rank aaye
    }
  };

  return (
    <div className="row">
      <div className="col-md-8 mt-2">
        <div className="it bg-g gl gl-g">
          <div className="rpc-headerRow">
            <div className="rpc-titleBlock">
              <div className="rpc-titleRow">
                <TrophyIcon className="rpc-trophyIcon" />
                <h3 className="it-lbl ">{title}</h3>
              </div>
              <p className="it-lbl ">{description}</p>
            </div>

            <div className="rpc-statGroup">
              <div className="it bg-c gl gl-c">
                <span className="it-lbl" style={{ display: "block" }}>
                  Completed
                </span>
                <span className="it-val">
                  {totQualifyRnk}/{total}
                </span>
              </div>
              <div className="it bg-g gl gl-g">
                <span className="it-lbl" style={{ display: "block" }}>
                  Active Rank
                </span>
                <span className="it-val">{activeRank}</span>
              </div>
              <div className="it bg-c gl gl-c">
                <span className="it-lbl" style={{ display: "block" }}>
                  Next Rank
                </span>
                <span className="it-val">{NextRank}</span>
              </div>
            </div>
          </div>

          <div className="rpc-progressSection">
            <div className="rpc-progressLabelRow">
              <span className="it-lbl ">Overall Progress</span>
              <span className="it-lbl ">{pct}%</span>
            </div>
            <div
              className="rpc-progressTrack"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall rank progress"
            >
              <div className="rpc-progressFill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {note ? (
            <div className="rpc-infoNote">
              <span className="it-lbl">{note}</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="col-md-4 mt-2">
        <div className="it bg-g gl gl-g">
          {getRankImage(activeRank).endsWith('.mp4') ? (
            <video
              src={getRankImage(activeRank)}
              alt={activeRank}
              style={{ width: '100%', height: '260px', objectFit: 'cover' }}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={getRankImage(activeRank)} alt={activeRank}
              className="Rank-img"
            />
          )}
          {/* <div className="text-center-div">
            <div className="it-val">$317.45</div>
            <div className="it-lbl">Pair Volume Income</div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

function TrophyIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h2.5A1.5 1.5 0 0 1 21 6.5v0A3.5 3.5 0 0 1 17.5 10H17" />
      <path d="M7 5H4.5A1.5 1.5 0 0 0 3 6.5v0A3.5 3.5 0 0 0 6.5 10H7" />
    </svg>
  );
}

function InfoIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-5" />
      <path d="M12 8h.01" />
    </svg>
  );
}
