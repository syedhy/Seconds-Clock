import { Icon, MenuBarExtra, Toast, showHUD, showToast } from "@raycast/api";
import { useEffect, useRef, useState } from "react";

import { useActiveActivity } from "./hooks/use-active-activity";
import { useNow } from "./hooks/use-now";
import {
  formatActivityDuration,
  extendTimer,
  getSelectedTimer,
  getStopwatchElapsedMs,
  getTimerRemainingMs,
  getTimerTitle,
  removeCompletedTimers,
  removeTimer,
  selectTimer,
  sortTimersByEnding,
  stopStopwatch,
  truncateMenuBarName,
  type ActivityState,
  type TimerActivity,
} from "./lib/activity";

export default function Command() {
  const now = useNow();
  const nowMs = now.getTime();
  const { activityState, isLoading, refreshActivity } = useActiveActivity();
  const [isActionRunning, setIsActionRunning] = useState(false);
  const selectedTimer = activityState
    ? getSelectedTimer(activityState)
    : undefined;
  const displayedActivity = selectedTimer ?? activityState?.stopwatch;
  const isStopwatchRunning = Boolean(activityState?.stopwatch);
  const completionCheckInFlight = useRef(false);

  async function runMenuAction(action: () => Promise<void>): Promise<void> {
    setIsActionRunning(true);

    try {
      await action();
    } catch {
      await showToast({
        style: Toast.Style.Failure,
        title: "Couldn't Update Menu Bar",
      });
    } finally {
      setIsActionRunning(false);
    }
  }

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

        await showHUD(completedTitle);
        await showToast({
          style: Toast.Style.Success,
          title: completedTitle,
        });
        await refreshActivity();
      })
      .catch(() => undefined)
      .finally(() => {
        completionCheckInFlight.current = false;
      });
  }, [nowMs, refreshActivity]);

  if (!isLoading && !displayedActivity && !isActionRunning) {
    return null;
  }

  // A running stopwatch is an ongoing activity, so keep the command loaded
  // while its elapsed time is being rendered live.
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
      isLoading={isLoading || isActionRunning || isStopwatchRunning}
    >
      {activityState ? (
        <MenuBarContent
          state={activityState}
          selectedTimer={selectedTimer}
          now={nowMs}
          refreshActivity={refreshActivity}
          runMenuAction={runMenuAction}
        />
      ) : null}
    </MenuBarExtra>
  );
}

function MenuBarContent({
  state,
  selectedTimer,
  now,
  refreshActivity,
  runMenuAction,
}: {
  state: ActivityState;
  selectedTimer?: TimerActivity;
  now: number;
  refreshActivity: () => Promise<void>;
  runMenuAction: (action: () => Promise<void>) => Promise<void>;
}) {
  const otherTimers = sortTimersByEnding(state.timers).filter(
    (timer) => timer.id !== selectedTimer?.id,
  );

  function removeTimerAndRefresh(timerId: string): Promise<void> {
    return runMenuAction(async () => {
      await removeTimer(timerId);
      await showHUD("Timer Stopped");
      await refreshActivity();
    });
  }

  function extendTimerAndRefresh(
    timerId: string,
    minutes: number,
  ): Promise<void> {
    return runMenuAction(async () => {
      await extendTimer(timerId, minutes * 60 * 1000);
      await showHUD(`Added ${minutes} Minutes`);
      await refreshActivity();
    });
  }

  function selectTimerAndRefresh(timerId: string): Promise<void> {
    return runMenuAction(async () => {
      await selectTimer(timerId);
      await refreshActivity();
    });
  }

  function stopStopwatchAndRefresh(): Promise<void> {
    return runMenuAction(async () => {
      await stopStopwatch();
      await showHUD("Stopwatch Stopped");
      await refreshActivity();
    });
  }

  return (
    <>
      {selectedTimer ? (
        <MenuBarExtra.Section title="Menu Bar">
          <TimerMenuItem
            timer={selectedTimer}
            now={now}
            isSelected
            onSelect={selectTimerAndRefresh}
            onRemove={removeTimerAndRefresh}
            onExtend={extendTimerAndRefresh}
          />
        </MenuBarExtra.Section>
      ) : null}

      {otherTimers.length > 0 ? (
        <MenuBarExtra.Section title="Timers">
          {otherTimers.map((timer) => (
            <TimerMenuItem
              key={timer.id}
              timer={timer}
              now={now}
              onSelect={selectTimerAndRefresh}
              onRemove={removeTimerAndRefresh}
              onExtend={extendTimerAndRefresh}
            />
          ))}
        </MenuBarExtra.Section>
      ) : null}

      {state.stopwatch ? (
        <MenuBarExtra.Section title="Stopwatch">
          <MenuBarExtra.Item
            title={`Stopwatch ${formatActivityDuration(getStopwatchElapsedMs(state.stopwatch, now))}`}
            icon={Icon.Stopwatch}
          />
          <MenuBarExtra.Item
            title="Stop Stopwatch"
            icon={Icon.XMarkCircle}
            onAction={stopStopwatchAndRefresh}
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
  onSelect,
  onRemove,
  onExtend,
}: {
  timer: TimerActivity;
  now: number;
  isSelected?: boolean;
  onSelect: (timerId: string) => Promise<void>;
  onRemove: (timerId: string) => Promise<void>;
  onExtend: (timerId: string, minutes: number) => Promise<void>;
}) {
  return (
    <MenuBarExtra.Submenu
      title={`${getTimerMenuBarTitle(timer, now)}${isSelected ? " (Shown)" : ""}`}
      icon={Icon.Clock}
    >
      {isSelected ? (
        <MenuBarExtra.Item title="Shown in Menu Bar" icon={Icon.CheckCircle} />
      ) : (
        <MenuBarExtra.Item
          title="Show in Menu Bar"
          icon={Icon.CheckCircle}
          onAction={() => onSelect(timer.id)}
        />
      )}
      <MenuBarExtra.Item
        title="Stop Timer"
        icon={Icon.XMarkCircle}
        onAction={() => onRemove(timer.id)}
      />
      <MenuBarExtra.Item
        title="Add 5 Minutes"
        icon={Icon.Plus}
        onAction={() => onExtend(timer.id, 5)}
      />
      <MenuBarExtra.Item
        title="Add 30 Minutes"
        icon={Icon.Plus}
        onAction={() => onExtend(timer.id, 30)}
      />
    </MenuBarExtra.Submenu>
  );
}

function getTimerMenuBarTitle(timer: TimerActivity, now: number): string {
  const remainingTime = formatActivityDuration(getTimerRemainingMs(timer, now));

  if (!timer.name) {
    return remainingTime;
  }

  return `${truncateMenuBarName(timer.name)} ${remainingTime}`;
}
