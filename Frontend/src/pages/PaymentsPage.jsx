import { useState, useEffect } from "react";
import {
  Stack,
  Group,
  Title,
  Button,
  Paper,
  Loader,
  Center,
  Text,
  Alert,
  LoadingOverlay,
  Modal,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconAlertCircle, IconInbox, IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { usePayments } from "../hooks/usePayments.js";
import { usePaymentSources } from "../hooks/usePaymentSources.js";
import { usePaymentMutations } from "../hooks/usePaymentMutations.js";
import { useFilterParams } from "../hooks/useFilterParams.js";
import { useSortParams } from "../hooks/useSortParams.js";
import { filtersToParams } from "../lib/filters.js";
import { formatINR } from "../lib/format.js";
import { FilterBar } from "../components/FilterBar.jsx";
import { SortControl } from "../components/SortControl.jsx";
import { PaymentTable } from "../components/PaymentTable.jsx";
import { Pagination } from "../components/Pagination.jsx";
import { PaymentFormModal } from "../components/PaymentFormModal.jsx";

// Payments sort on their own fields (no serviceType/customer).
const PAYMENT_SORT_FIELDS = [
  { value: "date", label: "Date" },
  { value: "amount", label: "Amount" },
  { value: "source", label: "Source" },
];
const PAYMENT_SORT_KEYS = ["date", "amount", "source"];

export default function PaymentsPage() {
  const [sort, setSort] = useSortParams("p", { sortBy: "date", order: "desc" }, PAYMENT_SORT_KEYS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [filters, setFilters] = useFilterParams("p");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const [formOpened, setFormOpened] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Any filter/search change resets to the first page.
  useEffect(() => {
    setPage(1);
  }, [filters, debouncedSearch]);

  const params = {
    ...filtersToParams({ ...filters, search: debouncedSearch }),
    ...sort,
    page,
    limit,
  };
  const { data, isLoading, isError, error, isFetching } = usePayments(params);
  const { data: sources = [] } = usePaymentSources();
  const { create, update, remove } = usePaymentMutations();

  const rows = data?.rows ?? [];
  const meta = data?.meta;
  const filtersActive = filters.period?.mode !== "all" || Boolean(debouncedSearch);

  const handleSort = (field) => {
    const next =
      sort.sortBy === field
        ? { sortBy: field, order: sort.order === "asc" ? "desc" : "asc" }
        : { sortBy: field, order: "desc" };
    setSort(next);
    setPage(1);
  };

  const handleLimit = (n) => {
    setLimit(n);
    setPage(1);
  };

  const handleSortChange = (next) => {
    setSort(next);
    setPage(1);
  };

  const openAdd = () => {
    setEditingRecord(null);
    setFormOpened(true);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    setFormOpened(true);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editingRecord) {
        await update.mutateAsync({ id: editingRecord._id, data: payload });
        notifications.show({ color: "teal", message: "Payment updated" });
      } else {
        await create.mutateAsync(payload);
        notifications.show({ color: "teal", message: "Payment added" });
      }
      setFormOpened(false);
      setEditingRecord(null);
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Couldn't save",
        message: err?.message || "Something went wrong.",
      });
    }
  };

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync(deleteTarget._id);
      notifications.show({ color: "teal", message: "Payment deleted" });
      setDeleteTarget(null);
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Couldn't delete",
        message: err?.message || "Something went wrong.",
      });
    }
  };

  return (
    <Stack>
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Title order={2}>Payments</Title>
        <Group gap="sm" align="flex-end">
          <SortControl
            sortBy={sort.sortBy}
            order={sort.order}
            onChange={handleSortChange}
            fields={PAYMENT_SORT_FIELDS}
          />
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>
            Add payment
          </Button>
        </Group>
      </Group>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        withServiceType={false}
        withSearch
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Source"
      />

      <Paper withBorder radius="md" p="md" pos="relative">
        <LoadingOverlay visible={isFetching && !isLoading} zIndex={5} overlayProps={{ blur: 1 }} />

        {isError ? (
          <Alert color="red" icon={<IconAlertCircle size={16} />} title="Couldn't load payments">
            {error?.message || "Something went wrong."}
          </Alert>
        ) : isLoading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : rows.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <IconInbox size={32} opacity={0.5} />
              <Text c="dimmed">
                {filtersActive
                  ? "No payments match your filters."
                  : "No payments yet. Add your first payment to see it here."}
              </Text>
              {!filtersActive && (
                <Button variant="light" leftSection={<IconPlus size={16} />} onClick={openAdd} mt="xs">
                  Add payment
                </Button>
              )}
            </Stack>
          </Center>
        ) : (
          <>
            <PaymentTable
              rows={rows}
              sortBy={sort.sortBy}
              order={sort.order}
              onSort={handleSort}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
            <Pagination
              page={page}
              limit={limit}
              total={meta?.total ?? 0}
              totalPages={meta?.totalPages ?? 1}
              onPageChange={setPage}
              onLimitChange={handleLimit}
            />
          </>
        )}
      </Paper>

      <PaymentFormModal
        opened={formOpened}
        onClose={() => {
          setFormOpened(false);
          setEditingRecord(null);
        }}
        record={editingRecord}
        sources={sources}
        onSubmit={handleSubmit}
        submitting={create.isPending || update.isPending}
      />

      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete payment"
        centered
        size="sm"
      >
        <Stack>
          <Text size="sm">
            Delete the <b>{deleteTarget?.source}</b> payment of{" "}
            <b>{formatINR(deleteTarget?.amount)}</b>? This can't be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteTarget(null)} disabled={remove.isPending}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete} loading={remove.isPending}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
