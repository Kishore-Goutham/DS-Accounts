import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const INCOME_SORT_FIELDS = ["date", "amount", "customerName", "serviceType"];
const ORDERS = ["asc", "desc"];

// Table sort ({ sortBy, order }) backed by the URL under `<prefix>_sortBy` /
// `<prefix>_order`, so it survives navigation + refresh and is shareable.
// Values are validated against the `fields` whitelist; anything else falls back.
export function useSortParams(
  prefix = "r",
  fallback = { sortBy: "date", order: "desc" },
  fields = INCOME_SORT_FIELDS
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = useMemo(() => {
    const sortBy = searchParams.get(`${prefix}_sortBy`);
    const order = searchParams.get(`${prefix}_order`);
    return {
      sortBy: fields.includes(sortBy) ? sortBy : fallback.sortBy,
      order: ORDERS.includes(order) ? order : fallback.order,
    };
  }, [searchParams, prefix, fallback.sortBy, fallback.order, fields]);

  const setSort = (next) => {
    const params = new URLSearchParams(searchParams); // preserve other params
    params.set(`${prefix}_sortBy`, next.sortBy);
    params.set(`${prefix}_order`, next.order);
    setSearchParams(params);
  };

  return [sort, setSort];
}

export default useSortParams;
