import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
const DB_NAME = process.env.DB_NAME;

async function main() {
  await client.connect();
  const db = client.db(DB_NAME);
  const stores = db.collection("stores");
  const products = db.collection("products");

  const { insertedId: sohoId } = await stores.insertOne({
    name: "SoHo Boutique",
    neighborhood: "SoHo",
    tags: ["streetwear","upscale"]
  });

  const { insertedId: williamsburgId } = await stores.insertOne({
    name: "Williamsburg Threads",
    neighborhood: "Williamsburg",
    tags: ["indie","vintage"]
  });

  await products.insertMany([
    { brand: "AMI", name: "Red Wool Coat", price: 599.99, categories: ["outerwear","women"], storeId: sohoId, rating: { avg: 4.8, count: 17 } },
    { brand: "Y-3", name: "Tech Runner", price: 349.00, categories: ["sneakers","men"], storeId: williamsburgId, rating: { avg: 4.5, count: 50 } },
    { brand: "Staud", name: "Moon Bag Mini", price: 295.00, categories: ["bags","women"], storeId: sohoId, rating: { avg: 4.6, count: 23 } },
    { brand: "AMI", name: "Logo Tee", price: 125.00, categories: ["tops","unisex"], storeId: sohoId, rating: { avg: 4.2, count: 120 } }
  ]);

  console.log("Seeded demo data.");
  await client.close();
}

main().catch(err => { console.error(err); process.exit(1); });
