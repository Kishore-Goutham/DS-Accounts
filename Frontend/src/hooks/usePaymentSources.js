import { useQuery } from "@tanstack/react-query";
import { getPaymentSources } from "../api/payments.js";

// Distinct sources used so far, for the form's source autocomplete.
export function usePaymentSources() {
  return useQuery({
    queryKey: ["payment-sources"],
    queryFn: getPaymentSources,
    staleTime: 60_000,
  });
}
