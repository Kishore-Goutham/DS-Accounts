import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listIncomes } from "../api/incomes.js";

// params: { serviceType?, search?, year?, month?, date?, from?, to?,
//           sortBy?, order?, page?, limit? }
// Returns query whose data is { rows, meta }.
export function useIncomes(params = {}) {
  return useQuery({
    queryKey: ["incomes", params],
    queryFn: async () => {
      const res = await listIncomes(params);
      return { rows: res.data, meta: res.meta };
    },
    placeholderData: keepPreviousData, // smooth paging/filtering (no flash)
  });
}
