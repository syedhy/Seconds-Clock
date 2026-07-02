import { useCallback, useEffect, useState } from "react";

import { getActivityState, type ActivityState } from "../lib/activity";

export function useActiveActivity(refreshKey?: number) {
  const [activityState, setActivityState] = useState<ActivityState>();
  const [isLoading, setIsLoading] = useState(true);

  const refreshActivity = useCallback(async () => {
    const state = await getActivityState();

    setActivityState(state);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    getActivityState().then((state) => {
      if (isMounted) {
        setActivityState(state);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  return {
    activityState,
    isLoading,
    refreshActivity,
  };
}
