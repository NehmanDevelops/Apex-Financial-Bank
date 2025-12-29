"use client";

import { signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

export function InactivityLogout({ timeoutMs = 10 * 60 * 1000 }: { timeoutMs?: number }) {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    function clear() {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function schedule() {
      clear();
      timerRef.current = window.setTimeout(() => {
        signOut({ callbackUrl: "/" });
      }, timeoutMs);
    }

    schedule();

    const events: Array<keyof WindowEventMap> = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    const opts: AddEventListenerOptions = { passive: true };
    for (const evt of events) window.addEventListener(evt, schedule, opts);

    return () => {
      clear();
      for (const evt of events) window.removeEventListener(evt, schedule);
    };
  }, [timeoutMs]);

  return null;
}
