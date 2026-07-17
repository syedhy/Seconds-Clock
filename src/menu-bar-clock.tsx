import { MenuBarExtra, Toast, showToast } from "@raycast/api";
import { useEffect, useRef } from "react";

import { useActiveActivity } from "./hooks/use-active-activity";
import { useNow } from "./hooks/use-now";
import {
  formatActivityDuration,
  getSelectedTimer,
  getStopwatchElapsedMs,
  getTimerRemainingMs,
  getTimerTitle,
  removeCompletedTimers,
  truncateMenuBarName,
  type TimerActivity,
} from "./lib/activity";

export default function Command() {
  const now = useNow();
  const nowMs = now.getTime();
  const { activityState, isLoading, refreshActivity } = useActiveActivity();
  const selectedTimer = activityState
    ? getSelectedTimer(activityState)
    : undefined;
  const displayedActivity = selectedTimer ?? activityState?.stopwatch;
  const completionCheckInFlight = useRef(false);

  useEffect(() => {
    if (completionCheckInFlight.current) {
      return;
    }

    completionCheckInFlight.current = true;

    removeCompletedTimers(nowMs)
      .then(async (completedTimers) => {
        if (completedTimers.length === 0) {
          return;
        }

        const completedTitle =
          completedTimers.length === 1
            ? `${getTimerTitle(completedTimers[0])} Done`
            : `${completedTimers.length} Timers Done`;

        await refreshActivity();
        void showToast({
          style: Toast.Style.Success,
          title: completedTitle,
        }).catch(() => undefined);
      })
      .catch(() => undefined)
      .finally(() => {
        completionCheckInFlight.current = false;
      });
  }, [nowMs, refreshActivity]);

  if (!isLoading && !displayedActivity) {
    return null;
  }

  // The menu-bar item is intentionally display-only. Raycast refreshes its
  // title from this command without attaching a clickable menu.
  return (
    <MenuBarExtra
      title={
        selectedTimer
          ? getTimerMenuBarTitle(selectedTimer, nowMs)
          : activityState?.stopwatch
            ? formatActivityDuration(
                getStopwatchElapsedMs(activityState.stopwatch, nowMs),
              )
            : "Seconds Clock"
      }
      tooltip="Seconds Clock"
      isLoading={isLoading}
    />
  );
}

function getTimerMenuBarTitle(timer: TimerActivity, now: number): string {
  const remainingTime = formatActivityDuration(getTimerRemainingMs(timer, now));

  if (!timer.name) {
    return remainingTime;
  }

  return `${truncateMenuBarName(timer.name)} ${remainingTime}`;
}
