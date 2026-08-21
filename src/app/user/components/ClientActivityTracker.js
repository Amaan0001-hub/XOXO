"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientActivityTracker() {
  const router = useRouter();

  useEffect(() => {
    let logoutTimer;

    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop().split(";").shift();
      }
      return null;
    };

    const logoutUser = () => {
      const userType = getCookie("userType");

      // Clear user cookies
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "lastActivity=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "userType=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Clear admin cookies
      document.cookie =
        "admintoken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "Role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Admin
      if (String(userType) === "2") {
        router.replace("/ad-crm");
      }
      // Normal User
      else {
        router.replace("/user/login");
      }
    };

    const resetTimer = () => {
      clearTimeout(logoutTimer);

      logoutTimer = setTimeout(() => {
        logoutUser();
      }, 15 * 60 * 1000); // 1 minute
    };

    const handleUserActivity = () => {
      document.cookie = `lastActivity=${Date.now()}; path=/`;
      resetTimer();
    };

    const events = ["click", "keydown", "scroll", "mousemove"];

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Initial activity
    handleUserActivity();

    return () => {
      clearTimeout(logoutTimer);

      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [router]);

  return null;
}