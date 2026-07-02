import {
  LaunchType,
  Toast,
  launchCommand,
  showHUD,
  showToast,
} from "@raycast/api";

import {
  isMenuBarClockEnabled,
  setMenuBarClockEnabled,
} from "./lib/menu-bar-clock-state";

export default async function Command() {
  const nextEnabledState = !(await isMenuBarClockEnabled());

  await setMenuBarClockEnabled(nextEnabledState);

  try {
    await launchCommand({
      name: "menu-bar-clock",
      type: LaunchType.Background,
    });
    await showHUD(
      `Menu Bar Clock ${nextEnabledState ? "Enabled" : "Disabled"}`,
    );
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Could not refresh menu bar clock",
      message: error instanceof Error ? error.message : undefined,
    });
  }
}
