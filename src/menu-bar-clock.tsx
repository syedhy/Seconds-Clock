import { Icon, MenuBarExtra, Toast, showHUD, showToast } from "@raycast/api";
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
  sortTimersByEnding,
  truncateMenuBarName,
  type ActivityState,
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
    // Other commands mutate shared activity state in separate processes. Poll
    // once per second so this single menu-bar owner reflects those changes
    // without launching competing MenuBarExtra instances.
    void refreshActivity();
  }, [nowMs, refreshActivity]);

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
        void showHUD(completedTitle).catch(() => undefined);
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

  // Keep the command loaded while an activity is active so every menu-bar
  // entry continues to update from the same running command instance.
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
      isLoading={isLoading || Boolean(displayedActivity)}
    >
      {activityState ? (
        <MenuBarContent
          state={activityState}
          selectedTimer={selectedTimer}
          now={nowMs}
        />
      ) : null}
    </MenuBarExtra>
  );
}

function MenuBarContent({
  state,
  selectedTimer,
  now,
}: {
  state: ActivityState;
  selectedTimer?: TimerActivity;
  now: number;
}) {
  const otherTimers = sortTimersByEnding(state.timers).filter(
    (timer) => timer.id !== selectedTimer?.id,
  );

  return (
    <>
      {selectedTimer ? (
        <MenuBarExtra.Section title="Menu Bar">
          <TimerMenuItem
            key={selectedTimer.id}
            timer={selectedTimer}
            now={now}
            isSelected
          />
        </MenuBarExtra.Section>
      ) : null}

      {otherTimers.length > 0 ? (
        <MenuBarExtra.Section title="Timers">
          {otherTimers.map((timer) => (
            <TimerMenuItem key={timer.id} timer={timer} now={now} />
          ))}
        </MenuBarExtra.Section>
      ) : null}

      {state.stopwatch ? (
        <MenuBarExtra.Section title="Stopwatch">
          <MenuBarExtra.Item
            title="Stopwatch"
            subtitle={formatActivityDuration(
              getStopwatchElapsedMs(state.stopwatch, now),
            )}
            icon={Icon.Stopwatch}
          />
        </MenuBarExtra.Section>
      ) : null}
    </>
  );
}

function TimerMenuItem({
  timer,
  now,
  isSelected = false,
}: {
  timer: TimerActivity;
  now: number;
  isSelected?: boolean;
}) {
  return (
    <MenuBarExtra.Item
      title={`${getTimerMenuBarTitle(timer, now)}${isSelected ? " (Shown)" : ""}`}
      icon={Icon.Clock}
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
