// ═══════════════════════════════════════════════════════════════
//  src/lib/home-adapter.ts
//  Adapter: transforms hook data → Home UI shape
//
//  Phase 1: score + salah + profile
//  Phase 2: + quran + adhkar
//  Phase 3: + study + work
// ═══════════════════════════════════════════════════════════════

import type {
  DayPrayerLog,
  PrayerTimes,
  DailyScore,
  SharedScore,
  UserProfile,
} from '../types/new';
import { getNextPrayerLabel } from './prayer-utils';

// ── Quick Stats bar ───────────────────────────────────────────

export interface QuickStats {
  streak:     string;  // "18 days" | "—"
  score:      string;  // "83/100"  | "—"
  nextPrayer: string;  // "العصر 15:45" | "—"
}

export function buildQuickStats(
  todayScore: DailyScore  | null,
  shared:     SharedScore | null,
  times:      PrayerTimes | null,
  prayerLog:  DayPrayerLog | null
): QuickStats {
  return {
    streak:     shared     ? `${shared.streakDays} days`          : '—',
    score:      todayScore ? `${todayScore.total}/100`             : '—',
    nextPrayer: getNextPrayerLabel(times, prayerLog),
  };
}

// ── Module badges ─────────────────────────────────────────────
//
// Returns a badge string per module ID, or null if no live data.
// null = no badge shown (not a mock string).
//
// Phase 1: salah + sibaq badges only.
// Phase 2: quran + adhkar.
// Phase 3: study.

export interface ModuleBadges {
  salah:   string | null;  // "العصر 3:45" | null
  sibaq:   string | null;  // "Rank: متقن" | null
  quran:   string | null;  // deferred Phase 2
  adhkar:  string | null;  // deferred Phase 2
  study:   string | null;  // deferred Phase 3
}

export function buildModuleBadges(
  times:      PrayerTimes  | null,
  prayerLog:  DayPrayerLog | null,
  shared:     SharedScore  | null
): ModuleBadges {
  // Salah badge: next prayer time
  let salahBadge: string | null = null;
  if (times) {
    const next = getNextPrayerLabel(times, prayerLog);
    if (next !== '—') salahBadge = next;
  }

  // Sibaq badge: rank title
  const sibaqBadge = shared?.rankTitle ? `Rank: ${shared.rankTitle}` : null;

  return {
    salah:  salahBadge,
    sibaq:  sibaqBadge,
    quran:  null,  // Phase 2
    adhkar: null,  // Phase 2
    study:  null,  // Phase 3
  };
}

// ── Greeting ──────────────────────────────────────────────────

export function buildGreeting(): string {
  const h = new Date().getHours();
  if (h < 6)  return 'قيام الليل مبارك';
  if (h < 12) return 'صباح الخير';
  if (h < 17) return 'مساء النور';
  return 'مساء الخير';
}

// ── Display name ──────────────────────────────────────────────

export function buildDisplayName(profile: UserProfile | null): string {
  return profile?.displayName || '—';
}

export function buildAvatarLetter(profile: UserProfile | null): string {
  return (profile?.displayName?.[0] ?? '?').toUpperCase();
}
