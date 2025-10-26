# 🪩 Fashion Database API

**Project:** SBA 319  
**Built with:** MongoDB + Node.js + Express  

This is my backend project for a the fashion database application.  
It lets you create, read, update, and delete (CRUD) products and stores, and includes some basic data validation, indexing, and one aggregation example for analytics. I was motivated to complete this project because I would love to segway into fashion 🥳

---

## 🚀 How I Built It
I wanted to practice connecting a real MongoDB database to a Node + Express app.  
The main goal was to understand how data flows between the server and the database, how to validate it, and how to make queries faster using indexes.

Here’s the order I built everything:
1. Set up the `index.mjs` file to run an Express server and connect to MongoDB.
2. Created routes for products, stores, and drops.
3. Added validation using JSON schema so data would stay clean.
4. Added compound indexes to help with searching and filtering.


---

## 🧠 What I Learned
- How to organize backend routes for different resources (products, stores, drops).
- How to use MongoDB’s validation and indexing features.
- How to write GET, POST, PATCH, and DELETE endpoints safely.
- How to test APIs and read server logs for errors.
- How to structure `.env` files securely.

---

## 💻 Quick Start for anyone 
```bash
cp .env.example .env     # fill in MONGODB_URI and DB_NAME
npm install
npm run bootstrap        # creates validation & indexes
npm run seed             # optional demo data
npm run dev              # start the server

# visit:
http://localhost:3000/health
```

---

## 📍 Routes Overview

### Health
`GET /health` → `{ ok: true }`

---

### Products
| Method | Route | Description |

| POST | `/api/products` | Create a new product |
| GET | `/api/products` | List all products or filter by brand, price, or search |
| GET | `/api/products/:id` | Read one product by ID |
| PATCH | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| GET | `/api/products/analytics/top-brands` | Get top brands by price or rating |

**Query options:**  
`brand=`, `minPrice=`, `maxPrice=`, `q=` (for text search), `limit=`, `page=`

---

### Stores
Basic CRUD:
```
POST /api/stores
GET /api/stores
GET /api/stores/:id
PATCH /api/stores/:id
DELETE /api/stores/:id
```

---

### Drops (demo)
```
POST /api/drops
GET /api/drops
```

---

## 🧩 Validation Rules
**Products**
- Must include: `brand`, `name`, `price`, `categories`, `storeId`
- Rating defaults to `{ avg: 0, count: 0 }`
- Price must be `>= 0`

**Stores**
- Must include: `name`
- Optional: `neighborhood`, `tags`, or GeoJSON `location`

---

## ⚡ Indexes
- `products: { brand: 1, price: 1 }` → filters/sorts faster  
- `products: { name, brand }` (text) → full-text search  
- `stores: { name: 1 }` → quick lookups  
- `stores: { location: "2dsphere" }` → ready for future geo queries  

---

## 🧪 Example Requests
```bash
# Create store
curl -X POST http://localhost:3000/api/stores \
  -H "Content-Type: application/json" \
  -d '{"name":"SoHo Boutique","neighborhood":"SoHo","tags":["streetwear","upscale"]}'

# Create product (replace <STORE_ID>)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"brand":"AMI","name":"Red Wool Coat","price":599.99,"categories":["outerwear","women"],"storeId":"<STORE_ID>"}'
```

---




## ✨ About This Project
This project helped me understand backend data structure and security better.  
It’s a solid base for building a fashion store inventory or API that connects to a frontend later on.
Fashion companies please hire me 
