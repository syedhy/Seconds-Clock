import { environment } from "@raycast/api";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
import { useEffect, useState } from "react";

import { renderClockSvg } from "../lib/clock-art";
import type { FormattedClockTime } from "../lib/time";

export function useClockArtwork(
  time: FormattedClockTime,
  date: string,
): string | undefined {
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    mkdirSync(environment.supportPath, { recursive: true });

    const imagePath = join(environment.supportPath, "seconds-clock.svg");
    writeFileSync(imagePath, renderClockSvg({ time, date }), "utf8");

    const url = new URL(pathToFileURL(imagePath).href);
    url.searchParams.set("raycast-width", "900");
    url.searchParams.set("raycast-height", "441");
    url.searchParams.set(
      "v",
      `${time.hours}-${time.minutes}-${time.seconds}-${time.meridiem ?? ""}`,
    );

    setImageUrl(url.toString());
  }, [date, time.hours, time.minutes, time.seconds, time.meridiem]);

  return imageUrl;
}
