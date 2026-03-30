// ═══════════════════════════════════════════════════════════════
//  backend/src/modules/quran/quran.routes.ts
//  Quran Routes — Khatma plans, sessions, hifz
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { z } from "zod";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { ok, created, error } from "../../shared/utils/response";
import * as quranService from "./quran.service";

const router = Router();
router.use(authMiddleware);

// ─── Schemas ─────────────────────────────────────────────────

const createPlanSchema = z.object({
  targetDays: z.number().int().positive(),
  dailyPages: z.number().int().positive(),
  startPage: z.number().int().min(1).max(604).optional(),
});

const updatePlanSchema = z.object({
  currentPage: z.number().int().min(1).max(604).optional(),
  status: z.enum(["active", "completed", "paused"]).optional(),
});

const logSessionSchema = z.object({
  type: z.enum(["reading", "hifz", "review"]),
  fromPage: z.number().int().min(1).max(604).optional(),
  toPage: z.number().int().min(1).max(604).optional(),
  surah: z.number().int().min(1).max(114).optional(),
  durationMinutes: z.number().int().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const updateHifzSchema = z.object({
  memorizedAyahs: z.number().int().min(0).optional(),
  status: z.enum(["not_started", "in_progress", "memorized", "needs_review"]).optional(),
  nextReviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// ─── Routes ──────────────────────────────────────────────────

// GET /api/v1/quran/plans
router.get("/plans", async (req: AuthRequest, res: Response) => {
  try {
    const plans = await quranService.getPlans(req.uid!);
    ok(res, plans);
  } catch (err: any) {
    error(res, 500, err.message, "FETCH_ERROR");
  }
});

// POST /api/v1/quran/plans
router.post("/plans", async (req: AuthRequest, res: Response) => {
  try {
    const body = createPlanSchema.parse(req.body);
    const plan = await quranService.createPlan(req.uid!, body);
    created(res, plan);
  } catch (err: any) {
    error(res, 400, err.message, "CREATE_ERROR");
  }
});

// PUT /api/v1/quran/plans/:id
router.put("/plans/:id", async (req: AuthRequest, res: Response) => {
  try {
    const body = updatePlanSchema.parse(req.body);
    const plan = await quranService.updatePlan(req.uid!, req.params.id, body);
    ok(res, plan);
  } catch (err: any) {
    error(res, 400, err.message, "UPDATE_ERROR");
  }
});

// POST /api/v1/quran/log
router.post("/log", async (req: AuthRequest, res: Response) => {
  try {
    const body = logSessionSchema.parse(req.body);
    const session = await quranService.logSession(req.uid!, body);
    created(res, session);
  } catch (err: any) {
    error(res, 400, err.message, "LOG_ERROR");
  }
});

// GET /api/v1/quran/hifz
router.get("/hifz", async (req: AuthRequest, res: Response) => {
  try {
    const hifz = await quranService.getHifz(req.uid!);
    ok(res, hifz);
  } catch (err: any) {
    error(res, 500, err.message, "FETCH_ERROR");
  }
});

// PUT /api/v1/quran/hifz/:surahNum
router.put("/hifz/:surahNum", async (req: AuthRequest, res: Response) => {
  try {
    const surahNum = parseInt(req.params.surahNum);
    if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
      error(res, 400, "Invalid surah number (1-114)", "VALIDATION_ERROR");
      return;
    }
    const body = updateHifzSchema.parse(req.body);
    const result = await quranService.updateHifz(req.uid!, surahNum, body);
    ok(res, result);
  } catch (err: any) {
    error(res, 400, err.message, "UPDATE_ERROR");
  }
});

// GET /api/v1/quran/reviews/due
router.get("/reviews/due", async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await quranService.getReviewsDue(req.uid!);
    ok(res, reviews);
  } catch (err: any) {
    error(res, 500, err.message, "FETCH_ERROR");
  }
});

// GET /api/v1/quran/stats
router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const stats = await quranService.getStats(req.uid!);
    ok(res, stats);
  } catch (err: any) {
    error(res, 500, err.message, "STATS_ERROR");
  }
});

export default router;
