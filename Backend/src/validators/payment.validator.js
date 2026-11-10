import { z } from "zod";

// --- reusable pieces ---------------------------------------------------------

// "YYYY-MM-DD" that is also a real calendar date (rejects 2026-13-40).
const ymd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be in YYYY-MM-DD format")
  .refine((s) => {
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }, { message: "is not a valid calendar date" });

const amount = z.coerce
  .number({ message: "amount must be a number" })
  .positive("amount must be greater than 0")
  .refine(Number.isFinite, { message: "amount must be a finite number" });

const source = z
  .string()
  .trim()
  .min(1, "source is required")
  .max(120, "source cannot exceed 120 characters");

const note = z
  .string()
  .trim()
  .max(300, "note cannot exceed 300 characters")
  .optional();

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

// --- body schemas ------------------------------------------------------------

export const createPaymentSchema = z.object({
  source,
  amount,
  note,
  date: z.coerce.date({ message: "date is invalid" }).optional(), // -> Date | undefined
});

export const updatePaymentSchema = createPaymentSchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Provide at least one field to update",
  });

// --- query schemas -----------------------------------------------------------

// Shared filter params (used by both list and analytics).
const filterQuery = z.object({
  // Exact source match (optional; the UI uses `search` instead).
  source: source.optional(),
  // Case-insensitive partial match on source. Empty string is treated as
  // "no search" by the service (it's falsy), so we don't require min(1).
  search: z.string().trim().max(120).optional(),
  date: ymd.optional(),
  from: ymd.optional(),
  to: ymd.optional(),
  year: z.coerce.number().int().gte(1970).lte(2200).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export const analyticsQuerySchema = filterQuery;

export const listPaymentQuerySchema = filterQuery.extend({
  sortBy: z.enum(["date", "amount", "source"]).default("date"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

// --- param schema ------------------------------------------------------------

export const idParamSchema = z.object({ id: objectId });

// --- grouped per route (consumed by the validate middleware) -----------------

export const paymentValidators = {
  create: { body: createPaymentSchema },
  list: { query: listPaymentQuerySchema },
  analytics: { query: analyticsQuerySchema },
  getOne: { params: idParamSchema },
  update: { params: idParamSchema, body: updatePaymentSchema },
  remove: { params: idParamSchema },
};
