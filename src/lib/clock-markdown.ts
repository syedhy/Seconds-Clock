import type { FormattedClockTime } from "./time";

export function renderClockMarkdown(
  time: FormattedClockTime,
  date: string,
): string {
  const meridiem = time.meridiem ? ` ${time.meridiem}` : "";

  return `<div align="center">

<br />

# \`${time.hours}\` : \`${time.minutes}\` : \`${time.seconds}\`${meridiem}

#### ${date}

</div>`;
}
