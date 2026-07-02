import { LaunchType, LocalStorage, launchCommand } from "@raycast/api";

const ACTIVITY_STATE_KEY = "activityState";
const LEGACY_ACTIVE_ACTIVITY_KEY = "activeActivity";
const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;

export type TimerActivity = {
  id: string;
  name?: string;
  durationMs: number;
  startedAt: number;
  endsAt: number;
};

export type StopwatchActivity = {
  startedAt: number;
};

export type ActivityState = {
  timers: TimerActivity[];
  selectedTimerId?: string;
  stopwatch?: StopwatchActivity;
};

type LegacyActiveActivity =
  | (Omit<TimerActivity, "id"> & { type: "timer" })
  | (StopwatchActivity & { type: "stopwatch" });

const emptyActivityState = (): ActivityState => ({
  timers: [],
});

export async function getActivityState(): Promise<ActivityState> {
  const storedState = await LocalStorage.getItem<string>(ACTIVITY_STATE_KEY);

  if (storedState) {
    try {
      return normalizeActivityState(JSON.parse(storedState) as ActivityState);
    } catch {
      await LocalStorage.removeItem(ACTIVITY_STATE_KEY);
    }
  }

  return await migrateLegacyActivityState();
}

export async function saveActivityState(state: ActivityState): Promise<void> {
  await LocalStorage.setItem(
    ACTIVITY_STATE_KEY,
    JSON.stringify(normalizeActivityState(state)),
  );
}

export async function addTimer(
  durationMs: number,
  name?: string,
): Promise<TimerActivity> {
  const state = await getActivityState();
  const timer = createTimerActivity(durationMs, name);
  const timers = sortTimersByEnding([...state.timers, timer]);

  await saveActivityState({
    ...state,
    timers,
    selectedTimerId: state.selectedTimerId ?? getDefaultTimer(timers)?.id,
  });

  return timer;
}

export async function selectTimer(timerId: string): Promise<void> {
  const state = await getActivityState();
  const timer = state.timers.find(
    (existingTimer) => existingTimer.id === timerId,
  );

  if (!timer) {
    return;
  }

  await saveActivityState({
    ...state,
    selectedTimerId: timer.id,
  });
}

export async function removeTimer(timerId: string): Promise<ActivityState> {
  const state = await getActivityState();
  const timers = state.timers.filter((timer) => timer.id !== timerId);
  const selectedTimerId =
    state.selectedTimerId === timerId
      ? getDefaultTimer(timers)?.id
      : state.selectedTimerId;
  const nextState = normalizeActivityState({
    ...state,
    timers,
    selectedTimerId,
  });

  await saveActivityState(nextState);
  return nextState;
}

export async function removeAllTimers(): Promise<ActivityState> {
  const state = await getActivityState();
  const nextState = normalizeActivityState({
    ...state,
    timers: [],
    selectedTimerId: undefined,
  });

  await saveActivityState(nextState);
  return nextState;
}

export async function startStopwatch(): Promise<void> {
  const state = await getActivityState();

  await saveActivityState({
    ...state,
    stopwatch: createStopwatchActivity(),
  });
}

export async function stopStopwatch(): Promise<ActivityState> {
  const state = await getActivityState();
  const nextState = normalizeActivityState({
    ...state,
    stopwatch: undefined,
  });

  await saveActivityState(nextState);
  return nextState;
}

