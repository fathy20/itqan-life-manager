// ═══════════════════════════════════════════════════════════════
//  backend/src/modules/adhkar/adhkar.routes.ts
//  Adhkar Routes — Daily dhikr tracking
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { ok, error } from "../../shared/utils/response";
import * as adhkarService from "./adhkar.service";

const router = Router();
router.use(authMiddleware);

// ─── Schemas ─────────────────────────────────────────────────

const logBlockSchema = z.object({
  block: z.enum(["morning", "evening", "sleep", "afterPrayer"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const updateCounterSchema = z.object({
  counter: z.string().min(1),
  value: z.number().int().min(0),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// ─── Routes ──────────────────────────────────────────────────

// GET /api/v1/adhkar/today
router.get("/today", async (req: AuthRequest, res: Response) => {
  try {
    const log = await adhkarService.getToday(req.uid!);
    ok(res, log);
  } catch (err: any) {
    error(res, 500, err.message, "FETCH_ERROR");
  }
});

// POST /api/v1/adhkar/log
router.post("/log", async (req: AuthRequest, res: Response) => {
  try {
    const body = logBlockSchema.parse(req.body);
    const date = body.date || new Date().toISOString().split("T")[0];
    await adhkarService.logBlock(req.uid!, date, body.block);
    ok(res, null, `${body.block} adhkar logged`);
  } catch (err: any) {
    error(res, 400, err.message, "LOG_ERROR");
  }
});

// PUT /api/v1/adhkar/counter
router.put("/counter", async (req: AuthRequest, res: Response) => {
  try {
    const body = updateCounterSchema.parse(req.body);
    const date = body.date || new Date().toISOString().split("T")[0];
    await adhkarService.updateCounter(req.uid!, date, body.counter, body.value);
    ok(res, null, "Counter updated");
  } catch (err: any) {
    error(res, 400, err.message, "UPDATE_ERROR");
  }
});

// GET /api/v1/adhkar/stats?period=week|month
router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const period = (req.query.period as "week" | "month") || "week";
    const stats = await adhkarService.getStats(req.uid!, period);
    ok(res, stats);
  } catch (err: any) {
    error(res, 500, err.message, "STATS_ERROR");
  }
});

export default router;
