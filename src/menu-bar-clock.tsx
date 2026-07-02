import { LaunchType, MenuBarExtra, launchCommand } from "@raycast/api";

import { useMenuBarClockEnabled } from "./hooks/use-menu-bar-clock-enabled";
import { useNow } from "./hooks/use-now";
import { getTimeFormatPreference } from "./lib/preferences";
import { formatMenuBarTime } from "./lib/time";

export default function Command() {
  const isEnabled = useMenuBarClockEnabled();
  const now = useNow();

  if (!isEnabled) {
    return null;
  }

  return (
    <MenuBarExtra
      title={formatMenuBarTime(now, getTimeFormatPreference())}
      tooltip="Seconds Clock"
    >
      <MenuBarExtra.Item
        title="Show Seconds Clock"
        onAction={() =>
          launchCommand({
            name: "show-seconds-clock",
            type: LaunchType.UserInitiated,
          })
        }
      />
    </MenuBarExtra>
  );
}
