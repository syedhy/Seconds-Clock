import { Action, ActionPanel, Icon, List, showHUD } from "@raycast/api";

import { useActiveActivity } from "./hooks/use-active-activity";
import { useNow } from "./hooks/use-now";
import {
  formatActivityDuration,
  getSelectedTimer,
  getTimerRemainingMs,
  getTimerTitle,
  removeAllTimers,
  removeTimer,
  selectTimer,
  showActivityInMenuBar,
  sortTimersByEnding,
  type TimerActivity,
} from "./lib/activity";

export default function Command() {
  const now = useNow();
  const nowMs = now.getTime();
  const { activityState, isLoading, refreshActivity } =
    useActiveActivity(nowMs);
  const timers = activityState ? sortTimersByEnding(activityState.timers) : [];
  const selectedTimer = activityState
    ? getSelectedTimer(activityState)
    : undefined;

  async function selectTimerForMenuBar(timer: TimerActivity) {
    await selectTimer(timer.id);
    await showActivityInMenuBar();
    await showHUD(`${getTimerTitle(timer)} Shown in Menu Bar`);
    await refreshActivity();
  }

  async function stopTimer(timer: TimerActivity) {
    await removeTimer(timer.id);
    await showActivityInMenuBar();
    await showHUD(`${getTimerTitle(timer)} Stopped`);
    await refreshActivity();
  }

  async function stopAllTimers() {
    await removeAllTimers();
    await showActivityInMenuBar();
    await showHUD("All Timers Stopped");
    await refreshActivity();
  }

  return (
    <List
      navigationTitle="Manage Timers"
      isLoading={isLoading}
      searchBarPlaceholder="Search timers"
    >
      {timers.length === 0 ? (
        <List.EmptyView
          icon={Icon.Clock}
          title="No Running Timers"
          description="Use Set Timer to start one."
        />
      ) : (
        timers.map((timer) => (
          <TimerListItem
            key={timer.id}
            timer={timer}
            now={nowMs}
            isSelected={timer.id === selectedTimer?.id}
            onSelect={selectTimerForMenuBar}
            onStop={stopTimer}
            onStopAll={stopAllTimers}
          />
        ))
      )}
    </List>
  );
}

function TimerListItem({
  timer,
  now,
  isSelected,
  onSelect,
  onStop,
  onStopAll,
}: {
  timer: TimerActivity;
  now: number;
  isSelected: boolean;
  onSelect: (timer: TimerActivity) => Promise<void>;
  onStop: (timer: TimerActivity) => Promise<void>;
  onStopAll: () => Promise<void>;
}) {
  return (
    <List.Item
      title={getTimerTitle(timer)}
      subtitle={formatActivityDuration(getTimerRemainingMs(timer, now))}
      icon={Icon.Clock}
      accessories={isSelected ? [{ text: "Menu Bar" }] : undefined}
      actions={
        <ActionPanel>
          <Action
            title="Show in Menu Bar"
            icon={Icon.CheckCircle}
            onAction={() => onSelect(timer)}
          />
          <Action
            title="Stop Timer"
            icon={Icon.XMarkCircle}
            onAction={() => onStop(timer)}
          />
          <Action
            title="Stop All Timers"
            icon={Icon.Trash}
            style={Action.Style.Destructive}
            onAction={onStopAll}
          />
        </ActionPanel>
      }
    />
  );
}
