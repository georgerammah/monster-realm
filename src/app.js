// ===== GAME CONFIG =====
const ZONES = [
  {id:'meadow', n:'Training Camp', fam:'bug', lv:1, sizes:[1,1,2,2], c:'#7ccf6a'},
  {id:'beach', n:'Coral Beach', fam:'shell', lv:4, sizes:[2,3,3,3], c:'#4fb3ff'},
  {id:'desert', n:'Dune Desert', fam:'volt', lv:8, sizes:[2,3,3,3], c:'#f2c14e'},
  {id:'hollow', n:'Ashen Woods', fam:'hound', lv:12, sizes:[3,3,3,3], c:'#c97a4a'},
  {id:'volcano', n:'Ember Volcano', fam:'drake', lv:16, sizes:[3,3,3,3], c:'#ff6a3d'},
  {id:'peaks', n:'Sky Peaks', fam:'wing', lv:21, sizes:[3,3,3,3], c:'#7fb8ff'}
];
const STAGE_LABEL = ['Path','Grove','Ridge','Boss'];
const ENERGY_REGEN = 120000; // 2 min
const QUESTS = [
  {id:'q1', n:'Win your first battle', r:5, ok:s=>s.stats.wins>=1},
  {id:'q2', n:'Build a full team of 3', r:5, ok:s=>s.team.length>=3},
  {id:'q3', n:'Clear Coral Beach', r:10, ok:s=>(s.zones.beach||0)>=4},
  {id:'q4', n:'Hatch a monster', r:5, ok:s=>s.stats.hatches>=1},
  {id:'q5', n:'Evolve a monster', r:10, ok:s=>s.stats.evolves>=1},
  {id:'q6', n:'Win 10 battles', r:10, ok:s=>s.stats.wins>=10},
  {id:'q7', n:'Win an arena match', r:10, ok:s=>s.stats.arenaWins>=1},
  {id:'q8', n:'Own 10 monsters', r:15, ok:s=>s.mons.length>=10},
  {id:'q9', n:'Raise a monster to Lv 20', r:15, ok:s=>s.mons.some(m=>m.lvl>=20)},
  {id:'q10', n:'Clear Sky Peaks', r:25, ok:s=>(s.zones.peaks||0)>=4}
];

// ===== HELPERS =====
const $ = (q,r=document)=>r.querySelector(q);
const esc = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uidGen = ()=>Math.random().toString(36).slice(2,10);
function seeded(seed){ const o={rng:seed|0}; return ()=>rnd(o); }
function hashStr(s){ let h=2166136261; for(const ch of s){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619);} return h|0; }
function toast(t){ const el=$('#toast'); el.textContent=t; el.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove('show'),2200); }
function elChip(el){ return `<span class="chip" style="--c:${EL[el].c}">${EL[el].n}</span>`; }
function bar(v,max,cls){ const p=Math.max(0,Math.min(100,v/max*100)); return `<div class="bar ${cls}"><i style="width:${p}%"></i></div>`; }

// ===== SAVE =====
let S = null;
function freshSave(){ return {v:1, name:'', mons:[], team:[], mush:10, energy:20, maxEnergy:20, energyAt:Date.now(), zones:{}, quests:{}, bonus:false, stats:{wins:0,arenaWins:0,pvpWins:0,evolves:0,hatches:0}, savedAt:0}; }
const LS_KEY='mk-remake-save';
let DB={ref:null, writing:false, dirty:false};
function loadLocal(){ try{ const t=localStorage.getItem(LS_KEY); return t?JSON.parse(t):null; }catch(e){ return null; } }
function persist(){
  S.savedAt=Date.now();
  try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){}
  clearTimeout(persist._t); persist._t=setTimeout(dbWrite, 800);
}
async function dbWrite(){
  if(!DB.ref) return;
  if(DB.writing){ DB.dirty=true; return; }
  DB.writing=true;
  try{ await DB.ref.set({v:1, savedAt:S.savedAt, save:JSON.stringify(S)}); }catch(e){}
  DB.writing=false;
  if(DB.dirty){ DB.dirty=false; dbWrite(); }
}
function parseDoc(r){
  try{
    if(!r) return null;
    let d = typeof r.data==='function' ? r.data() : r;
    if(d && !d.save && d.data && d.data.save) d=d.data;
    return d && d.save ? JSON.parse(d.save) : null;
  }catch(e){ return null; }
}
function withTimeout(p,ms){ return Promise.race([p, new Promise((_,rej)=>setTimeout(()=>rej('timeout'),ms))]); }
async function initDb(){
  try{
    if(!window.claude || !window.claude.use) return;
    const db = await window.claude.use('db'); const user = await window.claude.use('user');
    if(!db || !user) return;
    const id = await user.id(); if(!id) return;
    DB.ref = db.collection('data/users/'+id).doc('save');
    const remote = parseDoc(await withTimeout(DB.ref.get(), 10000));
    if(remote && (!S || !S.name || (remote.savedAt||0) > (S.savedAt||0))){
      S = Object.assign(freshSave(), remote);
      try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){}
      closeAllSheets(); render();
      if(!S.name) onboarding();
      NET.updatePresence && NET.updatePresence();
    } else if(S && S.name) dbWrite();
  }catch(e){}
}

