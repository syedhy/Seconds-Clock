import { Toast, showToast } from "@raycast/api";

import {
  getTimerTitle,
  removeCompletedTimers,
  type TimerActivity,
} from "./lib/activity";

export default async function Command() {
  const completedTimers = await removeCompletedTimers();

  if (completedTimers.length === 0) {
    return;
  }

  await showToast({
    style: Toast.Style.Success,
    title: getCompletionTitle(completedTimers),
    message: getCompletionMessage(completedTimers),
  });
}

function getCompletionTitle(timers: TimerActivity[]): string {
  return timers.length === 1
    ? `${getTimerTitle(timers[0])} Finished`
    : `${timers.length} Timers Finished`;
}

function getCompletionMessage(timers: TimerActivity[]): string | undefined {
  if (timers.length === 1) {
    return "Your countdown is complete.";
  }

  return timers.map(getTimerTitle).join(", ");
}
