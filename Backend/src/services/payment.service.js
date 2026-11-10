import { paymentRepository as repo } from "../repositories/payment.repository.js";
import { buildDateFilter } from "../utils/dateFilter.js";
import { ApiError } from "../utils/ApiError.js";

// Combine the date clause (from query params) with an optional source match
// into a single Mongo filter. Shared by list and analytics.
//
// `source` (exact) and `search` (partial) both target the `source` field; if
// both are sent, the partial `search` wins. The frontend uses only `search`.
function buildFilter(query = {}) {
  const filter = { ...buildDateFilter(query) };
  if (query.source) filter.source = query.source;
  if (query.search) {
    // Escape regex-special characters so user input can't alter the pattern.
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.source = { $regex: escaped, $options: "i" };
  }
  return filter;
}

export const paymentService = {
  createPayment(data) {
    return repo.create(data);
  },

  async listPayments(query = {}) {
    const { sortBy = "date", order = "desc", page = 1, limit = 25 } = query;
    const filter = buildFilter(query);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      repo.findMany(filter, { sortBy, order, skip, limit }),
      repo.countDocuments(filter),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 0 },
    };
  },

  async getPayment(id) {
    const payment = await repo.findById(id);
    if (!payment) throw ApiError.notFound("Payment not found");
    return payment;
  },

  async updatePayment(id, data) {
    const updated = await repo.updateById(id, data);
    if (!updated) throw ApiError.notFound("Payment not found");
    return updated;
  },

  async deletePayment(id) {
    const deleted = await repo.deleteById(id);
    if (!deleted) throw ApiError.notFound("Payment not found");
    return deleted;
  },

  async listSources() {
    const sources = await repo.distinctSources();
    return sources.filter(Boolean).sort((a, b) => a.localeCompare(b));
  },

  async getAnalytics(query = {}) {
    const filter = buildFilter(query);
    const [totals, bySource, trend] = await Promise.all([
      repo.aggregateTotals(filter),
      repo.aggregateBySource(filter),
      repo.aggregateTrend(filter),
    ]);
    return {
      totalExpense: totals.totalExpense,
      totalCount: totals.totalCount,
      bySource,
      trend,
    };
  },
};

export default paymentService;
