import { Table, UnstyledButton, Group, Text, ActionIcon } from "@mantine/core";
import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { formatINR, formatDate } from "../lib/format.js";

const columns = [
  { key: "date", label: "Date", sortable: true },
  { key: "customerName", label: "Customer", sortable: true },
  { key: "serviceType", label: "Service Type", sortable: true },
  { key: "amount", label: "Amount", sortable: true },
];

function SortIcon({ active, order }) {
  if (!active) return <IconSelector size={14} opacity={0.5} />;
  return order === "asc" ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />;
}

export function IncomeTable({ rows, sortBy, order, onSort, onEdit, onDelete }) {
  const showActions = Boolean(onEdit || onDelete);

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table highlightOnHover verticalSpacing="sm" striped>
        <Table.Thead>
          <Table.Tr>
            {columns.map((col) => (
              <Table.Th key={col.key} style={{ textAlign: col.align || "left" }}>
                {col.sortable ? (
                  <UnstyledButton onClick={() => onSort(col.key)} w="100%">
                    <Group
                      gap={4}
                      wrap="nowrap"
                      justify={col.align === "right" ? "flex-end" : "flex-start"}
                    >
                      {col.align === "right" && <SortIcon active={sortBy === col.key} order={order} />}
                      <Text fw={600} fz="sm">{col.label}</Text>
                      {col.align !== "right" && <SortIcon active={sortBy === col.key} order={order} />}
                    </Group>
                  </UnstyledButton>
                ) : (
                  <Text fw={600} fz="sm">{col.label}</Text>
                )}
              </Table.Th>
            ))}
            {showActions && <Table.Th w={100} style={{ textAlign: "right" }}>Actions</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row._id}>
              <Table.Td>{formatDate(row.date)}</Table.Td>
              <Table.Td>{row.customerName}</Table.Td>
              <Table.Td>{row.serviceType}</Table.Td>
              <Table.Td style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                {formatINR(row.amount)}
              </Table.Td>
              {showActions && (
                <Table.Td>
                  <Group gap={4} justify="flex-end" wrap="nowrap">
                    {onEdit && (
                      <ActionIcon variant="subtle" color="gray" onClick={() => onEdit(row)} aria-label="Edit">
                        <IconPencil size={16} />
                      </ActionIcon>
                    )}
                    {onDelete && (
                      <ActionIcon variant="subtle" color="red" onClick={() => onDelete(row)} aria-label="Delete">
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                </Table.Td>
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

export default IncomeTable;
