import { describe, expect, it } from "vitest";
import {
  dailyLectureLoad,
  daysUntilExam,
  nextCompletedLectures,
  normalizeDifficulty,
  remainingLectures,
  studyRisk,
  subjectProgress,
  todayIso,
} from "../study";

describe("study module", () => {
  const baseNow = new Date("2026-05-22T00:00:00.000Z").getTime();

  it("normalizes legacy and numeric difficulty values", () => {
    expect(normalizeDifficulty("easy")).toBe(2);
    expect(normalizeDifficulty("hard")).toBe(4);
    expect(normalizeDifficulty(99)).toBe(5);
    expect(normalizeDifficulty(-2)).toBe(1);
    expect(normalizeDifficulty(undefined)).toBe(3);
  });

  it("calculates days until exam without returning negative values", () => {
    expect(daysUntilExam("2026-05-25", baseNow)).toBe(3);
    expect(daysUntilExam("2026-05-20", baseNow)).toBe(0);
    expect(daysUntilExam("bad-date", baseNow)).toBe(0);
  });

  it("calculates progress and remaining lectures safely", () => {
    expect(subjectProgress({ totalLectures: 10, completedLectures: 4 })).toBe(40);
    expect(subjectProgress({ totalLectures: 0, completedLectures: 4 })).toBe(0);
    expect(subjectProgress({ totalLectures: 10, completedLectures: 99 })).toBe(100);
    expect(remainingLectures({ totalLectures: 10, completedLectures: 4 })).toBe(6);
  });

  it("calculates daily load and exam risk", () => {
    const safe = { totalLectures: 10, completedLectures: 4, examDate: "2026-05-25" };
    const warning = { totalLectures: 10, completedLectures: 1, examDate: "2026-05-25" };
    const danger = { totalLectures: 20, completedLectures: 0, examDate: "2026-05-25" };

    expect(dailyLectureLoad(safe, baseNow)).toBe(2);
    expect(studyRisk(safe, baseNow)).toBe("safe");
    expect(studyRisk(warning, baseNow)).toBe("warning");
    expect(studyRisk(danger, baseNow)).toBe("danger");
  });

  it("clamps lecture increment and decrement", () => {
    expect(nextCompletedLectures({ totalLectures: 5, completedLectures: 5 }, 1)).toBe(5);
    expect(nextCompletedLectures({ totalLectures: 5, completedLectures: 0 }, -1)).toBe(0);
    expect(nextCompletedLectures({ totalLectures: 5, completedLectures: 2 }, 1)).toBe(3);
  });

  it("formats today's ISO date for form defaults", () => {
    expect(todayIso(new Date("2026-05-22T10:30:00.000Z"))).toBe("2026-05-22");
  });
});
