// ═══════════════════════════════════════════════════════════════
//  backend/src/modules/score/score.service.ts
//  Score Engine — Computes daily life score from all modules
// ═══════════════════════════════════════════════════════════════

import { db } from "../../lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export type RankTitle = "مبتدئ" | "سالك" | "مجتهد" | "محسن" | "متقن";

// ─── Collection ref ──────────────────────────────────────────
const scoresRef = (uid: string) => db.collection("users").doc(uid).collection("daily_scores");

// ─── Rank Title ──────────────────────────────────────────────
export function getRankTitle(weeklyAvg: number): RankTitle {
  if (weeklyAvg >= 90) return "متقن";
  if (weeklyAvg >= 75) return "محسن";
  if (weeklyAvg >= 55) return "مجتهد";
  if (weeklyAvg >= 35) return "سالك";
  return "مبتدئ";
}

// ─── Compute Salah Score (max 30) ────────────────────────────
async function computeSalahScore(uid: string, date: string): Promise<number> {
  const doc = await db.collection("users").doc(uid).collection("prayers").doc(date).get();
  if (!doc.exists) return 0;

  const data = doc.data()!;
  const prayers = data.prayers || {};
  const prayerNames = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  let score = 0;

  for (const p of prayerNames) {
    const prayer = prayers[p];
    if (!prayer) continue;
    if (prayer.status === "onTime") score += 6;
    else if (prayer.status === "late") score += 3;
    else if (prayer.status === "qada") score += 1;
    if (prayer.jamaah) score += 1;
    if (prayer.sunnahBefore || prayer.sunnahAfter) score += 0.5;
  }

  return Math.min(30, Math.round(score));
}

// ─── Compute Quran Score (max 20) ────────────────────────────
async function computeQuranScore(uid: string, date: string): Promise<number> {
  let score = 0;

  // Check if daily reading target met
  const sessions = await db.collection("users").doc(uid).collection("quran_sessions")
    .where("date", "==", date).get();

  let pagesRead = 0;
  let hasHifz = false;
  let hasReview = false;

  sessions.forEach(doc => {
    const d = doc.data();
    if (d.type === "reading" && d.fromPage && d.toPage) {
      pagesRead += d.toPage - d.fromPage + 1;
    }
    if (d.type === "hifz") hasHifz = true;
    if (d.type === "review") hasReview = true;
  });

  // Check active plan's daily target
  const activePlans = await db.collection("users").doc(uid).collection("khatma_plans")
    .where("status", "==", "active").limit(1).get();

  if (!activePlans.empty) {
    const plan = activePlans.docs[0].data();
    if (pagesRead >= (plan.dailyPages || 1)) score += 10;
    else if (pagesRead > 0) score += Math.round((pagesRead / plan.dailyPages) * 10);
  } else if (pagesRead > 0) {
    score += 5; // partial credit without a plan
  }

  if (hasHifz) score += 5;
  if (hasReview) score += 3;
  if (pagesRead > 5) score += 2; // bonus for extra reading

  return Math.min(20, Math.round(score));
}

// ─── Compute Adhkar Score (max 15) ───────────────────────────
async function computeAdhkarScore(uid: string, date: string): Promise<number> {
  const doc = await db.collection("users").doc(uid).collection("adhkar_logs").doc(date).get();
  if (!doc.exists) return 0;

  const data = doc.data()!;
  let score = 0;

  if (data.morning?.completed) score += 5;
  if (data.evening?.completed) score += 5;
  if ((data.afterPrayer?.count || 0) >= 3) score += 3;
  else if ((data.afterPrayer?.count || 0) > 0) score += 1;
  if (data.sleep?.completed) score += 2;

  return Math.min(15, score);
}

// ─── Compute Productivity Score (max 15) ─────────────────────
async function computeProductivityScore(uid: string, date: string): Promise<number> {
  let score = 0;

  // Tasks completed today
  const tasksSnap = await db.collection("users").doc(uid).collection("tasks")
    .where("completedAt", ">=", `${date}T00:00:00`)
    .where("completedAt", "<=", `${date}T23:59:59`)
    .get();

  const completedTasks = tasksSnap.size;
  if (completedTasks >= 5) score += 8;
  else if (completedTasks >= 3) score += 5;
  else if (completedTasks >= 1) score += 3;

  // Focus sessions today
  const focusSnap = await db.collection("users").doc(uid).collection("focus_sessions")
    .where("completedAt", ">=", `${date}T00:00:00`)
    .where("completedAt", "<=", `${date}T23:59:59`)
    .get();

  const focusSessions = focusSnap.size;
  if (focusSessions >= 3) score += 7;
  else if (focusSessions >= 2) score += 5;
  else if (focusSessions >= 1) score += 3;

  return Math.min(15, score);
}

