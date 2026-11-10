import { Group, Select, ActionIcon, Tooltip } from "@mantine/core";
import { IconSortAscending, IconSortDescending } from "@tabler/icons-react";

const INCOME_FIELDS = [
  { value: "date", label: "Date" },
  { value: "amount", label: "Amount" },
  { value: "customerName", label: "Customer" },
  { value: "serviceType", label: "Service type" },
];

export function SortControl({ sortBy, order, onChange, fields = INCOME_FIELDS }) {
  return (
    <Group gap={6} wrap="nowrap" align="flex-end">
      <Select
        label="Sort by"
        data={fields}
        value={sortBy}
        onChange={(v) => v && onChange({ sortBy: v, order })}
        allowDeselect={false}
        w={150}
        comboboxProps={{ withinPortal: true, zIndex: 300 }}
      />
      <Tooltip label={order === "asc" ? "Ascending" : "Descending"}>
        <ActionIcon
          variant="default"
          size="input-sm"
          onClick={() => onChange({ sortBy, order: order === "asc" ? "desc" : "asc" })}
          aria-label="Toggle sort direction"
        >
          {order === "asc" ? <IconSortAscending size={18} /> : <IconSortDescending size={18} />}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}

export default SortControl;
