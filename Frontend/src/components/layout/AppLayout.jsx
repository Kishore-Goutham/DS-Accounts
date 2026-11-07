import { AppShell, Group, Title, Button } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { IconChartBar, IconTable } from "@tabler/icons-react";

const links = [
  { to: "/", label: "Dashboard", icon: IconChartBar },
  { to: "/records", label: "Records", icon: IconTable },
];

export function AppLayout({ children }) {
  const { pathname, search } = useLocation();

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={4} c="teal.7">
            DS-Accounts
          </Title>
          <Group gap="xs">
            {links.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <Button
                  key={to}
                  component={Link}
                  to={{ pathname: to, search }}
                  variant={active ? "filled" : "subtle"}
                  leftSection={<Icon size={16} />}
                >
                  {label}
                </Button>
              );
            })}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

export default AppLayout;
