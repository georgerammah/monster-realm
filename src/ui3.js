// ===== V3: zones as activities, side-view battles =====
const ZTASKS = {
  meadow:[['act','Play catch with your monster',1,0,10,15,2,2],['fight','Spar with the straw dummy',1,0,20,20,3,2,'dummy'],['act','Bring enough mana to class',1,{mp:50},20,20,2,3],['act','Train with the camp coach',1,0,20,20,2,3],['act','Pass the camp fitness test',2,{hp:90},25,25,2,3],['boss',"Lila's graduation match",3,0,60,60,5,1]],
  beach:[['act','Collect shiny shells',4,0,30,40,2,3],['fight','Battle a wild turtle',4,0,40,50,3,3],['act','Swim laps in the lagoon',5,{mp:70},40,50,2,3],['fight','Face the tide pool leader',6,0,55,65,3,2],['boss','Coral Beach Boss',7,0,120,140,5,1]],
  desert:[['act','Charge up at the storm dunes',8,0,50,70,2,3],['fight','Battle a wild feline',8,0,65,85,3,3],['act','Dig for desert fossils',9,{mp:110},65,85,2,3],['fight','Face the dune pack leader',10,0,80,100,3,2],['boss','Dune Desert Boss',11,0,180,220,5,1]],
  hollow:[['act','Sniff out embers in the woods',12,0,70,100,2,3],['fight','Battle a wild cerberus',12,0,90,120,3,3],['act','Haul firewood for the camp',13,{mp:140},90,120,2,3],['fight','Face the woodland pack leader',14,0,110,140,3,2],['boss','Ashen Woods Boss',15,0,250,300,5,1]],
  volcano:[['act','Toast snacks on cooling lava',16,0,95,130,2,3],['fight','Battle a wild dragon',16,0,120,160,3,3],['act','Soak in the hot springs',17,{mp:170},120,160,2,3],['fight','Face the crater leader',18,0,145,190,3,2],['boss','Ember Volcano Boss',20,0,330,400,5,1]],
  peaks:[['act','Ride the mountain updrafts',21,0,120,170,2,3],['fight','Battle a wild avian',21,0,150,200,3,3],['act','Deliver mail to the summit',22,{mp:210},150,200,2,3],['fight','Face the cloud nest leader',24,0,180,240,3,2],['boss','Sky Peaks Boss',26,0,420,520,5,1]]
};
function taskList(zi){ return ZTASKS[ZONES[zi].id].map(([t,n,lv,nd,cash,xp,en,reps,special])=>({t,n,lv,mp:(nd&&nd.mp)||0,hp:(nd&&nd.hp)||0,cash,xp,en,reps,special})); }
function taskProg(zi){ const id=ZONES[zi].id; S.tasks=S.tasks||{}; if(!S.tasks[id]) S.tasks[id]=taskList(zi).map(()=>0); if((S.zones[id]||0)>=4 && S.tasks[id].every(x=>x===0)) S.tasks[id]=taskList(zi).map(t=>t.reps); return S.tasks[id]; }
function zonePct(zi){ const tl=taskList(zi), p=taskProg(zi); const tot=tl.reduce((a,t)=>a+t.reps,0), got=tl.reduce((a,t,k)=>a+Math.min(p[k],t.reps),0); return Math.round(got/tot*100); }
function zoneUnlocked(i){ return i===0 || (S.zones[ZONES[i-1].id]||0)>=4; }

// ===== icons =====
const ICON = {
  fist:'<path d="M8 11V8a1.5 1.5 0 0 1 3 0v2V6.5a1.5 1.5 0 0 1 3 0V10V7.5a1.5 1.5 0 0 1 3 0V13c0 3-2 6-5.5 6S6 17 6 14v-2a1.5 1.5 0 0 1 2-1" fill="#fff"/>',
  fire:'<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1.5 1 2 2.5 2 4 1-2 1-4 1-7z" fill="#fff"/>',
  water:'<path d="M12 3c3 5 6 8 6 11a6 6 0 0 1-12 0c0-3 3-6 6-11z" fill="#fff"/>',
  bolt:'<path d="M13 2 5 13h6l-1 9 8-12h-6z" fill="#fff"/>',
  nature:'<path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14zm0 0 8-8" fill="#fff" stroke="#fff"/>',
  earth:'<path d="M4 17 8 9l4 2 3-5 5 11z" fill="#fff"/>',
  wind:'<path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3M3 19h7" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
  claw:'<path d="M7 4c2 5 2 11-1 16M12 4c2 5 2 11-1 16M17 4c2 5 2 11-1 16" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
  shield:'<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z" fill="#fff"/>',
  bubble:'<circle cx="10" cy="13" r="6" fill="none" stroke="#fff" stroke-width="2.2"/><circle cx="17" cy="7" r="3" fill="none" stroke="#fff" stroke-width="2"/>',
  plus:'<path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5z" fill="#fff"/>',
  heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" fill="#fff"/>',
  up:'<path d="M12 4 5 12h4v7h6v-7h4z" fill="#fff"/>',
  swirl:'<path d="M12 12a2 2 0 1 1 2-2 4 4 0 1 1-4-4 6 6 0 1 1-6 6" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
  star:'<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z" fill="#fff"/>',
  drop:'<path d="M12 4c3 5 5 7 5 10a5 5 0 0 1-10 0c0-3 2-5 5-10z" fill="#fff"/>'
};
function skIconKey(id){
  const s=SK[id];
  if(id==='basic') return 'fist';
  if(['pounce','double','furyfist','devour','souleater'].includes(id)) return 'claw'; if(['feedback','feed','absorb'].includes(id)) return 'swirl';
  if(s.k==='passive') return 'star';
  if(s.sh==='bubble') return 'bubble'; if(s.k==='shield') return s.sh==='lsh'?'bolt':s.sh==='fsh'?'fire':'shield';
  if(s.buff==='mshield') return 'shield'; if(s.buff==='charge'||s.buff==='focus') return 'up'; if(s.buff==='evade') return 'wind'; if(s.buff==='cripple') return 'drop';
  if(s.k==='heal') return 'heart';
  return {fire:'fire',water:'water',bolt:'bolt',nature:'nature',earth:'earth',wind:'wind'}[s.el]||'claw';
}
function icon(key,bg,size){ return `<span class="ic" style="background:${bg};width:${size}px;height:${size}px"><svg viewBox="0 0 24 24">${ICON[key]}</svg></span>`; }
const ST_ICON={pers:['up','#30c05a'],burn:['fire','#ff6a3d'],poison:['drop','#30c05a'],storm:['bolt','#7a6ad8'],stun:['star','#f2b600'],bubble:['bubble','#2f8cff'],lsh:['bolt','#f2b600'],fsh:['fire','#e0475b'],nsh:['nature','#30c05a'],mshield:['shield','#5e8bff'],focus:['up','#ff9f0a'],charge:['up','#e0475b'],evade:['wind','#4fc3e8'],cripple:['drop','#8a5ad8'],roots:['heart','#30c05a']};

