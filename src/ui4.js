// ===== V4: items, stat points, ability training, level-up =====
const ITEMS = {
  manawood:{n:'Mana Wood', cost:30, lv:1, b:{mp:7}},
  leaf:{n:'Hearty Leaf', cost:40, lv:1, b:{hp:10}},
  bone:{n:'Chew Bone', cost:40, lv:1, b:{atk:2}},
  feather:{n:'Lucky Feather', cost:90, lv:3, b:{atk:3,hp:6}},
  crystal:{n:'Mana Crystal', cost:160, lv:6, b:{mp:22}},
  ironshell:{n:'Iron Shell', cost:170, lv:6, b:{hp:32}},
  fang:{n:'Sharp Fang', cost:190, lv:8, b:{atk:6}},
  collar:{n:'Spiked Collar', cost:420, lv:12, b:{atk:8,hp:20}},
  crown:{n:'Golden Crown', cost:700, lv:16, b:{atk:10,hp:45}},
  orb:{n:'Storm Orb', cost:760, lv:18, b:{mp:55}},
  manabowl:{n:'Mana Bowl', cost:220, lv:4, b:{mp:8}, fx:{rmp:16}},
  lifebowl:{n:'Life Bowl', cost:220, lv:4, b:{hp:16}, fx:{rhp:14}},
  blade:{n:'Brute Blade', cost:300, lv:8, b:{}, fx:{dflat:7,tflat:3}}
};
const STAT_N={atk:'attack',hp:'life',mp:'mana',spd:'speed'};
function itemDesc(id){ const it=ITEMS[id], b=it.b||{}, f=it.fx||{}; const p=Object.keys(b).map(k=>`+${b[k]} ${STAT_N[k]}`);
  if(f.rmp) p.push(`recovers ${f.rmp} mana after each turn`); if(f.rhp) p.push(`recovers ${f.rhp} life after each turn`);
  if(f.dflat) p.push(`+${f.dflat} damage on every attack (not damage over time), but takes +${f.tflat} more damage`);
  return 'Gives your monster '+p.join(', '); }
