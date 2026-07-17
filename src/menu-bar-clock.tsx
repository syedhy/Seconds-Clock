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
  showActivityInMenuBar,
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
  const completionCheckInFlight = useRef(false);
  const actionQueue = useRef(Promise.resolve());

  async function runMenuAction(action: () => Promise<void>): Promise<void> {
    const queuedAction = actionQueue.current.then(async () => {
      setIsActionRunning(true);

      try {
        await action();
      } catch {
        await showToast({
          style: Toast.Style.Failure,
          title: "Couldn't Update Menu Bar",
        }).catch(() => undefined);
      } finally {
        setIsActionRunning(false);
      }
    });

    actionQueue.current = queuedAction.catch(() => undefined);
    return queuedAction;
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

  if (!isLoading && !displayedActivity && !isActionRunning) {
    return null;
  }

  // Keep the command loaded while an activity is active so live updates and
  // menu actions are handled by the same running command instance.
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
      isLoading={isLoading || isActionRunning || Boolean(displayedActivity)}
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
  refreshActivity: (nextState?: ActivityState) => Promise<void>;
  runMenuAction: (action: () => Promise<void>) => Promise<void>;
}) {
  const otherTimers = sortTimersByEnding(state.timers).filter(
    (timer) => timer.id !== selectedTimer?.id,
  );
  const timerLabels = getUniqueTimerLabels(state.timers);

  function removeTimerAndRefresh(timerId: string): Promise<void> {
    return runMenuAction(async () => {
      const nextState = await removeTimer(timerId);
      await refreshActivity(nextState);
      void showActivityInMenuBar();
      void showHUD("Timer Stopped").catch(() => undefined);
    });
  }

  function extendTimerAndRefresh(
    timerId: string,
    minutes: number,
  ): Promise<void> {
    return runMenuAction(async () => {
      const nextState = await extendTimer(timerId, minutes * 60 * 1000);
      await refreshActivity(nextState);
      void showActivityInMenuBar();
      void showHUD(`Added ${minutes} Minutes`).catch(() => undefined);
    });
  }

  function selectTimerAndRefresh(timerId: string): Promise<void> {
    return runMenuAction(async () => {
      const nextState = await selectTimer(timerId);
      await refreshActivity(nextState);
      void showActivityInMenuBar();
    });
  }

  function stopStopwatchAndRefresh(): Promise<void> {
    return runMenuAction(async () => {
      const nextState = await stopStopwatch();
      await refreshActivity(nextState);
      void showActivityInMenuBar();
      void showHUD("Stopwatch Stopped").catch(() => undefined);
    });
  }

  return (
    <>
      {selectedTimer ? (
        <MenuBarExtra.Section title="Menu Bar">
          <TimerMenuItem
            key={selectedTimer.id}
            timer={selectedTimer}
            actionLabel={timerLabels.get(selectedTimer.id) ?? "Timer"}
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
              actionLabel={timerLabels.get(timer.id) ?? "Timer"}
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
            title="Stopwatch"
            subtitle={formatActivityDuration(
              getStopwatchElapsedMs(state.stopwatch, now),
            )}
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
  actionLabel,
  now,
  isSelected = false,
  onSelect,
  onRemove,
  onExtend,
}: {
  timer: TimerActivity;
  actionLabel: string;
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
          title={`Show in Menu Bar: ${actionLabel}`}
          icon={Icon.CheckCircle}
          onAction={() => {
            void onSelect(timer.id);
          }}
        />
      )}
      <MenuBarExtra.Item
        title={`Stop Timer: ${actionLabel}`}
        icon={Icon.XMarkCircle}
        onAction={() => {
          void onRemove(timer.id);
        }}
      />
      <MenuBarExtra.Item
        title={`Add 5 Minutes: ${actionLabel}`}
        icon={Icon.Plus}
        onAction={() => {
          void onExtend(timer.id, 5);
        }}
      />
      <MenuBarExtra.Item
        title={`Add 30 Minutes: ${actionLabel}`}
        icon={Icon.Plus}
        onAction={() => {
          void onExtend(timer.id, 30);
        }}
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

function getUniqueTimerLabels(timers: TimerActivity[]): Map<string, string> {
  const labels = new Map<string, string>();
  const counts = new Map<string, number>();
  const occurrences = new Map<string, number>();

  for (const timer of timers) {
    const baseLabel = timer.name?.trim() || "Timer";
    counts.set(baseLabel, (counts.get(baseLabel) ?? 0) + 1);
  }

  for (const timer of timers) {
    const baseLabel = timer.name?.trim() || "Timer";
    const occurrence = (occurrences.get(baseLabel) ?? 0) + 1;
    occurrences.set(baseLabel, occurrence);

    labels.set(
      timer.id,
      (counts.get(baseLabel) ?? 0) > 1
        ? `${truncateMenuBarName(baseLabel)} ${occurrence}`
        : truncateMenuBarName(baseLabel),
    );
  }

  return labels;
}
