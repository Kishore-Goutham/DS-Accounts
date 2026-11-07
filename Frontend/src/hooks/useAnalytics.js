import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "../api/incomes.js";

// params: same filter params as useIncomes (no sort/pagination).
// Returns query whose data is { totalRevenue, totalCount, byService, trend }.
export function useAnalytics(params = {}) {
  return useQuery({
    queryKey: ["analytics", params],
    queryFn: () => getAnalytics(params),
  });
}
