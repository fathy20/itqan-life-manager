// ═══════════════════════════════════════════════════════════════
//  backend/src/modules/adhkar/adhkar.service.ts
//  Adhkar Service — Daily dhikr logs, counters, stats
// ═══════════════════════════════════════════════════════════════

import { db } from "../../lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// ─── Collection ref ──────────────────────────────────────────
const adhkarRef = (uid: string) => db.collection("users").doc(uid).collection("adhkar_logs");

// ─── Default log structure ───────────────────────────────────
function defaultLog(date: string) {
  return {
    date,
    morning: { completed: false },
    evening: { completed: false },
    afterPrayer: { count: 0 },
    sleep: { completed: false },
    istighfar: 0,
    salawat: 0,
    customCounters: {},
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

// ─── Get Today ───────────────────────────────────────────────
export async function getToday(uid: string) {
  const today = new Date().toISOString().split("T")[0];
  const docRef = adhkarRef(uid).doc(today);
  const doc = await docRef.get();

  if (!doc.exists) {
    const log = defaultLog(today);
    await docRef.set(log);
    return log;
  }

  return { date: today, ...(doc.data() || {}) };
}

// ─── Log Block ───────────────────────────────────────────────
export async function logBlock(
  uid: string,
  date: string,
  block: "morning" | "evening" | "sleep" | "afterPrayer"
) {
  const docRef = adhkarRef(uid).doc(date);
  const doc = await docRef.get();

  const completedAt = new Date().toISOString();

  let update: Record<string, any>;
  if (block === "afterPrayer") {
    update = {
      "afterPrayer.count": FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    };
  } else {
    update = {
      [`${block}.completed`]: true,
      [`${block}.completedAt`]: completedAt,
      updatedAt: FieldValue.serverTimestamp(),
    };
  }

  if (!doc.exists) {
    await docRef.set({ ...defaultLog(date), ...update });
  } else {
    await docRef.update(update);
  }
}

// ─── Update Counter ──────────────────────────────────────────
export async function updateCounter(
  uid: string,
  date: string,
  counter: string,
  value: number
) {
  const docRef = adhkarRef(uid).doc(date);
  const doc = await docRef.get();

  let update: Record<string, any>;

  if (counter === "istighfar" || counter === "salawat") {
    update = { [counter]: value, updatedAt: FieldValue.serverTimestamp() };
  } else {
    update = { [`customCounters.${counter}`]: value, updatedAt: FieldValue.serverTimestamp() };
  }

  if (!doc.exists) {
    await docRef.set({ ...defaultLog(date), ...update });
  } else {
    await docRef.update(update);
  }
}

// ─── Stats ───────────────────────────────────────────────────
export async function getStats(uid: string, period: "week" | "month") {
  const daysBack = period === "week" ? 7 : 30;
  const dates: string[] = [];
  for (let i = 0; i < daysBack; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }

  const startDate = dates[dates.length - 1];
  const endDate = dates[0];

  const snapshot = await adhkarRef(uid)
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .get();

  let morningCompleted = 0;
  let eveningCompleted = 0;
  let sleepCompleted = 0;
  let afterPrayerDone = 0;
  let streak = 0;
  let streakBroken = false;

  const logsByDate: Record<string, any> = {};
  snapshot.forEach(doc => {
    logsByDate[doc.id] = doc.data();
  });

  for (const date of dates) {
    const log = logsByDate[date];
    if (!log) {
      if (!streakBroken) streakBroken = true;
      continue;
    }
    if (log.morning?.completed) morningCompleted++;
    if (log.evening?.completed) eveningCompleted++;
    if (log.sleep?.completed) sleepCompleted++;
    if ((log.afterPrayer?.count || 0) > 0) afterPrayerDone++;

    const dayComplete = log.morning?.completed && log.evening?.completed;
    if (dayComplete && !streakBroken) streak++;
    else if (!dayComplete) streakBroken = true;
  }

  const total = snapshot.size || 1;

  return {
    completionRate: Math.round(((morningCompleted + eveningCompleted) / (daysBack * 2)) * 100),
    streak,
    morningRate: Math.round((morningCompleted / daysBack) * 100),
    eveningRate: Math.round((eveningCompleted / daysBack) * 100),
    sleepRate: Math.round((sleepCompleted / daysBack) * 100),
    afterPrayerRate: Math.round((afterPrayerDone / daysBack) * 100),
    period,
  };
}
