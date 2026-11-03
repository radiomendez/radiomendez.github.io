/* Radio Méndez 1.6.14 · Ondas decorativas + horario semanal, sin tocar la conexión de audio */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const audio=$('radio-audio');
 const spectrum=$('radio-spectrum');
 const wave=$('spectrum-wave');
 if(!audio||!spectrum||!wave)return;
 const fragment=document.createDocumentFragment();
 // Ondas decorativas: alturas diferentes. No se procesan ni interceptan los datos de SHOUTcast.
 for(let i=0;i<44;i++){
   const bar=document.createElement('i');bar.className='spectrum-bar';
   const distance=Math.abs(i-21.5)/21.5;
   const cap=Math.round(27+(1-distance*.55)*((i*17+31)%67));
   bar.style.setProperty('--max-h',cap+'%');
   bar.style.setProperty('--rest-h',Math.max(7,Math.round(cap*.17))+'%');
   bar.style.setProperty('--bar-speed',(0.42+((i*13)%29)/45).toFixed(2)+'s');
   bar.style.setProperty('--bar-delay',(-((i*23)%31)/30).toFixed(2)+'s');
   fragment.append(bar);
 }
 wave.append(fragment);
 const mini=$('radio-mini');
 let miniSpectrum=null;
 if(mini){
   miniSpectrum=mini.querySelector('.mini-wave');
   if(!miniSpectrum){
     miniSpectrum=document.createElement('span');miniSpectrum.className='mini-wave';miniSpectrum.setAttribute('aria-hidden','true');
     miniSpectrum.innerHTML='<i></i><i></i><i></i><i></i><i></i>';
     mini.querySelector('.radio-mini-controls')?.prepend(miniSpectrum);
   }
 }
 const updateWave=()=>{
   const playing=!audio.paused && !audio.ended && audio.readyState>=2;
   spectrum.classList.toggle('is-playing',playing);
   miniSpectrum?.classList.toggle('is-playing',playing);
 };
 ['playing','pause','ended','waiting','stalled','error'].forEach(event=>audio.addEventListener(event,updateWave));
 updateWave();
 const neon=$('spectrum-neon'),rgb=$('spectrum-rgb');
 function setTheme(theme){
   const useRGB=theme==='rgb';spectrum.dataset.theme=useRGB?'rgb':'neon';
   neon?.setAttribute('aria-pressed',String(!useRGB));
   rgb?.setAttribute('aria-pressed',String(useRGB));
   try{localStorage.setItem('radioMendezSpectrum',useRGB?'rgb':'neon')}catch(_){}
 }
 neon?.addEventListener('click',()=>setTheme('neon'));
 rgb?.addEventListener('click',()=>setTheme('rgb'));
 try{if(localStorage.getItem('radioMendezSpectrum')==='rgb')setTheme('rgb')}catch(_){}

 const fallback='./assets/icon-mendez-tv-radio-online-192-v1.5.5.png';
 const programs={
   morning:{name:'La mañana que te mueve',host:'Radio Méndez',start:9*60,end:12*60,img:'./assets/programa-la-manana-que-te-mueve-v1.6.5.png'},
   midday:{name:'El Vacilón del Mediodía',host:'Radio Méndez',start:12*60,end:14*60,img:'./assets/programa-el-vacilon-del-mediodia-v1.6.6.png'},
   afternoon:{name:'Tardes Tropicales',host:'Radio Méndez',start:14*60,end:17*60,img:fallback},
   villa:{name:'El Vacile de Villa',host:'Ángel Villa DJ · Villa Show',start:20*60,end:22*60,img:'./assets/programa-el-vacile-de-villa-v1.5.9.png'},
   weekend:{name:'Música Tropical Variada',host:'Radio Méndez',start:20*60,end:22*60,img:fallback}
 };
 const clock=new Intl.DateTimeFormat('en-US',{timeZone:'America/Guayaquil',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 const format=(minutes)=>String(Math.floor(minutes/60)).padStart(2,'0')+'h'+String(minutes%60).padStart(2,'0');
 const time=(p)=>format(p.start)+'–'+format(p.end);
 let lastState='';
 function updateSchedule(){
   const now=Object.fromEntries(clock.formatToParts(new Date()).map(part=>[part.type,part.value]));
   const dayStart=Date.UTC(Number(now.year),Number(now.month)-1,Number(now.day));
   const minutes=Number(now.hour)*60+Number(now.minute);
   const t=dayStart+minutes*60000;
   const all=[];
   for(let d=-2;d<=2;d++){
     const day=dayStart+d*86400000;
     const weekend=[0,6].includes(new Date(day).getUTCDay());
     const slots=[programs.morning,programs.midday,programs.afternoon,weekend?programs.weekend:programs.villa];
     slots.forEach(p=>all.push({...p,absoluteStart:day+p.start*60000,absoluteEnd:day+p.end*60000}));
   }
   all.sort((a,b)=>a.absoluteStart-b.absoluteStart);
   const current=all.find(p=>p.absoluteStart<=t && t<p.absoluteEnd);
   const previous=[...all].reverse().find(p=>p.absoluteEnd<=t);
   const next=all.find(p=>p.absoluteStart>t);
   const state=[current?.name,previous?.name,next?.name,now.day,now.hour,now.minute].join('|');
   if(state===lastState)return;lastState=state;
   const label=$('show-slot-label'),title=$('show-slot-title'),detail=$('show-slot-detail'),miniLabel=$('radio-mini-program');
   if(current){
     if(label)label.textContent='PROGRAMADO EN ESTE HORARIO';
     if(title)title.textContent=current.name;
     if(detail)detail.textContent=current.host+' · '+time(current);
     if(miniLabel)miniLabel.textContent=current.name+' · '+time(current);
   }else{
     if(label)label.textContent='PROGRAMACIÓN MUSICAL';
     if(title)title.textContent='Radio Méndez · La radio que te mueve';
     if(detail)detail.textContent='Música y mixes en la señal online';
     if(miniLabel)miniLabel.textContent='Radio Méndez · Programación musical';
   }
   // v1.6.14: carátula del espacio programado y resumen desplegable del mini reproductor.
   const picture=current?.img||fallback;
   for(const id of ['studio-current-art','radio-mini-art']){
     const img=$(id);
     if(img && img.getAttribute('src')!==picture)img.setAttribute('src',picture);
   }
   const miniCurrent=$('mini-current-title');
   const miniCurrentTime=$('mini-current-time');
   if(miniCurrent)miniCurrent.textContent=current?.name||'Radio Méndez · Música y mixes';
   if(miniCurrentTime)miniCurrentTime.textContent=current?time(current):'Programación musical';
   for(const [prefix,slot] of [['prev',previous],['next',next]]){
     const name=$('mini-'+prefix+'-title');
     const hours=$('mini-'+prefix+'-time');
     if(name)name.textContent=slot?.name||'Sin información';
     if(hours)hours.textContent=slot?time(slot):'—';
   }
   const show=(side,program)=>{
     const title=$('radio-'+side+'-title');const hours=$('radio-'+side+'-time');const img=$('radio-'+side+'-img');
     if(!program)return;
     if(title)title.textContent=program.name;
     if(hours)hours.textContent=time(program);
     if(img){img.src=program.img||fallback;img.alt='';}
   };
   show('prev',previous);show('next',next);
 }
 updateSchedule();setInterval(updateSchedule,30000);
})();
