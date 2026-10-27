import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
import type {Database} from '@/integrations/supabase/types';
import {museumSchema,objectPatchSchema,profileSchema} from '../catalog.schemas';
import {museums,objects,users} from '../mock-data';
const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
test('museum mutation never accepts a caller-supplied owner',()=>{assert.equal('ownerId' in museumSchema.parse({...museums[0],ownerId:'someone-else'}),false);});
test('profile mutation never accepts roles or identity',()=>{assert.deepEqual(profileSchema.parse({name:'Carlos',role:'admin',user_id:'other'}),{name:'Carlos'});});
test('object patch cannot move records between museums',()=>{assert.equal('museumId' in objectPatchSchema.parse({museumId:'other',title:'Radio'}),false);});
test('public catalogue exactly preserves every original record',async()=>{
 assert.ok(url);assert.ok(key);const c=createClient<Database>(url,key,{auth:{persistSession:false}});
 const m=await c.from('museums').select('*');const o=await c.from('objects').select('*');const u=await c.from('profiles').select('*');assert.equal(m.error,null);assert.equal(o.error,null);assert.equal(u.error,null);
 for(const original of museums){const saved:Database['public']['Tables']['museums']['Row']|undefined=m.data?.find(r=>r.id===original.id);assert.ok(saved);assert.equal(saved.title,original.title);assert.equal(saved.owner_id,original.ownerId);assert.equal(saved.description,original.description);}
 for(const original of objects){const saved:Database['public']['Tables']['objects']['Row']|undefined=o.data?.find(r=>r.id===original.id);assert.ok(saved);assert.deepEqual(saved.payload,original);}
 for(const original of users){const saved:Database['public']['Tables']['profiles']['Row']|undefined=u.data?.find(r=>r.id===original.id);assert.ok(saved);assert.equal(saved.username,original.username);assert.equal(saved.user_id,null);}
});
test('anonymous callers cannot access administrator roles or tasks',async()=>{
 assert.ok(url);assert.ok(key);const c=createClient(url,key,{auth:{persistSession:false}});
 for(const table of ['user_roles','dev_tasks']){const r=await c.from(table).select('*');assert.ok(r.error || r.data?.length===0);}
});
