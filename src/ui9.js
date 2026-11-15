// ===== V9: arena result screen + trainer profiles =====
const MOTTO_MAX=60;
function myProfile(){ return {me:true, name:S.name, avatar:myAvatar(), rank:myRank(), motto:S.motto||'', team:teamMons().map(m=>({sp:m.sp,lvl:m.lvl})),
  stats:{wins:S.stats.wins|0, arenaWins:S.stats.arenaWins|0, pvpWins:S.stats.pvpWins|0, mons:S.mons.length, kinds:new Set(S.mons.map(m=>m.sp)).size, quests:Object.keys(S.quests||{}).length}}; }
function cleanProfile(p){
  p=p||{}; const st=p.stats||{}; const n=v=>Math.max(0,Math.min(99999,v|0));
  return {name:String(p.name||'Trainer').slice(0,16), avatar:sanitizeAv(p.avatar)||{t:'trainer',i:0}, rank:Math.max(0,Math.min(9999,p.rank|0))||1000,
    motto:String(p.motto||'').slice(0,MOTTO_MAX), team:sanitizeTeam(p.team).map(m=>({sp:m.sp,lvl:m.lvl})), cid:p.cid?String(p.cid).slice(0,40):null,
    stats:{wins:n(st.wins),arenaWins:n(st.arenaWins),pvpWins:n(st.pvpWins),mons:n(st.mons),kinds:n(st.kinds),quests:n(st.quests)}};
}
// share profile info in presence + challenge/accept
const _pres9=NET.updatePresence;
NET.updatePresence=function(){ if(!NET.room||!S) return; const p=myProfile(); try{ NET.room.presence({cid:NET.cid, name:S.name||'Trainer', power:teamPower(), rank:myRank(), avatar:p.avatar, motto:p.motto, team:p.team, stats:p.stats, busy:!!B}); }catch(e){} };
const _emitWrap=(fn)=>function(){ return fn.apply(this,arguments); };
(function(){ const r=NET.room; })();
const _startHost9=NET.startHost, _startGuest9=NET.startGuest;
NET.startHost=async function(d){ await _startHost9(d); if(B) B.oppInfo=cleanProfile(Object.assign({},d,{team:d.team})); };
NET.startGuest=async function(d){ await _startGuest9(d); if(B) B.oppInfo=cleanProfile(Object.assign({},d,{team:d.team})); };

// ---- arena result ----
let ARENA_CTX=null;
const _finish9=finishBattle;
finishBattle=function(){
  if(B && (B.mode==='pvp'||B.mode==='rival') && B.b && B.b.over){
    const foe=1-B.mySide, sd=B.b.sides[foe];
    const info=B.oppInfo||{};
    ARENA_CTX={mode:B.mode, win:B.b.winner===B.mySide, rank0:myRank(),
      opp:cleanProfile({name:sd.name, avatar:B.oppAvatar||info.avatar, rank:B.mode==='pvp'?(B.oppRank||info.rank):B.oppRank, motto:info.motto, stats:info.stats, cid:info.cid,
        team:sd.mons.map(m=>({sp:m.sp,lvl:m.lvl}))})};
    ARENA_CTX.opp.rival=B.mode==='rival';
  }
  return _finish9();
};
const _reward9=rewardPopup;
rewardPopup=function(o){
  if(!ARENA_CTX) return _reward9(o);
  const c=ARENA_CTX; ARENA_CTX=null; const d=c.mode==='pvp'?myRank()-c.rank0:null;
  S.lastRankD=null; persist();
  const sh=sheet(`<div class="ares">
    <div class="ares-ban ${c.win?'':'lose'}"><div class="ares-t">${c.win?'VICTORY!':'DEFEAT'}</div>
      <div class="ares-r">${rankBadge(myRank(),34)}<b>${myRank()}</b>${d!=null&&d!==0?`<em class="${d>0?'up':'dn'}">${d>0?'+':''}${d}</em>`:''}</div>
      <div class="ares-c"><span>$</span> ${o.cash|0} won${o.mush?` · 🍄 +${o.mush}`:''} · +${o.xp} XP</div></div>
    <div class="ares-opp"><div class="ares-lab">you battled against:</div>
      <div class="ares-row"><div class="ares-av">${avatarSVG(c.opp.avatar)}</div><div class="ares-nm"><b>${esc(c.opp.name)}</b><span>${rankBadge(c.opp.rank,20)} ${c.opp.rank}</span></div>
        <div class="ares-team">${c.opp.team.map((m,k)=>`<div class="ares-m" style="animation-delay:${.15+k*.12}s">${monSVG(m.sp,m.lvl)}<span class="lvb">${m.lvl}</span></div>`).join('')}</div></div>
      <div class="ares-btns">${c.opp.rival?'':`<button class="gbtn2 blue" id="arprof">PROFILE</button>`}<button class="gbtn2 red" id="ardone">DONE ✓</button></div></div></div>`,
    {cls:'full arenares', onClose:()=>{ o.onClose&&o.onClose(); }});
  sh.body.querySelector('#ardone').onclick=sh.close;
  const pb=sh.body.querySelector('#arprof'); if(pb) pb.onclick=()=>openProfile(c.opp);
  return sh;
};

