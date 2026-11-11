import { Paper, Text, Center, Group, useMantineTheme } from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import { formatINR, formatINRCompact } from "../../lib/format.js";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Custom tooltip for the net chart: reads the hovered point's own sign so it
// says "Net loss ₹1,300" / "Net profit ₹1,500" (magnitude, no raw minus), and
// takes a single payload entry so Mantine's dots layer can't double the row.
function NetTooltip({ active, label, payload, theme }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  const loss = value < 0;
  const dotColor = loss ? theme.colors.red[6] : theme.colors.teal[6];
  return (
    <Paper px="md" py="sm" radius="md" withBorder shadow="md">
      <Text fw={600} mb={6}>
        {label}
      </Text>
      <Group gap="lg" justify="space-between" wrap="nowrap">
        <Group gap={8} wrap="nowrap">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: dotColor,
              display: "inline-block",
            }}
          />
          <Text size="sm">{loss ? "Net loss" : "Net profit"}</Text>
        </Group>
        <Text size="sm" fw={600}>
          {formatINR(Math.abs(value))}
        </Text>
      </Group>
    </Paper>
  );
}

export function TrendChart({
  data = [],
  title = "Monthly revenue trend",
  seriesLabel = "Revenue",
  color = "teal.6",
  valueKey = "revenue",
  // `diverging` is for the net series. The fill splits at the ₹0 line (teal
  // above, red below) via Mantine's native `type="split"`, and the line colour
  // is passed in by the caller based on the overall result. The tooltip is
  // swapped for one that reads "Net loss/profit ₹X".
  diverging = false,
}) {
  const theme = useMantineTheme();
  const chartData = data.map((d) => ({
    label: `${MONTHS[d.month - 1]} ${String(d.year).slice(2)}`,
    value: d[valueKey],
  }));
  const hasData = chartData.length > 0;

  const divergingProps = diverging
    ? {
        type: "split",
        splitColors: ["teal.6", "red.6"],
        tooltipProps: {
          content: ({ active, label, payload }) => (
            <NetTooltip active={active} label={label} payload={payload} theme={theme} />
          ),
        },
      }
    : {};

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
          {...divergingProps}
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
