import { LaunchType, environment, showHUD } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";

import {
  isMenuBarClockEnabled,
  setMenuBarClockEnabled,
} from "../lib/menu-bar-clock-state";

export function useMenuBarClockVisibility() {
  const shouldShowOnLaunch =
    environment.launchType === LaunchType.UserInitiated;
  const [isVisible, setIsVisible] = useState<boolean | undefined>(
    shouldShowOnLaunch ? true : undefined,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadVisibility() {
      const storedIsEnabled = await isMenuBarClockEnabled();
      const nextIsVisible = shouldShowOnLaunch || storedIsEnabled;

      if (shouldShowOnLaunch && !storedIsEnabled) {
        await setMenuBarClockEnabled(true);
      }

      if (isMounted) {
        setIsVisible(nextIsVisible);
      }
    }

    loadVisibility();

    return () => {
      isMounted = false;
    };
  }, [shouldShowOnLaunch]);

  const hide = useCallback(async () => {
    await setMenuBarClockEnabled(false);
    await showHUD("Seconds Clock Menu Bar Hidden");
    setIsVisible(false);
  }, []);

  return { isVisible, hide };
}
