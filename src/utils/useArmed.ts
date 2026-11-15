import { useCallback, useEffect, useState } from "react";

// Two-step confirm: arm() on the first click, do the thing on the second.
// It disarms itself after `ms`, or when disarm() is called (blur, typing).
export const useArmed = (ms = 3000) => {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), ms);
    return () => clearTimeout(timer);
  }, [armed, ms]);

  const arm = useCallback(() => setArmed(true), []);
  const disarm = useCallback(() => setArmed(false), []);
  return { armed, arm, disarm };
};
