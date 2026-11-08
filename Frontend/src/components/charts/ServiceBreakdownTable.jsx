import { useState } from "react";
import { Paper, Group, Text, Table, UnstyledButton, Center, Stack, Badge, Progress } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconChevronUp, IconChevronDown, IconSelector } from "@tabler/icons-react";
import { formatINR } from "../../lib/format.js";

export function ServiceBreakdownTable({ data = [] }) {
  const [sort, setSort] = useState({ by: "revenue", order: "desc" });
  const hasData = data.length > 0;
  const isMobile = useMediaQuery("(max-width: 48em)");

  const totalRevenue = data.reduce((a, s) => a + s.revenue, 0);
  const totalCount = data.reduce((a, s) => a + s.count, 0);

  const sorted = [...data].sort((a, b) => {
    const d = a[sort.by] === b[sort.by] ? 0 : a[sort.by] < b[sort.by] ? -1 : 1;
    return sort.order === "asc" ? d : -d;
  });

  const share = (revenue) =>
    totalRevenue ? Math.round((revenue / totalRevenue) * 100) : 0;

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

      {!hasData ? (
        <Center h={160}>
          <Text c="dimmed" size="sm">
            No data for the selected filters.
          </Text>
        </Center>
      ) : isMobile ? (
        // Phone layout: one card per service, no horizontal scrolling.
        <Stack gap="xs">
          {sorted.map((s) => (
            <Paper key={s.serviceType} withBorder radius="md" p="sm">
              <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
                <Text fw={600} style={{ wordBreak: "break-word" }}>
                  {s.serviceType}
                </Text>
                <Text
                  fw={700}
                  style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}
                >
                  {formatINR(s.revenue)}
                </Text>
              </Group>
              <Group justify="space-between" align="center" wrap="nowrap" mt={8} gap="sm">
                <Badge variant="light" color="teal" size="sm" radius="sm" style={{ textTransform: "none" }}>
                  {s.count} {s.count === 1 ? "booking" : "bookings"}
                </Badge>
                <Text size="xs" c="dimmed" style={{ fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                  {share(s.revenue)}% share
                </Text>
              </Group>
              <Progress value={share(s.revenue)} color="teal" size="xs" radius="xl" mt={8} />
            </Paper>
          ))}
          <Group justify="space-between" px="sm" pt={4} wrap="nowrap">
            <Text fw={700}>Total</Text>
            <Text fw={700} style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
              {totalCount} {totalCount === 1 ? "booking" : "bookings"} · {formatINR(totalRevenue)}
            </Text>
          </Group>
        </Stack>
      ) : (
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
                  <Table.Td style={numCell}>{share(s.revenue)}%</Table.Td>
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
      )}
    </Paper>
  );
}

export default ServiceBreakdownTable;
