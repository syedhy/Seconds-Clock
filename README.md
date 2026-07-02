# Seconds Clock

Seconds Clock is a minimal digital clock for Raycast with always-visible seconds.

It is designed to stay focused: a large flip-clock-inspired Raycast view and one time-format preference. No alarms, timers, stopwatches, world clocks, clipboard actions, menu bar replacement, or extra utilities.

## Commands

### Show Seconds Clock

Opens the main clock view with:

- Hours, minutes, and seconds
- Date in `DD - MM - YYYY` format
- 12-hour or 24-hour display based on the extension preference

## Preference

Seconds Clock has one preference:

- **Time Format**: `12-hour` or `24-hour`

The default is `12-hour`.

## Menu Bar Cleanup

macOS already supports showing seconds in the system menu bar. Seconds Clock keeps a minimal menu bar cleanup command only so older enabled development builds can remove their stale menu bar item.

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
