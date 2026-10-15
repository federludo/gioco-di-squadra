
(function(){
"use strict";
const root=document.body.dataset.root||"../";
const $=id=>document.getElementById(id);
const anchor=(id)=>root+"evento/?id="+encodeURIComponent(id);
const orgUrl=id=>root+"partner/"+encodeURIComponent(id)+"/";
const monthKeys=Array.from({length:15},(_,i)=>{const d=new Date(2026,9+i,1);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")});
const shortMonth=k=>new Date(Number(k.slice(0,4)),Number(k.slice(5))-1,1).toLocaleDateString("it-IT",{month:"short",year:"numeric"});
const longMonth=k=>new Date(Number(k.slice(0,4)),Number(k.slice(5))-1,1).toLocaleDateString("it-IT",{month:"long",year:"numeric"});
const E=(tag,cls,content)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(content!=null)el.textContent=content;return el};
const current=new Date(),currentMonth=current.getFullYear()+"-"+String(current.getMonth()+1).padStart(2,"0");
let selected=monthKeys.includes(currentMonth)?currentMonth:"2026-10",view="list",map=null,mapMarkers=[],organizations=[],events=[];
let activePartner=new URLSearchParams(location.search).get("partner")||"";
let monthFilter="",organizationFilter="",territoryFilter="",categoryFilter="";
let mapReady=false;
const orgById=id=>organizations.find(o=>o.id===id);
function mLabel(item){if(item.windows?.length>1)return item.periodLabel||"";const w=item.windows?.[0];return w?(w.start===w.end?longMonth(w.start):longMonth(w.start)+" – "+longMonth(w.end)):(item.periodLabel||"Programmazione in fase di aggiornamento")}
function opt(select,values){[...new Set(values)].filter(Boolean).sort((a,b)=>a.localeCompare(b,"it")).forEach(s=>{const o=E("option","",s);o.value=s;select.append(o)})}
const includeMonth=(x,m)=>!m||!!x.months?.includes(m);
function filtered(){return events.filter(x=>includeMonth(x,monthFilter)&&(!territoryFilter||x.territory===territoryFilter)&&(!categoryFilter||x.category===categoryFilter)&&(!organizationFilter||x.partnerIds?.includes(organizationFilter))&&(!activePartner||x.partnerIds?.includes(activePartner))).sort((a,b)=>a.startMonth.localeCompare(b.startMonth)||a.name.localeCompare(b.name,"it"))}
function getMonths(x){return x.months?.length||0}
function getSummary(){const list=filtered();$("calendar-count").textContent=list.length+" attività nel programma";return list}
function makeEvent(x){const item=E("article","gcal-event");const period=E("div","gcal-event-period");const first=x.months?.[0]||"2026-10";period.append(E("strong","",shortMonth(first)));if(getMonths(x)>1)period.append(E("small","",getMonths(x)+" mesi nel programma"));else period.append(E("small","","Finestra mensile"));
const body=E("div");const title=E("h3");const ta=E("a","",x.name);ta.href=anchor(x.id);title.append(ta);body.append(title);
const meta=E("div","gcal-meta");const org=orgById(x.organizerId);
meta.append(E("span","","◷ "+mLabel(x)),E("span","","⌖ "+x.territory),E("span","","♟ "+(org?.name||x.organizerId)),E("span","","◇ "+x.category));
body.append(meta,E("p","",x.description||""));
const actions=E("div","gcal-event-actions");const ev=E("a","","Scheda attività ↗");ev.href=anchor(x.id);actions.append(ev);if(org){const p=E("a","","Organizzatore ↗");p.href=orgUrl(org.id);actions.append(p)}body.append(actions);item.append(period,body);return item}
function renderList(list){const target=$("event-list");target.replaceChildren();if(!list.length){target.append(E("p","gcal-zero","Nessuna attività corrisponde ai filtri selezionati."));return;}list.forEach(e=>target.append(makeEvent(e)))}
function selectMonth(k){if(!monthKeys.includes(k))return;selected=k;$("month-label").textContent=longMonth(k);$("month-prev").disabled=k===monthKeys[0];$("month-next").disabled=k===monthKeys.at(-1);const tabs=$("month-nav");tabs.replaceChildren();monthKeys.forEach(m=>{const b=E("button","",shortMonth(m));b.type="button";if(m===k)b.setAttribute("aria-current","date");const count=filtered().filter(x=>x.months.includes(m)).length;b.append(E("span","",count+" attività"));b.addEventListener("click",()=>selectMonth(m));tabs.append(b);});const entries=filtered().filter(x=>includeMonth(x,k)),container=$("month-grid");container.replaceChildren();if(!entries.length){container.append(E("p","gcal-zero","Non risultano attività programmate per questo mese e per i filtri selezionati."));return;}
entries.forEach(x=>{const c=E("article","gcal-month-card");c.append(E("span","eyebrow",x.category),E("h3","",x.name),E("p","",(orgById(x.organizerId)?.name||"")+" · "+x.territory),E("p","",x.cadence||"Programmazione in fase di aggiornamento"));const a=E("a","","Dettagli attività ↗");a.href=anchor(x.id);c.append(a);container.append(c)})}
function mapList(data){const container=$("calendar-map-list");container.replaceChildren();const groups=new Map();data.forEach(x=>{const id=x.organizerId;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(x)});
[...groups].sort((a,b)=>(orgById(a[0])?.city||"").localeCompare(orgById(b[0])?.city||"","it")).forEach(([id,items])=>{const org=orgById(id),group=E("article","gcal-map-group");group.append(E("strong","",org?.city||items[0].territory),E("p","",(org?.name||id)+" · "+items.length+" attività"));items.forEach(x=>{const a=E("a","",x.name+" ↗");a.href=anchor(x.id);group.append(a)});container.append(group);});
if(!groups.size)container.append(E("p","gcal-zero","Nessun luogo corrisponde ai filtri selezionati."));}
function initMap(){if(mapReady)return;const panel=$("calendar-map");mapReady=true;const probe=E("span","leaflet-pane");panel.append(probe);const stylesReady=window.getComputedStyle(probe).position==="absolute";probe.remove();
if(!window.L||!stylesReady){panel.append(E("p","gcal-map-fallback","Mappa non disponibile. L’elenco dei territori e delle attività resta consultabile a destra."));return;}
map=L.map(panel,{scrollWheelZoom:false,zoomControl:true}).setView([43.35,11.05],8);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors",maxZoom:18}).addTo(map);
}
function mapRender(list){mapList(list);initMap();if(!map)return;mapMarkers.forEach(m=>map.removeLayer(m));mapMarkers=[];const groups=new Map();list.forEach(e=>{if(!groups.has(e.organizerId))groups.set(e.organizerId,[]);groups.get(e.organizerId).push(e)});
const bounds=[];for(const [id,items] of groups){const o=orgById(id);if(!Array.isArray(o?.coordinates)||o.coordinates.length!==2)continue;const [lat,lng]=o.coordinates.map(Number);if(!Number.isFinite(lat)||!Number.isFinite(lng))continue;bounds.push([lat,lng]);const icon=L.divIcon({className:"gcal-marker",html:"<span>"+items.length+"</span>",iconSize:[31,31],iconAnchor:[15,15]});const marker=L.marker([lat,lng],{icon}).addTo(map);const node=E("div");node.append(E("strong","",o.name+" — "+o.city),E("p","","Scopri le attività in questo territorio."));items.slice(0,8).forEach(x=>{const a=E("a","",x.name+" ↗");a.href=anchor(x.id);a.style.display="block";node.append(a)});if(items.length>8)node.append(E("p","","+ "+(items.length-8)+" altre attività"));marker.bindPopup(node);mapMarkers.push(marker);}
requestAnimationFrame(()=>{map.invalidateSize();if(bounds.length>1)map.fitBounds(bounds,{padding:[25,25],maxZoom:10});else if(bounds.length===1)map.setView(bounds[0],10);});
}
function render(){if(view==="month"&&$("period").value)selected=$("period").value;territoryFilter=$("territory").value;categoryFilter=$("category").value;monthFilter=$("period").value;organizationFilter=$("organizer").value;const list=getSummary();renderList(list);selectMonth(selected);if(view==="map")mapRender(list);}
function changeView(v){
 if(!["list","month","map"].includes(v))return;
 view=v;
 const tabs=document.querySelector(".gcal-tabs");
 document.querySelectorAll("[data-view]").forEach(b=>{const active=b.dataset.view===v;b.classList.toggle("selected",active);b.setAttribute("aria-selected",String(active));});
 document.querySelectorAll("[data-panel]").forEach(p=>{p.hidden=p.dataset.panel!==v;});
 if(v==="month")selectMonth(monthFilter||selected);
 if(v==="map")mapRender(filtered());
 // Avoid leaving the reader far down a former long list after switching tabs.
 if(tabs){const rect=tabs.getBoundingClientRect();if(rect.top<0||rect.top>window.innerHeight*.7){tabs.scrollIntoView({block:"start",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});}}
}
async function start(){try{const [evRes,orgRes]=await Promise.all([fetch(root+"content/events.json?v=editoriale-20261016-1"),fetch(root+"content/organizations.json?v=editoriale-20261016-1")]);if(!evRes.ok||!orgRes.ok)throw Error("HTTP error");[events,organizations]=await Promise.all([evRes.json(),orgRes.json()]);if(!Array.isArray(events)||!Array.isArray(organizations))throw Error("Invalid data");
events=events.filter(e=>getMonths(e)>0);
opt($("territory"),events.map(x=>x.territory));opt($("category"),events.map(x=>x.category));
for(const k of monthKeys){const o=E("option","",longMonth(k));o.value=k;$("period").append(o)}
organizations.filter(o=>events.some(x=>x.partnerIds?.includes(o.id))).sort((a,b)=>a.name.localeCompare(b.name,"it")).forEach(o=>{const option=E("option","",o.name);option.value=o.id;$("organizer").append(option)});
const partnerLabel=organizations.find(o=>o.id===activePartner)?.name;if(activePartner){if(partnerLabel){const note=$("calendar-partner-notice");note.hidden=false;note.append("Attività collegate a "+partnerLabel+". ");const a=E("a","","Mostra tutta la programmazione ↗");a.href="./";note.append(a);}else activePartner="";}
$("organizer").value=activePartner||"";document.querySelectorAll(".gcal-controls select").forEach(s=>s.addEventListener("change",()=>{if(s.id==="organizer"&&activePartner){activePartner="";$("calendar-partner-notice").hidden=true;}render()}));
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>changeView(b.dataset.view)));
$("month-prev").addEventListener("click",()=>selectMonth(monthKeys[Math.max(0,monthKeys.indexOf(selected)-1)]));
$("month-next").addEventListener("click",()=>selectMonth(monthKeys[Math.min(monthKeys.length-1,monthKeys.indexOf(selected)+1)]));
render();
}catch(err){console.error("Calendario non disponibile",err);$("calendar-count").textContent="Dati del calendario temporaneamente non disponibili";$("event-list").replaceChildren(E("p","gcal-zero","Impossibile caricare la programmazione. Riprova tra qualche istante."));}}
start();
})();