// ===== HUD with dollars =====
function renderHUD(){
  const lead=teamMons()[0]; const pct=S.energy/S.maxEnergy*100;
  $('#hud').innerHTML=`<div class="avatar">${lead?monSVG(lead.sp,lead.lvl):''}</div>
    <div class="hcol">
      <div class="hrow"><div class="hbar name"><span class="ico">♛</span><b>${esc(S.name||'Trainer')}</b></div><div class="hbar cash"><span class="ico c">$</span><b>${S.cash|0}</b></div><button class="hbar shrooms" id="getmore"><span class="ico m">${mushroomSVG('#b04fd6')}</span><b>${S.mush}</b><small>Get more</small></button></div>
      <div class="hbar energy"><span class="ico">⚡</span><div class="ebar"><i style="width:${pct}%"></i><b>${S.energy<S.maxEnergy?`+1 in ${nextEnergyIn()} · `:''}${S.energy} / ${S.maxEnergy} energy</b></div></div>
    </div>`;
  $('#getmore').onclick=()=>openPanel('shop');
}

// ===== world map =====
function viewMap(){
  return `<h1>Zones</h1><div class="zones">${ZONES.map((z,i)=>{
    const open=zoneUnlocked(i); const pct=zonePct(i); const rep=SP.filter(s=>s.fam===z.fam)[0];
    return `<button class="zone ${open?'':'locked'}" data-zone="${i}" style="--zc:${z.c}">
      <div class="zone-art">${monSVG(rep.id, pct>=100?20:1)}</div>
      <div class="zone-info"><b><span class="lvb sm">${z.lv}</span> ${z.n}</b><span>${FAM[z.fam].n}</span>
      <div class="zbar"><i style="width:${pct}%"></i><em>${pct}% complete</em></div></div>
      <div class="zone-go">${open?'›':'🔒'}</div></button>`; }).join('')}</div>`;
}
function openZone(zi){
  if(!zoneUnlocked(zi)){ toast(`Finish ${ZONES[zi-1].n} first`); return; }
  openZoneSelect(zi);
}
function zoneArt(zi){
  const z=ZONES[zi]; const fam=SP.filter(s=>s.fam===z.fam);
  return `<div class="zart" style="--zc:${z.c}">${zi===0?`<div class="za-m l">${monSVG('strawdum',1)}</div>`:`<div class="za-m l">${monSVG(fam[1].id,8)}</div>`}<div class="za-m r">${monSVG(fam[0].id,zi===0?1:22)}</div></div>`;
}
function openZoneSelect(zi){
  const z=ZONES[zi];
  const mons=S.mons.slice().sort((a,b)=>b.lvl-a.lvl);
  let idx=Math.max(0,mons.findIndex(m=>m.uid===S.zoneMon)); if(idx<0) idx=0;
  const sh=sheet(`<div class="tscreen zsel"></div>`,{cls:'full'});
  const draw=()=>{
    const m=mons[idx]; const sp=SPI[m.sp];
    sh.body.querySelector('.zsel').innerHTML=`<div class="plankbar"><button class="backb" id="zb">Back</button><div class="plank">Zone and Monster Select</div></div>
      <div class="tfield">${sceneBG()}
        <div class="zcards">
          <div class="zcard"><div class="zc-h"><span class="lvb">${z.lv}</span>${z.n}</div>${zoneArt(zi)}<div class="zc-f">${zonePct(zi)}% complete</div></div>
          <div class="zcard mon"><div class="zc-mon">${mons.length>1?'<button class="arr" id="pv">‹</button>':''}<div class="zc-svg">${monSVG(m.sp,m.lvl)}</div>${mons.length>1?'<button class="arr" id="nx">›</button>':''}</div>
            <b class="zc-name">${sp.n}</b><div class="xpbar"><span class="lvb">${m.lvl}</span><div><i style="width:${m.lvl>=MAXLVL?100:m.xp/xpNeed(m.lvl)*100}%"></i><em>${m.lvl>=MAXLVL?'MAX':`${m.xp} / ${xpNeed(m.lvl)}`}</em></div></div>
            <span class="zc-sub">${FAM[sp.fam].n} ${elChip(FAM[sp.fam].el)}</span></div>
        </div>
        <button class="letsgo" id="lg">LET'S GO! <i>▶</i></button>
      </div>`;
    sh.body.querySelector('#zb').onclick=sh.close;
    const pv=sh.body.querySelector('#pv'), nx=sh.body.querySelector('#nx');
    if(pv) pv.onclick=()=>{ idx=(idx-1+mons.length)%mons.length; draw(); };
    if(nx) nx.onclick=()=>{ idx=(idx+1)%mons.length; draw(); };
    sh.body.querySelector('#lg').onclick=()=>{ S.zoneMon=m.uid; persist(); sh.close(); openTasks(zi); };
  };
  draw();
  if(S.tut===1){ S.tut=2; persist(); setTimeout(async()=>{ await lilaSay(["Zones are where you train to earn dollars and XP for your monster. Let's start at Training Camp!"]); pointAt('#lg'); },350); }
}
function sceneBG(){ return sceneHTML().replace(/<button class="pet"[\s\S]*?<\/button>/g,'').replace(/<button class="banner"[\s\S]*?<\/button>/,''); }

