// ===== GAME-STYLE SHELL =====
function mushroomSVG(c){ return `<svg viewBox="0 0 40 32"><rect x="15" y="16" width="10" height="13" rx="4" fill="#f4ead2"/><path d="M2 18 Q2 2 20 2 Q38 2 38 18 Q20 22 2 18Z" fill="${c}"/><circle cx="12" cy="10" r="3" fill="#fff"/><circle cx="24" cy="7" r="2.6" fill="#fff"/><circle cx="30" cy="14" r="2.4" fill="#fff"/><circle cx="18" cy="15" r="2" fill="#fff"/></svg>`; }
const SHROOMS=[[4,62,1.5,'#f0a530'],[22,57,.55,'#e85fb0'],[33,60,.75,'#4fa8e8'],[70,58,.5,'#ff7a45'],[86,66,.6,'#f0c040'],[76,82,1.25,'#8f4fd6'],[12,86,.9,'#c0473a'],[52,92,.6,'#f0a530']];
function sceneHTML(){
  const tm=teamMons(); const pos=[[50,74],[25,78],[75,78]];
  return `<div class="scene">
    <div class="sky"><i class="sun"></i><i class="cloud c1"></i><i class="cloud c2"></i><i class="cloud c3"></i></div>
    <svg class="hills" viewBox="0 0 400 120" preserveAspectRatio="none"><path d="M0 70 L60 40 L95 58 L150 22 L205 60 L260 34 L320 64 L370 38 L400 52 V120 H0Z" fill="#b9c9e0"/><path d="M150 22 L163 30 L140 32Z M260 34 L272 42 L250 43Z" fill="#fff"/><path d="M0 95 Q60 70 130 88 Q210 62 280 86 Q340 70 400 84 V120 H0Z" fill="#3f8f3a"/></svg>
    <div class="grass"></div>
    ${SHROOMS.map(([x,y,s,c])=>`<div class="shroom" style="left:${x}%;top:${y}%;width:${s*44}px">${mushroomSVG(c)}</div>`).join('')}
    ${tm.map((m,k)=>`<button class="pet" data-pet="${m.uid}" style="left:${pos[k][0]}%;top:${pos[k][1]}%"><i class="shadow"></i>${monSVG(m.sp,m.lvl)}<span class="lvb">${m.lvl}</span></button>`).join('')}
    <button class="banner" id="myteam">My Team</button>
  </div>`;
}
function renderHUD(){
  const lead=teamMons()[0]; const pct=S.energy/S.maxEnergy*100;
  $('#hud').innerHTML=`<div class="avatar">${lead?monSVG(lead.sp,lead.lvl):''}</div>
    <div class="hcol">
      <div class="hrow"><div class="hbar name"><span class="ico">♛</span><b>${esc(S.name||'Trainer')}</b><em>${teamPower()}</em></div><button class="hbar shrooms" id="getmore"><span class="ico m">${mushroomSVG('#b04fd6')}</span><b>${S.mush}</b><small>Get more</small></button></div>
      <div class="hbar energy"><span class="ico">⚡</span><div class="ebar"><i style="width:${pct}%"></i><b>${S.energy} / ${S.maxEnergy} energy${S.energy<S.maxEnergy?` · ${nextEnergyIn()}`:''}</b></div></div>
    </div>`;
  $('#getmore').onclick=()=>openPanel('shop');
}
function renderTop(){ renderHUD(); }

