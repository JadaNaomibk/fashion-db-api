import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI, {
  auth: {
    username: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASS,
  },
});
let db;

export async function connectToDatabase() {
  if (db) return db; // reuse singleton connection
  await client.connect();
  db = client.db(process.env.DB_NAME);
  // warm up handles
  db.collection("products");
  db.collection("stores");
  db.collection("drops");
  return db;
}

export function getDb() {
  if (!db) throw new Error("Database not initialized. Call connectToDatabase() first.");
  return db;
}