// ---- trainer profile ----
function openProfile(p){
  const me=!!p.me; let P=me?myProfile():p;
  const sh=sheet(`<div class="tprof"></div>`,{cls:'full'});
  const draw=()=>{
    if(me) P=myProfile();
    const online = me || (P.cid && NET.peers.some(x=>x.cid===P.cid && !x.me));
    const busy = !me && NET.peers.some(x=>x.cid===P.cid && x.busy);
    const team=P.team.length?P.team:[];
    sh.body.querySelector('.tprof').innerHTML=`
      <div class="tp-top"><button class="backb" id="tpb">Back</button>
        <div class="tp-plate"><div class="tp-av">${avatarSVG(P.avatar)}</div><div class="tp-id"><div class="tp-nm"><b>${esc(P.name)}</b>${online?'<i class="dot on"></i>':'<i class="dot"></i>'}</div><div class="tp-rk">${rankBadge(P.rank,22)} ${P.rank} · ${rankOf(P.rank)[1]}</div></div></div></div>
      <div class="tp-motto">${me?`<button id="tpedit">${P.motto?esc(P.motto):'Tap to write your motto'} ✎</button>`:(P.motto?esc(P.motto):'<span class="muted">No motto yet</span>')}</div>
      <div class="tp-field">${sceneBG()}<div class="tp-team">${team.map((m,k)=>`<div class="tp-m" style="animation-delay:${k*.1}s">${monSVG(m.sp,m.lvl)}<span class="lvb">${m.lvl}</span></div>`).join('')||'<p class="muted">No team</p>'}</div></div>
      <div class="tp-bar"><button class="nb2 blue" data-tp="stats">STATS</button><button class="nb2 blue" data-tp="awards">AWARDS</button>
        ${me?'':`<button class="nb2 red" data-tp="spar" ${online&&!busy&&P.cid?'':'disabled'}>${busy?'IN BATTLE':online?'SPAR ⚡':'OFFLINE'}</button>`}</div>`;
    sh.body.querySelector('#tpb').onclick=sh.close;
    const ed=sh.body.querySelector('#tpedit'); if(ed) ed.onclick=()=>{
      const s2=sheet(`<h2 class="game-h">Your motto</h2><input id="mtin" maxlength="${MOTTO_MAX}" value="${esc(S.motto||'')}" placeholder="Say something about yourself" style="width:100%;font:16px -apple-system,system-ui;padding:12px;border-radius:10px;border:0;box-shadow:inset 0 0 0 1.5px #c9b88a"><div class="actions"><button class="btn gbtn" id="mtok">Save</button></div>`);
      s2.body.querySelector('#mtok').onclick=()=>{ S.motto=s2.body.querySelector('#mtin').value.trim().slice(0,MOTTO_MAX); persist(); NET.updatePresence(); s2.close(); draw(); };
    };
    sh.body.querySelectorAll('[data-tp]').forEach(b=>b.onclick=()=>{
      const k=b.dataset.tp, st=P.stats||{};
      if(k==='stats') sheet(`<h2 class="game-h">${esc(P.name)}'s Stats</h2><div class="list">
        <div class="row"><div><b>Battles won</b></div><b>${st.wins|0}</b></div><div class="row"><div><b>Arena wins</b></div><b>${st.arenaWins|0}</b></div>
        <div class="row"><div><b>Live wins</b></div><b>${st.pvpWins|0}</b></div><div class="row"><div><b>Monsters owned</b></div><b>${st.mons|0}</b></div>
        <div class="row"><div><b>Kinds discovered</b></div><b>${st.kinds|0} / ${SP.length}</b></div><div class="row"><div><b>Rank</b></div><b>${P.rank} · ${rankOf(P.rank)[1]}</b></div></div>`);
      else if(k==='awards'){ const done=me?QUESTS.filter(q=>S.quests[q.id]):null; const n=me?done.length:(st.quests|0);
        sheet(`<h2 class="game-h">Awards</h2><p class="muted">${n} of ${QUESTS.length} earned</p>${me?`<div class="list">${QUESTS.map(q=>`<div class="row ${S.quests[q.id]?'':'done'}"><div><b>${q.n}</b></div>${S.quests[q.id]?'<span class="ok">🏆</span>':'<span class="muted small">Locked</span>'}</div>`).join('')}</div>`:''}`); }
      else if(k==='spar'){ sh.close(); NET.challenge(P.cid); }
    });
  };
  draw();
}
// entry points: Menu "My Profile", Social rows
const _menu9=PANELS.menu;
PANELS.menu=function(){ return _menu9().replace('<div class="menugrid">',`<div class="menugrid"><button class="mg" data-go="profile">${avatarSVG(myAvatar())}<b>My Profile</b></button>`); };
const _social9=PANELS.social;
PANELS.social=function(){ return _social9().replace(/<div class="row"><div class="soc-av">/g,(m,o)=>m); };
const _bind9=bindView;
bindView=function(v){
  _bind9(v); v=v||document;
  v.querySelectorAll('[data-go="profile"]').forEach(b=>b.onclick=()=>{ PANEL&&PANEL.sh.close(); setTimeout(()=>openProfile({me:true}),120); });
  v.querySelectorAll('.soc-av').forEach(a=>{ const row=a.closest('.row'); const ch=row&&row.querySelector('[data-ch]'); if(!ch) return; row.classList.add('tapp');
    row.onclick=e=>{ if(e.target.closest('button')) return; const peer=NET.peers.find(p=>p.cid===ch.dataset.ch); if(peer) openProfile(cleanProfile(peer)); }; });
};
sceneBG=function(){ return sceneHTML().replace(/<button[\s\S]*?<\/button>/g,''); };

// monsters have no types: hide type tags
elChip=function(){ return ''; };
