"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, CheckCircle2 } from "lucide-react";


export default function VideoPlayer({ videoId, provider = "youtube", onComplete, onProgress }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const completedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    completedRef.current = false;
    setReady(false);
    setIsPlaying(false);
    setCurrent(0);
    setDuration(0);

    if (provider !== "youtube") {
     
      return;
    }

    let cancelled = false;

    function createPlayer() {
      if (cancelled || !containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: (e) => {
            setReady(true);
            setDuration(e.target.getDuration());
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (e.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
            if (e.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              handleComplete();
            }
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      const prevCb = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevCb?.();
        createPlayer();
      };
    }

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, provider]);

  // Poll progress for YouTube (no native timeupdate event)
  useEffect(() => {
    if (provider !== "youtube" || !ready) return;
    const interval = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      const t = p.getCurrentTime();
      const d = p.getDuration();
      setCurrent(t);
      if (d) setDuration(d);
      onProgress?.(t, d);
      if (d && t / d > 0.97) handleComplete();
    }, 1000);
    return () => clearInterval(interval);
  }, [ready, provider, onProgress, handleComplete]);

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (isPlaying) p.pauseVideo?.();
    else p.playVideo?.();
  };

  const remaining = Math.max(0, Math.round(duration - current));
  const pct = duration ? Math.min(100, (current / duration) * 100) : 0;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="w-full">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
        <div ref={containerRef} className="absolute inset-0 h-full w-full" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0F1F]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FFD54A]/30 border-t-[#FFD54A]" />
          </div>
        )}
      </div>

      {/* Custom progress strip */}
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
        <button
          onClick={togglePlay}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFD54A] text-[#0A0F1F] transition hover:scale-105"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
        </button>

        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#FFD54A] transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>

        <span className="font-mono text-xs tabular-nums text-white/50">
          {fmt(current)} / {fmt(duration)}
        </span>

        {completedRef.current && (
          <span className="flex items-center gap-1 rounded-full bg-[#22C55E]/15 px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-[#22C55E]">
            <CheckCircle2 size={12} /> Watched
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between px-1 font-mono text-[11px] uppercase tracking-wide text-white/40">
        <span className="flex items-center gap-1.5">
          <Volume2 size={12} /> Playback quality: Auto
        </span>
        <span>{remaining > 0 ? `${fmt(remaining)} remaining` : "Complete"}</span>
      </div>
    </div>
  );
}
