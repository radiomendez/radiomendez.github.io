/* Radio Méndez 1.6.14: controles de presentación. NO crea otro audio. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const setExpanded=(button, panel, value)=>{
   if(!button||!panel)return;
   panel.hidden=!value;
   button.setAttribute('aria-expanded',String(value));
 };
 const mainToggle=$('studio-schedule-toggle');
 const mainPanel=$('studio-schedule-panel');
 const miniToggle=$('radio-mini-schedule-toggle');
 const miniPanel=$('radio-mini-drawer');
 mainToggle?.addEventListener('click',()=>setExpanded(mainToggle,mainPanel,mainPanel.hidden));
 miniToggle?.addEventListener('click',()=>setExpanded(miniToggle,miniPanel,miniPanel.hidden));
 $('studio-share')?.addEventListener('click',()=>$('share')?.click());
 $('studio-expand')?.addEventListener('click',()=>{
   const target=$('studio-player');
   if(!target)return;
   if(document.fullscreenElement){document.exitFullscreen?.().catch(()=>{});return;}
   if(target.requestFullscreen){target.requestFullscreen().catch(()=>target.scrollIntoView({behavior:'smooth',block:'start'}));}
   else target.scrollIntoView({behavior:'smooth',block:'start'});
 });
 const miniArt=$('radio-mini-art');
 const currentArt=$('studio-current-art');
 const fallback='./assets/icon-mendez-tv-radio-online-192-v1.5.5.png';
 if(currentArt) currentArt.addEventListener('error',()=>{if(!currentArt.src.endsWith(fallback.replace('./',''))) currentArt.src=fallback});
 if(miniArt) miniArt.addEventListener('error',()=>{if(!miniArt.src.endsWith(fallback.replace('./',''))) miniArt.src=fallback});
})();
