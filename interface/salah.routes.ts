// ═══════════════════════════════════════════════════════════════
//  backend/src/modules/salah/salah.routes.ts
//  Salah Routes — Express router with auth + validation
// ═══════════════════════════════════════════════════════════════

import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as salahService from "./salah.service";

const router = Router();

// All salah routes require authentication
router.use(authenticate);

// ─── Schemas ─────────────────────────────────────────────────

const prayerTimesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  method: z.coerce.number().int().min(0).max(15).default(5),
});

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

const statsSchema = z.object({
  period: z.enum(["week", "month"]),
});

const qadaSchema = z.object({
  delta: z.number().int(),
});

// ─── Routes ──────────────────────────────────────────────────

// GET /api/v1/salah/times?lat=30.0&lng=31.2&method=5
router.get("/times", validate(prayerTimesSchema, "query"), async (req: Request, res: Response) => {
  try {
    const { lat, lng, method } = req.query as any;
    const times = await salahService.getPrayerTimes(
      parseFloat(lat), parseFloat(lng), parseInt(method) || 5
    );
    res.json({ success: true, data: times });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: "PRAYER_TIMES_ERROR" });
  }
});

// GET /api/v1/salah/log/:date
router.get("/log/:date", async (req: Request, res: Response) => {
  try {
    const uid = (req as any).uid;
    const log = await salahService.getPrayerLog(uid, req.params.date);
    res.json({ success: true, data: log });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: "FETCH_ERROR" });
  }
});

// POST /api/v1/salah/log
router.post("/log", validate(logPrayerSchema), async (req: Request, res: Response) => {
  try {
    const uid = (req as any).uid;
    const { date, prayer, status, jamaah, sunnahBefore, sunnahAfter } = req.body;
    await salahService.logPrayer(uid, date, prayer, status, { jamaah, sunnahBefore, sunnahAfter });
    res.json({ success: true, message: "Prayer logged" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: "LOG_ERROR" });
  }
});

// POST /api/v1/salah/log/extra
router.post("/log/extra", validate(logExtraSchema), async (req: Request, res: Response) => {
  try {
    const uid = (req as any).uid;
    const { date, type, done } = req.body;
    await salahService.logExtraPrayer(uid, date, type, done);
    res.json({ success: true, message: `${type} logged` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: "LOG_ERROR" });
  }
});

// GET /api/v1/salah/stats?period=week
router.get("/stats", validate(statsSchema, "query"), async (req: Request, res: Response) => {
  try {
    const uid = (req as any).uid;
    const stats = await salahService.getPrayerStats(uid, req.query.period as "week" | "month");
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: "STATS_ERROR" });
  }
});

// GET /api/v1/salah/qada
router.get("/qada", async (req: Request, res: Response) => {
  try {
    const uid = (req as any).uid;
    const qada = await salahService.getQadaCount(uid);
    res.json({ success: true, data: qada });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: "QADA_ERROR" });
  }
});

// PUT /api/v1/salah/qada
router.put("/qada", validate(qadaSchema), async (req: Request, res: Response) => {
  try {
    const uid = (req as any).uid;
    await salahService.updateQadaCount(uid, req.body.delta);
    res.json({ success: true, message: "Qada updated" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: "QADA_ERROR" });
  }
});

export default router;
