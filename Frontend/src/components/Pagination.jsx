import { Group, Pagination as MantinePagination, Select, Text } from "@mantine/core";

const PAGE_SIZES = ["10", "25", "50", "100"];

export function Pagination({ page, limit, total, totalPages, onPageChange, onLimitChange }) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <Group justify="space-between" mt="md" wrap="wrap">
      <Text size="sm" c="dimmed">
        {total === 0 ? "No records" : `Showing ${from}–${to} of ${total}`}
      </Text>
      <Group gap="sm">
        <Select
          size="xs"
          w={88}
          data={PAGE_SIZES}
          value={String(limit)}
          onChange={(v) => v && onLimitChange(Number(v))}
          aria-label="Rows per page"
          allowDeselect={false}
        />
        <MantinePagination
          size="sm"
          value={page}
          total={totalPages || 1}
          onChange={onPageChange}
          withEdges
        />
      </Group>
    </Group>
  );
}

export default Pagination;