// ===== ENERGY =====
function tickEnergy(){
  const now=Date.now();
  if(S.energy>=S.maxEnergy){ S.energyAt=now; return; }
  const g=Math.floor((now-S.energyAt)/ENERGY_REGEN);
  if(g>0){ S.energy=Math.min(S.maxEnergy,S.energy+g); S.energyAt+=g*ENERGY_REGEN; if(S.energy>=S.maxEnergy) S.energyAt=now; }
}
function nextEnergyIn(){ const ms=ENERGY_REGEN-(Date.now()-S.energyAt); const s=Math.max(0,Math.ceil(ms/1000)); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
function spend(n){ tickEnergy(); if(S.energy<n){ toast(`Not enough energy · +1 in ${nextEnergyIn()}`); return false; } if(S.energy>=S.maxEnergy) S.energyAt=Date.now(); S.energy-=n; return true; }

// ===== MONSTERS =====
function addMon(sp,lvl){ const m={uid:uidGen(), sp, lvl, xp:0}; S.mons.push(m); return m; }
function monBy(uid){ return S.mons.find(m=>m.uid===uid); }
function teamMons(){ return S.team.map(monBy).filter(Boolean); }
function highLvl(){ return S.mons.reduce((a,m)=>Math.max(a,m.lvl),1); }
function teamPower(){ return teamMons().reduce((t,m)=>t+power(m.sp,m.lvl),0); }
function giveXp(m, amt){
  if(m.lvl>=MAXLVL) return {lv:0,evo:false};
  const st0=stageOf(m.lvl), l0=m.lvl; m.xp+=amt;
  while(m.lvl<MAXLVL && m.xp>=xpNeed(m.lvl)){ m.xp-=xpNeed(m.lvl); m.lvl++; }
  if(m.lvl>=MAXLVL) m.xp=0;
  const evo = stageOf(m.lvl)>st0; if(evo) S.stats.evolves++;
  return {lv:m.lvl-l0, evo};
}

// ===== SHEETS =====
function sheet(html, opts={}){
  const wrap=document.createElement('div'); wrap.className='sheet-wrap';
  wrap.innerHTML=`<div class="sheet-bg"></div><div class="sheet ${opts.cls||'panel'}">${opts.locked?'':'<button class="sheet-x" aria-label="Close">✕</button>'}<div class="sheet-body">${html}</div></div>`;
  $('#sheets').appendChild(wrap);
  const panel=wrap.querySelector('.sheet');
  requestAnimationFrame(()=>requestAnimationFrame(()=>wrap.classList.add('open')));
  let closed=false;
  const close=()=>{ if(closed) return; closed=true; wrap.classList.remove('open'); panel.style.transform=''; setTimeout(()=>wrap.remove(),300); opts.onClose&&opts.onClose(); };
  wrap.close=close;
  if(!opts.locked){
    wrap.querySelector('.sheet-bg').onclick=close;
    wrap.querySelector('.sheet-x').onclick=close;
  }
  if(!opts.locked && opts.drag){
    let x0=null,y0=0,dx=0,drag=false;
    panel.addEventListener('pointerdown',e=>{ if(e.target.closest('input,textarea')) return; x0=e.clientX; y0=e.clientY; dx=0; drag=false; });
    panel.addEventListener('pointermove',e=>{
      if(x0===null) return; const ddx=e.clientX-x0, ddy=e.clientY-y0;
      if(!drag && ddx>10 && Math.abs(ddx)>Math.abs(ddy)*1.2){ drag=true; panel.classList.add('dragging'); try{panel.setPointerCapture(e.pointerId);}catch(_){} }
      if(drag){ dx=Math.max(0,ddx); panel.style.transform=`translateX(${dx}px)`; e.preventDefault(); }
    });
    const end=()=>{ if(x0===null) return; x0=null; panel.classList.remove('dragging'); if(drag){ if(dx>90) close(); else panel.style.transform=''; } drag=false; };
    panel.addEventListener('pointerup',end); panel.addEventListener('pointercancel',end);
    panel.addEventListener('click',e=>{ if(drag||dx>10){ e.stopPropagation(); e.preventDefault(); dx=0; } },true);
  }
  return {body:wrap.querySelector('.sheet-body'), close};
}
function closeAllSheets(){ document.querySelectorAll('.sheet-wrap').forEach(w=>w.close&&w.close()); }

// ===== RENDER: SHELL =====
let TAB='map';
function render(){
  if(!S) return;
  tickEnergy();
  renderTop();
  const v=$('#view');
  v.innerHTML = TAB==='map'?viewMap(): TAB==='team'?viewTeam(): TAB==='arena'?viewArena(): viewQuests();
  bindView();
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on', b.dataset.tab===TAB));
  const qn = QUESTS.filter(q=>!S.quests[q.id] && q.ok(S)).length;
  const badge=$('#qbadge'); badge.textContent=qn; badge.style.display=qn?'':'none';
}
function renderTop(){
  $('#top').innerHTML = `<div class="who"><b>${esc(S.name||'Trainer')}</b><span>Power ${teamPower()}</span></div>
    <div class="pills"><span class="pill" id="enpill">⚡ ${S.energy}/${S.maxEnergy}${S.energy<S.maxEnergy?`<small>${nextEnergyIn()}</small>`:''}</span><span class="pill">🍄 ${S.mush}</span></div>`;
}

// ===== MAP =====
function zoneUnlocked(i){ return i===0 || (S.zones[ZONES[i-1].id]||0)>=4; }
function viewMap(){
  return `<h1>World Map</h1><div class="zones">${ZONES.map((z,i)=>{
    const done=S.zones[z.id]||0, open=zoneUnlocked(i); const rep=SP.filter(s=>s.fam===z.fam)[0];
    return `<button class="zone ${open?'':'locked'}" data-zone="${i}" style="--zc:${z.c}">
      <div class="zone-art">${monSVG(rep.id, done>=4?20:1)}</div>
      <div class="zone-info"><b>${z.n}</b><span>${FAM[z.fam].n} · Lv ${z.lv}+</span>
      <div class="dots">${[0,1,2,3].map(s=>`<i class="${s<done?'on':''} ${s===3?'boss':''}"></i>`).join('')}</div></div>
      <div class="zone-go">${open?(done>=4?'✓':'›'):'🔒'}</div></button>`; }).join('')}</div>`;
}
function stageTeam(zi, s){
  const z=ZONES[zi]; const r=seeded(hashStr(z.id+s)); const fam=SP.filter(x=>x.fam===z.fam);
  const n=z.sizes[s]; const lvl=z.lv+s+(s===3?2:0); const mons=[];
  for(let k=0;k<n;k++){
    let pool=fam; if(s>=2 && k===n-1 && zi>0){ pool=SP.filter(x=>x.fam!==z.fam); }
    mons.push({sp:pool[Math.floor(r()*pool.length)].id, lvl: Math.max(1, lvl - (k&&s<3?1:0)), hpMul: zi===0?[0.6,0.7,0.75,0.85][s]:undefined});
  }
  return {name: s===3?`${z.n} Boss`:'Wild monsters', mons};
}
function openZone(zi){
  const z=ZONES[zi];
  if(!zoneUnlocked(zi)){ toast(`Clear ${ZONES[zi-1].n} first`); return; }
  const done=S.zones[z.id]||0;
  const sh=sheet(`<h2>${z.n}</h2><p class="muted">Home of the ${FAM[z.fam].n}. Beat the boss to befriend one.</p>
    <div class="stages">${[0,1,2,3].map(s=>{ const t=stageTeam(zi,s); const open=s<=done;
      return `<div class="stage ${open?'':'locked'}"><div class="stage-mons">${t.mons.map(m=>monSVG(m.sp,m.lvl)).join('')}</div>
      <div class="stage-info"><b>${s===3?'Boss':STAGE_LABEL[s]} ${s<done?'<span class="ok">✓</span>':''}</b><span>${t.mons.length}× · Lv ${Math.min(...t.mons.map(m=>m.lvl))}–${Math.max(...t.mons.map(m=>m.lvl))}</span></div>
      <button class="btn sm" data-stage="${s}" ${open?'':'disabled'}>Battle · 2⚡</button></div>`; }).join('')}</div>`);
  sh.body.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{
    if(!S.team.length){ toast('Add a monster to your team'); return; }
    if(!spend(2)){ return; }
    persist(); sh.close(); const s=+b.dataset.stage;
    startBattle({mode:'campaign', foe:stageTeam(zi,s), meta:{zi,s}});
  });
}

