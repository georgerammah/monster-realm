// ===== V5: arena flow — intro, picks, one-at-a-time, swap, timers, rank =====
const PICK_SECS=10, TURN_SECS=10;
function turnKey(b){ return b?[b.phase,b.round,b.turnIdx,b.pickSide,(b.pickQ||[]).length,b.over].join(':'):''; }
function stampIfNewTurn(){ if(!B||!B.b) return; const k=turnKey(B.b); if(k!==B.tkey){ B.tkey=k; B.stamp=Date.now(); } }
const RANKS=[[0,'Bronze','#b07a4a',1],[1200,'Silver','#b8c0cc',2],[1600,'Gold','#f2c14e',2],[2000,'Platinum','#7fd6d6',3],[2500,'Emerald','#3fcf7a',3],[3000,'Diamond','#8fb8ff',4]];
function rankOf(r){ let t=RANKS[0]; RANKS.forEach(x=>{ if(r>=x[0]) t=x; }); return t; }
function rankBadge(r,size){ const [,n,c,k]=rankOf(r); size=size||26;
  let p=''; for(let i=0;i<k;i++){ const y=18-i*5; p+=`<path d="M3 ${y} L12 ${y-6} L21 ${y} L21 ${y+4} L12 ${y-2} L3 ${y+4}Z" fill="${c}" stroke="#1a1a1a" stroke-width="1"/>`; }
  return `<svg class="rbadge" viewBox="0 0 24 24" width="${size}" height="${size}" title="${n}">${p}</svg>`; }
function myRank(){ return S.rank==null?200:S.rank; }
// Arena rank (fit to Monster Kingdom results): K 15, 1700-point spread
const RANK_K=15, RANK_SPREAD=1700;
function rankChange(me,op,win){ const e=1/(1+Math.pow(10,(op-me)/RANK_SPREAD)); return RANK_K*((win?1:0)-e); }
function isArena(mode){ return mode==='pvp'||mode==='rival'||mode==='local'||mode==='practice'||mode==='challenge'; }

// ---- start arena battles ----
function startBattle({mode, foe, meta, myName, oppRank}){
  const single=isArena(mode);
  const b=newBattle({name:myName||S.name, mons:mySnap()}, foe, {mode, single});
  B={b, mode, meta:meta||{}, mySide:0, ctl:['human', mode==='local'?'human':'ai'], tgt:{}, oppRank:oppRank==null?myRank():oppRank, oppAvatar: mode==='rival'?{t:'trainer',i:Math.floor(Math.random()*12)}:null, stamp:Date.now()};
  openBattle(); NET.updatePresence();
  if(single){ B.paused=true; renderBattle(); showIntro(()=>{ if(!B) return; B.paused=false; B.stamp=Date.now(); B.tkey=turnKey(B.b); drive(); }); }
  else drive();
}
function rivalTeam(){
  const tm=teamMons(); const avg=Math.round(tm.reduce((t,m)=>t+m.lvl,0)/Math.max(1,tm.length));
  const names=['Nour','Sami','Maya','Karim','Lina','Rami','Dana'];
  return {name:names[Math.floor(Math.random()*names.length)], mons:[0,1,2].map(()=>({sp:(P=>P[Math.floor(Math.random()*P.length)])(EGGSP()).id, lvl:Math.max(1,avg+Math.floor(Math.random()*3)-1)}))};
}

