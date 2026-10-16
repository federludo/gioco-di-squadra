(function(){
  "use strict";
  var section=document.querySelector(".gds-partners-showcase");
  if(!section)return;
  var track=section.querySelector("#gds-partners-track");
  var pause=section.querySelector("#gds-partners-pause");
  var previous=section.querySelector("#gds-partners-prev");
  var next=section.querySelector("#gds-partners-next");
  if(!track||!pause||!previous||!next)return;
  var originals=Array.from(track.querySelectorAll(":scope > .gds-partner-slide"));
  if(originals.length<2)return;

  // Two decorative copies allow an endless loop without jumping back to the first logo.
  // The central, original group remains the only keyboard-accessible group.
  function copyItem(node){
    var clone=node.cloneNode(true);
    clone.setAttribute("aria-hidden","true");
    clone.setAttribute("tabindex","-1");
    clone.classList.add("gds-partner-slide--duplicate");
    var image=clone.querySelector("img");
    if(image)image.loading="lazy";
    return clone;
  }
  var front=document.createDocumentFragment();
  var back=document.createDocumentFragment();
  var firstCopy;
  originals.forEach(function(item){
    var a=copyItem(item);
    if(!firstCopy)firstCopy=a;
    front.appendChild(a);
    back.appendChild(copyItem(item));
  });
  track.insertBefore(front,originals[0]);
  track.appendChild(back);

  var reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  var paused=false, hovered=false, focused=false, visible=!window.IntersectionObserver;
  var cycle=0, lastFrame=0, holdUntil=0;
  var speed=27; // pixels per second, with no pauses or jumps between logos

  function normalize(){
    if(!cycle)return;
    while(track.scrollLeft>=cycle*2)track.scrollLeft-=cycle;
    while(track.scrollLeft<cycle)track.scrollLeft+=cycle;
  }
  function measure(reset){
    var oldCycle=cycle;
    var progress=oldCycle?(track.scrollLeft-oldCycle)/oldCycle:0;
    cycle=originals[0].offsetLeft-firstCopy.offsetLeft;
    if(!(cycle>0))cycle=originals.reduce(function(sum,node){return sum+node.getBoundingClientRect().width+16},0);
    if(reset)progress=0;
    track.scrollLeft=cycle*(1+progress);
    normalize();
  }
  function updatePause(){
    pause.textContent=paused?"Riprendi":"Pausa";
    pause.setAttribute("aria-label",paused?"Riprendi lo scorrimento dei loghi":"Metti in pausa lo scorrimento dei loghi");
    pause.setAttribute("aria-pressed",String(paused));
  }
  pause.addEventListener("click",function(){paused=!paused;updatePause();});
  previous.addEventListener("click",function(){step(-1)});
  next.addEventListener("click",function(){step(1)});
  function step(direction){
    holdUntil=performance.now()+3400;
    var first=originals[0];
    var second=originals[1];
    var amount=second.offsetLeft-first.offsetLeft;
    track.scrollBy({left:direction*(amount||270),behavior:reduced.matches?"auto":"smooth"});
  }

  track.addEventListener("mouseenter",function(){hovered=true});
  track.addEventListener("mouseleave",function(){hovered=false});
  track.addEventListener("focusin",function(){focused=true});
  track.addEventListener("focusout",function(event){if(!track.contains(event.relatedTarget))focused=false});
  track.addEventListener("pointerdown",function(){holdUntil=performance.now()+7500});
  track.addEventListener("wheel",function(){holdUntil=performance.now()+4500},{passive:true});
  track.addEventListener("click",function(event){
    if(!event.target.closest("a,button")){paused=!paused;updatePause();}
  });
  if("IntersectionObserver" in window){
    var watcher=new IntersectionObserver(function(entries){visible=entries[0].isIntersecting},{threshold:.05});
    watcher.observe(section);
  }
  measure(true);
  if("ResizeObserver" in window){
    new ResizeObserver(function(){measure(false)}).observe(track);
  }else{
    window.addEventListener("resize",function(){measure(false)},{passive:true});
  }
  reduced.addEventListener&&reduced.addEventListener("change",function(){lastFrame=0;updatePause()});
  function frame(time){
    if(!lastFrame)lastFrame=time;
    var dt=Math.min(64,time-lastFrame);
    lastFrame=time;
    if(cycle && visible && !paused && !hovered && !focused && !reduced.matches &&
       !document.hidden && time>holdUntil){
      track.scrollLeft+=speed*dt/1000;
      normalize();
    }
    window.requestAnimationFrame(frame);
  }
  updatePause();
  window.requestAnimationFrame(frame);
})();
