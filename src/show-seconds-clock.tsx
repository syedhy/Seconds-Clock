import { Detail } from "@raycast/api";

import { useNow } from "./hooks/use-now";
import { getTimeFormatPreference } from "./lib/preferences";
import { formatClockDate, formatClockDisplay } from "./lib/time";

export default function Command() {
  const timeFormat = getTimeFormatPreference();
  const now = useNow();
  const time = formatClockDisplay(now, timeFormat);
  const date = formatClockDate(now);

  return (
    <Detail
      navigationTitle="Seconds Clock"
      markdown={`<div align="center">

# ${time}

### ${date}

</div>`}
    />
  );
}
