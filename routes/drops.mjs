import { Router } from "express";
import { getDb } from "../db/conn.mjs";
const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const db = getDb();
    const result = await db.collection("drops").insertOne(req.body);
    res.status(201).json({ _id: result.insertedId });
  } catch (e) { next(e); }
});

router.get("/", async (_req, res, next) => {
  try {
    const db = getDb();
    const items = await db.collection("drops").find().sort({ _id: -1 }).toArray();
    res.json(items);
  } catch (e) { next(e); }
});

export default router;
