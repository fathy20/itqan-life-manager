// ═══════════════════════════════════════════════════════════════
//  backend/src/modules/quran/quran.service.ts
//  Quran Service — Khatma plans, sessions, hifz tracking
// ═══════════════════════════════════════════════════════════════

import { db } from "../../lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// ─── Collection refs ─────────────────────────────────────────
const sessionsRef = (uid: string) => db.collection("users").doc(uid).collection("quran_sessions");
const plansRef = (uid: string) => db.collection("users").doc(uid).collection("khatma_plans");
const hifzRef = (uid: string) => db.collection("users").doc(uid).collection("hifz");

// ─── Khatma Plans ────────────────────────────────────────────

export async function getPlans(uid: string) {
  const snapshot = await plansRef(uid).orderBy("createdAt", "desc").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createPlan(uid: string, data: {
  targetDays: number;
  dailyPages: number;
  startPage?: number;
}) {
  const startDate = new Date().toISOString().split("T")[0];
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + data.targetDays);

  const plan = {
    targetDays: data.targetDays,
    dailyPages: data.dailyPages,
    currentPage: data.startPage || 1,
    totalPages: 604,
    startDate,
    targetDate: targetDate.toISOString().split("T")[0],
    completedDates: [],
    status: "active",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const docRef = await plansRef(uid).add(plan);
  return { id: docRef.id, ...plan };
}

export async function updatePlan(uid: string, id: string, data: {
  currentPage?: number;
  status?: "active" | "completed" | "paused";
}) {
  const docRef = plansRef(uid).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Plan not found");

  const updates: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() };
  if (data.currentPage !== undefined) updates.currentPage = data.currentPage;
  if (data.status !== undefined) updates.status = data.status;

  await docRef.update(updates);
  return { id, ...doc.data(), ...updates };
}

// ─── Sessions ────────────────────────────────────────────────

export async function logSession(uid: string, data: {
  type: "reading" | "hifz" | "review";
  fromPage?: number;
  toPage?: number;
  surah?: number;
  durationMinutes?: number;
  date: string;
}) {
  const session = {
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  };

  const docRef = await sessionsRef(uid).add(session);

  // Auto-update active khatma plan's currentPage if type=reading
  if (data.type === "reading" && data.toPage) {
    const activePlans = await plansRef(uid).where("status", "==", "active").limit(1).get();
    if (!activePlans.empty) {
      const planDoc = activePlans.docs[0];
      const planData = planDoc.data();
      if (data.toPage > (planData.currentPage || 0)) {
        await planDoc.ref.update({
          currentPage: data.toPage,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }
  }

  return { id: docRef.id, ...data };
}

// ─── Hifz ────────────────────────────────────────────────────

export async function getHifz(uid: string) {
  const snapshot = await hifzRef(uid).orderBy("surahNumber", "asc").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateHifz(uid: string, surahNum: number, data: {
  memorizedAyahs?: number;
  status?: "not_started" | "in_progress" | "memorized" | "needs_review";
  nextReviewDate?: string;
}) {
  const docRef = hifzRef(uid).doc(String(surahNum));
  const doc = await docRef.get();

  const updates: Record<string, any> = {
    surahNumber: surahNum,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (data.memorizedAyahs !== undefined) updates.memorizedAyahs = data.memorizedAyahs;
  if (data.status !== undefined) updates.status = data.status;
  if (data.nextReviewDate !== undefined) updates.nextReviewDate = data.nextReviewDate;

  if (doc.exists) {
    await docRef.update(updates);
  } else {
    await docRef.set({
      surahNumber: surahNum,
      memorizedAyahs: 0,
      status: "not_started",
      reviewCount: 0,
      ...updates,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  return { surahNumber: surahNum, ...updates };
}

export async function getReviewsDue(uid: string) {
  const today = new Date().toISOString().split("T")[0];
  const snapshot = await hifzRef(uid)
    .where("nextReviewDate", "<=", today)
    .where("status", "in", ["memorized", "needs_review", "in_progress"])
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ─── Stats ───────────────────────────────────────────────────

export async function getStats(uid: string) {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];
  const todayStr = today.toISOString().split("T")[0];

  // Weekly pages from reading sessions
  const weekSessions = await sessionsRef(uid)
    .where("type", "==", "reading")
    .where("date", ">=", weekAgoStr)
    .where("date", "<=", todayStr)
    .get();

  let weeklyPages = 0;
  weekSessions.forEach(doc => {
    const d = doc.data();
    if (d.fromPage && d.toPage) weeklyPages += d.toPage - d.fromPage + 1;
  });

  // Total memorized surahs
  const hifzSnapshot = await hifzRef(uid).where("status", "==", "memorized").get();
  const totalMemorized = hifzSnapshot.size;

  // Reviews due today
  const reviewsDueSnapshot = await hifzRef(uid)
    .where("nextReviewDate", "<=", todayStr)
    .where("status", "in", ["memorized", "needs_review", "in_progress"])
    .get();
  const reviewsDue = reviewsDueSnapshot.size;

  return { weeklyPages, totalMemorized, reviewsDue };
}
