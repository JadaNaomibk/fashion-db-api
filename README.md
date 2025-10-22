# Fashion Database API (SBA 319)

MongoDB + Node + Express backend demonstrating CRUD, validation, indexes, and an aggregation for a simple fashion catalog.

## Quick Start

```bash
cp .env.example .env
# fill in MONGODB_URI and DB_NAME
npm install
npm run bootstrap   # sets validation & indexes
npm run seed        # inserts demo data (optional)
npm run dev         # start server
# visit: http://localhost:3000/health
```

## Routes

### Health
- `GET /health` → `{ ok: true }`

### Products (CRUD + Query + Aggregation)
- `POST /api/products` — create
- `GET /api/products` — list, supports filters
  - `brand=<string>`
  - `minPrice=<number>`
  - `maxPrice=<number>`
  - `q=<text>` (full‑text search on `name` + `brand`)
  - `limit`, `page`
- `GET /api/products/:id` — read by id
- `PATCH /api/products/:id` — partial update
- `DELETE /api/products/:id` — delete
- `GET /api/products/analytics/top-brands?by=price|rating&limit=5` — aggregation

### Stores (CRUD: minimal)
- `POST /api/stores`
- `GET /api/stores`
- `GET /api/stores/:id`
- `PATCH /api/stores/:id`
- `DELETE /api/stores/:id`

### Drops (tiny demo)
- `POST /api/drops`
- `GET /api/drops`

## Validation (JSON Schema)

- `products` requires: `brand (string)`, `name (string)`, `price (double >= 0)`, `categories (array[string] >=1)`, `storeId (objectId)`.
- `rating` is an object with `avg (0..5 double)`, `count (int >= 0)`; defaults to `{avg:0,count:0}` on create.
- `stores` requires `name`, optional `neighborhood`, `tags[]`, and optional GeoJSON `location` (`Point [lng, lat]`).

## Indexes

- `products`: `{ brand: 1, price: 1 }` — efficient filtering & sorting by brand/price; enables potential covered queries when projecting indexed fields only.
- `products`: text index on `{ name, brand }` — supports `q` full‑text search.
- `stores`: `{ name: 1 }` — quick lookups.
- `stores`: `{ location: "2dsphere" }` — ready for geo queries later.

## Example cURL

```bash
# Create store
curl -X POST http://localhost:3000/api/stores  -H "Content-Type: application/json"  -d '{"name":"SoHo Boutique","neighborhood":"SoHo","tags":["streetwear","upscale"]}'

# Create product (replace <STORE_ID>)
curl -X POST http://localhost:3000/api/products  -H "Content-Type: application/json"  -d '{"brand":"AMI","name":"Red Wool Coat","price":599.99,"categories":["outerwear","women"],"storeId":"<STORE_ID>","rating":{"avg":4.8,"count":17}}'

# Filtered list (uses compound index)
curl "http://localhost:3000/api/products?brand=AMI&minPrice=100&maxPrice=800&limit=10&page=1"

# Full-text search
curl "http://localhost:3000/api/products?q=red+coat"

# Aggregation
curl "http://localhost:3000/api/products/analytics/top-brands?by=price&limit=5"
```

## Notes
- Keep `.env` out of version control. Use `.env.example` for classmates/instructors.
- `npm run bootstrap` can be re-run safely; it updates validation and ensures indexes.
- This repo keeps code minimal, secure, and professional: body size limits, error handlers, and no secrets committed.
