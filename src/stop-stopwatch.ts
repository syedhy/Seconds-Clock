import { showHUD } from "@raycast/api";

import { getActivityState, stopStopwatch } from "./lib/activity";

export default async function Command() {
  const state = await getActivityState();

  if (!state.stopwatch) {
    await showHUD("No Stopwatch Running");
    return;
  }

  await stopStopwatch();
  await showHUD("Stopwatch Stopped");
}
