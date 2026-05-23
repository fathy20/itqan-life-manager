import { EMPTY_STATE } from "../constants";
import type { AppState } from "../types";

export type StoredStateSource = "remote" | "local" | "empty";

export interface ResolvedStoredState {
  source: StoredStateSource;
  state: AppState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(Boolean) as T[]) : [];
}

function asNumber(value: unknown, fallback = 0) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function sanitizeProfile(value: unknown): AppState["profile"] {
  const profile = isRecord(value) ? value : {};
  const name = typeof profile.name === "string" ? profile.name : EMPTY_STATE.profile.name;
  const onboardingCompleted =
    typeof profile.onboardingCompleted === "boolean"
      ? profile.onboardingCompleted
      : Boolean(name.trim());

  return {
    ...EMPTY_STATE.profile,
    ...profile,
    name,
    university: typeof profile.university === "string" ? profile.university : EMPTY_STATE.profile.university,
    faculty: typeof profile.faculty === "string" ? profile.faculty : EMPTY_STATE.profile.faculty,
    program: typeof profile.program === "string" ? profile.program : EMPTY_STATE.profile.program,
    level: typeof profile.level === "string" ? profile.level : EMPTY_STATE.profile.level,
    semester: typeof profile.semester === "string" ? profile.semester : EMPTY_STATE.profile.semester,
    role: typeof profile.role === "string" ? profile.role : EMPTY_STATE.profile.role,
    timezone: typeof profile.timezone === "string" ? profile.timezone : EMPTY_STATE.profile.timezone,
    locale: typeof profile.locale === "string" ? profile.locale : EMPTY_STATE.profile.locale,
    onboardingCompleted,
  };
}

function sanitizeTelegram(value: unknown): AppState["telegram"] {
  const telegram = isRecord(value) ? value : {};
  const preferences = isRecord(telegram.preferences) ? telegram.preferences : {};

  return {
    ...EMPTY_STATE.telegram,
    ...telegram,
    enabled: Boolean(telegram.enabled),
    style: typeof telegram.style === "string" ? telegram.style : EMPTY_STATE.telegram.style,
    preferences: {
      ...EMPTY_STATE.telegram.preferences,
      ...preferences,
      morningMessage: typeof preferences.morningMessage === "boolean" ? preferences.morningMessage : EMPTY_STATE.telegram.preferences.morningMessage,
      prayerReminders: typeof preferences.prayerReminders === "boolean" ? preferences.prayerReminders : EMPTY_STATE.telegram.preferences.prayerReminders,
      studyPush: typeof preferences.studyPush === "boolean" ? preferences.studyPush : EMPTY_STATE.telegram.preferences.studyPush,
      celebrateWins: typeof preferences.celebrateWins === "boolean" ? preferences.celebrateWins : EMPTY_STATE.telegram.preferences.celebrateWins,
      checkOnMissedTasks: typeof preferences.checkOnMissedTasks === "boolean" ? preferences.checkOnMissedTasks : EMPTY_STATE.telegram.preferences.checkOnMissedTasks,
    },
  };
}

export function sanitizeAppState(value: unknown): AppState {
  const state = isRecord(value) ? value : {};

  return {
    ...EMPTY_STATE,
    ...state,
    profile: sanitizeProfile(state.profile),
    context: {
      ...EMPTY_STATE.context,
      ...(isRecord(state.context) ? state.context : {}),
      focusAreas: asArray<string>(isRecord(state.context) ? state.context.focusAreas : undefined),
      freelanceTypes: asArray<string>(isRecord(state.context) ? state.context.freelanceTypes : undefined),
    },
    telegram: sanitizeTelegram(state.telegram),
    calendarContext: {
      ...EMPTY_STATE.calendarContext,
      ...(isRecord(state.calendarContext) ? state.calendarContext : {}),
    },
    subjects: asArray<AppState["subjects"][number]>(state.subjects),
    tasks: asArray<AppState["tasks"][number]>(state.tasks),
    projects: asArray<AppState["projects"][number]>(state.projects),
    courses: asArray<AppState["courses"][number]>(state.courses),
    transactions: asArray<AppState["transactions"][number]>(state.transactions),
    wishlist: asArray<AppState["wishlist"][number]>(state.wishlist),
    commitments: asArray<AppState["commitments"][number]>(state.commitments),
    monthlySalary: Math.max(0, asNumber(state.monthlySalary, EMPTY_STATE.monthlySalary)),
    habits: asArray<AppState["habits"][number]>(state.habits),
    lifestyleLogs: asArray<AppState["lifestyleLogs"][number]>(state.lifestyleLogs),
    focusSessions: asArray<AppState["focusSessions"][number]>(state.focusSessions),
  };
}

export function parseStoredAppState(raw: string | null): AppState | null {
  if (!raw) return null;

  try {
    return sanitizeAppState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function resolveStoredState(remote: unknown, local: unknown): ResolvedStoredState {
  const remoteState = remote ? sanitizeAppState(remote) : null;
  const localState = local ? sanitizeAppState(local) : null;

  if (localState?.profile.onboardingCompleted && !remoteState?.profile.onboardingCompleted) {
    return { source: "local", state: localState };
  }

  if (remoteState) return { source: "remote", state: remoteState };
  if (localState) return { source: "local", state: localState };

  return { source: "empty", state: sanitizeAppState(EMPTY_STATE) };
}
