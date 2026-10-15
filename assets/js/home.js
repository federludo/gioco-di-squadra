
(function(){
"use strict";
var reduce=window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function el(t,c,txt){var n=document.createElement(t);if(c)n.className=c;if(txt!=null)n.textContent=txt;return n;}
var eventsTarget=document.getElementById("home-programme");
if(eventsTarget)fetch("content/events.json").then(function(r){if(!r.ok)throw Error("Eventi non disponibili");return r.json();}).then(function(items){
 eventsTarget.replaceChildren();
 if(!items.length){eventsTarget.append(el("p","","La programmazione è in aggiornamento."));return;}
 items.filter(function(x){return x.months&&x.months.length;}).sort(function(a,b){return a.startMonth.localeCompare(b.startMonth)||a.name.localeCompare(b.name,"it");}).slice(0,3).forEach(function(item,i){
 var a=el("a","gds-event-row");a.href="evento/?id="+encodeURIComponent(item.id);
 var index=el("span","gds-event-code",String(i+1).padStart(2,"0"));
 var x=el("span");x.append(el("h3","",item.name),el("p","",item.territory+" · "+item.category),el("small","",item.periodLabel||"Programmazione in aggiornamento"));
 a.append(index,x,el("span","arrow","↗"));eventsTarget.append(a);
 });
}).catch(function(){eventsTarget.append(el("p","","La programmazione è in aggiornamento. Consulta il calendario."));});
if(!reduce && "IntersectionObserver" in window){
 var els=[].slice.call(document.querySelectorAll(".gds-home [data-reveal]"));
 document.documentElement.classList.add("home-motion");
 var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}})},{threshold:.08,rootMargin:"0px 0px -25px 0px"});
 els.forEach(function(e){observer.observe(e)});
}
if(!reduce && "requestAnimationFrame" in window){
 var hero=document.querySelector(".gds-hero"),image=document.querySelector(".gds-hero-image"),scheduled=false;
 if(hero && image){
  var update=function(){var y=Math.max(0,Math.min(hero.offsetHeight,window.scrollY||0));image.style.setProperty("--gds-photo-shift",Math.round(y*.085)+"px");scheduled=false;};
  window.addEventListener("scroll",function(){if(!scheduled){scheduled=true;window.requestAnimationFrame(update)}},{passive:true});
 }
}
})();
