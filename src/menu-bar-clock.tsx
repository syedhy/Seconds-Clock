import { Icon, MenuBarExtra, Toast, showHUD, showToast } from "@raycast/api";
import { useEffect } from "react";

import { useActiveActivity } from "./hooks/use-active-activity";
import { useNow } from "./hooks/use-now";
import {
  formatActivityDuration,
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
  const { activityState, isLoading, refreshActivity } =
    useActiveActivity(nowMs);
  const selectedTimer = activityState
    ? getSelectedTimer(activityState)
    : undefined;
  const displayedActivity = selectedTimer ?? activityState?.stopwatch;
  const shouldKeepRunning = Boolean(displayedActivity);

  useEffect(() => {
    removeCompletedTimers(nowMs).then((completedTimers) => {
      if (completedTimers.length === 0) {
        return;
      }

      const completedTitle =
        completedTimers.length === 1
          ? `${getTimerTitle(completedTimers[0])} Done`
          : `${completedTimers.length} Timers Done`;

      showHUD(completedTitle);
      showToast({
        style: Toast.Style.Success,
        title: completedTitle,
      });
      refreshActivity();
    });
  }, [nowMs, refreshActivity]);

  if (!isLoading && !displayedActivity) {
    return null;
  }

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
      isLoading={isLoading || shouldKeepRunning}
    >
      {activityState ? (
        <MenuBarContent
          state={activityState}
          selectedTimer={selectedTimer}
          now={nowMs}
          refreshActivity={refreshActivity}
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
}: {
  state: ActivityState;
  selectedTimer?: TimerActivity;
  now: number;
  refreshActivity: () => Promise<void>;
}) {
  const otherTimers = sortTimersByEnding(state.timers).filter(
    (timer) => timer.id !== selectedTimer?.id,
  );

  async function removeTimerAndRefresh(timerId: string) {
    await removeTimer(timerId);
    await showHUD("Timer Stopped");
    await refreshActivity();
  }

  async function selectTimerAndRefresh(timerId: string) {
    await selectTimer(timerId);
    await refreshActivity();
  }

  async function stopStopwatchAndRefresh() {
    await stopStopwatch();
    await showHUD("Stopwatch Stopped");
    await refreshActivity();
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
}: {
  timer: TimerActivity;
  now: number;
  isSelected?: boolean;
  onSelect: (timerId: string) => Promise<void>;
  onRemove: (timerId: string) => Promise<void>;
}) {
  return (
    <MenuBarExtra.Submenu
      title={`${getTimerTitle(timer)} ${formatActivityDuration(getTimerRemainingMs(timer, now))}${isSelected ? " (Shown)" : ""}`}
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
