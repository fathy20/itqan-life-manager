# Notifications — Planning Rules Spec (B1)

Canonical planning policy for the notifications pipeline. Defines **when**, **why**, and **how** each notification type is scheduled. This spec is the contract the B2 Planner implements against.

- **Depends on:** A1 data model ([`notifications-schema.md`](./notifications-schema.md)), [`shared/types/notifications.ts`](../shared/types/notifications.ts)
- **Consumed by:** B2 Planner (creates `scheduled_notifications`), B4 Dispatcher (evaluates skip conditions), B6 Quiet-Hours logic
- **Out of scope:** retry/backoff (C2), dead-letter GC (E2), exact cron schedules (B2)

---

## 1. Planner scope

### Rolling window

- Planner runs **daily at 02:00 UTC** (matches `plannerDaily` in [`functions/src/jobs/planner.ts`](../functions/src/jobs/planner.ts)).
- Each run plans a **36-hour rolling window** from invocation time.
- 36h chosen over 24h to absorb cross-timezone boundary issues and a planner run that fails/is late by up to ~12h.
- 36h chosen over 48h to avoid re-planning churn when prefs change.

### Per-user fan-out

For each user where `settings/notifications.enabled == true`:

1. Load prefs + timezone + location + prayerMethod (all live on the prefs doc).
2. Resolve the user's **local dates** that intersect the 36h window (typically 2 local days).
3. For each local date, generate candidate occurrences for each enabled type/subtype (§2).
4. Apply cap (§4) and write survivors via `db.doc(dedupeKey).create()` (idempotent).

### Idempotency

- `dedupeKey` is the doc ID → `create()` throws on duplicate → planner is safely re-runnable.
- If a doc already exists with status `cancelled`, planner does **not** revive it; it creates nothing (user/system decided not to send).
- If the user changes prefs mid-window, an out-of-band **replan trigger** (deferred to B2) cancels affected `pending` docs and re-plans.

---

## 2. Per-type planning rules

All rules below assume the user has the type enabled in prefs AND `enabled` (master switch) is true. If the master switch is off, nothing is planned at all.

### Unified `expiresAt` rule

Every `expiresAt` value in §2 is derived from one formula:

> `expiresAt = dispatchAt + min(natural opportunity window, max lateness tolerance)`

- **Natural opportunity window** = how long the reminder remains contextually meaningful (e.g. a morning adhkar after dhuhr is pointless; a task after midnight is pointless).
- **Max lateness tolerance** = how much drift we'll accept from a planned time before it becomes noise instead of a reminder.

This is why salah expiries are tight (20m = the reminder is time-locked to a prayer window) and weekly_summary is generous (12h = a summary is still useful hours later). The per-type values in §2 are fixed numbers derived from this rule, not independent magic numbers.

### 2.1 `salah` — prayer reminders

| Field | Value |
|---|---|
| **Subtypes** | `fajr`, `dhuhr`, `asr`, `maghrib`, `isha` |
| **Priority** | `critical` |
| **Counts against cap?** | **No** (critical is excluded) |
| **Respects quiet hours?** | **No** for dhuhr/asr/maghrib/isha (always bypass). **Fajr** is the sole exception: blocked only when `quietHours.allowFajr == false`. |
| **dispatchAt** | `prayerTime[subtype] + salah.prayers[subtype].offsetMin` minutes, in user's local tz. Example: fajr at 04:52 with offset `-20` → dispatch at 04:32. |
| **expiresAt** | `dispatchAt + 20 minutes`. Rationale: a prayer reminder that fires more than 20 min late has lost its point; dispatcher marks `skipped`. |
| **Per-prayer toggle** | Each prayer is independently enabled via `salah.prayers[subtype].enabled`. |
| **Prayer time source** | Backend `/api/v1/salah/times` using user's `location` + `prayerMethod` from prefs. Planner calls once per user per local date. |
| **deepLink** | `/salah?log={subtype}` |
| **collapseKey** | `salah_{subtype}_{localDate}` |
| **Title / body** | Arabic, subtype-specific (e.g. "حان وقت صلاة الفجر"). Exact copy deferred to B3 (copy deck). |

**Edge cases:**
- If `location` is missing, planner **skips all salah occurrences** for that user and emits a `planner.skip_salah_no_location` log.
- Offsets are capped to the range `[-60, +60]` at the API boundary; planner trusts the stored value.
- If two salah times collapse within the offset (rare, e.g. extreme latitudes), both are still scheduled; collapseKey differs by subtype.

### 2.2 `adhkar` — morning & evening remembrances

