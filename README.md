# Seconds Clock

Seconds Clock is a polished digital clock for Raycast with always-visible seconds, a focused timer, and a simple stopwatch.

It is designed to stay focused: a large flip-clock-inspired Raycast view, one active timer or stopwatch, and one time-format preference. No alarms, world clocks, clipboard actions, or extra utilities.

## Commands

### Show Seconds Clock

Opens the main clock view with:

- Hours, minutes, and seconds
- Date in `DD - MM - YYYY` format
- 12-hour or 24-hour display based on the extension preference

### Set Timer

Opens a focused timer form with:

- Optional timer name
- Hours, minutes, and seconds
- One active timer at a time

### Start Stopwatch

Starts a stopwatch from zero and shows it in the menu bar.

### Seconds Clock Menu Bar

Shows the active timer or stopwatch in the macOS menu bar.

Timer behavior:

- One active timer at a time
- Optional timer name
- Countdown with seconds
- Menu-bar title shows `Name MM:SS` when named, or just `MM:SS` without a name

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