// ---- intro ----
function showIntro(done){
  const b=B.b; const L=B.mySide, R=1-L;
  const pr=s=>`<div class="iv-por">${avatarSVG(avatarFor(b,s))}</div>`;
  const myR=myRank(), opR=B.mode==='local'?myR:B.oppRank;
  const w=document.createElement('div'); w.className='intro';
  w.innerHTML=`<div class="iv-band top"><div class="iv-title">${B.mode==='pvp'?(B.spar?'<span class="g">FRIENDLY</span> <span class="o">SPAR!</span>':'<span class="g">LIVE</span> <span class="o">BATTLE!</span>'):B.mode==='rival'?'<span class="g">RIVAL</span> <span class="o">BATTLE!</span>':'<span class="g">FRIENDLY</span> <span class="o">BATTLE!</span>'}</div></div>
    <div class="iv-band mid">
      <div class="iv-side l">${pr(L)}<div class="iv-nm"><b>${esc(b.sides[L].name)}</b><span>${rankBadge(myR)}${B.mode==='local'?'':myR}</span></div></div>
      <div class="iv-vs">VS</div>
      <div class="iv-side r"><div class="iv-nm"><b>${esc(b.sides[R].name)}</b><span>${rankBadge(opR)}${B.mode==='local'?'':opR}</span></div>${pr(R)}</div>
    </div>`;
  document.body.appendChild(w);
  setTimeout(()=>{ w.classList.add('out'); setTimeout(()=>{ w.remove(); done(); },350); },2900);
}

// ---- drive (phase-aware) ----
function drive(){
  if(!B) return; const b=B.b;
  clearTimeout(B.timer);
  renderBattle();
  if(!b||B.paused) return;
  if(b.over){ if(!B.finished){ B.finished=true; B.timer=setTimeout(finishBattle, 1400); } return; }
  if(b.single && b.phase==='pick'){
    const c=B.ctl[b.pickSide];
    if(c==='ai') B.timer=setTimeout(()=>{ if(!B||B.b!==b) return; pick(b,b.pickSide,aiPick(b,b.pickSide)); afterAct(); },500);
    return;
  }
  const a=actor(b); const c=B.ctl[a.s];
  if(c==='ai' || (c==='human' && B.auto && !(B.net&&B.net.role==='guest'&&B.net.sent===b.seq))){
    B.timer=setTimeout(()=>{ if(!B||B.b!==b||B.paused) return;
      if(B.net && B.net.role==='guest'){ NET.sendAction(aiChoose(JSON.parse(JSON.stringify(b)))); renderBattle(); return; }
      act(b, aiChoose(b)); afterAct(); }, c==='ai'?800:600);
  }
}
function afterAct(){ stampIfNewTurn(); if(B&&B.net && B.net.role==='host') NET.broadcast(); drive(); }

// ---- timer ----
function timerInfo(){
  const b=B&&B.b; if(!b||!b.single||b.over||B.paused) return null;
  const tot = b.phase==='pick'?PICK_SECS:TURN_SECS;
  const left=Math.max(0, tot-(Date.now()-(B.stamp||Date.now()))/1000);
  return {tot,left};
}
function myInput(){
  const b=B.b; if(!b||b.over) return false;
  if(B.net && B.net.role==='guest' && B.net.sent===b.seq) return false;
  if(b.single && b.phase==='pick') return B.ctl[b.pickSide]==='human';
  const a=actor(b); return a && B.ctl[a.s]==='human' && !B.auto;
}
setInterval(()=>{
  if(!B||!B.b) return; const ti=timerInfo(); const ring=document.querySelector('#battle .tring');
  if(ring&&ti){ ring.style.setProperty('--p',(ti.left/ti.tot*100)+'%'); ring.querySelector('b').textContent=Math.ceil(ti.left)+'s'; }
  const pb=document.querySelector('.pk-bar i'); if(pb&&ti) pb.style.width=(ti.left/ti.tot*100)+'%';
  if(ti && ti.left<=0 && myInput() && !B.expired){ B.expired=B.b.seq; autoMove(); }
  if(ti && ti.left>0) B.expired=null;
},200);
function autoMove(){
  const b=B.b; closePick();
  if(b.phase==='pick') return doPick(aiPick(b,b.pickSide));
  humanAct('basic', castTarget(actor(b),'basic'));
}

