/** Coalesces identical in-flight actions. Writes are never automatically retried. */
export function createSingleFlight() {
  const pending = new Map<string, Promise<unknown>>();

  return function singleFlight<T>(key: string, action: () => Promise<T>): Promise<T> {
    const existing = pending.get(key) as Promise<T> | undefined;
    if (existing) return existing;

    const promise = action().finally(() => {
      if (pending.get(key) === promise) pending.delete(key);
    });
    pending.set(key, promise);
    return promise;
  };
}

/** Reads get two automatic retries; writes deliberately do not use this policy. */
export function shouldRetryRead(failureCount: number): boolean {
  return failureCount < 2;
}

export function readRetryDelay(attempt: number): number {
  return Math.min(500 * 2 ** attempt, 3000);
}
