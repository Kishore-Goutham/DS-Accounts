import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPayment, updatePayment, deletePayment } from "../api/payments.js";

// Create/update/delete mutations. On success they invalidate the payments,
// payment-analytics and payment-sources caches so the table, dashboard and
// source autocomplete refresh automatically.
export function usePaymentMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["payments"] });
    qc.invalidateQueries({ queryKey: ["payment-analytics"] });
    qc.invalidateQueries({ queryKey: ["payment-sources"] });
  };

  const create = useMutation({ mutationFn: createPayment, onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, data }) => updatePayment(id, data),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: deletePayment, onSuccess: invalidate });

  return { create, update, remove };
}