| Field | Value |
|---|---|
| **Subtypes** | `morning`, `evening` |
| **Priority** | `normal` |
| **Counts against cap?** | **Yes** |
| **Respects quiet hours?** | Yes (dispatcher marks `skipped` if inside quiet window) |
| **dispatchAt** | `adhkar.{subtype}.preferredTime` on the user's local date, in user's local tz. Defaults: morning 06:30, evening 17:30. |
| **expiresAt** | `dispatchAt + 3 hours`. Rationale: adhkar has a loose time window (morning = until ~dhuhr, evening = until ~maghrib), but a 3h cap keeps reminders relevant without hanging all day. |
| **Per-subtype toggle** | `adhkar.morning.enabled` / `adhkar.evening.enabled` independent. |
| **deepLink** | `/adhkar?session={subtype}` |
| **collapseKey** | `adhkar_{subtype}_{localDate}` |

### 2.3 `quran` — daily Quran reminder

| Field | Value |
|---|---|
| **Subtypes** | `review`, `reading` — but **Phase 1 schedules only `review`**. `reading` is reserved in types for a later phase when separate prefs exist. |
| **Priority** | `normal` |
| **Counts against cap?** | **Yes** |
| **Respects quiet hours?** | Yes |
| **dispatchAt** | `quran.preferredTime` on the user's local date. Default 20:00. |
| **expiresAt** | `dispatchAt + 4 hours`. |
| **deepLink** | `/quran` |
| **collapseKey** | `quran_review_{localDate}` |

**Phase 1 rationale:** the prefs schema has a single `quran.preferredTime` (no sub-prefs for review vs. reading). Scheduling both would double-fire at the same time. Default subtype = `review` (spaced-repetition is the core product loop). Upgrading to both requires a prefs migration + a bump to planning rules; out of scope for B1.

### 2.4 `tasks` — daily task reminder

| Field | Value |
|---|---|
| **Subtype** | `daily` |
| **Priority** | `normal` |
| **Counts against cap?** | **Yes** |
| **Respects quiet hours?** | Yes |
| **dispatchAt** | `tasks.preferredTime` on the user's local date. Default 09:00. |
| **expiresAt** | **End of the user's local day (23:59:59 local)**. Rationale: tasks are day-scoped; sending after midnight is meaningless because the day rolled over. |
| **deepLink** | `/tasks` |
| **collapseKey** | `tasks_daily_{localDate}` |

### 2.5 `weekly_summary` — weekly progress summary

| Field | Value |
|---|---|
| **Subtype** | `weekly` |
| **Priority** | `normal` |
| **Counts against cap?** | **Yes** |
| **Respects quiet hours?** | Yes |
| **dispatchAt** | `weeklySummary.time` on the local date whose weekday matches `weeklySummary.dayOfWeek` (0=Sun…6=Sat, per `Date.getDay()`). Default: Friday 20:00 (`dayOfWeek=5`). |
| **Scheduled only if** | The 36h planning window contains a local date whose weekday matches `dayOfWeek`. On most days, zero weekly_summary docs are created. |
| **expiresAt** | `dispatchAt + 12 hours`. A summary is still useful hours later. |
| **deepLink** | `/dashboard` |
| **collapseKey** | `weekly_summary_weekly_{localDate}` |

---

## 3. Quiet hours — policy

Definitive rules (implementation details deferred to B6):

1. **Planner never drops based on quiet hours.** It always creates the `pending` doc at the user's preferred `dispatchAt`. Rationale:
   - Prefs may change between plan time and dispatch time.
   - Skipped occurrences leave an audit trail (`status=skipped` + `notification_logs` entry).
2. **Dispatcher evaluates quiet hours at dispatch time.** If `dispatchAt` falls inside `[quietHours.from, quietHours.to]` in the user's local tz:
   - **critical** (salah): **all five prayers bypass quiet hours**, with exactly one exception — **fajr is marked `skipped` iff `quietHours.allowFajr == false`**. Fajr is the only salah subtype that can be blocked by quiet hours. Dhuhr/asr/maghrib/isha are never blocked regardless of any quiet-hours setting.
   - **normal**: marked `skipped`, logged with `event: "skipped"`.
3. **Cross-midnight quiet windows** (e.g. 23:00→05:00): handled by B6. Planner is agnostic; it only stores `dispatchAt`.
4. **Quiet hours are never "shifted"** — i.e. we don't push a dispatch from 23:30 to 05:00. The moment passes, the reminder skips. This is intentional product behavior.

---

## 4. Cap enforcement — `maxNonCriticalPerDay`

- Salah occurrences are **never counted** toward the cap.
- Per user, per **local date**, the planner counts non-critical occurrences created or already-existing in `scheduled_notifications`.
- If adding a candidate would exceed `maxNonCriticalPerDay` (default 5), the candidate is **not created**.
- **Drop order when capping** (lowest-product-priority dropped first):
  1. `weekly_summary`
  2. `quran`
  3. `tasks`
  4. `adhkar.evening`
  5. `adhkar.morning`