function itemSVG(id){
  const P={
    manawood:'<rect x="12" y="10" width="40" height="46" rx="4" fill="#b08a5e" transform="rotate(-8 32 33)"/><path d="M18 18 H46 M16 30 H44 M18 44 H46" stroke="#8a6a42" stroke-width="1.5" transform="rotate(-8 32 33)"/><path d="M32 18c5 8 9 12 9 17a9 9 0 0 1-18 0c0-5 4-9 9-17z" fill="none" stroke="#2f8cff" stroke-width="4"/>',
    leaf:'<path d="M32 6c14 10 20 24 14 38-4 9-14 12-14 12S22 53 18 44C12 30 18 16 32 6z" fill="#d9532a"/><path d="M32 12v46M32 26l-8-6M32 26l8-6M32 38l-9-6M32 38l9-6" stroke="#7a2a12" stroke-width="2"/><circle cx="26" cy="20" r="2" fill="#ffcf4a"/><circle cx="38" cy="34" r="2.4" fill="#ffcf4a"/>',
    bone:'<path d="M18 44 44 18" stroke="#efe6d2" stroke-width="10" stroke-linecap="round"/><circle cx="14" cy="42" r="6" fill="#efe6d2"/><circle cx="20" cy="50" r="6" fill="#efe6d2"/><circle cx="44" cy="12" r="6" fill="#efe6d2"/><circle cx="52" cy="20" r="6" fill="#efe6d2"/>',
    feather:'<path d="M46 8C26 14 16 32 18 54l4 2C26 40 34 24 46 8z" fill="#7fd0ff"/><path d="M46 8 20 56" stroke="#2a7fb8" stroke-width="2"/>',
    crystal:'<path d="M32 4 46 22 32 60 18 22z" fill="#6fa8ff"/><path d="M32 4 38 22 32 60 26 22z" fill="#bcd8ff"/><path d="M18 22h28" stroke="#2f62d8" stroke-width="1.5"/>',
    ironshell:'<path d="M8 40Q8 12 32 12t24 28Z" fill="#9aa3ad"/><path d="M14 40 32 14 50 40M24 40 32 14 40 40" stroke="#5a636d" stroke-width="2" fill="none"/><rect x="6" y="40" width="52" height="8" rx="4" fill="#6a737d"/>',
    fang:'<path d="M22 8h20c0 18-4 34-10 48C26 42 22 26 22 8z" fill="#fffdf4" stroke="#c9bfa8" stroke-width="2"/>',
    collar:'<circle cx="32" cy="34" r="20" fill="none" stroke="#8a2a2a" stroke-width="8"/><path d="M32 6l3 8h-6zM56 34l-8 3v-6zM8 34l8-3v6zM32 62l-3-8h6z" fill="#d0d4da"/>',
    crown:'<path d="M10 46 8 18l13 12 11-18 11 18 13-12-2 28z" fill="#ffc83d" stroke="#b07a0a" stroke-width="2"/><circle cx="32" cy="36" r="4" fill="#e0475b"/><circle cx="20" cy="40" r="3" fill="#2f8cff"/><circle cx="44" cy="40" r="3" fill="#30c05a"/>',
    manabowl:'<path d="M8 30h48c0 14-10 24-24 24S8 44 8 30z" fill="#8a5a2b"/><ellipse cx="32" cy="30" rx="24" ry="6" fill="#2f8cff"/><ellipse cx="26" cy="29" rx="8" ry="2" fill="#bfe0ff"/>',
    lifebowl:'<path d="M8 30h48c0 14-10 24-24 24S8 44 8 30z" fill="#8a5a2b"/><ellipse cx="32" cy="30" rx="24" ry="6" fill="#e0475b"/><ellipse cx="26" cy="29" rx="8" ry="2" fill="#ffc0c8"/>',
    blade:'<path d="M44 6 52 12 24 44 18 40z" fill="#cfd6de" stroke="#5a636d" stroke-width="2"/><path d="M14 38l12 10-4 4-12-10z" fill="#8a5a2b"/><path d="M10 50l6 6" stroke="#5a3a1a" stroke-width="5" stroke-linecap="round"/>',
    orb:'<circle cx="32" cy="34" r="20" fill="#4a4aa8"/><path d="M34 18 26 34h8l-4 14 10-18h-8z" fill="#ffd84d"/><circle cx="26" cy="26" r="5" fill="#fff" opacity=".35"/>'
  };
  return `<svg viewBox="0 0 64 64">${P[id]||''}</svg>`;
}

// ===== monster model =====
function ensureMon(m){
  if(!m.pts){ m.pts={atk:0,hp:0,mp:0}; m.free=(m.free|0)||(m.lvl-1)*5; }
  if(!m.eq) m.eq=[null,null,null,null,null];
  if(!m.skl) m.skl={};
  return m;
}
function eqSlots(m){ return m.lvl>=20?5: m.lvl>=10?4:3; }
function monBonus(m){
  ensureMon(m); const b={atk:m.pts.atk*PT.atk, hp:m.pts.hp*PT.hp, mp:m.pts.mp*PT.mp, spd:0};
  m.eq.forEach(id=>{ if(id&&ITEMS[id]){ Object.entries(ITEMS[id].b||{}).forEach(([k,v])=>b[k]=(b[k]||0)+v); Object.entries(ITEMS[id].fx||{}).forEach(([k,v])=>b[k]=(b[k]||0)+v); } });
  return b;
}
function monStats(m){ const s=statsOf(m.sp,m.lvl), b=monBonus(m); return {hp:s.hp+b.hp, atk:s.atk+b.atk, mp:s.mp+b.mp, spd:Math.round((s.spd+b.spd)*10)/10}; }
function snapOf(m){ ensureMon(m); const skl={}; SPI[m.sp].sk.forEach(id=>skl[id]=m.skl[id]||1); return {sp:m.sp, lvl:m.lvl, uid:m.uid, bonus:monBonus(m), skl}; }
function mySnap(){ return teamMons().map(snapOf); }
function teamPower(){ return teamMons().reduce((t,m)=>{ const s=monStats(m); return t+Math.round(s.hp*0.4+s.atk*3); },0); }
function sanitizeTeam(t){ return (Array.isArray(t)?t:[]).slice(0,3).filter(m=>m&&SPI[m.sp]&&SPI[m.sp].fam!=='dummy').map(m=>{ const lvl=Math.max(1,Math.min(MAXLVL,m.lvl|0)); const b=m.bonus||{};
  const cl=(v,mx)=>Math.max(0,Math.min(mx,v|0)); const skl={}; Object.keys(m.skl||{}).forEach(k=>{ if(SK[k]) skl[k]=Math.max(1,Math.min(MAXSKL,m.skl[k]|0)); });
  const sk2={}; SPI[m.sp].sk.forEach(id=>sk2[id]=skl[id]||1); return {sp:m.sp, lvl, bonus:{atk:cl(b.atk,lvl*10+40), hp:cl(b.hp,lvl*40+160), mp:cl(b.mp,lvl*40+160), spd:Math.max(0,Math.min(5,+b.spd||0)), rmp:cl(b.rmp,80), rhp:cl(b.rhp,70), dflat:cl(b.dflat,35), tflat:cl(b.tflat,35)}, skl:sk2}; }); }
