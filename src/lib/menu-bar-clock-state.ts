import { LocalStorage } from "@raycast/api";

const MENU_BAR_CLOCK_ENABLED_KEY = "menuBarClockEnabled";

export async function isMenuBarClockEnabled(): Promise<boolean> {
  return (
    (await LocalStorage.getItem<boolean>(MENU_BAR_CLOCK_ENABLED_KEY)) ?? false
  );
}

export async function setMenuBarClockEnabled(
  isEnabled: boolean,
): Promise<void> {
  await LocalStorage.setItem(MENU_BAR_CLOCK_ENABLED_KEY, isEnabled);
}
