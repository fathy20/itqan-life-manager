// ═══════════════════════════════════════════════════════════════
//  backend/src/modules/fasting/fasting.service.ts
//  Fasting Service — Fasting days, qada, suggestions
// ═══════════════════════════════════════════════════════════════

import { db } from "../../lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// ─── Collection refs ─────────────────────────────────────────
const fastingRef = (uid: string) => db.collection("users").doc(uid).collection("fasting_days");
const qadaRef = (uid: string) => db.collection("users").doc(uid).collection("fasting_meta").doc("qada");

export type FastingType =
  | "ramadan" | "monday_thursday" | "ayyam_beed"
  | "arafah" | "ashura" | "shawwal" | "qada" | "voluntary";

// ─── Get Month ───────────────────────────────────────────────
export async function getMonth(uid: string, year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  const snapshot = await fastingRef(uid)
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .orderBy("date", "asc")
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ─── Log Day ─────────────────────────────────────────────────
export async function logDay(uid: string, data: {
  date: string;
  type: FastingType;
  completed: boolean;
  notes?: string;
}) {
  const docRef = fastingRef(uid).doc(data.date);
  const doc = await docRef.get();

  const payload = {
    date: data.date,
    type: data.type,
    completed: data.completed,
    notes: data.notes || null,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (doc.exists) {
    await docRef.update(payload);
  } else {
    await docRef.set({ ...payload, createdAt: FieldValue.serverTimestamp() });
  }

  return { date: data.date, type: payload.type, completed: payload.completed };
}

// ─── Qada ────────────────────────────────────────────────────
export async function getQada(uid: string) {
  const doc = await qadaRef(uid).get();
  if (!doc.exists) return { totalOwed: 0, completed: 0, remaining: 0 };
  const data = doc.data()!;
  return {
    totalOwed: data.totalOwed || 0,
    completed: data.completed || 0,
    remaining: (data.totalOwed || 0) - (data.completed || 0),
  };
}

export async function updateQada(uid: string, delta: number) {
  const doc = await qadaRef(uid).get();

  if (!doc.exists) {
    await qadaRef(uid).set({
      totalOwed: delta > 0 ? delta : 0,
      completed: delta < 0 ? Math.abs(delta) : 0,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } else {
    if (delta > 0) {
      // Adding more owed days
      await qadaRef(uid).update({
        totalOwed: FieldValue.increment(delta),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      // Completing qada days
      await qadaRef(uid).update({
        completed: FieldValue.increment(Math.abs(delta)),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }
}

// ─── Suggestions ─────────────────────────────────────────────
// Returns upcoming recommended fasting days for the next 30 days
export async function getSuggestions(uid: string) {
  const suggestions: { date: string; type: FastingType; label: string; labelAr: string }[] = [];
  const today = new Date();

  for (let i = 0; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ..., 4=Thu

    // Monday (1) and Thursday (4)
    if (dayOfWeek === 1) {
      suggestions.push({ date: dateStr, type: "monday_thursday", label: "Monday Fast", labelAr: "صيام الاثنين" });
    } else if (dayOfWeek === 4) {
      suggestions.push({ date: dateStr, type: "monday_thursday", label: "Thursday Fast", labelAr: "صيام الخميس" });
    }
  }

  // Ayyam al-Beed: 13th, 14th, 15th of Hijri month
  // We approximate using a simple Hijri offset (1 Muharram 1446 = July 7, 2024)
  const hijriSuggestions = getAyyamAlBeedDates(today);
  suggestions.push(...hijriSuggestions);

  // Arafah (9 Dhul Hijjah) and Ashura (10 Muharram) — static approximations for current year
  const specialDays = getSpecialFastingDays(today.getFullYear());
  suggestions.push(...specialDays);

  // Remove duplicates and sort
  const unique = suggestions
    .filter((s, idx, arr) => arr.findIndex(x => x.date === s.date) === idx)
    .filter(s => s.date >= today.toISOString().split("T")[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 15);

  return unique;
}

// ─── Helpers ─────────────────────────────────────────────────

function getAyyamAlBeedDates(today: Date) {
  const results: { date: string; type: FastingType; label: string; labelAr: string }[] = [];
  // Approximate: Hijri month starts roughly every 29.5 days
  // We generate 13th, 14th, 15th of the current and next Gregorian month as approximation
  for (let monthOffset = 0; monthOffset <= 1; monthOffset++) {
    const base = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    // Approximate Hijri 13th-15th as Gregorian 11th-13th of the month (rough offset)
    for (const day of [11, 12, 13]) {
      const d = new Date(base.getFullYear(), base.getMonth(), day);
      results.push({
        date: d.toISOString().split("T")[0],
        type: "ayyam_beed",
        label: `Ayyam al-Beed (${day}th)`,
        labelAr: `أيام البيض (${day})`,
      });
    }
  }
  return results;
}

function getSpecialFastingDays(year: number) {
  // Approximate Gregorian dates for 2024-2025
  // These should ideally come from a Hijri calendar library
  const specialDays: Record<number, { arafah: string; ashura: string }> = {
    2024: { arafah: "2024-06-15", ashura: "2024-07-16" },
    2025: { arafah: "2025-06-05", ashura: "2025-07-05" },
    2026: { arafah: "2026-05-26", ashura: "2026-06-24" },
  };

  const days = specialDays[year];
  if (!days) return [];

  return [
    { date: days.arafah, type: "arafah" as FastingType, label: "Day of Arafah", labelAr: "يوم عرفة" },
    { date: days.ashura, type: "ashura" as FastingType, label: "Day of Ashura", labelAr: "يوم عاشوراء" },
  ];
}