NET.challenge = function(cid){
  if(!S.team.length) return toast('Add a monster to your team');
  const matchId=uidGen()+uidGen();
  NET.pending={matchId,to:cid,t:setTimeout(()=>{ NET.pending=null; toast('No answer'); render(); },30000)};
  NET.room.emit('challenge',{to:cid, from:NET.cid, name:S.name, matchId, team:mySnap().map(({sp,lvl,bonus,skl})=>({sp,lvl,bonus,skl}))});
  toast('Challenge sent'); render();
};
const _showIncoming = NET.showIncoming;
NET.showIncoming = function(d){
  const team=sanitizeTeam(d.team); NET.incoming=d;
  const sh=sheet(`<h2>Challenge!</h2><p class="muted"><b>${esc(d.name||'A trainer')}</b> wants a 3v3 battle.</p><div class="stage-mons big">${team.map(m=>monSVG(m.sp,m.lvl)).join('')}</div>
    <div class="actions"><button class="btn gbtn" id="acc">Accept</button><button class="btn ghost" id="dec">Decline</button></div>`, {onClose:()=>{ if(NET.incoming===d){ NET.incoming=null; NET.room.emit('decline',{to:d.from, matchId:d.matchId}); } }});
  const t=setTimeout(()=>sh.close(),28000);
  sh.body.querySelector('#acc').onclick=()=>{ clearTimeout(t); NET.incoming=null; sh.close();
    if(!S.team.length){ toast('Add a monster to your team'); return; }
    NET.room.emit('accept',{to:d.from, from:NET.cid, name:S.name, matchId:d.matchId, team:mySnap().map(({sp,lvl,bonus,skl})=>({sp,lvl,bonus,skl}))});
    NET.startGuest(d); };
  sh.body.querySelector('#dec').onclick=()=>{ clearTimeout(t); sh.close(); };
};

let LVQ=[];
function giveXp(m, amt){
  ensureMon(m);
  if(m.lvl>=MAXLVL) return {lv:0,evo:false};
  const st0=stageOf(m.lvl), l0=m.lvl; m.xp+=amt;
  while(m.lvl<MAXLVL && m.xp>=xpNeed(m.lvl)){ m.xp-=xpNeed(m.lvl); m.lvl++; }
  if(m.lvl>=MAXLVL) m.xp=0;
  const gained=m.lvl-l0; if(gained>0){ m.free+=gained*5; if(!LVQ.includes(m.uid)) LVQ.push(m.uid); }
  const evo = stageOf(m.lvl)>st0; if(evo) S.stats.evolves++;
  return {lv:gained, evo};
}
function addMon(sp,lvl){ const m=ensureMon({uid:uidGen(), sp, lvl, xp:0}); m.free=(lvl-1)*5; S.mons.push(m); return m; }
function showLevelUps(){
  if(!LVQ.length) return;
  const uid=LVQ.shift(); const m=monBy(uid); if(!m) return showLevelUps();
  const sp=SPI[m.sp];
  const sh=sheet(`<div class="lvup"><div class="lvup-t">LEVEL UP!</div><div class="lvup-row"><div class="lvup-mon">${monSVG(m.sp,m.lvl)}</div><div><div class="lvup-l"><span class="lvb">${m.lvl}</span> Level ${m.lvl}</div><p>Your ${sp.n} leveled up! Open its profile to spend <b>${m.free} stat points</b>.</p></div></div>
    <button class="btn gbtn" id="vp">View profile</button></div>`,{cls:'reward lvl', onClose:()=>setTimeout(showLevelUps,250)});
  sh.body.querySelector('#vp').onclick=()=>{ sh.close(); LVQ=[]; setTimeout(()=>openMon(uid),300); };
}