// ---- picking ----
function doPick(idx){
  const b=B.b; const s=b.pickSide;
  showGo(b.sides[s].mons[idx], ()=>{
    if(B.net && B.net.role==='guest'){ NET.sendAction({pick:idx}); renderBattle(); return; }
    pick(b,s,idx); afterAct();
  });
}
let PICKEL=null;
function closePick(){ if(PICKEL){ PICKEL.remove(); PICKEL=null; } }
function openPick(side, swap){
  closePick(); const b=B.b; const sd=b.sides[side];
  const list=benchOf(b,side);
  const w=document.createElement('div'); w.className='pk-wrap';
  w.innerHTML=`<div class="pk"><div class="pk-t">${B.mode==='local'?esc(sd.name)+': ':''}${swap?'Swap Monster':'Pick Your Monster!'}</div>
    <div class="pk-row">${sd.mons.map((m,i)=>{ const ok=list.includes(i); const isAct=i===sd.active&&m.hp>0;
      return `<button class="pk-m ${ok?'':'off'} ${m.hp<=0?'ko':''}" ${ok?`data-pk="${i}"`:''}>${monSVG(m.sp,m.lvl)}<span>${m.n}</span><i style="width:${m.hp/m.maxhp*100}%"></i>${isAct?'<em>Out now</em>':m.hp<=0?'<em>Fainted</em>':''}</button>`; }).join('')}</div>
    ${swap?'<button class="pk-x" id="pkx">Cancel</button>':'<div class="pk-bar"><i></i></div>'}</div>`;
  document.body.appendChild(w); PICKEL=w;
  w.querySelectorAll('[data-pk]').forEach(btn=>btn.onclick=()=>{ const i=+btn.dataset.pk; closePick();
    if(swap){ showGo(sd.mons[i],()=>{ if(B.net&&B.net.role==='guest'){ NET.sendAction({swap:i}); renderBattle(); return; } act(b,{swap:i}); afterAct(); }); }
    else doPick(i); });
  const x=w.querySelector('#pkx'); if(x) x.onclick=closePick;
}
function showGo(m, done){
  B.going=true;
  const w=document.createElement('div'); w.className='pk-wrap';
  w.innerHTML=`<div class="pk go"><div class="pk-t">Go ${esc(m.n)}!</div><div class="go-mon">${monSVG(m.sp,m.lvl)}</div><div class="pk-bar"><i style="width:50%"></i></div></div>`;
  document.body.appendChild(w);
  setTimeout(()=>{ w.classList.add('out'); setTimeout(()=>{ w.remove(); if(B) B.going=false; done(); },250); },900);
}

// ---- render ----
const ARENA_BG=`<div class="abg"><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="asky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fa8ad"/><stop offset=".55" stop-color="#b9d6d2"/><stop offset="1" stop-color="#8fb8a8"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#asky)"/><circle cx="265" cy="128" r="34" fill="#e8f1df" opacity=".75"/>
  <path d="M0 150 Q40 120 80 140 T170 130 T260 120 T340 135 T400 125 V300 H0Z" fill="#7fa6a6" opacity=".6"/>
  <path d="M0 170 Q60 140 120 160 T230 150 T320 160 T400 150 V300 H0Z" fill="#6c9690" opacity=".7"/>
  <path d="M0 178 C40 170 90 186 140 176 S240 168 300 178 S370 182 400 174 V300 H0Z" fill="#5f8a5c"/>
  <path d="M0 200 C80 188 160 206 240 196 S360 190 400 198 V300 H0Z" fill="#4f7d4a"/>
  ${Array.from({length:70},(_,k)=>{ const x=k*6+((k*37)%5), h=6+((k*13)%9); return `<path d="M${x} ${182+((k*7)%6)} l2 -${h} l2 ${h}" fill="#4a7a44" opacity=".8"/>`; }).join('')}</svg></div>`;
