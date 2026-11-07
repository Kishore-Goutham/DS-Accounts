import { incomeRepository as repo } from "../repositories/income.repository.js";
import { buildDateFilter } from "../utils/dateFilter.js";
import { ApiError } from "../utils/ApiError.js";

// Combine the date clause (from query params) with an optional serviceType
// match into a single Mongo filter. Shared by list and analytics.
function buildFilter(query = {}) {
  const filter = { ...buildDateFilter(query) };
  if (query.serviceType) filter.serviceType = query.serviceType;
  if (query.search) {
    // Escape regex-special characters so user input can't alter the pattern.
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.customerName = { $regex: escaped, $options: "i" };
  }
  return filter;
}

export const incomeService = {
  createIncome(data) {
    return repo.create(data);
  },

  async listIncomes(query = {}) {
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

  async getIncome(id) {
    const income = await repo.findById(id);
    if (!income) throw ApiError.notFound("Income not found");
    return income;
  },

  async updateIncome(id, data) {
    const updated = await repo.updateById(id, data);
    if (!updated) throw ApiError.notFound("Income not found");
    return updated;
  },

  async deleteIncome(id) {
    const deleted = await repo.deleteById(id);
    if (!deleted) throw ApiError.notFound("Income not found");
    return deleted;
  },

  async getAnalytics(query = {}) {
    const filter = buildFilter(query);
    const [totals, byService, trend] = await Promise.all([
      repo.aggregateTotals(filter),
      repo.aggregateByService(filter),
      repo.aggregateTrend(filter),
    ]);
    return {
      totalRevenue: totals.totalRevenue,
      totalCount: totals.totalCount,
      byService,
      trend,
    };
  },
};

export default incomeService;