let PANEL=null;
const PANELS={zones:()=>viewMap(), quests:()=>viewQuests(), shop:()=>viewShop(), battle:()=>viewArena()};
function render(){
  if(!S) return;
  tickEnergy(); renderHUD();
  const v=$('#view'); v.innerHTML=sceneHTML();
  v.querySelectorAll('[data-pet]').forEach(b=>b.onclick=()=>openMon(b.dataset.pet));
  $('#myteam').onclick=openTeam;
  if(PANEL && document.body.contains(PANEL.sh.body)){ PANEL.sh.body.innerHTML=PANELS[PANEL.name](); bindView(PANEL.sh.body); }
  if(TEAMSH && document.body.contains(TEAMSH.body)) drawTeam();
  const qn=QUESTS.filter(q=>!S.quests[q.id] && q.ok(S)).length;
  const badge=$('#qbadge'); badge.textContent=qn; badge.style.display=qn?'':'none';
}
function openPanel(name){
  if(name==='monsters') return openTeam();
  if(PANEL) PANEL.sh.close();
  const sh=sheet(PANELS[name](),{cls:'panel', onClose:()=>{ if(PANEL&&PANEL.sh===sh) PANEL=null; }});
  PANEL={name, sh}; TAB=name==='battle'?'arena':name; bindView(sh.body);
}
function bindView(v){
  v=v||document;
  v.querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>openZone(+b.dataset.zone));
  v.querySelectorAll('[data-mon]').forEach(b=>b.onclick=()=>openMon(b.dataset.mon));
  v.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>claim(b.dataset.q));
  v.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>NET.challenge(b.dataset.ch));
  const h=$('#hatch',v); if(h) h.onclick=hatch;
  const rf=$('#refill',v); if(rf) rf.onclick=()=>{ tickEnergy(); if(S.energy>=S.maxEnergy) return toast('Energy is already full'); if(S.mush<15) return toast('You need 15 🍄'); S.mush-=15; S.energy=S.maxEnergy; S.energyAt=Date.now(); persist(); render(); toast('Energy refilled!'); };
  const r=$('#rival',v); if(r) r.onclick=()=>{ if(!S.team.length) return toast('Add a monster to your team'); if(!spend(1)) return; persist(); PANEL&&PANEL.sh.close(); startBattle({mode:'rival', foe:rivalTeam()}); };
  const l=$('#local',v); if(l) l.onclick=openLocal;
}
function viewShop(){
  return `<h1>Shop</h1>
    <button class="hatch" id="hatch"><div class="egg"></div><div><b>Mystery egg</b><span>Hatches a random monster</span></div><span class="price">10 🍄</span></button>
    <button class="hatch" id="refill"><div class="egg bolt">⚡</div><div><b>Energy refill</b><span>Fill your energy to max</span></div><span class="price">15 🍄</span></button>
    <p class="muted small center">Earn 🍄 by winning battles, clearing bosses and finishing quests. You have ${S.mush}.</p>`;
}

