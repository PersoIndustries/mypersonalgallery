import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

/** Uploads one object photo into the signed-in collector's own folder. */
export const uploadObjectImage = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Invalid upload');
    const file = data.get('file');
    if (!(file instanceof File)) throw new Error('No file received');
    if (!IMAGE_TYPES.includes(file.type)) throw new Error('Unsupported image format');
    if (file.size > IMAGE_MAX_BYTES) throw new Error('Image is larger than 10 MB');
    return file;
  })
  .handler(async ({ data: file, context }) => {
    const ext = (file.type.split('/')[1] ?? 'jpg').replace('jpeg', 'jpg');
    const path = `${context.userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await context.supabase.storage
      .from('object-images')
      .upload(path, await file.arrayBuffer(), { contentType: file.type });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return { url: `/api/public/images/${path}` };
  });

/** Own-folder storage path behind an /api/public/images URL, or null. */
export function ownImagePath(url: string, userId: string): string | null {
  const m = /^\/api\/public\/images\/([0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpg|jpeg|png|webp|gif|avif))$/i.exec(url ?? '');
  return m && m[1]!.startsWith(`${userId}/`) ? m[1]! : null;
}

/** Replaces the profile photo (small WebP) and deletes the previous uploaded one. */
export const uploadAvatar = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error('Invalid upload');
    const file = data.get('file');
    if (!(file instanceof File)) throw new Error('No file received');
    if (file.type !== 'image/webp') throw new Error('Unsupported image format');
    if (file.size > 512 * 1024) throw new Error('Image is too large');
    return file;
  })
  .handler(async ({ data: file, context }) => {
    const c = context.supabase;
    const { data: profile, error: readError } = await c.from('profiles').select('avatar').eq('user_id', context.userId).single();
    if (readError) throw new Error(readError.message);
    const path = `${context.userId}/${crypto.randomUUID()}.webp`;
    const { error } = await c.storage.from('object-images').upload(path, await file.arrayBuffer(), { contentType: 'image/webp' });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const url = `/api/public/images/${path}`;
    const { error: saveError } = await c.from('profiles').update({ avatar: url }).eq('user_id', context.userId);
    if (saveError) { await c.storage.from('object-images').remove([path]); throw new Error(saveError.message); }
    const old = ownImagePath(profile.avatar, context.userId);
    if (old) await c.storage.from('object-images').remove([old]);
    const { clearPublicCatalogCache } = await import('./public-cache.server');
    await clearPublicCatalogCache();
    return { url };
  });
