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
  IconCashBanknote,
  IconReportMoney,
} from "@tabler/icons-react";
import { useAnalytics } from "../hooks/useAnalytics.js";
import { usePaymentAnalytics } from "../hooks/usePaymentAnalytics.js";
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

// Merge the income and payment monthly trends into a single net series:
// net[month] = income revenue − payment expense for that month.
function buildNetTrend(incomeTrend = [], paymentTrend = []) {
  const map = new Map();
  const bucket = (year, month) => {
    const key = `${year}-${month}`;
    if (!map.has(key)) map.set(key, { year, month, income: 0, expense: 0 });
    return map.get(key);
  };
  for (const d of incomeTrend) bucket(d.year, d.month).income += d.revenue;
  for (const d of paymentTrend) bucket(d.year, d.month).expense += d.amount;

  return [...map.values()]
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((d) => ({ year: d.year, month: d.month, net: d.income - d.expense }));
}

export default function DashboardPage() {
  const [filters, setFilters] = useFilterParams("d");

  const params = filtersToParams(filters);
  const income = useAnalytics(params);
  const payments = usePaymentAnalytics(params);

  const data = income.data;
  const payData = payments.data;

  const isError = income.isError || payments.isError;
  const error = income.error || payments.error;
  const isLoading = income.isLoading || payments.isLoading;
  const isFetching = income.isFetching || payments.isFetching;

  const totalRevenue = data?.totalRevenue ?? 0;
  const totalCount = data?.totalCount ?? 0;
  const totalExpense = payData?.totalExpense ?? 0;
  const paymentCount = payData?.totalCount ?? 0;
  const net = totalRevenue - totalExpense;
  const margin = totalRevenue > 0 ? Math.round((net / totalRevenue) * 100) : null;
  const avg = totalCount ? totalRevenue / totalCount : 0;

  // Busiest month = the income trend bucket with the most transactions.
  const busiest = (data?.trend ?? []).reduce(
    (best, m) => (!best || m.count > best.count ? m : best),
    null
  );

  const netTrend = buildNetTrend(data?.trend, payData?.trend);

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
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              <KpiCard label="Total income" value={formatINR(totalRevenue)} icon={IconCoin} color="teal" />
              <KpiCard
                label="Total expenses"
                value={formatINR(totalExpense)}
                hint={paymentCount ? `${paymentCount} payment${paymentCount === 1 ? "" : "s"}` : undefined}
                icon={IconCashBanknote}
                color="red"
              />
              <KpiCard
                label={net < 0 ? "Net loss" : "Net profit"}
                value={formatINR(Math.abs(net))}
                hint={
                  margin != null
                    ? net < 0
                      ? `${Math.abs(margin)}% loss`
                      : `${margin}% margin`
                    : undefined
                }
                icon={IconReportMoney}
                color={net < 0 ? "red" : "teal"}
              />
              <KpiCard label="Income transactions" value={totalCount} icon={IconReceipt} color="blue" />
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

            <TrendChart
              data={netTrend}
              title="Monthly net trend (income − expenses)"
              seriesLabel="Net"
              valueKey="net"
              color={net < 0 ? "red.6" : "teal.6"}
              diverging
            />

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
