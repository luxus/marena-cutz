import { describe, expect, it } from 'vitest';
import { getOpeningStatus, parseHoursRange } from '../opening-status';

const HOURS = [
  { day: 'Montag', hours: 'Geschlossen' },
  { day: 'Dienstag', hours: '09:00–19:00' },
  { day: 'Mittwoch', hours: '09:00–19:00' },
  { day: 'Donnerstag', hours: '09:00–19:00' },
  { day: 'Freitag', hours: '09:00–19:00' },
  { day: 'Samstag', hours: '09:00–16:00' },
  { day: 'Sonntag', hours: 'Geschlossen' },
];

describe('parseHoursRange', () => {
  it('returns null for closed days', () => {
    expect(parseHoursRange('Geschlossen')).toBeNull();
  });

  it('parses an en-dash range into minutes', () => {
    expect(parseHoursRange('09:00–19:00')).toEqual({ start: 9 * 60, end: 19 * 60 });
  });
});

describe('getOpeningStatus', () => {
  it('is closed on Monday in Zurich-equivalent UTC morning', () => {
    const monday = new Date(Date.UTC(2026, 8, 21, 10, 0, 0));
    const status = getOpeningStatus(HOURS, monday, 'UTC');
    expect(status.today).toBe('Montag');
    expect(status.open).toBe(false);
  });

  it('is open on Tuesday during shop hours', () => {
    const tuesday = new Date(Date.UTC(2026, 8, 22, 12, 0, 0));
    const status = getOpeningStatus(HOURS, tuesday, 'UTC');
    expect(status.today).toBe('Dienstag');
    expect(status.open).toBe(true);
    expect(status.hours).toBe('09:00–19:00');
  });

  it('is closed on Saturday after 16:00', () => {
    const saturdayEvening = new Date(Date.UTC(2026, 8, 26, 16, 30, 0));
    const status = getOpeningStatus(HOURS, saturdayEvening, 'UTC');
    expect(status.today).toBe('Samstag');
    expect(status.open).toBe(false);
  });
});
