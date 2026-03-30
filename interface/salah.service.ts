// ═══════════════════════════════════════════════════════════════
//  backend/src/modules/salah/salah.service.ts
//  Salah Service — Firestore CRUD + Prayer Times API
//  This is the PATTERN for all other modules
// ═══════════════════════════════════════════════════════════════

import { db } from "../../config/firebase";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { DayPrayerLog, PrayerName, PrayerStatus, PrayerTimes, PrayerStats } from "../../../../shared/types";

// ─── Helper: get user's prayer collection ref ────────────────
const prayersRef = (uid: string) => db.collection("users").doc(uid).collection("prayers");

// ─── Fetch Prayer Times from Aladhan API ─────────────────────
export async function getPrayerTimes(
  lat: number,
  lng: number,
  method: number = 5, // Egyptian General Authority
  date?: string
): Promise<PrayerTimes> {
  const d = date || new Date().toISOString().split("T")[0];
  const [year, month, day] = d.split("-");

  const url = `http://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lng}&method=${method}`;

  const res = await fetch(url);
  const json = await res.json();

  if (json.code !== 200) {
    throw new Error("Failed to fetch prayer times");
  }

  const t = json.data.timings;

  return {
    fajr: t.Fajr,
    sunrise: t.Sunrise,
    dhuhr: t.Dhuhr,
    asr: t.Asr,
    maghrib: t.Maghrib,
    isha: t.Isha,
    date: d,
  };
}

// ─── Get Prayer Log for a Date ───────────────────────────────
export async function getPrayerLog(uid: string, date: string): Promise<DayPrayerLog | null> {
  const doc = await prayersRef(uid).doc(date).get();
  if (!doc.exists) return null;
  return { date, ...doc.data() } as DayPrayerLog;
}

// ─── Log a Prayer ────────────────────────────────────────────
export async function logPrayer(
  uid: string,
  date: string,
  prayer: PrayerName,
  status: PrayerStatus,
  options?: {
    jamaah?: boolean;
    sunnahBefore?: boolean;
    sunnahAfter?: boolean;
  }
): Promise<void> {
  const docRef = prayersRef(uid).doc(date);
  const doc = await docRef.get();

  const prayerData = {
    status,
    jamaah: options?.jamaah || false,
    sunnahBefore: options?.sunnahBefore || false,
    sunnahAfter: options?.sunnahAfter || false,
    loggedAt: new Date().toISOString(),
  };

  if (doc.exists) {
    // Update existing document
    await docRef.update({
      [`prayers.${prayer}`]: prayerData,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    // Create new document for today
    const defaultPrayers: Record<PrayerName, any> = {
      fajr: { status: "pending", jamaah: false },
      dhuhr: { status: "pending", jamaah: false },
      asr: { status: "pending", jamaah: false },
      maghrib: { status: "pending", jamaah: false },
      isha: { status: "pending", jamaah: false },
    };
    defaultPrayers[prayer] = prayerData;

    await docRef.set({
      prayers: defaultPrayers,
      witr: false,
      qiyam: false,
      duha: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

// ─── Log Extra Prayer (Witr/Qiyam/Duha) ─────────────────────
export async function logExtraPrayer(
  uid: string,
  date: string,
  type: "witr" | "qiyam" | "duha",
  done: boolean
): Promise<void> {
  const docRef = prayersRef(uid).doc(date);
  await docRef.set(
    { [type]: done, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
}

// ─── Get Prayer Stats ────────────────────────────────────────
export async function getPrayerStats(uid: string, period: "week" | "month"): Promise<PrayerStats> {
  const daysBack = period === "week" ? 7 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startStr = startDate.toISOString().split("T")[0];

  const snapshot = await prayersRef(uid)
    .where("createdAt", ">=", Timestamp.fromDate(startDate))
    .get();

  let totalPrayed = 0;
  let totalOnTime = 0;
  let totalJamaah = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.prayers) return;

    const prayers: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
    prayers.forEach(p => {
      const prayer = data.prayers[p];
      if (!prayer) return;

      if (prayer.status === "onTime" || prayer.status === "late" || prayer.status === "qada") {
        totalPrayed++;
      }
      if (prayer.status === "onTime") totalOnTime++;
      if (prayer.jamaah) totalJamaah++;
    });
  });

  const totalPossible = daysBack * 5;

  return {
    onTimeRate: totalPossible > 0 ? Math.round((totalOnTime / totalPossible) * 100) : 0,
    jamaahRate: totalPrayed > 0 ? Math.round((totalJamaah / totalPrayed) * 100) : 0,
    totalPrayed,
    totalOnTime,
    totalJamaah,
    period,
  };
}

// ─── Qada Counter ────────────────────────────────────────────
export async function getQadaCount(uid: string) {
  const doc = await db.collection("users").doc(uid).collection("salah_meta").doc("qada").get();
  if (!doc.exists) return { total: 0, completed: 0, remaining: 0 };
  const data = doc.data()!;
  return {
    total: data.totalOwed || 0,
    completed: data.completed || 0,
    remaining: (data.totalOwed || 0) - (data.completed || 0),
  };
}

export async function updateQadaCount(uid: string, delta: number) {
  const docRef = db.collection("users").doc(uid).collection("salah_meta").doc("qada");
  const doc = await docRef.get();

  if (!doc.exists) {
    await docRef.set({
      totalOwed: Math.max(0, delta > 0 ? delta : 0),
      completed: delta < 0 ? Math.abs(delta) : 0,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    // delta < 0 means user prayed a qada (decrease remaining)
    if (delta < 0) {
      await docRef.update({
        completed: FieldValue.increment(Math.abs(delta)),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      await docRef.update({
        totalOwed: FieldValue.increment(delta),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }
}
