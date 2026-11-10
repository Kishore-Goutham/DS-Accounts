# DS-Accounts — Backend Design & Implementation Plan

**Status:** Phases 1–4 implemented · **Date:** 2026-11-07 (Payment module added 2026-11-10)
**Scope:** Income module (backend + frontend) and the Payment/expenditure module (backend + frontend + dashboard net view). See §12 for the Payment module.

---

## 1. Overview

A web application to record and analyze a driving-licence service business's **income** (and later **expenditure**).

A user records each transaction with:
- **Customer name**
- **Amount** (INR)
- **Service type** — one of a fixed list (12 today)
- **Date** of the transaction (defaults to now, editable)

The app then provides:
- A **records table** with filtering, sorting, and pagination.
- A **dashboard** with aggregated analytics: total revenue, count & revenue per service type, and trend over time — all under the same dynamic filters (specific date / month+year / year / date range).

This document covers the **backend** only. UI is designed later.

---

## 2. Tech Stack

| Layer      | Choice                                | Notes |
|------------|---------------------------------------|-------|
| Runtime    | Node.js 22 (ES modules)               | installed |
| Framework  | Express 5                             | installed |
| Database   | MongoDB Atlas (free cluster)          | `ds-accounts` DB, connection verified |
| ODM        | Mongoose 8                            | schema, validation, indexes |
| Validation | `zod` (request-level)                 | validate/parse input before it reaches controllers |
| Security   | `helmet`, `express-rate-limit`, `cors`, `express-mongo-sanitize` | baseline hardening |
| Logging    | `morgan` (HTTP) + lightweight logger  | request logs in dev, structured later |
| Dev        | `nodemon`                             | installed |
| Tests      | `vitest` + `supertest` (optional, phase 2) | API integration tests |

---

## 3. Architecture — MVC + Service + Repository layers

Classic MVC, with a **service layer** for business logic and a **repository layer** for data access.
Only the repository touches Mongoose, so the data layer is swappable and the business logic is testable in isolation.

```
Request
  → Route            (path + method → middleware chain)
  → Validator        (zod: shape/coerce query & body; reject bad input early)
  → Controller       (HTTP concerns only: read req, call service, send response)
  → Service          (business logic: build filters, apply precedence, orchestrate, shape results, throw ApiError)
  → Repository       (DB access only: Mongoose queries & aggregation pipelines)
  → Model (Mongoose) (schema, validation, indexes)
  → MongoDB
  ← ApiResponse / ApiError (consistent JSON shape)
```

**Layer responsibilities**

| Layer       | Owns                                                                 | Must NOT                          |
|-------------|----------------------------------------------------------------------|-----------------------------------|
| Controller  | Read `req`, call one service method, send `ApiResponse`              | contain business logic or DB calls |
| Service     | Build the Mongo filter from params, apply filter precedence, orchestrate repo calls, assemble the analytics payload, throw `ApiError` (e.g. not found) | call Mongoose directly            |
| Repository  | Thin Mongoose wrappers: `create`, `findMany(filter, sort, page)`, `countDocuments(filter)`, `findById`, `updateById`, `deleteById`, and the aggregation methods | know about HTTP or req/res        |
| Model       | Schema, enum, indexes                                                | —                                 |

### Folder structure

```
Backend/
├── src/
│   ├── config/
│   │   ├── env.js            # load + validate env vars on startup (fail fast)
│   │   └── db.js             # mongoose connection (+ graceful handling)
│   ├── constants/
│   │   └── serviceTypes.js   # single source of truth for the 12 service types
│   ├── models/
│   │   └── income.model.js   # Income schema, enum, indexes
│   ├── repositories/
│   │   └── income.repository.js # all Mongoose access: queries + aggregation pipelines
│   ├── services/
│   │   └── income.service.js # business logic: filter building, orchestration, analytics assembly
│   ├── controllers/
│   │   └── income.controller.js
│   ├── validators/
│   │   └── income.validator.js  # zod schemas for body + query
│   ├── routes/
│   │   ├── index.js          # mounts all feature routers under /api/v1
│   │   ├── income.routes.js
│   │   └── meta.routes.js    # GET /service-types
│   ├── middlewares/
│   │   ├── validate.js       # runs a zod schema, attaches parsed data
│   │   ├── errorHandler.js   # central error → JSON
│   │   └── notFound.js       # 404 for unknown routes
│   ├── utils/
│   │   ├── asyncHandler.js   # wraps async controllers, forwards errors
│   │   ├── ApiError.js       # typed operational errors (statusCode + message)
│   │   ├── ApiResponse.js    # standard success envelope
│   │   └── dateFilter.js     # builds a Mongo date range from query params
│   ├── app.js                # express app: middleware + routes + error handler
│   └── server.js             # bootstrap: validate env → connect DB → listen
├── .env                      # secrets (gitignored)
├── .env.example              # template
└── package.json
```

