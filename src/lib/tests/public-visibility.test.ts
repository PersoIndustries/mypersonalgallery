import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogForViewer, onlyPublicCatalog } from '../public-visibility';
import { museums, objects, users } from '../mock-data';

const publicMuseum = { ...museums[0]!, isPublic: true, features: { documents: false, links: false, price: false } };
const privateMuseum = { ...museums[1]!, id: 'private-museum', isPublic: false };
const visibleObject = {
  ...objects[0]!,
  museumId: publicMuseum.id,
  isVisible: true,
  hiddenFeatures: ['model3d' as const],
};
const hiddenObject = { ...objects[1]!, id: 'hidden-object', museumId: publicMuseum.id, isVisible: false };
const privateObject = { ...objects[2]!, id: 'private-object', museumId: privateMuseum.id, isVisible: true };
const catalog = { museums: [publicMuseum, privateMuseum], objects: [visibleObject, hiddenObject, privateObject], users };

test('public catalogue excludes private museums, their objects and hidden objects', () => {
  const result = onlyPublicCatalog(catalog);
  assert.deepEqual(result.museums.map(museum => museum.id), [publicMuseum.id]);
  assert.deepEqual(result.objects.map(object => object.id), [visibleObject.id]);
});

test('public responses remove values from sections disabled by the museum or object', () => {
  const result = onlyPublicCatalog(catalog).objects[0]!;
  assert.deepEqual(result.documents, []);
  assert.deepEqual(result.links, []);
  assert.equal(result.price, undefined);
  assert.equal(result.modelUrl, null);
  assert.equal(result.description, visibleObject.description);
  assert.equal(visibleObject.modelUrl !== null, true);
});

test('a direct public lookup cannot resolve a hidden object or an object in a private museum', () => {
  const result = onlyPublicCatalog(catalog);
  assert.equal(result.objects.find(object => object.id === hiddenObject.id), undefined);
  assert.equal(result.objects.find(object => object.id === privateObject.id), undefined);
  assert.equal(result.museums.find(museum => museum.id === privateMuseum.id), undefined);
});

test('owners and admins retain complete private records without sharing them with other collectors', () => {
  const owner = catalogForViewer(catalog, publicMuseum.ownerId);
  assert.equal(owner.objects.find(object => object.id === hiddenObject.id)?.documents.length, hiddenObject.documents.length);
  assert.equal(owner.objects.find(object => object.id === privateObject.id)?.documents.length, privateObject.documents.length);
  const otherCollector = catalogForViewer(catalog, 'another-collector');
  assert.equal(otherCollector.objects.find(object => object.id === privateObject.id), undefined);
  assert.equal(otherCollector.objects.find(object => object.id === hiddenObject.id), undefined);
  assert.deepEqual(otherCollector.objects.find(object => object.id === visibleObject.id)?.documents, []);
  const admin = catalogForViewer(catalog, 'administrator', true);
  assert.equal(admin.objects.length, 3);
  assert.equal(admin.objects.find(object => object.id === visibleObject.id)?.modelUrl, visibleObject.modelUrl);
});
