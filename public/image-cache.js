const CACHE='museum-images-v1';
const LIMIT=80;
const TTL=7*24*60*60*1000;
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||req.destination!=='image')return;
 // Only explicitly public media; never cache signed/private Supabase media.
 const url=new URL(req.url);
 if(url.pathname.includes('/storage/v1/')&&!url.pathname.includes('/storage/v1/object/public/'))return;
 if(url.searchParams.has('token')||url.searchParams.has('signature'))return;
 event.respondWith((async()=>{
  const c=await caches.open(CACHE);const stamp=new Request(self.location.origin+'/__image_stamp?url='+encodeURIComponent(req.url));
  const [hit,time]=await Promise.all([c.match(req),c.match(stamp)]);
  if(hit&&time&&Date.now()-Number(await time.text())<TTL)return hit;
  try{const response=await fetch(req);if(response.ok||response.type==='opaque'){
   await c.put(req,response.clone());await c.put(stamp,new Response(String(Date.now())));
   const keys=await c.keys();for(const key of keys.slice(0,Math.max(0,keys.length-LIMIT*2)))await c.delete(key);
  }return response;}catch(error){if(hit)return hit;throw error;}
 })());
});