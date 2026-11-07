import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { searchParamsToFilters, applyFiltersToSearchParams } from "../lib/filterParams.js";

// Shared filters (period + serviceType) backed by the URL query string, under
// a per-page `prefix` so each page's filters are independent but still persist
// and stay shareable. Returns [filters, setFilters].
export function useFilterParams(prefix = "") {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => searchParamsToFilters(searchParams, prefix),
    [searchParams, prefix]
  );

  const setFilters = (next) =>
    setSearchParams(applyFiltersToSearchParams(searchParams, next, prefix));

  return [filters, setFilters];
}

export default useFilterParams;