// ===== CHOOSE YOUR TEAM =====
let TEAMSH=null;
function openTeam(){
  const sh=sheet(`<div class="tscreen"></div>`,{cls:'full', onClose:()=>{ TEAMSH=null; render(); }});
  TEAMSH=sh; drawTeam();
}
function tcard(m, inTeam){
  const sp=SPI[m.sp];
  return `<div class="tcard ${inTeam?'on':''}" data-t="${m.uid}"><button class="info" data-info="${m.uid}">i</button>${monSVG(m.sp,m.lvl)}<div class="tname"><span class="lvb">${m.lvl}</span><b>${sp.n}</b><i style="background:${EL[FAM[sp.fam].el].c}"></i></div></div>`;
}
function drawTeam(){
  const body=TEAMSH.body; const tm=teamMons(); const bench=S.mons.filter(m=>!S.team.includes(m.uid)).sort((a,b)=>b.lvl-a.lvl);
  body.querySelector('.tscreen').innerHTML=`
    <div class="plankbar"><div class="plank">Choose Your Team</div><button class="done" id="tdone">Done</button></div>
    <div class="tfield">${sceneHTML().replace(/<button class="pet"[\s\S]*?<\/button>/g,'').replace(/<button class="banner"[\s\S]*?<\/button>/,'')}
      <div class="tslots">${[0,1,2].map(i=>tm[i]?tcard(tm[i],true):`<div class="tcard empty"><span>Slot ${i+1}</span></div>`).join('')}</div>
    </div>
    <div class="bench"><div class="bench-h">${bench.length?'Tap a monster to add it · tap a team monster to bench it':'Win battles and hatch eggs to get more monsters'}</div><div class="bench-row">${bench.map(m=>tcard(m,false)).join('')}</div></div>`;
  body.querySelector('#tdone').onclick=TEAMSH.close;
  body.querySelectorAll('[data-info]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); openMon(b.dataset.info); });
  body.querySelectorAll('[data-t]').forEach(c=>c.onclick=()=>{
    const u=c.dataset.t;
    if(S.team.includes(u)){ if(S.team.length<=1) return toast('Keep at least one monster'); S.team=S.team.filter(x=>x!==u); }
    else { if(S.team.length>=3) return toast('Team is full — tap a team monster to bench it'); S.team.push(u); }
    persist(); drawTeam(); renderHUD();
  });
}

// ===== LILA =====
function lilaSVG(){
  return `<svg viewBox="0 0 120 140"><path d="M14 140 Q16 100 60 98 Q104 100 106 140Z" fill="#1f9e8f"/><path d="M42 100 L60 122 L78 100Z" fill="#f6e7c8"/><path d="M48 104 L60 118 L72 104" stroke="#e8b04a" stroke-width="3" fill="none"/>
    <rect x="52" y="82" width="16" height="20" rx="6" fill="#d9a074"/>
    <path d="M24 62 Q18 30 46 22 Q60 16 76 22 Q104 30 96 64 Q100 80 90 86 Q92 64 84 50 Q60 58 36 50 Q28 64 30 86 Q20 80 24 62Z" fill="#3b2418"/>
    <ellipse cx="60" cy="60" rx="25" ry="28" fill="#e3ad80"/>
    <circle cx="35" cy="48" r="7" fill="#3b2418"/><circle cx="85" cy="48" r="7" fill="#3b2418"/><circle cx="44" cy="38" r="8" fill="#3b2418"/><circle cx="76" cy="38" r="8" fill="#3b2418"/>
    <path d="M22 34 Q60 6 98 34 Q100 40 92 40 L28 40 Q20 40 22 34Z" fill="#c9a067"/><rect x="34" y="16" width="52" height="20" rx="9" fill="#d8b27a"/><rect x="34" y="28" width="52" height="5" fill="#8a4a2e"/>
    <circle cx="50" cy="62" r="4.2" fill="#fff"/><circle cx="51" cy="63" r="2.8" fill="#2a1a12"/><circle cx="70" cy="62" r="4.2" fill="#fff"/><circle cx="71" cy="63" r="2.8" fill="#2a1a12"/>
    <path d="M45 55 Q50 52 55 55 M65 55 Q70 52 75 55" stroke="#3b2418" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <circle cx="45" cy="71" r="1" fill="#b5703f"/><circle cx="48" cy="73" r="1" fill="#b5703f"/><circle cx="72" cy="73" r="1" fill="#b5703f"/><circle cx="75" cy="71" r="1" fill="#b5703f"/>
    <path d="M52 76 Q60 84 68 76 Q60 79 52 76Z" fill="#a8423a"/></svg>`;
}
function lilaSay(lines, opts={}){
  return new Promise(res=>{
    const w=document.createElement('div'); w.className='lila-wrap'+(opts.arrow?' arrow-'+opts.arrow:'');
    let k=0;
    const draw=()=>{ w.innerHTML=`${opts.arrow?'<div class="garrow"></div>':''}<div class="lila-box"><div class="lila-por">${lilaSVG()}<div class="lila-name">Lila</div></div><div class="lila-txt"><p>${lines[k]}</p><button class="nextb">${k<lines.length-1?'Next':opts.last||'Got it'}</button></div></div>`;
      w.querySelector('.nextb').onclick=()=>{ k++; if(k<lines.length) draw(); else { w.classList.add('out'); setTimeout(()=>w.remove(),250); res(); } }; };
    draw(); document.body.appendChild(w);
  });
}

// ===== ONBOARDING =====
async function onboarding(){
  await lilaSay(["Hi there! I'm Lila. Welcome to Monster Realm!","Monsters live all over this land. Let's get you a partner of your very own."], {last:"Let's go!"});
  const fams=['shell','volt','hound'];
  let chosen=null;
  const sh=sheet(`<div class="onb"><h2 class="game-h">Pick your partner</h2><p class="muted">Choose a family — you'll get one of its four monsters.</p>
    <input id="nm" maxlength="16" placeholder="Your trainer name" autocomplete="off">
    <div class="fams">${fams.map(f=>{ const rep=SP.filter(s=>s.fam===f)[0]; return `<button class="fam" data-f="${f}" style="--c:${EL[FAM[f].el].c}">${monSVG(rep.id,1)}<b>${FAM[f].n}</b>${elChip(FAM[f].el)}</button>`; }).join('')}</div>
    <button class="btn gbtn" id="go" disabled>Let's go!</button></div>`, {locked:true});
  const nm=sh.body.querySelector('#nm'), go=sh.body.querySelector('#go');
  const upd=()=>{ go.disabled=!(chosen && nm.value.trim()); };
  nm.oninput=upd;
  sh.body.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{ chosen=b.dataset.f; sh.body.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('sel',x===b)); upd(); });
  go.onclick=()=>{
    S.name=nm.value.trim().slice(0,16);
    const pool=SP.filter(s=>s.fam===chosen); const m=addMon(pool[Math.floor(Math.random()*pool.length)].id,1); S.team=[m.uid];
    persist(); sh.close(); render(); NET.updatePresence();
    const r=sheet(`<div class="reveal"><p class="muted">Your partner is…</p><div class="mon-hero pop" style="--c:${EL[FAM[SPI[m.sp].fam].el].c}">${monSVG(m.sp,m.lvl)}</div><h2 class="game-h">${SPI[m.sp].n}</h2><p class="muted">${FAM[SPI[m.sp].fam].n} · Lv 1 ${elChip(FAM[SPI[m.sp].fam].el)}</p><button class="btn gbtn" id="ok">Nice!</button></div>`,{onClose:async()=>{
      await lilaSay([`${SPI[m.sp].n} looks happy to meet you, ${esc(S.name)}!`,"Zones are where you battle to earn XP and mushrooms for your monsters. Let's start in my meadow!"],{arrow:'zones'});
    }});
    r.body.querySelector('#ok').onclick=r.close;
  };
}