// ===== profile =====
let MONSH=null;
function openMon(uid){
  const m=monBy(uid); if(!m) return; ensureMon(m);
  const sh=sheet(`<div class="prof"></div>`,{onClose:()=>{ if(MONSH&&MONSH.sh===sh) MONSH=null; render(); }});
  MONSH={sh,uid}; drawMon();
  if(S.tut===6){ setTimeout(()=>pointAt('.eslot.open'),400); }
  else if(m.free>0 && !S.tutPts && S.tut>=8){ S.tutPts=1; persist(); setTimeout(async()=>{ await lilaSay(["Each time your monster levels up, you get points to put into its stats.","You can also make its abilities stronger by training them right here in its profile."]); pointAt('.pbtn.plus'); },400); }
}
function upCost(sl){ return 40*sl*sl; }
function upNeed(sl){ return 3*sl-2; }
function drawMon(){
  if(!MONSH) return; const {sh,uid}=MONSH; const m=monBy(uid); if(!m){ sh.close(); return; }
  const sp=SPI[m.sp]; const fam=FAM[sp.fam]; const s=monStats(m); const base=statsOf(m.sp,m.lvl);
  const inTeam=S.team.includes(uid); const slots=slotsOf(m.lvl); const unlock=UNLOCK; const es=eqSlots(m);
  const stat=(k,label,val)=>`<div class="pstat"><span>${label}</span><b>${val}</b>${(m.free>0||m.pts[k]>0)&&k!=='spd'?`<div class="pbtns"><button class="pbtn minus" data-pm="${k}" ${m.pts[k]>0?'':'disabled'}>−</button><button class="pbtn plus" data-pp="${k}" ${m.free>0?'':'disabled'}>+</button></div>`:''}</div>`;
  sh.body.querySelector('.prof').innerHTML=`
    <div class="ptop"><div class="ppor" style="--c:${EL[fam.el].c}">${monSVG(m.sp,m.lvl)}</div>
      <div class="pinfo"><div class="pname"><span class="lvb">${m.lvl}</span>${sp.n}</div><span class="pstage">${STAGE_N[stageOf(m.lvl)].toLowerCase()} · ${fam.n} ${elChip(fam.el)}</span>
        <div class="pxp"><i style="width:${m.lvl>=MAXLVL?100:m.xp/xpNeed(m.lvl)*100}%"></i><em>${m.lvl>=MAXLVL?'MAX':`${m.xp} / ${xpNeed(m.lvl)} xp`}</em></div>
        ${m.free>0?`<div class="pfree">${m.free} points</div>`:''}
        ${stat('atk','Attack',s.atk)}${stat('hp','Life',s.hp)}${stat('mp','Mana',s.mp)}
      </div></div>
    ${m.lvl<20?`<p class="psmall">${m.lvl<10?'Evolves at Lv 10':'Evolves at Lv 20'} · each stat point: +2 attack, +8 life or +8 mana</p>`:''}
    <div class="eslots">${[0,1,2,3,4].map(i=>{ const id=m.eq[i]; if(i>=es) return `<div class="eslot lock"><span>🔒</span><em>Lv ${i===3?10:20}</em></div>`;
      return id?`<button class="eslot has" data-eq="${i}">${itemSVG(id)}</button>`:`<button class="eslot open" data-eq="${i}"><span>Equip<br>item</span></button>`; }).join('')}</div>
    <h3 class="ph">Abilities ${sp.sk.slice(0,slots).some(id=>{ const sl=m.skl[id]||1; return sl<MAXSKL && m.lvl>=upNeed(sl+1); })?'<span class="upav">(Upgrades available)</span>':''}</h3>
    <div class="pabil">${sp.sk.map((id,i)=>{ const k=SK[id]; const locked=i>=slots; const sl=m.skl[id]||1; const canUp=!locked&&sl<MAXSKL&&m.lvl>=upNeed(sl+1); const pas=k.k==='passive'; const c=skCost(id,sl);
      return `<div class="pab ${locked?'locked':''} ${pas?'pas':''}">${icon(skIconKey(id),EL[k.el].c,40)}<div class="pab-t"><b>${k.n} ${locked?'':`<span class="sl">Lv ${sl}</span>`}${pas?' <span class="pastag">Passive</span>':''}</b><span>${locked?`Unlocks at Lv ${unlock[i]}`:skillDesc(id,sl)}${!locked&&!pas&&c?` · ${c} mana`:''}</span></div>
        ${locked?'':sl>=MAXSKL?'<span class="maxed">MAX</span>':`<button class="upb" data-up="${id}" ${canUp?'':'disabled'}>${canUp?`Train<br><small>$${upCost(sl)}</small>`:`<small>Lv ${upNeed(sl+1)}</small>`}</button>`}</div>`; }).join('')}</div>
    <div class="actions" id="tact"></div>`;
  const b=sh.body;
  b.querySelectorAll('[data-pp]').forEach(x=>x.onclick=()=>{ if(m.free<=0) return; m.free--; m.pts[x.dataset.pp]++; persist(); drawMon(); renderHUD(); if(TASKSH) drawTasks(); });
  b.querySelectorAll('[data-pm]').forEach(x=>x.onclick=()=>{ const k=x.dataset.pm; if(m.pts[k]<=0) return; m.pts[k]--; m.free++; persist(); drawMon(); if(TASKSH) drawTasks(); });
  b.querySelectorAll('[data-eq]').forEach(x=>x.onclick=()=>pickItem(m,+x.dataset.eq));
  b.querySelectorAll('[data-up]').forEach(x=>x.onclick=()=>{ const id=x.dataset.up; const sl=m.skl[id]||1; const c=upCost(sl); if((S.cash|0)<c) return toast(`You need $${c}`); S.cash-=c; m.skl[id]=sl+1; persist(); drawMon(); renderHUD(); toast(`${SK[id].n} is now Lv ${sl+1}!`); });
  const tact=b.querySelector('#tact');
  if(inTeam){ tact.innerHTML=`<button class="btn ghost" id="rm" ${S.team.length<=1?'disabled':''}>Remove from team</button>`; tact.querySelector('#rm').onclick=()=>{ S.team=S.team.filter(x=>x!==uid); persist(); drawMon(); render(); }; }
  else if(S.team.length<3){ tact.innerHTML=`<button class="btn gbtn" id="add">Add to team</button>`; tact.querySelector('#add').onclick=()=>{ S.team.push(uid); persist(); drawMon(); render(); }; }
  else { tact.innerHTML=`<p class="muted small">Swap into your team:</p><div class="swap">${teamMons().map(t=>`<button class="btn ghost sm" data-sw="${t.uid}">Replace ${SPI[t.sp].n}</button>`).join('')}</div>`;
    tact.querySelectorAll('[data-sw]').forEach(x=>x.onclick=()=>{ S.team=S.team.map(y=>y===x.dataset.sw?uid:y); persist(); drawMon(); render(); }); }
}
function pickItem(m,slot){
  S.inv=S.inv||{}; const cur=m.eq[slot];
  const ids=Object.keys(S.inv).filter(id=>S.inv[id]>0&&ITEMS[id]);
  let sel=cur||null;
  const sh=sheet(`<div class="picker"><button class="shopbanner" id="toshop">Tap here to visit the shop ${mushroomSVG('#b04fd6')}</button>
    <div class="pgrid">${ids.map(id=>`<button class="pitem ${sel===id?'sel':''}" data-pi="${id}">${itemSVG(id)}<b>${ITEMS[id].n}</b><span>${itemDesc(id).replace('Gives your monster ','')}</span><em>x${S.inv[id]}</em>${ITEMS[id].lv>m.lvl?`<i class="need">Lv ${ITEMS[id].lv}</i>`:''}</button>`).join('')}
      ${cur?`<button class="pitem ${sel===null?'sel':''}" data-pi="">${'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="none" stroke="#e57373" stroke-width="6"/><path d="M16 48 48 16" stroke="#e57373" stroke-width="6"/></svg>'}<b>Unequip</b><span>Take it off</span></button>`:''}
      ${!ids.length&&!cur?'<p class="muted center" style="grid-column:1/-1">You don\'t have any items yet.</p>':''}</div>
    <div class="actions"><button class="btn gbtn" id="psel">Select</button></div></div>`);
  sh.body.querySelectorAll('[data-pi]').forEach(x=>x.onclick=()=>{ sel=x.dataset.pi||null; sh.body.querySelectorAll('[data-pi]').forEach(y=>y.classList.toggle('sel',y===x)); });
  sh.body.querySelector('#toshop').onclick=()=>{ sh.close(); MONSH&&MONSH.sh.close(); openShop({m,slot}); };
  sh.body.querySelector('#psel').onclick=()=>{
    if(sel && ITEMS[sel].lv>m.lvl) return toast(`Needs Lv ${ITEMS[sel].lv}`);
    if(sel===cur){ sh.close(); return; }
    if(cur) S.inv[cur]=(S.inv[cur]|0)+1;
    if(sel){ S.inv[sel]--; }
    m.eq[slot]=sel; persist(); sh.close(); drawMon(); renderHUD(); if(TASKSH) drawTasks();
    if(S.tut===6 && sel){ S.tut=7; persist(); setTimeout(async()=>{ await lilaSay(["Now that the mana wood is equipped, let's head back to Training Camp!"]); S.tut=8; persist(); MONSH&&MONSH.sh.close(); setTimeout(()=>pointAt('[data-p="zones"]'),350); },350); }
  };
}

