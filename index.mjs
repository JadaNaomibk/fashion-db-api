// index.mjs 

import express from "express";
import dotenv from "dotenv";
import { connectToDatabase } from "./db/conn.mjs";
import productsRouter from "./routes/products.mjs";
import storesRouter from "./routes/stores.mjs";
import dropsRouter from "./routes/drops.mjs";


dotenv.config();


const app = express();
const PORT = Number(process.env.PORT) || 3000;


app.disable("x-powered-by");
app.use(express.json());

app.get("/", (_req, res) => res.send("Fashion DB API is running yeaaa :)"));
app.get("/health", (_req, res) => res.json({ ok: true }));

// 5) Mount your feature routers
app.use("/api/products", productsRouter);
app.use("/api/stores", storesRouter);
app.use("/api/drops", dropsRouter);

// 6) Simple 404 handler (last route)
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// 7) Start the server only after DB connects
try {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`API listening at http://localhost:${PORT}`);
  });
} catch (err) {
  console.error("Startup failed:", err);
  process.exit(1);
}