// ===== task list =====
let TASKSH=null;
function openTasks(zi){
  const sh=sheet(`<div class="tscreen tasks"></div>`,{cls:'full', onClose:()=>{ if(TASKSH&&TASKSH.sh===sh) TASKSH=null; }});
  TASKSH={sh,zi}; drawTasks();
  if(S.tut===2){ S.tut=3; persist(); setTimeout(async()=>{ await lilaSay(["Doing activities with your monster earns XP and dollars. Let's try one together!"]); pointAt('.tgo:not([disabled])'); },350); }
}
function drawTasks(){
  if(!TASKSH) return; const {sh,zi}=TASKSH; const z=ZONES[zi];
  const m=monBy(S.zoneMon)||teamMons()[0]; if(!m){ sh.close(); return; }
  const st=monStats(m); const tl=taskList(zi), pr=taskProg(zi);
  const nonBossDone=tl.every((t,k)=>t.t==='boss'||pr[k]>=t.reps);
  tickEnergy();
  sh.body.querySelector('.tasks').innerHTML=`<div class="thud"><button class="backb" id="tb">Back</button>
      <div class="thcol"><div class="hbar energy"><span class="ico">⚡</span><div class="ebar"><i style="width:${S.energy/S.maxEnergy*100}%"></i><b>${S.energy<S.maxEnergy?`+1 in ${nextEnergyIn()} · `:''}${S.energy} / ${S.maxEnergy}</b></div></div>
      <div class="hrow"><div class="hbar cash"><span class="ico c">$</span><b>${S.cash|0}</b></div><div class="hbar shrooms"><span class="ico m">${mushroomSVG('#b04fd6')}</span><b>${S.mush}</b></div></div></div>
      <div class="thmon">${monSVG(m.sp,m.lvl)}<span class="lvb">${m.lvl}</span></div></div>
    <div class="tlist">${tl.map((t,k)=>{
      const done=pr[k]>=t.reps; const lockBoss=t.t==='boss'&&!nonBossDone; const lvOk=m.lvl>=t.lv, mpOk=!t.mp||st.mp>=t.mp, hpOk=!t.hp||st.hp>=t.hp;
      const can=!lockBoss;
      const why = lockBoss?'Finish the other activities first':'';
      return `<div class="task ${done?'done':''} ${t.t} ${lockBoss?'lockedq':''}">
        <div class="t-h">${t.t!=='act'?`<span class="tkind">${t.t==='boss'?'BOSS':'BATTLE'}</span>`:''}${esc(t.n)}</div>
        <div class="t-grid">
          <div class="t-needs"><span>Needs:</span><span class="lvb ${lvOk?'':'bad'}">${t.lv}</span>${t.mp?`<span class="mdrop ${mpOk?'':'bad'}">${t.mp}</span>`:''}${t.hp?`<span class="hneed ${hpOk?'':'bad'}">${t.hp}</span>`:''}</div>
          <div class="t-rew"><b class="g">$ +${t.cash}</b><b class="x">XP +${t.xp}</b></div>
          <div class="t-cost">⚡ <b>${t.en}</b></div>
          <div class="t-prog"><div><i style="width:${Math.min(1,pr[k]/t.reps)*100}%"></i></div><em>${Math.min(pr[k],t.reps)} / ${t.reps}</em></div>
          <button class="tgo" data-task="${k}" ${can?'':'disabled'}>${done?'AGAIN':'GO!'}<i>▶</i></button>
        </div>${why?`<div class="t-why">${why}</div>`:''}</div>`; }).join('')}</div>
    <div class="zfoot"><div class="zbar big"><i style="width:${zonePct(zi)}%"></i><em>${z.n} — ${zonePct(zi)}% complete</em></div></div>`;
  sh.body.querySelector('#tb').onclick=sh.close;
  sh.body.querySelectorAll('[data-task]').forEach(b=>b.onclick=()=>{ const t=tl[+b.dataset.task];
    if(m.lvl<t.lv) return alertBox("Your monster's level isn't high enough for this task!");
    if(t.mp&&st.mp<t.mp) return alertBox("Your mana isn't high enough for this task!");
    if(t.hp&&st.hp<t.hp) return alertBox("Your life isn't high enough for this task!");
    doTask(zi,+b.dataset.task); });
}
function doTask(zi,k){
  const t=taskList(zi)[k]; const m=monBy(S.zoneMon)||teamMons()[0];
  if(!spend(t.en)){ drawTasks(); return; }
  { const pr0=taskProg(zi); if(pr0[k]>=t.reps) pr0[k]=0; }
  if(t.t==='act'){
    const pr=taskProg(zi); pr[k]=Math.min(t.reps,pr[k]+1);
    if(pr[k]<t.reps){ persist(); drawTasks(); renderHUD(); const tk=document.querySelectorAll('.tasks .task')[k]; if(tk){ tk.classList.add('bump'); setTimeout(()=>tk.classList.remove('bump'),450); } return; }
    S.cash=(S.cash|0)+t.cash; const r=giveXp(m,t.xp);
    persist(); drawTasks(); renderHUD();
    rewardPopup({title:'SUCCESS!', cash:t.cash, xp:t.xp, mons:[{m,r}], onClose:afterTaskTut});
    return;
  }
  persist();
  const z=ZONES[zi]; let foe;
  if(t.special==='dummy') foe={name:'Straw Dummy', mons:[{sp:'strawdum',lvl:1,hpMul:.8}]};
  else { const fam=SP.filter(s=>s.fam===z.fam); const pick=fam[Math.floor(Math.random()*fam.length)];
    if(t.t==='boss'){ foe={name:zi===0?"Lila's Mossbug":`${z.n} Boss`, mons:[{sp: zi===0?'mossbug':fam[3].id, lvl:t.lv+1, hpMul: zi===0?.85:1.35}]}; }
    else foe={name:'Wild '+pick.n, mons:[{sp:pick.id, lvl:t.lv, hpMul: zi===0?.75:1}]}; }
  const b=newBattle({name:S.name, mons:[snapOf(m)]}, foe, {mode:'campaign'});
  B={b, mode:'campaign', meta:{zi, task:k, uid:m.uid}, mySide:0, ctl:['human','ai'], tgt:{}};
  openBattle(); NET.updatePresence(); drive();
  if(S.tut===3){ setTimeout(async()=>{ B&&(B.paused=true); await lilaSay(["It's your first battle! Every monster has its own abilities.","Tap an ability to see what it does. Swipe it UP to cast it!"],{last:'OK'}); if(B){ B.paused=false; drive(); } },500); }
}

