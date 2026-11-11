import { useState } from "react";
import {
  Button,
  ActionIcon,
  Tooltip,
  Modal,
  Stack,
  Text,
  List,
  ThemeIcon,
} from "@mantine/core";
import { IconDownload, IconDeviceMobile, IconDeviceDesktop } from "@tabler/icons-react";
import { usePwaInstall } from "../hooks/usePwaInstall.js";

// Rough platform sniff — only used to show the most relevant manual steps.
function detectPlatform() {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  const isIOS =
    /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

/**
 * Always-visible "Install app" control.
 * - If the browser has offered native install, clicking installs immediately.
 * - Otherwise it opens a short dialog with manual steps for the user's device.
 * Hidden only when the app is already running installed (standalone).
 */
export function InstallButton({ compact = false }) {
  const { canInstall, promptInstall, installed } = usePwaInstall();
  const [helpOpen, setHelpOpen] = useState(false);

  if (installed) return null;

  const handleClick = () => {
    if (canInstall) promptInstall();
    else setHelpOpen(true);
  };

  const platform = detectPlatform();

  return (
    <>
      {compact ? (
        <Tooltip label="Install app" withArrow>
          <ActionIcon
            onClick={handleClick}
            variant="filled"
            color="teal"
            size="lg"
            radius="md"
            aria-label="Install app"
          >
            <IconDownload size={18} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <Button
          onClick={handleClick}
          variant="light"
          color="teal"
          leftSection={<IconDownload size={16} />}
        >
          Install app
        </Button>
      )}

      <Modal
        opened={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Install DS-Accounts"
        centered
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Add DS-Accounts to your device so it opens in its own window, like a
            normal app — no browser address bar.
          </Text>

          {platform === "ios" ? (
            <ManualSteps
              icon={<IconDeviceMobile size={16} />}
              heading="On iPhone / iPad (Safari)"
              steps={[
                "Tap the Share button (the square with an up arrow).",
                'Scroll down and tap "Add to Home Screen".',
                'Tap "Add" — the DS-Accounts icon appears on your home screen.',
              ]}
            />
          ) : platform === "android" ? (
            <ManualSteps
              icon={<IconDeviceMobile size={16} />}
              heading="On Android (Chrome)"
              steps={[
                "Tap the ⋮ menu (top-right).",
                'Tap "Install app" (or "Add to Home screen").',
                'Confirm "Install".',
              ]}
            />
          ) : (
            <ManualSteps
              icon={<IconDeviceDesktop size={16} />}
              heading="On your computer (Chrome or Edge)"
              steps={[
                "Look for the install icon in the address bar (a small monitor with a down arrow).",
                'Or open the ••• / ⋮ menu → Apps → "Install this site as an app".',
                'Click "Install" — it opens in its own window and pins to your taskbar.',
              ]}
            />
          )}

          <Text size="xs" c="dimmed">
            Tip: once installed, you can launch DS-Accounts straight from your home
            screen or taskbar.
          </Text>
        </Stack>
      </Modal>
    </>
  );
}

function ManualSteps({ icon, heading, steps }) {
  return (
    <Stack gap="xs">
      <Text fw={600} size="sm">
        {heading}
      </Text>
      <List
        spacing="xs"
        size="sm"
        type="ordered"
        icon={
          <ThemeIcon color="teal" size={20} radius="xl">
            {icon}
          </ThemeIcon>
        }
      >
        {steps.map((s, i) => (
          <List.Item key={i}>{s}</List.Item>
        ))}
      </List>
    </Stack>
  );
}

export default InstallButton;
