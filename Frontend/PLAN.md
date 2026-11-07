# DS-Accounts — Frontend Design & Implementation Plan

**Status:** In progress · **Date:** 2026-11-08
**Scope:** Income module UI — a records table (filter / search / sort / paginate, add-edit-delete) and an analytics dashboard, both driven by the Phase-1 backend API.

---

## 1. Stack

| Concern    | Choice                                  | Why |
|------------|-----------------------------------------|-----|
| Build/React| Vite + React 19 (JavaScript)            | already scaffolded |
| UI kit     | **Mantine** (`@mantine/core`, `hooks`, `dates`, `notifications`) | polished Table / Select / DatePicker / Modal / toasts out of the box; themeable so it isn't generic |
| Charts     | **@mantine/charts** (wraps Recharts)    | charts that match the UI theme |
| Data       | **TanStack Query** (`@tanstack/react-query`) | caching, loading/error, auto-refetch on filter change |
| Routing    | **react-router-dom**                    | two pages (Dashboard, Records) |
| Dates      | **dayjs**                               | Mantine dates peer dep + formatting |
| Icons      | **@tabler/icons-react**                 | Mantine's icon set |

---

## 2. Architecture

```
Frontend/src/
├── api/
│   ├── client.js        # fetch wrapper: base URL, JSON, unwraps { success, data, meta }, throws ApiError
│   ├── incomes.js       # list / get / create / update / remove / analytics
│   └── meta.js          # service-types, health
├── hooks/               # TanStack Query hooks
│   ├── useServiceTypes.js
│   ├── useIncomes.js    # list (filters+sort+page)
│   ├── useAnalytics.js
│   └── useIncomeMutations.js  # create/update/delete (invalidate queries)
├── components/
│   ├── layout/AppLayout.jsx   # Mantine AppShell + top nav
│   ├── FilterBar.jsx          # shared: period + service type (+ search on Records)
│   ├── PeriodFilter.jsx       # All / Year / Month+Year / Date / Range
│   ├── ServiceTypeSelect.jsx
│   ├── IncomeTable.jsx        # sortable columns, row actions
│   ├── IncomeFormModal.jsx    # add / edit
│   ├── Pagination.jsx
│   ├── KpiCard.jsx
│   └── charts/ (ByServiceBar, TrendArea, ServiceDonut)
├── pages/
│   ├── DashboardPage.jsx
│   └── RecordsPage.jsx
├── lib/
│   ├── format.js        # INR currency, date formatting
│   └── filters.js       # UI filter state <-> API query params
├── theme.js             # Mantine theme (accent color, font, radius)
├── App.jsx              # routes
└── main.jsx             # providers: Mantine + QueryClient + Router
```

**Config:** `VITE_API_BASE_URL` (default `http://localhost:5000/api/v1`) in `.env`.

---

## 3. Filter model (shared by both pages)

UI filter state → backend query params (matches PLAN §6 of the backend):

| UI control                | API param(s)        |
|---------------------------|---------------------|
| Period = Year             | `year`              |
| Period = Month + Year     | `year` + `month`    |
| Period = Specific date    | `date`              |
| Period = Custom range     | `from` + `to`       |
| Service type              | `serviceType`       |
| Search box (Records only) | `search`            |
| Sort (table headers)      | `sortBy` + `order`  |
| Pagination                | `page` + `limit`    |

`lib/filters.js` converts the filter state object into a query string; the TanStack Query key includes the filter object, so any change auto-refetches.

---

## 4. Pages

### Records
- FilterBar (period + service type) + **search** input (debounced) + **Add income** button.
- **IncomeTable:** Date · Customer · Service Type · Amount (₹) · actions. Sortable headers (toggle asc/desc).
- **Pagination** footer ("showing X–Y of Z", page + page-size).
- **Add/Edit** modal (name, amount, service-type select, date picker) → create/update; **delete** with confirm; success/error toasts.
- States: loading skeleton, empty state, error.

### Dashboard
- Same FilterBar (period + service type).
- **KPI cards:** Total Revenue (₹), Total Transactions, Avg / transaction, Top service.
- **ByServiceBar:** revenue (toggle count) per service type — horizontal (12 longish labels).
- **TrendArea:** revenue over months (from `trend`).
- **ServiceDonut:** share of transactions by service type.
- Re-queries on every filter change.

---

## 5. Theming / UX
- Custom Mantine theme: one accent color, font, radius, default light scheme (+ dark toggle if cheap) → avoids the stock look.
- Currency formatted as INR (`₹1,23,456.50`), dates human-readable.
- Responsive: table scrolls on small screens; dashboard cards/charts reflow.

---

## 6. Phases
1. **Foundation** (this step): deps, structure, providers (Mantine + Query + Router), `api/client.js`, `.env`, theme, AppLayout + 2 placeholder routes; verify dev server boots.
2. **API layer + hooks**: `api/incomes.js`, `api/meta.js`, query hooks; verify against the running backend.
3. **Records page**: table, filters, search, sort, pagination, add/edit/delete.
4. **Dashboard page**: KPI cards + 3 charts.
5. **Polish**: empty/loading/error states, responsiveness, theme pass.
