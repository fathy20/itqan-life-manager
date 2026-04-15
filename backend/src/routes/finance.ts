// ═══════════════════════════════════════════════════════════════
//  backend/src/routes/finance.ts
//  Finance Routes — aligned with new interface (types/new.ts)
//  Changes from old:
//    - Transaction: added 'title', type now includes 'sadaqah'
//    - WishlistItem: removed category, link, status
//    - Commitment: type now 'installment'|'savings_group' (was jam-eya)
//      removed: totalInstallments, paidInstallments, status
// ═══════════════════════════════════════════════════════════════

import { Router, Response } from "express";
import { z } from "zod";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, created, noContent, error } from "../shared/utils/response";

const router = Router();

// ── Schemas ──────────────────────────────────────────────────

const transactionSchema = z.object({
  title: z.string().min(1).max(300),
  amount: z.number().positive(),
  type: z.enum(["income", "expense", "sadaqah"]),
  category: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const wishlistSchema = z.object({
  name: z.string().min(1).max(300),
  price: z.number().min(0),
  savedAmount: z.number().min(0).default(0),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
});

const commitmentSchema = z.object({
  name: z.string().min(1).max(300),
  type: z.enum(["installment", "savings_group"]),
  amount: z.number().positive(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// ── Validated CRUD factory ───────────────────────────────────

function validatedCrudRoutes(collectionName: string, createSchema: z.ZodType<any>) {
  const r = Router();
  const col = (uid: string) => db.collection("users").doc(uid).collection(collectionName);
  const updateSchema = createSchema instanceof z.ZodObject ? createSchema.partial() : createSchema;

  // GET
  r.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const snapshot = await col(req.uid!).orderBy("createdAt", "desc").get();
      ok(res, snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch { error(res, 500, `Failed to fetch ${collectionName}`, "SERVER_ERROR"); }
  });

  // POST
  r.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
        return;
      }
      const now = new Date().toISOString();
      const data = { ...parsed.data, createdAt: now, updatedAt: now };
      const ref = await col(req.uid!).add(data);
      created(res, { id: ref.id, ...data });
    } catch { error(res, 500, `Failed to create ${collectionName} item`, "SERVER_ERROR"); }
  });

  // PUT
  r.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        error(res, 400, parsed.error.issues[0]?.message ?? "Invalid input", "VALIDATION_ERROR");
        return;
      }
      const ref = col(req.uid!).doc(req.params.id);
      const data = { ...parsed.data, updatedAt: new Date().toISOString() };
      await ref.update(data);
      const updated = await ref.get();
      if (!updated.exists) { error(res, 404, "Not found", "NOT_FOUND"); return; }
      ok(res, { id: updated.id, ...updated.data() });
    } catch { error(res, 500, `Failed to update ${collectionName} item`, "SERVER_ERROR"); }
  });

  // DELETE
  r.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await col(req.uid!).doc(req.params.id).delete();
      noContent(res);
    } catch { error(res, 500, `Failed to delete ${collectionName} item`, "SERVER_ERROR"); }
  });

  return r;
}

// ── Finance sub-routes ───────────────────────────────────────

router.use("/transactions", validatedCrudRoutes("transactions", transactionSchema));
router.use("/wishlist", validatedCrudRoutes("wishlist", wishlistSchema));
router.use("/commitments", validatedCrudRoutes("commitments", commitmentSchema));

// ── Salary ───────────────────────────────────────────────────

const salaryDoc = (uid: string) => db.collection("users").doc(uid).collection("finance_meta").doc("salary");

// GET /api/v1/finance/salary
router.get("/salary", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await salaryDoc(req.uid!).get();
    const monthlySalary = doc.exists ? (doc.data()?.monthlySalary ?? 0) : 0;
    ok(res, { monthlySalary });
  } catch {
    error(res, 500, "Failed to fetch salary", "SERVER_ERROR");
  }
});

// PUT /api/v1/finance/salary
router.put("/salary", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { monthlySalary } = req.body;
    if (typeof monthlySalary !== "number" || monthlySalary < 0) {
      error(res, 400, "monthlySalary must be a non-negative number", "VALIDATION_ERROR");
      return;
    }
    await salaryDoc(req.uid!).set({ monthlySalary, updatedAt: new Date().toISOString() }, { merge: true });
    ok(res, { monthlySalary });
  } catch {
    error(res, 500, "Failed to update salary", "SERVER_ERROR");
  }
});

export default router;
