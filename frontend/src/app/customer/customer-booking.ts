import { isCheckoutId } from '../service/checkout.service';

const minimumCheckoutLeadTime = 31 * 60_000;

export function customerLoginDestination(checkout: string | null, returnTo: string | null): string[] {
  if (isCheckoutId(checkout)) return ['/checkout', checkout];
  const bookingRoute = /^\/(seance|detail)\/([1-9]\d*)$/.exec(returnTo ?? '');
  return bookingRoute ? [`/${bookingRoute[1]}`, bookingRoute[2]] : ['/'];
}

export function sessionTime(date: Date | string | undefined, time: string | undefined): number {
  const day = date instanceof Date && Number.isFinite(date.getTime()) ? date.toISOString() : date;
  const parts = typeof day === 'string' && /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(day);
  const clock = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(time ?? '');
  if (!parts || !clock) return NaN;
  // The calendar date is serialized in UTC. The schedule itself is a local time.
  const [, year, month, dayOfMonth] = parts.map(Number);
  const hours = Number(clock[1]);
  const minutes = Number(clock[2]);
  const seconds = Number(clock[3] ?? 0);
  if (hours > 23 || minutes > 59 || seconds > 59) return NaN;
  const value = new Date(year, month - 1, dayOfMonth, hours, minutes, seconds);
  return value.getMonth() === month - 1 && value.getDate() === dayOfMonth ? value.getTime() : NaN;
}

export function canBookSession(start: number, now = Date.now()): boolean {
  return start - now >= minimumCheckoutLeadTime;
}

export function sessionStatus(start: number, end: number, now = Date.now()): 'upcoming' | 'live' | 'ended' | 'unknown' {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 'unknown';
  if (now < start) return 'upcoming';
  return now <= end ? 'live' : 'ended';
}

export function localDateInput(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
