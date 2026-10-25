const root=document.body.dataset.root||'';const byId=id=>document.getElementById(id);async function data(name){try{const r=await fetch(root+'content/'+name+'.json'+((name==='events'||name==='organizations')?'?v=kickoff-20261026-v1':''));if(!r.ok)throw Error('HTTP '+r.status);return await r.json()}catch(e){console.error('Dati non disponibili:',name,e);return []}}const menu=byId('main-menu');if(menu&&!Array.from(menu.querySelectorAll('a')).some(a=>a.textContent.trim()==='Contatti')){const contactLink=document.createElement('a');contactLink.href=root+'contatti/';contactLink.textContent='Contatti';if(location.pathname.endsWith('/contatti/')||location.pathname.endsWith('/contatti')){contactLink.className='active';contactLink.setAttribute('aria-current','page')}menu.append(contactLink)}const nav=byId('menu-button');if(nav)nav.addEventListener('click',()=>{const n=byId('main-menu');const open=n.classList.toggle('open');nav.setAttribute('aria-expanded',String(open))});function el(tag,cls,txt){const x=document.createElement(tag);if(cls)x.className=cls;if(txt!=null)x.textContent=txt;return x}async function initPartners(){const grid=byId('partners-grid');if(!grid)return;const list=await data('partners');for(const x of list){const a=el('a','partner');a.href=root+'partner/?id='+encodeURIComponent(x.id);const wrap=el('span');wrap.append(el('strong','',x.name),el('small','',x.place));a.append(wrap,el('span','','→'));grid.append(a)}}async function initCalendar(){const target=byId('event-list');if(!target)return;let list=await data('events');const partnerId=new URLSearchParams(location.search).get('partner');let territory=byId('territory'),category=byId('category'),period=byId('period');function choices(select,values){[...new Set(values)].filter(Boolean).sort().forEach(v=>{let o=el('option','',v);o.value=v;select.append(o)})}if(partnerId){const note=byId("calendar-partner-notice");if(note){note.hidden=false;note.textContent="Attività collegate all'organizzazione selezionata. ";const reset=el("a","","Mostra tutta la programmazione →");reset.href="./";note.append(reset);} }choices(territory,list.map(x=>x.territory));choices(category,list.map(x=>x.category));function render(){target.replaceChildren();const matches=list.filter(x=>(!territory.value||x.territory===territory.value)&&(!category.value||x.category===category.value)&&(!period.value||(x.date&&x.date.startsWith(period.value)))&&(!partnerId||x.organizerId===partnerId));if(!matches.length)target.append(el('p','','Nessuna attività corrisponde ai filtri selezionati.'));for(const x of matches){let row=el('article','event-item');row.append(el('div','event-date',x.date?new Date(x.date+'T12:00:00').toLocaleDateString('it-IT',{day:'2-digit',month:'short'}):'IN AGGIORNAMENTO'));let meta=el('div');meta.append(el('h3','',x.name),el('p','', '⌖ '+x.territory),el('p','','♟ '+x.organizer),el('p','','◇ '+x.category));let link=el('a','','Scopri l’attività ↗');link.href=root+'evento/?id='+encodeURIComponent(x.id);row.append(meta,link);target.append(row)}}const months=[...new Set(list.filter(x=>x.date).map(x=>x.date.slice(0,7)))];choices(period,months);territory.addEventListener('change',render);category.addEventListener('change',render);period.addEventListener('change',render);render();const tabs=document.querySelectorAll('[data-view]');const panels=document.querySelectorAll('[data-panel]');tabs.forEach(b=>b.addEventListener('click',()=>{tabs.forEach(t=>t.classList.toggle('selected',t===b));panels.forEach(p=>p.hidden=p.dataset.panel!==b.dataset.view);if(b.dataset.view==='month')renderMonth(list.filter(x=>!partnerId||x.organizerId===partnerId))}));}function renderMonth(list){const box=byId('month-grid');if(!box)return;box.replaceChildren();const now=new Date();let month=new Date(now.getFullYear(),now.getMonth(),1);byId('month-label').textContent=month.toLocaleDateString('it-IT',{month:'long',year:'numeric'});['L','M','M','G','V','S','D'].forEach(n=>box.append(el('span','',n)));let offset=(month.getDay()+6)%7;for(let i=0;i<offset;i++)box.append(el('span'));let days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();for(let d=1;d<=days;d++){const date=month.getFullYear()+'-'+String(month.getMonth()+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');const ev=list.filter(e=>e.date===date).map(e=>e.name).join(' · ');box.append(el('span','',String(d)+(ev?' · '+ev:'')))}}async function initDetail(){const box=byId('detail');if(!box)return;const kind=document.body.dataset.kind;const list=await data(kind==='event'?'events':'partners');const item=list.find(x=>x.id===new URLSearchParams(location.search).get('id'));if(!item){box.append(el('p','','Scheda non disponibile.'));return;}document.title=(item.name||'')+' | Gioco di Squadra';if(kind!=='event'){box.append(el('p','eyebrow','Partner'),el('h1','large-title',item.name),el('p','',item.place||item.territory||''),el('p','','Informazioni in fase di aggiornamento.'));return;}const all=await data('organizations');const organizer=all.find(o=>o.id===item.organizerId);const extra=(item.partnerIds||[]).filter(id=>id!==item.organizerId).map(id=>all.find(o=>o.id===id)).filter(Boolean);
box.classList.add('gcal-activity-profile');box.append(el('p','eyebrow',(item.programStatus?.startsWith('Aggiornamento proposto')?'Attività in definizione':'Attività in programma')+' · '+item.category),el('h1','large-title',item.name));
const lead=el('p','gcal-activity-lead',item.description||'Attività della rete Gioco di Squadra.');box.append(lead);
const grid=el('div','gcal-activity-fields');
function field(label,value){const d=el('div');d.append(el('small','',label),el('strong','',value));grid.append(d)}
field('Periodo previsto',item.periodLabel||'Programmazione in fase di aggiornamento');
field('Territorio',item.territory||'In aggiornamento');
field('Organizzazione',organizer?.name||item.organizerId||'In aggiornamento');
field('Tipologia',item.category||'Attività');
box.append(grid);
if(item.cadence){const sec=el('p','gcal-activity-description',item.cadence);box.append(sec);}
if(extra.length){const partners=el('p','gcal-activity-description','In collaborazione con: '+extra.map(o=>o.name).join(', ')+'.');box.append(partners);}
const note=el('p','gcal-activity-caution',item.programStatus||'Programmazione in fase di aggiornamento.');box.append(note);
const links=el('div','gcal-activity-links');if(organizer){const a=el('a','under','Scheda del partner organizzatore ↗');a.href=root+'partner/'+encodeURIComponent(organizer.id)+'/';links.append(a)}if(item.focusPage&&/^(?:attivita|notizie)\/[a-z0-9-]+\/$/.test(item.focusPage.href)){const more=el('a','under',item.focusPage.label||'Approfondisci il percorso ↗');more.href=root+item.focusPage.href;links.append(more);}const cal=el('a','under','Tutte le attività del calendario ↗');cal.href=root+'calendario/';links.append(cal);box.append(links);
}async function initHome(){const box=byId('home-events');if(!box)return;const list=await data('events');list.slice(0,2).forEach(x=>{const row=el('div','list-row');const a=el('a','',x.name+' →');a.href='evento/?id='+encodeURIComponent(x.id);row.append(el('strong','',x.name),el('small','',x.territory+' · In aggiornamento'),a);box.append(row)})}initHome();initPartners();if(!document.body.hasAttribute("data-calendar-modern"))initCalendar();initDetail();
/* Institutional funding acknowledgement shown across all public pages. */
(function(){
 const foot=document.querySelector('footer.footer');
 if(!foot||foot.querySelector('.gds-funding'))return;
 const base=document.body.dataset.root||'';
 const panel=document.createElement('div');panel.className='gds-funding wrap';
 panel.innerHTML='<div class="gds-funding__logos"><img src="'+base+'assets/images/institutions/regione-toscana.webp" alt="Regione Toscana" width="110" height="184" loading="lazy"><img src="'+base+'assets/images/institutions/ministero-lavoro.webp" alt="Ministero del Lavoro e delle Politiche Sociali" width="205" height="170" loading="lazy"></div><div class="gds-funding__text"><strong>Gioco di Squadra · Progetto finanziato</strong><p>Contributo concesso dalla Regione Toscana nell’ambito dell’Avviso pubblico sociale 2026, finanziato con risorse del Ministero del Lavoro e delle Politiche Sociali, ai sensi dell’art. 72 del D.lgs. 117/2017 e del D.M. 124/2025.</p><small>Decreto dirigenziale Regione Toscana n. 22267 del 01/10/2026 · <a href="'+base+'notizie/progetto-finanziato/">Dettagli sul finanziamento ↗</a></small></div>';
 foot.appendChild(panel);
})();

/* Global Cloudflare visit counter: one visit per browser session across
   every page; display the total only in the upper part of the homepage. */
(function(){
 const headerNav=document.querySelector('.site-head .nav');
 const isHome=!!document.querySelector('.gds-home .gds-hero');
 let badge=null, count=null;
 if(isHome&&headerNav&&!headerNav.querySelector('.gds-access-counter')){
  badge=document.createElement('div');
  badge.className='gds-access-counter';
  badge.title='Sessioni del browser conteggiate dall’attivazione, non visitatori unici.';
  badge.hidden=true;
  const value=document.createElement('span');
  value.className='gds-access-counter__value';
  count=document.createElement('strong');
  count.className='gds-access-counter__count';
  count.textContent='—';
  const dot=document.createElement('i');
  dot.className='gds-access-counter__dot';
  dot.setAttribute('aria-hidden','true');
  value.append(count,dot);
  const label=document.createElement('span');
  label.className='gds-access-counter__label';
  label.textContent='visite';
  badge.append(value,label);
  headerNav.append(badge);
 }
 const storageKey='giocodisquadra-visit-counted-v1';
 let alreadyCounted=false;
 try{alreadyCounted=sessionStorage.getItem(storageKey)==='1';}catch(_){}
 fetch('/api/visits',{
  method:alreadyCounted?'GET':'POST',
  headers:{Accept:'application/json'},
  cache:'no-store'
 }).then(function(response){
  if(!response.ok)throw Error('Contatore non disponibile');
  return response.json();
 }).then(function(data){
  if(!data||!Number.isSafeInteger(data.count)||data.count<0)return;
  if(!alreadyCounted){try{sessionStorage.setItem(storageKey,'1');}catch(_){}}
  if(badge && count){
   count.textContent=new Intl.NumberFormat('it-IT').format(data.count);
   badge.hidden=false;
  }
 }).catch(function(){
  // Failure of the counter never interferes with site navigation.
 });
})();
