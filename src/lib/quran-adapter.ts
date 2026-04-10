// ═══════════════════════════════════════════════════════════════
//  src/lib/quran-adapter.ts
//  Adapter: transforms hook data → Quran UI shape
// ═══════════════════════════════════════════════════════════════

import type { KhatmaPlan, SurahHifz } from '../types/new';

// ── Khatma / Plan ─────────────────────────────────────────────

export interface UIKhatma {
  currentPage: number;
  totalPages:  number;
  dailyTarget: number;
  todayRead:   number;
  daysLeft:    number;
  plan:        string;
  progressPct: number;
}

export function buildKhatma(
  activePlan: KhatmaPlan | null,
  todayPages: number
): UIKhatma {
  if (!activePlan) {
    return { currentPage: 0, totalPages: 604, dailyTarget: 4, todayRead: 0, daysLeft: 0, plan: '—', progressPct: 0 };
  }

  const daysLeft = activePlan.targetDate
    ? Math.max(0, Math.ceil((new Date(activePlan.targetDate).getTime() - Date.now()) / 86400000))
    : 0;

  return {
    currentPage: activePlan.currentPage,
    totalPages:  activePlan.totalPages || 604,
    dailyTarget: activePlan.dailyPages,
    todayRead:   todayPages,
    daysLeft,
    plan:        `${activePlan.targetDays}-day`,
    progressPct: Math.round((activePlan.currentPage / (activePlan.totalPages || 604)) * 100),
  };
}

// ── Juz Grid ──────────────────────────────────────────────────
// Approximates juz completion from currentPage.
// Each juz ≈ 20 pages (604 / 30 ≈ 20.1)

export interface UIJuz {
  num: number;
  pct: number; // 0 = not started, 1-99 = in progress, 100 = done
}

export function buildJuzData(currentPage: number): UIJuz[] {
  const PAGES_PER_JUZ = 604 / 30;
  return Array.from({ length: 30 }, (_, i) => {
    const juzStart = i * PAGES_PER_JUZ;
    const juzEnd   = (i + 1) * PAGES_PER_JUZ;
    let pct = 0;
    if (currentPage >= juzEnd) {
      pct = 100;
    } else if (currentPage > juzStart) {
      pct = Math.round(((currentPage - juzStart) / PAGES_PER_JUZ) * 100);
    }
    return { num: i + 1, pct };
  });
}

// ── Hifz ──────────────────────────────────────────────────────

export interface UIHifzRow {
  surahNumber: number;
  surahName:   string;
  totalAyahs:  number;
  memorized:   number;
  status:      SurahHifz['status'];
  reviewLabel: string | null; // "today" | "2d" | null
}

export function buildHifzRows(hifz: SurahHifz[]): UIHifzRow[] {
  const today = new Date().toISOString().split('T')[0];
  return hifz.map(s => {
    let reviewLabel: string | null = null;
    if (s.nextReviewDate) {
      if (s.nextReviewDate <= today) {
        reviewLabel = 'today';
      } else {
        const daysUntil = Math.ceil(
          (new Date(s.nextReviewDate).getTime() - Date.now()) / 86400000
        );
        reviewLabel = daysUntil <= 7 ? `${daysUntil}d` : null;
      }
    }
    return {
      surahNumber: s.surahNumber,
      surahName:   s.surahName || `سورة ${s.surahNumber}`,
      totalAyahs:  s.totalAyahs || 0,
      memorized:   s.memorizedAyahs || 0,
      status:      s.status,
      reviewLabel,
    };
  });
}

// ── Weekly pages chart ────────────────────────────────────────

export interface UIWeekDay {
  day:   string;
  pages: number;
}

// Placeholder until per-day sessions endpoint exists
// weeklyPages from stats is a total — distribute evenly for now
export function buildWeekData(weeklyPages: number): UIWeekDay[] {
  const DAYS_AR = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
  const avg = weeklyPages > 0 ? Math.round(weeklyPages / 7) : 0;
  return DAYS_AR.map(day => ({ day, pages: avg }));
}

// ── Stats ─────────────────────────────────────────────────────

export function buildQuranScore(
  stats: { weeklyPages: number; totalMemorized: number; reviewsDue: number } | null,
  todayPages: number,
  dailyTarget: number
): { score: number; max: number } {
  if (!stats) return { score: 0, max: 20 };
  const targetMet = dailyTarget > 0 && todayPages >= dailyTarget;
  const score = (targetMet ? 10 : todayPages > 0 ? 5 : 0) +
                (stats.totalMemorized > 0 ? 3 : 0) +
                (stats.reviewsDue === 0 ? 2 : 0);
  return { score: Math.min(score, 20), max: 20 };
}
