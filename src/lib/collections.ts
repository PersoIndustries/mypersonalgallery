import type { CollectionObject, MuseumCollection, SpecPair } from './types';

/** Adds a tag unless empty or already present (case-insensitive). */
export function addTag(tags: string[], raw: string): string[] {
  const tag = raw.trim().replace(/,+$/, '').trim();
  if (!tag || tags.some(t => t.toLowerCase() === tag.toLowerCase())) return tags;
  return [...tags, tag];
}

/** Drops spec rows where both key and value are empty. */
export function cleanSpecs(specs: SpecPair[]): SpecPair[] {
  return specs
    .map(s => ({ key: s.key.trim(), value: s.value.trim() }))
    .filter(s => s.key || s.value);
}

export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
}

/** Objects in a collection; ids of deleted collections are ignored. */
export function objectsInCollection(objects: CollectionObject[], collectionId: string): CollectionObject[] {
  return objects.filter(o => (o.collectionIds ?? []).includes(collectionId));
}

export function addCollection(list: MuseumCollection[], name: string, id: string): MuseumCollection[] {
  const n = name.trim();
  if (!n || list.some(c => c.name.toLowerCase() === n.toLowerCase())) return list;
  return [...list, { id, name: n }];
}