// ─── Compute Health Score (max 10) ───────────────────────────
async function computeHealthScore(uid: string, date: string): Promise<number> {
  const doc = await db.collection("users").doc(uid).collection("lifestyle_logs").doc(date).get();
  if (!doc.exists) return 0;

  const data = doc.data()!;
  let score = 0;

  // Sleep: 7-9 hours = full points
  const sleep = data.sleepHours || 0;
  if (sleep >= 7 && sleep <= 9) score += 4;
  else if (sleep >= 6) score += 2;

  // Steps: 8000+ = full points
  const steps = data.steps || 0;
  if (steps >= 8000) score += 3;
  else if (steps >= 5000) score += 2;
  else if (steps >= 2000) score += 1;

  // Water: 2L+ = full points
  const water = data.waterLiters || 0;
  if (water >= 2) score += 3;
  else if (water >= 1.5) score += 2;
  else if (water >= 1) score += 1;

  return Math.min(10, score);
}

// ─── Compute Bonus Score (max 10) ────────────────────────────
async function computeBonusScore(uid: string, date: string): Promise<number> {
  let score = 0;

  // Check streak: get last 7 days scores
  const sevenDaysAgo = new Date(date);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const startStr = sevenDaysAgo.toISOString().split("T")[0];

  const recentScores = await scoresRef(uid)
    .where("date", ">=", startStr)
    .where("date", "<", date)
    .get();

  let streakDays = 0;
  recentScores.forEach(doc => {
    if ((doc.data().total || 0) >= 50) streakDays++;
  });

  if (streakDays >= 6) score += 10;
  else if (streakDays >= 4) score += 7;
  else if (streakDays >= 2) score += 4;
  else if (streakDays >= 1) score += 2;

  return Math.min(10, score);
}

// ─── Compute Score ───────────────────────────────────────────
export async function computeScore(uid: string, date: string) {
  const [salah, quran, adhkar, productivity, health, bonus] = await Promise.all([
    computeSalahScore(uid, date),
    computeQuranScore(uid, date),
    computeAdhkarScore(uid, date),
    computeProductivityScore(uid, date),
    computeHealthScore(uid, date),
    computeBonusScore(uid, date),
  ]);

  const total = salah + quran + adhkar + productivity + health + bonus;

  const scoreData = {
    date,
    salah,
    quran,
    adhkar,
    productivity,
    health,
    bonus,
    total,
    updatedAt: FieldValue.serverTimestamp(),
  };

  await scoresRef(uid).doc(date).set({
    ...scoreData,
    createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return { date, salah, quran, adhkar, productivity, health, bonus, total };
}

// ─── Get Today ───────────────────────────────────────────────
export async function getToday(uid: string) {
  const today = new Date().toISOString().split("T")[0];
  const doc = await scoresRef(uid).doc(today).get();

  if (!doc.exists) {
    return computeScore(uid, today);
  }

  return { date: today, ...doc.data() };
}

// ─── Get Week ────────────────────────────────────────────────
export async function getWeek(uid: string) {
  const scores = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const doc = await scoresRef(uid).doc(dateStr).get();
    if (doc.exists) {
      scores.push({ date: dateStr, ...doc.data() });
    } else {
      scores.push({ date: dateStr, salah: 0, quran: 0, adhkar: 0, productivity: 0, health: 0, bonus: 0, total: 0 });
    }
  }
  return scores;
}

// ─── Get Shared Score ────────────────────────────────────────
export async function getShared(uid: string) {
  const weekScores = await getWeek(uid);
  const totals = weekScores.map(s => (s as any).total || 0);
  const weeklyAvg = totals.reduce((a, b) => a + b, 0) / totals.length;
  const weeklyRingPercent = Math.round(weeklyAvg);
  const rankTitle = getRankTitle(weeklyAvg);

  // Compute streak
  let streakDays = 0;
  for (let i = 0; i < weekScores.length; i++) {
    if (((weekScores[i] as any).total || 0) >= 50) streakDays++;
    else break;
  }

  // Week ID: YYYY-WNN
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  const weekId = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

  return { weekId, rankTitle, weeklyRingPercent, streakDays };
}