// ===== shop =====
let SHOPTAB='items', SHOPSEL=null;
function viewShop(){
  const tabs=[['items','Items'],['eggs','Eggs'],['energy','Energy']];
  let body='';
  if(SHOPTAB==='items'){
    S.inv=S.inv||{};
    const sel=SHOPSEL&&ITEMS[SHOPSEL]?SHOPSEL:'manawood'; const it=ITEMS[sel];
    body=`<div class="shelf">${Object.keys(ITEMS).map(id=>`<button class="sitem ${id===sel?'sel':''} ${ITEMS[id].lv>highLvl()?'dim':''}" data-si="${id}">${itemSVG(id)}<span><b class="g">$</b> ${ITEMS[id].cost}</span></button>`).join('')}</div>
      <div class="sdetail"><div class="sd-h"><b>${it.n}</b><span>Inventory: x${S.inv[sel]|0}</span></div>
        <div class="sd-r"><span class="sd-c"><b class="g">$</b> ${it.cost}</span><span>Requires level: ${it.lv}</span><button class="buyb" id="buy" data-buy="${sel}">BUY</button></div>
        <p>${itemDesc(sel)}</p></div>`;
  } else if(SHOPTAB==='eggs'){
    body=`<button class="hatch" id="hatch"><div class="egg"></div><div><b>Mystery egg</b><span>Hatches a random monster</span></div><span class="price">10 🍄</span></button>
      <button class="hatch" id="hatchc"><div class="egg plain"></div><div><b>Monster egg</b><span>A random monster, a few levels lower</span></div><span class="price g">$${eggCost()}</span></button>`;
  } else {
    body=`<button class="hatch" id="refill"><div class="egg bolt">⚡</div><div><b>Energy refill</b><span>Fill your energy to max</span></div><span class="price">15 🍄</span></button>
      <p class="muted small center">Energy refills by 1 every 2 minutes. Finishing every quest raises your max energy.</p>`;
  }
  return `<h1>Shop</h1><div class="stabs">${tabs.map(([k,n])=>`<button class="stab ${SHOPTAB===k?'on':''}" data-st="${k}">${n}</button>`).join('')}</div>${body}
    <p class="muted small center">You have $${S.cash|0} and ${S.mush} 🍄</p>`;
}
function buyItem(id){
  const it=ITEMS[id]; if(!it) return;
  if(it.lv>highLvl()) return toast(`Requires a Lv ${it.lv} monster`);
  if((S.cash|0)<it.cost) return toast(`You need $${it.cost}`);
  S.cash-=it.cost; S.inv=S.inv||{}; S.inv[id]=(S.inv[id]|0)+1; persist(); render(); toast(`Bought ${it.n}!`);
  if(S.tut===5 && id==='manawood'){ S.tut=6; persist(); setTimeout(async()=>{ await lilaSay(["Now that you have a piece of mana wood, let's equip it on your monster!","Tap your monster in the meadow to open its profile."]); PANEL&&PANEL.sh.close(); setTimeout(()=>pointAt('.pet'),350); },300); }
}
function bindView(v){
  v=v||document;
  v.querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>openZone(+b.dataset.zone));
  v.querySelectorAll('[data-mon]').forEach(b=>b.onclick=()=>openMon(b.dataset.mon));
  v.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>claim(b.dataset.q));
  v.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>NET.challenge(b.dataset.ch));
  v.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{ SHOPTAB=b.dataset.st; render(); });
  v.querySelectorAll('[data-si]').forEach(b=>b.onclick=()=>{ SHOPSEL=b.dataset.si; render(); });
  const bu=$('#buy',v); if(bu) bu.onclick=()=>buyItem(bu.dataset.buy);
  const h=$('#hatch',v); if(h) h.onclick=hatch;
  const hc=$('#hatchc',v); if(hc) hc.onclick=hatchCash;
  const rf=$('#refill',v); if(rf) rf.onclick=()=>{ tickEnergy(); if(S.energy>=S.maxEnergy) return toast('Energy is already full'); if(S.mush<15) return toast('You need 15 🍄'); S.mush-=15; S.energy=S.maxEnergy; S.energyAt=Date.now(); persist(); render(); toast('Energy refilled!'); };
  const r=$('#rival',v); if(r) r.onclick=()=>{ if(!S.team.length) return toast('Add a monster to your team'); if(!spend(1)) return; persist(); startBattle({mode:'rival', foe:rivalTeam()}); };
  const l=$('#local',v); if(l) l.onclick=openLocal;
}
function openPanel(name){
  if(name==='monsters') return openTeam();
  if(PANEL) PANEL.sh.close();
  if(name==='shop' && S.tut===5){ SHOPTAB='items'; SHOPSEL='manawood'; }
  const sh=sheet(PANELS[name](),{cls:'panel', onClose:()=>{ if(PANEL&&PANEL.sh===sh) PANEL=null; }});
  PANEL={name, sh}; TAB=name==='battle'?'arena':name; bindView(sh.body);
  if(name==='shop' && S.tut===5) setTimeout(()=>pointAt('#buy'),400);
}
function hatch(){
  if(S.mush<10){ toast('You need 10 🍄'); return; }
  S.mush-=10; S.stats.hatches++;
  const sp=SP[Math.floor(Math.random()*SP.length)]; const m=addMon(sp.id,Math.max(1,Math.floor(highLvl()*0.6)));
  if(S.team.length<3) S.team.push(m.uid);
  persist(); render(); reveal(m,'Your egg hatched!');
}

