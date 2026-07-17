import {
  Action,
  ActionPanel,
  Form,
  Icon,
  List,
  showHUD,
  useNavigation,
} from "@raycast/api";

import { useActiveActivity } from "./hooks/use-active-activity";
import { useNow } from "./hooks/use-now";
import {
  formatActivityDuration,
  getSelectedTimer,
  getTimerRemainingMs,
  getTimerTitle,
  addFavoriteTimer,
  removeAllTimers,
  removeTimer,
  selectTimer,
  sortTimersByEnding,
  updateTimerName,
  type TimerActivity,
} from "./lib/activity";

export default function Command() {
  const now = useNow();
  const nowMs = now.getTime();
  const { activityState, isLoading, refreshActivity } = useActiveActivity();
  const timers = activityState ? sortTimersByEnding(activityState.timers) : [];
  const selectedTimer = activityState
    ? getSelectedTimer(activityState)
    : undefined;

  async function selectTimerForMenuBar(timer: TimerActivity) {
    await selectTimer(timer.id);
    await showHUD(`${getTimerTitle(timer)} Shown in Menu Bar`);
    await refreshActivity();
  }

  async function stopTimer(timer: TimerActivity) {
    await removeTimer(timer.id);
    await showHUD(`${getTimerTitle(timer)} Stopped`);
    await refreshActivity();
  }

  async function stopAllTimers() {
    await removeAllTimers();
    await showHUD("All Timers Stopped");
    await refreshActivity();
  }

  async function saveTimerAsFavorite(timer: TimerActivity) {
    await addFavoriteTimer(timer.durationMs, timer.name);
    await showHUD(`${getTimerTitle(timer)} Saved as Favorite`);
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search timers">
      {isLoading ? null : timers.length === 0 ? (
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
            onSaveFavorite={saveTimerAsFavorite}
            onRefresh={refreshActivity}
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
  onSaveFavorite,
  onRefresh,
}: {
  timer: TimerActivity;
  now: number;
  isSelected: boolean;
  onSelect: (timer: TimerActivity) => Promise<void>;
  onStop: (timer: TimerActivity) => Promise<void>;
  onStopAll: () => Promise<void>;
  onSaveFavorite: (timer: TimerActivity) => Promise<void>;
  onRefresh: () => Promise<void>;
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
          <Action.Push
            title="Rename Timer"
            icon={Icon.Pencil}
            target={<RenameTimerForm timer={timer} onRenamed={onRefresh} />}
          />
          <Action
            title="Save as Favorite"
            icon={Icon.Star}
            onAction={() => onSaveFavorite(timer)}
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

function RenameTimerForm({
  timer,
  onRenamed,
}: {
  timer: TimerActivity;
  onRenamed: () => Promise<void>;
}) {
  const { pop } = useNavigation();

  async function renameTimer(values: { name: string }) {
    await updateTimerName(timer.id, values.name);
    await showHUD("Timer Renamed");
    await onRenamed();
    pop();
  }

  return (
    <Form
      navigationTitle="Rename Timer"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Rename Timer"
            icon={Icon.Pencil}
            onSubmit={renameTimer}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="Timer Name"
        defaultValue={timer.name ?? ""}
        placeholder="Timer"
      />
    </Form>
  );
}
