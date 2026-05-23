import type { LegacyCourse, LegacyTask } from "../../types";

export const typeLabels: Record<string, string> = {
  job: "وظيفة",
  work: "عمل",
  freelance: "فريلانس",
  study: "دراسة",
  personal: "شخصي",
  worship: "عبادة",
  health: "صحة",
};

export const typeColors: Record<string, string> = {
  job: "#3b82f6",
  work: "#f97316",
  freelance: "#10b981",
  study: "#8b5cf6",
  personal: "#f59e0b",
  worship: "#06b6d4",
  health: "#ec4899",
};

export function isTaskDone(task: Pick<LegacyTask, "status" | "completed">) {
  return task.status === "completed" || task.completed === true;
}

export function splitTasks(tasks: LegacyTask[]) {
  return {
    pending: tasks.filter((task) => !isTaskDone(task)),
    done: tasks.filter(isTaskDone),
  };
}

export function clampProgress(value: unknown) {
  const progress = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(progress)) return 0;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function nextProjectProgress(current: unknown, delta: number) {
  return clampProgress((typeof current === "number" ? current : Number(current) || 0) + delta);
}

export function courseTotals(course: LegacyCourse) {
  const total = Math.max(0, Number(course.totalLessons ?? course.totalHours ?? 0) || 0);
  const completed = Math.min(total, Math.max(0, Number(course.completedLessons ?? course.completedHours ?? 0) || 0));

  return { total, completed };
}

export function courseProgress(course: LegacyCourse) {
  const { total, completed } = courseTotals(course);
  if (total > 0) return clampProgress((completed / total) * 100);
  return clampProgress(course.progress);
}

export function nextCompletedLessons(course: LegacyCourse, delta: number) {
  const { total, completed } = courseTotals(course);
  return Math.min(total, Math.max(0, completed + delta));
}
