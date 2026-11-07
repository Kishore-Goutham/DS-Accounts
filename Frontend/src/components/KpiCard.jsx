import { Paper, Group, Text, ThemeIcon } from "@mantine/core";

export function KpiCard({ label, value, hint, icon: Icon, color = "teal" }) {
  return (
    <Paper withBorder radius="md" p="lg">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Text size="xs" c="dimmed" fw={600} tt="uppercase">
            {label}
          </Text>
          <Text fz={28} fw={700} mt={4} style={{ lineHeight: 1.1 }}>
            {value}
          </Text>
          {hint && (
            <Text size="xs" c="dimmed" mt={6}>
              {hint}
            </Text>
          )}
        </div>
        {Icon && (
          <ThemeIcon variant="light" color={color} size={38} radius="md">
            <Icon size={20} />
          </ThemeIcon>
        )}
      </Group>
    </Paper>
  );
}

export default KpiCard;
