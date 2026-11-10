import { Paper, Group, TextInput, Button } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { PeriodFilter } from "./PeriodFilter.jsx";
import { ServiceTypeSelect } from "./ServiceTypeSelect.jsx";

// Shared across Records and Dashboard.
// - filters: { period, serviceType }
// - onChange(nextFilters)
// - withSearch + searchValue/onSearchChange: adds a debounced-upstream search box
export function FilterBar({
  filters,
  onChange,
  withServiceType = true,
  withSearch = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Customer name",
}) {
  const setPeriod = (period) => onChange({ ...filters, period });
  const setServiceType = (serviceType) => onChange({ ...filters, serviceType });

  const hasActive =
    filters.period?.mode !== "all" ||
    (withServiceType && Boolean(filters.serviceType)) ||
    (withSearch && Boolean(searchValue));

  const clearAll = () => {
    onChange({ period: { mode: "all" }, serviceType: null });
    if (withSearch && onSearchChange) onSearchChange("");
  };

  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Group gap="sm" align="flex-end" wrap="wrap">
          <PeriodFilter period={filters.period} onChange={setPeriod} />
          {withServiceType && (
            <ServiceTypeSelect value={filters.serviceType} onChange={setServiceType} />
          )}
          {withSearch && (
            <TextInput
              label="Search"
              placeholder={searchPlaceholder}
              leftSection={<IconSearch size={16} />}
              value={searchValue}
              onChange={(e) => onSearchChange(e.currentTarget.value)}
              w={220}
            />
          )}
        </Group>
        <Button
          variant="light"
          color="gray"
          leftSection={<IconX size={14} />}
          onClick={clearAll}
          disabled={!hasActive}
        >
          Clear
        </Button>
      </Group>
    </Paper>
  );
}

export default FilterBar;
