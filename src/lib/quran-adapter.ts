// ═══════════════════════════════════════════════════════════════
//  src/lib/quran-adapter.ts
//  Adapter: transforms hook data → Quran UI shape
// ═══════════════════════════════════════════════════════════════

import type { KhatmaPlan, SurahHifz } from '../types/new';
import type { QuranStats } from '../hooks/useQuranNew';

// ── Khatma / Plan ─────────────────────────────────────────────

export interface UIKhatma {
  currentPage: number;
  totalPages:  number;
  dailyTarget: number;
  todayRead:   number;
  daysLeft:    number;
  plan:        string;
  pct:         number;
}

export function buildKhatma(plan: KhatmaPlan | null, todayPages: number): UIKhatma {
  if (!plan) {
    return { currentPage: 0, totalPages: 604, dailyTarget: 4, todayRead: 0, daysLeft: 0, plan: '—', pct: 0 };
  }

  const daysLeft = plan.targetDate
    ? Math.max(0, Math.ceil((new Date(plan.targetDate).getTime() - Date.now()) / 86400000))
    : 0;

  const pct = Math.round((plan.currentPage / plan.totalPages) * 100);

  return {
    currentPage: plan.currentPage,
    totalPages:  plan.totalPages,
    dailyTarget: plan.dailyPages,
    todayRead:   todayPages,
    daysLeft,
    plan:        `${plan.targetDays}-day`,
    pct,
  };
}

// ── Juz Grid ──────────────────────────────────────────────────
// Approximate juz progress from currentPage.
// Each juz ≈ 20 pages (604 / 30 ≈ 20.1)

export interface UIJuz {
  num: number;
  pct: number; // 0 = not started, 1-99 = in progress, 100 = done
}

const PAGES_PER_JUZ = 604 / 30;

export function buildJuzData(currentPage: number): UIJuz[] {
  return Array.from({ length: 30 }, (_, i) => {
    const juzStart = Math.round(i * PAGES_PER_JUZ) + 1;
    const juzEnd   = Math.round((i + 1) * PAGES_PER_JUZ);

    let pct = 0;
    if (currentPage >= juzEnd) {
      pct = 100;
    } else if (currentPage >= juzStart) {
      pct = Math.round(((currentPage - juzStart + 1) / (juzEnd - juzStart + 1)) * 100);
    }

    return { num: i + 1, pct };
  });
}

// ── Hifz ──────────────────────────────────────────────────────

export interface UIHifzEntry {
  num:    number;
  name:   string;
  ayahs:  number;
  mem:    number;
  status: SurahHifz['status'];
  pct:    number;
  reviewLabel: string | null; // "today" | "2d" | null
}

export function buildHifzList(hifz: SurahHifz[]): UIHifzEntry[] {
  const today = new Date().toISOString().split('T')[0];

  return hifz.map(s => {
    const pct = s.totalAyahs > 0 ? Math.round((s.memorizedAyahs / s.totalAyahs) * 100) : 0;

    let reviewLabel: string | null = null;
    if (s.nextReviewDate) {
      const diff = Math.ceil((new Date(s.nextReviewDate).getTime() - Date.now()) / 86400000);
      if (diff <= 0) reviewLabel = 'today';
      else if (diff === 1) reviewLabel = '1d';
      else reviewLabel = `${diff}d`;
    }

    return {
      num:    s.surahNumber,
      name:   s.surahName || `Surah ${s.surahNumber}`,
      ayahs:  s.totalAyahs,
      mem:    s.memorizedAyahs,
      status: s.status,
      pct,
      reviewLabel,
    };
  });
}

// ── Weekly pages chart ────────────────────────────────────────
// stats.weeklyPages is a total — we can't break it per day without
// a per-day endpoint. Show as a single bar for now (deferred).

export interface UIWeekDay {
  day:   string;
  pages: number;
}

export function buildWeekData(weeklyPages: number): UIWeekDay[] {
  // Placeholder: distribute evenly across 7 days
  // Real per-day data needs GET /quran/sessions?week=current
  const avg = Math.round(weeklyPages / 7);
  const days = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
  return days.map(day => ({ day, pages: avg }));
}

// ── Top stats ─────────────────────────────────────────────────

export interface UIQuranTopStats {
  khatmaPct:      number;
  todayRead:      number;
  dailyTarget:    number;
  totalMemorized: number;
  hifzTotal:      number;
  reviewsDue:     number;
}

export function buildTopStats(
  khatma: UIKhatma,
  stats: QuranStats,
  hifzCount: number
): UIQuranTopStats {
  return {
    khatmaPct:      khatma.pct,
    todayRead:      khatma.todayRead,
    dailyTarget:    khatma.dailyTarget,
    totalMemorized: stats.totalMemorized,
    hifzTotal:      hifzCount,
    reviewsDue:     stats.reviewsDue,
  };
}
