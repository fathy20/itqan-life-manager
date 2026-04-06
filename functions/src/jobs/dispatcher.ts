import { onSchedule } from "firebase-functions/v2/scheduler";
import { log } from "../lib/logger";

/**
 * Dispatcher (A0 STUB — real logic lands in B4).
 *
 * Runs every 5 minutes. Queries `scheduled_notifications` where
 * `status == 'pending' AND dispatchAt <= now`, leases a batch of ≤500,
 * respects quiet hours, then delivers via FCM sendMulticast.
 *
 * Current behaviour: no-op, logs invocation. Confirms Scheduler cadence
 * and that the function can cold-start within the 5-min window.
 */
export const dispatcher = onSchedule(
  {
    schedule: "*/5 * * * *",
    timeZone: "UTC",
    region: "us-central1",
    retryCount: 0, // B4 will handle retry via its own lease mechanism
  },
  async (_event) => {
    const startedAt = Date.now();
    log("dispatcher.start", {});

    // TODO (B4): lease batch → respect quiet hours → FCM sendMulticast →
    //            update status → cleanup invalid tokens → log outcome.

    log("dispatcher.done", {
      durationMs: Date.now() - startedAt,
      sent: 0,
      skipped: 0,
      failed: 0,
    });
  }
);
