import { Router, Response } from "express";
import { db } from "../lib/firebase-admin";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// ── Transactions ──────────────────────────────────────────────────────────────

const txCol = (uid: string) => db.collection("users").doc(uid).collection("transactions");

// GET /api/finance/transactions
router.get("/transactions", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await txCol(req.uid!).orderBy("createdAt", "desc").get();
    res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// POST /api/finance/transactions
router.post("/transactions", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const ref = await txCol(req.uid!).add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch {
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

// PUT /api/finance/transactions/:id
router.put("/transactions/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const ref = txCol(req.uid!).doc(req.params.id);
    const data = { ...req.body, updatedAt: new Date().toISOString() };
    await ref.update(data);
    const updated = await ref.get();
    if (!updated.exists) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ id: updated.id, ...updated.data() });
  } catch {
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// DELETE /api/finance/transactions/:id
router.delete("/transactions/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await txCol(req.uid!).doc(req.params.id).delete();
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

// ── Wishlist ──────────────────────────────────────────────────────────────────

const wishCol = (uid: string) => db.collection("users").doc(uid).collection("wishlist");

// GET /api/finance/wishlist
router.get("/wishlist", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await wishCol(req.uid!).orderBy("createdAt", "desc").get();
    res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// POST /api/finance/wishlist
router.post("/wishlist", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const ref = await wishCol(req.uid!).add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch {
    res.status(500).json({ error: "Failed to create wishlist item" });
  }
});

// PUT /api/finance/wishlist/:id
router.put("/wishlist/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const ref = wishCol(req.uid!).doc(req.params.id);
    const data = { ...req.body, updatedAt: new Date().toISOString() };
    await ref.update(data);
    const updated = await ref.get();
    if (!updated.exists) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ id: updated.id, ...updated.data() });
  } catch {
    res.status(500).json({ error: "Failed to update wishlist item" });
  }
});

// DELETE /api/finance/wishlist/:id
router.delete("/wishlist/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await wishCol(req.uid!).doc(req.params.id).delete();
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete wishlist item" });
  }
});

// ── Commitments ───────────────────────────────────────────────────────────────

const commitCol = (uid: string) => db.collection("users").doc(uid).collection("commitments");

// GET /api/finance/commitments
router.get("/commitments", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await commitCol(req.uid!).orderBy("createdAt", "desc").get();
    res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    res.status(500).json({ error: "Failed to fetch commitments" });
  }
});

// POST /api/finance/commitments
router.post("/commitments", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const ref = await commitCol(req.uid!).add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch {
    res.status(500).json({ error: "Failed to create commitment" });
  }
});

// PUT /api/finance/commitments/:id
router.put("/commitments/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const ref = commitCol(req.uid!).doc(req.params.id);
    const data = { ...req.body, updatedAt: new Date().toISOString() };
    await ref.update(data);
    const updated = await ref.get();
    if (!updated.exists) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ id: updated.id, ...updated.data() });
  } catch {
    res.status(500).json({ error: "Failed to update commitment" });
  }
});

// DELETE /api/finance/commitments/:id
router.delete("/commitments/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await commitCol(req.uid!).doc(req.params.id).delete();
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete commitment" });
  }
});

export default router;
