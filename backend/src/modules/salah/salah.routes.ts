// ═══════════════════════════════════════════════════════════════
//  backend/src/modules/salah/salah.routes.ts
//  Salah Routes — Express router with auth + zod validation
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { ok, error } from "../../shared/utils/response";
import * as salahService from "./salah.service";

const router = Router();
router.use(authMiddleware);

// ─── Schemas ─────────────────────────────────────────────────

const logPrayerSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  prayer: z.enum(["fajr", "dhuhr", "asr", "maghrib", "isha"]),
  status: z.enum(["onTime", "late", "qada", "missed"]),
  jamaah: z.boolean().optional(),
  sunnahBefore: z.boolean().optional(),
  sunnahAfter: z.boolean().optional(),
});

const logExtraSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["witr", "qiyam", "duha"]),
  done: z.boolean(),
});

const qadaSchema = z.object({ delta: z.number().int() });

// ─── Routes ──────────────────────────────────────────────────

// GET /api/v1/salah/times?lat=30.0&lng=31.2&method=5
router.get("/times", async (req: AuthRequest, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const method = parseInt(req.query.method as string) || 5;
    if (isNaN(lat) || isNaN(lng)) { error(res, 400, "lat and lng are required", "VALIDATION_ERROR"); return; }
    const times = await salahService.getPrayerTimes(lat, lng, method);
    ok(res, times);
  } catch (err: any) {
    error(res, 500, err.message, "PRAYER_TIMES_ERROR");
  }
});

// GET /api/v1/salah/log/:date
router.get("/log/:date", async (req: AuthRequest, res: Response) => {
  try {
    const log = await salahService.getPrayerLog(req.uid!, req.params.date);
    ok(res, log);
  } catch (err: any) {
    error(res, 500, err.message, "FETCH_ERROR");
  }
});

// POST /api/v1/salah/log
router.post("/log", async (req: AuthRequest, res: Response) => {
  try {
    const body = logPrayerSchema.parse(req.body);
    await salahService.logPrayer(req.uid!, body.date, body.prayer, body.status, {
      jamaah: body.jamaah, sunnahBefore: body.sunnahBefore, sunnahAfter: body.sunnahAfter,
    });
    ok(res, null, "Prayer logged");
  } catch (err: any) {
    error(res, 400, err.message, "LOG_ERROR");
  }
});

// POST /api/v1/salah/log/extra
router.post("/log/extra", async (req: AuthRequest, res: Response) => {
  try {
    const body = logExtraSchema.parse(req.body);
    await salahService.logExtraPrayer(req.uid!, body.date, body.type, body.done);
    ok(res, null, `${body.type} logged`);
  } catch (err: any) {
    error(res, 400, err.message, "LOG_ERROR");
  }
});

// GET /api/v1/salah/stats?period=week
router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const period = (req.query.period as "week" | "month") || "week";
    const stats = await salahService.getPrayerStats(req.uid!, period);
    ok(res, stats);
  } catch (err: any) {
    error(res, 500, err.message, "STATS_ERROR");
  }
});

// GET /api/v1/salah/qada
router.get("/qada", async (req: AuthRequest, res: Response) => {
  try {
    const qada = await salahService.getQadaCount(req.uid!);
    ok(res, qada);
  } catch (err: any) {
    error(res, 500, err.message, "QADA_ERROR");
  }
});

// PUT /api/v1/salah/qada
router.put("/qada", async (req: AuthRequest, res: Response) => {
  try {
    const body = qadaSchema.parse(req.body);
    await salahService.updateQadaCount(req.uid!, body.delta);
    ok(res, null, "Qada updated");
  } catch (err: any) {
    error(res, 400, err.message, "QADA_ERROR");
  }
});

export default router;
