
(function(){
"use strict";
function el(tag,cl,tx){var x=document.createElement(tag);if(cl)x.className=cl;if(tx!==undefined)x.textContent=tx;return x;}
var root=document.body.dataset.root||"";
var home=document.getElementById("home-news-grid"),archive=document.getElementById("stories-archive-list");
if(!home&&!archive)return;
fetch(root+"content/news.json").then(function(r){if(!r.ok)throw Error("Notizie non disponibili");return r.json();}).then(function(items){
 if(!Array.isArray(items))throw Error("Archivio notizie non valido");
 items=items.filter(function(n){return n.status==="published"||n.status==="draft"}).sort(function(a,b){return Number(!!b.featured)-Number(!!a.featured)});
 function card(n,context){
   var a=el("a",context==="home"?"gds-story":"stories-card");a.href=root+n.url;
   var img=el("span",context==="home"?"gds-story-image":"stories-card-photo");if(n.image&&n.image.startsWith("https://images.unsplash.com/"))img.style.setProperty("--story-photo",'url("'+n.image+'")');
   var text=el("span",context==="home"?"gds-story-info":"stories-card-inner");
   var status=n.status==="draft"?"Anteprima · notizia in preparazione":n.category;
   text.append(el(context==="home"?"span":"small",context==="home"?"gds-story-label":"",status),el("h3","",n.title),el("p","",n.excerpt),el("span",context==="home"?"gds-story-action":"stories-card-link",n.status==="draft"?"Leggi l’anteprima ↗":"Leggi la storia ↗"));
   a.append(img,text);return a;
 }
 if(home){home.replaceChildren();home.classList.toggle("is-single",items.length===1);items.slice(0,3).forEach(function(n){home.append(card(n,"home"));});if(!items.length)home.append(el("p","gds-news-empty","Le storie del progetto arriveranno presto."));}
 if(archive){archive.replaceChildren();items.forEach(function(n){archive.append(card(n,"archive"));});if(!items.length)archive.append(el("p","","Le notizie saranno disponibili prossimamente."));}
}).catch(function(err){console.error(err);if(home){home.replaceChildren(el("p","gds-news-empty","Le notizie sono temporaneamente non disponibili."));}if(archive){archive.replaceChildren(el("p","","Le notizie sono temporaneamente non disponibili."));}});
})();
