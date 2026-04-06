// ============================================================
// NOTIFICATIONS — DATA MODEL (A1)
//
// Shared TypeScript types for the notifications pipeline.
// Consumed by: Cloud Functions (planner/dispatcher), Express backend,
//              and frontend (preference center + permission flow).
//
// TIMESTAMP POLICY (read this carefully):
//
//   - Query-critical fields (`dispatchAt`, `expiresAt`, `leaseUntil`) are
//     stored as native Firestore Timestamps at the DB layer — required for
//     efficient WHERE/ORDER BY indexing in the Dispatcher.
//   - Audit fields (`createdAt`, `updatedAt`, `sentAt`, `lastSeenAt`, `ts`,
//     `deactivatedAt`, `movedToDeadLetterAt`) are ISO-8601 UTC strings.
//   - On the wire (HTTP/JSON), ALL timestamps are ISO-8601 UTC strings.
//   - Data access layer converts between Timestamp <-> string on read/write.
//
// All docs carry `schemaVersion` for forward-compatible migrations.
// ============================================================

export const NOTIFICATIONS_SCHEMA_VERSION = 1 as const;
export const PAYLOAD_VERSION = 1 as const;

/**
 * Query-critical timestamp. Stored as Firestore Timestamp for native
 * indexing; exposed as ISO-8601 UTC string at API boundary.
 *
 * Type stays as string (wire format) — data layer converts.
 */
export type DbInstant = string;

/** Audit-only timestamp. Always ISO-8601 UTC string everywhere. */
export type AuditInstant = string;

// ── Enums ──────────────────────────────────────────────────────

export type NotificationType =
  | "salah"
  | "adhkar"
  | "quran"
  | "tasks"
  | "weekly_summary";

export type SalahSubtype = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export type AdhkarSubtype = "morning" | "evening";
export type QuranSubtype = "review" | "reading";
export type TasksSubtype = "daily";
export type WeeklySummarySubtype = "weekly";

export type NotificationSubtype =
  | SalahSubtype
  | AdhkarSubtype
  | QuranSubtype
  | TasksSubtype
  | WeeklySummarySubtype;

export type NotificationStatus =
  | "pending"    // created, waiting for dispatch window
  | "sending"    // leased by dispatcher, delivery in progress
  | "sent"       // successfully accepted by FCM
  | "failed"     // attempt failed, will retry
  | "skipped"    // quiet hours / expired / prefs off — no retry
  | "cancelled"  // superseded by replan — no retry
  | "dead";      // permanent failure after max retries

/** Delivery priority — affects quiet-hours, caps, and retry policy. */
export type NotificationPriority = "critical" | "normal";

/** Delivery channel. Currently push-only; email/sms/in-app come later. */
export type NotificationChannel = "push" | "email" | "sms" | "in_app";

export type DevicePlatform = "web" | "ios" | "android";

export type DeviceDeactivationReason =
  | "logout"
  | "invalid_token"
  | "user_removed"
  | "token_rotated"
  | "inactive_90d";

export type LogEvent =
  | "scheduled"
  | "sent"
  | "failed"
  | "skipped"
  | "cancelled"
  | "retried"
  | "dead_lettered";

// ── users/{uid}/settings/notifications (singleton sub-doc) ─────

/** Time-of-day in 24h form "HH:mm". Validated at API layer. */
export type TimeOfDay = string;

/** IANA timezone identifier, e.g. "Africa/Cairo". */
export type IanaTimezone = string;

/** Per-prayer config — each prayer can be toggled & offset independently. */
export interface SalahPrayerPref {
  enabled: boolean;
  /** Minutes before (-) or after (+) the prayer time. Fajr typically -20. */
  offsetMin: number;
}

export interface NotificationPreferences {
  /** Master kill switch. If false, no notifications scheduled at all. */
  enabled: boolean;

  salah: {
    enabled: boolean;
    prayers: Record<SalahSubtype, SalahPrayerPref>;
  };

  adhkar: {
    enabled: boolean;
    morning: { enabled: boolean; preferredTime: TimeOfDay };
    evening: { enabled: boolean; preferredTime: TimeOfDay };
  };