const PAS_IC={fury:'fist',sweaty:'drop',roots:'heart',thick:'shield',grounded:'earth',hard:'shield',camel:'drop'};
// item-effect badge (Monster Kingdom style): orange disc, white rim, thin inner ring, white star
const ITEM_FX_IC=`<svg viewBox="0 0 40 40" width="30" height="30"><circle cx="20" cy="21" r="17.5" fill="rgba(0,0,0,.25)"/><circle cx="20" cy="20" r="17.5" fill="#fff"/><circle cx="20" cy="20" r="15" fill="#e8603c"/><circle cx="20" cy="20" r="11.6" fill="none" stroke="#fff" stroke-width="1.6" opacity=".9"/><path d="M20 10.6l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L20 25l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z" fill="#fff"/></svg>`;
function hudIcons(m){
  if(!m) return '';
  const out=[];
  Object.keys(m.pas||{}).forEach(p=>{ const id=Object.keys(SK).find(k=>SK[k].p===p); out.push(`<span class="hi" data-tip="${id?esc(SK[id].n+' (passive, Lv '+(m.skl[id]||1)+')|'+skillDesc(id,m.skl[id]||1)):''}">${icon(p==='roots'?'plus':PAS_IC[p]||'star','#e3262d',30)}</span>`); });
  const f=m.fx||{};
  // item effects: one dot per effect type (same effects from several items are added together)
  if(f.dflat) out.push(`<span class="hi ifx" data-tip="Damage Dealt|Deals ${f.dflat} more damage to foes">${ITEM_FX_IC}</span>`);
  if(f.dnat) out.push(`<span class="hi ifx" data-tip="Nature Damage|Deals ${f.dnat} more nature damage to foes">${icon('up',EL.nature.c,26)}</span>`);
  if(f.dwat) out.push(`<span class="hi ifx" data-tip="Water Damage|Deals ${f.dwat} more water damage to foes">${icon('up',EL.water.c,26)}</span>`);
  if(f.dfir) out.push(`<span class="hi ifx" data-tip="Fire Damage|Deals ${f.dfir} more fire damage to foes">${icon('up',EL.fire.c,26)}</span>`);
  if(f.bphys) out.push(`<span class="hi ifx" data-tip="|Reduces physical attack damage by ${f.bphys}">${ITEM_FX_IC}</span>`);
  if(f.belem) out.push(`<span class="hi ifx" data-tip="|Reduces fire, lightning, water, nature attack damage by ${f.belem}">${ITEM_FX_IC}</span>`);
  if(f.tflat) out.push(`<span class="hi ifx" data-tip="Damage Taken|Takes ${f.tflat} more damage from foes">${ITEM_FX_IC}</span>`);
  if(f.rhp) out.push(`<span class="hi" data-tip="Life Bowl|Recovers ${f.rhp} life after each turn">${icon('plus','#e0475b',30)}</span>`);
  if(f.rmp) out.push(`<span class="hi" data-tip="Mana Bowl|Recovers ${f.rmp} mana after each turn">${icon('plus','#4a9cf0',30)}</span>`);
  Object.keys(ST_ICON).filter(k=>m.st[k]>0).forEach(k=>out.push(`<span class="hi st" data-tip="${BUFF_N[k]||k}|Active for ${m.st[k]} more turn${m.st[k]>1?'s':''}">${icon(ST_ICON[k][0],ST_ICON[k][1],26)}</span>`));
  return `<div class="hicons">${out.join('')}</div>`;
}
function hudSingle(b, side, right, ctx){
  const sd=b.sides[side]; const m=sd.mons[sd.active];
  const av=avatarFor(b,side);
  const pv=m&&ctx.prev&&ctx.prev[side+'-'+sd.active]; const hp=m?(pv?pv.hp:m.hp):0, mp=m?(pv?pv.mp:m.mp):0;
  const canSwap = !right && m && myInput() && b.phase==='fight' && actor(b) && actor(b).s===side && benchOf(b,side).length;
  return `<div class="bhp ${right?'r':''}" data-hs="${side}" data-hi="${sd.active==null?0:sd.active}">
    <button class="bpor tr ${canSwap?'swap':''}" ${canSwap?'id="swapb"':''}>${avatarSVG(av)}${canSwap?'<span>SWAP!</span>':''}</button>
    <div class="bbars"><div class="lb life"><i style="width:${m?hp/m.maxhp*100:0}%"></i><b>${hp} / ${m?m.maxhp:0} life</b></div>
    <div class="lb mana"><i style="width:${m?mp/m.maxmp*100:0}%"></i><b>${mp} / ${m?m.maxmp:0} mana</b></div></div>
    <div class="bdots">${sd.mons.map((x,i)=>`<i class="${x.hp<=0?'ko':i===sd.active?'on':''}"></i>`).join('')}</div>${hudIcons(m)}</div>`;
}
const _renderBattleV3 = renderBattle;
renderBattle = function(){
  if(!B) return; const b=B.b;
  if(!b || !b.single) return _renderBattleV3();
  const root=$('#battle'); B.tgt=B.tgt||{};
  const left=B.mySide, right=1-left;
  const animating = B.animSeq!==b.seq && B.prev;
  const ctx={prev:animating?B.prev:null, tside:-1, tlist:[]};
  const a=actor(b);
  const mine = myInput();
  let center='', dock='';
  if(b.phase==='pick'){
    if(B.ctl[b.pickSide]!=='human' || (B.net&&B.net.role==='guest'&&B.net.sent===b.seq)) center=`<div class="await">Waiting for opponent...</div>`;
  } else if(b.over){ center='';
  } else if(mine){
    const m=a.m; const opts=castable(m);
    dock=`<div class="dwho">${B.mode==='local'?esc(b.sides[a.s].name)+' · ':''}<b>${m.n}</b> · swipe up to cast</div><div class="abil">${opts.map(id=>{ const k=SK[id]; const c=skCost(id,m.skl[id]||1); const can=m.mp>=c;
      return `<button class="ab" data-sk="${id}" ${can?'':'disabled'}><span class="ab-slot"></span>${icon(skIconKey(id),EL[k.el].c,58)}${c?`<em>${c}</em>`:''}<b>${k.n}</b></button>`; }).join('')}</div>`;
  } else if(a){
    center = B.ctl[a.s]==='remote'||B.ctl[a.s]==='ai' ? `<div class="await sm">${B.ctl[a.s]==='ai'?esc(a.m.n)+' is thinking...':'Waiting for opponent...'}</div>` : (B.auto?'<div class="await sm">Auto battle...</div>':'');
  }
  const fighterS=(s,isLeft)=>{ const sd=b.sides[s]; if(sd.active==null) return ''; const i=sd.active, m=sd.mons[i];
    const pv=ctx.prev&&ctx.prev[s+'-'+i]; const hp=pv?pv.hp:m.hp; const isAct=a&&a.s===s&&!b.over;
    const entering = animating && (b.ev||[]).some(e=>e.k==='enter'&&e.s===s&&e.i===i);
    const sts=Object.keys(ST_ICON).filter(k=>m.st[k]>0).map(k=>icon(ST_ICON[k][0],ST_ICON[k][1],18)).join('');
    return `<div class="fighter solo ${isLeft?'l':'r'} ${hp<=0?'ko':''} ${isAct?'acting':''} ${entering?'enter':''}" data-s="${s}" data-i="${i}" style="left:${isLeft?25:75}%;top:74%">
      <div class="fname">${m.n}</div><i class="fring"></i><div class="fart">${monSVG(m.sp,m.lvl)}</div><div class="fsts">${sts}</div></div>`; };
  const ti=timerInfo();
  root.innerHTML=`${ARENA_BG}
    <div class="bhud">${hudSingle(b,left,false,ctx)}<div class="bmid"><button class="menub" id="bmenu">MENU <i>☰</i></button>${B.mode!=='local'&&B.mode!=='pvp'?`<button class="autob ${B.auto?'on':''}" id="bauto">AUTO <i></i></button>`:B.mode==='pvp'?`<button class="autob ${B.auto?'on':''}" id="bauto">AUTO <i></i></button>`:''}</div>${hudSingle(b,right,true,ctx)}</div>
    <div class="arena solo">${fighterS(left,true)}${fighterS(right,false)}</div>
    ${center}
    <div class="blog2">${esc(b.log.slice(-1)[0]||'')}</div>
    ${ti?`<div class="tring" style="--p:${ti.left/ti.tot*100}%"><b>${Math.ceil(ti.left)}s</b></div>`:''}
    <div class="dock">${dock}</div><div class="abinfo" id="abinfo"></div>`;
  $('#bmenu').onclick=battleMenu;
  const au=$('#bauto'); if(au) au.onclick=()=>{ B.auto=!B.auto; drive(); };
  const sw=$('#swapb'); if(sw) sw.onclick=()=>openPick(left,true);
  root.querySelectorAll('.hi').forEach(bindTip);
  root.querySelectorAll('.ab').forEach(btn=>bindAbility(btn,a));
  if(b.phase==='pick' && mine && !B.paused && !PICKEL && !B.going) setTimeout(()=>{ if(B&&B.b===b&&b.phase==='pick'&&myInput()&&!PICKEL&&!B.going) openPick(b.pickSide,false); },350);
  if(b.phase!=='pick' && PICKEL && !PICKEL.querySelector('#pkx')) closePick();
  if(B.animSeq!==b.seq){ B.animSeq=b.seq; animateBattle(root,b,animating); }
};
const _closeBattleV5=closeBattle;
closeBattle=function(){ closePick(); _closeBattleV5(); };