export async function removeCompletedTimers(
  now = Date.now(),
): Promise<TimerActivity[]> {
  const state = await getActivityState();
  const completedTimers = state.timers.filter(
    (timer) => getTimerRemainingMs(timer, now) === 0,
  );

  if (completedTimers.length === 0) {
    return [];
  }

  const completedTimerIds = new Set(completedTimers.map((timer) => timer.id));
  const timers = state.timers.filter(
    (timer) => !completedTimerIds.has(timer.id),
  );
  const selectedTimerId = completedTimerIds.has(state.selectedTimerId ?? "")
    ? getDefaultTimer(timers)?.id
    : state.selectedTimerId;

  await saveActivityState({
    ...state,
    timers,
    selectedTimerId,
  });

  return completedTimers;
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

export function getSelectedTimer(
  state: ActivityState,
): TimerActivity | undefined {
  const selectedTimer = state.timers.find(
    (timer) => timer.id === state.selectedTimerId,
  );

  return selectedTimer ?? getDefaultTimer(state.timers);
}

export function getDefaultTimer(
  timers: TimerActivity[],
): TimerActivity | undefined {
  return sortTimersByEnding(timers)[0];
}

export function sortTimersByEnding(timers: TimerActivity[]): TimerActivity[] {
  return [...timers].sort((firstTimer, secondTimer) => {
    if (firstTimer.endsAt !== secondTimer.endsAt) {
      return firstTimer.endsAt - secondTimer.endsAt;
    }

    return firstTimer.startedAt - secondTimer.startedAt;
  });
}

export function createTimerActivity(
  durationMs: number,
  name?: string,
): TimerActivity {
  const startedAt = Date.now();

  return {
    id: createActivityId(),
    name: name?.trim() || undefined,
    durationMs,
    startedAt,
    endsAt: startedAt + durationMs,
  };
}

export function createStopwatchActivity(): StopwatchActivity {
  return {
    startedAt: Date.now(),
  };
}

export function getTimerRemainingMs(
  timer: TimerActivity,
  now = Date.now(),
): number {
  return Math.max(0, timer.endsAt - now);
}

export function getStopwatchElapsedMs(
  stopwatch: StopwatchActivity,
  now = Date.now(),
): number {
  return Math.max(0, now - stopwatch.startedAt);
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

export function parseDurationInput(value: string): number {
  const normalizedValue = value.trim().toLowerCase();

  if (!normalizedValue) {
    return 0;
  }

  if (/^\d+(:\d{1,2}){1,2}$/.test(normalizedValue)) {
    return parseColonDuration(normalizedValue);
  }

  const matches = [...normalizedValue.matchAll(/(\d+)\s*([hms])/g)];

  if (matches.length > 0) {
    const matchedText = matches.map((match) => match[0]).join("");
    const compactInput = normalizedValue.replace(/\s/g, "");

    if (matchedText !== compactInput) {
      return Number.NaN;
    }

    return matches.reduce((durationMs, match) => {
      const amount = Number(match[1]);
      const unit = match[2];

      if (unit === "h") {
        return durationMs + amount * HOUR_MS;
      }

      if (unit === "m") {
        return durationMs + amount * MINUTE_MS;
      }

      return durationMs + amount * SECOND_MS;
    }, 0);
  }

  const minutes = Number(normalizedValue);

  if (!Number.isInteger(minutes) || minutes < 0) {
    return Number.NaN;
  }

  return minutes * MINUTE_MS;
}

export function getTimerTitle(timer: TimerActivity): string {
  return timer.name || "Timer";
}

export function truncateMenuBarName(name: string): string {
  const trimmedName = name.trim();

  if (trimmedName.length <= 18) {
    return trimmedName;
  }

  return `${trimmedName.slice(0, 17)}...`;
}

function normalizeActivityState(state: ActivityState): ActivityState {
  const timers = sortTimersByEnding(state.timers ?? []);
  const hasSelectedTimer = timers.some(
    (timer) => timer.id === state.selectedTimerId,
  );

  return {
    timers,
    selectedTimerId: hasSelectedTimer
      ? state.selectedTimerId
      : getDefaultTimer(timers)?.id,
    stopwatch: state.stopwatch,
  };
}

async function migrateLegacyActivityState(): Promise<ActivityState> {
  const legacyActivity = await LocalStorage.getItem<string>(
    LEGACY_ACTIVE_ACTIVITY_KEY,
  );

  if (!legacyActivity) {
    return emptyActivityState();
  }

  try {
    const activity = JSON.parse(legacyActivity) as LegacyActiveActivity;
    const state =
      activity.type === "timer"
        ? normalizeActivityState({
            timers: [
              {
                id: createActivityId(),
                name: activity.name,
                durationMs: activity.durationMs,
                startedAt: activity.startedAt,
                endsAt: activity.endsAt,
              },
            ],
          })
        : normalizeActivityState({
            timers: [],
            stopwatch: {
              startedAt: activity.startedAt,
            },
          });

    await saveActivityState(state);
    await LocalStorage.removeItem(LEGACY_ACTIVE_ACTIVITY_KEY);

    return state;
  } catch {
    await LocalStorage.removeItem(LEGACY_ACTIVE_ACTIVITY_KEY);
    return emptyActivityState();
  }
}

function createActivityId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

function parseColonDuration(value: string): number {
  const parts = value.split(":").map(Number);

  if (parts.some((part) => !Number.isInteger(part) || part < 0)) {
    return Number.NaN;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;

    if (seconds > 59) {
      return Number.NaN;
    }

    return minutes * MINUTE_MS + seconds * SECOND_MS;
  }

  const [hours, minutes, seconds] = parts;

  if (minutes > 59 || seconds > 59) {
    return Number.NaN;
  }

  return hours * HOUR_MS + minutes * MINUTE_MS + seconds * SECOND_MS;
}
