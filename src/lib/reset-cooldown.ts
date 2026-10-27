import { useEffect, useState } from 'react';

/** Seconds a user must wait between password email requests (Supabase minimum is 60s). */
export const RESET_COOLDOWN_SECONDS = 60;
const KEY = 'museum.reset-cooldown-until';

export function isRateLimitError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? '');
  const status = (error as { status?: number } | null)?.status;
  return status === 429 || /rate limit|too many|security purposes/i.test(msg);
}

export function remainingSeconds(until: number, now: number): number {
  return Math.max(0, Math.ceil((until - now) / 1000));
}

/** Transient cooldown (sessionStorage only; contains no identity data). */
export function useResetCooldown() {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { setUntil(Number(sessionStorage.getItem(KEY)) || 0); }, []);
  const left = remainingSeconds(until, now);
  useEffect(() => {
    if (left <= 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [left]);
  const start = (seconds = RESET_COOLDOWN_SECONDS) => {
    const next = Date.now() + seconds * 1000;
    sessionStorage.setItem(KEY, String(next));
    setNow(Date.now());
    setUntil(next);
  };
  return { left, start };
}