> **Naming:** files use `*.model.js`, `*.repository.js`, `*.service.js`, `*.controller.js`, `*.routes.js`, `*.validator.js` suffixes so role is obvious.

---

## 4. Data Model — `Income`

Collection: `incomes`

| Field          | Type     | Required | Rules / Default                              |
|----------------|----------|----------|-----------------------------------------------|
| `customerName` | String   | yes      | trimmed, 1–120 chars                          |
| `amount`       | Number   | yes      | `> 0`, finite, INR (decimals allowed)         |
| `serviceType`  | String   | yes      | must be one of `SERVICE_TYPES` (enum)         |
| `date`         | Date     | no       | defaults to `Date.now`                        |
| `createdAt`    | Date     | auto     | Mongoose timestamps                           |
| `updatedAt`    | Date     | auto     | Mongoose timestamps                           |

**Indexes**
- `{ date: -1 }` — table default sort & date-range filters
- `{ serviceType: 1, date: -1 }` — filter by service + date together
- (text index on `customerName` deferred until search is needed)

**Service types (12)** — defined once in `constants/serviceTypes.js`:
```
New driving licence · New conductor licence · Renewal of driving licence ·
Re test driving licence · Badge · Change of address · Change of name ·
Duplicate driving licence · IDPL · Driving licence extract ·
Hazardous licence · Heavy driving licence
```
Adding/renaming a type is a one-line change here; it flows to the model enum, the `/service-types` endpoint, and the frontend.

> **Future (expenditure):** either a parallel `Expenditure` model, or a shared `Transaction` model with a `type: "income" | "expense"` discriminator. Recommendation: **separate models** now (income has `serviceType`, expense will have `category`), reconsider a shared base if they converge.

---

## 5. API Design

Base path: **`/api/v1`**. All responses use a consistent envelope.

**Success**
```json
{ "success": true, "data": <payload>, "meta": { ...optional (pagination) } }
```
**Error**
```json
{ "success": false, "error": { "message": "...", "details": [ ... ] } }
```

### Endpoints

| Method | Path                      | Purpose                                   |
|--------|---------------------------|-------------------------------------------|
| GET    | `/health`                 | liveness check                            |
| GET    | `/service-types`          | list the 12 service types (for dropdowns) |
| POST   | `/incomes`                | create an income record                   |
| GET    | `/incomes`                | list records — filter + sort + paginate   |
| GET    | `/incomes/analytics`      | aggregated dashboard data (same filters)  |
| GET    | `/incomes/:id`            | fetch one record                          |
| PUT    | `/incomes/:id`            | update a record                           |
| DELETE | `/incomes/:id`            | delete a record                           |

> Route order: `/incomes/analytics` is registered **before** `/incomes/:id` so it isn't captured as an id.

### POST `/incomes` — request body
```json
{ "customerName": "Asha", "amount": 500, "serviceType": "New driving licence", "date": "2026-11-07" }
```
`date` optional. Validated by zod → Mongoose. Returns `201` with the created record.

---

## 6. Filtering (shared by list & analytics)

All filters are **optional** and **composable**. The same query params drive both the table and the dashboard, so the UI filter bar is identical in both places.

| Param         | Example                 | Meaning                                              |
|---------------|-------------------------|------------------------------------------------------|
| `serviceType` | `Badge`                 | exact match on one service type                      |
| `search`      | `asha`                  | case-insensitive partial match on `customerName` (regex-escaped) |
| `year`        | `2026`                  | all records in that calendar year                    |
| `month`       | `11`                    | month 1–12; **combined with `year`** (defaults to current year if `year` omitted) |
| `date`        | `2026-11-07`            | a single calendar day                                |
| `from`        | `2026-10-01`            | range start (inclusive)                              |
| `to`          | `2026-11-07`            | range end (inclusive)                                |

