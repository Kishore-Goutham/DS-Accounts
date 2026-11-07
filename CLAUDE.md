# CLAUDE.md

Guidance for working in this repository.

## Project

**DS-Accounts** — a web app to record and analyze a driving-licence service business's **income** (expenditure module planned later). Users log transactions (customer name, amount, service type, date) and view them in a filterable/sortable table plus an analytics dashboard (total revenue, per-service breakdown, trend over time).

The full design lives in **`Backend/PLAN.md`** — read it before implementing backend features; keep it in sync when the design changes.

## Layout

```
DS-Accounts/
├── Backend/     Node.js 22 + Express 5 + Mongoose 8 (MongoDB Atlas)  — ES modules
├── Frontend/    React + Vite (JavaScript)
└── Backend/PLAN.md Backend design & implementation plan
```
## Working Rules (IMPORTANT)

1. **Always explain first** — what we are building, why, which pattern we follow
2. **Show the plan** — which files change, what the structure looks like
3. **Get approval** — wait for user to say yes before writing any file
4. **One step at a time** — never build multiple things at once
5. **EFFICIENCY** — Work like a senior developer, make no mistakes, always follow best practices
6. **After every implementation** — always tell the user exactly how to test and verify it worked (what to run, what to check, what the expected output is)
7. **Handle edge cases** — check for all edge cases always


## Commands

**Backend** (`cd Backend`)
- `npm run dev` — start with nodemon (auto-reload) on http://localhost:5000
- `npm start` — start with node
- Requires `Backend/.env` (see `Backend/.env.example`)

**Frontend** (`cd Frontend`)
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Backend conventions

- **Pattern:** MVC + service + repository layers. Controllers do HTTP only; services hold business logic (build filters, orchestrate, shape results); repositories do all DB access (Mongoose queries & aggregations). Only repositories touch Mongoose.
  `routes → validator → controller → service → repository → model`
- **File naming:** `*.model.js`, `*.controller.js`, `*.service.js`, `*.repository.js`, `*.routes.js`, `*.validator.js`.
- **API base path:** `/api/v1`.
- **Response envelope:** always
  - success: `{ "success": true, "data": ..., "meta": ... }`
  - error: `{ "success": false, "error": { "message": ..., "details": ... } }`
- **Validation:** `zod` at the request edge (`middlewares/validate.js`); Mongoose schema as second line.
- **Errors:** throw `ApiError`; let the central `errorHandler` middleware format the response. Wrap async controllers in `asyncHandler`.
- **Filters:** list and analytics endpoints share the same query params (`serviceType`, `search`, `date`, `from`/`to`, `year`, `month`); `search` is a regex-escaped, case-insensitive `customerName` match. Date logic lives in `utils/dateFilter.js`. Keep filters consistent across both.

## Key facts & gotchas

- **Service types** are defined once in `Backend/src/constants/serviceTypes.js`. This is the single source of truth — the model enum, the `/service-types` endpoint, and the frontend dropdown all derive from it. Add/rename types only here.
- **Database:** MongoDB Atlas. The connection string in `Backend/.env` points at the **`ds-accounts`** database (same cluster as the user's other apps — do not change the DB name to one in use elsewhere).
- **Secrets:** only in `Backend/.env` (gitignored). Never put real credentials in `.env.example` or commit them.
- **Route order:** register `/incomes/analytics` before `/incomes/:id` so it isn't captured as an id.
- **Sorting:** only whitelisted fields (`date`, `amount`, `customerName`, `serviceType`) — never pass raw user input to Mongo sort.
- **Amount:** stored as a `Number` in **INR** (decimals allowed).
- **Auth:** none for now (single trusted user); may be added later — keep that in mind when structuring routes/middleware.