// ===== TEAM =====
function monCard(m, extra){
  const sp=SPI[m.sp];
  return `<button class="mcard" data-mon="${m.uid}">${monSVG(m.sp,m.lvl)}<b>${sp.n}</b><span>Lv ${m.lvl} · ${STAGE_N[stageOf(m.lvl)]}</span>${extra||''}<i class="eldot" style="background:${EL[FAM[sp.fam].el].c}"></i></button>`;
}
function viewTeam(){
  const tm=teamMons();
  const slots=[0,1,2].map(i=>tm[i]?monCard(tm[i],'<em class="tslot">'+(i+1)+'</em>'):`<div class="mcard empty"><span>Empty slot</span></div>`).join('');
  const rest=S.mons.filter(m=>!S.team.includes(m.uid)).sort((a,b)=>b.lvl-a.lvl);
  return `<h1>Monsters</h1><div class="sec-h"><h3>Team</h3><span class="muted">Power ${teamPower()}</span></div>
    <div class="grid3">${slots}</div>
    <button class="hatch" id="hatch"><div class="egg"></div><div><b>Hatch a random monster</b><span>10 🍄 · You have ${S.mush}</span></div><span class="zone-go">›</span></button>
    <div class="sec-h"><h3>Collection</h3><span class="muted">${new Set(S.mons.map(m=>m.sp)).size} of ${SP.length} kinds found</span></div>
    <div class="grid3">${rest.map(m=>monCard(m)).join('')||'<p class="muted">Monsters you befriend show up here.</p>'}</div>`;
}
function openMon(uid){
  const m=monBy(uid); if(!m) return; const sp=SPI[m.sp]; const fam=FAM[sp.fam]; const s=statsOf(m.sp,m.lvl);
  const inTeam=S.team.includes(uid); const slots=slotsOf(m.lvl);
  const unlock=[1,1,5,12];
  const evoAt = m.lvl<10?10: m.lvl<20?20:null;
  const sh=sheet(`<div class="mon-hero" style="--c:${EL[fam.el].c}">${monSVG(m.sp,m.lvl)}</div>
    <h2>${sp.n}</h2><p class="muted">${fam.n} · ${STAGE_N[stageOf(m.lvl)]} ${elChip(fam.el)}</p>
    <div class="lvrow"><b>Lv ${m.lvl}</b>${m.lvl<MAXLVL?bar(m.xp,xpNeed(m.lvl),'xp')+`<span class="muted">${m.xp}/${xpNeed(m.lvl)} XP</span>`:'<span class="muted">Max level</span>'}</div>
    ${evoAt?`<p class="muted small">Evolves at Lv ${evoAt}</p>`:''}
    <div class="stats"><div><span>Life</span><b>${s.hp}</b></div><div><span>Attack</span><b>${s.atk}</b></div><div><span>Mana</span><b>${s.mp}</b></div></div>
    <h3>Skills</h3><div class="skills">${sp.sk.map((id,i)=>{ const k=SK[id]; const locked=i>=slots;
      return `<div class="skill ${locked?'locked':''}"><i style="background:${EL[k.el].c}"></i><div><b>${k.n}</b><span>${locked?`Unlocks at Lv ${unlock[i]}`:skillDesc(id)}</span></div><em>${k.mp}</em></div>`; }).join('')}</div>
    <div class="actions" id="tact"></div>`);
  const tact=sh.body.querySelector('#tact');
  if(inTeam){ tact.innerHTML=`<button class="btn ghost" id="rm" ${S.team.length<=1?'disabled':''}>Remove from team</button>`;
    tact.querySelector('#rm').onclick=()=>{ S.team=S.team.filter(x=>x!==uid); persist(); sh.close(); render(); }; }
  else if(S.team.length<3){ tact.innerHTML=`<button class="btn" id="add">Add to team</button>`;
    tact.querySelector('#add').onclick=()=>{ S.team.push(uid); persist(); sh.close(); render(); }; }
  else { tact.innerHTML=`<p class="muted small">Swap into your team:</p><div class="swap">${teamMons().map(t=>`<button class="btn ghost sm" data-sw="${t.uid}">Replace ${SPI[t.sp].n}</button>`).join('')}</div>`;
    tact.querySelectorAll('[data-sw]').forEach(b=>b.onclick=()=>{ S.team=S.team.map(x=>x===b.dataset.sw?uid:x); persist(); sh.close(); render(); }); }
}
function hatch(){
  if(S.mush<10){ toast('You need 10 🍄'); return; }
  S.mush-=10; S.stats.hatches++;
  const sp=(P=>P[Math.floor(Math.random()*P.length)])(EGGSP()); const lvl=Math.max(1,Math.floor(highLvl()*0.6));
  const m=addMon(sp.id,lvl); if(S.team.length<3) S.team.push(m.uid);
  persist(); render();
  reveal(m,'Your egg hatched!');
}
function reveal(m,title){
  const sp=SPI[m.sp];
  const sh=sheet(`<div class="reveal"><p class="muted">${title}</p><div class="mon-hero pop" style="--c:${EL[FAM[sp.fam].el].c}">${monSVG(m.sp,m.lvl)}</div><h2>${sp.n}</h2><p class="muted">${FAM[sp.fam].n} · Lv ${m.lvl} ${elChip(FAM[sp.fam].el)}</p>
    <button class="btn" id="ok">Nice!</button></div>`);
  sh.body.querySelector('#ok').onclick=sh.close;
}

