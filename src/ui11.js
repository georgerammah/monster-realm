// ===== V11: permanent SWAP button + centered "Choose Your Next Monster!" =====
const SWAP_SVG=`<svg viewBox="0 0 60 60"><path d="M14 26a17 17 0 0 1 29-11l4-4v14H33l5-5a11 11 0 0 0-18 6z" fill="#7dff3a" stroke="#1a5a08" stroke-width="2.5" stroke-linejoin="round"/><path d="M46 34a17 17 0 0 1-29 11l-4 4V35h14l-5 5a11 11 0 0 0 18-6z" fill="#ffd60a" stroke="#6a4a00" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
hudSingle=function(b, side, right, ctx){
  const sd=b.sides[side]; const m=sd.mons[sd.active];
  const pv=m&&ctx.prev&&ctx.prev[side+'-'+sd.active]; const hp=m?(pv?pv.hp:m.hp):0, mp=m?(pv?pv.mp:m.mp):0;
  const mine=side===B.mySide && B.mode!=='local' || (B.mode==='local' && actor(b) && actor(b).s===side);
  const canSwap = m && myInput() && b.phase==='fight' && actor(b) && actor(b).s===side && benchOf(b,side).length>0;
  const por = (!right) ? `<button class="bpor tr swapper ${canSwap?'swap':'nos'}" ${canSwap?'id="swapb"':''}>${SWAP_SVG}<span>SWAP!</span></button>`
                       : `<div class="bpor tr">${avatarSVG(avatarFor(b,side))}</div>`;
  return `<div class="bhp ${right?'r':''}" data-hs="${side}" data-hi="${sd.active==null?0:sd.active}">${por}
    <div class="bbars"><div class="lb life"><i style="width:${m?hp/m.maxhp*100:0}%"></i><b>${hp} / ${m?m.maxhp:0} life</b></div>
    <div class="lb mana"><i style="width:${m?mp/m.maxmp*100:0}%"></i><b>${mp} / ${m?m.maxmp:0} mana</b></div></div>
    <div class="bdots">${sd.mons.map((x,i)=>`<i class="${x.hp<=0?'ko':i===sd.active?'on':''}"></i>`).join('')}</div>${hudIcons(m)}</div>`;
};
openPick=function(side, swap){
  closePick(); const b=B.b; const sd=b.sides[side];
  const list=benchOf(b,side);
  const first=b.phase==='pick' && !sd.mons.some(x=>x.hp<x.maxhp) && sd.active==null;
  const w=document.createElement('div'); w.className='pk-wrap';
  w.innerHTML=`<div class="pk"><div class="pk-t">${B.mode==='local'?esc(sd.name)+': ':''}${first?'Pick Your Monster!':'Choose Your Next Monster!'}</div>
    <div class="pk-row n${list.length}">${list.map(i=>{ const m=sd.mons[i];
      return `<button class="pk-m" data-pk="${i}">${monSVG(m.sp,m.lvl)}<span>${m.n}</span><i style="width:${m.hp/m.maxhp*100}%"></i></button>`; }).join('')}</div>
    ${swap?'<button class="pk-x" id="pkx">Cancel</button>':'<div class="pk-bar"><i></i></div>'}</div>`;
  document.body.appendChild(w); PICKEL=w;
  w.querySelectorAll('[data-pk]').forEach(btn=>btn.onclick=()=>{ const i=+btn.dataset.pk; closePick();
    if(swap){ showGo(sd.mons[i],()=>{ if(B.net&&B.net.role==='guest'){ NET.sendAction({swap:i}); renderBattle(); return; } act(b,{swap:i}); afterAct(); }); }
    else doPick(i); });
  const x=w.querySelector('#pkx'); if(x) x.onclick=closePick;
};

// ===== item slots 4 & 5 unlock with mushrooms =====
const SLOT_COST=[0,0,0,25,50];
eqSlots=function(m){ ensureMon(m); return 3+((m.slotU|0)); };
function unlockSlot(m){
  const i=eqSlots(m); if(i>=5) return; const c=SLOT_COST[i];
  const sh=sheet(`<div class="center"><h2 class="game-h">Unlock item slot ${i+1}?</h2><p class="muted">Gives ${SPI[m.sp].n} another item slot, forever.</p>
    <div class="unl-cost">${mushroomSVG('#b04fd6')}<b>${c}</b></div><p class="muted small">You have ${S.mush} 🍄</p>
    <div class="actions"><button class="btn gbtn" id="unl" ${S.mush<c?'disabled':''}>${S.mush<c?'Not enough mushrooms':'Unlock'}</button>${S.mush<c?'<button class="btn ghost" id="unlshop">Get more mushrooms</button>':''}</div></div>`);
  const u=sh.body.querySelector('#unl'); if(u) u.onclick=()=>{ if(S.mush<c) return; S.mush-=c; m.slotU=(m.slotU|0)+1; persist(); sh.close(); renderHUD(); drawMon(); toast(`Slot ${i+1} unlocked!`); };
  const g=sh.body.querySelector('#unlshop'); if(g) g.onclick=()=>{ sh.close(); MONSH&&MONSH.sh.close(); openPanel('shop'); };
}
const _drawMon11=drawMon;
drawMon=function(){
  _drawMon11(); if(!MONSH) return; const m=monBy(MONSH.uid); if(!m) return;
  const es=eqSlots(m);
  MONSH.sh.body.querySelectorAll('.eslot.lock').forEach((el,k)=>{ const idx=es+k; const next=idx===es;
    el.innerHTML=`<span class="ul-m">${mushroomSVG('#b04fd6')}</span><em>${SLOT_COST[idx]}</em>`; el.classList.toggle('next',next);
    if(next){ el.style.cursor='pointer'; el.onclick=()=>unlockSlot(m); } });
};
const _ensure11=ensureMon; ensureMon=function(m){ _ensure11(m); m.xp=m.xp|0; return m; };
if(typeof S!=='undefined'&&S&&S.mons) S.mons.forEach(ensureMon);
document.addEventListener('pointerdown',e=>{
  const a=e.target.closest&&e.target.closest('#bauto,.autob'); if(!a||!B) return;
  e.preventDefault(); e.stopPropagation(); B.auto=!B.auto; drive();
},true);
document.addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('#bauto,.autob')){ e.preventDefault(); e.stopPropagation(); } },true);
