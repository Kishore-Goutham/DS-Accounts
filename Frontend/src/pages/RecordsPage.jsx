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
import { useIncomes } from "../hooks/useIncomes.js";
import { useServiceTypes } from "../hooks/useServiceTypes.js";
import { useIncomeMutations } from "../hooks/useIncomeMutations.js";
import { useFilterParams } from "../hooks/useFilterParams.js";
import { useSortParams } from "../hooks/useSortParams.js";
import { filtersToParams } from "../lib/filters.js";
import { FilterBar } from "../components/FilterBar.jsx";
import { SortControl } from "../components/SortControl.jsx";
import { IncomeTable } from "../components/IncomeTable.jsx";
import { Pagination } from "../components/Pagination.jsx";
import { IncomeFormModal } from "../components/IncomeFormModal.jsx";

export default function RecordsPage() {
  const [sort, setSort] = useSortParams("r");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [filters, setFilters] = useFilterParams("r");
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
  const { data, isLoading, isError, error, isFetching } = useIncomes(params);
  const { data: serviceTypes = [] } = useServiceTypes();
  const { create, update, remove } = useIncomeMutations();

  const rows = data?.rows ?? [];
  const meta = data?.meta;
  const filtersActive =
    filters.period?.mode !== "all" || Boolean(filters.serviceType) || Boolean(debouncedSearch);

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
        notifications.show({ color: "teal", message: "Income updated" });
      } else {
        await create.mutateAsync(payload);
        notifications.show({ color: "teal", message: "Income added" });
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
      notifications.show({ color: "teal", message: "Income deleted" });
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
        <Title order={2}>Income Records</Title>
        <Group gap="sm" align="flex-end">
          <SortControl sortBy={sort.sortBy} order={sort.order} onChange={handleSortChange} />
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>
            Add income
          </Button>
        </Group>
      </Group>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        withSearch
        searchValue={search}
        onSearchChange={setSearch}
      />

      <Paper withBorder radius="md" p="md" pos="relative">
        <LoadingOverlay visible={isFetching && !isLoading} zIndex={5} overlayProps={{ blur: 1 }} />

        {isError ? (
          <Alert color="red" icon={<IconAlertCircle size={16} />} title="Couldn't load records">
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
                  ? "No records match your filters."
                  : "No records yet. Add your first income to see it here."}
              </Text>
              {!filtersActive && (
                <Button variant="light" leftSection={<IconPlus size={16} />} onClick={openAdd} mt="xs">
                  Add income
                </Button>
              )}
            </Stack>
          </Center>
        ) : (
          <>
            <IncomeTable
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

      <IncomeFormModal
        opened={formOpened}
        onClose={() => {
          setFormOpened(false);
          setEditingRecord(null);
        }}
        record={editingRecord}
        serviceTypes={serviceTypes}
        onSubmit={handleSubmit}
        submitting={create.isPending || update.isPending}
      />

      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete income"
        centered
        size="sm"
      >
        <Stack>
          <Text size="sm">
            Delete the record for <b>{deleteTarget?.customerName}</b> (
            {deleteTarget?.serviceType})? This can't be undone.
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
