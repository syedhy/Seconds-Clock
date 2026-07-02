import { LaunchType, LocalStorage, launchCommand } from "@raycast/api";

const ACTIVE_ACTIVITY_KEY = "activeActivity";
const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;

export type TimerActivity = {
  type: "timer";
  name?: string;
  durationMs: number;
  startedAt: number;
  endsAt: number;
};

export type StopwatchActivity = {
  type: "stopwatch";
  startedAt: number;
};

export type ActiveActivity = TimerActivity | StopwatchActivity;

export async function getActiveActivity(): Promise<ActiveActivity | undefined> {
  const storedActivity =
    await LocalStorage.getItem<string>(ACTIVE_ACTIVITY_KEY);

  if (!storedActivity) {
    return undefined;
  }

  try {
    return JSON.parse(storedActivity) as ActiveActivity;
  } catch {
    await clearActiveActivity();
    return undefined;
  }
}

export async function saveActiveActivity(
  activity: ActiveActivity,
): Promise<void> {
  await LocalStorage.setItem(ACTIVE_ACTIVITY_KEY, JSON.stringify(activity));
}

export async function showActivityInMenuBar(): Promise<void> {
  try {
    await launchCommand({
      name: "menu-bar-clock",
      type: LaunchType.Background,
    });
  } catch {
    // The user may have disabled the menu-bar command in Raycast settings.
  }
}

export async function clearActiveActivity(): Promise<void> {
  await LocalStorage.removeItem(ACTIVE_ACTIVITY_KEY);
}

export function createTimerActivity(
  durationMs: number,
  name?: string,
): TimerActivity {
  const startedAt = Date.now();

  return {
    type: "timer",
    name: name?.trim() || undefined,
    durationMs,
    startedAt,
    endsAt: startedAt + durationMs,
  };
}

export function createStopwatchActivity(): StopwatchActivity {
  return {
    type: "stopwatch",
    startedAt: Date.now(),
  };
}

export function getTimerRemainingMs(
  activity: TimerActivity,
  now = Date.now(),
): number {
  return Math.max(0, activity.endsAt - now);
}

export function getStopwatchElapsedMs(
  activity: StopwatchActivity,
  now = Date.now(),
): number {
  return Math.max(0, now - activity.startedAt);
}

export function formatActivityDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / SECOND_MS));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds]
      .map((part) => part.toString().padStart(2, "0"))
      .join(":");
  }

  return [minutes, seconds]
    .map((part) => part.toString().padStart(2, "0"))
    .join(":");
}

export function durationPartsToMs(
  hours: string,
  minutes: string,
  seconds: string,
): number {
  const parsedHours = parsePositiveInteger(hours);
  const parsedMinutes = parsePositiveInteger(minutes);
  const parsedSeconds = parsePositiveInteger(seconds);

  return (
    parsedHours * HOUR_MS +
    parsedMinutes * MINUTE_MS +
    parsedSeconds * SECOND_MS
  );
}

function parsePositiveInteger(value: string): number {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return 0;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    return Number.NaN;
  }

  return parsedValue;
}

export function truncateMenuBarName(name: string): string {
  const trimmedName = name.trim();

  if (trimmedName.length <= 18) {
    return trimmedName;
  }

  return `${trimmedName.slice(0, 17)}...`;
}