- **Tie-breaker within the same rank** (relevant when future types/subtypes share a rank, or when the list is extended): **earlier `dispatchAt` wins** (kept). Rationale: if we must drop one of two equivalently-ranked candidates, drop the one whose moment hasn't arrived yet — the earlier one has higher engagement probability because the user hasn't moved past that time of day.
- If `dispatchAt` is also identical, fall back to lexicographic order of `(type, subtype)` for determinism.
- Default cap = 5 exactly fits the maximum per-day non-critical set (adhkar×2 + quran + tasks + weekly_summary-on-its-day), so capping trips only when the user lowers the cap below 5.
- Cap drops are logged with `planner.cap_drop` and include the dropped subtype.

---

## 5. Payload expectations

All scheduled docs carry a fully-formed `NotificationPayload` at plan time:

```ts
{
  payloadVersion: 1,
  title: string,         // Arabic, type/subtype specific
  body: string,          // Arabic
  data: {
    type: NotificationType,
    subtype: NotificationSubtype,
    deepLink: string,    // per §2 tables
    occurrenceId: string // = dedupeKey
  },
  collapseKey: string    // per §2 tables
}
```

- **Title/body are resolved at plan time, not dispatch time.** This means user language switches mid-day do not retroactively update pending docs. Acceptable trade-off for Phase 1 (Arabic-only).
- `occurrenceId` MUST equal the `dedupeKey` — client uses it for click deduplication.
- `collapseKey` MUST follow `{type}_{subtype}_{localDate}` — same message across a user's devices replaces itself at the OS level, solving multi-device duplication without server coordination.
- The copy deck (exact Arabic strings per type/subtype) is a B3 deliverable. B2 Planner will import from a `notifications-copy.ts` module.

---

## 6. Planner decision flow (pseudo)

```
for each user with settings.notifications.enabled:
  localDates = resolveLocalDates(user.timezone, now, now + 36h)
  prayerTimesByDate = fetchSalahTimes(user.location, user.prayerMethod, localDates)

  for each localDate in localDates:
    candidates = []
    candidates += buildSalahCandidates(user, localDate, prayerTimesByDate)   // critical, uncapped
    candidates += buildAdhkarCandidates(user, localDate)
    candidates += buildQuranCandidates(user, localDate)
    candidates += buildTasksCandidates(user, localDate)
    candidates += buildWeeklySummaryCandidates(user, localDate)

    existing = countExistingNonCritical(user.uid, localDate)
    nonCritical = candidates.filter(priority == "normal").sortBy(dropOrderRank)
    critical    = candidates.filter(priority == "critical")

    // apply cap
    room = user.maxNonCriticalPerDay - existing
    keptNonCritical = nonCritical.take(room)

    for doc in critical + keptNonCritical:
      try db.doc(doc.dedupeKey).create(doc)   // fails silently if exists
```

---

## 7. What B1 explicitly does NOT decide

| Question | Owner |
|---|---|
| Exact title/body strings (copy deck) | B3 |
| Retry backoff and max attempts | C2 |
| Cross-midnight quiet-hours evaluation algorithm | B6 |
| Replan trigger implementation (prefs-change invalidation) | B2 |
| Dead-letter GC policy | E2 |
| Whether `reading` subtype ships alongside `review` | Phase 2 |
| Exact planner cron schedule (02:00 UTC is a starting point) | B2 (may tune) |

---

## 8. Summary of decisions locked by B1

1. **Planner window:** 36h rolling, daily at 02:00 UTC.
2. **Priority assignment:** salah = critical; everything else = normal.
3. **Cap exclusion:** only salah is uncapped.
4. **Cap drop order:** weekly_summary → quran → tasks → adhkar.evening → adhkar.morning.
5. **Expiry windows:** salah 20m, adhkar 3h, quran 4h, tasks end-of-local-day, weekly_summary 12h.
6. **Quiet-hours policy:** planner never drops; dispatcher skips at send time. All four non-fajr salah prayers always bypass. Fajr is the only salah subtype that can be blocked, and only when `allowFajr == false`.
7. **Expiry formula:** `expiresAt = dispatchAt + min(natural opportunity window, max lateness tolerance)` — all per-type values derive from this.
8. **Cap tie-breaker:** within the same drop-rank, keep the earlier `dispatchAt`; then fall back to lexicographic `(type, subtype)`.
9. **Quran subtype in Phase 1:** `review` only.
10. **Weekly summary scheduling:** only when a matching weekday falls in the planning window.
11. **Payload at plan time:** title/body/deepLink/collapseKey resolved by planner, frozen on the doc.
12. **Missing location → no salah:** skip + log, do not fail the whole user.
