export type OpeningHour = { day: string; hours: string };

export type OpeningStatus = {
  open: boolean;
  today: string;
  hours: string;
};

const CLOSED_RE = /geschlossen/i;

export function parseHoursRange(hours: string): { start: number; end: number } | null {
  if (!hours || CLOSED_RE.test(hours)) return null;
  const match = hours.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const start = Number(match[1]) * 60 + Number(match[2]);
  const end = Number(match[3]) * 60 + Number(match[4]);
  return { start, end };
}

export function getZonedClock(
  now: Date,
  timeZone = 'Europe/Zurich'
): { weekday: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('de-CH', {
    timeZone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  const hour = Number(value('hour'));
  const minute = Number(value('minute'));
  return {
    weekday: value('weekday'),
    minutes: hour * 60 + minute,
  };
}

export function getOpeningStatus(
  openingHours: OpeningHour[],
  now: Date = new Date(),
  timeZone = 'Europe/Zurich'
): OpeningStatus {
  const clock = getZonedClock(now, timeZone);
  const row = openingHours.find((item) => item.day.toLowerCase() === clock.weekday.toLowerCase());
  const hours = row?.hours ?? '';
  const range = parseHoursRange(hours);
  const open = range ? clock.minutes >= range.start && clock.minutes < range.end : false;
  return { open, today: clock.weekday, hours };
}
