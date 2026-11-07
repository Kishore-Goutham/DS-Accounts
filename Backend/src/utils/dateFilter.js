// Builds the Mongo `date` clause from filter params, following the precedence
// in PLAN.md §6 (first match wins, so params never conflict):
//   1. date  (single calendar day)
//   2. from/to (range)
//   3. year and/or month
//   4. none  -> {}
//
// Boundaries are half-open [start, end): end is the start of the *next* day/
// month/year, which makes `date` and `to` inclusive of their whole day.
//
// NOTE: boundaries are built in the server's LOCAL time (see PLAN.md §6
// timezone note). Inputs are expected pre-validated: `date`/`from`/`to` as
// "YYYY-MM-DD" strings, `year`/`month` as numbers (or numeric strings).

function startOfDay(dateStr) {
  const [y, m, d] = String(dateStr).split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function addDays(date, n) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function buildDateFilter({ date, from, to, year, month } = {}) {
  // 1. single day
  if (date) {
    const start = startOfDay(date);
    return { date: { $gte: start, $lt: addDays(start, 1) } };
  }

  // 2. range (either bound optional)
  if (from || to) {
    const clause = {};
    if (from) clause.$gte = startOfDay(from);
    if (to) clause.$lt = addDays(startOfDay(to), 1); // inclusive of the `to` day
    return { date: clause };
  }

  // 3. year and/or month (month defaults to current year if year omitted)
  if (year || month) {
    const y = year ? Number(year) : new Date().getFullYear();
    if (month) {
      const m = Number(month); // 1-12
      return { date: { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) } };
    }
    return { date: { $gte: new Date(y, 0, 1), $lt: new Date(y + 1, 0, 1) } };
  }

  // 4. no date filter
  return {};
}

export default buildDateFilter;
