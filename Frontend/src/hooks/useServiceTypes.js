import { useQuery } from "@tanstack/react-query";
import { getServiceTypes } from "../api/meta.js";

// Static list from the backend; cache it indefinitely.
export function useServiceTypes() {
  return useQuery({
    queryKey: ["service-types"],
    queryFn: getServiceTypes,
    staleTime: Infinity,
  });
}
