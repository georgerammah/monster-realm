// ===== V6: forced landscape by rotating the page when the phone is upright =====
function isRot(){ return document.body.classList.contains('rot'); }
function updRot(){ const r=matchMedia('(orientation:portrait)').matches && matchMedia('(pointer:coarse)').matches; document.body.classList.toggle('rot',r); }
updRot(); addEventListener('resize',updRot); addEventListener('orientationchange',()=>setTimeout(updRot,120));
function localRect(el){
  const r=el.getBoundingClientRect(); if(!isRot()) return r;
  const R=document.body.getBoundingClientRect();
  return {left:r.top-R.top, top:R.right-r.right, width:r.height, height:r.width};
}
function cardCenter(el){ const r=localRect(el); return [r.left+r.width/2, r.top+r.height*0.32]; }
function fCenter(el){ const r=localRect(el.querySelector('.fart')); return [r.left+r.width/2, r.top+r.height*0.5]; }
function pointAt(sel){
  document.querySelectorAll('.garrow2').forEach(x=>x.remove());
  const t=document.querySelector(sel); if(!t) return;
  const r=localRect(t); const a=document.createElement('div'); a.className='garrow2';
  a.style.left=(r.left+r.width/2-22)+'px'; a.style.top=Math.max(4,r.top-70)+'px';
  document.body.appendChild(a);
  const rm=()=>{ a.remove(); document.removeEventListener('pointerdown',rm,true); };
  setTimeout(()=>document.addEventListener('pointerdown',rm,true),50); setTimeout(rm,9000);
}
function bindAbility(btn,a){
  const id=btn.dataset.sk; let p0=null, moved=false;
  const dyOf=e=> isRot() ? -(e.clientX-p0.x) : (e.clientY-p0.y);
  btn.addEventListener('pointerdown',e=>{ if(btn.disabled) return; p0={x:e.clientX,y:e.clientY}; moved=false; btn.classList.add('press'); try{btn.setPointerCapture(e.pointerId);}catch(_){} });
  btn.addEventListener('pointermove',e=>{ if(!p0) return; const dy=dyOf(e); if(dy<-6){ moved=true; btn.style.transform=`translateY(${Math.max(-90,dy)}px)`; } });
  btn.addEventListener('pointerup',e=>{ if(!p0) return; const dy=dyOf(e); p0=null; btn.classList.remove('press'); btn.style.transform='';
    if(dy<-45){ hideInfo(); humanAct(id, castTarget(a,id)); } else if(!moved) showInfo(id,a); });
  btn.addEventListener('pointercancel',()=>{ p0=null; btn.style.transform=''; btn.classList.remove('press'); });
}