// ===== tutorial step after activities =====
function afterTaskTut(){
  if(S.tut===3){ setTimeout(async()=>{ await lilaSay(["Great! Your monster is getting stronger.","Now let's try a practice battle against the straw dummy!"]); pointAt('[data-task="1"]'); },250); return showLevelUps(); }
  if(S.tut===8){ S.tut=99; persist(); setTimeout(async()=>{ await lilaSay(["Now you know how to train! Finish Training Camp and beat my graduation match — then you're on your way to becoming a master trainer!"]); showLevelUps(); },250); return; }
  showLevelUps();
}

// ===== boot =====
async function boot(){
  S = Object.assign(freshSave(), loadLocal()||{});
  S.stats=Object.assign(freshSave().stats, S.stats||{});
  if(S.cash==null) S.cash=50; if(S.tut==null) S.tut = S.name?99:0; S.inv=S.inv||{};
  S.mons.forEach(ensureMon);
  document.querySelectorAll('#bar [data-p]').forEach(b=>b.onclick=()=>openPanel(b.dataset.p));
  render();
  setInterval(()=>{ if(!S) return; const e=S.energy; tickEnergy(); if(e!==S.energy) persist(); if(!B){ renderHUD(); } },1000);
  initDb().then(()=>{ S.mons.forEach(ensureMon); if(S.cash==null) S.cash=50; S.inv=S.inv||{}; });
  NET.init();
  await splash();
  if(!S.name) onboarding();
}
boot();