**Precedence** (first match wins, so params don't conflict):
1. `date` (single day) →
2. `from`/`to` (range) →
3. `year` and/or `month` →
4. none → all records.

Built in `utils/dateFilter.js` (returns a Mongo `{ date: { $gte, $lt } }` clause); the **service** calls it and ANDs `serviceType` and `search` (a regex-escaped, case-insensitive `customerName` match) on top, then hands the finished filter to the repository.

> **Timezone note:** v1 builds day/month/year boundaries in **server local time**. If the deployed server runs a different timezone than the user, boundaries could shift by hours. Documented now; if it matters we add an explicit `tz` param / store an offset. Flag for later.

### Sorting (list only)
| Param    | Values                                             | Default   |
|----------|----------------------------------------------------|-----------|
| `sortBy` | `date` · `amount` · `customerName` · `serviceType` | `date`    |
| `order`  | `asc` · `desc`                                     | `desc`    |

Only whitelisted fields are accepted (no arbitrary sort injection).

### Pagination (list only)
| Param   | Default | Max |
|---------|---------|-----|
| `page`  | 1       | —   |
| `limit` | 25      | 100 |

Response `meta`:
```json
{ "page": 1, "limit": 25, "total": 134, "totalPages": 6 }
```

---

## 7. Analytics — GET `/incomes/analytics`

Accepts the **same filter params** as the list. The repository runs MongoDB aggregation pipelines (not JS loops); the service assembles them into one payload.

```json
{
  "success": true,
  "data": {
    "totalRevenue": 48500,
    "totalCount": 97,
    "byService": [
      { "serviceType": "New driving licence", "count": 30, "revenue": 18000 },
      { "serviceType": "Renewal of driving licence", "count": 15, "revenue": 7500 }
    ],
    "trend": [
      { "year": 2026, "month": 10, "count": 40, "revenue": 20000 },
      { "year": 2026, "month": 11, "count": 57, "revenue": 28500 }
    ]
  }
}
```

- `byService` — one row per service type present in the filtered set (`count` + `revenue`), sorted by revenue desc. Powers the "driving licence 10, renewal 5" breakdown.
- `trend` — grouped by year+month, sorted chronologically. Powers the time-series chart on the dashboard.
- `totalRevenue` / `totalCount` — headline KPI cards.

---

## 8. Validation & Error Handling

- **Request validation** with `zod` in `middlewares/validate.js`: coerces & checks `body`/`query`, rejects with `400` + field details before hitting the controller. (e.g. `amount` must be a positive number, `serviceType` must be in the enum, `month` is 1–12.)
- **Schema validation** at the Mongoose layer as a second line of defense.
- **Central error handler** maps:
  - zod error → `400` with `details`
  - Mongoose `ValidationError` → `400`
  - Mongoose `CastError` (bad `:id`) → `400`
  - `ApiError` (thrown operationally, e.g. not found) → its `statusCode`
  - anything else → `500` (logged, generic message to client)
- `asyncHandler` wraps controllers so rejected promises reach the error handler (no unhandled rejections).
- `notFound` middleware returns a JSON `404` for unknown routes.

---

## 9. Configuration & Security (production-grade)

- **`config/env.js`** validates required env vars at startup (`MONGODB_URI`, `PORT`) and **fails fast** with a clear message if missing.
- **Secrets** only in `.env` (gitignored); `.env.example` committed as the template.
- **`helmet`** — secure HTTP headers.
- **`cors`** — restricted to the frontend origin via an env var (`CORS_ORIGIN`), not wide-open in production.
- **`express-rate-limit`** — basic abuse protection on `/api`.
- **`express-mongo-sanitize`** — strip `$`/`.` operators from input (NoSQL injection).
- **Body size limit** on `express.json()`.
- **Graceful shutdown** — close HTTP server and Mongoose connection on `SIGINT`/`SIGTERM`.
- **Logging** — `morgan` in dev; structured logs ready to swap in for prod.

---

## 10. Implementation Phases

**Phase 1 — Core income backend (this phase)**
1. `constants/serviceTypes.js`
2. `config/env.js`, refactor `config/db.js`
3. `models/income.model.js`
4. `utils/`: `asyncHandler`, `ApiError`, `ApiResponse`, `dateFilter`
5. `validators/income.validator.js` (zod)
6. `middlewares/`: `validate`, `errorHandler`, `notFound`
7. `repositories/income.repository.js` (Mongoose queries + aggregation pipelines)
8. `services/income.service.js` (filter building, orchestration, analytics assembly)
9. `controllers/income.controller.js`
10. `routes/` wiring + `meta.routes.js`
11. `app.js` / `server.js` refactor (security middleware, versioned mount)
12. Manual smoke test of every endpoint (seed a few records, verify filters/sort/analytics)

**Phase 2 — Hardening & tests (optional, soon)**
- `vitest` + `supertest` integration tests
- Seed script for sample data
- ESLint + Prettier

**Phase 3 — Frontend**
- Records table (filters/sort/pagination wired to `/incomes`)
- Dashboard (KPIs, per-service breakdown, trend chart via `/incomes/analytics`)

**Phase 4 — Expenditure ("Payment") module** — ✅ implemented (see §12)
- Mirrors the income design with a free-text `source` (+ optional `note`).
- Dashboard adds Total expenses / Net profit KPIs and a net-per-month trend.

---

## 11. Decisions

**Resolved**
1. **Architecture:** MVC + service + repository layers (only repositories touch Mongoose).
2. **Validation lib:** `zod`.
3. **API versioning:** mount under `/api/v1`.
4. **Edit/Delete:** `PUT`/`DELETE` included in Phase 1.
5. **Amount:** stored as `Number` in INR (decimals allowed).
6. **Auth:** none for now (single trusted user); may be added later.

**Deferred (revisit when needed)**
- **Timezone** handling for date boundaries (see §6) — add a `tz` param if the server/user timezones diverge.
- **Auth** layer (login/roles) if the app becomes multi-user.
- **Tests, seed script, linting** (Phase 2).

---

## 12. Payment (Expenditure) module — Phase 4

Implemented 2026-11-10. A **separate** module mirroring Income (per the §4
recommendation), not a shared Transaction model. The key difference: a payment's
**`source` is free text** (no fixed enum like `serviceType`), plus an optional
free-text `note`.

### Data model — `Payment`

Collection: `payments`

| Field    | Type   | Required | Rules / Default                         |
|----------|--------|----------|------------------------------------------|
| `source` | String | yes      | trimmed, 1–120 chars (free text)         |
| `amount` | Number | yes      | `> 0`, finite, INR (decimals allowed)    |
| `note`   | String | no       | trimmed, ≤ 300 chars, defaults to `""`   |
| `date`   | Date   | no       | defaults to `Date.now`                   |
| `createdAt` / `updatedAt` | Date | auto | Mongoose timestamps              |

**Indexes:** `{ date: -1 }`, `{ source: 1, date: -1 }` (same access paths as Income).

### Architecture

Same layering and file naming as Income, as a parallel stack:
`payment.model.js` · `payment.repository.js` · `payment.service.js` ·
`payment.controller.js` · `payment.validator.js` · `payment.routes.js`
(mounted at `/api/v1/payments` in `routes/index.js`).

### Endpoints — base `/api/v1/payments`

| Method | Path                 | Purpose                                      |
|--------|----------------------|----------------------------------------------|
| POST   | `/payments`          | create a payment                             |
| GET    | `/payments`          | list — filter + sort + paginate              |
| GET    | `/payments/analytics`| aggregated totals (same filters)             |
| GET    | `/payments/sources`  | distinct sources used (for autocomplete)     |
| GET    | `/payments/:id`      | fetch one                                    |
| PUT    | `/payments/:id`      | update                                       |
| DELETE | `/payments/:id`      | delete                                       |

> Route order: `/analytics` and `/sources` are registered **before** `/:id`.

### Filtering / sorting

Reuses `utils/dateFilter.js` (same date precedence as §6). Text filters target the
`source` field: `source` (exact, optional) and `search` (regex-escaped, case-
insensitive partial). If both are sent, `search` wins. The frontend uses `search`.
Sort whitelist: `date` · `amount` · `source` (default `date` desc). Pagination
identical to Income.

### Analytics — GET `/payments/analytics`

```json
{
  "success": true,
  "data": {
    "totalExpense": 18100,
    "totalCount": 3,
    "bySource": [ { "source": "Rent", "count": 1, "amount": 15000 } ],
    "trend":    [ { "year": 2026, "month": 10, "count": 2, "amount": 17300 } ]
  }
}
```

### Frontend

- **Payments page** (`/payments`) mirrors Records: period + source-search filter,
  sortable table (Date · Source · Amount, note shown dimmed), pagination,
  add/edit/delete. Source entry is an **Autocomplete** seeded from
  `/payments/sources`. Same mobile-card layout as Income.
- **Nav:** `Dashboard · Income · Payments` (the old "Records" label is now
  "Income"; route stays `/records`). Collapses to icon-only buttons below `sm`.
- **Dashboard:** fetches income **and** payment analytics under the same filters;
  adds **Total expenses** and **Net profit** (income − expenses, with % margin)
  KPI cards, and the monthly trend graph now plots **net** (income − expenses)
  per month instead of gross income. Service breakdown + donut stay income-only.

> Shared frontend pieces (`FilterBar`, `SortControl`, `useSortParams`) were
> extended with backward-compatible props (`withServiceType`, `searchPlaceholder`,
> `fields`) so the income side is unchanged.

### Not done yet
- Backend `CORS_ORIGIN` lockdown + frontend Static Site deploy on Render.
- Optional: payments-by-source breakdown on the dashboard (backend already
  returns `bySource`; UI intentionally omitted for now).
