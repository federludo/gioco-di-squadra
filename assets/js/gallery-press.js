/* Gallery & Press — archival rendering from one versioned data file. */
(function(){
 "use strict";
 const root=document.body.dataset.root||"../";
 const $=id=>document.getElementById(id);
 const tag=(name,cls,text)=>{const e=document.createElement(name);if(cls)e.className=cls;if(text!=null)e.textContent=String(text);return e};
 const asset=p=>root+p;
 const safeUrl=u=>typeof u==="string"&&/^https:\/\/[^\s"'<>]+$/i.test(u);
 const internal=p=>typeof p==="string"&&/^(?:assets|notizie|calendario|progetto|partenariato)\/[a-z0-9.\-_/]+$/i.test(p);
 let currentPhotos=[],currentIndex=0,currentEvent=null,lastFocused=null;
 const dialog=$("gp-lightbox"),photoImg=$("gp-lightbox-img"),photoCaption=$("gp-lightbox-caption"),counter=$("gp-lightbox-count");
 function imageAt(index){
  if(!currentPhotos.length)return;
  currentIndex=(index+currentPhotos.length)%currentPhotos.length;
  const p=currentPhotos[currentIndex];
  photoImg.src=asset(p.full);photoImg.alt=p.alt||"Fotografia archivio";
  photoCaption.textContent=(currentEvent?.title||"Galleria")+" · "+(p.alt||"");
  counter.textContent=(currentIndex+1)+" / "+currentPhotos.length;
 }
 function openLightbox(event,index){
  currentPhotos=event.photos||[];currentEvent=event;lastFocused=document.activeElement;
  if(!dialog||typeof dialog.showModal!=="function"){window.open(asset(currentPhotos[index].full),"_blank","noopener");return;}
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
  const max=8;let expanded=false;
  const fill=()=>{grid.replaceChildren();
   photos.slice(0,expanded?photos.length:max).forEach((item,i)=>{
    const b=tag("button","gp-photo-button");b.type="button";b.setAttribute("aria-label","Ingrandisci foto "+(i+1)+" di "+photos.length);
    const img=tag("img");img.src=asset(item.thumb);img.alt=item.alt||"";img.loading="lazy";img.decoding="async";
    img.addEventListener("error",()=>{b.disabled=true;b.textContent="Foto non ancora caricata";b.style.cursor="default";b.style.fontSize="12px";});
    b.append(img,tag("span","",String(i+1).padStart(2,"0")));b.addEventListener("click",()=>openLightbox(event,i));grid.append(b);
   });
  };
  fill();outer.append(head,grid);
  if(photos.length>max){
   const more=tag("button","gp-more","Mostra tutte le "+photos.length+" fotografie ↓");
   more.type="button";more.setAttribute("aria-expanded","false");
   more.addEventListener("click",()=>{expanded=!expanded;fill();more.textContent=expanded?"Mostra meno ↑":"Mostra tutte le "+photos.length+" fotografie ↓";more.setAttribute("aria-expanded",String(expanded));});
   outer.append(more);
  }
  outer.append(tag("p","gp-photo-note",event.photoCredits||"Fotografie dell'archivio di progetto."));
  return outer;
 }
 function eventCard(e){
  const article=tag("article","gp-event");article.id="gp-event-"+e.id;
  const head=tag("div","gp-event-intro"),main=tag("div"),meta=tag("div","gp-event-meta");
  meta.append(tag("span","",e.dateLabel),tag("span","",e.location));
  main.append(meta,tag("h3","",e.title));
  if(e.subtitle)main.append(tag("p","gp-eyebrow",e.subtitle));
  main.append(tag("p","gp-event-copy",e.description));
  const quick=tag("div","gp-event-shortcuts");
  if(e.relatedUrl&&internal(e.relatedUrl)){const a=tag("a","","Approfondisci l'evento ↗");a.href=asset(e.relatedUrl);quick.append(a);}
  if(e.pressReleases?.length){const a=tag("a","","Comunicati stampa ↘");a.href="#gp-comunicati";quick.append(a)}
  if(e.coverage?.length){const a=tag("a","","Rassegna stampa ↘");a.href="#gp-rassegna";quick.append(a)}
  main.append(quick);head.append(main);
  if(e.cover&&internal(e.cover)){
   const img=tag("img","gp-event-cover");
   img.src=asset(e.cover);img.alt="Fotografie dell'evento: "+e.title;img.loading="lazy";img.decoding="async";
   img.addEventListener("error",()=>{img.remove();head.style.gridTemplateColumns="1fr";});
   head.append(img);
  }
  article.append(head,gallery(e));
  return article;
 }
 function coverItems(items,territory){
  const host=$("gp-coverage");
  host.replaceChildren();
  const list=territory&&territory!=="Tutte"?items.filter(x=>x.territory===territory):items;
  for(const item of list){
   if(!safeUrl(item.url))continue;
   const a=tag("a","gp-coverage-link");a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";
   a.append(tag("small","",item.outlet+" · "+item.territory),tag("strong","",item.title),tag("span","","Leggi la notizia ↗"));
   host.append(a);
  }
  if(!host.children.length)host.append(tag("p","","Nessuna uscita segnalata per il filtro selezionato."));
  $("gp-coverage-current").textContent=list.length+" collegamenti";
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
   b.addEventListener("click",()=>{filter.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));coverItems(coverage,territory);});
   filter.append(b);
  });
  coverItems(coverage,"Tutte");
  const kpi=$("gp-kpis");kpi.replaceChildren();
  for(const step of data.strategy?.actions||[]){
   const box=tag("article","gp-kpi"),number=tag("span","gp-number","OBIETTIVO "+step.code);
   const list=tag("ul");
   for(const target of step.targets||[])list.append(tag("li","",target));
   box.append(number,tag("h3","",step.title),tag("p","",step.objective),list);kpi.append(box);
  }
  const progress=$("gp-progress");progress.replaceChildren();
  for(const row of data.strategy?.progress||[]){
   const card=tag("div","gp-progress-item");
   const head=tag("div","gp-progress-head");
   head.append(tag("small","",row.code),tag("strong","",row.activity),tag("span","gp-progress-status",row.status));
   const details=tag("div","gp-progress-details");
   const goal=tag("p");goal.append(tag("b","","Obiettivo: "),document.createTextNode(row.target));
   const evidence=tag("p");evidence.append(tag("b","","Evidenze: "),document.createTextNode(row.evidence));
   details.append(goal,evidence);card.append(head,details);progress.append(card);
  }
  $("gp-kpi-note").textContent=(data.strategy?.source||"")+" "+(data.strategy?.reachEstimate||"")+" I valori indicati sono obiettivi progettuali, non risultati misurati.";
  const team=$("gp-roles");team.replaceChildren();
  for(const x of data.team||[]){
   const box=tag("div","gp-role");
   box.append(tag("strong","",x.role),tag("p","",x.status));
   team.append(box);
  }
  $("gp-policy").textContent=data.editorialPolicy||"";
 }
 fetch(asset("content/gallery-press.json?v=20261104-v1"),{cache:"no-store"})
  .then(r=>{if(!r.ok)throw Error("Impossibile caricare archivio media: HTTP "+r.status);return r.json()})
  .then(render)
  .catch(err=>{console.error(err);$("gp-events").textContent="Archivio temporaneamente non disponibile. Riprova più tardi.";});
})();
