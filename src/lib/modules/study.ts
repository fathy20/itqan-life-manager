import type { LegacySubject } from "../../types";

export type StudyRisk = "safe" | "warning" | "danger";

export const difficultyLabels = ["", "سهل جدًا", "سهل", "متوسط", "صعب", "صعب جدًا"];
export const difficultyColors = ["", "#10b981", "#34d399", "#fbbf24", "#fb923c", "#f87171"];

export function todayIso(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function normalizeDifficulty(value: LegacySubject["difficulty"]) {
  if (typeof value === "number") return Math.min(5, Math.max(1, value));
  if (value === "easy") return 2;
  if (value === "hard") return 4;
  return 3;
}

export function daysUntilExam(examDate?: string, now = Date.now()) {
  if (!examDate) return 0;
  const examTime = new Date(examDate).getTime();
  if (!Number.isFinite(examTime)) return 0;
  return Math.max(0, Math.ceil((examTime - now) / 86400000));
}

export function subjectProgress(subject: Pick<LegacySubject, "totalLectures" | "completedLectures">) {
  const total = Math.max(0, Number(subject.totalLectures) || 0);
  const completed = Math.min(total, Math.max(0, Number(subject.completedLectures) || 0));
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function remainingLectures(subject: Pick<LegacySubject, "totalLectures" | "completedLectures">) {
  const total = Math.max(0, Number(subject.totalLectures) || 0);
  const completed = Math.min(total, Math.max(0, Number(subject.completedLectures) || 0));
  return Math.max(0, total - completed);
}

export function dailyLectureLoad(subject: Pick<LegacySubject, "totalLectures" | "completedLectures" | "examDate">, now = Date.now()) {
  const remaining = remainingLectures(subject);
  const days = daysUntilExam(subject.examDate, now);
  return days > 0 ? Math.ceil(remaining / days) : remaining;
}

export function studyRisk(subject: Pick<LegacySubject, "totalLectures" | "completedLectures" | "examDate">, now = Date.now()): StudyRisk {
  const load = dailyLectureLoad(subject, now);
  if (load > 4) return "danger";
  if (load > 2) return "warning";
  return "safe";
}

export function nextCompletedLectures(
  subject: Pick<LegacySubject, "totalLectures" | "completedLectures">,
  delta: number,
) {
  const total = Math.max(0, Number(subject.totalLectures) || 0);
  const completed = Math.max(0, Number(subject.completedLectures) || 0);
  return Math.min(total, Math.max(0, completed + delta));
}
