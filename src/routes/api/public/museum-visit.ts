import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

// Anonymous visit beacon: one view per browser session plus visible seconds (capped at 900 in SQL).
const body = z.object({ museumId: z.string().min(1).max(64), newVisit: z.boolean(), seconds: z.number().int().min(0).max(3600) });
export const Route = createFileRoute('/api/public/museum-visit')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try { parsed = body.parse(JSON.parse(await request.text())); } catch { return new Response(null, { status: 400 }); }
        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
        await (supabaseAdmin as any).rpc('record_museum_visit', { target_museum: parsed.museumId, new_visit: parsed.newVisit, seconds: parsed.seconds });
        return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
      },
    },
  },
});
