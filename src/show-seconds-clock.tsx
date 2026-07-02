import { Detail } from "@raycast/api";

import { useNow } from "./hooks/use-now";
import { renderClockMarkdown } from "./lib/clock-markdown";
import { getTimeFormatPreference } from "./lib/preferences";
import { formatClockDate, formatClockTime } from "./lib/time";

export default function Command() {
  const timeFormat = getTimeFormatPreference();
  const now = useNow();

  return (
    <Detail
      navigationTitle="Seconds Clock"
      markdown={renderClockMarkdown(
        formatClockTime(now, timeFormat),
        formatClockDate(now),
      )}
    />
  );
}
