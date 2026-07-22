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
