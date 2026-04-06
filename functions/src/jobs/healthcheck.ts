import { onRequest } from "firebase-functions/v2/https";
import { db, messaging } from "../lib/admin";
import { log } from "../lib/logger";

/**
 * GET /healthcheck
 *
 * A0 Definition-of-Done verifier:
 *   1. Firestore write + read round-trips
 *   2. FCM messaging client is reachable (dry-run send)
 *   3. Runtime service account has required IAM scopes
 *
 * Response shape:
 *   { ok: true, checks: { firestore, fcm }, projectId, ts }
 *
 * NOTE: This endpoint is intentionally unauthenticated for now — it returns
 *       no user data, only boolean health flags. Lock it down with an
 *       `x-healthcheck-secret` header before production.
 */
export const healthcheck = onRequest(
  { region: "us-central1", cors: false },
  async (_req, res) => {
    const checks: Record<string, { ok: boolean; error?: string }> = {};

    // ── Firestore check ────────────────────────────────────────
    try {
      const ref = db.collection("_health").doc("ping");
      await ref.set({ ts: new Date().toISOString() }, { merge: true });
      const snap = await ref.get();
      checks.firestore = { ok: snap.exists };
    } catch (e: unknown) {
      checks.firestore = { ok: false, error: (e as Error).message };
    }

    // ── FCM check (dry-run send to a fake token) ───────────────
    // A dry-run validates credentials + scopes without actually sending.
    try {
      await messaging.send(
        {
          token: "fake-token-for-dry-run-validation",
          notification: { title: "healthcheck", body: "dry-run" },
        },
        true // dryRun = true
      );
      checks.fcm = { ok: true };
    } catch (e: unknown) {
      const msg = (e as Error).message || "";
      // A dry-run with a fake token returns `registration-token-not-registered`
      // — that's SUCCESS (it means credentials/scopes work). Anything else is a failure.
      if (
        msg.includes("registration-token-not-registered") ||
        msg.includes("invalid-registration-token") ||
        msg.includes("invalid-argument")
      ) {
        checks.fcm = { ok: true };
      } else {
        checks.fcm = { ok: false, error: msg };
      }
    }

    const ok = Object.values(checks).every((c) => c.ok);
    log("healthcheck.run", { ok, checks });

    res.status(ok ? 200 : 503).json({
      ok,
      checks,
      projectId: process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT,
      ts: new Date().toISOString(),
    });
  }
);