// ===== SPLASH =====
function splash(){
  return new Promise(res=>{
    const el=$('#splash');
    const sparks=Array.from({length:22},()=>`<i class="spark" style="left:${Math.random()*100}%;--dx:${(Math.random()*60-30).toFixed(0)}px;animation-duration:${(4+Math.random()*5).toFixed(1)}s;animation-delay:-${(Math.random()*8).toFixed(1)}s;transform:scale(${(.5+Math.random()).toFixed(2)})"></i>`).join('');
    el.innerHTML=`${sparks}<div class="sp-plate"><div class="sp-mon l">${monSVG('pyrodrake',22)}</div><div class="sp-mon r">${monSVG('thundra',22)}</div><div class="sp-title"><span>Monster</span><span>Realm</span></div></div>
      <div class="sp-load"><div class="sp-bar"><i></i></div><div id="sptxt">Waking up the monsters…</div></div>`;
    const bar=el.querySelector('.sp-bar i'); let p=0;
    const msgs=['Waking up the monsters…','Growing mushrooms…','Polishing the arena…'];
    const t=setInterval(()=>{ p=Math.min(100,p+7+Math.random()*12); bar.style.width=p+'%'; $('#sptxt').textContent=msgs[Math.min(2,Math.floor(p/34))];
      if(p>=100){ clearInterval(t); el.querySelector('.sp-load').innerHTML='<div class="sp-tap">Tap to start</div>';
        el.onclick=()=>{ el.classList.add('out'); setTimeout(()=>{ el.remove(); res(); },500); }; } },160);
  });
}

