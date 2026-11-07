// Single source of truth for service types.
// Add / rename / remove here and it flows to the model enum, request
// validation, the /api/v1/service-types endpoint, and the frontend dropdown.
// Frozen so the list cannot be mutated at runtime.
export const SERVICE_TYPES = Object.freeze([
  "New driving licence",
  "New conductor licence",
  "Renewal of driving licence",
  "Re test driving licence",
  "Badge",
  "Change of address",
  "Change of name",
  "Duplicate driving licence",
  "IDPL",
  "Driving licence extract",
  "Hazardous licence",
  "Heavy driving licence",
]);
