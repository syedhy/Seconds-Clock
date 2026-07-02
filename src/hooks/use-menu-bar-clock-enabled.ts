import { useEffect, useState } from "react";

import { isMenuBarClockEnabled } from "../lib/menu-bar-clock-state";

export function useMenuBarClockEnabled(): boolean | undefined {
  const [isEnabled, setIsEnabled] = useState<boolean>();

  useEffect(() => {
    let isMounted = true;

    isMenuBarClockEnabled().then((enabled) => {
      if (isMounted) {
        setIsEnabled(enabled);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return isEnabled;
}
