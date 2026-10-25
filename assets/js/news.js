
(function(){
"use strict";
function el(tag,cl,tx){var x=document.createElement(tag);if(cl)x.className=cl;if(tx!==undefined)x.textContent=tx;return x;}
var root=document.body.dataset.root||"";
var home=document.getElementById("home-news-grid"),archive=document.getElementById("stories-archive-list");
if(!home&&!archive)return;
fetch(root+"content/news.json?v=kickoff-20261026-v1").then(function(r){if(!r.ok)throw Error("Notizie non disponibili");return r.json();}).then(function(items){
 if(!Array.isArray(items))throw Error("Archivio notizie non valido");
 items=items.filter(function(n){return n.status==="published"}).sort(function(a,b){return Number(!!b.featured)-Number(!!a.featured)||String(b.date||"").localeCompare(String(a.date||""))});
 function card(n,context){
   var a=el("a",context==="home"?"gds-story":"stories-card");a.href=root+n.url;
   var picture=typeof n.image==="string"?n.image:"";
   var permitted=/^https:\/\/images\.unsplash\.com\//.test(picture)||/^assets\/images\/news\/[A-Za-z0-9._-]+\.(?:svg|png|jpg|webp)$/.test(picture);
   var imageUrl=permitted?(picture.startsWith("assets/")?root+picture:picture):root+"assets/images/news/gioco-di-squadra-finanziamento-cover.svg";
   var img=el("img",context==="home"?"gds-story-image":"stories-card-photo");
   img.src=imageUrl;
   img.alt=n.imageAlt||"Immagine della notizia";
   img.loading="lazy";img.decoding="async";img.width=1700;img.height=956;
   var text=el("span",context==="home"?"gds-story-info":"stories-card-inner");
   var status=n.category;var when=n.date?new Date(n.date+"T12:00:00").toLocaleDateString("it-IT",{day:"numeric",month:"long",year:"numeric"}):"";
   text.append(el("span",context==="home"?"gds-story-label":"stories-card-meta",status+(when?" · "+when:"")),el("h3","",n.title),el("p","",n.excerpt),el("span",context==="home"?"gds-story-action":"stories-card-link","Leggi la notizia ↗"));
   a.append(img,text);return a;
 }
 if(home){home.replaceChildren();home.classList.toggle("is-single",items.length===1);items.slice(0,3).forEach(function(n){home.append(card(n,"home"));});if(!items.length)home.append(el("p","gds-news-empty","Le storie del progetto arriveranno presto."));}
 if(archive){archive.replaceChildren();items.forEach(function(n){archive.append(card(n,"archive"));});if(!items.length)archive.append(el("p","","Le notizie saranno disponibili prossimamente."));}
}).catch(function(err){console.error(err);if(home){home.replaceChildren(el("p","gds-news-empty","Le notizie sono temporaneamente non disponibili."));}if(archive){archive.replaceChildren(el("p","","Le notizie sono temporaneamente non disponibili."));}});
})();
