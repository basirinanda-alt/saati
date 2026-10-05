"use client";

import { useEffect } from "react";
import { trackEvent, type QuizName } from "@/lib/analytics/gtag";

/**
 * Fires `quiz_complete` once per assessment session — the first time its
 * results render in this browser tab — so reloads and return visits to a
 * results link do not inflate the funnel.
 */
export function TrackQuizComplete({ sessionId, quiz }: { sessionId: string; quiz: QuizName }) {
  useEffect(() => {
    const key = `saati_quiz_complete_${sessionId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage blocked: still count it once for this render
    }
    trackEvent("quiz_complete", { quiz });
  }, [sessionId, quiz]);

  return null;
}