// ===== QUESTS =====
function viewQuests(){
  const all=QUESTS.every(q=>S.quests[q.id]);
  return `<h1>Quests</h1><p class="muted">Finish every quest for <b>+5 max energy</b> and a full refill.</p>
   <div class="list">${QUESTS.map(q=>{ const c=!!S.quests[q.id], ok=q.ok(S);
    return `<div class="row ${c?'done':''}"><div><b>${q.n}</b><span>Reward ${q.r} 🍄</span></div>${c?'<span class="ok">✓</span>':ok?`<button class="btn sm" data-q="${q.id}">Claim</button>`:'<span class="muted small">In progress</span>'}</div>`; }).join('')}</div>
   ${all?`<p class="center muted">All quests complete — max energy ${S.maxEnergy}.</p>`:''}`;
}
function claim(id){
  const q=QUESTS.find(x=>x.id===id); if(!q||S.quests[id]||!q.ok(S)) return;
  S.quests[id]=true; S.mush+=q.r; toast(`+${q.r} 🍄`);
  if(!S.bonus && QUESTS.every(x=>S.quests[x.id])){ S.bonus=true; S.maxEnergy+=5; S.energy=S.maxEnergy; S.energyAt=Date.now(); setTimeout(()=>toast('All quests done! +5 max energy'),600); }
  persist(); render();
}

// ===== ARENA (view) =====
function viewArena(){
  const peers=NET.peers.filter(p=>!p.me);
  let live;
  if(NET.status==='off') live=`<p class="muted small">Live battles are available when this game is opened from its Claude link.</p>`;
  else if(NET.status==='connecting') live=`<p class="muted small">Connecting…</p>`;
  else live = peers.length? `<div class="list">${peers.map(p=>`<div class="row"><div><b>${esc(p.name||'Trainer')}</b><span>Power ${p.power|0}${p.busy?' · in a battle':''}</span></div><button class="btn sm" data-ch="${esc(p.cid)}" ${p.busy||NET.pending?'disabled':''}>Challenge</button></div>`).join('')}</div>`
     : `<p class="muted small">No one else is in the arena right now. Send this page to a friend — when they open it, they'll show up here.</p>`;
  return `<h1>Arena</h1>
    <div class="card"><div class="card-h"><h3>Live 3v3</h3><span class="live ${NET.status==='on'?'on':''}">${NET.status==='on'?'● Online':'○ Offline'}</span></div>${live}</div>
    <div class="card tap" id="rival"><div class="card-h"><h3>Rival battle</h3><span class="muted">1⚡</span></div><p class="muted small">3v3 against a computer trainer at your level.</p></div>
    <div class="card tap" id="local"><div class="card-h"><h3>Pass &amp; play</h3><span class="muted">Free</span></div><p class="muted small">Two players, one phone. Pick both teams from your collection.</p></div>`;
}
function rivalTeam(){
  const tm=teamMons(); const avg=Math.round(tm.reduce((t,m)=>t+m.lvl,0)/Math.max(1,tm.length));
  const names=['Rival Nour','Rival Sami','Rival Maya','Rival Karim','Rival Lina'];
  return {name:names[Math.floor(Math.random()*names.length)], mons:[0,1,2].map(()=>({sp:(P=>P[Math.floor(Math.random()*P.length)])(EGGSP()).id, lvl:Math.max(1,avg+Math.floor(Math.random()*3)-1)}))};
}
function openLocal(){
  if(S.mons.length<1) return;
  let pick=[];
  const sh=sheet(`<h2>Pass &amp; play</h2><p class="muted">Player 1 uses your team. Pick up to 3 for Player 2.</p><div class="grid3" id="lp">${S.mons.map(m=>monCard(m)).join('')}</div><div class="actions"><button class="btn" id="go" disabled>Start battle</button></div>`);
  const g=sh.body.querySelector('#lp'); const go=sh.body.querySelector('#go');
  g.querySelectorAll('[data-mon]').forEach(b=>b.onclick=()=>{ const u=b.dataset.mon; if(pick.includes(u)) pick=pick.filter(x=>x!==u); else if(pick.length<3) pick.push(u); g.querySelectorAll('[data-mon]').forEach(x=>x.classList.toggle('sel',pick.includes(x.dataset.mon))); go.disabled=!pick.length; });
  go.onclick=()=>{ sh.close(); startBattle({mode:'local', foe:{name:'Player 2', mons:pick.map(monBy).map(m=>({sp:m.sp,lvl:m.lvl}))}, myName:'Player 1'}); };
}

