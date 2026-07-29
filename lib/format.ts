// Ported from src/Services/timeFormater.js. Guards null runtime.
export function toHoursAndMinutes(totalMinutes: number | null | undefined): string {
  if (!totalMinutes) return "—";
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}`;
}

function padTo2Digits(num: number): string {
  return num.toString().padStart(2, "0");
}

/**
 * "1956-03-07" -> "March 7, 1956". Null for a missing or unparseable date, so
 * callers can drop the line entirely.
 *
 * The explicit UTC timezone matters: TMDB sends a bare date, which parses as
 * UTC midnight, so formatting in a negative-offset zone would render the day
 * before. Locale is pinned to en-US to match the language we request from TMDB
 * and to keep server output deterministic.
 */
export function toLongDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
