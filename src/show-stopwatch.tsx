import { Icon, List } from "@raycast/api";

import { useActiveActivity } from "./hooks/use-active-activity";
import { useNow } from "./hooks/use-now";
import { formatActivityDuration, getStopwatchElapsedMs } from "./lib/activity";

export default function Command() {
  const now = useNow();
  const { activityState, isLoading } = useActiveActivity();
  const stopwatch = activityState?.stopwatch;

  return (
    <List isLoading={isLoading} navigationTitle="Stopwatch">
      {!isLoading && stopwatch ? (
        <List.Item
          title={formatActivityDuration(
            getStopwatchElapsedMs(stopwatch, now.getTime()),
          )}
          subtitle="Running"
          icon={Icon.Stopwatch}
        />
      ) : !isLoading ? (
        <List.EmptyView
          icon={Icon.Stopwatch}
          title="No Stopwatch Running"
          description="Run Start Stopwatch to begin counting."
        />
      ) : null}
    </List>
  );
}
