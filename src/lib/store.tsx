import { createContext,useContext,useEffect,useState,useCallback,type ReactNode } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate,useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getPrivateCatalog,getPublicCatalog,mutateCatalog,type Catalog,mutationSchema } from './catalog.functions';
import type { z } from 'zod';
import type { Museum,CollectionObject,User } from './types';
import { museumSchema,museumPatchSchema,objectSchema,objectPatchSchema,profileSchema } from './catalog.schemas';
interface StoreValue extends Catalog {
 currentUserId:string|null; currentUser:User|null; isAdmin:boolean; ready:boolean; publicMuseums:Museum[];publicObjects:CollectionObject[];
 theme:'dark'|'light';toggleTheme:()=>void;login:(email:string,password:string)=>Promise<void>;signup:(name:string,username:string,email:string,password:string)=>Promise<boolean>;logout:()=>Promise<void>;
 updateProfile:(patch:Partial<User>)=>Promise<void>;museumsOf:(id:string)=>Museum[];objectsOf:(id:string)=>CollectionObject[];getMuseum:(id:string)=>Museum|undefined;getObject:(id:string)=>CollectionObject|undefined;
 createMuseum:(data:Omit<Museum,'id'|'slug'|'ownerId'|'createdAt'>)=>Promise<void>;updateMuseum:(id:string,patch:Partial<Museum>)=>Promise<void>;deleteMuseum:(id:string)=>Promise<void>;
 createObject:(museumId:string,data:Omit<CollectionObject,'id'|'museumId'|'createdAt'>)=>Promise<void>;updateObject:(id:string,patch:Partial<CollectionObject>)=>Promise<void>;deleteObject:(id:string)=>Promise<void>;
}
const StoreContext=createContext<StoreValue|null>(null);
const empty:Catalog={museums:[],objects:[],users:[]};
export function StoreProvider({children,initialCatalog}:{children:ReactNode;initialCatalog:Catalog}){
 const [state,setState]=useState<Catalog>(initialCatalog);const [currentUserId,setUserId]=useState<string|null>(null);const [isAdmin,setAdmin]=useState(false);const [ready,setReady]=useState(false);const [theme,setTheme]=useState<'dark'|'light'>('dark');
 const privateCatalog=useServerFn(getPrivateCatalog);const mutate=useServerFn(mutateCatalog);const queryClient=useQueryClient();const navigate=useNavigate();const router=useRouter();
 const refresh=useCallback(async()=>{
  const {data:{user}}=await supabase.auth.getUser();
  if(user){const data=await privateCatalog();setState(data);setUserId(data.currentUserId);setAdmin(data.isAdmin);}
  else {setState(await getPublicCatalog());setUserId(null);setAdmin(false);}
  setReady(true);
 },[privateCatalog]);
 useEffect(()=>{
  const saved=localStorage.getItem('myownmuseum.theme');if(saved==='light'||saved==='dark')setTheme(saved);
  void refresh().catch(e=>{toast.error(e.message);setReady(true);});
  const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{
   if(event==='PASSWORD_RECOVERY')sessionStorage.setItem('museum.password-recovery','true');
   if(!['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event))return;
   if(event==='SIGNED_OUT'){setState(empty);setUserId(null);setAdmin(false);}
   setTimeout(()=>{void refresh().catch(e=>toast.error(e.message));void router.invalidate();if(event!=='SIGNED_OUT')void queryClient.invalidateQueries();},0);
  });return ()=>subscription.unsubscribe();
 },[refresh,router,queryClient]);
 useEffect(()=>{document.documentElement.classList.toggle('light',theme==='light');document.documentElement.style.colorScheme=theme;localStorage.setItem('myownmuseum.theme',theme);},[theme]);
 const run=async(data:z.infer<typeof mutationSchema>)=>{await mutate({data});await refresh();};
 const publicMuseums=state.museums.filter(m=>m.isPublic);const publicIds=new Set(publicMuseums.map(m=>m.id));
 const value:StoreValue={...state,currentUserId,currentUser:state.users.find(u=>u.id===currentUserId)??null,isAdmin,ready,publicMuseums,publicObjects:state.objects.filter(o=>o.isVisible!==false&&publicIds.has(o.museumId)),theme,toggleTheme:()=>setTheme(t=>t==='dark'?'light':'dark'),
 login:async(email,password)=>{const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw new Error(error.message);await refresh();},
 signup:async(name,username,email,password)=>{if(!name.trim() || !/^[a-zA-Z0-9_-]{3,40}$/.test(username.trim()) || password.length<8)throw new Error('Enter a name, valid username and password of at least 8 characters');const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{name:name.trim(),username:username.trim().toLowerCase()},emailRedirectTo:window.location.origin}});if(error)throw new Error(error.message);if(data.session)await refresh();return Boolean(data.session);},
 logout:async()=>{await queryClient.cancelQueries();queryClient.clear();setState(empty);setUserId(null);setAdmin(false);const {error}=await supabase.auth.signOut();if(error)throw new Error(error.message);await navigate({to:'/auth',replace:true});},
 updateProfile:patch=>run({action:'updateProfile',data:profileSchema.parse(patch)}),museumsOf:id=>state.museums.filter(m=>m.ownerId===id),objectsOf:id=>state.objects.filter(o=>o.museumId===id),getMuseum:id=>state.museums.find(m=>m.id===id||m.slug===id),getObject:id=>state.objects.find(o=>o.id===id),
 createMuseum:data=>run({action:'createMuseum',data:museumSchema.parse(data)}),updateMuseum:(id,data)=>run({action:'updateMuseum',id,data:museumPatchSchema.parse(data)}),deleteMuseum:id=>run({action:'deleteMuseum',id}),
 createObject:(museumId,data)=>run({action:'createObject',museumId,data:objectSchema.parse(data)}),updateObject:(id,data)=>run({action:'updateObject',id,data:objectPatchSchema.parse(data)}),deleteObject:id=>run({action:'deleteObject',id})};
 return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore(){const value=useContext(StoreContext);if(!value)throw new Error('Missing museum provider');return value;}
