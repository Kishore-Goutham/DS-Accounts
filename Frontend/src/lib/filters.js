// Shared filter state <-> backend query params.
//
// Filter state shape:
//   {
//     period: { mode: "all"|"year"|"month"|"date"|"range",
//               year?, month?, date?, from?, to? },
//     serviceType: string | null,
//     search: string,
//   }
// Dates (date/from/to) are "YYYY-MM-DD" strings; year/month are numbers.

export function defaultFilters() {
  return { period: { mode: "all" }, serviceType: null, search: "" };
}

export function filtersToParams(filters = {}) {
  const params = {};
  const { period, serviceType, search } = filters;

  if (serviceType) params.serviceType = serviceType;
  if (search && search.trim()) params.search = search.trim();

  switch (period?.mode) {
    case "year":
      if (period.year) params.year = period.year;
      break;
    case "month":
      if (period.year) params.year = period.year;
      if (period.month) params.month = period.month;
      break;
    case "date":
      if (period.date) params.date = period.date;
      break;
    case "range":
      if (period.from) params.from = period.from;
      if (period.to) params.to = period.to;
      break;
    default:
      break; // "all" or unset -> no date params
  }

  return params;
}
