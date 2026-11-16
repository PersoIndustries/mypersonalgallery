import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { requireAdminRole } from './platform-rules';
import { extractImagePaths } from './admin-content';

type Ctx = { supabase: { rpc: (...a: any[]) => any }; userId: string };
async function admin(context: Ctx) {
  setResponseHeader('Cache-Control', 'no-store');
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  requireAdminRole(!role.error && role.data);
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  return supabaseAdmin;
}
async function removeImages(db: any, paths: string[]) {
  for (let i = 0; i < paths.length; i += 100) await db.storage.from('object-images').remove(paths.slice(i, i + 100));
}

export type AdminUserRow = { id: string; userId: string | null; name: string; username: string; email: string | null; country: string | null; createdAt: string; lastSignIn: string | null; museums: number; objects: number; plan: string; isAdmin: boolean; banned: boolean };
export type AdminMuseumRow = { id: string; slug: string; title: string; cover: string; isPublic: boolean; ownerId: string; ownerName: string; objects: number; createdAt: string };
export type AdminObjectRow = { id: string; title: string; image: string; isVisible: boolean; museumId: string; museumTitle: string; museumSlug: string; createdAt: string };

export const listAdminContent = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const db = await admin(context as Ctx);
  const [profiles, museums, objects, roles, subs, authUsers] = await Promise.all([
    db.from('profiles').select('id,user_id,name,username,country,created_at').order('created_at', { ascending: false }).limit(1000),
    db.from('museums').select('id,slug,title,cover,is_public,owner_id,created_at').order('created_at', { ascending: false }).limit(1000),
    db.from('objects').select('id,museum_id,is_visible,created_at,title:payload->>title,images:payload->images').order('created_at', { ascending: false }).limit(1000),
    db.from('user_roles').select('user_id,role'),
    db.from('subscriptions').select('user_id,plan,status'),
    db.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  if (profiles.error || museums.error || objects.error) throw new Error('Unable to load content');
  const authById = new Map((authUsers.data?.users ?? []).map((u) => [u.id, u]));
  const admins = new Set((roles.data ?? []).filter((r) => r.role === 'admin').map((r) => r.user_id));
  const planBy = new Map((subs.data ?? []).map((s) => [s.user_id, s.status === 'active' ? s.plan : 'free']));
  const objCount = new Map<string, number>();
  for (const o of objects.data ?? []) objCount.set(o.museum_id, (objCount.get(o.museum_id) ?? 0) + 1);
  const profileName = new Map((profiles.data ?? []).map((p) => [p.id, p.name]));
  const museumRows: AdminMuseumRow[] = (museums.data ?? []).map((m) => ({ id: m.id, slug: m.slug, title: m.title, cover: m.cover, isPublic: m.is_public, ownerId: m.owner_id, ownerName: profileName.get(m.owner_id) ?? '—', objects: objCount.get(m.id) ?? 0, createdAt: m.created_at }));
  const museumBy = new Map(museumRows.map((m) => [m.id, m]));
  const users: AdminUserRow[] = (profiles.data ?? []).map((p) => {
    const own = museumRows.filter((m) => m.ownerId === p.id);
    const au = p.user_id ? authById.get(p.user_id) : undefined;
    return { id: p.id, userId: p.user_id, name: p.name, username: p.username, email: au?.email ?? null, country: p.country, createdAt: p.created_at, lastSignIn: au?.last_sign_in_at ?? null, museums: own.length, objects: own.reduce((n, m) => n + m.objects, 0), plan: p.user_id ? planBy.get(p.user_id) ?? 'free' : '—', isAdmin: !!p.user_id && admins.has(p.user_id), banned: !!(au as any)?.banned_until && new Date((au as any).banned_until) > new Date() };
  });
  const objectRows: AdminObjectRow[] = (objects.data ?? []).map((o: any) => { const m = museumBy.get(o.museum_id); const imgs = Array.isArray(o.images) ? o.images : []; return { id: o.id, title: o.title ?? 'Untitled', image: imgs[0] ?? '', isVisible: o.is_visible, museumId: o.museum_id, museumTitle: m?.title ?? '—', museumSlug: m?.slug ?? '', createdAt: o.created_at }; });
  return { users, museums: museumRows, objects: objectRows, me: (context as Ctx).userId };
});

