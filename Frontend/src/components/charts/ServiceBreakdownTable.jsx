import { useState } from "react";
import { Paper, Group, Text, Table, UnstyledButton, Center } from "@mantine/core";
import { IconChevronUp, IconChevronDown, IconSelector } from "@tabler/icons-react";
import { formatINR } from "../../lib/format.js";

export function ServiceBreakdownTable({ data = [] }) {
  const [sort, setSort] = useState({ by: "revenue", order: "desc" });
  const hasData = data.length > 0;

  const totalRevenue = data.reduce((a, s) => a + s.revenue, 0);
  const totalCount = data.reduce((a, s) => a + s.count, 0);

  const sorted = [...data].sort((a, b) => {
    const d = a[sort.by] === b[sort.by] ? 0 : a[sort.by] < b[sort.by] ? -1 : 1;
    return sort.order === "asc" ? d : -d;
  });

  const toggle = (by) =>
    setSort((s) =>
      s.by === by ? { by, order: s.order === "asc" ? "desc" : "asc" } : { by, order: "desc" }
    );

  const SortIcon = ({ f }) =>
    sort.by !== f ? (
      <IconSelector size={14} opacity={0.5} />
    ) : sort.order === "asc" ? (
      <IconChevronUp size={14} />
    ) : (
      <IconChevronDown size={14} />
    );

  const numCell = { textAlign: "right", fontVariantNumeric: "tabular-nums" };
  const centerCell = { textAlign: "center", fontVariantNumeric: "tabular-nums" };

  return (
    <Paper withBorder radius="md" p="md" h="100%">
      <Text fw={600} mb="md">
        Service breakdown
      </Text>

      {hasData ? (
        <Table.ScrollContainer minWidth={420}>
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Service type</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>
                  <UnstyledButton onClick={() => toggle("count")} w="100%">
                    <Group gap={4} justify="center" wrap="nowrap">
                      <Text fw={600} fz="sm">Bookings</Text>
                      <SortIcon f="count" />
                    </Group>
                  </UnstyledButton>
                </Table.Th>
                <Table.Th style={{ textAlign: "right" }}>
                  <UnstyledButton onClick={() => toggle("revenue")} w="100%">
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <Text fw={600} fz="sm">Revenue</Text>
                      <SortIcon f="revenue" />
                    </Group>
                  </UnstyledButton>
                </Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Share</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sorted.map((s) => (
                <Table.Tr key={s.serviceType}>
                  <Table.Td>{s.serviceType}</Table.Td>
                  <Table.Td style={centerCell}>{s.count}</Table.Td>
                  <Table.Td style={numCell}>{formatINR(s.revenue)}</Table.Td>
                  <Table.Td style={numCell}>
                    {totalRevenue ? Math.round((s.revenue / totalRevenue) * 100) : 0}%
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Th>Total</Table.Th>
                <Table.Th style={centerCell}>{totalCount}</Table.Th>
                <Table.Th style={numCell}>{formatINR(totalRevenue)}</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>100%</Table.Th>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <Center h={160}>
          <Text c="dimmed" size="sm">
            No data for the selected filters.
          </Text>
        </Center>
      )}
    </Paper>
  );
}

export default ServiceBreakdownTable;
