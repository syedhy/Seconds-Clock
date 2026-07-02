import { Icon, MenuBarExtra, showHUD } from "@raycast/api";
import { useEffect } from "react";

import { useActiveActivity } from "./hooks/use-active-activity";
import {
  clearActiveActivity,
  formatActivityDuration,
  getStopwatchElapsedMs,
  getTimerRemainingMs,
  saveActiveActivity,
  truncateMenuBarName,
  type ActiveActivity,
} from "./lib/activity";
import { useNow } from "./hooks/use-now";

export default function Command() {
  const now = useNow();
  const { activity, isLoading, refreshActivity } = useActiveActivity(
    now.getTime(),
  );
  const nowMs = now.getTime();
  // Raycast unloads menu-bar commands after rendering; active counters need to
  // keep executing so the menu-bar title can tick once per second.
  const shouldKeepRunning =
    activity?.type === "stopwatch" ||
    (activity?.type === "timer" && getTimerRemainingMs(activity, nowMs) > 0);

  useEffect(() => {
    if (activity?.type !== "timer") {
      return;
    }

    const hasFinished = getTimerRemainingMs(activity, nowMs) === 0;

    if (!hasFinished || activity.notifiedAt) {
      return;
    }

    const completedActivity = {
      ...activity,
      notifiedAt: nowMs,
    };

    saveActiveActivity(completedActivity).then(() => {
      showHUD(`${activity.name ? `${activity.name} ` : ""}Timer Done`);
      refreshActivity();
    });
  }, [activity, nowMs, refreshActivity]);

  async function clearActivity() {
    await clearActiveActivity();
    await showHUD("Cleared");
    await refreshActivity();
  }

  const title = activity ? getMenuBarTitle(activity, nowMs) : "Seconds Clock";

  return (
    <MenuBarExtra
      title={title}
      tooltip="Seconds Clock"
      isLoading={isLoading || shouldKeepRunning}
    >
      {activity ? (
        <MenuBarExtra.Section title={getSectionTitle(activity)}>
          <MenuBarExtra.Item
            title={getActivityTitle(activity)}
            subtitle={getActivitySubtitle(activity, nowMs)}
            icon={activity.type === "timer" ? Icon.Clock : Icon.Stopwatch}
          />
          <MenuBarExtra.Item
            title="Clear"
            icon={Icon.XMarkCircle}
            onAction={clearActivity}
          />
        </MenuBarExtra.Section>
      ) : (
        <MenuBarExtra.Item
          title="No Active Timer or Stopwatch"
          subtitle="Start one from Show Seconds Clock"
          icon={Icon.Clock}
        />
      )}
    </MenuBarExtra>
  );
}

function getMenuBarTitle(activity: ActiveActivity, now: number): string {
  if (activity.type === "stopwatch") {
    return formatActivityDuration(getStopwatchElapsedMs(activity, now));
  }

  const remainingTime = formatActivityDuration(
    getTimerRemainingMs(activity, now),
  );

  if (!activity.name) {
    return remainingTime;
  }

  return `${truncateMenuBarName(activity.name)} ${remainingTime}`;
}

function getSectionTitle(activity: ActiveActivity): string {
  return activity.type === "timer" ? "Timer" : "Stopwatch";
}

function getActivityTitle(activity: ActiveActivity): string {
  if (activity.type === "stopwatch") {
    return "Stopwatch";
  }

  return activity.name || "Timer";
}

function getActivitySubtitle(activity: ActiveActivity, now: number): string {
  if (activity.type === "stopwatch") {
    return formatActivityDuration(getStopwatchElapsedMs(activity, now));
  }

  return formatActivityDuration(getTimerRemainingMs(activity, now));
}
