import { useState } from "react";
import {
  Paper,
  Group,
  Text,
  SegmentedControl,
  Stack,
  Center,
  ColorSwatch,
} from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import { formatINR, formatINRCompact } from "../../lib/format.js";

// Validated categorical slots 1–3 (light) + neutral "Other".
const COLORS = ["#2a78d6", "#eb6834", "#1baf7a"];
const OTHER = "#898781";

export function ServiceDonut({ data = [] }) {
  const [metric, setMetric] = useState("revenue");
  const isRevenue = metric === "revenue";
  const hasData = data.length > 0;

  const sorted = [...data].sort((a, b) => b[metric] - a[metric]);
  const slices = sorted.slice(0, 3).map((s, i) => ({
    name: s.serviceType,
    value: s[metric],
    color: COLORS[i],
  }));
  const rest = sorted.slice(3);
  if (rest.length) {
    const sum = rest.reduce((a, s) => a + s[metric], 0);
    if (sum > 0) slices.push({ name: `Other (${rest.length})`, value: sum, color: OTHER });
  }

  const total = slices.reduce((a, s) => a + s.value, 0);
  const fmt = (v) => (isRevenue ? formatINR(v) : String(v));
  const pct = (v) => (total ? Math.round((v / total) * 100) : 0);

  return (
    <Paper withBorder radius="md" p="md" h="100%">
      <Group justify="space-between" mb="md" wrap="wrap">
        <Text fw={600}>Share by {isRevenue ? "revenue" : "bookings"}</Text>
        <SegmentedControl
          size="xs"
          value={metric}
          onChange={setMetric}
          data={[
            { label: "Revenue", value: "revenue" },
            { label: "Bookings", value: "count" },
          ]}
        />
      </Group>

      {hasData ? (
        <Stack align="center" gap="md">
          <DonutChart
            data={slices}
            size={180}
            thickness={30}
            withTooltip
            tooltipDataSource="segment"
            valueFormatter={fmt}
            chartLabel={isRevenue ? formatINRCompact(total) : String(total)}
          />
          <Stack gap={6} w="100%">
            {slices.map((s) => (
              <Group key={s.name} justify="space-between" wrap="nowrap">
                <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                  <ColorSwatch color={s.color} size={12} withShadow={false} />
                  <Text size="sm" truncate>
                    {s.name}
                  </Text>
                </Group>
                <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                  {fmt(s.value)} · {pct(s.value)}%
                </Text>
              </Group>
            ))}
          </Stack>
        </Stack>
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

export default ServiceDonut;
