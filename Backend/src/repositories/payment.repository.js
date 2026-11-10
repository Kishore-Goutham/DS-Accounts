import { Payment } from "../models/payment.model.js";

// Data-access layer: thin Mongoose wrappers only. No business logic, no HTTP.
// Callers pass an already-built Mongo filter (see services + utils/dateFilter).
export const paymentRepository = {
  create(data) {
    return Payment.create(data);
  },

  findMany(filter = {}, { sortBy = "date", order = "desc", skip = 0, limit = 25 } = {}) {
    const sort = { [sortBy]: order === "asc" ? 1 : -1 };
    return Payment.find(filter).sort(sort).skip(skip).limit(limit).lean();
  },

  countDocuments(filter = {}) {
    return Payment.countDocuments(filter);
  },

  findById(id) {
    return Payment.findById(id).lean();
  },

  updateById(id, data) {
    return Payment.findByIdAndUpdate(id, data, {
      new: true, // return the updated document
      runValidators: true, // enforce schema rules on update
    }).lean();
  },

  deleteById(id) {
    return Payment.findByIdAndDelete(id).lean();
  },

  // Distinct source strings ever used — powers the autocomplete in the form.
  distinctSources() {
    return Payment.distinct("source");
  },

  // --- aggregations ----------------------------------------------------------
  // NOTE: $year/$month below extract in UTC. Combined with local-time date
  // boundaries (utils/dateFilter), this is the documented v1 timezone caveat
  // (PLAN.md §6/§7). Add a timezone option here if/when it matters.

  async aggregateTotals(filter = {}) {
    const [row] = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: null, totalExpense: { $sum: "$amount" }, totalCount: { $sum: 1 } } },
    ]);
    return { totalExpense: row?.totalExpense ?? 0, totalCount: row?.totalCount ?? 0 };
  },

  aggregateBySource(filter = {}) {
    return Payment.aggregate([
      { $match: filter },
      { $group: { _id: "$source", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
      { $project: { _id: 0, source: "$_id", count: 1, amount: 1 } },
      { $sort: { amount: -1 } },
    ]);
  },

  aggregateTrend(filter = {}) {
    return Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
      { $project: { _id: 0, year: "$_id.year", month: "$_id.month", count: 1, amount: 1 } },
      { $sort: { year: 1, month: 1 } },
    ]);
  },
};

export default paymentRepository;
