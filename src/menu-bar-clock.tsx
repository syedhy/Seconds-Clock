import { LaunchType, MenuBarExtra, launchCommand } from "@raycast/api";

import { useMenuBarClockVisibility } from "./hooks/use-menu-bar-clock-visibility";
import { useNow } from "./hooks/use-now";
import { getTimeFormatPreference } from "./lib/preferences";
import { formatMenuBarTime } from "./lib/time";

export default function Command() {
  const { isVisible, hide } = useMenuBarClockVisibility();
  const now = useNow();

  if (isVisible === false) {
    return null;
  }

  const title = formatMenuBarTime(now, getTimeFormatPreference());

  return (
    // MenuBarExtra.isLoading tells Raycast not to unload the command. Without it,
    // root-launched menu-bar commands render once and the one-second timer stops.
    <MenuBarExtra title={title} tooltip="Seconds Clock" isLoading>
      <MenuBarExtra.Item
        title="Show Seconds Clock"
        onAction={() =>
          launchCommand({
            name: "show-seconds-clock",
            type: LaunchType.UserInitiated,
          })
        }
      />
      <MenuBarExtra.Item title="Hide Menu Bar Clock" onAction={hide} />
    </MenuBarExtra>
  );
}
