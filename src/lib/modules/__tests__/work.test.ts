import { describe, expect, it } from "vitest";
import {
  clampProgress,
  courseProgress,
  courseTotals,
  isTaskDone,
  nextCompletedLessons,
  nextProjectProgress,
  splitTasks,
} from "../work";

describe("work module", () => {
  it("identifies done tasks from both legacy status and completed boolean", () => {
    expect(isTaskDone({ status: "completed" })).toBe(true);
    expect(isTaskDone({ completed: true })).toBe(true);
    expect(isTaskDone({ status: "todo", completed: false })).toBe(false);
  });

  it("splits tasks into pending and done lists", () => {
    const result = splitTasks([
      { id: "t1", title: "A", type: "work", status: "todo" },
      { id: "t2", title: "B", type: "work", status: "completed" },
      { id: "t3", title: "C", type: "work", completed: true },
    ]);

    expect(result.pending.map((task) => task.id)).toEqual(["t1"]);
    expect(result.done.map((task) => task.id)).toEqual(["t2", "t3"]);
  });

  it("clamps project progress updates", () => {
    expect(clampProgress(-20)).toBe(0);
    expect(clampProgress(120)).toBe(100);
    expect(nextProjectProgress(95, 10)).toBe(100);
    expect(nextProjectProgress(5, -10)).toBe(0);
  });

  it("calculates course totals from lessons or legacy hours", () => {
    expect(courseTotals({ id: "c1", name: "React", totalLessons: 20, completedLessons: 5 })).toEqual({ total: 20, completed: 5 });
    expect(courseTotals({ id: "c2", name: "API", totalHours: 10, completedHours: 3 })).toEqual({ total: 10, completed: 3 });
  });

  it("calculates and clamps course progress", () => {
    expect(courseProgress({ id: "c1", name: "React", totalLessons: 20, completedLessons: 5 })).toBe(25);
    expect(courseProgress({ id: "c2", name: "React", totalLessons: 20, completedLessons: 40 })).toBe(100);
    expect(courseProgress({ id: "c3", name: "React", progress: 33 })).toBe(33);
  });

  it("clamps course lesson increments", () => {
    const course = { id: "c1", name: "React", totalLessons: 3, completedLessons: 2 };
    expect(nextCompletedLessons(course, 1)).toBe(3);
    expect(nextCompletedLessons(course, 5)).toBe(3);
    expect(nextCompletedLessons(course, -5)).toBe(0);
  });
});
