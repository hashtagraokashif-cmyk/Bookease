/**
 * Date and time helpers. Dates are "YYYY-MM-DD" strings and times are "HH:mm"
 * (24-hour), which avoids timezone surprises when storing and comparing them.
 * "Today" and "now" are worked out in APP_TIMEZONE (default Asia/Karachi), so
 * the result is the same whatever timezone the server machine is set to.
 */

export const BOOKING_WINDOW_DAYS = 60;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const timezone = () => process.env.APP_TIMEZONE || "Asia/Karachi";

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const toHHMM = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export const to12Hour = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
};

export const isValidDateString = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};

export const isValidTimeString = (value) =>
  typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const nowInTimezone = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
};

export const addDays = (dateString, days) => {
  const d = new Date(`${dateString}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const dayOfWeek = (dateString) => new Date(`${dateString}T00:00:00Z`).getUTCDay();

export const dayName = (dateString) => DAY_NAMES[dayOfWeek(dateString)];

/** The grid blocks an appointment covers, e.g. 09:00 for 45 min on a 30-min grid -> ["09:00", "09:30"]. */
export const occupiedCells = (startMinutes, duration, step) => {
  const cells = [];
  for (let cell = startMinutes; cell < startMinutes + duration; cell += step) {
    cells.push(toHHMM(cell));
  }
  return cells;
};

/** Returns a reason the date cannot be booked with this provider, or null if it can. */
export const dateProblem = (provider, date, now = nowInTimezone()) => {
  if (!isValidDateString(date)) return "Please choose a valid date.";
  if (date < now.date) return "That date has already passed.";
  if (date > addDays(now.date, BOOKING_WINDOW_DAYS)) {
    return `Appointments can be booked up to ${BOOKING_WINDOW_DAYS} days ahead.`;
  }
  if (!provider.workingDays.includes(dayOfWeek(date))) {
    return `${provider.name} is closed on ${dayName(date)}s. Please choose another date.`;
  }
  return null;
};

/**
 * Every start time on the provider's grid that fits the service, skipping the
 * break and (for today) times that have already passed. A slot is unavailable
 * when any block it would cover is already taken.
 */
export const buildSlots = ({ provider, duration, date, locked = new Set(), now = nowInTimezone() }) => {
  const step = provider.slotInterval || 30;
  const open = toMinutes(provider.workingHours.start);
  const close = toMinutes(provider.workingHours.end);
  const breakStart = provider.breakTime?.start ? toMinutes(provider.breakTime.start) : null;
  const breakEnd = provider.breakTime?.end ? toMinutes(provider.breakTime.end) : null;

  const slots = [];
  for (let start = open; start + duration <= close; start += step) {
    const overlapsBreak =
      breakStart !== null && start < breakEnd && start + duration > breakStart;
    if (overlapsBreak) continue;
    if (date === now.date && start <= now.minutes) continue;

    const time = toHHMM(start);
    const taken = occupiedCells(start, duration, step).some((cell) => locked.has(cell));
    slots.push({ time, label: to12Hour(time), available: !taken });
  }
  return slots;
};
