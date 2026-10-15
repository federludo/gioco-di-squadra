(function () {
"use strict";
var root = document.body.dataset.root || "../";
var organUrl = root + "content/organizations.json";
var logoFallback = root + "assets/images/branding/logo-federludo-placeholder.svg";
var CACHE;
function getAll(){return CACHE||(CACHE=fetch(organUrl).then(function(r){if(!r.ok)throw Error("Archivio rete non disponibile");return r.json();}));}
function E(tag,cls,txt){var el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;}
function safe(url){return typeof url==="string" && /^https:\/\/[\w.-]+(?:[/:?#]|$)/i.test(url);}
function url(o){return root+(o.type==="sostenitore"?"sostenitore/":"partner/")+encodeURIComponent(o.id)+"/";}
function initials(o){return o.name.replace(/\b(APS|S\.?R\.?L\.?|S\.?P\.?A\.?|di|del|delle|the|e)\b/gi,"").trim().split(/\s+/).slice(0,2).map(function(s){return s.charAt(0).toUpperCase()}).join("")||"GS";}
function avatar(o,cl){var b=E("span","net-avatar"+(cl?" "+cl:""));if(o.image && (o.image.startsWith("https://") || o.image.startsWith("assets/images/"))){var img=E("img");img.src=o.image.startsWith("assets/images/")?root+o.image:o.image;img.alt="Logo "+o.name;img.loading="lazy";img.onerror=function(){b.replaceChildren(document.createTextNode(initials(o)));};b.append(img);}else{b.textContent=initials(o);}return b;}
function link(o,txt,cls){var a=E("a",cls||"",txt);a.href=url(o);return a;}
function memberCard(o){var a=E("a","net-person");a.href=url(o);a.append(avatar(o));var v=E("span");v.append(E("span","net-person-title",o.name),E("span","net-person-place",o.city+" ("+o.province+") · "+o.area));v.append(E("span","net-person-brief",o.projectRole));a.append(v,E("span","net-person-arrow","↗"));return a;}
function supporterCard(o){var a=link(o,"","net-support-card");a.append(E("strong","",o.name),E("small","",o.city+" ("+o.province+") · "+o.category),E("span","","Scheda del sostenitore ↗"));return a;}
function showError(id,msg){var e=document.getElementById(id);if(e)e.append(E("p","net-map-fallback",msg));}
function initDirectory(all){
 var leaders=all.filter(function(x){return x.type==="capofila"}),partners=all.filter(function(x){return x.type==="partner"}),supporters=all.filter(function(x){return x.type==="sostenitore"});
 var leader=document.getElementById("network-leader");if(leader&&leaders.length){var o=leaders[0];var a=link(o,"Scopri Federludo e il suo ruolo nel progetto →","net-link");leader.append(a);}
 var p=document.getElementById("network-partners");if(p)partners.forEach(function(o){p.append(memberCard(o));});
 var s=document.getElementById("network-supporters");if(s)supporters.forEach(function(o){s.append(supporterCard(o));});
 initMap(all);
}
function initMap(all){
 var panel=document.getElementById("network-map"),listing=document.getElementById("network-map-list");if(!panel || !listing)return;
 var tabs=[].slice.call(document.querySelectorAll("[data-network-filter]"));
 var map=null;var marks=[];var filter="all";
 if(window.L){map=L.map(panel,{scrollWheelZoom:false,zoomControl:true});L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'}).addTo(map);map.setView([43.41,11.08],8);}
 else panel.append(E("div","net-map-fallback","La mappa non è disponibile; puoi consultare tutti i soggetti nell’elenco a fianco."));
 function render(){
  if(map)marks.forEach(function(m){map.removeLayer(m)});marks=[];listing.replaceChildren();
  var rows=all.filter(function(o){return filter==="all" || (filter==="partners"?o.type!=="sostenitore":o.type==="sostenitore");});
  var groups={};rows.forEach(function(o){var key=o.city; if(!groups[key])groups[key]={city:key,coordinates:o.coordinates,members:[]};groups[key].members.push(o);});
  Object.values(groups).sort(function(a,b){return a.city.localeCompare(b.city,"it")}).forEach(function(g){
   var title=E("strong","",g.city+" · "+g.members.length+" soggett"+(g.members.length===1?"o":"i"));listing.append(title);
   g.members.forEach(function(o){var a=link(o,"","net-location");var dot=E("span","net-dot"+(o.type==="sostenitore"?" supporter":""));a.append(dot,document.createTextNode(o.name),E("small","",o.type==="capofila"?"Capofila":o.type==="partner"?"Partner":"Sostenitore"));listing.append(a);});
   if(map && Array.isArray(g.coordinates)){var hasP=g.members.some(function(m){return m.type!=="sostenitore"}),hasS=g.members.some(function(m){return m.type==="sostenitore"});var tone=hasP&&hasS?"mixed":hasP?"partner":"supporter";var icon=L.divIcon({className:"",html:'<div class="net-map-icon '+tone+'">'+g.members.length+'</div>',iconSize:[32,32],iconAnchor:[16,16]});var marker=L.marker(g.coordinates,{icon:icon}).addTo(map);var popup=E("div","net-popup-links");popup.append(E("strong","",g.city));g.members.forEach(function(o){popup.append(link(o,o.name+" ↗"));});marker.bindPopup(popup);marks.push(marker);}
  });
  if(map){var located=rows.filter(function(o){return Array.isArray(o.coordinates)});if(located.length){var ll=located.map(function(o){return o.coordinates});map.fitBounds(L.latLngBounds(ll).pad(.20),{maxZoom:9});}map.invalidateSize();}
 }
 tabs.forEach(function(btn){btn.addEventListener("click",function(){filter=btn.dataset.networkFilter;tabs.forEach(function(b){b.classList.toggle("active",b===btn);b.setAttribute("aria-pressed",String(b===btn))});render();})});render();
}
function setupProfile(all){
 var target=document.getElementById("network-profile");if(!target)return;
 var id=document.body.dataset.organizationId || new URLSearchParams(location.search).get("id");
 var o=all.find(function(item){return item.id===id});
 if(!o){target.append(E("div","net-wrap","Scheda non trovata. Torna al partenariato."));return;}
 document.title=o.name+" | Gioco di Squadra";
 var crumbs=E("nav","net-crumb");crumbs.setAttribute("aria-label","Percorso");
 var h=E("a","","Home");h.href=root;var n=E("a","","Il partenariato");n.href=root+"partenariato/";crumbs.append(h,E("span","","/"),n,E("span","","/"),E("span","",o.name));
 var hero=E("header","net-profile-hero"),wrap=E("div","net-wrap"),grid=E("div","net-profile-hero-grid"),text=E("div");
 text.append(E("span","eyebrow",o.type==="capofila"?"Capofila":o.type==="partner"?"Partner di progetto":"Sostenitore della rete"),E("h1","",o.name),E("p","",o.description));
 var meta=E("div","net-profile-meta");meta.append(E("span","",o.city+" · "+o.province),E("span","",o.type==="sostenitore"?"Sostenitore":o.type==="capofila"?"Coordinamento regionale":"Partner territoriale"));text.append(meta);
 var logo=E("div","net-profile-symbol");logo.append(avatar(o),E("small","",o.image?"Identità visiva":"Monogramma provvisorio · logo ufficiale da integrare"));
 grid.append(text,logo);wrap.append(crumbs,grid);hero.append(wrap);target.append(hero);
 var section=E("section","net-profile-body"),content=E("div","net-wrap net-profile-layout"),body=E("div","net-prose"),side=E("aside","net-factbox");
 var who=E("section");who.append(E("span","eyebrow","La realtà"),E("h2","","Chi è"),E("p","",o.description));body.append(who);
 var role=E("section");role.append(E("span","eyebrow","Gioco di Squadra"),E("h2","","Il contributo al progetto"),E("p","",o.projectRole));body.append(role);
 if(o.actions && o.actions.length){var acts=E("section","net-activities");acts.append(E("span","eyebrow","Piano operativo"),E("h2","","Azioni e attività previste"),E("p","net-activities-intro","Le finestre temporali derivano dal piano tecnico di progetto e non equivalgono a date di eventi già confermate."));o.actions.forEach(function(a){var entry=E("article","net-activity-item"),left=E("div","net-activity-code",a.code),right=E("div");right.append(E("h3","",a.title),E("p","",a.description),E("span","net-activity-period","Periodo previsto: "+a.window));entry.append(left,right);acts.append(entry);});body.append(acts);}
 side.append(E("h3","","In breve"));var dl=E("dl");
 function fact(k,v,external){if(!v)return;dl.append(E("dt","",k));var d=E("dd");if(external&&safe(v)){var a=E("a","",new URL(v).hostname.replace(/^www\./,""));a.href=v;a.target="_blank";a.rel="noopener noreferrer";d.append(a);}else d.textContent=v;dl.append(d);}
 fact("Ruolo",o.type==="capofila"?"Capofila":o.type==="partner"?"Partner":"Sostenitore");
 fact("Comune di riferimento",o.city+" ("+o.province+")");
 fact("Territorio operativo",o.area);
 fact("Sito o presenza pubblica",o.website,true);
 if(o.email && /^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(o.email)){dl.append(E("dt","","Email pubblica"));var dd=E("dd"),mail=E("a","",o.email);mail.href="mailto:"+o.email;dd.append(mail);dl.append(dd);}
 fact("Fonte consultabile",o.sourceUrl,true);side.append(dl);content.append(body,side);section.append(content);target.append(section);
 var bottom=E("section","net-related"),bw=E("div","net-wrap"),bh=E("h2","",o.type==="sostenitore"?"Una rete che cresce insieme":"Scopri quando e dove si gioca");bw.append(bh,E("p","",o.type==="sostenitore"?"Esplora gli altri soggetti della rete e le attività territoriali.":"Gli appuntamenti confermati saranno collegati al calendario di Gioco di Squadra."));
 var ca=E("a","","Consulta il calendario ↗");ca.href=root+"calendario/"+(o.type==="sostenitore"?"":"?partner="+encodeURIComponent(o.id));bw.append(ca,E("span","", "  ·  "));var pa=E("a","","Torna alla rete ↗");pa.href=root+"partenariato/";bw.append(pa);bottom.append(bw);target.append(bottom);
}
getAll().then(function(all){if(!Array.isArray(all))throw Error("Formato archivio");if(document.getElementById("network-partners"))initDirectory(all);setupProfile(all);}).catch(function(e){console.error(e);showError("network-partners","Non è stato possibile caricare la rete. Riprova più tardi.");showError("network-profile","Dati temporaneamente non disponibili.");});
})();