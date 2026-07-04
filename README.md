# Seconds Clock

Seconds Clock is a focused digital clock for Raycast with always-visible seconds, polished multi-timer support, and a simple menu bar stopwatch.

It is designed to stay lightweight: a large flip-clock-inspired Raycast view, named timers, one stopwatch, and one time-format preference. No alarms, world clocks, clipboard actions, or extra utilities.

## Commands

### Show Seconds Clock

Opens the main clock view with:

- Hours, minutes, and seconds
- Date in `DD - MM - YYYY` format
- 12-hour or 24-hour display based on the extension preference

### Set Timer

Opens a focused timer form with:

- One searchable input for timer duration
- Friendly formats like `30m 20s`, `2hr 5min 3 sec`, `1h 5m`, or `1:30:00`
- Optional names in the same input, like `Tea 15m`
- Favorite timers that can be started again quickly
- Multiple timers can run at once

### Manage Timers

Shows all running timers with actions to:

- Choose which timer appears in the menu bar
- Rename timers
- Save timers as favorites
- Stop one timer
- Stop all timers

### Stop Timer

Stops the only running timer immediately, or shows a selection list when multiple timers are running.

### Start Stopwatch

Starts a stopwatch from zero and shows it in the menu bar.

### Stop Stopwatch

Stops the running stopwatch without affecting timers.

### Seconds Clock Menu Bar

Shows the selected timer, the soonest-ending timer, or the stopwatch in the macOS menu bar.

The menu-bar item is hidden when there is no active timer or stopwatch.

Timer behavior:

- Multiple named timers at once
- Countdown with seconds
- Menu-bar title shows the selected timer, or the soonest-ending timer by default
- Menu-bar timer actions include adding 5 or 30 minutes
- Finished timers show a Raycast completion indication and are removed automatically

Stopwatch behavior:

- Counts up from zero
- Shows seconds in the menu bar
- Can be cleared from the menu-bar dropdown

## Preference

Seconds Clock has one preference:

- **Time Format**: `12-hour` or `24-hour`

The default is `12-hour`.

## Development

```bash
npm install
npm run dev
```

Validate before publishing:

```bash
npm run lint
npm run build
```