export const adminSetMuseumPublic = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({ id: z.string().min(1), isPublic: z.boolean() }).parse(i)).handler(async ({ data, context }) => {
  const db = await admin(context as Ctx);
  const { error } = await db.from('museums').update({ is_public: data.isPublic }).eq('id', data.id);
  if (error) throw new Error('Unable to update museum');
});
export const adminSetObjectVisible = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({ id: z.string().min(1), isVisible: z.boolean() }).parse(i)).handler(async ({ data, context }) => {
  const db = await admin(context as Ctx);
  const { error } = await db.from('objects').update({ is_visible: data.isVisible }).eq('id', data.id);
  if (error) throw new Error('Unable to update object');
});

export const adminDeleteObject = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({ id: z.string().min(1) }).parse(i)).handler(async ({ data, context }) => {
  const db = await admin(context as Ctx);
  const row = await db.from('objects').select('payload').eq('id', data.id).maybeSingle();
  if (row.error || !row.data) throw new Error('Object not found');
  const { error } = await db.from('objects').delete().eq('id', data.id);
  if (error) throw new Error('Unable to delete object');
  await removeImages(db, extractImagePaths(row.data.payload));
});

export const adminDeleteMuseum = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({ id: z.string().min(1) }).parse(i)).handler(async ({ data, context }) => {
  const db = await admin(context as Ctx);
  const [museum, objs] = await Promise.all([db.from('museums').select('cover').eq('id', data.id).maybeSingle(), db.from('objects').select('payload').eq('museum_id', data.id)]);
  if (museum.error || !museum.data) throw new Error('Museum not found');
  const paths = extractImagePaths([museum.data.cover, ...(objs.data ?? []).map((o) => o.payload)]);
  const del = await db.from('objects').delete().eq('museum_id', data.id);
  if (del.error) throw new Error('Unable to delete objects');
  const { error } = await db.from('museums').delete().eq('id', data.id);
  if (error) throw new Error('Unable to delete museum');
  await removeImages(db, paths);
});

export const adminDeleteUser = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({ profileId: z.string().min(1) }).parse(i)).handler(async ({ data, context }) => {
  const db = await admin(context as Ctx);
  const profile = await db.from('profiles').select('user_id').eq('id', data.profileId).maybeSingle();
  if (profile.error || !profile.data) throw new Error('User not found');
  if (profile.data.user_id === (context as Ctx).userId) throw new Error('You cannot delete your own account here');
  const museums = await db.from('museums').select('id,cover').eq('owner_id', data.profileId);
  const ids = (museums.data ?? []).map((m) => m.id);
  const objs = ids.length ? await db.from('objects').select('payload').in('museum_id', ids) : { data: [] as { payload: unknown }[] };
  const paths = extractImagePaths([...(museums.data ?? []).map((m) => m.cover), ...(objs.data ?? []).map((o) => o.payload)]);
  const purge = await db.rpc('admin_purge_profile', { target_profile: data.profileId });
  if (purge.error) {
    const msg = purge.error.message;
    throw new Error(/billing/i.test(msg) ? 'This account has billing records and cannot be deleted' : /Administrators/i.test(msg) ? 'Administrators cannot be deleted' : 'Unable to delete user');
  }
  const uid = profile.data.user_id;
  if (uid) {
    const listed = await db.storage.from('object-images').list(uid, { limit: 1000 });
    for (const f of listed.data ?? []) paths.push(`${uid}/${f.name}`);
    const res = await db.auth.admin.deleteUser(uid);
    if (res.error) throw new Error('Content removed, but the login could not be deleted');
  }
  await removeImages(db, [...new Set(paths)]);
});

export const adminSetUserBanned = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({ userId: z.string().uuid(), banned: z.boolean() }).parse(i)).handler(async ({ data, context }) => {
  const db = await admin(context as Ctx);
  if (data.userId === (context as Ctx).userId) throw new Error('You cannot suspend yourself');
  const isAdm = await db.rpc('has_role', { _user_id: data.userId, _role: 'admin' });
  if (isAdm.data) throw new Error('Administrators cannot be suspended');
  const { error } = await db.auth.admin.updateUserById(data.userId, { ban_duration: data.banned ? '876000h' : 'none' } as any);
  if (error) throw new Error('Unable to update account');
  if (data.banned) {
    const p = await db.from('profiles').select('id').eq('user_id', data.userId).maybeSingle();
    if (p.data) await db.from('museums').update({ is_public: false }).eq('owner_id', p.data.id);
  }
});