// ===== battle start (arena modes) =====
function startBattle({mode, foe, meta, myName}){
  const b=newBattle({name:myName||S.name, mons:mySnap()}, foe, {mode});
  B={b, mode, meta:meta||{}, mySide:0, ctl:['human', mode==='local'?'human':'ai'], tgt:{}};
  openBattle(); NET.updatePresence(); drive();
}
function drive(){
  if(!B) return; const b=B.b;
  clearTimeout(B.timer);
  renderBattle();
  if(!b||B.paused) return;
  if(b.over){ if(!B.finished){ B.finished=true; B.timer=setTimeout(finishBattle, 1300); } return; }
  const a=actor(b); const c=B.ctl[a.s];
  if(c==='ai' || (c==='human' && B.auto && !(B.net&&B.net.role==='guest'&&B.net.sent===b.seq))){
    B.timer=setTimeout(()=>{ if(!B||B.b!==b||B.paused) return;
      if(B.net && B.net.role==='guest'){ NET.sendAction(aiChoose(JSON.parse(JSON.stringify(b)))); renderBattle(); return; }
      act(b, aiChoose(b)); afterAct(); }, c==='ai'?1500:900);
  }
}

// ===== battle render =====
const POS = {1:[[27,66]], 2:[[22,52],[32,84]], 3:[[30,46],[13,66],[31,90]]};
function focusMon(b, side){
  const a=actor(b);
  if(a && a.s===side && !b.over) return a.i;
  const t=B.tgt && B.tgt[side]; if(t!=null && b.sides[side].mons[t] && b.sides[side].mons[t].hp>0) return t;
  const i=b.sides[side].mons.findIndex(m=>m.hp>0); return i<0?0:i;
}
function hudPanel(b, side, right, ctx){
  const i=focusMon(b,side); const m=b.sides[side].mons[i]; const pv=ctx.prev&&ctx.prev[side+'-'+i]; const hp=pv?pv.hp:m.hp, mp=pv?pv.mp:m.mp;
  return `<div class="bhp ${right?'r':''}" data-hs="${side}" data-hi="${i}"><div class="bpor">${monSVG(m.sp,m.lvl)}</div><div class="bbars">
    <div class="lb life"><i style="width:${hp/m.maxhp*100}%"></i><b>${hp} / ${m.maxhp} life</b></div>
    <div class="lb mana"><i style="width:${mp/m.maxmp*100}%"></i><b>${mp} / ${m.maxmp} mana</b></div></div></div>`;
}
function fighter(b,s,i,left,ctx){
  const m=b.sides[s].mons[i]; const n=b.sides[s].mons.length; const p=POS[n][i];
  const x=left?p[0]:100-p[0]; const a=actor(b);
  const pv=ctx.prev&&ctx.prev[s+'-'+i]; const hp=pv?pv.hp:m.hp;
  const isAct=!b.over && a && a.s===s && a.i===i;
  const isTgt = ctx.tside===s && ctx.tlist.includes(i) && ctx.tsel===i;
  const canTap = ctx.tside===s && ctx.tlist.includes(i);
  const sts=Object.keys(ST_ICON).filter(k=>m.st[k]>0).map(k=>icon(ST_ICON[k][0],ST_ICON[k][1],16)).join('');
  return `<div class="fighter ${left?'l':'r'} ${hp<=0?'ko':''} ${isAct?'acting':''} ${isTgt?'tsel':''} ${canTap?'tap':''} n${n}" data-s="${s}" data-i="${i}" style="left:${x}%;top:${p[1]}%;z-index:${Math.round(p[1])}">
    <i class="fring"></i><i class="freticle"></i><div class="fart">${monSVG(m.sp,m.lvl)}</div>
    <div class="ftag"><span class="lvb">${m.lvl}</span><div class="fhp"><i style="width:${hp/m.maxhp*100}%"></i></div></div><div class="fsts">${sts}</div></div>`;
}
function renderBattle(){
  const root=$('#battle'); if(!B) return; B.tgt=B.tgt||{};
  const b=B.b;
  if(!b){ root.innerHTML=`<div class="bfield">${sceneBG()}</div><div class="bwait"><div class="spinner"></div><p>Joining battle…</p><button class="btn ghost sm" id="bleave">Leave</button></div>`; $('#bleave').onclick=()=>{ NET.leaveMatch(); closeBattle(); }; return; }
  const a=actor(b);
  const myTurn = !b.over && a && B.ctl[a.s]==='human' && !B.auto && !(B.net && B.net.role==='guest' && B.net.sent===b.seq);
  const left=B.mySide, right=1-left;
  const animating = B.animSeq!==b.seq && B.prev;
  const ctx={prev:animating?B.prev:null, tside:-1, tlist:[]};
  if(a && !b.over){ const ts=1-a.s; ctx.tside=ts; ctx.tlist=b.sides[ts].mons.map((m,i)=>m.hp>0?i:-1).filter(i=>i>=0); const t=B.tgt[ts]; ctx.tsel=(t!=null&&ctx.tlist.includes(t))?t:ctx.tlist[0]; }
  let dock='';
  if(b.over) dock=`<div class="dmsg">${b.winner===B.mySide||B.mode==='local'?'':''}</div>`;
  else if(myTurn){
    const m=a.m; const opts=castable(m);
    dock=`<div class="dwho">${B.mode==='local'?esc(b.sides[a.s].name)+' · ':''}<b>${m.n}</b> · swipe up to cast</div><div class="abil">${opts.map(id=>{ const k=SK[id]; const c=skCost(id,m.skl[id]||1); const can=m.mp>=c;
      return `<button class="ab" data-sk="${id}" ${can?'':'disabled'}><span class="ab-slot"></span>${icon(skIconKey(id),EL[k.el].c,58)}${c?`<em>${c}</em>`:''}<b>${k.n}</b></button>`; }).join('')}</div>`;
  } else {
    dock=`<div class="dmsg">${B.auto&&B.ctl[a.s]==='human'?'Auto battle…':B.net&&B.ctl[a.s]==='remote'?`Waiting for ${esc(b.sides[a.s].name)}…`:B.net?'Sending…':`${esc(a.m.n)} is thinking…`}</div>`;
  }
  root.style.setProperty('--zc', B.mode==='campaign'?ZONES[B.meta.zi].c:'#7ccf6a');
  root.innerHTML=`<div class="bfield">${sceneBG()}</div>
    <div class="bhud">${hudPanel(b,left,false,ctx)}<div class="bmid"><button class="menub" id="bmenu">MENU <i>☰</i></button>${B.mode!=='local'?`<button class="autob ${B.auto?'on':''}" id="bauto">AUTO <i></i></button>`:''}</div>${hudPanel(b,right,true,ctx)}</div>
    <div class="arena">${b.sides[left].mons.map((m,i)=>fighter(b,left,i,true,ctx)).join('')}${b.sides[right].mons.map((m,i)=>fighter(b,right,i,false,ctx)).join('')}</div>
    <div class="blog2">${esc(b.log.slice(-1)[0]||'')}</div>
    <div class="dock">${dock}</div><div class="abinfo" id="abinfo"></div>`;
  $('#bmenu').onclick=battleMenu;
  const au=$('#bauto'); if(au) au.onclick=()=>{ B.auto=!B.auto; drive(); };
  root.querySelectorAll('.fighter.tap').forEach(el=>el.onclick=()=>{ B.tgt[+el.dataset.s]=+el.dataset.i; renderBattle(); });
  root.querySelectorAll('.ab').forEach(btn=>bindAbility(btn,a));
  if(B.animSeq!==b.seq){ B.animSeq=b.seq; animateBattle(root,b,animating); }
}
function battleMenu(){
  const b=B.b;
  const sh=sheet(`<h2>Menu</h2><div class="actions">
    ${B.mode!=='local'?`<button class="btn ghost" id="mauto">${B.auto?'Turn auto off':'Turn auto on'}</button>`:''}
    <button class="btn" id="mres">Resume</button>
    <button class="btn danger" id="mquit">${B.mode==='pvp'?'Forfeit match':'Run away'}</button></div>
    <p class="muted small center">${B.mode==='pvp'?'Forfeiting gives your opponent the win.':'Running away gives no rewards.'}</p>`);
  const ma=sh.body.querySelector('#mauto'); if(ma) ma.onclick=()=>{ B.auto=!B.auto; sh.close(); drive(); };
  sh.body.querySelector('#mres').onclick=sh.close;
  sh.body.querySelector('#mquit').onclick=()=>{ sh.close(); if(b.over) return finishBattle(); if(B.net) NET.forfeit(); else { const back=B.mode==='campaign'?B.meta.zi:null; closeBattle(); if(back!=null) openTasks(back); } };
}
function castTarget(a, id){
  const b=B.b; const t=SK[id].t;
  if(t==='enemy'){ const ts=1-a.s; const vt=validTargets(b,a.s,id); const sel=B.tgt[ts]; return vt.includes(sel)?sel:vt[0]; }
  if(t==='ally'){ let best=null,bp=2; b.sides[a.s].mons.forEach((m,i)=>{ if(m.hp>0 && m.hp/m.maxhp<bp){ bp=m.hp/m.maxhp; best=i; } }); return best; }
  return null;
}
function bindAbility(btn,a){
  const id=btn.dataset.sk; let y0=null, moved=false;
  btn.addEventListener('pointerdown',e=>{ if(btn.disabled) return; y0=e.clientY; moved=false; btn.classList.add('press'); try{btn.setPointerCapture(e.pointerId);}catch(_){} });
  btn.addEventListener('pointermove',e=>{ if(y0==null) return; const dy=e.clientY-y0; if(dy<-6){ moved=true; btn.style.transform=`translateY(${Math.max(-90,dy)}px)`; } });
  const up=e=>{ if(y0==null) return; const dy=e.clientY-y0; y0=null; btn.classList.remove('press'); btn.style.transform='';
    if(dy<-45){ hideInfo(); humanAct(id, castTarget(a,id)); }
    else if(!moved) showInfo(id,a); };
  btn.addEventListener('pointerup',up); btn.addEventListener('pointercancel',()=>{ y0=null; btn.style.transform=''; btn.classList.remove('press'); });
}
function showInfo(id,a){
  const k=SK[id]; const el=$('#abinfo'); const L=a.m.skl[id]||1; const c=skCost(id,L);
  el.innerHTML=`<div class="abi-card"><div class="abi-h">${icon(skIconKey(id),EL[k.el].c,34)}<div><b>${k.n} <span class="sl">Lv ${L}</span></b><span>${c?c+' mana':'Free'} · ${EL[k.el].n}</span></div></div><p>${skillDesc(id,L)}</p><div class="abi-f"><span>Swipe up on it to cast</span><button class="castb" id="castnow">Cast</button></div></div>`;
  el.classList.add('show');
  $('#castnow').onclick=()=>{ hideInfo(); if(a.m.mp>=c) humanAct(id, castTarget(a,id)); };
  clearTimeout(showInfo._t); showInfo._t=setTimeout(hideInfo,5000);
}
function hideInfo(){ const el=$('#abinfo'); if(el) el.classList.remove('show'); }
function humanAct(skill, target){
  const b=B.b;
  if(B.net && B.net.role==='guest'){ NET.sendAction({skill,target}); renderBattle(); return; }
  act(b,{skill,target}); afterAct();
}

