import { createFileRoute } from '@tanstack/react-router';

// Streams uploaded object photos from the private bucket. Paths are
// owner-folder/random-uuid names, only image files are served.
export const Route = createFileRoute('/api/public/images/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? '';
        if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|gif|avif)$/i.test(path)) return new Response('Not found', { status: 404 });
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        const { data, error } = await supabaseAdmin.storage.from('object-images').download(path);
        if (error || !data) return new Response('Not found', { status: 404 });
        return new Response(data, { headers: { 'Content-Type': data.type || 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable' } });
      },
    },
  },
});
