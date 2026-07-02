import { useCallback, useEffect, useState } from "react";

import { getActiveActivity, type ActiveActivity } from "../lib/activity";

export function useActiveActivity(refreshKey?: number) {
  const [activity, setActivity] = useState<ActiveActivity>();
  const [isLoading, setIsLoading] = useState(true);

  const refreshActivity = useCallback(async () => {
    const activeActivity = await getActiveActivity();

    setActivity(activeActivity);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    getActiveActivity().then((activeActivity) => {
      if (isMounted) {
        setActivity(activeActivity);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  return {
    activity,
    isLoading,
    refreshActivity,
  };
}
