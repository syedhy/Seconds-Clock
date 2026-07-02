import { Detail, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";

import { formatClockDate, formatClockDisplay } from "./lib/time";
import type { TimeFormatPreference } from "./lib/time";

type Preferences = {
  timeFormat: TimeFormatPreference;
};

export default function Command() {
  const { timeFormat } = getPreferenceValues<Preferences>();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);

    return () => clearInterval(interval);
  }, []);

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