function bindView(){
  const v=$('#view');
  v.querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>openZone(+b.dataset.zone));
  v.querySelectorAll('[data-mon]').forEach(b=>b.onclick=()=>openMon(b.dataset.mon));
  v.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>claim(b.dataset.q));
  v.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>NET.challenge(b.dataset.ch));
  const h=$('#hatch',v); if(h) h.onclick=hatch;
  const r=$('#rival',v); if(r) r.onclick=()=>{ if(!S.team.length) return toast('Add a monster to your team'); if(!spend(1)) return; persist(); startBattle({mode:'rival', foe:rivalTeam()}); };
  const l=$('#local',v); if(l) l.onclick=openLocal;
}

// ===== BATTLE =====
let B=null;
function mySnap(){ return teamMons().map(m=>({sp:m.sp,lvl:m.lvl,uid:m.uid})); }
function startBattle({mode, foe, meta, myName}){
  const b=newBattle({name:myName||S.name, mons:mySnap()}, foe, {mode});
  B={b, mode, meta:meta||{}, mySide:0, ctl:['human', mode==='local'?'human':'ai'], sel:null};
  openBattle(); NET.updatePresence(); drive();
}
function openBattle(){ closeAllSheets(); document.querySelectorAll('.lila-wrap').forEach(x=>x.remove()); $('#battle').classList.add('open'); document.body.classList.add('inbattle'); }
function closeBattle(){ $('#battle').classList.remove('open'); document.body.classList.remove('inbattle'); clearTimeout(B&&B.timer); B=null; render(); NET.updatePresence(); }
function drive(){
  if(!B) return; const b=B.b;
  clearTimeout(B.timer);
  renderBattle();
  if(!b) return;
  if(b.over){ if(!B.finished){ B.finished=true; B.timer=setTimeout(finishBattle, 1100); } return; }
  const a=actor(b); const c=B.ctl[a.s];
  if(c==='ai') B.timer=setTimeout(()=>{ if(!B||B.b!==b) return; act(b, aiChoose(b)); afterAct(); }, 1450);
}
function afterAct(){ if(B.net && B.net.role==='host') NET.broadcast(); drive(); }
function humanAct(skill, target){
  const b=B.b; B.sel=null;
  if(B.net && B.net.role==='guest'){ NET.sendAction({skill,target}); renderBattle(); return; }
  act(b,{skill,target}); afterAct();
}
function bcard(b, s, i, ctx){
  const m=b.sides[s].mons[i]; const a=actor(b);
  const isAct = !b.over && a && a.s===s && a.i===i;
  const st=m.st; const chips=[];
  if(st.burn) chips.push('<i class="st burn">Burn</i>'); if(st.poison) chips.push('<i class="st poison">Poison</i>');
  if(st.stun) chips.push('<i class="st stun">Stun</i>'); if(st.bubble) chips.push('<i class="st bubble">Bubble</i>');
  if(st.mshield) chips.push('<i class="st ms">M.Shield</i>'); if(st.atkUp) chips.push('<i class="st up">Atk↑</i>');
  if(st.defUp) chips.push('<i class="st guard">Guard</i>'); if(st.thorns) chips.push('<i class="st spark">Spark</i>');
  const tgt = ctx.targets && ctx.targets.side===s && ctx.targets.list.includes(i);
  const pv = ctx.prev && ctx.prev[s+'-'+i]; const hp=pv?pv.hp:m.hp, mp=pv?pv.mp:m.mp;
  return `<div class="bmon ${hp<=0?'ko':''} ${isAct?'acting':''} ${tgt?'target':''}" data-s="${s}" data-i="${i}">
    <div class="bart">${monSVG(m.sp,m.lvl)}</div><div class="bname"><b>${m.n}</b><span>Lv${m.lvl}</span></div>
    ${bar(hp,m.maxhp,'hp')}${bar(mp,m.maxmp,'mp')}<div class="bnum">${hp}/${m.maxhp}</div><div class="sts">${chips.join('')}</div></div>`;
}
function renderBattle(){
  const root=$('#battle'); if(!B) return;
  const b=B.b;
  if(!b){ root.innerHTML=`<div class="bwait"><div class="spinner"></div><p>Joining battle…</p><button class="btn ghost sm" id="bleave">Leave</button></div>`; $('#bleave').onclick=()=>{ NET.leaveMatch(); closeBattle(); }; return; }
  const a=actor(b);
  const myTurn = !b.over && a && B.ctl[a.s]==='human' && !(B.net && B.net.role==='guest' && B.net.sent===b.seq);
  const bottom = B.mySide, top=1-bottom;
  let ctx={}; const animating = B.animSeq!==b.seq && B.prev; if(animating) ctx.prev=B.prev;
  if(myTurn && B.sel){ const vt=validTargets(b,a.s,B.sel); const tside = SK[B.sel].t==='enemy'?1-a.s:a.s; ctx.targets={side:tside, list:vt}; }
  let controls='';
  if(b.over) controls=`<div class="bmsg">${b.winner===B.mySide||B.mode==='local'?`<b>${esc(b.sides[b.winner].name)} wins!</b>`:'<b>Defeated</b>'}</div>`;
  else if(myTurn){
    const m=a.m; const opts=['basic'].concat(m.sk);
    const who = B.mode==='local'?`${esc(b.sides[a.s].name)} · `:'';
    if(B.sel){ controls=`<div class="bmsg"><b>${SK[B.sel].n}</b> — tap a ${SK[B.sel].t==='ally'?'teammate':'target'}</div><button class="btn ghost sm" id="cancel">Back</button>`; }
    else controls=`<div class="bturn">${who}<b>${m.n}</b>'s turn</div><div class="skgrid">${opts.map(id=>{ const k=SK[id]; const can=m.mp>=k.mp;
      return `<button class="skb" data-sk="${id}" ${can?'':'disabled'} style="--c:${EL[k.el].c}"><b>${k.n}</b><span>${k.mp?k.mp+' mana':'free'}</span></button>`; }).join('')}</div>`;
  } else {
    const nm = a? a.m.n : '';
    controls=`<div class="bmsg muted">${B.net?(B.ctl[a.s]==='remote'?`Waiting for ${esc(b.sides[a.s].name)}…`:'Sending…'):`${nm} is thinking…`}</div>`;
  }
  const last=b.log.slice(-2).map(esc).join('<br>');
  root.style.setProperty('--zc', B.mode==='campaign'?ZONES[B.meta.zi].c:'#7ccf6a');
  root.innerHTML=`<div class="bsky"></div><div class="btop"><button class="iconb" id="bquit">✕</button><span>${B.mode==='pvp'?'Live 3v3':B.mode==='local'?'Pass & play':B.mode==='rival'?'Rival battle':ZONES[B.meta.zi].n} · Round ${b.round}</span><span class="foe-n">${esc(b.sides[top].name)}</span></div>
    <div class="brow foe">${b.sides[top].mons.map((m,i)=>bcard(b,top,i,ctx)).join('')}</div>
    <div class="blog">${last}</div>
    <div class="brow me">${b.sides[bottom].mons.map((m,i)=>bcard(b,bottom,i,ctx)).join('')}</div>
    <div class="bctl">${controls}</div>`;
  // bindings
  $('#bquit').onclick=()=>{
    if(b.over){ finishBattle(); return; }
    const sh=sheet(`<h2>${B.mode==='pvp'?'Forfeit match?':'Run away?'}</h2><p class="muted">${B.mode==='pvp'?'Your opponent gets the win.':'You won\'t get rewards for this battle.'}</p><div class="actions"><button class="btn danger" id="y">${B.mode==='pvp'?'Forfeit':'Run'}</button></div>`);
    sh.body.querySelector('#y').onclick=()=>{ sh.close(); if(B.net){ NET.forfeit(); } else closeBattle(); };
  };
  root.querySelectorAll('[data-sk]').forEach(btn=>btn.onclick=()=>{
    const id=btn.dataset.sk; const t=SK[id].t;
    if(t==='enemy'||t==='ally'){ const vt=validTargets(b,a.s,id); if(vt.length===1) humanAct(id,vt[0]); else { B.sel=id; renderBattle(); } }
    else humanAct(id,null);
  });
  const c=$('#cancel'); if(c) c.onclick=()=>{ B.sel=null; renderBattle(); };
  if(ctx.targets) root.querySelectorAll('.bmon.target').forEach(el=>el.onclick=()=>humanAct(B.sel,+el.dataset.i));
  if(B.animSeq!==b.seq){ B.animSeq=b.seq; animateBattle(root,b,animating); }
}
function finishBattle(){
  if(!B) return; const b=B.b; const mode=B.mode;
  if(B.net) NET.leaveMatch();
  if(mode==='local'){ closeBattle(); return; }
  const win = b.over && b.winner===B.mySide;
  const foeSide=1-B.mySide;
  const avg=b.sides[foeSide].mons.reduce((t,m)=>t+m.lvl,0)/b.sides[foeSide].mons.length;
  let xp=Math.round((15+avg*7)*(win?1:0.3)); let mush=0; const extra=[];
  if(win){
    S.stats.wins++;
    if(mode==='campaign'){ const z=ZONES[B.meta.zi]; const s=B.meta.s; const first=(S.zones[z.id]||0)<=s;
      mush=1+Math.floor(B.meta.zi/2)+(s===3&&first?5:0);
      if(first) S.zones[z.id]=s+1;
      if(first && z.id==='meadow' && s===0){ const sp=SP.filter(x=>x.fam==='bug')[Math.floor(Math.random()*4)]; const m=addMon(sp.id,2); if(S.team.length<3) S.team.push(m.uid); extra.push(['Lila gave you a buddy!',m]); }
      if(first && s===3){ let fam=z.fam; if(z.id==='meadow'){ const others=Object.keys(FAM).filter(f=>f!=='bug'&&!S.mons.some(m=>SPI[m.sp].fam===f)); fam=others[Math.floor(Math.random()*others.length)]||'wing'; }
        const owned=new Set(S.mons.map(m=>m.sp)); let pool=SP.filter(x=>x.fam===fam&&!owned.has(x.id)); if(!pool.length) pool=SP.filter(x=>x.fam===fam);
        const m=addMon(pool[Math.floor(Math.random()*pool.length)].id, Math.max(1,z.lv)); if(S.team.length<3) S.team.push(m.uid); extra.push([`You befriended a monster from ${z.n}!`,m]); }
    } else if(mode==='rival'){ mush=3; S.stats.arenaWins++; }
    else if(mode==='pvp'){ mush=5; S.stats.arenaWins++; S.stats.pvpWins++; xp=Math.round(xp*1.3); }
  }
  S.mush+=mush;
  const res = b.sides[B.mySide].mons.map((bm,i)=>{ const m=monBy(bm.uid||(B.myUids&&B.myUids[i])); if(!m) return null; const r=giveXp(m,xp); return {m,r}; }).filter(Boolean);
  persist();
  closeBattle();
  const sh=sheet(`<div class="result"><h2>${win?'Victory!':'Defeat'}</h2><p class="muted">+${xp} XP each${mush?` · +${mush} 🍄`:''}</p>
    <div class="list">${res.map(({m,r})=>`<div class="row"><div class="rmon">${monSVG(m.sp,m.lvl)}</div><div class="grow"><b>${SPI[m.sp].n} · Lv ${m.lvl}</b>${m.lvl<MAXLVL?bar(m.xp,xpNeed(m.lvl),'xp'):''}</div>${r.evo?'<span class="tag evo">Evolved!</span>':r.lv?`<span class="tag">+${r.lv} Lv</span>`:''}</div>`).join('')}</div>
    <button class="btn" id="ok">Continue</button></div>`, {onClose:()=>{ extra.forEach(([t,m],k)=>setTimeout(()=>reveal(m,t),350+k*50)); }});
  sh.body.querySelector('#ok').onclick=sh.close;
}

