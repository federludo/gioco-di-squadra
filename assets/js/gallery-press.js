/* Gallery & Press — archival rendering from one versioned data file. */
(function(){
 "use strict";
 const root=document.body.dataset.root||"../";
 const $=id=>document.getElementById(id);
 const tag=(name,cls,text)=>{const e=document.createElement(name);if(cls)e.className=cls;if(text!=null)e.textContent=String(text);return e};
 const asset=p=>root+p;
 const mediaAsset=p=>asset(p)+(p.includes("?")?"&":"?")+"v=gallery-redesign-20261104-v1";
 const safeUrl=u=>typeof u==="string"&&/^https:\/\/[^\s"'<>]+$/i.test(u);
 const internal=p=>typeof p==="string"&&/^(?:assets|notizie|calendario|progetto|partenariato)\/[a-z0-9.\-_/]+$/i.test(p);
 let currentPhotos=[],currentIndex=0,currentEvent=null,lastFocused=null;
 const dialog=$("gp-lightbox"),photoImg=$("gp-lightbox-img"),photoCaption=$("gp-lightbox-caption"),counter=$("gp-lightbox-count");
 function imageAt(index){
  if(!currentPhotos.length)return;
  currentIndex=(index+currentPhotos.length)%currentPhotos.length;
  const p=currentPhotos[currentIndex];
  photoImg.src=mediaAsset(p.full);photoImg.alt=p.alt||"Fotografia archivio";
  photoCaption.textContent=(currentEvent?.title||"Galleria")+" · "+(p.alt||"");
  counter.textContent=(currentIndex+1)+" / "+currentPhotos.length;
 }
 function openLightbox(event,index){
  currentPhotos=event.photos||[];currentEvent=event;lastFocused=document.activeElement;
  if(!dialog||typeof dialog.showModal!=="function"){window.open(mediaAsset(currentPhotos[index].full),"_blank","noopener");return;}
  imageAt(index);dialog.showModal();
 }
 if(dialog){
  $("gp-lightbox-close")?.addEventListener("click",()=>dialog.close());
  $("gp-lightbox-prev")?.addEventListener("click",()=>imageAt(currentIndex-1));
  $("gp-lightbox-next")?.addEventListener("click",()=>imageAt(currentIndex+1));
  dialog.addEventListener("close",()=>{photoImg.removeAttribute("src");lastFocused?.focus?.();});
  dialog.addEventListener("keydown",e=>{
   if(e.key==="ArrowLeft"){e.preventDefault();imageAt(currentIndex-1)}
   if(e.key==="ArrowRight"){e.preventDefault();imageAt(currentIndex+1)}
  });
 }
 function resource(r){
  const card=tag("article","gp-resource");
  card.append(tag("span","gp-format",r.format||"DOCUMENTO"),tag("strong","",r.title));
  if(r.format==="WEBP"&&internal(r.url)){
   card.classList.add("gp-resource--photo");
   const photo=tag("img","gp-resource-preview");photo.src=mediaAsset(r.url);photo.alt="Anteprima: "+r.title;photo.loading="lazy";photo.decoding="async";
   photo.addEventListener("error",()=>photo.remove());
   card.prepend(photo);
  }
  if(r.description)card.append(tag("p","",r.description));
  const link=tag("a","",r.format==="DOCX"?"Scarica comunicato ↘":"Scarica il materiale ↘");
  if(internal(r.url)){link.href=asset(r.url);link.setAttribute("download","");}
  card.append(link);return card;
 }
 function gallery(event){
  const photos=event.photos||[],outer=tag("div","gp-gallery");
  const head=tag("div","gp-gallery-head");
  head.append(tag("h4","","Galleria fotografica"),tag("small","",photos.length+" immagini"));
  const grid=tag("div","gp-photo-grid");grid.setAttribute("aria-label","Fotografie: "+event.title);
  const max=8,entries=[];let expanded=false;
  photos.forEach((item,i)=>{
   const b=tag("button","gp-photo-button");b.type="button";b.setAttribute("aria-label","Ingrandisci foto "+(i+1)+" di "+photos.length);
   b.hidden=i>=max;
   const img=tag("img");img.alt="";img.loading=i<max?"eager":"lazy";img.decoding="async";
   if(i<2)img.setAttribute("fetchpriority","high");
   const number=tag("span","gp-photo-number",String(i+1).padStart(2,"0"));
   let stage=0,started=false;
   // Register listeners before setting src: the browser may resolve cached images immediately.
   img.addEventListener("load",()=>{b.classList.add("is-loaded");b.classList.remove("is-unavailable");});
   img.addEventListener("error",()=>{
    if(stage===0 && item.full && item.full!==item.thumb){
     // A thumbnail may have failed while Pages/CDN was updating: use its full counterpart.
     stage=1;img.src=mediaAsset(item.full);return;
    }
    b.classList.add("is-unavailable");
    img.remove();
    const note=tag("span","gp-photo-retry","Apri per riprovare ↗");b.append(note);
   });
   const start=()=>{
    if(started)return;started=true;
    img.src=mediaAsset(item.thumb||item.full);
   };
   b.append(img,number);
   b.addEventListener("click",()=>openLightbox(event,i));
   grid.append(b);entries.push({button:b,start});
   if(i<max)start();
  });
  outer.append(head,grid);
  if(photos.length>max){
   const more=tag("button","gp-more gp-photo-more","Mostra tutte le "+photos.length+" fotografie ↓");
   more.type="button";more.setAttribute("aria-expanded","false");
   more.addEventListener("click",()=>{
    expanded=!expanded;
    entries.forEach((entry,i)=>{entry.button.hidden=!expanded&&i>=max;if(expanded)entry.start();});
    more.textContent=expanded?"Mostra solo le prime "+max+" fotografie ↑":"Mostra tutte le "+photos.length+" fotografie ↓";
    more.setAttribute("aria-expanded",String(expanded));
   });
   outer.append(more);
  }
  outer.append(tag("p","gp-photo-note",event.photoCredits||"Fotografie dell'archivio di progetto."));
  return outer;
 }
 function eventCard(e){
  const article=tag("article","gp-event");article.id="gp-event-"+e.id;
  const serial=tag("span","gp-event-serial","DOCUMENTAZIONE / "+e.date.slice(0,4));article.append(serial);
  const head=tag("div","gp-event-intro"),main=tag("div"),meta=tag("div","gp-event-meta");
  meta.append(tag("span","",e.dateLabel),tag("span","",e.location));
  main.append(meta,tag("h3","",e.title));
  if(e.subtitle)main.prepend(tag("p","gp-eyebrow",e.subtitle));
  main.append(tag("p","gp-event-copy",e.description));
  const quick=tag("div","gp-event-shortcuts");
  if(e.relatedUrl&&internal(e.relatedUrl)){const a=tag("a","","Approfondisci l'evento ↗");a.href=asset(e.relatedUrl);quick.append(a);}
  if(e.pressReleases?.length){const a=tag("a","","Comunicati stampa ↘");a.href="#gp-comunicati";quick.append(a)}
  if(e.coverage?.length){const a=tag("a","","Rassegna stampa ↘");a.href="#gp-rassegna";quick.append(a)}
  main.append(quick);head.append(main);
  if(e.cover&&internal(e.cover)){
   const img=tag("img","gp-event-cover");
   img.alt="Fotografie dell'evento: "+e.title;img.loading="lazy";img.decoding="async";
   let coverFallback=false;
   img.addEventListener("error",()=>{
    if(!coverFallback&&e.photos?.length&&e.photos[0].full!==e.cover){coverFallback=true;img.src=mediaAsset(e.photos[0].full);return;}
    img.remove();head.classList.add("gp-event-intro--no-image");
   });
   img.src=mediaAsset(e.cover);
   head.append(img);
  }
  article.append(head,gallery(e));
  return article;
 }
 let coverageExpanded=false,activeCoverage="Tutte";
 function coverItems(items,territory){
  const host=$("gp-coverage");host.replaceChildren();activeCoverage=territory||"Tutte";
  const list=activeCoverage==="Tutte"?items:items.filter(x=>x.territory===activeCoverage);
  const shown=coverageExpanded?list:list.slice(0,8);
  shown.forEach((item,i)=>{
   if(!safeUrl(item.url))return;
   const a=tag("a","gp-coverage-link");a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";
   const number=tag("span","gp-press-index",String(i+1).padStart(2,"0"));
   const inner=tag("span","gp-coverage-copy");
   inner.append(tag("small","",item.outlet+" · "+item.territory),tag("strong","",item.title));
   a.append(number,inner,tag("span","gp-coverage-arrow","↗"));host.append(a);
  });
  if(!host.children.length)host.append(tag("p","","Nessuna uscita segnalata per il filtro selezionato."));
  const visible=Math.min(shown.length,list.length);
  $("gp-coverage-current").textContent=visible+" di "+list.length+" collegamenti";
  const more=$("gp-coverage-more");
  if(more){
   more.hidden=list.length<=8;
   more.textContent=coverageExpanded?"Riduci la rassegna ↑":"Mostra tutte le "+list.length+" uscite stampa ↓";
   more.setAttribute("aria-expanded",String(coverageExpanded));
  }
 }
 function render(data){
  const events=data.events||[],photoCount=events.reduce((n,x)=>n+(x.photos?.length||0),0),coverage=events.flatMap(x=>x.coverage||[]),releases=events.flatMap(x=>x.pressReleases||[]);
  $("gp-stat-events").textContent=events.length;
  $("gp-stat-photos").textContent=photoCount;
  $("gp-stat-releases").textContent=releases.length;
  $("gp-stat-coverage").textContent=coverage.length;
  const eventsHost=$("gp-events");eventsHost.replaceChildren();
  events.forEach(e=>eventsHost.append(eventCard(e)));
  const lead=$("gp-lead");lead.textContent=data.lead||"";
  const kit=$("gp-kit");kit.replaceChildren();(data.pressKit||[]).forEach(r=>kit.append(resource(r)));
  const releasesHost=$("gp-releases");releasesHost.replaceChildren();
  releases.forEach(x=>releasesHost.append(resource(x)));
  const filter=$("gp-coverage-filter");filter.replaceChildren();
  const groups=["Tutte",...new Set(coverage.map(x=>x.territory))];
  groups.forEach((territory,i)=>{
   const b=tag("button","gp-filter",territory);b.type="button";b.setAttribute("aria-pressed",String(i===0));
   b.addEventListener("click",()=>{coverageExpanded=false;filter.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));coverItems(coverage,territory);});
   filter.append(b);
  });
  coverItems(coverage,"Tutte");
  $("gp-coverage-more")?.addEventListener("click",()=>{coverageExpanded=!coverageExpanded;coverItems(coverage,activeCoverage);revealWhenVisible();});
  const kpi=$("gp-kpis");kpi.replaceChildren();
  for(const step of data.strategy?.actions||[]){
   const box=tag("article","gp-kpi"),number=tag("span","gp-number",step.code);
   const list=tag("ul");
   for(const target of step.targets||[])list.append(tag("li","",target));
   box.append(number,tag("h3","",step.title),tag("p","",step.objective),list);kpi.append(box);
  }
  const progress=$("gp-progress");progress.replaceChildren();
  for(const row of data.strategy?.progress||[]){
   const card=tag("details","gp-progress-item");
   const head=tag("summary","gp-progress-head");
   head.append(tag("small","",row.code),tag("strong","",row.activity),tag("span","gp-progress-status",row.status));
   const details=tag("div","gp-progress-details");
   const goal=tag("p");goal.append(tag("b","","Obiettivo: "),document.createTextNode(row.target));
   const evidence=tag("p");evidence.append(tag("b","","Evidenze: "),document.createTextNode(row.evidence));
   details.append(goal,evidence);card.append(head,details);progress.append(card);
   if(row.code==="04")card.open=true;
  }
  $("gp-kpi-note").textContent=(data.strategy?.source||"")+" "+(data.strategy?.reachEstimate||"")+" I valori indicati sono obiettivi progettuali, non risultati misurati.";
  const team=$("gp-roles");team.replaceChildren();
  for(const x of data.team||[]){
   const box=tag("div","gp-role");
   box.append(tag("strong","",x.role),tag("p","",x.status));
   team.append(box);
  }
  $("gp-policy").textContent=data.editorialPolicy||"";
  revealWhenVisible();
 }
 function revealWhenVisible(){
  if(!("IntersectionObserver" in window)||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const observer=new IntersectionObserver((items,obs)=>{
   items.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("gp-visible");obs.unobserve(entry.target);}});
  },{threshold:.08,rootMargin:"0px 0px -35px 0px"});
  document.querySelectorAll(".gp-event,.gp-resource,.gp-coverage-link,.gp-kpi,.gp-progress-item").forEach(el=>{
   if(el.classList.contains("gp-visible")||el.classList.contains("gp-reveal"))return;
   // Never hide content already on-screen; animation must remain progressive enhancement.
   if(el.getBoundingClientRect().top<window.innerHeight*.9)return;
   el.classList.add("gp-reveal");observer.observe(el);
  });
 }
 fetch(asset("content/gallery-press.json?v=gallery-redesign-20261104-v1"),{cache:"no-store"})
  .then(r=>{if(!r.ok)throw Error("Impossibile caricare archivio media: HTTP "+r.status);return r.json()})
  .then(render)
  .catch(err=>{console.error(err);$("gp-events").textContent="Archivio temporaneamente non disponibile. Riprova più tardi.";});
})();
