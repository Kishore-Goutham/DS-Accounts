import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIncome, updateIncome, deleteIncome } from "../api/incomes.js";

// Create/update/delete mutations. On success they invalidate the incomes and
// analytics caches so the table and dashboard refresh automatically.
export function useIncomeMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["incomes"] });
    qc.invalidateQueries({ queryKey: ["analytics"] });
  };

  const create = useMutation({ mutationFn: createIncome, onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, data }) => updateIncome(id, data),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: deleteIncome, onSuccess: invalidate });

  return { create, update, remove };
}