  quran: {
    enabled: boolean;
    preferredTime: TimeOfDay;
  };

  tasks: {
    enabled: boolean;
    preferredTime: TimeOfDay;
  };

  weeklySummary: {
    enabled: boolean;
    /** 0 = Sunday ... 6 = Saturday (matches Date.getDay()). */
    dayOfWeek: number;
    time: TimeOfDay;
  };

  quietHours: {
    enabled: boolean;
    /** Start time in user's local timezone. */
    from: TimeOfDay;
    /** End time in user's local timezone. Can cross midnight. */
    to: TimeOfDay;
    /** If true, Fajr reminders bypass quiet hours. */
    allowFajr: boolean;
  };

  /** Hard cap on non-critical notifications per day (salah excluded). */
  maxNonCriticalPerDay: number;

  // ── User location & prayer method (duplicated from profile for fast planner access) ──
  timezone: IanaTimezone;
  location?: {
    lat: number;
    lng: number;
    city?: string;
  };
  /** Prayer calculation method ID (matches backend /salah/times?method=X). */
  prayerMethod: number;

  createdAt: AuditInstant;
  updatedAt: AuditInstant;
  schemaVersion: typeof NOTIFICATIONS_SCHEMA_VERSION;
}

// ── user_devices/{deviceId} (top-level collection) ─────────────

export interface UserDevice {
  /**
   * Firestore doc ID = random auto-ID (stable across token rotations).
   * Logical uniqueness constraint: (uid, token) — enforced at data access
   * layer via `findByToken()` before insert.
   *
   * On token rotation: client sends both `token` (new) and `previousToken`.
   * The existing device doc is UPDATED, not replaced.
   */
  uid: string;
  token: string;
  platform: DevicePlatform;
  userAgent?: string;

  active: boolean;
  installedAsPWA: boolean;

  /** Updated on every client heartbeat or auth refresh. */
  lastSeenAt: AuditInstant;
  createdAt: AuditInstant;
  updatedAt: AuditInstant;

  /** Set when active flips to false. Null while active. */
  deactivatedAt: AuditInstant | null;
  deactivationReason: DeviceDeactivationReason | null;

  schemaVersion: typeof NOTIFICATIONS_SCHEMA_VERSION;
}

// ── scheduled_notifications/{dedupeKey} (top-level, server-only writes) ──

/** FCM-facing delivery payload. Versioned independently from doc schema. */
export interface NotificationPayload {
  /** Payload structure version. Bump when `data` shape changes. */
  payloadVersion: typeof PAYLOAD_VERSION;
  /** Localized title (Arabic). */
  title: string;
  /** Localized body (Arabic). */
  body: string;
  /** Data-layer payload. Frontend SW uses `data.deepLink` to route. */
  data: {
    type: NotificationType;
    subtype: NotificationSubtype;
    /** Client-side route, e.g. "/salah?log=fajr". */
    deepLink: string;
    /** = dedupeKey. Used by client for click tracking. */
    occurrenceId: string;
  };
  /** FCM collapse_key. Same-key messages replace each other per device. */
  collapseKey: string;
}

export interface ScheduledNotification {
  /** Deterministic: `{uid}_{type}_{YYYY-MM-DD-userTZ}_{subtype}`. Doc ID = dedupeKey. */
  dedupeKey: string;
  uid: string;
  type: NotificationType;
  subtype: NotificationSubtype;

  /** Critical (salah) bypasses non-critical caps + has stricter retry. */
  priority: NotificationPriority;
  /** Delivery channel. "push" for Phase 1; extensible. */
  channel: NotificationChannel;

  // ── Timing (stored as Firestore Timestamp at DB layer) ──
  /** When to dispatch. Dispatcher queries `dispatchAt <= now`. */
  dispatchAt: DbInstant;
  /** After this, dispatcher skips instead of sending late. */
  expiresAt: DbInstant;
  /** User's IANA tz at planning time — frozen on the doc. */
  timezone: IanaTimezone;
  /** YYYY-MM-DD in user's local tz. Secondary dedupe dimension. */
  localDate: string;