// ===== battle animation =====
function fEl(s,i){ return document.querySelector(`#battle .fighter[data-s="${s}"][data-i="${i}"]`); }
function fCenter(el){ const r=el.querySelector('.fart').getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height*0.5]; }
function animateBattle(root,b,animating){
  const evs=b.ev||[]; const actE=evs.find(e=>e.k==='act'); const sk=actE&&SK[actE.sk]; const actIdx=actE?evs.indexOf(actE):-1;
  let T=0;
  if(actE && animating){
    const ac=fEl(actE.s,actE.i); const left = actE.s===B.mySide;
    const nm=document.createElement('div'); nm.className='castname '+(left?'l':'r'); nm.textContent=sk.n; root.appendChild(nm); setTimeout(()=>nm.remove(),1300);
    const acf=fEl(actE.s,actE.i); if(acf){ acf.classList.add('casting'); setTimeout(()=>acf.classList.remove('casting'),1300); }
    const hits=evs.filter(e=>e.k==='hit' && e.s!==actE.s);
    const ranged = sk.pow && sk.el!=='neutral';
    if(ac) ac.classList.add(sk.pow&&!ranged?(left?'dash-r':'dash-l'):sk.pow?(left?'lunge-r':'lunge-l'):'cast');
    if(ac && !sk.pow && sk.t==='self'){ const sw=document.createElement('i'); sw.className='swoosh '+(left?'l':'r'); ac.appendChild(sw); setTimeout(()=>sw.remove(),900); }
    if(ranged && ac){
      T=520; const [x0,y0]=fCenter(ac); const seen=new Set();
      hits.forEach(h=>{ const key=h.s+'-'+h.i; if(seen.has(key)) return; seen.add(key); const tc=fEl(h.s,h.i); if(!tc) return; const [x1,y1]=fCenter(tc);
        const p=document.createElement('div'); p.className='proj'+(sk.el==='bolt'?' bolt':''); p.style.setProperty('--c',EL[sk.el].c); p.style.left=x0+'px'; p.style.top=y0+'px';
        if(sk.el==='bolt') p.style.rotate=(Math.atan2(y1-y0,x1-x0)*180/Math.PI+90)+'deg';
        document.body.appendChild(p); setTimeout(()=>{ p.style.transform=`translate(${x1-x0}px,${y1-y0}px)`; },170); setTimeout(()=>p.remove(),520); });
    } else T = sk.pow?260:300;
  }
  let after=0;
  if(animating) evs.forEach((e,k)=>{
    if(e.k==='act'||e.k==='enter') return;
    const late = e.k==='dot'||e.k==='stun'||e.end; if(e.k==='miss') e.k='buff', e.b='evade';
    const delay = late ? T+600+after : T + (e.k==='hit'? Math.max(0,k-actIdx-1)*110 : 80);
    if(late) after+=420;
    setTimeout(()=>{
      const el=fEl(e.s,e.i); if(!el||!B||B.b!==b) return;
      const f=document.createElement('span'); f.className='float2 '+e.k+(e.crit?' crit':'');
      f.textContent = (e.k==='heal'||e.k==='mana')?`+${e.v}`: e.k==='buff'?(BUFF_N[e.b]||''): e.k==='stun'?'Stunned!': e.k==='miss'?'Dodged!': (e.v===0&&e.blocked?'Blocked!':`-${e.v}`);
      if(e.k==='hit'||e.k==='dot'){
        el.classList.remove('shake','hitflash'); void el.offsetWidth; el.classList.add('shake','hitflash'); setTimeout(()=>el.classList.remove('hitflash','shake'),460);
        const [x,y]=fCenter(el); const bu=document.createElement('div'); bu.className='burst'; bu.style.setProperty('--c',EL[e.el]?EL[e.el].c:'#fff'); bu.style.left=x+'px'; bu.style.top=y+'px'; document.body.appendChild(bu); setTimeout(()=>bu.remove(),460);
        if(e.eff==='up'){ const x2=document.createElement('span'); x2.className='eff2'; x2.textContent='Super effective!'; el.appendChild(x2); setTimeout(()=>x2.remove(),1300); }
        if(e.crit){ const c=document.createElement('span'); c.className='eff2 crit'; c.textContent='Critical!'; el.appendChild(c); setTimeout(()=>c.remove(),1300); root.classList.remove('quake'); void root.offsetWidth; root.classList.add('quake'); }
      }
      if(e.k==='heal'){ for(let n=0;n<7;n++){ const s=document.createElement('i'); s.className='sparkle'; s.style.left=(15+Math.random()*70)+'%'; s.style.animationDelay=(n*0.07)+'s'; el.appendChild(s); setTimeout(()=>s.remove(),1300);} }
      if(e.k==='buff'){ const r=document.createElement('i'); r.className='ring2'; r.style.setProperty('--c', (ST_ICON[e.b]||['','#5e8bff'])[1]); el.appendChild(r); setTimeout(()=>r.remove(),800); }
      el.appendChild(f); setTimeout(()=>f.remove(),1300);
      syncFighter(b,e.s,e.i);
    }, delay);
  });
  const fin=()=>{ if(!B||B.b!==b) return; b.sides.forEach((sd,s)=>sd.mons.forEach((m,i)=>syncFighter(b,s,i))); syncHud(b); };
  if(animating) setTimeout(fin, T+600+after+80); else fin();
  B.prev={}; b.sides.forEach((sd,s)=>sd.mons.forEach((m,i)=>{ B.prev[s+'-'+i]={hp:m.hp,mp:m.mp}; }));
}
function syncFighter(b,s,i){
  const el=fEl(s,i); if(!el) return; const m=b.sides[s].mons[i];
  const bar=el.querySelector('.fhp i'); if(bar) bar.style.width=Math.max(0,m.hp/m.maxhp*100)+'%';
  el.classList.toggle('ko', m.hp<=0);
  syncHud(b);
}
function syncHud(b){
  document.querySelectorAll('#battle .bhp').forEach(p=>{ const m=b.sides[+p.dataset.hs].mons[+p.dataset.hi]; const l=p.querySelectorAll('.lb');
    l[0].querySelector('i').style.width=Math.max(0,m.hp/m.maxhp*100)+'%'; l[0].querySelector('b').textContent=`${m.hp} / ${m.maxhp} life`;
    l[1].querySelector('i').style.width=Math.max(0,m.mp/m.maxmp*100)+'%'; l[1].querySelector('b').textContent=`${m.mp} / ${m.maxmp} mana`; });
}

