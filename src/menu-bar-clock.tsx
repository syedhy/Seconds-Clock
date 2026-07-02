import { MenuBarExtra, showHUD } from "@raycast/api";
import { useEffect, useState } from "react";

import {
  isMenuBarClockEnabled,
  setMenuBarClockEnabled,
} from "./lib/menu-bar-clock-state";

export default function Command() {
  const [isEnabled, setIsEnabled] = useState<boolean>();

  useEffect(() => {
    let isMounted = true;

    isMenuBarClockEnabled().then((enabled) => {
      if (isMounted) {
        setIsEnabled(enabled);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  async function hideMenuBarClock() {
    await setMenuBarClockEnabled(false);
    await showHUD("Seconds Clock Menu Bar Hidden");
    setIsEnabled(false);
  }

  if (isEnabled === undefined) {
    return (
      <MenuBarExtra title="Seconds Clock" tooltip="Seconds Clock" isLoading />
    );
  }

  // Raycast removes a menu-bar command's item when the command returns null.
  // See: https://developers.raycast.com/api-reference/menu-bar-commands
  if (!isEnabled) {
    return null;
  }

  return (
    <MenuBarExtra title="Seconds Clock" tooltip="Seconds Clock">
      <MenuBarExtra.Item
        title="Hide Menu Bar Clock"
        onAction={hideMenuBarClock}
      />
    </MenuBarExtra>
  );
}
