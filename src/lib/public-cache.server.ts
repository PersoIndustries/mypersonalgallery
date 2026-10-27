// Optional edge cache: dev runtimes without Cache API simply read through.
type EdgeCache = { match: (key: Request) => Promise<Response | undefined>; put: (key: Request, response: Response) => Promise<void>; delete: (key: Request) => Promise<boolean> };
function cache() { return (globalThis as unknown as { caches?: { default?: EdgeCache } }).caches?.default; }
const request = () => new Request('https://museum-cache.internal/public-catalog-v2');
export async function cachedPublicCatalog<T>(read:()=>Promise<T>):Promise<T> {
 const c=cache();
 if(c){try{const hit=await c.match(request());if(hit)return await hit.json() as T;}catch{/* Cache failure must not interrupt browsing. */}}
 const data=await read();
 if(c){try{await c.put(request(),new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=120'}}));}catch{/* Best effort. */}}
 return data;
}
export async function clearPublicCatalogCache(){try{await cache()?.delete(request());}catch{/* Bounded TTL remains the fallback. */}}