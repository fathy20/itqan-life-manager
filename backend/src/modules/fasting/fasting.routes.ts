// ═══════════════════════════════════════════════════════════════
//  backend/src/modules/fasting/fasting.routes.ts
//  Fasting Routes — Fasting days, qada, suggestions
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { ok, created, error } from "../../shared/utils/response";
import * as fastingService from "./fasting.service";

const router = Router();
router.use(authMiddleware);

// ─── Schemas ─────────────────────────────────────────────────

const logDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["ramadan", "monday_thursday", "ayyam_beed", "arafah", "ashura", "shawwal", "qada", "voluntary"]),
  completed: z.boolean(),
  notes: z.string().optional(),
});

const updateQadaSchema = z.object({
  delta: z.number().int(),
});

// ─── Routes ──────────────────────────────────────────────────

// GET /api/v1/fasting/month/:year/:month
router.get("/month/:year/:month", async (req: AuthRequest, res: Response) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      error(res, 400, "Invalid year or month", "VALIDATION_ERROR");
      return;
    }
    const days = await fastingService.getMonth(req.uid!, year, month);
    ok(res, days);
  } catch (err: any) {
    error(res, 500, err.message, "FETCH_ERROR");
  }
});

// POST /api/v1/fasting/log
router.post("/log", async (req: AuthRequest, res: Response) => {
  try {
    const body = logDaySchema.parse(req.body);
    const day = await fastingService.logDay(req.uid!, body);
    created(res, day);
  } catch (err: any) {
    error(res, 400, err.message, "LOG_ERROR");
  }
});

// GET /api/v1/fasting/qada
router.get("/qada", async (req: AuthRequest, res: Response) => {
  try {
    const qada = await fastingService.getQada(req.uid!);
    ok(res, qada);
  } catch (err: any) {
    error(res, 500, err.message, "FETCH_ERROR");
  }
});

// PUT /api/v1/fasting/qada
router.put("/qada", async (req: AuthRequest, res: Response) => {
  try {
    const body = updateQadaSchema.parse(req.body);
    await fastingService.updateQada(req.uid!, body.delta);
    ok(res, null, "Qada updated");
  } catch (err: any) {
    error(res, 400, err.message, "UPDATE_ERROR");
  }
});

// GET /api/v1/fasting/suggestions
router.get("/suggestions", async (req: AuthRequest, res: Response) => {
  try {
    const suggestions = await fastingService.getSuggestions(req.uid!);
    ok(res, suggestions);
  } catch (err: any) {
    error(res, 500, err.message, "FETCH_ERROR");
  }
});

export default router;