// ===== results =====
function rewardPopup({title, cash, xp, mush, mons, lose, extra, onClose}){
  const sh=sheet(`<div class="rw ${lose?'lose':''}"><div class="rw-t">${title}</div>
    ${cash?`<div class="rw-cash"><b>$ +${cash}</b><span>dollars</span></div>`:''}${mush?`<div class="rw-cash m"><b>🍄 +${mush}</b><span>mushrooms</span></div>`:''}
    <div class="rw-mons">${mons.map(({m,r})=>`<div class="rw-mon"><div class="runner">${monSVG(m.sp,m.lvl)}</div>${r&&r.evo?'<span class="tag evo">Evolved!</span>':r&&r.lv?`<span class="tag">Level up! Lv ${m.lvl}</span>`:''}</div>`).join('')}</div>
    <div class="rw-xp">+${xp} <b>XP</b></div><button class="btn gbtn" id="rwok">Continue</button></div>`,{cls:'reward', onClose});
  sh.body.querySelector('#rwok').onclick=sh.close;
  return sh;
}
function finishBattle(){
  if(!B) return; const b=B.b; const mode=B.mode; const meta=B.meta;
  if(B.net) NET.leaveMatch();
  if(mode==='local'){ closeBattle(); return; }
  const win = b.over && b.winner===B.mySide;
  if(mode==='campaign' && meta.task!=null){
    const zi=meta.zi, k=meta.task; const t=taskList(zi)[k]; const m=monBy(meta.uid); const z=ZONES[zi];
    let cash=0, xp=0, mush=0; const extra=[]; let partial=false, zoneJust=false;
    if(win){ S.stats.wins++; const pr=taskProg(zi); pr[k]=Math.min(t.reps,pr[k]+1); if(pr[k]>=t.reps){ cash=t.cash; xp=t.xp; } else partial=`${pr[k]} / ${t.reps}`;
      if(t.t==='boss' && (S.zones[z.id]||0)<4){ S.zones[z.id]=4; mush=5; zoneJust=true;
        if(zi>0){ const pool=SP.filter(x=>x.fam===z.fam); // each of the zone's monsters has an equal chance
          const nm=addMon(pool[Math.floor(Math.random()*pool.length)].id, Math.max(2,z.lv)); if(S.team.length<3) S.team.push(nm.uid); extra.push([`You found a new monster!`,nm]); } }
    }
    S.cash=(S.cash|0)+cash; S.mush+=mush;
    const r=m?giveXp(m,xp):null;
    persist(); closeBattle(); openTasks(zi);
    const tutDone = S.tut===3 && win; if(tutDone){ S.tut=4; persist(); }
    if(partial&&!tutDone){ toast(`Victory! ${partial}`); return; }
    rewardPopup({title:win?'VICTORY!':'DEFEAT', lose:!win, cash, xp, mush, mons:m?[{m,r}]:[], onClose:async()=>{
      if(zoneJust) await zoneCompleteScreen(zi);
      for(const [tt,mm] of extra){ await new Promise(res=>{ const s=reveal2(mm,tt,res); }); }
      if(tutDone){ await lilaSay(["See? It's that easy!","Next, let's visit the shop and pick up some mana wood. It gives your monster more mana!"]); S.tut=5; persist(); if(TASKSH) TASKSH.sh.close(); setTimeout(()=>pointAt('[data-p="shop"]'),400); }
      showLevelUps();
    }});
    return;
  }
  const foeSide=1-B.mySide; const avg=b.sides[foeSide].mons.reduce((t,m)=>t+m.lvl,0)/b.sides[foeSide].mons.length;
  let xp=Math.round((15+avg*7)*(win?1:0.3)), cash=0, mush=0;
  if(win){ S.stats.wins++; S.stats.arenaWins++; if(mode==='rival'){ cash=Math.round(20+avg*6); } else if(mode==='pvp'){ cash=Math.round(40+avg*8); mush=2; S.stats.pvpWins++; xp=Math.round(xp*1.3); } }
  S.cash=(S.cash|0)+cash; S.mush+=mush;
  const res=b.sides[B.mySide].mons.map((bm,i)=>{ const m=monBy(bm.uid||(B.myUids&&B.myUids[i])); if(!m) return null; return {m, r:giveXp(m,xp)}; }).filter(Boolean);
  persist(); closeBattle();
  rewardPopup({title:win?'VICTORY!':'DEFEAT', lose:!win, cash, xp, mush, mons:res, onClose:showLevelUps});
}
function reveal2(m,title,done){
  const sp=SPI[m.sp];
  const sh=sheet(`<div class="reveal"><p class="muted">${title}</p><div class="mon-hero pop" style="--c:${EL[FAM[sp.fam].el].c}">${monSVG(m.sp,m.lvl)}</div><h2>${sp.n}</h2><p class="muted">${FAM[sp.fam].n} · Lv ${m.lvl} ${elChip(FAM[sp.fam].el)}</p><button class="btn gbtn" id="ok">Nice!</button></div>`,{onClose:done});
  sh.body.querySelector('#ok').onclick=sh.close;
}
function reveal(m,title){ reveal2(m,title,()=>{}); }

