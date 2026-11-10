export const rs = (n: number) => '₹' + Number(n || 0).toLocaleString('en-IN');

/** Today's date in India as YYYY-MM-DD, whatever the device timezone. */
export function istToday(offsetDays = 0): string {
  const now = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
const parse = (d: string) => new Date(d + 'T00:00:00');
export const fmtDate = (d?: string | null) => (d ? parse(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '');
export const dayName = (d: string) => parse(d).toLocaleDateString('en-IN', { weekday: 'short' });
export const dayNum = (d: string) => parse(d).getDate();
export function fmtTime(t?: string | null): string {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
export const fmtDuration = (min: number) => (min < 60 ? `${min} min` : min % 60 === 0 ? `${min / 60} hr${min > 60 ? 's' : ''}` : `${Math.floor(min / 60)} hr ${min % 60} min`);
export const fmtCount = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10}k`.replace('.0k', 'k') : String(n));
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || 'N';
export const fmtStamp = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });
/** Minutes until a booking's slot starts, in India time. */
export function minutesUntil(date: string, time: string): number {
  const start = new Date(`${date}T${time.slice(0, 5)}:00+05:30`).getTime();
  return (start - Date.now()) / 60000;
}
export const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmed', pro_assigned: 'Professional assigned', en_route: 'On the way', in_progress: 'In progress',
  completed: 'Completed', cancelled: 'Cancelled', rescheduled: 'Rescheduled', rated: 'Rated',
};
export const PAY_LABEL: Record<string, string> = { upi: 'UPI', card: 'Card', cash: 'Pay after service' };
