/* Méndez TV & Radio Online / Radio Méndez · v1.6.13 */
const CACHE='radio-mendez-v1.6.13-blanco-azul-footer-20261102-stream8474';
const CORE=['./','./index.html','./config.js','./top10.js','./videos.js','./auspiciantes.js','./donaciones.js','./noticias.js','./mejoras.js','./radio-visual.js','./radio-visual.css','./tema-blanco-azul.css','./assets/logo-mendez-tv-radio-online-v1.5.5.png','./assets/banner-nosotros-mendez-tv-v1.6.10.png','./assets/icon-mendez-tv-radio-online-192-v1.5.5.png','./assets/icon-mendez-tv-radio-online-512-v1.5.5.png','./assets/vista-previa-mendez-tv-radio-online-v1.5.5.jpg','./assets/programa-el-vacile-de-villa-v1.5.9.png','./assets/programa-la-manana-que-te-mueve-v1.6.5.png','./assets/programa-el-vacilon-del-mediodia-v1.6.6.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(CORE.map(path=>cache.add(path)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>(key.startsWith('mendez-tv-radio-') || key.startsWith('radio-mendez-')) && key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 event.respondWith(fetch(req).then(response=>{
   if(response.ok && response.type==='basic'){
     const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{}));
   }
   return response;
 }).catch(()=>caches.match(req)));
});