// ===== shop =====
function viewShop(){
  return `<h1>Shop</h1>
    <button class="hatch" id="hatch"><div class="egg"></div><div><b>Mystery egg</b><span>Hatches a random monster</span></div><span class="price">10 🍄</span></button>
    <button class="hatch" id="hatchc"><div class="egg plain"></div><div><b>Monster egg</b><span>A random monster, a few levels lower</span></div><span class="price g">$${eggCost()}</span></button>
    <button class="hatch" id="refill"><div class="egg bolt">⚡</div><div><b>Energy refill</b><span>Fill your energy to max</span></div><span class="price">15 🍄</span></button>
    <p class="muted small center">Earn dollars from activities and battles. Mushrooms come from bosses, quests and live wins.</p>`;
}
function eggCost(){ return 150+highLvl()*15; }
function hatchCash(){
  const c=eggCost(); if((S.cash|0)<c) return toast(`You need $${c}`);
  S.cash-=c; S.stats.hatches++; const sp=SP[Math.floor(Math.random()*SP.length)]; const m=addMon(sp.id, Math.max(1,Math.floor(highLvl()*0.4)));
  if(S.team.length<3) S.team.push(m.uid); persist(); render(); reveal(m,'Your egg hatched!');
}
function bindView(v){
  v=v||document;
  v.querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>openZone(+b.dataset.zone));
  v.querySelectorAll('[data-mon]').forEach(b=>b.onclick=()=>openMon(b.dataset.mon));
  v.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>claim(b.dataset.q));
  v.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>NET.challenge(b.dataset.ch));
  const h=$('#hatch',v); if(h) h.onclick=hatch;
  const hc=$('#hatchc',v); if(hc) hc.onclick=hatchCash;
  const rf=$('#refill',v); if(rf) rf.onclick=()=>{ tickEnergy(); if(S.energy>=S.maxEnergy) return toast('Energy is already full'); if(S.mush<15) return toast('You need 15 🍄'); S.mush-=15; S.energy=S.maxEnergy; S.energyAt=Date.now(); persist(); render(); toast('Energy refilled!'); };
  const r=$('#rival',v); if(r) r.onclick=()=>{ if(!S.team.length) return toast('Add a monster to your team'); if(!spend(1)) return; persist(); startBattle({mode:'rival', foe:rivalTeam()}); };
  const l=$('#local',v); if(l) l.onclick=openLocal;
}

