import { db } from "../../lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const halaqahRef = () => db.collection("halaqahs");
const userHalaqahRef = (uid: string) => db.collection("users").doc(uid).collection("halaqahs");

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createHalaqah(uid: string, name: string) {
  const inviteCode = generateInviteCode();
  const halaqah = {
    name,
    createdBy: uid,
    inviteCode,
    maxMembers: 10,
    members: [uid],
    settings: { showStreaks: true, showRanks: true, showWeeklyRing: true, enableDuaWall: true, enableNaseeha: true, challengeFrequency: "weekly" },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  const ref = await halaqahRef().add(halaqah);
  await userHalaqahRef(uid).doc(ref.id).set({ halaqahId: ref.id, joinedAt: FieldValue.serverTimestamp() });
  return { id: ref.id, ...halaqah, inviteCode };
}

export async function joinHalaqah(uid: string, inviteCode: string) {
  const snap = await halaqahRef().where("inviteCode", "==", inviteCode.toUpperCase()).limit(1).get();
  if (snap.empty) throw new Error("Invalid invite code");
  const doc = snap.docs[0];
  const data = doc.data();
  if (data.members.includes(uid)) throw new Error("Already a member");
  if (data.members.length >= data.maxMembers) throw new Error("Halaqah is full");
  await doc.ref.update({ members: FieldValue.arrayUnion(uid), updatedAt: FieldValue.serverTimestamp() });
  await userHalaqahRef(uid).doc(doc.id).set({ halaqahId: doc.id, joinedAt: FieldValue.serverTimestamp() });
  return { id: doc.id, name: data.name };
}

export async function leaveHalaqah(uid: string, halaqahId: string) {
  await halaqahRef().doc(halaqahId).update({ members: FieldValue.arrayRemove(uid), updatedAt: FieldValue.serverTimestamp() });
  await userHalaqahRef(uid).doc(halaqahId).delete();
}

export async function getUserHalaqahs(uid: string) {
  const snap = await userHalaqahRef(uid).get();
  const halaqahs = await Promise.all(snap.docs.map(async d => {
    const h = await halaqahRef().doc(d.data().halaqahId).get();
    if (!h.exists) return null;
    const data = h.data()!;
    return { id: h.id, name: data.name, memberCount: data.members.length, inviteCode: data.inviteCode, createdBy: data.createdBy === uid };
  }));
  return halaqahs.filter(Boolean);
}

// PRIVACY: leaderboard returns ONLY rank, ring, streak — NEVER score breakdown
export async function getLeaderboard(halaqahId: string) {
  const halaqah = await halaqahRef().doc(halaqahId).get();
  if (!halaqah.exists) throw new Error("Halaqah not found");
  const members = halaqah.data()!.members as string[];

  const leaderboard = await Promise.all(members.map(async uid => {
    const profileSnap = await db.collection("users").doc(uid).get();
    const sharedSnap = await db.collection("users").doc(uid).collection("meta").doc("shared_score").get();
    const profile = profileSnap.data() || {};
    const shared = sharedSnap.data() || {};
    // NEVER return score breakdown, prayer details, or quran pages
    return {
      displayName: profile.displayName || "Member",
      rankTitle: shared.rankTitle || "مبتدئ",
      weeklyRingPercent: shared.weeklyRingPercent || 0,
      streakDays: shared.streakDays || 0,
    };
  }));

  return leaderboard.sort((a, b) => b.weeklyRingPercent - a.weeklyRingPercent);
}

// Du'a wall — authorUid stored but NEVER returned
export async function getDuas(halaqahId: string) {
  const snap = await halaqahRef().doc(halaqahId).collection("duas").orderBy("createdAt", "desc").limit(20).get();
  return snap.docs.map(d => {
    const data = d.data();
    // NEVER return authorUid
    return { id: d.id, text: data.text, duaCount: data.duaCount || 0, createdAt: data.createdAt };
  });
}

export async function addDua(halaqahId: string, uid: string, text: string) {
  const ref = await halaqahRef().doc(halaqahId).collection("duas").add({
    text, authorUid: uid, // stored but never returned
    duaCount: 0, isAnonymous: true,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { id: ref.id, text, duaCount: 0 };
}

export async function prayForDua(halaqahId: string, duaId: string) {
  await halaqahRef().doc(halaqahId).collection("duas").doc(duaId).update({ duaCount: FieldValue.increment(1) });
}

// Naseeha — anonymous encouragement
export async function sendNaseeha(halaqahId: string, uid: string, text: string) {
  await halaqahRef().doc(halaqahId).collection("naseeha").add({
    text, authorUid: uid, // stored but never returned
    isAnonymous: true, createdAt: FieldValue.serverTimestamp(),
  });
}

export async function getChallenge(halaqahId: string) {
  const snap = await halaqahRef().doc(halaqahId).collection("challenges").orderBy("createdAt", "desc").limit(1).get();
  if (snap.empty) return null;
  const data = snap.docs[0].data();
  // Return group aggregate only — not individual completions
  const completions = data.completions || {};
  const completedCount = Object.values(completions).filter(Boolean).length;
  return {
    id: snap.docs[0].id,
    description: data.description,
    descriptionAr: data.descriptionAr,
    startDate: data.startDate,
    endDate: data.endDate,
    type: data.type,
    completedCount,
    totalMembers: Object.keys(completions).length,
  };
}

export async function completeChallenge(halaqahId: string, challengeId: string, uid: string) {
  await halaqahRef().doc(halaqahId).collection("challenges").doc(challengeId).update({ [`completions.${uid}`]: true });
}
