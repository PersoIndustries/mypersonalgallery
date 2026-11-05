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