// ===== Lila story + pointer =====
function lilaStory(lines){
  return new Promise(res=>{
    const w=document.createElement('div'); w.className='story';
    let k=0;
    const finish=()=>{ w.classList.add('out'); setTimeout(()=>w.remove(),300); res(); };
    const draw=()=>{ w.innerHTML=`<div class="story-bg">${sceneBG()}</div><button class="skipb">SKIP</button><div class="story-lila">${lilaSVG()}</div>
      <div class="story-box"><div class="story-name">Lila</div><p>${lines[k]}</p><span class="story-next">Tap to continue ▸</span></div>`;
      w.querySelector('.skipb').onclick=e=>{ e.stopPropagation(); finish(); };
      w.onclick=()=>{ k++; if(k<lines.length) draw(); else finish(); }; };
    draw(); document.body.appendChild(w);
  });
}
function pointAt(sel){
  document.querySelectorAll('.garrow2').forEach(x=>x.remove());
  const t=document.querySelector(sel); if(!t) return;
  const r=t.getBoundingClientRect(); const a=document.createElement('div'); a.className='garrow2';
  a.style.left=(r.left+r.width/2-22)+'px'; a.style.top=Math.max(4,r.top-70)+'px';
  document.body.appendChild(a);
  const rm=()=>{ a.remove(); document.removeEventListener('pointerdown',rm,true); };
  setTimeout(()=>document.addEventListener('pointerdown',rm,true),50); setTimeout(rm,9000);
}
async function onboarding(){
  await lilaStory(["Hey there! You must be the new trainer. Welcome to Monster Realm!","I'm Lila. I'll show you around and help you get started.","First things first — every trainer needs a partner monster. Let's pick yours!"]);
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
    S.name=nm.value.trim().slice(0,16); S.tut=0;
    const pool=SP.filter(s=>s.fam===chosen); const m=addMon(pool[Math.floor(Math.random()*pool.length)].id,1); S.team=[m.uid]; S.zoneMon=m.uid;
    persist(); sh.close(); render(); NET.updatePresence();
    reveal2(m,'Your partner is…', async()=>{
      await lilaSay([`Great, now that you have ${SPI[m.sp].n} with you, let's get started!`]);
      S.tut=1; persist(); pointAt('[data-p="zones"]');
    });
  };
}

// ===== save migration + boot =====
async function boot(){
  S = Object.assign(freshSave(), loadLocal()||{});
  S.stats=Object.assign(freshSave().stats, S.stats||{});
  if(S.cash==null) S.cash=50; if(S.tut==null) S.tut = S.name?99:0;
  document.querySelectorAll('#bar [data-p]').forEach(b=>b.onclick=()=>openPanel(b.dataset.p));
  render();
  setInterval(()=>{ if(!S) return; const e=S.energy; tickEnergy(); if(e!==S.energy) persist(); if(!B){ renderHUD(); } },1000);
  initDb(); NET.init();
  await splash();
  if(!S.name) onboarding();
}
