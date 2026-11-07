import { Select } from "@mantine/core";
import { useServiceTypes } from "../hooks/useServiceTypes.js";

export function ServiceTypeSelect({ value, onChange, label = "Service type", w = 240 }) {
  const { data: types = [] } = useServiceTypes();
  return (
    <Select
      label={label}
      placeholder="All services"
      data={types}
      value={value || null}
      onChange={onChange}
      clearable
      searchable
      w={w}
      comboboxProps={{ withinPortal: true, zIndex: 300 }}
    />
  );
}

export default ServiceTypeSelect;