  // ── Status machine ──
  status: NotificationStatus;

  // ── Concurrency control (dispatcher lease, DbInstant for query) ──
  /** Lease expiry. Null unless currently being sent. */
  leaseUntil: DbInstant | null;
  /** Function instance ID holding the lease. Null unless leased. */
  leasedBy: string | null;

  // ── Attempt tracking ──
  attemptCount: number;
  lastError: string | null;

  // ── Delivery ──
  payload: NotificationPayload;

  // ── Audit ──
  createdAt: AuditInstant;
  updatedAt: AuditInstant;
  /** Set when FCM acknowledges receipt. */
  sentAt: AuditInstant | null;

  schemaVersion: typeof NOTIFICATIONS_SCHEMA_VERSION;
}

// ── notification_logs/{logId} (append-only audit trail) ────────

export interface NotificationLog {
  uid: string;
  /** References scheduled_notifications doc. Not a FK constraint. */
  dedupeKey: string;
  event: LogEvent;
  type: NotificationType;
  subtype: NotificationSubtype;

  ts: AuditInstant;

  // Delivery details (present for "sent"/"failed" events)
  tokenCount?: number;
  successCount?: number;
  failureCount?: number;

  // Failure details
  errorCode?: string;
  errorMessage?: string;

  /** End-to-end latency for dispatch (ms). */
  latencyMs?: number;

  schemaVersion: typeof NOTIFICATIONS_SCHEMA_VERSION;
}

// ── dead_letter_notifications/{id} ─────────────────────────────

export interface DeadLetterNotification {
  /** Original scheduled_notifications doc ID (= original dedupeKey). */
  originalId: string;
  snapshot: ScheduledNotification;
  movedToDeadLetterAt: AuditInstant;
  finalError: string;
  totalAttempts: number;
  schemaVersion: typeof NOTIFICATIONS_SCHEMA_VERSION;
}

// ── Helpers: type-safe builders ────────────────────────────────

/** Build a dedupeKey from its parts. Single source of truth for format. */
export function buildDedupeKey(
  uid: string,
  type: NotificationType,
  localDate: string,
  subtype: NotificationSubtype
): string {
  return `${uid}_${type}_${localDate}_${subtype}`;
}

/** Resolve priority from notification type. Salah is critical; others normal. */
export function resolvePriority(type: NotificationType): NotificationPriority {
  return type === "salah" ? "critical" : "normal";
}

/** Build the FCM collapse_key. Groups same-kind notifications for replacement. */
export function buildCollapseKey(
  type: NotificationType,
  subtype: NotificationSubtype,
  localDate: string
): string {
  return `${type}_${subtype}_${localDate}`;
}

/** Default preferences for a newly onboarded user. */
export function defaultPreferences(
  timezone: IanaTimezone = "Africa/Cairo",
  prayerMethod: number = 5
): Omit<NotificationPreferences, "createdAt" | "updatedAt"> {
  return {
    enabled: true,
    salah: {
      enabled: true,
      prayers: {
        fajr:    { enabled: true,  offsetMin: -20 },
        dhuhr:   { enabled: true,  offsetMin: 0 },
        asr:     { enabled: true,  offsetMin: 0 },
        maghrib: { enabled: true,  offsetMin: 0 },
        isha:    { enabled: true,  offsetMin: 0 },
      },
    },
    adhkar: {
      enabled: true,
      morning: { enabled: true, preferredTime: "06:30" },
      evening: { enabled: true, preferredTime: "17:30" },
    },
    quran:         { enabled: true, preferredTime: "20:00" },
    tasks:         { enabled: true, preferredTime: "09:00" },
    weeklySummary: { enabled: true, dayOfWeek: 5, time: "20:00" }, // Friday evening
    quietHours: {
      enabled: true,
      from: "23:00",
      to: "05:00",
      allowFajr: true,
    },
    maxNonCriticalPerDay: 5,
    timezone,
    prayerMethod,
    schemaVersion: NOTIFICATIONS_SCHEMA_VERSION,
  };
}
