import { useQuery } from "@tanstack/react-query";
import { getPaymentAnalytics } from "../api/payments.js";

// params: same filter params as usePayments (no sort/pagination).
// Returns query whose data is { totalExpense, totalCount, bySource, trend }.
export function usePaymentAnalytics(params = {}) {
  return useQuery({
    queryKey: ["payment-analytics", params],
    queryFn: () => getPaymentAnalytics(params),
  });
}
