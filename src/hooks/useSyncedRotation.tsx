'use client';

import { useEffect, useState } from 'react';

// Shared cadence for every rotating "sliding" word on the site. Because the
// index is derived from the wall clock, all instances using this hook show the
// same index at the same moment and transition in unison — even if they mount
// at different times or rotate through lists of different lengths.
export const ROTATION_PERIOD = 2600;

export function useSyncedRotation(length: number, period = ROTATION_PERIOD) {
  // Start at 0 so SSR and the first client render agree (no hydration
  // mismatch); the effect snaps to the shared clock right after mount.
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length <= 0) return;
    const tick = () => setIndex(Math.floor(Date.now() / period) % length);

    tick(); // align to the shared clock immediately after mount

    // Fire subsequent ticks exactly on the shared period boundaries so every
    // instance changes at the same instant.
    let interval: number | undefined;
    const delay = period - (Date.now() % period);
    const timeout = window.setTimeout(() => {
      tick();
      interval = window.setInterval(tick, period);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [length, period]);

  return index;
}
