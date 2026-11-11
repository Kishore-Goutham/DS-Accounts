import { useEffect, useState } from "react";

// True when the page is running as the installed app (its own window), not a tab.
function detectStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches === true ||
    window.navigator.standalone === true
  );
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(detectStandalone);

  useEffect(() => {
    let cancelled = false;

    // Live check against the browser's OWN installed-app registry (Chromium:
    // Chrome/Edge). Because it reads the real current state, uninstalling the app
    // makes the button reappear on the next load/focus — no stale flag to clear.
    // Requires the manifest to list its own URL in `related_applications`
    // (configured in vite.config.js from the deploy URL).
    const refreshInstalled = async () => {
      if (detectStandalone()) {
        if (!cancelled) setInstalled(true);
        return;
      }
      if (navigator.getInstalledRelatedApps) {
        try {
          const apps = await navigator.getInstalledRelatedApps();
          if (!cancelled) setInstalled(apps.length > 0);
        } catch {
          // API unsupported/blocked — fall back to the display-mode signal only.
        }
      }
    };

    refreshInstalled();

    const onBeforeInstall = (e) => {
      e.preventDefault(); // stop Chrome's mini-infobar; we drive the prompt
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setDeferredPrompt(null);
      setInstalled(true);
    };
    // Re-check when the user returns to the tab (e.g. after uninstalling).
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshInstalled();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } catch {
      // user dismissed — nothing to do
    }
    // A deferred prompt can only be used once.
    setDeferredPrompt(null);
  };

  return {
    canInstall: Boolean(deferredPrompt) && !installed,
    promptInstall,
    installed,
  };
}
