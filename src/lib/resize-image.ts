// Browser-only: shrinks photos on the user's device before upload to save storage.
export const MAX_IMAGE_SIDE = 1080;

export function fitWithin(w: number, h: number, max = MAX_IMAGE_SIDE) {
  const scale = Math.min(1, max / Math.max(w, h));
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

export async function resizeImage(file: File, max = MAX_IMAGE_SIDE, quality = 0.82): Promise<File> {
  if (file.type === 'image/gif') return file; // keep animations intact
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch { return file; }
  const { width, height } = fitWithin(bitmap.width, bitmap.height, max);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) { bitmap.close(); return file; }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/webp', quality));
  const out = blob && blob.type === 'image/webp' ? blob
    : await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', quality));
  if (!out) return file;
  if (out.size >= file.size && width === bitmap.width) return file;
  const ext = out.type === 'image/webp' ? 'webp' : 'jpg';
  return new File([out], file.name.replace(/\.[^.]+$/, '') + '.' + ext, { type: out.type });
}

export const AVATAR_SIDE = 256;

/** Center-crops to a square and encodes a small WebP avatar. */
export async function makeAvatar(file: File, side = AVATAR_SIDE, quality = 0.78): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const s = Math.min(bitmap.width, bitmap.height);
  const out = Math.min(side, s);
  const canvas = document.createElement('canvas');
  canvas.width = out; canvas.height = out;
  const ctx = canvas.getContext('2d');
  if (!ctx) { bitmap.close(); throw new Error('Unable to process image'); }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, (bitmap.width - s) / 2, (bitmap.height - s) / 2, s, s, 0, 0, out, out);
  bitmap.close();
  const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/webp', quality));
  if (!blob || blob.type !== 'image/webp') throw new Error('Your browser cannot create WebP images');
  return new File([blob], 'avatar.webp', { type: 'image/webp' });
}
