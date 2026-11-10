import { Paper, Text, Center } from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import { formatINR, formatINRCompact } from "../../lib/format.js";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function TrendChart({
  data = [],
  title = "Monthly revenue trend",
  seriesLabel = "Revenue",
  color = "teal.6",
  valueKey = "revenue",
}) {
  const chartData = data.map((d) => ({
    label: `${MONTHS[d.month - 1]} ${String(d.year).slice(2)}`,
    value: d[valueKey],
  }));
  const hasData = chartData.length > 0;

  return (
    <Paper withBorder radius="md" p="md">
      <Text fw={600} mb="md">
        {title}
      </Text>
      {hasData ? (
        <AreaChart
          h={300}
          data={chartData}
          dataKey="label"
          series={[{ name: "value", color, label: seriesLabel }]}
          curveType="monotone"
          withGradient
          withDots={chartData.length <= 24}
          valueFormatter={(v) => formatINR(v)}
          yAxisProps={{ width: 64, tickFormatter: (v) => formatINRCompact(v) }}
          withTooltip
        />
      ) : (
        <Center h={200}>
          <Text c="dimmed" size="sm">
            No data for the selected filters.
          </Text>
        </Center>
      )}
    </Paper>
  );
}

export default TrendChart;
