import { AppShell, Group, Title, Button, ActionIcon, Tooltip } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks";
import { IconChartBar, IconTable, IconCashBanknote } from "@tabler/icons-react";
import { InstallButton } from "../InstallButton.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: IconChartBar },
  { to: "/records", label: "Income", icon: IconTable },
  { to: "/payments", label: "Payments", icon: IconCashBanknote },
];

export function AppLayout({ children }) {
  const { pathname, search } = useLocation();
  // On phones the three full buttons + title overflow the 60px header and wrap,
  // so below `sm` we collapse the nav to compact icon-only buttons.
  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Title order={4} c="teal.7" style={{ whiteSpace: "nowrap" }}>
            DS-Accounts
          </Title>
          <Group gap="xs" wrap="nowrap">
            {links.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              const linkTo = { pathname: to, search };

              return isMobile ? (
                <Tooltip key={to} label={label} withArrow>
                  <ActionIcon
                    component={Link}
                    to={linkTo}
                    variant={active ? "filled" : "subtle"}
                    size="lg"
                    radius="md"
                    aria-label={label}
                  >
                    <Icon size={18} />
                  </ActionIcon>
                </Tooltip>
              ) : (
                <Button
                  key={to}
                  component={Link}
                  to={linkTo}
                  variant={active ? "filled" : "subtle"}
                  leftSection={<Icon size={16} />}
                >
                  {label}
                </Button>
              );
            })}

            <InstallButton compact={isMobile} />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

export default AppLayout;
