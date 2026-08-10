"use client";
import { useState, useEffect } from "react";

export const getPageName = (pathname) => {
  if (!pathname) return "";

  const trimmed = pathname.replace(/\/$/, "");

  const lastSegment = trimmed.split("/").pop();
  const pascalCase = lastSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  return pascalCase;
};

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQueryList = window.matchMedia(query);

    setMatches(mediaQueryList.matches);
    const listener = (event) => {
      if (event.matches !== matches) {
        setMatches(event.matches);
      }
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", listener);
    } else {
      mediaQueryList.addListener(listener);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", listener);
      } else {
        mediaQueryList.removeListener(listener);
      }
    };
  }, [query, matches]);

  return matches;
};

// Disable Right click
export const DisableRightClick = () => {
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);
};

export function initActivityTracker() {
  const updateActivity = () => {
    document.cookie = `lastActivity=${Date.now()}; path=/`;
  };

  // User activity events
  ["click", "keydown", "scroll"].forEach(event => {
    window.addEventListener(event, updateActivity);
  });

  // Initial set
  updateActivity();
}

