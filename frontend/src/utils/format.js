/** Today's date as YYYY-MM-DD in the visitor's own timezone. */
export const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const addDaysLocal = (dateString, days) => {
  const [y, m, d] = dateString.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

/** "2026-10-12" -> "Mon, 12 Oct 2026" */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const [y, m, d] = dateString.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** "14:30" -> "02:30 PM" */
export const formatTime = (hhmm) => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export const formatPrice = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;

/** Short, readable booking reference from a database id. */
export const bookingRef = (id) => (id ? `BK-${String(id).slice(-6).toUpperCase()}` : "");

/** Has this appointment's start time passed? */
export const hasStarted = (appointment) => {
  const [y, m, d] = appointment.date.split("-").map(Number);
  const [h, min] = appointment.time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min) <= new Date();
};
