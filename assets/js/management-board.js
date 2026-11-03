/* Gioco di Squadra · Management Board
   Enriches server-authored placeholders from the public, minimal governance dataset.
   Never inserts unconfirmed portraits or invents names. */
(function(){
 "use strict";
 const root=document.body.getAttribute("data-root")||"../";
 const placeholders=[...document.querySelectorAll(".mb-person[data-person-id]")];
 if(!placeholders.length)return;
 const allowedPhoto=/^assets\/images\/team\/[a-z0-9._-]+\.(?:webp|png|jpg|jpeg)$/i;
 const people=new Map(placeholders.map(x=>[x.getAttribute("data-person-id"),x]));
 function update(key,profile){
  const el=people.get(key);
  if(!el||!profile||typeof profile!=="object")return;
  const title=el.querySelector(".mb-person-name");
  if(title&&typeof profile.name==="string"&&profile.name.trim()){
   title.textContent=profile.name.trim();
   el.classList.add("mb-person-confirmed");
  }
  if(typeof profile.photo==="string"&&allowedPhoto.test(profile.photo)){
   const avatar=el.querySelector(".mb-profile-photo, .mb-photo-placeholder, .mb-person-avatar");
   if(!avatar)return;
   const image=document.createElement("img");
   image.src=root+profile.photo;
   image.alt="";
   image.loading="lazy";
   image.decoding="async";
   image.addEventListener("error",function(){image.remove()},{once:true});
   avatar.replaceChildren(image);
  }
 }
 fetch(root+"content/governance.json?v=20261103-v1",{cache:"no-store"})
  .then(r=>{if(!r.ok)throw Error("Dataset governance non disponibile");return r.json()})
  .then(data=>{
   if(!data||typeof data!=="object")return;
   if(Array.isArray(data.central)){
    data.central.forEach(person=>{if(person?.id)update("core."+person.id,person)});
   }
   if(Array.isArray(data.representatives)){
    data.representatives.forEach(partner=>{
     const id=partner?.organizationId;
     if(!id)return;
     update(id+".steering",partner.steering);
     update(id+".operations",partner.operations);
    });
   }
  })
  .catch(()=>{/* Static names and partner roster remain visible */});
})();
