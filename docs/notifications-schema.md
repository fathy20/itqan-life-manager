# Notifications — Data Model Spec (A1)

Canonical spec for the notifications pipeline data model. TypeScript source of truth: [`shared/types/notifications.ts`](../shared/types/notifications.ts).

---

## Collections map

```
users/{uid}                                     ← existing
  └── settings/notifications                    ← subcollection, owned by user

user_devices/{deviceId}                         ← top-level, owned by user
scheduled_notifications/{dedupeKey}             ← top-level, server-only writes
notification_logs/{logId}                       ← top-level, server-only writes
dead_letter_notifications/{id}                  ← top-level, server-only writes
```

---

## Ownership & access control

| Collection | Client read | Client write | Server (Admin SDK) |
|---|---|---|---|
| `users/{uid}/settings/notifications` | own only | own only (via API) | full |
| `user_devices/{deviceId}` | own only (where uid == auth.uid) | own only (via API) | full |
| `scheduled_notifications/*` | **none** | **none** | full |
| `notification_logs/*` | **none** | **none** | full |
| `dead_letter_notifications/*` | **none** | **none** | full |

**Rule of thumb:** client touches `prefs` and `devices` via API. Everything else is server-only. Admin SDK bypasses rules anyway — rules exist to stop client leakage.

---

## Timestamps policy

- **All timestamps are ISO-8601 UTC strings**, not Firestore Timestamps.
- Matches existing backend convention (`createdAt: new Date().toISOString()`).
- Easier to inspect in console, no SDK-specific serialization.
- Exception: `updatedAt` fields could use `FieldValue.serverTimestamp()` for atomic writes — but store it as ISO string via a trigger if consistency matters.

---

## `dedupeKey` format — single source of truth

```
{uid}_{type}_{YYYY-MM-DD in user's local tz}_{subtype}
```

**Examples:**
- `abc123_salah_2026-04-05_fajr`
- `abc123_adhkar_2026-04-05_morning`
- `abc123_quran_2026-04-05_review`

**Rules:**
1. `dedupeKey` **is the Firestore doc ID** of `scheduled_notifications` → atomic uniqueness via `db.doc(id).create()` (fails if exists).
2. Date uses **user's local tz**, not UTC. Two users in different timezones planning "today" get different keys.
3. Use `buildDedupeKey()` helper — never hand-concatenate.
4. Never mutate after creation. To reschedule, create a new key (status `cancelled` on old).

---

## Status machine

```
                ┌──────────────────────────────────────┐
                │                                       │
                ▼                                       │
   ┌─────────┐     ┌─────────┐     ┌──────┐            │
   │ pending │ ──▶ │ sending │ ──▶ │ sent │            │
   └────┬────┘     └────┬────┘     └──────┘            │
        │               │                               │
        │               │   ┌────────┐    retry         │
        │               └─▶ │ failed │ ───────┐         │
        │                   └────────┘        │         │
        │                        │            └─────────┘
        │                        │ max attempts
        │                        ▼
        │                   ┌──────┐
        │                   │ dead │
        │                   └──────┘
        │
        │   ┌─────────┐       ┌───────────┐
        ├─▶ │ skipped │       │ cancelled │
        │   └─────────┘       └───────────┘
        │   quiet hours,      replan
        │   expired,
        │   prefs off
        ▼
```

**Terminal states** (no further transitions): `sent`, `skipped`, `cancelled`, `dead`.

**Who writes each transition:**
| From → To | Writer |
|---|---|
| (new) → pending | Planner |
| pending → sending | Dispatcher (with lease) |
| sending → sent | Dispatcher (after FCM ack) |
| sending → failed | Dispatcher (FCM error) |
| failed → sending | Dispatcher retry (lease again) |
| failed → dead | Dispatcher (attemptCount >= 3) |
| pending → skipped | Dispatcher (quiet hours / expired) |
| pending → cancelled | Replan trigger |

---

## Soft delete vs. hard delete for devices

**Devices are soft-deleted. Never hard-delete.**

- `active: false` + `deactivatedAt` + `deactivationReason`.
- Inactive devices stay in Firestore for 90 days → GC job deletes.
- Why: audit trail, re-activation support (user re-logs in on same device), analytics.

**Valid `deactivationReason` values:**
| Reason | When |
|---|---|
| `logout` | User signed out |
| `invalid_token` | FCM returned `registration-token-not-registered` |
| `token_rotated` | Client sent `previousToken` — old one deactivated |
| `user_removed` | User clicked "remove device" in settings |
| `inactive_90d` | GC job: `lastSeenAt < now - 90d` |

---

## `maxNonCriticalPerDay` enforcement

- **Salah is critical** — never capped.
- **Non-critical**: adhkar, quran, tasks, weekly_summary.
- Enforced by **Planner** (not Dispatcher) — the planner refuses to create more than N non-critical occurrences per user per local day.
- Default cap: 5.

---

## `schemaVersion` migration policy

Every doc carries `schemaVersion: 1`. On breaking changes:

1. Bump `NOTIFICATIONS_SCHEMA_VERSION` in `shared/types/notifications.ts`.
2. Write migration script that reads docs where `schemaVersion < N`, transforms, bumps.
3. Code handles both versions during transition window.
4. Drop old-version support after all docs migrated.

Never break without bumping.

---

## FCM payload structure — data vs notification

All scheduled messages send **both** `notification` block (for OS tray) **and** `data` block (for client-side routing + analytics).

**`notification`**: title + body only. Rendered by the OS when app is backgrounded.

**`data`** (all strings, per FCM spec):
- `type`: one of NotificationType
- `subtype`: one of NotificationSubtype
- `deepLink`: client route (`/salah?log=fajr`)
- `occurrenceId`: = dedupeKey (for click tracking)

**`collapse_key`**: `{type}_{subtype}_{localDate}`. Same-key messages replace each other at the device level — solves multi-device duplicates without server coordination.

---

## Required Firestore indexes (already added in A0)

```json
// user_devices: find all active devices for a user
{ "collectionGroup": "user_devices",
  "fields": [{ "uid": "ASC" }, { "active": "ASC" }] }

// scheduled_notifications: dispatcher query
{ "collectionGroup": "scheduled_notifications",
  "fields": [{ "status": "ASC" }, { "dispatchAt": "ASC" }] }

// scheduled_notifications: per-user per-day lookups (planner dedupe check)
{ "collectionGroup": "scheduled_notifications",
  "fields": [{ "uid": "ASC" }, { "localDate": "ASC" }] }
```

---

## Open questions deferred to later tasks

| Question | Resolved in |
|---|---|
| Exact quiet-hours cross-midnight algorithm | B6 |
| Planner rolling-window size (24h vs 36h vs 48h) | B2 |
| Concrete retry backoff values | C2 |
| Dead letter GC policy (delete after N days?) | E2 |
| Per-type `expiresAt` offset (how late is "too late") | B1 — resolved, see [`notifications-planning-rules.md`](./notifications-planning-rules.md) |
