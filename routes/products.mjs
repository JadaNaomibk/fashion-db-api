import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/conn.mjs";

const router = Router();

/** CREATE */
router.post("/", async (req, res, next) => {
  try {
    const db = getDb();
    const doc = req.body;
    doc.rating ??= { avg: 0.0, count: 0 }; // default rating
    const result = await db.collection("products").insertOne(doc);
    return res.status(201).json({ _id: result.insertedId });
  } catch (e) { next(e); }
});

/** READ — list with filters, pagination, efficient index usage */
router.get("/", async (req, res, next) => {
  try {
    const db = getDb();
    const { brand, minPrice, maxPrice, q, limit = 20, page = 1 } = req.query;

    const filter = {};
    if (brand) filter.brand = brand;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    // text search (uses text index)
    const query = q ? { $text: { $search: q }, ...filter } : filter;

    const sort = (brand || minPrice || maxPrice) ? { price: 1 } : { _id: -1 };

    const lim = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * lim;

    const cursor = db.collection("products")
      .find(query, { projection: { brand: 1, name: 1, price: 1, storeId: 1 } })
      .sort(sort)
      .skip(skip)
      .limit(lim);

    const [items, total] = await Promise.all([
      cursor.toArray(),
      db.collection("products").countDocuments(query)
    ]);

    res.json({ total, page: Number(page), pageSize: lim, items });
  } catch (e) { next(e); }
});

/** READ by id */
router.get("/:id", async (req, res, next) => {
  try {
    const db = getDb();
    const _id = new ObjectId(req.params.id);
    const doc = await db.collection("products").findOne({ _id });
    if (!doc) return res.status(404).json({ error: "Product not found" });
    res.json(doc);
  } catch (e) { next(e); }
});

/** UPDATE (partial) */
router.patch("/:id", async (req, res, next) => {
  try {
    const db = getDb();
    const _id = new ObjectId(req.params.id);
    const update = { $set: req.body, $currentDate: { updatedAt: true } };
    const result = await db.collection("products").updateOne({ _id }, update);
    if (!result.matchedCount) return res.status(404).json({ error: "Product not found" });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (e) { next(e); }
});

/** DELETE */
router.delete("/:id", async (req, res, next) => {
  try {
    const db = getDb();
    const _id = new ObjectId(req.params.id);
    const result = await db.collection("products").deleteOne({ _id });
    if (!result.deletedCount) return res.status(404).json({ error: "Product not found" });
    res.json({ deleted: true });
  } catch (e) { next(e); }
});

/** AGGREGATION: top brands by average price or rating */
router.get("/analytics/top-brands", async (req, res, next) => {
  try {
    const db = getDb();
    const { by = "price", limit = 5 } = req.query;

    const metric = by === "rating" ? "$rating.avg" : "$price";
    const pipeline = [
      { $match: { brand: { $type: "string" }, price: { $type: "double" } } },
      { $group: { _id: "$brand", avgMetric: { $avg: metric }, count: { $sum: 1 } } },
      { $sort: { avgMetric: -1, count: -1 } },
      { $limit: Number(limit) }
    ];

    const results = await db.collection("products").aggregate(pipeline).toArray();
    res.json(results);
  } catch (e) { next(e); }
});

export default router;
