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
  /** Preferences accessible in the `toggle-menu-bar-clock` command */
  export type ToggleMenuBarClock = ExtensionPreferences & {}
  /** Preferences accessible in the `menu-bar-clock` command */
  export type MenuBarClock = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `show-seconds-clock` command */
  export type ShowSecondsClock = {}
  /** Arguments passed to the `toggle-menu-bar-clock` command */
  export type ToggleMenuBarClock = {}
  /** Arguments passed to the `menu-bar-clock` command */
  export type MenuBarClock = {}
}

