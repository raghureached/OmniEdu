import { useEffect, useRef } from "react";
import api from "../services/api";

export default function useLearningTracker() {
  const startTimeRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const idleTimerRef = useRef(null);

  const IDLE_THRESHOLD = 60000; // 1 minute idle

  useEffect(() => {
    startTimeRef.current = Date.now();
    lastActivityRef.current = Date.now();

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    // Idle detection loop
    idleTimerRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastActivityRef.current > IDLE_THRESHOLD) {
        saveLearningSession();   // Save active time so far
        startTimeRef.current = Date.now(); // Restart timer
      }
    }, 5000);

    // Save on exit or refresh
    window.addEventListener("beforeunload", saveLearningSession);

    return () => {
      saveLearningSession();
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("beforeunload", saveLearningSession);
      clearInterval(idleTimerRef.current);
    };
  }, []);

  const saveLearningSession = () => {
    if (!startTimeRef.current) return;

    const diffMs = Date.now() - startTimeRef.current;
    const hours = diffMs / (1000 * 60 * 60);

    if (hours < 0.01) return;

    const date = new Date().toISOString().split("T")[0];

    // navigator.sendBeacon(
    //   "http://localhost:5003/api/user/updateWeeklyProgress",
    //   JSON.stringify({ date, hours })
    // );
    api.post('api/user/updateWeeklyProgress', { date, hours });
    startTimeRef.current = Date.now();
  };

  return null;
}
