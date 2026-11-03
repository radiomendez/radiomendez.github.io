/* Radio Méndez v1.6.7 — Interfaz, horarios y publicidad. No crea reproductores nuevos. */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const audio=$('radio-audio');

  // Un único HTMLAudioElement. Los botones flotantes llaman a controles ya existentes.
  const miniReconnect=$('radio-mini-reconnect');
  const miniShare=$('radio-mini-share');
  if(miniReconnect)miniReconnect.addEventListener('click',()=>{$('reconnect')?.click()});
  if(miniShare)miniShare.addEventListener('click',()=>{$('share')?.click()});

  function updateSignal(state){
    const indicator=$('radio-live-indicator');
    const mini=$('radio-mini-signal');
    const word={standby:'LISTA PARA ESCUCHAR',connecting:'CONECTANDO',playing:'EN VIVO',error:'SIN SEÑAL'}[state]||'LISTA PARA ESCUCHAR';
    if(indicator){indicator.dataset.state=state;indicator.innerHTML='<i class="radio-live-dot"></i> '+word}
    if(mini){mini.dataset.state=state;mini.textContent=state==='playing'?'AL AIRE':state==='connecting'?'CONECTANDO':state==='error'?'SIN SEÑAL':'LISTA'}
  }
  if(audio){
    audio.addEventListener('loadstart',()=>updateSignal('connecting'));
    audio.addEventListener('waiting',()=>updateSignal('connecting'));
    audio.addEventListener('playing',()=>updateSignal('playing'));
    audio.addEventListener('pause',()=>updateSignal('standby'));
    audio.addEventListener('error',()=>updateSignal('error'));
    audio.addEventListener('volumechange',()=>{
      const volume=Math.round(audio.volume*100);
      const value=audio.muted?0:volume;
      if($('volume-number'))$('volume-number').textContent=value+'%';
      if($('volume'))$('volume').value=String(value);
      if($('radio-mini-volume'))$('radio-mini-volume').value=String(value);
      if($('mute'))$('mute').setAttribute('aria-label',audio.muted?'Activar sonido':'Silenciar audio');
    });
  }

  // La programación, con espacios anterior y próximo, se gestiona en radio-visual.js.


  // Carrusel principal alternado cada 3 s; secundarios conservan auspiciantes cada 7 s.
  const validImage=/^(?:\.\/)?assets\/[A-Za-z0-9_./-]+\.(?:png|jpg|jpeg|webp|svg)$/i;
  function safeLink(raw){try{const url=new URL(String(raw));return ['https:','http:'].includes(url.protocol)?url.href:''}catch{return ''}}
  const sponsors=(Array.isArray(window.MENDEZ_AUSPICIANTES)?window.MENDEZ_AUSPICIANTES:[])
    .filter(item=>item && typeof item.logo==='string' && validImage.test(item.logo.trim()) && !item.logo.includes('..'))
    .map(item=>({type:'sponsor',name:String(item.nombre||'Auspiciante'),image:item.logo.trim(),url:safeLink(item.url)}));
  // Banners originales del usuario: 1920 × 250 PNG.
  const programs=[
   {type:'program-banner',name:"Méndez Despierta",schedule:"08h00–09h00",image:'./assets/programacion/01_Mendez_Despierta.png',url:'#programacion-radio'},
   {type:'program-banner',name:"La mañana que te mueve",schedule:"09h00–12h00",image:'./assets/programacion/02_La_Manana_Que_Te_Mueve.png',url:'#programacion-radio'},
   {type:'program-banner',name:"El Vacilón del Mediodía",schedule:"12h00–14h00",image:'./assets/programacion/03_El_Vacilon_Del_Mediodia.png',url:'#programacion-radio'},
   {type:'program-banner',name:"Tardes Tropicales",schedule:"14h00–17h00",image:'./assets/programacion/04_Tardes_Tropicales.png',url:'#programacion-radio'},
   {type:'program-banner',name:"A Todo Ritmo",schedule:"17h00–19h00",image:'./assets/programacion/05_A_Todo_Ritmo.png',url:'#programacion-radio'},
   {type:'program-banner',name:"Calentando Motores",schedule:"19h00–20h00",image:'./assets/programacion/06_Calentando_Motores.png',url:'#programacion-radio'},
   {type:'program-banner',name:"El Vacile de Villa",schedule:"20h00–22h00 · Lunes a viernes",image:'./assets/programacion/07_El_Vacile_De_Villa.png',url:'#programacion-radio'},
   {type:'program-banner',name:"Sábado de Vacilón",schedule:"20h00–22h00 · Sábados",image:'./assets/programacion/08_Sabado_De_Vacilon.png',url:'#programacion-radio'},
   {type:'program-banner',name:"Domingo de Clásicos",schedule:"20h00–22h00 · Domingos",image:'./assets/programacion/09_Domingo_De_Clasicos.png',url:'#programacion-radio'}
  ];
  // Mantener la alternancia Programa / Auspiciante en toda la secuencia.
  const mixed=[];
  for(let i=0;i<programs.length;i++){
    mixed.push(programs[i]);
    if(sponsors.length)mixed.push(sponsors[i%sponsors.length]);
  }
  const mounts=Array.from(document.querySelectorAll('[data-sponsor-carousel]'));
  mounts.forEach(mount=>{
    const home=mount.dataset.sponsorLocation==='inicio';
    const items=home?mixed:sponsors;
    if(!items.length){mount.hidden=true;return}
    const label=home?'PROGRAMACIÓN Y AUSPICIANTES':'AUSPICIANTES DE RADIO MÉNDEZ';
    if(mount.dataset.sponsorLocation!=='auspiciantes'&&!home){
      const header=document.createElement('div');header.className='sponsor-display-header';
      const title=document.createElement('strong');title.textContent=label;
      const link=document.createElement('a');link.href='#auspiciantes';link.textContent='Conocer auspiciantes ↗';
      header.append(title,link);mount.append(header);
    }
    const carousel=document.createElement('div');carousel.className='sponsor-carousel';
    carousel.setAttribute('aria-label',home?'Programas y auspiciantes, cambian automáticamente cada 3 segundos':'Auspiciantes, cambian automáticamente cada 7 segundos');
    const stage=document.createElement('div');stage.className='sponsor-stage';
    stage.setAttribute('aria-live','off');
    const bar=document.createElement('div');bar.className='sponsor-bar';
    const brand=document.createElement('strong');brand.className='sponsor-brand';
    const tools=document.createElement('div');tools.className='sponsor-tools';
    const prev=document.createElement('button');prev.type='button';prev.className='sponsor-arrow';prev.textContent='‹';prev.setAttribute('aria-label','Banner anterior');
    const next=document.createElement('button');next.type='button';next.className='sponsor-arrow';next.textContent='›';next.setAttribute('aria-label','Banner siguiente');
    const dots=document.createElement('div');dots.className='sponsor-dots';
    if(home&&items.length>12)dots.classList.add('sponsor-counter');
    let current=0,paused=false,downX=null;
    function render(animate=false){
      const item=items[current],url=item.url;
      const slide=document.createElement(url?'a':'div');
      slide.className='sponsor-slide is-'+item.type+(animate?' is-changing':'');
      if(url){slide.href=url;if(url.startsWith('http')){slide.target='_blank';slide.rel='noopener noreferrer';}}
      if(item.type==='program'){
        const copy=document.createElement('div');copy.className='program-promo-text';
        const tag=document.createElement('small');tag.textContent='PROGRAMA DE RADIO MÉNDEZ';
        const name=document.createElement('strong');name.textContent=item.name;
        const schedule=document.createElement('span');schedule.textContent=item.schedule;
        const info=document.createElement('em');info.textContent=item.info;
        copy.append(tag,name,schedule,info);slide.append(copy);
      }
      const img=document.createElement('img');img.src=item.image;img.alt=(item.type==='program-banner'||item.type==='program'?'Banner del programa ':'Banner publicitario de ')+item.name;
      img.width=1920;img.height=250;img.decoding='async';
      img.loading=home?'eager':'lazy';slide.append(img);
      stage.replaceChildren(slide);brand.textContent=(item.type==='program-banner'||item.type==='program'?'PROGRAMA · ':'AUSPICIANTE · ')+item.name;
      if(home&&items.length>12){dots.textContent=String(current+1).padStart(2,'0')+' / '+items.length;}
      else [...dots.children].forEach((dot,i)=>dot.setAttribute('aria-current',String(i===current)));
    }
    function go(i){current=(i+items.length)%items.length;render(true)}
    if(!(home&&items.length>12))items.forEach((item,i)=>{
      const dot=document.createElement('button');dot.type='button';dot.className='sponsor-dot';
      dot.setAttribute('aria-label','Ver '+item.name);dot.setAttribute('aria-current',String(i===0));
      dot.addEventListener('click',()=>go(i));dots.append(dot);
    });
    prev.addEventListener('click',()=>go(current-1));next.addEventListener('click',()=>go(current+1));
    tools.append(prev,dots,next);bar.append(brand,tools);carousel.append(stage,bar);mount.append(carousel);
    carousel.addEventListener('mouseenter',()=>paused=true);
    carousel.addEventListener('mouseleave',()=>paused=false);
    carousel.addEventListener('focusin',()=>paused=true);
    carousel.addEventListener('focusout',e=>{if(!carousel.contains(e.relatedTarget))paused=false});
    carousel.addEventListener('touchstart',e=>{downX=e.touches[0]?.clientX??null},{passive:true});
    carousel.addEventListener('touchend',e=>{if(downX===null)return;const dx=(e.changedTouches[0]?.clientX??downX)-downX;downX=null;if(Math.abs(dx)>38)go(current+(dx<0?1:-1))},{passive:true});
    render(false);
    if(items.length>1)setInterval(()=>{if(!paused&&!document.hidden)go(current+1)},home?3000:7000);
  });
})();
