(function(){
"use strict";
var section=document.querySelector(".gds-partners-showcase");
if(!section)return;
var track=section.querySelector("#gds-partners-track");
var items=Array.from(track.querySelectorAll(".gds-partner-slide"));
var previous=section.querySelector("#gds-partners-prev");
var next=section.querySelector("#gds-partners-next");
var pause=section.querySelector("#gds-partners-pause");
if(!track||items.length<2||!previous||!next||!pause)return;
var prefersReduced=window.matchMedia("(prefers-reduced-motion: reduce)");
var isPaused=false,isHovered=false,isFocused=false;
function change(direction){
 var max=Math.max(0,track.scrollWidth-track.clientWidth);
 var amount=items[0].getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap||"16");
 var left=track.scrollLeft;
 var target=direction>0?(left>=max-8?0:Math.min(max,left+amount)):(left<=8?max:Math.max(0,left-amount));
 track.scrollTo({left:target,behavior:prefersReduced.matches?"auto":"smooth"});
}
previous.addEventListener("click",function(){change(-1)});
next.addEventListener("click",function(){change(1)});
pause.addEventListener("click",function(){
 isPaused=!isPaused;pause.setAttribute("aria-pressed",String(isPaused));
 pause.textContent=isPaused?"Riprendi":"Pausa";
 pause.setAttribute("aria-label",isPaused?"Riprendi lo scorrimento automatico":"Metti in pausa lo scorrimento automatico");
});
section.addEventListener("mouseenter",function(){isHovered=true});
section.addEventListener("mouseleave",function(){isHovered=false});
section.addEventListener("focusin",function(){isFocused=true});
section.addEventListener("focusout",function(event){if(!section.contains(event.relatedTarget))isFocused=false});
track.addEventListener("pointerdown",function(){isHovered=true});
document.addEventListener("visibilitychange",function(){if(document.hidden)isHovered=false});
if(prefersReduced.matches){pause.hidden=true;pause.setAttribute("aria-pressed","true")}
window.setInterval(function(){
 if(prefersReduced.matches||document.hidden||isPaused||isHovered||isFocused||maxScroll()==0)return;
 change(1);
},4800);
function maxScroll(){return track.scrollWidth-track.clientWidth}
})();
