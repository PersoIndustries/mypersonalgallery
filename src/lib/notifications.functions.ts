import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getNotifications = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ unreadOnly: z.boolean().default(false), page: z.number().int().min(0).max(10000).default(0) }).parse(input))
  .handler(async ({ context, data }) => {
    setResponseHeader('Cache-Control', 'no-store');
    let query = context.supabase.from('notifications').select('id,kind,data,read_at,created_at').eq('user_id', context.userId);
    if (data.unreadOnly) query = query.is('read_at', null);
    const [rows, count] = await Promise.all([
      query.order('created_at', { ascending: false }).order('id').range(data.page * 30, data.page * 30 + 30),
      context.supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', context.userId).is('read_at', null),
    ]);
    if (rows.error || count.error) throw new Error('Unable to load notifications');
    return { items: (rows.data ?? []).slice(0, 30), hasMore: (rows.data?.length ?? 0) > 30, unreadCount: count.count ?? 0 };
  });

export const markNotificationsRead = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ id: z.string().uuid().optional(), read: z.boolean().default(true) }).parse(input))
  .handler(async ({ context, data }) => {
    setResponseHeader('Cache-Control', 'no-store');
    let query = context.supabase.from('notifications').update({ read_at: data.read ? new Date().toISOString() : null }).eq('user_id', context.userId);
    if (data.id) query = query.eq('id', data.id);
    else if (!data.read) throw new Error('Select a notification');
    else query = query.is('read_at', null);
    const { error } = await query;
    if (error) throw new Error('Unable to update notifications');
  });