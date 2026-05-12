import hoursData from "@/data/hours.json";

export type DaySchedule = {
  day: string;
  dayFr: string;
  dayNl: string;
  open: string | null;
  close: string | null;
  closed: boolean;
};

const TIMEZONE = "Europe/Brussels";

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(":").map(Number);
  return { hours: h, minutes: m };
}

function getBrusselsDate(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE }));
}

function getDayIndex(date: Date): number {
  // Sunday=0 → Monday=1..Saturday=6 in JS
  // Our array: index 0=Monday..5=Saturday, 6=Sunday
  const jsDay = date.getDay(); // 0=Sunday, 1=Monday...6=Saturday
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function getOpenStatus(): {
  isOpen: boolean;
  todaySchedule: DaySchedule;
  nextOpenDay: DaySchedule | null;
  nextOpenTime: string | null;
} {
  const now = getBrusselsDate();
  const dayIndex = getDayIndex(now);
  const schedule = hoursData.schedule as DaySchedule[];
  const todaySchedule = schedule[dayIndex];

  if (todaySchedule.closed || !todaySchedule.open || !todaySchedule.close) {
    const nextOpenDay = getNextOpenDay(schedule, dayIndex);
    return { isOpen: false, todaySchedule, nextOpenDay, nextOpenTime: nextOpenDay?.open ?? null };
  }

  const { hours: openH, minutes: openM } = parseTime(todaySchedule.open);
  const { hours: closeH, minutes: closeM } = parseTime(todaySchedule.close);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  if (!isOpen && currentMinutes < openMinutes) {
    return { isOpen: false, todaySchedule, nextOpenDay: todaySchedule, nextOpenTime: todaySchedule.open };
  }

  if (!isOpen) {
    const nextOpenDay = getNextOpenDay(schedule, dayIndex);
    return { isOpen: false, todaySchedule, nextOpenDay, nextOpenTime: nextOpenDay?.open ?? null };
  }

  return { isOpen: true, todaySchedule, nextOpenDay: null, nextOpenTime: null };
}

function getNextOpenDay(schedule: DaySchedule[], currentIndex: number): DaySchedule | null {
  for (let i = 1; i <= 7; i++) {
    const nextIndex = (currentIndex + i) % 7;
    const day = schedule[nextIndex];
    if (!day.closed && day.open) return day;
  }
  return null;
}

export function getSchedule(): DaySchedule[] {
  return hoursData.schedule as DaySchedule[];
}
