import { showHUD } from "@raycast/api";

import { showActivityInMenuBar, startStopwatch } from "./lib/activity";

export default async function Command() {
  await startStopwatch();
  await showActivityInMenuBar();
  await showHUD("Stopwatch Started in Menu Bar");
}
