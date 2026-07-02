import { showHUD } from "@raycast/api";

import {
  createStopwatchActivity,
  saveActiveActivity,
  showActivityInMenuBar,
} from "./lib/activity";

export default async function Command() {
  await saveActiveActivity(createStopwatchActivity());
  await showActivityInMenuBar();
  await showHUD("Stopwatch Started in Menu Bar");
}
