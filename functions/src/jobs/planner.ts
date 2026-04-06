import { onSchedule } from "firebase-functions/v2/scheduler";
import { db } from "../lib/admin";
import { log } from "../lib/logger";
import { planUser, PlanUserResult } from "../lib/plan-user";
import type { NotificationPreferences } from "../../../shared/types/notifications";

/**
 * B2 — Daily Planner.
 *
 * Runs once per day at 02:00 UTC.
 *
 * For each user with `settings/notifications.enabled == true`:
 *   1. Reads their notification preferences.
 *   2. Plans a 36h rolling window of notification occurrences.
 *   3. Writes `scheduled_notifications` docs via idempotent create().
 *
 * Error isolation: a failure for one user never stops the run.
 * All errors are logged and counted; the function always completes.
 *
 * Dispatcher (B4) is responsible for:
 *   - Quiet-hours evaluation
 *   - Actual FCM delivery
 *   - Retry / dead-letter logic
 */
export const plannerDaily = onSchedule(
  {
    schedule: "0 2 * * *",
    timeZone: "UTC",
    region: "us-central1",
    retryCount: 2,
    // Memory / timeout: defaults (256MB, 60s) are fine for B2 scale.
    // Revisit when user count grows — E2 task.
  },
  async (_event) => {
    const startedAt = Date.now();
    const windowStart = new Date();
    const windowEnd   = new Date(windowStart.getTime() + 36 * 60 * 60_000);

    log("planner.start", {
      windowStart: windowStart.toISOString(),
      windowEnd:   windowEnd.toISOString(),
    });

    // ── Fetch all users that have a notifications prefs doc ──────
    //
    // We query the subcollection directly rather than listing all users,
    // because only users who have gone through onboarding have this doc.
    // This avoids scanning the entire `users` collection.
    //
    // Firestore subcollection group query: collectionGroup("settings")
    // filtered by document ID == "notifications".
    // Note: this requires a collection group index if the collection is
    // large. For B2 scale it works without one; add index in E2 if needed.

    let prefsSnap: FirebaseFirestore.QuerySnapshot;
    try {
      prefsSnap = await db
        .collectionGroup("settings")
        .where("enabled", "==", true)
        // Firestore doesn't support filtering by doc ID in collectionGroup
        // queries directly. We filter by a field that only the notifications
        // prefs doc has — `schemaVersion` — to avoid pulling other settings docs.
        // This is a pragmatic B2 approach; a dedicated top-level collection
        // would be cleaner at scale (E2 optimization).
        .where("schemaVersion", "==", 1)
        .get();
    } catch (err: unknown) {
      log(
        "planner.fetch_users_error",
        { error: (err as Error).message },
        "error"
      );
      return;
    }

    log("planner.users_found", { count: prefsSnap.size });

    // ── Aggregate results ────────────────────────────────────────

    const totals: PlanUserResult = {
      uid: "aggregate",
      planned: 0,
      skipped: 0,
      capDropped: 0,
      errors: 0,
    };

    let usersProcessed = 0;
    let userErrors = 0;

    // ── Process each user ────────────────────────────────────────

    for (const prefsDoc of prefsSnap.docs) {
      // Extract uid from path: users/{uid}/settings/notifications
      const pathParts = prefsDoc.ref.path.split("/");
      // Expected: ["users", uid, "settings", "notifications"]
      if (pathParts.length !== 4 || pathParts[0] !== "users" || pathParts[2] !== "settings") {
        log(
          "planner.unexpected_path",
          { path: prefsDoc.ref.path },
          "warn"
        );
        continue;
      }

      const uid = pathParts[1];
      const prefs = prefsDoc.data() as NotificationPreferences;

      // Double-check master switch (already filtered, but be defensive)
      if (!prefs.enabled) continue;

      try {
        const result = await planUser(uid, prefs, windowStart, windowEnd);

        totals.planned    += result.planned;
        totals.skipped    += result.skipped;
        totals.capDropped += result.capDropped;
        totals.errors     += result.errors;
        usersProcessed++;

        if (result.errors > 0 || result.capDropped > 0) {
          log("planner.user_done", {
            uid,
            planned:    result.planned,
            skipped:    result.skipped,
            capDropped: result.capDropped,
            errors:     result.errors,
          });
        }
      } catch (err: unknown) {
        // planUser() should never throw, but be safe
        log(
          "planner.user_error",
          { uid, error: (err as Error).message },
          "error"
        );
        userErrors++;
      }
    }

    // ── Final summary ────────────────────────────────────────────

    log("planner.done", {
      durationMs:     Date.now() - startedAt,
      usersProcessed,
      userErrors,
      planned:        totals.planned,
      skipped:        totals.skipped,
      capDropped:     totals.capDropped,
      writeErrors:    totals.errors,
    });
  }
);
