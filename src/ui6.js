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
function renderHUD(){
  const lead=teamMons()[0]; const pct=S.energy/S.maxEnergy*100;
  $('#hud').innerHTML=`<div class="avatar">${lead?monSVG(lead.sp,lead.lvl):''}</div>
    <div class="hcol">
      <div class="hrow"><div class="hbar name"><span class="ico">♛</span><b>${esc(S.name||'Trainer')}</b></div><div class="hbar cash"><span class="ico c">$</span><b>${S.cash|0}</b></div></div>
      <div class="hrow"><div class="hbar energy"><span class="ico">⚡</span><div class="ebar"><i style="width:${pct}%"></i><b>${S.energy<S.maxEnergy?`+1 in ${nextEnergyIn()} · `:''}${S.energy} / ${S.maxEnergy} energy</b></div></div>
      <button class="hbar shrooms" id="getmore"><span class="ico m">${mushroomSVG('#b04fd6')}</span><b>${S.mush}</b><em class="gm">Get more</em></button></div>
    </div>`;
  $('#getmore').onclick=()=>openPanel('shop');
}

// ===== avatars =====
const SKINS=['#f6d7c3','#eec19f','#d9a074','#b97a4f','#8d5a36','#5e3b22'];
const HAIRC=['#2a1a12','#5a3a1e','#1a1a1a','#a0622a','#d8b25a','#3a2418'];
const SHIRTS=['#2f62d8','#e0475b','#30a05a','#f2a91a','#7a5ad8','#1f9e8f'];
const TRAINERS=[]; SKINS.forEach((s,k)=>{ TRAINERS.push({sex:'m',skin:s,hair:HAIRC[k],shirt:SHIRTS[k],style:k%3}); TRAINERS.push({sex:'f',skin:s,hair:HAIRC[(k+2)%6],shirt:SHIRTS[(k+3)%6],style:k%3}); });
function trainerSVG(i){
  const t=TRAINERS[i]||TRAINERS[0]; const ol='#2a1d16', sk=t.skin, h=t.hair, dk=shade(sk,-18);
  let back='', front='';
  if(t.sex==='f'){
    back = t.style===0?`<path d="M18 46 Q16 18 40 16 Q64 18 62 46 L64 74 Q52 68 50 56 L30 56 Q28 68 16 74Z" fill="${h}" stroke="${ol}" stroke-width="2"/>`
         : t.style===1?`<circle cx="40" cy="14" r="9" fill="${h}" stroke="${ol}" stroke-width="2"/><path d="M20 44 Q18 20 40 18 Q62 20 60 44Z" fill="${h}" stroke="${ol}" stroke-width="2"/>`
         : `<path d="M16 44 Q12 16 40 14 Q68 16 64 44 Q70 60 60 70 Q60 52 56 44 L24 44 Q20 52 20 70 Q10 60 16 44Z" fill="${h}" stroke="${ol}" stroke-width="2"/>`;
    front = t.style===1?`<path d="M23 36 Q26 22 40 22 Q54 22 57 36 Q48 28 40 30 Q32 28 23 36Z" fill="${h}"/>`:`<path d="M22 38 Q24 20 40 20 Q56 20 58 38 Q52 26 42 27 Q34 26 22 38Z" fill="${h}"/>`;
  } else {
    front = t.style===0?`<path d="M21 38 Q20 18 40 17 Q60 18 59 38 Q56 27 48 26 Q40 30 30 26 Q24 28 21 38Z" fill="${h}" stroke="${ol}" stroke-width="2"/>`
          : t.style===1?`<path d="M21 36 Q22 16 42 16 Q58 17 59 34 L56 30 Q50 22 40 24 Q30 23 24 32Z" fill="${h}" stroke="${ol}" stroke-width="2"/><path d="M40 16 Q46 10 52 14" stroke="${ol}" stroke-width="2" fill="${h}"/>`
          : `<path d="M22 34 Q24 20 40 20 Q56 20 58 34 Q50 27 40 28 Q30 27 22 34Z" fill="${h}" stroke="${ol}" stroke-width="2"/>`;
  }
  const beard = t.sex==='m'&&t.style===2?`<path d="M26 48 Q28 64 40 65 Q52 64 54 48 Q50 56 40 57 Q30 56 26 48Z" fill="${h}" opacity=".85"/>`:'';
  return `<svg viewBox="0 0 80 80"><defs><linearGradient id="avbg${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe14a"/><stop offset="1" stop-color="#f2a91a"/></linearGradient></defs>
    <rect width="80" height="80" fill="url(#avbg${i})"/>${back}
    <path d="M10 82 Q12 64 40 62 Q68 64 70 82Z" fill="${t.shirt}" stroke="${ol}" stroke-width="2"/><path d="M33 62 L40 70 L47 62" fill="none" stroke="#fff" stroke-width="2"/>
    <rect x="34" y="52" width="12" height="12" rx="4" fill="${dk}" stroke="${ol}" stroke-width="1.6"/>
    <ellipse cx="22" cy="42" rx="4" ry="5" fill="${sk}" stroke="${ol}" stroke-width="1.6"/><ellipse cx="58" cy="42" rx="4" ry="5" fill="${sk}" stroke="${ol}" stroke-width="1.6"/>
    <ellipse cx="40" cy="40" rx="17" ry="19" fill="${sk}" stroke="${ol}" stroke-width="2"/>${beard}
    <ellipse cx="33.5" cy="40" rx="2.4" ry="2.8" fill="#1c1410"/><ellipse cx="46.5" cy="40" rx="2.4" ry="2.8" fill="#1c1410"/><circle cx="34.3" cy="39" r=".8" fill="#fff"/><circle cx="47.3" cy="39" r=".8" fill="#fff"/>
    <path d="M30 34.5 Q33.5 32.5 37 34 M43 34 Q46.5 32.5 50 34.5" stroke="${shade(h,-10)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M40 41 Q38.5 46 41 46.5" stroke="${shade(sk,-35)}" stroke-width="1.3" fill="none"/>
    <path d="M34 50 Q40 55 46 50" stroke="${ol}" stroke-width="1.8" fill="${t.sex==='f'?'#c8505a':'none'}" stroke-linecap="round"/>
    ${front}</svg>`;
}
function sanitizeAv(a){ if(a&&a.t==='trainer') return {t:'trainer',i:Math.max(0,Math.min(TRAINERS.length-1,a.i|0))}; if(a&&a.t==='mon'&&SPI[a.sp]&&SPI[a.sp].fam!=='dummy') return {t:'mon',sp:a.sp,lvl:Math.max(1,Math.min(MAXLVL,a.lvl|0))}; return null; }
function myAvatar(){ const a=sanitizeAv(S.avatar); if(a) return a; const l=teamMons()[0]; return l?{t:'mon',sp:l.sp,lvl:l.lvl}:{t:'trainer',i:0}; }
function avatarSVG(a){ a=sanitizeAv(a)||{t:'trainer',i:0}; return a.t==='trainer'?trainerSVG(a.i):monSVG(a.sp,a.lvl); }
function avatarFor(b,side){
  if(B && side===B.mySide) return myAvatar();
  if(B && B.mode==='local'){ const m=b.sides[side].mons[0]; return {t:'mon',sp:m.sp,lvl:m.lvl}; }
  if(B && B.oppAvatar) return B.oppAvatar;
  const m=b.sides[side].mons[0]; return m?{t:'mon',sp:m.sp,lvl:m.lvl}:{t:'trainer',i:0};
}
function openAvatar(){
  let tab=(S.avatar&&S.avatar.t==='mon')?'mon':'trainer';
  const sh=sheet(`<div class="avpick"></div>`);
  const draw=()=>{
    const cur=myAvatar(); const seen=new Set();
    const mons=S.mons.slice().sort((a,b)=>b.lvl-a.lvl).filter(m=>{ const k=m.sp+':'+stageOf(m.lvl); if(seen.has(k)) return false; seen.add(k); return true; });
    sh.body.querySelector('.avpick').innerHTML=`<h2 class="game-h">Profile Picture</h2>
      <div class="stabs"><button class="stab ${tab==='trainer'?'on':''}" data-at="trainer">Trainers</button><button class="stab ${tab==='mon'?'on':''}" data-at="mon">Monsters</button></div>
      <div class="avgrid">${tab==='trainer'
        ? TRAINERS.map((t,i)=>`<button class="avo ${cur.t==='trainer'&&cur.i===i?'sel':''}" data-av='${JSON.stringify({t:'trainer',i})}'>${trainerSVG(i)}</button>`).join('')
        : mons.map(m=>`<button class="avo mon ${cur.t==='mon'&&cur.sp===m.sp&&stageOf(cur.lvl)===stageOf(m.lvl)?'sel':''}" data-av='${JSON.stringify({t:'mon',sp:m.sp,lvl:m.lvl})}'>${monSVG(m.sp,m.lvl)}</button>`).join('')}</div>`;
    sh.body.querySelectorAll('[data-at]').forEach(b=>b.onclick=()=>{ tab=b.dataset.at; draw(); });
    sh.body.querySelectorAll('[data-av]').forEach(b=>b.onclick=()=>{ S.avatar=JSON.parse(b.dataset.av); persist(); renderHUD(); NET.updatePresence&&NET.updatePresence(); draw(); });
  };
  draw();
}
const _renderHUD6=renderHUD;
renderHUD=function(){ _renderHUD6(); const av=document.querySelector('#hud .avatar'); if(av){ av.innerHTML=avatarSVG(myAvatar()); av.onclick=openAvatar; } };
