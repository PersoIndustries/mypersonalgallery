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
