import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI, {
  auth: {
    username: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASS,
  },
});

const DB_NAME = process.env.DB_NAME; // <-- define it

const productsValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["brand", "name", "price", "categories", "storeId"],
    additionalProperties: true,
    properties: {
      brand: { bsonType: "string", description: "brand is required" },
      name:  { bsonType: "string", description: "name is required" },
      price: { bsonType: "double", minimum: 0, description: "price >= 0" },
      categories: {
        bsonType: "array",
        minItems: 1,
        items: { bsonType: "string" }
      },
      storeId: { bsonType: "objectId", description: "ref to stores._id" },
      rating: {
        bsonType: "object",
        required: ["avg", "count"],
        properties: {
          avg:   { bsonType: "double", minimum: 0, maximum: 5 },
          count: { bsonType: "int", minimum: 0 }
        }
      }
    }
  }
};

const storesValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name"],
    properties: {
      name: { bsonType: "string" },
      neighborhood: { bsonType: "string" },
      tags: { bsonType: "array", items: { bsonType: "string" } },
      location: {
        bsonType: "object",
        required: ["type", "coordinates"],
        properties: {
          type: { enum: ["Point"] },
          coordinates: {
            bsonType: "array",
            items: { bsonType: "double" },
            minItems: 2, maxItems: 2
          }
        }
      }
    }
  }
};

async function ensureCollection(db, name, validator) {
  const exists = await db.listCollections({ name }).toArray();
  if (exists.length === 0) {
    await db.createCollection(name, { validator, validationAction: "error" });
  } else {
    await db.command({ collMod: name, validator, validationLevel: "strict", validationAction: "error" });
  }
}

async function main() {
  await client.connect();
  const db = client.db(DB_NAME);

  await ensureCollection(db, "products", productsValidator);
  await ensureCollection(db, "stores", storesValidator);
  await ensureCollection(db, "drops", { $jsonSchema: { bsonType: "object" } });

  await db.collection("products").createIndex({ brand: 1, price: 1 });
  await db.collection("products").createIndex({ name: "text", brand: "text" });
  await db.collection("stores").createIndex({ name: 1 });
  await db.collection("stores").createIndex({ location: "2dsphere" });

  console.log("Validation & indexes ensured.");
  await client.close();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
