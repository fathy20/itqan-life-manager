import { Router, Response } from "express";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { ok, created, noContent, error } from "../shared/utils/response";

const router = Router();

// ── Helper: generic CRUD for a sub-collection ─────────────────────────────────
function crudRoutes(collectionName: string) {
  const r = Router();
  const col = (uid: string) => db.collection("users").doc(uid).collection(collectionName);

  r.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const snapshot = await col(req.uid!).orderBy("createdAt", "desc").get();
      ok(res, snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch { error(res, 500, `Failed to fetch ${collectionName}`, "SERVER_ERROR"); }
  });

  r.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const data = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const ref = await col(req.uid!).add(data);
      created(res, { id: ref.id, ...data });
    } catch { error(res, 500, `Failed to create ${collectionName} item`, "SERVER_ERROR"); }
  });

  r.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const ref = col(req.uid!).doc(req.params.id);
      const data = { ...req.body, updatedAt: new Date().toISOString() };
      await ref.update(data);
      const updated = await ref.get();
      if (!updated.exists) { error(res, 404, "Not found", "NOT_FOUND"); return; }
      ok(res, { id: updated.id, ...updated.data() });
    } catch { error(res, 500, `Failed to update ${collectionName} item`, "SERVER_ERROR"); }
  });

  r.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      await col(req.uid!).doc(req.params.id).delete();
      noContent(res);
    } catch { error(res, 500, `Failed to delete ${collectionName} item`, "SERVER_ERROR"); }
  });

  return r;
}

// ── Transactions ──────────────────────────────────────────────────────────────
router.use("/transactions", crudRoutes("transactions"));

// ── Wishlist ──────────────────────────────────────────────────────────────────
router.use("/wishlist", crudRoutes("wishlist"));

// ── Commitments ───────────────────────────────────────────────────────────────
router.use("/commitments", crudRoutes("commitments"));

// ── Salary ────────────────────────────────────────────────────────────────────

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
