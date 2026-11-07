import {
  Stack,
  Title,
  SimpleGrid,
  Grid,
  Box,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCoin,
  IconReceipt,
  IconScale,
  IconCalendarStats,
} from "@tabler/icons-react";
import { useAnalytics } from "../hooks/useAnalytics.js";
import { useFilterParams } from "../hooks/useFilterParams.js";
import { filtersToParams } from "../lib/filters.js";
import { FilterBar } from "../components/FilterBar.jsx";
import { KpiCard } from "../components/KpiCard.jsx";
import { TrendChart } from "../components/charts/TrendChart.jsx";
import { ServiceBreakdownTable } from "../components/charts/ServiceBreakdownTable.jsx";
import { ServiceDonut } from "../components/charts/ServiceDonut.jsx";
import { formatINR } from "../lib/format.js";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function DashboardPage() {
  const [filters, setFilters] = useFilterParams("d");

  const params = filtersToParams(filters);
  const { data, isLoading, isError, error, isFetching } = useAnalytics(params);

  const totalRevenue = data?.totalRevenue ?? 0;
  const totalCount = data?.totalCount ?? 0;
  const avg = totalCount ? totalRevenue / totalCount : 0;

  // Busiest month = the trend bucket with the most transactions.
  const busiest = (data?.trend ?? []).reduce(
    (best, m) => (!best || m.count > best.count ? m : best),
    null
  );

  return (
    <Stack>
      <Title order={2}>Dashboard</Title>

      <FilterBar filters={filters} onChange={setFilters} />

      {isError ? (
        <Alert color="red" icon={<IconAlertCircle size={16} />} title="Couldn't load analytics">
          {error?.message || "Something went wrong."}
        </Alert>
      ) : (
        <Box pos="relative" mih={120}>
          <LoadingOverlay visible={isLoading || isFetching} zIndex={5} overlayProps={{ blur: 1 }} />
          <Stack>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
              <KpiCard label="Total revenue" value={formatINR(totalRevenue)} icon={IconCoin} color="teal" />
              <KpiCard label="Transactions" value={totalCount} icon={IconReceipt} color="blue" />
              <KpiCard
                label="Avg / transaction"
                value={totalCount ? formatINR(avg) : "—"}
                icon={IconScale}
                color="grape"
              />
              <KpiCard
                label="Busiest month"
                value={busiest ? `${MONTHS[busiest.month - 1]} ${busiest.year}` : "—"}
                hint={busiest ? `${busiest.count} transactions` : undefined}
                icon={IconCalendarStats}
                color="orange"
              />
            </SimpleGrid>

            <TrendChart data={data?.trend} />

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, lg: 7 }}>
                <ServiceBreakdownTable data={data?.byService} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, lg: 5 }}>
                <ServiceDonut data={data?.byService} />
              </Grid.Col>
            </Grid>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
