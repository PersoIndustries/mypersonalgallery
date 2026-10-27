import { createServerFn } from '@tanstack/react-start';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Database, Json } from '@/integrations/supabase/types';
import type { Museum, User, CollectionObject } from './types';
import { museumSchema, museumPatchSchema, objectSchema, objectPatchSchema, profileSchema, taskSchema } from './catalog.schemas';

export interface Catalog { museums:Museum[]; objects:CollectionObject[]; users:User[] }
const date = (s:string) => s.slice(0,10);
async function readCatalog(client:SupabaseClient<Database>):Promise<Catalog> {
  const [m,o,u] = await Promise.all([client.from('museums').select('*').order('created_at'),client.from('objects').select('*').order('created_at'),client.from('profiles').select('id,name,username,avatar,bio,location,joined')]);
  for (const result of [m,o,u]) if(result.error) throw new Error(result.error.message);
  return { museums:(m.data ?? []).map(r => ({id:r.id,slug:r.slug,ownerId:r.owner_id,title:r.title,description:r.description,cover:r.cover,category:r.category,isPublic:r.is_public,features:r.features as NonNullable<Museum['features']>,createdAt:date(r.created_at)})), objects:(o.data ?? []).map(r => ({...(r.payload as unknown as CollectionObject),id:r.id,museumId:r.museum_id,isVisible:r.is_visible,createdAt:date(r.created_at)})), users:(u.data ?? []).map(r => ({...r,joined:r.joined})) };
}
export const getPublicCatalog = createServerFn({method:'GET'}).handler(async () => {
  const key=process.env['SUPABASE_PUBLISHABLE_KEY']; const url=process.env['SUPABASE_URL'];
  if(!key || !url) throw new Error('Supabase is unavailable');
  const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const headers=new Headers(init?.headers);if(key.startsWith('sb_') && headers.get('Authorization')===`Bearer ${key}`) headers.delete('Authorization');headers.set('apikey',key);return fetch(input,{...init,headers});}}});
  return readCatalog(client);
});
export const getPrivateCatalog = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const [catalog,role] = await Promise.all([readCatalog(context.supabase),context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'})]);
  if(role.error) throw new Error(role.error.message);
  return {...catalog,currentUserId:context.userId,isAdmin:role.data === true};
});
const id = z.string().min(1).max(100);
export const mutationSchema=z.discriminatedUnion('action',[
  z.object({action:z.literal('createMuseum'),data:museumSchema}),z.object({action:z.literal('updateMuseum'),id,data:museumPatchSchema}),z.object({action:z.literal('deleteMuseum'),id}),
  z.object({action:z.literal('createObject'),museumId:id,data:objectSchema}),z.object({action:z.literal('updateObject'),id,data:objectPatchSchema}),z.object({action:z.literal('deleteObject'),id}),z.object({action:z.literal('updateProfile'),data:profileSchema}),
]);
export const mutateCatalog = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input => mutationSchema.parse(input)).handler(async ({data,context}) => {
  const c=context.supabase;
  if(data.action==='createMuseum'){
    const uuid=crypto.randomUUID(); const slug=(data.data.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'museum')+'-'+uuid.slice(0,8);
    const {error}=await c.from('museums').insert({id:uuid,slug,owner_id:context.userId,title:data.data.title,description:data.data.description,cover:data.data.cover,category:data.data.category,is_public:data.data.isPublic,features:data.data.features as Json});if(error) throw new Error(error.message);return uuid;
  }
  if(data.action==='updateMuseum'){
    const p=data.data; const patch:Database['public']['Tables']['museums']['Update']={};
    if(p.title!==undefined)patch.title=p.title;if(p.description!==undefined)patch.description=p.description;if(p.cover!==undefined)patch.cover=p.cover;if(p.category!==undefined)patch.category=p.category;if(p.isPublic!==undefined)patch.is_public=p.isPublic;if(p.features!==undefined)patch.features=p.features;
    const {error}=await c.from('museums').update(patch).eq('id',data.id).select('id').single();if(error) throw new Error(error.message);return data.id;
  }
  if(data.action==='deleteMuseum' || data.action==='deleteObject'){
    const {error}=await c.from(data.action==='deleteMuseum'?'museums':'objects').delete().eq('id',data.id).select('id').single();if(error) throw new Error(error.message);return data.id;
  }
  if(data.action==='createObject'){
    const uuid=crypto.randomUUID();const {error}=await c.from('objects').insert({id:uuid,museum_id:data.museumId,is_visible:data.data.isVisible ?? true,payload:data.data as Json});if(error) throw new Error(error.message);return uuid;
  }
  if(data.action==='updateObject'){
    const {data:row,error:readError}=await c.from('objects').select('payload').eq('id',data.id).single();if(readError) throw new Error(readError.message);
    const payload={...(row.payload as Record<string,Json>),...data.data}; const {error}=await c.from('objects').update({payload:payload as Json,...(data.data.isVisible!==undefined?{is_visible:data.data.isVisible}:{})}).eq('id',data.id).select('id').single();if(error) throw new Error(error.message);return data.id;
  }
  const patch:Database['public']['Tables']['profiles']['Update']={};const p=data.data;if(p.name!==undefined)patch.name=p.name;if(p.bio!==undefined)patch.bio=p.bio;if(p.avatar!==undefined)patch.avatar=p.avatar;if(p.location!==undefined)patch.location=p.location;
  const {error}=await c.from('profiles').update(patch).eq('user_id',context.userId).select('id').single();if(error) throw new Error(error.message);return context.userId;
});
export const getAdminTasks=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async ({context})=>{
  const {data:admin,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(error || !admin) throw new Error('Administrator access required');
  const {data,error:err}=await context.supabase.from('dev_tasks').select('payload');if(err) throw new Error(err.message);return (data ?? []).map(r=>taskSchema.parse(r.payload));
});
export const saveAdminTasks=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(v=>z.array(taskSchema).max(1000).parse(v)).handler(async ({data,context})=>{
  const {data:admin,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(error || !admin) throw new Error('Administrator access required');
  const {data:old,error:readError}=await context.supabase.from('dev_tasks').select('id');if(readError)throw new Error(readError.message);
  if(data.length){const {error:err}=await context.supabase.from('dev_tasks').upsert(data.map(t=>({id:t.id,payload:t as unknown as Json})));if(err)throw new Error(err.message);}
  const removed=(old ?? []).filter(t=>!data.some(n=>n.id===t.id)).map(t=>t.id);if(removed.length){const {error:err}=await context.supabase.from('dev_tasks').delete().in('id',removed);if(err)throw new Error(err.message);}
});