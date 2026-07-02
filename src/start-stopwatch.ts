import { showHUD } from "@raycast/api";

import { createStopwatchActivity, saveActiveActivity } from "./lib/activity";

export default async function Command() {
  await saveActiveActivity(createStopwatchActivity());
  await showHUD("Stopwatch Started");
}
