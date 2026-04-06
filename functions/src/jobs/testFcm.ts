import { onRequest } from "firebase-functions/v2/https";
import { messaging } from "../lib/admin";
import { log } from "../lib/logger";

/**
 * POST /testFcm
 * Body: { token: string, title?: string, body?: string }
 *
 * Manual smoke-test for A0: given a real FCM registration token from a
 * browser/device, send a single notification and return the FCM message ID.
 *
 * PROTECTION: Requires header `x-admin-secret` matching env TEST_FCM_SECRET.
 *             Without it, returns 401. Set the secret via:
 *               firebase functions:secrets:set TEST_FCM_SECRET
 */
export const testFcm = onRequest(
  { region: "us-central1", secrets: ["TEST_FCM_SECRET"], cors: false },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ ok: false, error: "method-not-allowed" });
      return;
    }

    const providedSecret = req.header("x-admin-secret");
    const expected = process.env.TEST_FCM_SECRET;
    if (!expected || providedSecret !== expected) {
      res.status(401).json({ ok: false, error: "unauthorized" });
      return;
    }

    const { token, title, body } = req.body as {
      token?: string;
      title?: string;
      body?: string;
    };

    if (!token || typeof token !== "string") {
      res.status(400).json({ ok: false, error: "missing-token" });
      return;
    }

    try {
      const messageId = await messaging.send({
        token,
        notification: {
          title: title || "Itqan — test",
          body: body || "إشعار تجريبي من Cloud Functions ✅",
        },
        data: { type: "test", ts: new Date().toISOString() },
      });

      log("testFcm.sent", { messageId, tokenPrefix: token.slice(0, 12) });
      res.status(200).json({ ok: true, messageId });
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      log("testFcm.failed", { code: err.code, error: err.message }, "error");
      res.status(500).json({ ok: false, code: err.code, error: err.message });
    }
  }
);
