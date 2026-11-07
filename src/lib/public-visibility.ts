import { showFeature, type Catalog, type CollectionObject, type Museum } from './types';

/** Removes disabled field values as well as hiding their presentation. */
export function sanitizePublicMuseum(museum: Museum): Museum {
  return showFeature(museum, undefined, 'description') ? { ...museum } : { ...museum, description: '' };
}

export function sanitizePublicObject(object: CollectionObject, museum: Museum): CollectionObject {
  const sanitized: CollectionObject = { ...object };
  if (!showFeature(museum, object, 'description')) sanitized.description = '';
  if (!showFeature(museum, object, 'tags')) sanitized.tags = [];
  if (!showFeature(museum, object, 'condition')) delete sanitized.condition;
  if (!showFeature(museum, object, 'specs')) sanitized.specs = [];
  if (!showFeature(museum, object, 'history')) sanitized.history = '';
  if (!showFeature(museum, object, 'model3d')) sanitized.modelUrl = null;
  if (!showFeature(museum, object, 'documents')) sanitized.documents = [];
  if (!showFeature(museum, object, 'links')) sanitized.links = [];
  if (!showFeature(museum, object, 'price')) delete sanitized.price;
  return sanitized;
}

/**
 * Defense in depth alongside RLS: owners and admins keep their private catalogue;
 * everyone else's records are restricted to public, visible and sanitized data.
 */
export function catalogForViewer(catalog: Catalog, viewerId: string | null, isAdmin = false): Catalog {
  if (isAdmin) return catalog;

  const museums = catalog.museums.filter(museum => museum.isPublic || museum.ownerId === viewerId);
  const museumById = new Map(museums.map(museum => [museum.id, museum]));
  const objects = catalog.objects.flatMap(object => {
    const museum = museumById.get(object.museumId);
    if (!museum) return [];
    const isOwner = museum.ownerId === viewerId;
    if (!isOwner && (!museum.isPublic || object.isVisible === false)) return [];
    return [isOwner ? object : sanitizePublicObject(object, museum)];
  });

  return {
    museums: museums.map(museum => museum.ownerId === viewerId ? museum : sanitizePublicMuseum(museum)),
    objects,
    users: catalog.users,
  };
}

export const onlyPublicCatalog = (catalog: Catalog): Catalog => catalogForViewer(catalog, null);
