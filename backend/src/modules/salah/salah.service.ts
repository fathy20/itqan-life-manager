// ═══════════════════════════════════════════════════════════════
//  backend/src/modules/salah/salah.service.ts
//  Salah Service — Firestore CRUD + Prayer Times API
// ═══════════════════════════════════════════════════════════════

import { db } from "../../lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export type PrayerStatus = "onTime" | "late" | "qada" | "missed" | "pending";

const prayersRef = (uid: string) => db.collection("users").doc(uid).collection("prayers");

export async function getPrayerTimes(
  lat: number,
  lng: number,
  method: number = 5,
  date?: string
) {
  const d = date || new Date().toISOString().split("T")[0];
  const [year, month, day] = d.split("-");
  const url = `http://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lng}&method=${method}`;
  const res = await fetch(url);
  const json = await res.json() as any;
  if (json.code !== 200) throw new Error("Failed to fetch prayer times");
  const t = json.data.timings;
  return { fajr: t.Fajr, sunrise: t.Sunrise, dhuhr: t.Dhuhr, asr: t.Asr, maghrib: t.Maghrib, isha: t.Isha, date: d };
}

export async function getPrayerLog(uid: string, date: string) {
  const doc = await prayersRef(uid).doc(date).get();
  if (!doc.exists) return null;
  return { date, ...doc.data() };
}

export async function logPrayer(
  uid: string,
  date: string,
  prayer: PrayerName,
  status: PrayerStatus,
  options?: { jamaah?: boolean; sunnahBefore?: boolean; sunnahAfter?: boolean }
) {
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
    await docRef.update({ [`prayers.${prayer}`]: prayerData, updatedAt: FieldValue.serverTimestamp() });
  } else {
    const defaultPrayers: Record<string, any> = {
      fajr: { status: "pending", jamaah: false },
      dhuhr: { status: "pending", jamaah: false },
      asr: { status: "pending", jamaah: false },
      maghrib: { status: "pending", jamaah: false },
      isha: { status: "pending", jamaah: false },
    };
    defaultPrayers[prayer] = prayerData;
    await docRef.set({ prayers: defaultPrayers, witr: false, qiyam: false, duha: false, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  }
}

export async function logExtraPrayer(uid: string, date: string, type: "witr" | "qiyam" | "duha", done: boolean) {
  const docRef = prayersRef(uid).doc(date);
  await docRef.set({ [type]: done, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function getPrayerStats(uid: string, period: "week" | "month") {
  const daysBack = period === "week" ? 7 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const snapshot = await prayersRef(uid).where("createdAt", ">=", Timestamp.fromDate(startDate)).get();
  let totalPrayed = 0, totalOnTime = 0, totalJamaah = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.prayers) return;
    (["fajr", "dhuhr", "asr", "maghrib", "isha"] as PrayerName[]).forEach(p => {
      const prayer = data.prayers[p];
      if (!prayer) return;
      if (["onTime", "late", "qada"].includes(prayer.status)) totalPrayed++;
      if (prayer.status === "onTime") totalOnTime++;
      if (prayer.jamaah) totalJamaah++;
    });
  });
  const totalPossible = daysBack * 5;
  return {
    onTimeRate: totalPossible > 0 ? Math.round((totalOnTime / totalPossible) * 100) : 0,
    jamaahRate: totalPrayed > 0 ? Math.round((totalJamaah / totalPrayed) * 100) : 0,
    totalPrayed, totalOnTime, totalJamaah, period,
  };
}

export async function getQadaCount(uid: string) {
  const doc = await db.collection("users").doc(uid).collection("salah_meta").doc("qada").get();
  if (!doc.exists) return { total: 0, completed: 0, remaining: 0 };
  const data = doc.data()!;
  return { total: data.totalOwed || 0, completed: data.completed || 0, remaining: (data.totalOwed || 0) - (data.completed || 0) };
}

export async function updateQadaCount(uid: string, delta: number) {
  const docRef = db.collection("users").doc(uid).collection("salah_meta").doc("qada");
  const doc = await docRef.get();
  if (!doc.exists) {
    await docRef.set({ totalOwed: Math.max(0, delta > 0 ? delta : 0), completed: delta < 0 ? Math.abs(delta) : 0, updatedAt: FieldValue.serverTimestamp() });
  } else {
    if (delta < 0) {
      await docRef.update({ completed: FieldValue.increment(Math.abs(delta)), updatedAt: FieldValue.serverTimestamp() });
    } else {
      await docRef.update({ totalOwed: FieldValue.increment(delta), updatedAt: FieldValue.serverTimestamp() });
    }
  }
}
