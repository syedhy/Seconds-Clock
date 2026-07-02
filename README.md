# Seconds Clock

Seconds Clock is a minimal digital clock for Raycast with always-visible seconds.

It is designed to stay focused: a polished clock view, a live menu bar clock, and one time-format preference. No alarms, timers, stopwatches, world clocks, clipboard actions, or extra utilities.

## Commands

### Show Seconds Clock

Opens the main clock view with:

- Hours, minutes, and seconds
- Date in `DD - MM - YYYY` format
- 12-hour or 24-hour display based on the extension preference

### Seconds Clock Menu Bar

Shows a compact live clock in the macOS menu bar:

- `HH:MM:SS`
- No date
- Respects the same 12-hour or 24-hour preference

The menu bar dropdown includes actions to open the main clock or hide the menu bar clock.

## Preference

Seconds Clock has one preference:

- **Time Format**: `12-hour` or `24-hour`

The default is `12-hour`.

## Notes

Raycast menu bar commands are loaded and unloaded by Raycast. Seconds Clock keeps the menu bar command active while visible so the seconds can update once per second. If Raycast restarts or unloads extensions, run **Seconds Clock Menu Bar** again to show the live menu bar item.

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

