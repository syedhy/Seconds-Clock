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
}

declare namespace Arguments {
  /** Arguments passed to the `show-seconds-clock` command */
  export type ShowSecondsClock = {}
}

