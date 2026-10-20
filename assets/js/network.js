(function () {
"use strict";
var root = document.body.dataset.root || "../";
var organUrl = root + "content/organizations.json";
var CACHE;
function getAll(){return CACHE||(CACHE=fetch(organUrl+"?v=drago-prata-20261020-v1").then(function(r){if(!r.ok)throw Error("Archivio rete non disponibile");return r.json();}));}
function E(tag,cls,txt){var el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el;}
function safe(url){return typeof url==="string" && /^https:\/\/[\w.-]+(?:[/:?#]|$)/i.test(url);}
function url(o){return root+(o.type==="sostenitore"?"sostenitore/":"partner/")+encodeURIComponent(o.id)+"/";}
function initials(o){return o.name.replace(/\b(APS|S\.?R\.?L\.?|S\.?P\.?A\.?|di|del|delle|the|e)\b/gi,"").trim().split(/\s+/).slice(0,2).map(function(s){return s.charAt(0).toUpperCase()}).join("")||"GS";}
function avatar(o,cl){var b=E("span","net-avatar"+(cl?" "+cl:""));if(o.image && (o.image.startsWith("https://") || o.image.startsWith("assets/images/"))){var img=E("img");img.src=o.image.startsWith("assets/images/")?root+o.image:o.image;img.alt=cl==="directory"?"":"Logo "+o.name;img.loading="lazy";img.decoding="async";img.width=400;img.height=400;img.onerror=function(){b.replaceChildren(document.createTextNode(initials(o)));};b.append(img);}else{b.textContent=initials(o);}return b;}
function link(o,txt,cls){var a=E("a",cls||"",txt);a.href=url(o);return a;}
function memberCard(o){var a=E("a","net-person");a.href=url(o);a.append(avatar(o,"directory"));var v=E("span");v.append(E("span","net-person-title",o.name),E("span","net-person-place",o.city+" ("+o.province+") · "+o.area));v.append(E("span","net-person-brief",o.projectRole));a.append(v,E("span","net-person-arrow","↗"));return a;}
function supporterCard(o){var a=link(o,"","net-support-card");a.append(E("strong","",o.name),E("small","",o.city+" ("+o.province+") · "+o.category),E("span","","Scheda del sostenitore ↗"));return a;}
function showError(id,msg){var e=document.getElementById(id);if(e)e.append(E("p","net-map-fallback",msg));}
function initDirectory(all){
 var leaders=all.filter(function(x){return x.type==="capofila"}),partners=all.filter(function(x){return x.type==="partner"}),supporters=all.filter(function(x){return x.type==="sostenitore"});
 var leader=document.getElementById("network-leader");if(leader&&leaders.length){var o=leaders[0];var logoLink=link(o,"","net-leader-logo");logoLink.setAttribute("aria-label","Scheda di Federludo APS, capofila");logoLink.append(avatar(o,"leader"));leader.append(logoLink);var a=link(o,"Scopri Federludo e il suo ruolo nel progetto →","net-link");leader.append(a);}
 var p=document.getElementById("network-partners");if(p)partners.forEach(function(o){p.append(memberCard(o));});
 var s=document.getElementById("network-supporters");if(s)supporters.forEach(function(o){s.append(supporterCard(o));});
 initMap(all);
}
function initMap(all){
 var panel=document.getElementById("network-map"),listing=document.getElementById("network-map-list");if(!panel || !listing)return;
 var tabs=[].slice.call(document.querySelectorAll("[data-network-filter]"));
 var map=null,marks=[],filter="all";
 var probe=document.createElement("span");probe.className="leaflet-pane";probe.style.visibility="hidden";panel.appendChild(probe);
 var leafletStylesReady=window.getComputedStyle(probe).position==="absolute";probe.remove();
 if(window.L && leafletStylesReady){
  map=L.map(panel,{scrollWheelZoom:false,zoomControl:true});
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'}).addTo(map);
  map.setView([43.41,11.08],8);
 }else panel.append(E("div","net-map-fallback","La mappa non è disponibile in questo momento. Puoi consultare tutte le organizzazioni nell’elenco a fianco."));

 function partnerIcon(o,index,total){
  var holder=E("span","net-map-logo"+(o.type==="capofila"?" net-map-logo--leader":""));
  var img=E("img");
  if(o.image && (o.image.startsWith("assets/images/")||o.image.startsWith("https://"))){
   img.src=o.image.startsWith("assets/images/")?root+o.image:o.image;
   img.alt="";img.loading="lazy";img.decoding="async";
   img.onerror=function(){holder.classList.add("net-map-logo--fallback");holder.replaceChildren(document.createTextNode(initials(o)));};
   holder.append(img);
  }else{
   holder.classList.add("net-map-logo--fallback");
   holder.textContent=initials(o);
  }
  // Keep individual logos available even if further partners share a municipality.
  var offset=(index-(total-1)/2)*42;
  return L.divIcon({className:"net-map-logo-icon",html:holder,
   iconSize:[56,65],iconAnchor:[28-offset,64],popupAnchor:[offset,-54]});
 }
 function supporterIcon(count,alongsidePartner){
  // Orange numbered markers retain the existing supporter convention.
  var badge=E("div","net-map-icon supporter",String(count));
  return L.divIcon({className:"net-map-support-icon",html:badge,
   iconSize:[32,32],iconAnchor:[alongsidePartner?-23:16,16],
   popupAnchor:[0,-14]});
 }
 function validCoordinates(o){return Array.isArray(o.coordinates)&&o.coordinates.length===2&&o.coordinates.every(function(n){return typeof n==="number"&&isFinite(n)});}
 function render(){
  if(map)marks.forEach(function(m){map.removeLayer(m);});marks=[];listing.replaceChildren();
  var rows=all.filter(function(o){return filter==="all"||(filter==="partners"?o.type!=="sostenitore":o.type==="sostenitore");});
  var groups={};
  rows.forEach(function(o){var key=o.city;if(!groups[key])groups[key]={city:key,coordinates:o.coordinates,members:[]};groups[key].members.push(o);});
  Object.values(groups).sort(function(a,b){return a.city.localeCompare(b.city,"it");}).forEach(function(g){
   var heading=E("strong","",g.city+" · "+g.members.length+" soggett"+(g.members.length===1?"o":"i"));listing.append(heading);
   g.members.forEach(function(o){
    var a=link(o,"","net-location"),dot=E("span","net-dot"+(o.type==="sostenitore"?" supporter":""));
    a.append(dot,document.createTextNode(o.name),E("small","",o.type==="capofila"?"Capofila":o.type==="partner"?"Partner":"Sostenitore"));listing.append(a);
   });
   if(!map)return;
   var partners=g.members.filter(function(o){return o.type!=="sostenitore"&&validCoordinates(o);});
   var supporters=g.members.filter(function(o){return o.type==="sostenitore"&&validCoordinates(o);});
   // Supporters remain grouped by town, with their count in the orange marker.
   if(supporters.length){
    var supporterPopup=E("div","net-popup-links");supporterPopup.append(E("strong","",g.city+" · Sostenitori"));
    supporters.forEach(function(o){supporterPopup.append(link(o,o.name+" ↗"));});
    var sMarker=L.marker(supporters[0].coordinates,{icon:supporterIcon(supporters.length,partners.length>0),
      title:g.city+": "+supporters.length+" sostenitori"}).addTo(map);
    sMarker.bindPopup(supporterPopup);marks.push(sMarker);
   }
   // One original association logo per partner/capofila, using the image path in organizations.json.
   partners.forEach(function(o,i){
    var partnerPopup=E("div","net-popup-links");
    partnerPopup.append(E("strong","",o.name),E("small","net-map-popup-place",o.city+" · "+(o.type==="capofila"?"Capofila":"Partner")));
    partnerPopup.append(link(o,"Apri la scheda ↗"));
    var marker=L.marker(o.coordinates,{icon:partnerIcon(o,i,partners.length),title:o.name,
      zIndexOffset:1000}).addTo(map);
    marker.bindPopup(partnerPopup);marks.push(marker);
   });
  });
  if(map){
   var located=rows.filter(validCoordinates);
   if(located.length)map.fitBounds(L.latLngBounds(located.map(function(o){return o.coordinates;})).pad(.20),{maxZoom:9});
   map.invalidateSize();
  }
 }
 tabs.forEach(function(btn){btn.addEventListener("click",function(){
  filter=btn.dataset.networkFilter;
  tabs.forEach(function(b){b.classList.toggle("active",b===btn);b.setAttribute("aria-pressed",String(b===btn));});
  render();
 });});
 render();
}

function setupProfile(all){
 var target=document.getElementById("network-profile");if(!target)return;
 var id=document.body.dataset.organizationId || new URLSearchParams(location.search).get("id");
 var o=all.find(function(item){return item.id===id});
 if(!o){target.append(E("div","net-wrap","Scheda non trovata. Torna al partenariato."));return;}
 target.replaceChildren(); // Static HTML summary remains available when JavaScript is unavailable.
 document.title=o.name+" | "+(o.type==="capofila"?"Capofila":o.type==="partner"?"Partner":"Sostenitore")+" di Gioco di Squadra";
 var crumbs=E("nav","net-crumb");crumbs.setAttribute("aria-label","Percorso");
 var h=E("a","","Home");h.href=root;var n=E("a","","Il partenariato");n.href=root+"partenariato/";crumbs.append(h,E("span","","/"),n,E("span","","/"),E("span","",o.name));
 var hero=E("header","net-profile-hero"),wrap=E("div","net-wrap"),grid=E("div","net-profile-hero-grid"),text=E("div");
 text.append(E("span","eyebrow",o.type==="capofila"?"Capofila":o.type==="partner"?"Partner di progetto":"Sostenitore della rete"),E("h1","",o.name),E("p","",o.description));
 var meta=E("div","net-profile-meta");meta.append(E("span","",o.city+" · "+o.province),E("span","",o.type==="sostenitore"?"Sostenitore":o.type==="capofila"?"Coordinamento regionale":"Partner territoriale"));text.append(meta);
 var logo=E("div","net-profile-symbol");logo.append(avatar(o,"profile"));
 grid.append(text,logo);wrap.append(crumbs,grid);hero.append(wrap);target.append(hero);
 var section=E("section","net-profile-body"),content=E("div","net-wrap net-profile-layout"),body=E("div","net-prose"),side=E("aside","net-factbox");
 var who=E("section");who.append(E("span","eyebrow","La realtà"),E("h2","","Chi è"),E("p","",o.description));body.append(who);
 var role=E("section");role.append(E("span","eyebrow","Gioco di Squadra"),E("h2","","Il contributo al progetto"),E("p","",o.projectRole));body.append(role);
 if(o.focusPage && o.focusPage.href && o.focusPage.href.startsWith("attivita/")){
   var focus=E("section","net-focus-card");
   focus.append(E("span","eyebrow","Un percorso condiviso"),
     E("h2","","Gioco, consumi e comunità"),
     E("p","","Il progetto collega la lettura critica dei meccanismi ludici del marketing alimentare alla partecipazione della comunità. Il format è ancora in definizione."));
   var explore=E("a","net-link",o.focusPage.label||"Approfondisci il percorso ↗");
   explore.href=root+o.focusPage.href;
   focus.append(explore);
   if(o.collaborationId){
     var colleague=all.find(function(other){return other.id===o.collaborationId;});
     if(colleague){
       var collaboration=E("p","net-focus-card__collaboration","In collaborazione con ");
       var together=E("a","",colleague.name);together.href=url(colleague);
       collaboration.append(together);focus.append(collaboration);
     }
   }
   body.append(focus);
 }

 if(o.actions && o.actions.length){var acts=E("section","net-activities");acts.append(E("span","eyebrow","Il programma"),E("h2","","Azioni e attività previste"),E("p","net-activities-intro","Programmazione in fase di aggiornamento."));o.actions.forEach(function(a){var entry=E("article","net-activity-item"),left=E("div","net-activity-code",a.code),right=E("div");right.append(E("h3","",a.title),E("p","",a.description),E("span","net-activity-period","Periodo previsto: "+a.window));entry.append(left,right);acts.append(entry);});body.append(acts);}
 side.append(E("h3","","In breve"));var dl=E("dl");
 function fact(k,v,external){if(!v)return;dl.append(E("dt","",k));var d=E("dd");if(external&&safe(v)){var a=E("a","",new URL(v).hostname.replace(/^www\./,""));a.href=v;a.target="_blank";a.rel="noopener noreferrer";d.append(a);}else d.textContent=v;dl.append(d);}
 fact("Ruolo",o.type==="capofila"?"Capofila":o.type==="partner"?"Partner":"Sostenitore");
 fact("Comune di riferimento",o.city+" ("+o.province+")");
 fact("Territorio operativo",o.area);
 fact("Sito o presenza pubblica",o.website,true);
 if(o.email && /^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(o.email)){dl.append(E("dt","","Email pubblica"));var dd=E("dd"),mail=E("a","",o.email);mail.href="mailto:"+o.email;dd.append(mail);dl.append(dd);}
 fact("Fonte consultabile",o.sourceUrl,true);
 if(o.type!=="sostenitore"){
   fetch(root+"content/events.json").then(function(r){return r.ok?r.json():[]}).then(function(events){
     var related=events.filter(function(e){return e.organizerId===o.id});
     if(!related.length)return;
     var sec=E("section","net-activities");
     sec.append(E("span","eyebrow","Collegamenti al calendario"),E("h2","","Appuntamenti associati"),E("p","net-activities-intro","Programmazione in fase di aggiornamento."));
     related.forEach(function(ev){
       var row=E("article","net-activity-item");
       row.append(E("div","net-activity-code",ev.periodLabel||"In aggiornamento"));
       var detail=E("div");detail.append(E("h3","",ev.name),E("p","",ev.territory+" · "+ev.category));
       var a=E("a","net-link","Apri la scheda dell’attività ↗");a.href=root+"evento/?id="+encodeURIComponent(ev.id);detail.append(a);row.append(detail);sec.append(row);
     });body.append(sec);
   }).catch(function(err){console.warn("Calendario temporaneamente non disponibile",err)});
 }
side.append(dl);content.append(body,side);section.append(content);target.append(section);
 var bottom=E("section","net-related"),bw=E("div","net-wrap"),bh=E("h2","",o.type==="sostenitore"?"Una rete che cresce insieme":"Scopri quando e dove si gioca");bw.append(bh,E("p","",o.type==="sostenitore"?"Esplora gli altri soggetti della rete e le attività territoriali.":"Esplora il calendario delle attività di Gioco di Squadra."));
 var ca=E("a","","Consulta il calendario ↗");ca.href=root+"calendario/"+(o.type==="sostenitore"?"":"?partner="+encodeURIComponent(o.id));bw.append(ca,E("span","", "  ·  "));var pa=E("a","","Torna alla rete ↗");pa.href=root+"partenariato/";bw.append(pa);bottom.append(bw);target.append(bottom);
}
getAll().then(function(all){if(!Array.isArray(all))throw Error("Formato archivio");if(document.getElementById("network-partners"))initDirectory(all);setupProfile(all);}).catch(function(e){console.error(e);showError("network-partners","Non è stato possibile caricare la rete. Riprova più tardi.");showError("network-profile","Dati temporaneamente non disponibili.");});
})();