import { describe, expect, it } from "vitest";
import { EMPTY_STATE } from "../../constants";
import { parseStoredAppState, resolveStoredState, sanitizeAppState } from "../app-state";

describe("app-state data integrity", () => {
  it("fills missing collections with safe defaults", () => {
    const state = sanitizeAppState({
      profile: { name: "Fathy" },
      monthlySalary: "3000",
      tasks: null,
      subjects: [{ id: "s1", name: "Math" }],
    });

    expect(state.profile.name).toBe("Fathy");
    expect(state.profile.onboardingCompleted).toBe(true);
    expect(state.monthlySalary).toBe(3000);
    expect(state.tasks).toEqual([]);
    expect(state.subjects).toHaveLength(1);
    expect(state.transactions).toEqual([]);
  });

  it("does not allow invalid salary values into the database shape", () => {
    const state = sanitizeAppState({ monthlySalary: -100 });
    expect(state.monthlySalary).toBe(0);
  });

  it("falls back to null for corrupted localStorage payloads", () => {
    expect(parseStoredAppState("{broken-json")).toBeNull();
  });

  it("prefers local completed onboarding over stale remote onboarding", () => {
    const local = sanitizeAppState({
      ...EMPTY_STATE,
      profile: { ...EMPTY_STATE.profile, name: "Fathy", onboardingCompleted: true },
    });
    const remote = sanitizeAppState({
      ...EMPTY_STATE,
      profile: { ...EMPTY_STATE.profile, name: "Fathy", onboardingCompleted: false },
    });

    const resolved = resolveStoredState(remote, local);

    expect(resolved.source).toBe("local");
    expect(resolved.state.profile.onboardingCompleted).toBe(true);
  });

  it("prefers remote when remote is already complete", () => {
    const local = sanitizeAppState({
      ...EMPTY_STATE,
      profile: { ...EMPTY_STATE.profile, name: "Local", onboardingCompleted: true },
    });
    const remote = sanitizeAppState({
      ...EMPTY_STATE,
      profile: { ...EMPTY_STATE.profile, name: "Remote", onboardingCompleted: true },
    });

    const resolved = resolveStoredState(remote, local);

    expect(resolved.source).toBe("remote");
    expect(resolved.state.profile.name).toBe("Remote");
  });
});