// ---- rank + results ----
const _finishV5 = finishBattle;
finishBattle = function(){
  if(B && B.mode==='pvp' && !B.spar && B.b && B.b.over){
    const win=B.b.winner===B.mySide; const me=myRank(), op=B.oppRank||200;
    const x=rankChange(me,op,win); const d=Math.ceil(x);  // MK rounding: wins round up, losses round toward zero
    S.rank=Math.max(0,me+d); S.lastRankD=d; S.lastRankX=x;
  } else if(B) S.lastRankD=null;
  _finishV5();
};
const _rewardV5 = rewardPopup;
rewardPopup = function(o){
  const sh=_rewardV5(o);
  if(S.lastRankD!=null){ const d=S.lastRankD; const x=document.createElement('div'); x.className='rw-rank'; x.innerHTML=`${rankBadge(S.rank,28)} <b>${S.rank}</b> <span class="${d>=0?'up':'dn'}">${(S.lastRankX!=null?S.lastRankX:d)>=0?'+':''}${S.lastRankX!=null?S.lastRankX.toFixed(2):d}</span>`; const t=sh.body.querySelector('.rw-xp'); t&&t.after(x); S.lastRankD=null; persist(); }
  return sh;
};

// ---- arena panel ----
function viewArena(){
  const peers=NET.peers.filter(p=>!p.me);
  let live;
  if(NET.status==='off') live=`<p class="muted small">Live battles work when the game is opened from its Claude link.</p>`;
  else if(NET.status==='connecting') live=`<p class="muted small">Connecting…</p>`;
  else live = peers.length? `<div class="list">${peers.map(p=>`<div class="row"><div><b>${esc(p.name||'Trainer')}</b><span>${rankBadge(p.rank||200,18)} ${p.rank||200}${p.busy?' · in a battle':''}</span></div><button class="btn sm" data-ch="${esc(p.cid)}" ${p.busy||NET.pending?'disabled':''}>Battle</button></div>`).join('')}</div>`
     : `<p class="muted small">No one else is in the arena right now. Share the game with a friend, and when they open it they'll show up here.</p>`;
  const r=myRank(), rk=rankOf(r);
  return `<h1>Arena</h1>
    <div class="card rankcard">${rankBadge(r,40)}<div><b>${rk[1]}</b><span>${r} rank points</span></div></div>
    <div class="card"><div class="card-h"><h3>Live battle</h3><span class="live ${NET.status==='on'?'on':''}">${NET.status==='on'?'● Online':'○ Offline'}</span></div>${live}</div>
    <div class="card tap" id="rival"><div class="card-h"><h3>Rival battle</h3><span class="muted">1⚡</span></div><p class="muted small">Practice against a computer trainer. Doesn't change your rank.</p></div>
    <div class="card tap" id="local"><div class="card-h"><h3>Pass &amp; play</h3><span class="muted">Free</span></div><p class="muted small">Two players on one phone.</p></div>`;
}
NET.updatePresence = function(){ if(!NET.room||!S) return; try{ NET.room.presence({cid:NET.cid, name:S.name||'Trainer', power:teamPower(), rank:myRank(), busy:!!B}); }catch(e){} };
const teamMsg=()=>mySnap().map(({sp,lvl,bonus,skl})=>({sp,lvl,bonus,skl}));
NET.challenge = function(cid, spar){
  if(!S.team.length) return toast('Add a monster to your team');
  const matchId=uidGen()+uidGen();
  NET.pending={matchId,to:cid,spar:!!spar,t:setTimeout(()=>{ NET.pending=null; toast('No answer'); render(); },30000)};
  NET.room.emit('challenge',Object.assign({to:cid, from:NET.cid, name:S.name, rank:myRank(), avatar:myAvatar(), matchId, team:teamMsg(), spar:!!spar}, typeof myProfile==='function'?{motto:S.motto||'',stats:myProfile().stats,cid:NET.cid}:{}));
  toast(spar?'Spar request sent':'Challenge sent'); render();
};
NET.showIncoming = function(d){
  const team=sanitizeTeam(d.team); NET.incoming=d;
  const sh=sheet(`<h2>${d.spar?'Spar':'Live battle!'}</h2><p class="muted"><b>${esc(d.name||'A trainer')}</b> ${rankBadge(d.rank||200,16)} ${d.rank|0||200} wants to ${d.spar?'spar. Rank is not affected.':'battle.'}</p><div class="stage-mons big">${team.map(m=>monSVG(m.sp,m.lvl)).join('')}</div>
    <div class="actions"><button class="btn gbtn" id="acc">Accept</button><button class="btn ghost" id="dec">Decline</button></div>`, {onClose:()=>{ if(NET.incoming===d){ NET.incoming=null; NET.room.emit('decline',{to:d.from, matchId:d.matchId}); } }});
  const t=setTimeout(()=>sh.close(),28000);
  sh.body.querySelector('#acc').onclick=()=>{ clearTimeout(t); NET.incoming=null; sh.close();
    if(!S.team.length){ toast('Add a monster to your team'); return; }
    NET.room.emit('accept',Object.assign({to:d.from, from:NET.cid, name:S.name, rank:myRank(), avatar:myAvatar(), matchId:d.matchId, team:teamMsg(), spar:!!d.spar}, typeof myProfile==='function'?{motto:S.motto||'',stats:myProfile().stats,cid:NET.cid}:{}));
    NET.startGuest(d); };
  sh.body.querySelector('#dec').onclick=()=>{ clearTimeout(t); sh.close(); };
};
NET.startHost = async function(d){
  closeAllSheets(); PANEL=null;
  const mr=await joinMatch(d.matchId); NET.mr=mr;
  const b=newBattle({name:S.name, mons:mySnap()}, {name:d.name||'Opponent', mons:sanitizeTeam(d.team)}, {mode:'pvp', single:true});
  B={b, mode:'pvp', spar:!!(d.spar||(NET.pending&&NET.pending.matchId===d.matchId&&NET.pending.spar)), meta:{}, mySide:0, ctl:['human','remote'], tgt:{}, oppRank:Math.max(0,Math.min(9999,d.rank|0))||1000, oppAvatar:sanitizeAv(d.avatar), stamp:Date.now(), paused:true,
     net:{role:'host', matchId:d.matchId, last:Date.now(), lastSeq:b.seq}};
  mr.on('action', a=>{
    if(!B||!B.net||a.matchId!==B.net.matchId||B.b.over||B.paused&&false) return;
    const bb=B.b;
    if(a.seq!==bb.seq){ NET.broadcast(); return; }
    if(bb.phase==='pick'){ if(bb.pickSide===1 && a.pick!=null && pick(bb,1,a.pick|0)) afterAct(); else NET.broadcast(); return; }
    const ac=actor(bb);
    if(ac && ac.s===1){ const ok = a.swap!=null ? act(bb,{swap:a.swap|0}) : act(bb,{skill:a.skill,target:a.target}); if(ok) afterAct(); else NET.broadcast(); }
    else NET.broadcast();
  });
  mr.on('forfeit', a=>{ if(!B||!B.net||a.matchId!==B.net.matchId||B.b.over) return; B.b.over=true; B.b.winner=0; B.b.fled=1; B.b.log.push(`${B.b.sides[1].name} forfeited.`); B.b.seq++; NET.broadcast(); drive(); });
  B.net.hb=setInterval(()=>{
    if(!B||!B.net) return; NET.broadcast(); const bb=B.b; if(bb.over||B.paused) return;
    const late=(Date.now()-B.net.last)/1000;
    if(bb.phase==='pick' && bb.pickSide===1 && late>PICK_SECS+9){ pick(bb,1,aiPick(bb,1)); afterAct(); }
    else if(bb.phase==='fight'){ const ac=actor(bb); if(ac && ac.s===1 && late>TURN_SECS+4){ act(bb,{skill:'basic',target:castTarget(ac,'basic')}); afterAct(); } }
  },2000);
  openBattle(); NET.updatePresence(); NET.broadcast(); renderBattle();
  showIntro(()=>{ if(!B) return; B.paused=false; B.stamp=Date.now(); B.net.last=Date.now(); NET.broadcast(); drive(); });
};
NET.broadcast = function(){ if(!NET.mr||!B||!B.b||!B.net) return; const b=Object.assign({},B.b,{log:B.b.log.slice(-6)}); try{ NET.mr.emit('state',{matchId:B.net.matchId, b, intro:!!B.paused, rank:myRank()}); }catch(e){} const k=turnKey(B.b); if(B.net.lastKey!==k){ B.net.last=Date.now(); B.net.lastKey=k; } };
NET.startGuest = async function(d){
  closeAllSheets(); PANEL=null;
  B={b:null, mode:'pvp', spar:!!d.spar, meta:{}, mySide:1, myUids:teamMons().map(m=>m.uid), ctl:['remote','human'], tgt:{}, oppRank:Math.max(0,Math.min(9999,d.rank|0))||1000, oppAvatar:sanitizeAv(d.avatar), stamp:Date.now(), paused:true,
     net:{role:'guest', matchId:d.matchId, heard:Date.now()}};
  openBattle(); renderBattle();
  const mr=await joinMatch(d.matchId); NET.mr=mr;
  mr.on('state', s=>{
    if(!B||!B.net||!s||s.matchId!==B.net.matchId||!s.b) return;
    B.net.heard=Date.now();
    const first=!B.b;
    if(first || s.b.seq>B.b.seq || (s.b.over&&!B.b.over)){ B.b=s.b; B.net.sent=null; if(!first) stampIfNewTurn(); if(first){ renderBattle(); showIntro(()=>{ if(!B) return; B.paused=false; B.stamp=Date.now(); B.tkey=turnKey(B.b); drive(); }); } else if(!B.paused) drive(); }
  });
  B.net.hb=setInterval(()=>{
    if(!B||!B.net) return;
    if(B.net.sent!=null && B.b && B.b.seq===B.net.sent && B.net.action) mr.emit('action',Object.assign({matchId:B.net.matchId, seq:B.net.sent},B.net.action));
    if(Date.now()-B.net.heard>25000 && !(B.b&&B.b.over)){ clearInterval(B.net.hb); toast('Lost connection to the match'); NET.leaveMatch(); closeBattle(); }
  },2000);
  NET.updatePresence();
};

function bindTip(h){
  let tip=null;
  const show=e=>{ e.preventDefault(); const t=h.dataset.tip; if(!t) return; hide();
    const [title,body]=t.split('|'); tip=document.createElement('div'); tip.className='tipb';
    tip.innerHTML=`<b>${title}</b>${body?`<span>${body}</span>`:''}`; document.body.appendChild(tip);
    const r=localRect(h); const W=isRot()?document.body.getBoundingClientRect().height:innerWidth;
    tip.style.top=(r.top+r.height+8)+'px'; tip.style.left=Math.max(8,Math.min(W-tip.offsetWidth-8, r.left+r.width/2-tip.offsetWidth/2))+'px'; };
  const hide=()=>{ if(tip){ tip.remove(); tip=null; } document.querySelectorAll('.tipb').forEach(x=>x.remove()); };
  h.addEventListener('pointerdown',show); h.addEventListener('pointerup',hide); h.addEventListener('pointerleave',hide); h.addEventListener('pointercancel',hide);
  h.addEventListener('contextmenu',e=>e.preventDefault());
}
