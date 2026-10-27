import { useContext,useEffect,useState,useCallback,type ReactNode } from 'react';
import { StoreContext } from './store-context';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate,useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getPrivateCatalog,getPublicCatalog,mutateCatalog,type Catalog,mutationSchema } from './catalog.functions';
import type { z } from 'zod';
import type { Museum,CollectionObject,User } from './types';
import { museumSchema,museumPatchSchema,objectSchema,objectPatchSchema,profileSchema } from './catalog.schemas';
import { countrySchema, diagnosticPath } from './platform-rules';
import { reportAppError } from './platform.functions';
import { capturePasswordLink, markPasswordRecovery, clearPasswordLink } from './password-link';
export interface StoreValue extends Catalog {
 currentUserId:string|null; currentUser:User|null; isAdmin:boolean; ready:boolean; publicMuseums:Museum[];publicObjects:CollectionObject[];
 theme:'dark'|'light';toggleTheme:()=>void;login:(email:string,password:string)=>Promise<void>;signup:(name:string,username:string,email:string,password:string,country:string)=>Promise<boolean>;logout:()=>Promise<void>;
 updateProfile:(patch:Partial<User>)=>Promise<void>;museumsOf:(id:string)=>Museum[];objectsOf:(id:string)=>CollectionObject[];getMuseum:(id:string)=>Museum|undefined;getObject:(id:string)=>CollectionObject|undefined;
 createMuseum:(data:Omit<Museum,'id'|'slug'|'ownerId'|'createdAt'>)=>Promise<void>;updateMuseum:(id:string,patch:Partial<Museum>)=>Promise<void>;deleteMuseum:(id:string)=>Promise<void>;
 createObject:(museumId:string,data:Omit<CollectionObject,'id'|'museumId'|'createdAt'>)=>Promise<void>;updateObject:(id:string,patch:Partial<CollectionObject>)=>Promise<void>;deleteObject:(id:string)=>Promise<void>;
}
const empty:Catalog={museums:[],objects:[],users:[]};
export function StoreProvider({children,initialCatalog=empty}:{children:ReactNode;initialCatalog?:Catalog|undefined}){
 const [storedState,setState]=useState<Catalog>(initialCatalog);
 // Hot reload can retain an undefined state from the previous provider signature.
 const state=storedState ?? initialCatalog ?? empty;
 const [currentUserId,setUserId]=useState<string|null>(null);const [isAdmin,setAdmin]=useState(false);const [ready,setReady]=useState(false);const [theme,setTheme]=useState<'dark'|'light'>('dark');
 const privateCatalog=useServerFn(getPrivateCatalog);const mutate=useServerFn(mutateCatalog);const queryClient=useQueryClient();const navigate=useNavigate();const router=useRouter();
 const report=useServerFn(reportAppError);
 const refresh=useCallback(async()=>{
  const {data:{user}}=await supabase.auth.getUser();
  if(user){const data=await privateCatalog();setState(data);setUserId(data.currentUserId);setAdmin(data.isAdmin);}
  else {setState(await queryClient.fetchQuery({queryKey:['public-catalog'],queryFn:()=>getPublicCatalog(),staleTime:120000}));setUserId(null);setAdmin(false);}
  setReady(true);
 },[privateCatalog,queryClient]);
 useEffect(()=>{
  capturePasswordLink(window.location.hash, window.location.search);
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  const sync=()=>setTheme(media.matches?'dark':'light');sync();media.addEventListener('change',sync);
  void refresh().catch(e=>{toast.error(e.message);setReady(true);});
  const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{
   if(event==='PASSWORD_RECOVERY')markPasswordRecovery();
   if(!['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event))return;
   if(event==='SIGNED_OUT'){clearPasswordLink();setState(empty);setUserId(null);setAdmin(false);}
   setTimeout(()=>{void refresh().catch(e=>toast.error(e.message));void router.invalidate();if(event!=='SIGNED_OUT')void queryClient.invalidateQueries();},0);
  });return ()=>{subscription.unsubscribe();media.removeEventListener('change',sync);};
 },[refresh,router,queryClient]);
 useEffect(()=>{document.documentElement.classList.toggle('light',theme==='light');document.documentElement.style.colorScheme=theme;localStorage.setItem('myownmuseum.theme',theme);},[theme]);
 useEffect(()=>{
  if('serviceWorker' in navigator)void navigator.serviceWorker.register('/image-cache.js').catch(()=>{});
  if(!currentUserId)return;
  let sent=0;const seen=new Set<string>();
  const capture=async(category:'runtime'|'unhandled_rejection'|'operation'|'route',error:unknown)=>{
   if(sent>=20)return;const description=error instanceof Error?error.name+':'+error.message:String(error);
   const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(description));const fingerprint=Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('');
   if(seen.has(fingerprint))return;seen.add(fingerprint);sent++;void report({data:{category,path:diagnosticPath(window.location.pathname),fingerprint}}).catch(()=>{});
  };
  const onError=(e:ErrorEvent)=>void capture('runtime',e.error??e.message);const onReject=(e:PromiseRejectionEvent)=>void capture('unhandled_rejection',e.reason);
  const onOperation=(e:Event)=>void capture('operation',(e as CustomEvent).detail);
  window.addEventListener('error',onError);window.addEventListener('unhandledrejection',onReject);window.addEventListener('museum-operation-error',onOperation);
  return ()=>{window.removeEventListener('error',onError);window.removeEventListener('unhandledrejection',onReject);window.removeEventListener('museum-operation-error',onOperation);};
 },[currentUserId,report]);
 const run=async(data:z.infer<typeof mutationSchema>)=>{try{await mutate({data});await queryClient.invalidateQueries({queryKey:['public-catalog']});await refresh();}catch(error){window.dispatchEvent(new CustomEvent('museum-operation-error',{detail:error}));throw error;}};
 const publicMuseums=state.museums.filter(m=>m.isPublic);const publicIds=new Set(publicMuseums.map(m=>m.id));
 const value:StoreValue={...state,currentUserId,currentUser:state.users.find(u=>u.id===currentUserId)??null,isAdmin,ready,publicMuseums,publicObjects:state.objects.filter(o=>o.isVisible!==false&&publicIds.has(o.museumId)),theme,toggleTheme:()=>setTheme(t=>t==='dark'?'light':'dark'),
 login:async(email,password)=>{const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw new Error(error.message);await refresh();},
 signup:async(name,username,email,password,country)=>{countrySchema.parse(country);if(!name.trim() || !/^[a-zA-Z0-9_-]{3,40}$/.test(username.trim()) || password.length<8)throw new Error('Enter a name, valid username and password of at least 8 characters');const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{name:name.trim(),username:username.trim().toLowerCase(),country},emailRedirectTo:window.location.origin}});if(error)throw new Error(error.message);if(data.session)await refresh();return Boolean(data.session);},
 logout:async()=>{await queryClient.cancelQueries();queryClient.clear();setState(empty);setUserId(null);setAdmin(false);const {error}=await supabase.auth.signOut();if(error)throw new Error(error.message);await navigate({to:'/auth',replace:true});},
 updateProfile:patch=>run({action:'updateProfile',data:profileSchema.parse(patch)}),museumsOf:id=>state.museums.filter(m=>m.ownerId===id),objectsOf:id=>state.objects.filter(o=>o.museumId===id),getMuseum:id=>state.museums.find(m=>m.id===id||m.slug===id),getObject:id=>state.objects.find(o=>o.id===id),
 createMuseum:data=>run({action:'createMuseum',data:museumSchema.parse(data)}),updateMuseum:(id,data)=>run({action:'updateMuseum',id,data:museumPatchSchema.parse(data)}),deleteMuseum:id=>run({action:'deleteMuseum',id}),
 createObject:(museumId,data)=>run({action:'createObject',museumId,data:objectSchema.parse(data)}),updateObject:(id,data)=>run({action:'updateObject',id,data:objectPatchSchema.parse(data)}),deleteObject:id=>run({action:'deleteObject',id})};
 return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore(){const value=useContext(StoreContext);if(!value)throw new Error('Missing museum provider');return value;}