// ===== BATTLE ANIMATION =====
function cardCenter(el){ const r=el.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height*0.32]; }
function animateBattle(root,b,animating){
  const evs=b.ev||[]; const card=(s,i)=>root.querySelector(`.bmon[data-s="${s}"][data-i="${i}"] `)||root.querySelector(`.bmon[data-s="${s}"][data-i="${i}"]`);
  const actE=evs.find(e=>e.k==='act'); const sk=actE&&SK[actE.sk];
  const actIdx=actE?evs.indexOf(actE):-1;
  const own=evs.filter((e,k)=>k>actIdx && (k<=actIdx || true)); // events after act
  let T=0;
  if(actE){
    const ac=card(actE.s,actE.i);
    const hits=evs.filter(e=>e.k==='hit' && e.s!==actE.s);
    const ranged = sk.pow && sk.el!=='neutral';
    if(ac){
      if(sk.pow){ ac.classList.add(actE.s===B.mySide?'lunge-up':'lunge-down'); }
      else ac.classList.add('cast');
    }
    if(ranged && ac){
      T=470;
      const [x0,y0]=cardCenter(ac); const seen=new Set();
      hits.forEach(h=>{ const key=h.s+'-'+h.i; if(seen.has(key)) return; seen.add(key); const tc=card(h.s,h.i); if(!tc) return; const [x1,y1]=cardCenter(tc);
        const p=document.createElement('div'); p.className='proj'+(sk.el==='bolt'?' bolt':''); p.style.setProperty('--c',EL[sk.el].c); p.style.left=x0+'px'; p.style.top=y0+'px';
        if(sk.el==='bolt') p.style.rotate=(Math.atan2(y1-y0,x1-x0)*180/Math.PI+90)+'deg';
        document.body.appendChild(p);
        setTimeout(()=>{ p.style.transform=`translate(${x1-x0}px,${y1-y0}px)`; },140);
        setTimeout(()=>p.remove(),470); });
    } else T = sk.pow?200:260;
  }
  // impacts
  let after=0;
  evs.forEach((e,k)=>{
    if(e.k==='act') return;
    const isTurnStart = actIdx>=0 && e.k!=='hit' && e.k!=='heal' && e.k!=='buff';
    const delay = (e.k==='dot'||e.k==='stun') ? T+520+after : T + (e.k==='hit'? (k-actIdx-1)*90 : 60);
    if(e.k==='dot'||e.k==='stun') after+=160;
    setTimeout(()=>{
      const el=card(e.s,e.i); if(!el) return;
      const f=document.createElement('span'); f.className='float '+e.k+(e.crit?' crit':'');
      f.textContent = e.k==='heal'?`+${e.v}`: e.k==='buff'?BUFF_N[e.b]: e.k==='stun'?'Stunned':`-${e.v}${e.crit?'!':''}`;
      if(e.k==='hit'||e.k==='dot'){
        f.style.color=EL[e.el]?EL[e.el].c:'';
        el.classList.remove('shake','hitflash'); void el.offsetWidth; el.classList.add('shake','hitflash');
        if(e.k==='hit'){ const [x,y]=cardCenter(el); const bu=document.createElement('div'); bu.className='burst'; bu.style.setProperty('--c',EL[e.el]?EL[e.el].c:'#fff'); bu.style.left=x+'px'; bu.style.top=y+'px'; document.body.appendChild(bu); setTimeout(()=>bu.remove(),460); }
        if(e.eff==='up'){ const x=document.createElement('span'); x.className='eff'; x.textContent='Super effective!'; el.appendChild(x); }
        if(e.crit) { root.classList.remove('quake'); void root.offsetWidth; root.classList.add('quake'); }
      }
      if(e.k==='heal'){ for(let n=0;n<6;n++){ const s=document.createElement('i'); s.className='sparkle'; s.style.left=(15+Math.random()*70)+'%'; s.style.animationDelay=(n*0.07)+'s'; el.appendChild(s); setTimeout(()=>s.remove(),1300);} }
      if(e.k==='buff'){ const r=document.createElement('i'); r.className='ring'; r.style.setProperty('--c', e.b==='bubble'?'#22a6e3':e.b==='thorns'?'#f7b500':e.b==='atkUp'?'#ff9f0a':e.b==='defUp'?'#a2845e':'#5e8bff'); el.appendChild(r); setTimeout(()=>r.remove(),750); }
      el.appendChild(f);
      syncCard(b,e.s,e.i);
    }, delay);
  });
  // final sync of every card
  setTimeout(()=>{ b.sides.forEach((sd,s)=>sd.mons.forEach((m,i)=>syncCard(b,s,i))); }, T+520+after+60);
  if(!animating) b.sides.forEach((sd,s)=>sd.mons.forEach((m,i)=>syncCard(b,s,i)));
  B.prev={}; b.sides.forEach((sd,s)=>sd.mons.forEach((m,i)=>{ B.prev[s+'-'+i]={hp:m.hp,mp:m.mp}; }));
}
function syncCard(b,s,i){
  const el=document.querySelector(`#battle .bmon[data-s="${s}"][data-i="${i}"]`); if(!el||!B||B.b!==b) return;
  const m=b.sides[s].mons[i]; const bars=el.querySelectorAll('.bar i');
  if(bars[0]) bars[0].style.width=Math.max(0,m.hp/m.maxhp*100)+'%';
  if(bars[1]) bars[1].style.width=Math.max(0,m.mp/m.maxmp*100)+'%';
  const n=el.querySelector('.bnum'); if(n) n.textContent=`${m.hp}/${m.maxhp}`;
  el.classList.toggle('ko', m.hp<=0);
}

// ===== BOOT =====
async function boot(){
  S = Object.assign(freshSave(), loadLocal()||{});
  S.stats=Object.assign(freshSave().stats, S.stats||{});
  document.querySelectorAll('#bar [data-p]').forEach(b=>b.onclick=()=>openPanel(b.dataset.p));
  render();
  setInterval(()=>{ if(!S) return; const e=S.energy; tickEnergy(); if(e!==S.energy) persist(); if(!B) renderHUD(); },1000);
  initDb(); NET.init();
  await splash();
  if(!S.name) onboarding();
}
