export type OptionalPatch<T> = { [K in keyof T]?: T[K] | undefined };

export function patchById<T extends { id: string }>(items: T[], id: string, patch: OptionalPatch<T>): T[] {
  return items.map(item => item.id === id ? { ...item, ...patch } : item);
}

/** Rolls back only fields still holding the failed attempt's values. */
export function rollbackById<T extends { id: string }>(
  items: T[],
  id: string,
  attempted: Partial<T>,
  previous: T,
): T[] {
  return items.map(item => {
    if (item.id !== id) return item;
    const rollback: Partial<T> = {};
    for (const key of Object.keys(attempted) as (keyof T)[]) {
      if (Object.is(item[key], attempted[key])) rollback[key] = previous[key];
    }
    return { ...item, ...rollback };
  });
}
