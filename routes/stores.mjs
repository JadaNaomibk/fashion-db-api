import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/conn.mjs";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const db = getDb();
    const result = await db.collection("stores").insertOne(req.body);
    res.status(201).json({ _id: result.insertedId });
  } catch (e) { next(e); }
});

router.get("/", async (_req, res, next) => {
  try {
    const db = getDb();
    const items = await db.collection("stores").find({}, { projection: { name: 1, neighborhood: 1, tags: 1 } }).toArray();
    res.json(items);
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const db = getDb();
    const doc = await db.collection("stores").findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: "Store not found" });
    res.json(doc);
  } catch (e) { next(e); }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const db = getDb();
    const result = await db.collection("stores").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body, $currentDate: { updatedAt: true } }
    );
    if (!result.matchedCount) return res.status(404).json({ error: "Store not found" });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const db = getDb();
    const result = await db.collection("stores").deleteOne({ _id: new ObjectId(req.params.id) });
    if (!result.deletedCount) return res.status(404).json({ error: "Store not found" });
    res.json({ deleted: true });
  } catch (e) { next(e); }
});

export default router;
