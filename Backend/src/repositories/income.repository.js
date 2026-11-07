import { Income } from "../models/income.model.js";

// Data-access layer: thin Mongoose wrappers only. No business logic, no HTTP.
// Callers pass an already-built Mongo filter (see services + utils/dateFilter).
export const incomeRepository = {
  create(data) {
    return Income.create(data);
  },

  findMany(filter = {}, { sortBy = "date", order = "desc", skip = 0, limit = 25 } = {}) {
    const sort = { [sortBy]: order === "asc" ? 1 : -1 };
    return Income.find(filter).sort(sort).skip(skip).limit(limit).lean();
  },

  countDocuments(filter = {}) {
    return Income.countDocuments(filter);
  },

  findById(id) {
    return Income.findById(id).lean();
  },

  updateById(id, data) {
    return Income.findByIdAndUpdate(id, data, {
      new: true, // return the updated document
      runValidators: true, // enforce schema rules on update
    }).lean();
  },

  deleteById(id) {
    return Income.findByIdAndDelete(id).lean();
  },

  // --- aggregations ----------------------------------------------------------
  // NOTE: $year/$month below extract in UTC. Combined with local-time date
  // boundaries (utils/dateFilter), this is the documented v1 timezone caveat
  // (PLAN.md §6/§7). Add a timezone option here if/when it matters.

  async aggregateTotals(filter = {}) {
    const [row] = await Income.aggregate([
      { $match: filter },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" }, totalCount: { $sum: 1 } } },
    ]);
    return { totalRevenue: row?.totalRevenue ?? 0, totalCount: row?.totalCount ?? 0 };
  },

  aggregateByService(filter = {}) {
    return Income.aggregate([
      { $match: filter },
      { $group: { _id: "$serviceType", count: { $sum: 1 }, revenue: { $sum: "$amount" } } },
      { $project: { _id: 0, serviceType: "$_id", count: 1, revenue: 1 } },
      { $sort: { revenue: -1 } },
    ]);
  },

  aggregateTrend(filter = {}) {
    return Income.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          count: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      { $project: { _id: 0, year: "$_id.year", month: "$_id.month", count: 1, revenue: 1 } },
      { $sort: { year: 1, month: 1 } },
    ]);
  },
};

export default incomeRepository;
