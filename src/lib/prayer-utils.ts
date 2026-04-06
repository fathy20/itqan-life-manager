// ═══════════════════════════════════════════════════════════════
//  src/lib/prayer-utils.ts
//  Shared prayer time utilities
//  Used by: salah-adapter, home-adapter, and future slices
// ═══════════════════════════════════════════════════════════════

import type { DayPrayerLog, PrayerTimes, PrayerName } from '../types/new';

export const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const PRAYER_NAMES_AR: Record<PrayerName, string> = {
  fajr:    'الفجر',
  dhuhr:   'الظهر',
  asr:     'العصر',
  maghrib: 'المغرب',
  isha:    'العشاء',
};

export const PRAYER_NAMES_EN: Record<PrayerName, string> = {
  fajr:    'Fajr',
  dhuhr:   'Dhuhr',
  asr:     'Asr',
  maghrib: 'Maghrib',
  isha:    'Isha',
};

/** Parse "HH:mm" → total minutes from midnight */
export function toMinutes(timeHHmm: string): number {
  const [h, m] = timeHHmm.split(':').map(Number);
  return h * 60 + m;
}

/** Current time in minutes from midnight (local) */
export function nowMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Find the next unprayed prayer and return a display label.
 * Returns '—' if times is null or all prayers are done.
 */
export function getNextPrayerLabel(
  times: PrayerTimes | null,
  prayerLog: DayPrayerLog | null
): string {
  if (!times) return '—';

  const now = nowMinutes();

  for (const id of PRAYER_ORDER) {
    const logEntry = prayerLog?.prayers?.[id];
    if (logEntry && logEntry.status !== 'pending') continue; // already prayed

    const prayerMins = toMinutes(times[id]);
    if (prayerMins > now) {
      return `${PRAYER_NAMES_AR[id]} ${times[id]}`;
    }
  }
  return '—';
}

/**
 * Find the next unprayed prayer object.
 * Returns null if times is null or all prayers are done.
 */
export function getNextPrayer(
  times: PrayerTimes | null,
  prayerLog: DayPrayerLog | null
): { id: PrayerName; nameAr: string; nameEn: string; time: string } | null {
  if (!times) return null;

  const now = nowMinutes();

  for (const id of PRAYER_ORDER) {
    const logEntry = prayerLog?.prayers?.[id];
    if (logEntry && logEntry.status !== 'pending') continue;

    const prayerMins = toMinutes(times[id]);
    if (prayerMins > now) {
      return {
        id,
        nameAr: PRAYER_NAMES_AR[id],
        nameEn: PRAYER_NAMES_EN[id],
        time:   times[id],
      };
    }
  }
  return null;
}

/**
 * Seconds until a given "HH:mm" time today.
 * Returns 0 if the time has passed.
 */
export function secondsUntil(timeHHmm: string): number {
  const [h, m] = timeHHmm.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
}

/**
 * Determine which prayer window we're currently in.
 * Returns null if before fajr.
 */
export function resolveCurrentPrayer(times: PrayerTimes): PrayerName | null {
  const now = nowMinutes();

  for (let i = 0; i < PRAYER_ORDER.length; i++) {
    const id = PRAYER_ORDER[i];
    const start = toMinutes(times[id]);
    const next = i < PRAYER_ORDER.length - 1
      ? toMinutes(times[PRAYER_ORDER[i + 1]])
      : 24 * 60;

    if (now >= start && now < next) return id;
  }
  return null;
}
