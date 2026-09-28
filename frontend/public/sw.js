const CACHE='fahiz-hub-v1';
const SHELL=['/','/projects','/resume','/manifest.webmanifest','/icon.svg'];
self.addEventListener('install',(event)=>event.waitUntil(caches.open(CACHE).then((cache)=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',(event)=>event.waitUntil(caches.keys().then((keys)=>Promise.all(keys.filter((key)=>key!==CACHE).map((key)=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',(event)=>{
  const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==location.origin)return;
  const publicApi=['/api/projects','/api/content/profile','/api/content/education','/api/content/experience','/api/content/skills','/api/uploads/cv'];
  if(url.pathname.startsWith('/api/')&&!publicApi.some((path)=>url.pathname.startsWith(path)))return;
  event.respondWith(fetch(request).then((response)=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then((cache)=>cache.put(request,copy));}return response;}).catch(()=>caches.match(request).then((cached)=>cached||(url.pathname.startsWith('/api/')?new Response(JSON.stringify({success:false,message:'This content is not available offline yet.'}),{status:503,headers:{'Content-Type':'application/json'}}):caches.match('/')))));
});
