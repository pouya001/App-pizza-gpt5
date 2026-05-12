"use client";

import { useState, useEffect } from "react";

// Hours schedule (hardcoded for client-side use, matches hours.json)
const SCHEDULE = [
  { open: "09:00", close: "18:30", closed: false }, // Monday (index 0)
  { open: "09:00", close: "18:30", closed: false }, // Tuesday
  { open: "09:00", close: "18:30", closed: false }, // Wednesday
  { open: "09:00", close: "18:30", closed: false }, // Thursday
  { open: "09:00", close: "18:30", closed: false }, // Friday
  { open: "10:00", close: "17:00", closed: false }, // Saturday
  { open: null,    close: null,    closed: true  }, // Sunday
];

const DAY_NAMES_FR = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

function getBrusselsTime(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Brussels" })
  );
}

function getDayIndex(date: Date): number {
  const jsDay = date.getDay(); // 0=Sun
  return jsDay === 0 ? 6 : jsDay - 1; // Mon=0..Sun=6
}

interface StatusResult {
  isOpen: boolean;
  nextDayFr: string | null;
  nextTime: string | null;
}

function computeStatus(): StatusResult {
  const now = getBrusselsTime();
  const dayIndex = getDayIndex(now);
  const today = SCHEDULE[dayIndex];

  if (today.closed || !today.open || !today.close) {
    return findNext(dayIndex);
  }

  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;

  if (currentMins >= openMins && currentMins < closeMins) {
    return { isOpen: true, nextDayFr: null, nextTime: null };
  }

  // Before opening today
  if (currentMins < openMins) {
    return {
      isOpen: false,
      nextDayFr: DAY_NAMES_FR[dayIndex],
      nextTime: today.open,
    };
  }

  // After closing — find next open day
  return findNext(dayIndex);
}

function findNext(currentIndex: number): StatusResult {
  for (let i = 1; i <= 7; i++) {
    const nextIndex = (currentIndex + i) % 7;
    const day = SCHEDULE[nextIndex];
    if (!day.closed && day.open) {
      return {
        isOpen: false,
        nextDayFr: DAY_NAMES_FR[nextIndex],
        nextTime: day.open,
      };
    }
  }
  return { isOpen: false, nextDayFr: null, nextTime: null };
}

interface OpenStatusProps {
  className?: string;
}

export default function OpenStatus({ className = "" }: OpenStatusProps) {
  const [status, setStatus] = useState<StatusResult>(() => computeStatus());

  useEffect(() => {
    // Recalculate immediately on mount (in case SSR/hydration delta)
    setStatus(computeStatus());

    const interval = setInterval(() => {
      setStatus(computeStatus());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  if (status.isOpen) {
    return (
      <span
        className={
          "inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full bg-[#2D7A4F]/10 text-[#2D7A4F] ring-1 ring-[#2D7A4F]/30 " +
          className
        }
        role="status"
        aria-live="polite"
      >
        🟢 Ouvert maintenant
      </span>
    );
  }

  const closedLabel =
    status.nextDayFr && status.nextTime
      ? `🔴 Fermé · Ouvre ${status.nextDayFr} à ${status.nextTime}`
      : "🔴 Fermé";

  return (
    <span
      className={
        "inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full bg-[#C44536]/10 text-[#C44536] ring-1 ring-[#C44536]/30 " +
        className
      }
      role="status"
      aria-live="polite"
    >
      {closedLabel}
    </span>
  );
}