// ===== NET (live PvP) =====
const NET = {status:'off', peers:[], cid:uidGen()+uidGen(), room:null, pending:null, mr:null};
NET.init = async function(){
  if(!window.claude || !window.claude.use) return;
  NET.status='connecting'; if(TAB==='arena') render();
  let room=null; try{ room = await window.claude.use('room'); }catch(e){}
  if(!room){ NET.status='off'; if(TAB==='arena') render(); return; }
  NET.room=room; NET.status='on';
  try{ room.onPeers(list=>{ NET.peers=(list||[]).map(p=>{ const d=p.presence||p.state||p.data||p; return Object.assign({},d,{me: !!(p.you||p.self||p.isSelf||p.me) || d.cid===NET.cid}); }).filter(p=>p.cid); if(TAB==='arena' && !B) render(); }); }catch(e){}
  room.on('challenge', d=>{ if(!d||d.to!==NET.cid) return; if(B||NET.incoming){ room.emit('decline',{to:d.from, matchId:d.matchId, busy:true}); return; } NET.showIncoming(d); });
  room.on('accept', d=>{ if(!d||d.to!==NET.cid||!NET.pending||d.matchId!==NET.pending.matchId) return; clearTimeout(NET.pending.t); NET.pending=null; NET.startHost(d); });
  room.on('decline', d=>{ if(!d||d.to!==NET.cid||!NET.pending||d.matchId!==NET.pending.matchId) return; clearTimeout(NET.pending.t); NET.pending=null; toast(d.busy?'They\'re busy right now':'Challenge declined'); render(); });
  NET.updatePresence();
  if(TAB==='arena') render();
};
NET.updatePresence = function(){ if(!NET.room||!S) return; try{ NET.room.presence({cid:NET.cid, name:S.name||'Trainer', power:teamPower(), busy:!!B}); }catch(e){} };
function sanitizeTeam(t){ return (Array.isArray(t)?t:[]).slice(0,3).filter(m=>m&&SPI[m.sp]).map(m=>({sp:m.sp, lvl:Math.max(1,Math.min(MAXLVL,m.lvl|0))})); }
NET.challenge = function(cid){
  if(!S.team.length) return toast('Add a monster to your team');
  const matchId=uidGen()+uidGen();
  NET.pending={matchId,to:cid,t:setTimeout(()=>{ NET.pending=null; toast('No answer'); render(); },30000)};
  NET.room.emit('challenge',{to:cid, from:NET.cid, name:S.name, matchId, team:mySnap().map(({sp,lvl})=>({sp,lvl}))});
  toast('Challenge sent'); render();
};
NET.showIncoming = function(d){
  const team=sanitizeTeam(d.team); NET.incoming=d;
  const sh=sheet(`<h2>Challenge!</h2><p class="muted"><b>${esc(d.name||'A trainer')}</b> wants a 3v3 battle.</p><div class="stage-mons big">${team.map(m=>monSVG(m.sp,m.lvl)).join('')}</div>
    <div class="actions"><button class="btn" id="acc">Accept</button><button class="btn ghost" id="dec">Decline</button></div>`, {onClose:()=>{ if(NET.incoming===d){ NET.incoming=null; NET.room.emit('decline',{to:d.from, matchId:d.matchId}); } }});
  const t=setTimeout(()=>sh.close(),28000);
  sh.body.querySelector('#acc').onclick=()=>{ clearTimeout(t); NET.incoming=null; sh.close();
    if(!S.team.length){ toast('Add a monster to your team'); return; }
    NET.room.emit('accept',{to:d.from, from:NET.cid, name:S.name, matchId:d.matchId, team:mySnap().map(({sp,lvl})=>({sp,lvl}))});
    NET.startGuest(d); };
  sh.body.querySelector('#dec').onclick=()=>{ clearTimeout(t); sh.close(); };
};
async function joinMatch(id){ const r=NET.room.join('m-'+id); return (r && r.then)? await r : r; }
NET.startHost = async function(d){
  closeAllSheets();
  const mr=await joinMatch(d.matchId); NET.mr=mr;
  const b=newBattle({name:S.name, mons:mySnap()}, {name:d.name||'Opponent', mons:sanitizeTeam(d.team)}, {mode:'pvp'});
  B={b, mode:'pvp', meta:{}, mySide:0, ctl:['human','remote'], net:{role:'host', matchId:d.matchId, last:Date.now()}};
  mr.on('action', a=>{
    if(!B||!B.net||a.matchId!==B.net.matchId||B.b.over) return;
    const ac=actor(B.b);
    if(ac.s===1 && a.seq===B.b.seq){ act(B.b,{skill:a.skill,target:a.target}); B.net.last=Date.now(); afterAct(); }
    else NET.broadcast();
  });
  mr.on('forfeit', a=>{ if(!B||!B.net||a.matchId!==B.net.matchId||B.b.over) return; B.b.over=true; B.b.winner=0; B.b.log.push(`${B.b.sides[1].name} forfeited.`); B.b.seq++; NET.broadcast(); drive(); });
  B.net.hb=setInterval(()=>{
    if(!B||!B.net) return; NET.broadcast();
    const ac=actor(B.b);
    if(!B.b.over && ac && ac.s===1 && Date.now()-B.net.last>60000){ act(B.b, aiChoose(B.b)); B.net.last=Date.now(); afterAct(); }
  },2500);
  openBattle(); NET.updatePresence(); NET.broadcast(); drive();
};
NET.broadcast = function(){ if(!NET.mr||!B||!B.b||!B.net) return; const b=Object.assign({},B.b,{log:B.b.log.slice(-6)}); try{ NET.mr.emit('state',{matchId:B.net.matchId, b}); }catch(e){} if(B.net.lastSeq!==B.b.seq){ B.net.last=Date.now(); B.net.lastSeq=B.b.seq; } };
NET.startGuest = async function(d){
  B={b:null, mode:'pvp', meta:{}, mySide:1, myUids:teamMons().map(m=>m.uid), ctl:['remote','human'], net:{role:'guest', matchId:d.matchId, heard:Date.now()}};
  openBattle(); renderBattle();
  const mr=await joinMatch(d.matchId); NET.mr=mr;
  mr.on('state', s=>{
    if(!B||!B.net||!s||s.matchId!==B.net.matchId||!s.b) return;
    B.net.heard=Date.now();
    if(!B.b || s.b.seq>B.b.seq || (s.b.over&&!B.b.over)){ B.b=s.b; B.net.sent=null; drive(); }
  });
  B.net.hb=setInterval(()=>{
    if(!B||!B.net) return;
    if(B.net.sent!=null && B.b && B.b.seq===B.net.sent && B.net.action) mr.emit('action',Object.assign({matchId:B.net.matchId, seq:B.net.sent},B.net.action));
    if(Date.now()-B.net.heard>25000 && !(B.b&&B.b.over)){ clearInterval(B.net.hb); toast('Lost connection to the match'); NET.leaveMatch(); closeBattle(); }
  },2500);
  NET.updatePresence();
};
NET.sendAction = function(a){ B.net.sent=B.b.seq; B.net.action=a; NET.mr.emit('action',Object.assign({matchId:B.net.matchId, seq:B.b.seq},a)); };
NET.forfeit = function(){
  if(!B||!B.net) return;
  if(B.net.role==='guest'){ try{ NET.mr.emit('forfeit',{matchId:B.net.matchId}); }catch(e){} if(B.b){ B.b.over=true; B.b.winner=0; } NET.leaveMatch(); closeBattle(); }
  else { B.b.over=true; B.b.winner=1; B.b.fled=0; B.b.seq++; NET.broadcast(); NET.leaveMatch(); closeBattle(); }
};
NET.leaveMatch = function(){ if(B&&B.net){ clearInterval(B.net.hb); } const mr=NET.mr; if(B&&B.net&&B.net.role==='host'&&B.b&&B.b.over&&mr){ const msg={matchId:B.net.matchId, b:Object.assign({},B.b,{log:B.b.log.slice(-6)})}; [0,500,1000].forEach(t=>setTimeout(()=>{ try{ mr.emit('state',msg); }catch(e){} },t)); } NET.mr=null; setTimeout(()=>{ try{ mr&&mr.leave&&mr.leave(); }catch(e){} },1500); if(B) B.net=null; setTimeout(NET.updatePresence,50); };

