import {
  Action,
  ActionPanel,
  Icon,
  List,
  closeMainWindow,
  showHUD,
} from "@raycast/api";
import { useEffect, useMemo, useState } from "react";

import {
  addFavoriteTimer,
  addTimer,
  formatActivityDuration,
  formatDurationWords,
  getFavoriteTimers,
  parseTimerInput,
  removeFavoriteTimer,
  showActivityInMenuBar,
  type FavoriteTimer,
  type ParsedTimerInput,
} from "../lib/activity";

export function TimerForm() {
  const [searchText, setSearchText] = useState("");
  const [favorites, setFavorites] = useState<FavoriteTimer[]>([]);
  const parsedTimer = useMemo(() => parseTimerInput(searchText), [searchText]);

  useEffect(() => {
    getFavoriteTimers().then(setFavorites);
  }, []);

  async function startTimer(timer: ParsedTimerInput) {
    await addTimer(timer.durationMs, timer.name);
    await showActivityInMenuBar();
    await showHUD(`${timer.name || "Timer"} Started`);
    await closeMainWindow({ clearRootSearch: true });
  }

  async function startFavoriteTimer(favorite: FavoriteTimer) {
    await startTimer({
      durationMs: favorite.durationMs,
      name: favorite.name,
    });
  }

  async function saveFavorite(timer: ParsedTimerInput) {
    const favorite = await addFavoriteTimer(timer.durationMs, timer.name);

    setFavorites((currentFavorites) => [...currentFavorites, favorite]);
    await showHUD("Favorite Timer Saved");
  }

  async function deleteFavorite(favorite: FavoriteTimer) {
    await removeFavoriteTimer(favorite.id);
    setFavorites((currentFavorites) =>
      currentFavorites.filter(
        (currentFavorite) => currentFavorite.id !== favorite.id,
      ),
    );
    await showHUD("Favorite Timer Removed");
  }

  return (
    <List
      navigationTitle="Set Timer"
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Type a duration, e.g. Tea 2h 5m 3s"
      filtering={false}
    >
      {parsedTimer ? (
        <List.Section title="Timer">
          <TimerResultItem
            timer={parsedTimer}
            onStart={startTimer}
            onSaveFavorite={saveFavorite}
          />
        </List.Section>
      ) : favorites.length === 0 ? (
        <List.EmptyView
          icon={Icon.Clock}
          title="Type a Timer Duration"
          description="Try 25m, 2h 5m 3s, 2hr 5min 3 sec, or Tea 15m."
        />
      ) : null}

      {favorites.length > 0 ? (
        <List.Section title="Favorites">
          {favorites.map((favorite) => (
            <FavoriteTimerItem
              key={favorite.id}
              favorite={favorite}
              onStart={startFavoriteTimer}
              onDelete={deleteFavorite}
            />
          ))}
        </List.Section>
      ) : null}
    </List>
  );
}

function TimerResultItem({
  timer,
  onStart,
  onSaveFavorite,
}: {
  timer: ParsedTimerInput;
  onStart: (timer: ParsedTimerInput) => Promise<void>;
  onSaveFavorite: (timer: ParsedTimerInput) => Promise<void>;
}) {
  return (
    <List.Item
      id="parsed-timer"
      title={timer.name || formatDurationWords(timer.durationMs)}
      subtitle={
        timer.name ? formatDurationWords(timer.durationMs) : "Start timer"
      }
      icon={Icon.Clock}
      accessories={[{ text: formatActivityDuration(timer.durationMs) }]}
      actions={
        <ActionPanel>
          <Action
            title="Start Timer"
            icon={Icon.Play}
            onAction={() => onStart(timer)}
          />
          <Action
            title="Save as Favorite"
            icon={Icon.Star}
            onAction={() => onSaveFavorite(timer)}
          />
        </ActionPanel>
      }
    />
  );
}

function FavoriteTimerItem({
  favorite,
  onStart,
  onDelete,
}: {
  favorite: FavoriteTimer;
  onStart: (favorite: FavoriteTimer) => Promise<void>;
  onDelete: (favorite: FavoriteTimer) => Promise<void>;
}) {
  return (
    <List.Item
      title={favorite.name || "Timer"}
      subtitle={formatDurationWords(favorite.durationMs)}
      icon={Icon.Star}
      accessories={[{ text: formatActivityDuration(favorite.durationMs) }]}
      actions={
        <ActionPanel>
          <Action
            title="Start Favorite Timer"
            icon={Icon.Play}
            onAction={() => onStart(favorite)}
          />
          <Action
            title="Remove Favorite"
            icon={Icon.Trash}
            style={Action.Style.Destructive}
            onAction={() => onDelete(favorite)}
          />
        </ActionPanel>
      }
    />
  );
}
