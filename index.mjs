import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./db/conn.mjs";
import productsRouter from "./routes/products.mjs";
import storesRouter from "./routes/stores.mjs";
import dropsRouter from "./routes/drops.mjs";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3000;

/** ===== Global middleware (order matters) ===== */
app.use(express.json({ limit: "100kb" }));        // security: size limit
app.disable("x-powered-by");                       // security: hide Express
app.use((req, _res, next) => {                     // tiny request logger
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

/** ===== Healthcheck ===== */
app.get("/health", (_req, res) => res.json({ ok: true }));

/** ===== Routes ===== */
app.use("/api/products", productsRouter);
app.use("/api/stores", storesRouter);
app.use("/api/drops", dropsRouter);

/** ===== 404 & Error handlers ===== */
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

await connectToDatabase();                         // connect before listening
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
