import { Router, Response } from "express";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import * as halaqahService from "./halaqah.service";
import { ok, error } from "../../shared/utils/response";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res: Response) => {
  try { ok(res, await halaqahService.getUserHalaqahs(req.uid!)); } catch (e: any) { error(res, 500, e.message, "SERVER_ERROR"); }
});

router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) { error(res, 400, "Name required", "VALIDATION_ERROR"); return; }
    ok(res, await halaqahService.createHalaqah(req.uid!, name));
  } catch (e: any) { error(res, 500, e.message, "SERVER_ERROR"); }
});

router.post("/join", async (req: AuthRequest, res: Response) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) { error(res, 400, "Invite code required", "VALIDATION_ERROR"); return; }
    ok(res, await halaqahService.joinHalaqah(req.uid!, inviteCode));
  } catch (e: any) { error(res, 400, e.message, "JOIN_ERROR"); }
});

router.delete("/:id/leave", async (req: AuthRequest, res: Response) => {
  try { await halaqahService.leaveHalaqah(req.uid!, req.params.id); ok(res, { left: true }); } catch (e: any) { error(res, 500, e.message, "SERVER_ERROR"); }
});

router.get("/:id/leaderboard", async (req: AuthRequest, res: Response) => {
  try { ok(res, await halaqahService.getLeaderboard(req.params.id)); } catch (e: any) { error(res, 500, e.message, "SERVER_ERROR"); }
});

router.get("/:id/duas", async (req: AuthRequest, res: Response) => {
  try { ok(res, await halaqahService.getDuas(req.params.id)); } catch (e: any) { error(res, 500, e.message, "SERVER_ERROR"); }
});

router.post("/:id/duas", async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) { error(res, 400, "Text required", "VALIDATION_ERROR"); return; }
    ok(res, await halaqahService.addDua(req.params.id, req.uid!, text));
  } catch (e: any) { error(res, 500, e.message, "SERVER_ERROR"); }
});

router.post("/:id/duas/:duaId/pray", async (req: AuthRequest, res: Response) => {
  try { await halaqahService.prayForDua(req.params.id, req.params.duaId); ok(res, { prayed: true }); } catch (e: any) { error(res, 500, e.message, "SERVER_ERROR"); }
});

router.post("/:id/naseeha", async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) { error(res, 400, "Text required", "VALIDATION_ERROR"); return; }
    await halaqahService.sendNaseeha(req.params.id, req.uid!, text);
    ok(res, { sent: true });
  } catch (e: any) { error(res, 500, e.message, "SERVER_ERROR"); }
});

router.get("/:id/challenge", async (req: AuthRequest, res: Response) => {
  try { ok(res, await halaqahService.getChallenge(req.params.id)); } catch (e: any) { error(res, 500, e.message, "SERVER_ERROR"); }
});

router.post("/:id/challenge/:challengeId/complete", async (req: AuthRequest, res: Response) => {
  try { await halaqahService.completeChallenge(req.params.id, req.params.challengeId, req.uid!); ok(res, { completed: true }); } catch (e: any) { error(res, 500, e.message, "SERVER_ERROR"); }
});

export default router;
