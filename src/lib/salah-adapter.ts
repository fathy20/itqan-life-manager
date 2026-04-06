// ═══════════════════════════════════════════════════════════════
//  src/lib/salah-adapter.ts
//  Adapter: transforms hook data → UI shape expected by SalahSystem
//
//  The new UI (interface/itqan-salah.jsx) was built with static arrays.
//  This adapter bridges live backend data to that exact shape,
//  so the UI component needs minimal changes.
// ═══════════════════════════════════════════════════════════════

import { Sunrise, Sun, Sunset, Moon, LucideIcon } from 'lucide-react';
import type { DayPrayerLog, PrayerTimes, PrayerName } from '../types/new';
import {
  PRAYER_ORDER,
  resolveCurrentPrayer,
  secondsUntil as _secondsUntil,
  getNextPrayer as _getNextPrayer,
} from './prayer-utils';

// ── UI shape expected by SalahSystem ─────────────────────────

export interface UIPrayer {
  id:       PrayerName;
  nameAr:   string;
  nameEn:   string;
  time:     string;   // "HH:mm" display time
  adhan:    string;   // same as time
  iqama:    string;   // time + ~15min (placeholder until iqama API exists)
  status:   'done' | 'current' | 'upcoming' | 'pending';
  loggedAt: string;
  jamaah:   boolean;
  sunnah:   { before: boolean; after: boolean };
  icon:     LucideIcon;
  color:    string;
  period:   string;
}

export interface UIExtra {
  id:     'witr' | 'qiyam' | 'duha';
  nameAr: string;
  done:   boolean;
  color:  string;
}

// ── Prayer metadata ───────────────────────────────────────────

const PRAYER_META: Record<PrayerName, {
  nameAr: string; nameEn: string;
  icon: LucideIcon; color: string; period: string;
}> = {
  fajr:    { nameAr: 'الفجر',   nameEn: 'Fajr',    icon: Sunrise, color: '#A78BFA', period: 'dawn'      },
  dhuhr:   { nameAr: 'الظهر',   nameEn: 'Dhuhr',   icon: Sun,     color: '#FBBF24', period: 'noon'      },
  asr:     { nameAr: 'العصر',   nameEn: 'Asr',     icon: Sun,     color: '#FB923C', period: 'afternoon' },
  maghrib: { nameAr: 'المغرب',  nameEn: 'Maghrib', icon: Sunset,  color: '#F472B6', period: 'sunset'    },
  isha:    { nameAr: 'العشاء',  nameEn: 'Isha',    icon: Moon,    color: '#818CF8', period: 'night'     },
};

// PRAYER_ORDER imported from prayer-utils — no local redeclaration

// ── Helpers ───────────────────────────────────────────────────

/** Add ~15 minutes to a "HH:mm" string for iqama placeholder */
function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// ── Main adapter ──────────────────────────────────────────────

/**
 * Build the PRAYERS_TODAY array from live hook data.
 * Falls back to "upcoming" status when no log exists.
 */
export function buildPrayersFromHook(
  times: PrayerTimes | null,
  prayerLog: DayPrayerLog | null
): UIPrayer[] {
  const currentPrayer = times ? resolveCurrentPrayer(times) : null;

  return PRAYER_ORDER.map(id => {
    const meta = PRAYER_META[id];
    const logEntry = prayerLog?.prayers?.[id];
    const timeStr = times?.[id] ?? '--:--';

    // Determine status
    let status: UIPrayer['status'] = 'upcoming';
    if (logEntry && logEntry.status !== 'pending') {
      status = 'done';
    } else if (id === currentPrayer) {
      status = 'current';
    }

    return {
      id,
      nameAr:   meta.nameAr,
      nameEn:   meta.nameEn,
      time:     timeStr,
      adhan:    timeStr,
      iqama:    timeStr !== '--:--' ? addMinutes(timeStr, 15) : '--:--',
      status,
      loggedAt: logEntry?.loggedAt ?? '',
      jamaah:   logEntry?.jamaah ?? false,
      sunnah: {
        before: logEntry?.sunnahBefore ?? false,
        after:  logEntry?.sunnahAfter  ?? false,
      },
      icon:   meta.icon,
      color:  meta.color,
      period: meta.period,
    };
  });
}

/**
 * Build the EXTRAS array from live prayer log.
 */
export function buildExtrasFromHook(prayerLog: DayPrayerLog | null): UIExtra[] {
  return [
    { id: 'witr',  nameAr: 'الوتر',        done: prayerLog?.witr  ?? false, color: '#A78BFA' },
    { id: 'duha',  nameAr: 'الضحى',        done: false,                     color: '#FBBF24' },
    { id: 'qiyam', nameAr: 'قيام الليل',   done: prayerLog?.qiyam ?? false, color: '#818CF8' },
  ];
}

/**
 * Find the next upcoming prayer and its time.
 * Re-exported from prayer-utils for backward compatibility.
 */
export function getNextPrayer(
  times: PrayerTimes | null,
  prayerLog: DayPrayerLog | null
): { name: string; nameAr: string; time: string } | null {
  const result = _getNextPrayer(times, prayerLog);
  if (!result) return null;
  return { name: result.nameEn, nameAr: result.nameAr, time: result.time };
}

/**
 * Seconds until a given "HH:mm" time today.
 * Re-exported from prayer-utils.
 */
export { _secondsUntil as secondsUntil };