// ===== ONBOARDING =====
function onboarding(){
  const fams=['shell','volt','hound'];
  let chosen=null;
  const sh=sheet(`<div class="onb"><div class="lila">L</div><p class="muted">Lila</p><h2>Welcome to Monster Kingdom!</h2><p>I'm Lila. Let's get you a partner. What should I call you?</p>
    <input id="nm" maxlength="16" placeholder="Trainer name" autocomplete="off">
    <p>Pick a family — you'll get one of its four monsters.</p>
    <div class="fams">${fams.map(f=>{ const rep=SP.filter(s=>s.fam===f)[0]; return `<button class="fam" data-f="${f}" style="--c:${EL[FAM[f].el].c}">${monSVG(rep.id,1)}<b>${FAM[f].n}</b>${elChip(FAM[f].el)}</button>`; }).join('')}</div>
    <button class="btn" id="go" disabled>Let's go</button></div>`, {locked:true});
  const nm=sh.body.querySelector('#nm'), go=sh.body.querySelector('#go');
  const upd=()=>{ go.disabled=!(chosen && nm.value.trim()); };
  nm.oninput=upd;
  sh.body.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{ chosen=b.dataset.f; sh.body.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('sel',x===b)); upd(); });
  go.onclick=()=>{
    S.name=nm.value.trim().slice(0,16);
    const pool=SP.filter(s=>s.fam===chosen); const m=addMon(pool[Math.floor(Math.random()*pool.length)].id,1); S.team=[m.uid];
    persist(); sh.close(); render(); NET.updatePresence();
    reveal(m,'Your partner is…');
    setTimeout(()=>toast('Tip: start in Lila\'s Meadow on the map'),2500);
  };
}

// ===== BOOT =====
function boot(){
  S = Object.assign(freshSave(), loadLocal()||{});
  S.stats=Object.assign(freshSave().stats, S.stats||{});
  try{ fixTeam(); }catch(e){ console.warn('fixTeam',e&&e.message); }
  document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{ TAB=b.dataset.tab; render(); $('#view').scrollTop=0; window.scrollTo(0,0); });
  render();
  if(!S.name) onboarding();
  setInterval(()=>{ if(!S) return; const e=S.energy; tickEnergy(); if(e!==S.energy) persist(); if(!B) renderTop(); },1000);
  initDb(); NET.init();
}
