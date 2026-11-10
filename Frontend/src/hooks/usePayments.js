import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listPayments } from "../api/payments.js";

// params: { source?, search?, year?, month?, date?, from?, to?,
//           sortBy?, order?, page?, limit? }
// Returns query whose data is { rows, meta }.
export function usePayments(params = {}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: async () => {
      const res = await listPayments(params);
      return { rows: res.data, meta: res.meta };
    },
    placeholderData: keepPreviousData, // smooth paging/filtering (no flash)
  });
}
