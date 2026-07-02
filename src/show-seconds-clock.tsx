import { Action, ActionPanel, Detail, Icon, showHUD } from "@raycast/api";
import { useState } from "react";

import { TimerForm } from "./components/timer-form";
import { useActiveActivity } from "./hooks/use-active-activity";
import { useClockArtwork } from "./hooks/use-clock-artwork";
import { useNow } from "./hooks/use-now";
import {
  clearActiveActivity,
  createStopwatchActivity,
  formatActivityDuration,
  getStopwatchElapsedMs,
  getTimerRemainingMs,
  saveActiveActivity,
} from "./lib/activity";
import { renderClockMarkdown } from "./lib/clock-markdown";
import { getTimeFormatPreference } from "./lib/preferences";
import { formatClockDate, formatClockTime } from "./lib/time";

export default function Command() {
  const [refreshKey, setRefreshKey] = useState(0);
  const timeFormat = getTimeFormatPreference();
  const now = useNow();
  const { activity, refreshActivity } = useActiveActivity(refreshKey);
  const time = formatClockTime(now, timeFormat);
  const date = formatClockDate(now);
  const clockImageUrl = useClockArtwork(time, date);

  async function startStopwatch() {
    await saveActiveActivity(createStopwatchActivity());
    await showHUD("Stopwatch Started");
    setRefreshKey((key) => key + 1);
  }

  async function clearActivity() {
    await clearActiveActivity();
    await showHUD("Cleared");
    setRefreshKey((key) => key + 1);
  }

  return (
    <Detail
      navigationTitle="Seconds Clock"
      markdown={renderClockMarkdown(clockImageUrl)}
      metadata={
        activity ? (
          <Detail.Metadata>
            <Detail.Metadata.Label
              title={activity.type === "timer" ? "Timer" : "Stopwatch"}
              text={
                activity.type === "timer"
                  ? formatActivityDuration(
                      getTimerRemainingMs(activity, now.getTime()),
                    )
                  : formatActivityDuration(
                      getStopwatchElapsedMs(activity, now.getTime()),
                    )
              }
            />
          </Detail.Metadata>
        ) : undefined
      }
      actions={
        <ActionPanel>
          <Action.Push
            title="Set Timer"
            icon={Icon.Clock}
            target={<TimerForm />}
            onPop={refreshActivity}
          />
          <Action
            title="Start Stopwatch"
            icon={Icon.Stopwatch}
            onAction={startStopwatch}
          />
          {activity ? (
            <Action
              title="Clear Timer or Stopwatch"
              icon={Icon.XMarkCircle}
              onAction={clearActivity}
            />
          ) : null}
        </ActionPanel>
      }
    />
  );
}
