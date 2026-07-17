/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Time Format - Choose whether the clock uses a 12-hour or 24-hour format. */
  "timeFormat": "12-hour" | "24-hour"
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `show-seconds-clock` command */
  export type ShowSecondsClock = ExtensionPreferences & {}
  /** Preferences accessible in the `set-timer` command */
  export type SetTimer = ExtensionPreferences & {}
  /** Preferences accessible in the `manage-timers` command */
  export type ManageTimers = ExtensionPreferences & {}
  /** Preferences accessible in the `stop-timer` command */
  export type StopTimer = ExtensionPreferences & {}
  /** Preferences accessible in the `start-stopwatch` command */
  export type StartStopwatch = ExtensionPreferences & {}
  /** Preferences accessible in the `show-stopwatch` command */
  export type ShowStopwatch = ExtensionPreferences & {}
  /** Preferences accessible in the `stop-stopwatch` command */
  export type StopStopwatch = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `show-seconds-clock` command */
  export type ShowSecondsClock = {}
  /** Arguments passed to the `set-timer` command */
  export type SetTimer = {}
  /** Arguments passed to the `manage-timers` command */
  export type ManageTimers = {}
  /** Arguments passed to the `stop-timer` command */
  export type StopTimer = {}
  /** Arguments passed to the `start-stopwatch` command */
  export type StartStopwatch = {}
  /** Arguments passed to the `show-stopwatch` command */
  export type ShowStopwatch = {}
  /** Arguments passed to the `stop-stopwatch` command */
  export type StopStopwatch = {}
}

