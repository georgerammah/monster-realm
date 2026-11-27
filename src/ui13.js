function useKbd(){ return matchMedia('(pointer:coarse)').matches; }
// ===== V13: Ability Studio (admin) — define every move without code =====
const MOVE_KINDS=[['hit','Attack'],['dot','Damage over time'],['shield','Shield'],['buff','Buff (self)'],['debuff','Debuff (foe)'],['heal','Heal'],['drain','Steal (life/mana)'],['passive','Passive']];
const BUFF_TYPES=[['crit','Critical chance (2x)'],['evade','Dodge chance'],['focus','Fire damage up'],['charge','All damage up'],['mshield','Mana soaks damage'],['absorb','Damage taken → mana'],['pers','Damage reduction']];
const PAS_TYPES=[['fury','+% physical damage'],['pounce','+% all damage'],['roots','Heal % each turn'],['grounded','Resist lightning'],['sweaty','Resist fire & water'],['thick','Resist all damage'],['hard','Resist physical'],['camel','+ mana each turn']];
const SHIELD_TYPES=[['bubble','Physical, fire & lightning'],['fsh','Fire & physical'],['lsh','Any damage (lightning)'],['nsh','Any damage (nature)'],['ash','Everything (invulnerable)']];
const DOT_TYPES=[['burn','Burn'],['poison','Poison'],['storm','Storm']];
// field spec: [key, label, type, kinds, help]
//  types: pair = [Lv1, +per level] number; ppair = same as % ; num; pct; bool; sel:<list>
const MOVE_FIELDS=[
  ['dmg','Fixed damage','pair',['hit'],'Damage that ignores the attack stat'],
  ['m','% of attack','ppair',['hit'],'Uses the monster\'s attack stat (physical style)'],
  ['hits','Number of hits','num',['hit']],
  ['tick','Damage each turn','pair',['dot']],
  ['dot','DoT type','sel:DOT',['dot']],
  ['turns','Lasts (turns)','num',['dot','shield','buff','debuff','heal']],
  ['amt','Shield amount','pair',['shield']],
  ['sh','Blocks','sel:SHIELD',['shield']],
  ['buff','Buff type','sel:BUFF',['buff']],
  ['v','Strength','ppair',['buff','debuff','passive'],'Percent for most types (Camel Back = flat mana)'],
  ['p','Passive type','sel:PAS',['passive']],
  ['heal','Heal % of max life','ppair',['heal']],
  ['hot','Heal % each turn','ppair',['heal'],'Regrowth style; leave 0 for instant heal'],
  ['cleanse','Removes burn/poison/storm/cripple','bool',['heal']],
  ['stealHp','Steal life (fixed)','pair',['drain']],
  ['steal','Steal mana (fixed)','pair',['drain']],
  ['leechL','Life steal % of damage','ppair',['hit']],
  ['mpAtk','Steal mana (% of attack)','ppair',['hit']],
  ['burnmp','Burn foe mana (fixed)','pair',['hit']],
  ['recoil','Recoil % to self','pct',['hit']],
  ['stun','Stun chance','ppair',['hit']],
  ['dbl','Chance for 2x damage','pct',['hit']],
  ['pierce','Ignores shields','bool',['hit']],
  ['burn','Burn chance','ppair',['hit']],
  ['btick','Burn damage each turn','pair',['hit']],
  ['stormTick','Shock damage each turn after hit','pair',['hit']],
  ['stormTurns','Shock turns','num',['hit']],
  ['weaken','Weaken foe %','ppair',['hit']],
  ['selfShield','Shield self for','pair',['hit']],
  ['selfevade','Dodge chance after','ppair',['hit']],
  ['burnBonus','Bonus vs burning foe','pct',['hit']],
  ['missingBonus','Bonus by own missing life','pct',['hit']],
];
const SELS={DOT:DOT_TYPES,SHIELD:SHIELD_TYPES,BUFF:BUFF_TYPES,PAS:PAS_TYPES};
const DEFAULT_SK=JSON.parse(JSON.stringify(SK));
let MOVE_OVR={};
function applyMoveOverrides(o){ MOVE_OVR=o&&typeof o==='object'?o:{}; Object.keys(SK).forEach(id=>{ if(!(id in DEFAULT_SK)) delete SK[id]; });
  Object.keys(DEFAULT_SK).forEach(id=>{ SK[id]=JSON.parse(JSON.stringify(DEFAULT_SK[id])); });
  Object.entries(MOVE_OVR).forEach(([id,v])=>{ if(v===null){ delete SK[id]; return; } SK[id]=JSON.parse(JSON.stringify(v)); if(!EL[SK[id].el]) SK[id].el='neutral'; }); }
try{ applyMoveOverrides(JSON.parse(localStorage.getItem('mr-moves')||'{}')); }catch(_){}
(async()=>{ try{ const db=window.claude&&await window.claude.use('db'); if(!db) return; const v=await db.collection('config').doc('moves').get();
  if(v&&v.moves){ applyMoveOverrides(v.moves); try{ localStorage.setItem('mr-moves',JSON.stringify(v.moves)); }catch(_){} if(!B) try{ render(); }catch(_){} } }catch(_){} })();

// custom descriptions with placeholders
skillDesc=(function(prev){ return function(id,L){ const s=SK[id]; L=L||1; if(!s) return '';
  if(s.desc){ const f=x=>Math.round(x), P=x=>Math.round(x*100)+'%';
    const map={dmg:s.dmg?f(lv(s.dmg,L)):'', pct:s.m?P(lv(s.m,L)):'', cost:skCost(id,L), tick:s.tick?f(lv(s.tick,L)):s.stormTick?f(lv(s.stormTick,L)):'', turns:s.turns||s.stormTurns||'', hits:s.hits||1,
      amt:s.amt?f(lv(s.amt,L)):s.healFlat?f(lv(s.healFlat,L)):'', v:s.v?(lv(s.v,L)<1?P(lv(s.v,L)):f(lv(s.v,L))):'', heal:s.heal?P(lv(s.heal,L)):s.hot?P(lv(s.hot,L)):'',
      steal:s.stealHp?f(lv(s.stealHp,L)):s.steal?f(lv(s.steal,L)):'', leech:s.leechL?P(lv(s.leechL,L)):'', mana:s.mpAtk?P(lv(s.mpAtk,L)):s.burnmp?f(lv(s.burnmp,L)):'',
      stun:s.stun?P(lv(s.stun,L)):'', recoil:s.recoil?P(s.recoil):'', dbl:s.dbl?P(s.dbl):'', soak:s.soak?P(Array.isArray(s.soak)?lv(s.soak,L):s.soak):'', scorch:s.scorch?P(Array.isArray(s.scorch)?lv(s.scorch,L):s.scorch):'', wall:s.selfShield?f(lv(s.selfShield,L)):''};
    return s.desc.replace(/\{(\w+)\}/g,(a,k)=>k in map?map[k]:a); }
  if(MOVE_OVR[id] && (!DEFAULT_SK[id] || DEFAULT_SK[id].k!==s.k)) return skillDescBase(id,L);
  return prev(id,L); }; })(skillDesc);

// ---------- unique usernames + server-decided admins ----------
let ADMIN=false; try{ ADMIN=localStorage.getItem('mr-admin')==='1'; }catch(_){}
function setAdmin(v){ ADMIN=!!v; try{ localStorage.setItem('mr-admin',ADMIN?'1':'0'); localStorage.removeItem('mr-admin-key'); }catch(_){}
  SUBMENUS.menu=SUBMENUS.menu.filter(x=>x[0]!=='Ability Studio'&&x[0]!=='Players'); if(ADMIN){ SUBMENUS.menu.push(['Players',()=>openPlayers()]); SUBMENUS.menu.push([EYES_CLASSIC?'Eye style: Classic':'Eye style: New',()=>{ try{ localStorage.setItem('mr-eyes',EYES_CLASSIC?'new':'classic'); }catch(_){} location.reload(); }]); SUBMENUS.menu.push(['Ability Studio',()=>openStudio()]); } }
setAdmin(ADMIN);
function nameError(err){ return err==='taken'?'That name is already taken. Try another one!':err==='invalid'?'Names can be 2–16 letters, numbers, spaces, - _ or .':"Couldn't check that name right now. Try again."; }
async function claimName(name){ if(!window.MR_ACCT) return {ok:1}; try{ const r=await Promise.race([MR_ACCT.claim(name),new Promise(res=>setTimeout(()=>res({ok:0,err:'net'}),8000))]); if(r&&r.ok) setAdmin(r.admin); return r||{ok:0,err:'net'}; }catch(_){ return {ok:0,err:'net'}; } }
function askNewName(msg){ return new Promise(res=>{
  const w=document.createElement('div'); w.className='abox-wrap on';
  w.innerHTML=`<div class="abox"><p>${msg}</p><input id="nn" maxlength="16" autocomplete="off" value="${esc(S.name||'')}" style="width:100%;padding:10px;border-radius:8px;border:0;font:17px system-ui;margin-bottom:10px;box-sizing:border-box"><p class="nn-err" style="min-height:1.2em;font-size:14px;color:#ffd0c8;margin:0 0 8px"></p><button class="abox-ok" id="nok">Save name</button></div>`;
  document.body.appendChild(w); const inp=w.querySelector('#nn'), er=w.querySelector('.nn-err'); setTimeout(()=>inp.focus(),60);
  w.querySelector('#nok').onclick=async()=>{ const v=inp.value.trim(); if(!v) return; er.textContent='Checking…'; const r=await claimName(v); if(!r.ok){ er.textContent=nameError(r.err); return; }
    S.name=v.slice(0,16); persist(); renderHUD&&renderHUD(); NET.updatePresence(); w.remove(); res(v); }; }); }
// on launch: make sure this player's name is claimed, and learn admin status
(async()=>{ if(!window.MR_ACCT) return; await new Promise(r=>setTimeout(r,2500)); try{
  const me=await MR_ACCT.whoami(); if(!me||!me.ok) return;
  setAdmin(!!me.admin); if(me.banned){ showBanned(); return; } if(me.rename){ await askNewName('Please choose a new trainer name.'); return; } if(me.name) return;
  if(S&&S.name&&S.tut>=0){ const r=await claimName(S.name); if(!r.ok&&r.err==='taken') await askNewName(`Someone already has the name "${esc(S.name)}". Pick a new trainer name:`); }
}catch(_){} })();
// onboarding: the name must be free before you can start
document.addEventListener('click',async e=>{ const go=e.target.closest&&e.target.closest('#go'); if(!go||!window.MR_ACCT||go.dataset.ok) return; const box=go.closest('.onb')||document; const nm=box.querySelector('#nm'); if(!nm) return;
  e.stopImmediatePropagation(); e.preventDefault(); const v=nm.value.trim(); if(!v) return;
  go.disabled=true; const old=go.textContent; go.textContent='Checking name…'; const r=await claimName(v); go.textContent=old; go.disabled=false;
  if(!r.ok&&(r.err==='taken'||r.err==='invalid')){ nameMsg(nameError(r.err)); if(r.err==='taken') nameTaken(v); return; } go.dataset.ok=1; go.click(); },true);
function nameTaken(v){ try{ kbClose(); }catch(_){}
  const w=document.createElement('div'); w.className='abox-wrap';
  w.innerHTML=`<div class="abox"><p><b>"${esc(v)}" is already taken.</b><br>If it's yours, restore your game with your transfer code.</p><div class="abox-row"><button class="abox-ok" id="ntn">New name</button><button class="abox-ok" id="nty">Restore</button></div></div>`;
  document.body.appendChild(w); requestAnimationFrame(()=>w.classList.add('on'));
  const close=()=>{ w.classList.remove('on'); setTimeout(()=>w.remove(),200); };
  w.querySelector('#ntn').onclick=()=>{ close(); const nm=document.querySelector('#nm'); if(nm){ nm.value=''; nm.dispatchEvent(new Event('input',{bubbles:true})); } };
  w.querySelector('#nty').onclick=()=>{ close(); openRestore(); }; }
// onboarding name: say what's wrong right under the box (never a hidden popup)
const NAME_OK=v=>{ const k=v.trim().toLowerCase(); return k.length>=2&&k.length<=16&&/^[a-z0-9 _.-]+$/.test(k); };
function nameMsg(t){ const nm=document.querySelector('#nm'); if(!nm) return alertBox(t); let e=document.querySelector('.nm-err'); if(!e){ e=document.createElement('p'); e.className='nm-err'; nm.insertAdjacentElement('afterend',e); } e.textContent=t||''; }
document.addEventListener('input',e=>{ if(e.target.id!=='nm') return; const v=e.target.value; const go=document.querySelector('#go');
  nameMsg(v.trim()&&!NAME_OK(v)?'Names can be 2–16 letters, numbers, spaces, - _ or .':'');
  if(go&&!NAME_OK(v)) go.disabled=true; },true);
document.addEventListener('click',e=>{ const go=e.target.closest&&e.target.closest('#go'); if(!go) return; const nm=(go.closest('.onb')||document).querySelector('#nm'); if(!nm||NAME_OK(nm.value)) return;
  e.stopImmediatePropagation(); e.preventDefault(); nameMsg('Names can be 2–16 letters, numbers, spaces, - _ or .'); },true);

// ---------- the studio ----------
let STUDIO=null;
function moveUsers(id){ return Object.values(SPI).filter(s=>(s.sk||[]).includes(id)).map(s=>s.n); }
function openStudio(){
  closeSub(); if(PANEL) PANEL.sh.close();
  const sh=sheet(`<div class="tscreen studio"></div>`,{cls:'full'});
  STUDIO={sh, sel:Object.keys(SK).filter(k=>k!=='basic').sort((a,b)=>SK[a].n.localeCompare(SK[b].n))[0], q:'', L:1, draft:null, dirty:false};
  drawStudio();
}
function studioDraft(){ if(!STUDIO.draft) STUDIO.draft=JSON.parse(JSON.stringify(SK[STUDIO.sel]||{})); return STUDIO.draft; }
function drawStudio(){
  const st=STUDIO; if(!st) return; const d=studioDraft();
  const ids=Object.keys(SK).filter(k=>k!=='basic'&&SK[k].n.toLowerCase().includes(st.q.toLowerCase())).sort((a,b)=>SK[a].n.localeCompare(SK[b].n));
  const kind=d.k||'hit';
  const val=(k,i)=>{ const v=d[k]; return Array.isArray(v)?v[i]:(i===0?v:0); };
  const fld=f=>{ const [k,label,type,kinds,help]=f; if(!kinds.includes(kind)) return '';
    const v=d[k];
    if(type==='bool') return `<label class="sf b"><input type="checkbox" data-k="${k}" data-t="bool" ${v?'checked':''}><span>${label}</span></label>`;
    if(type.startsWith('sel:')){ const opts=SELS[type.slice(4)]; return `<label class="sf"><span>${label}</span><select data-k="${k}" data-t="sel">${opts.map(([o,n])=>`<option value="${o}" ${v===o?'selected':''}>${n}</option>`).join('')}</select></label>`; }
    const isP=type==='ppair'||type==='pct', isPair=type==='pair'||type==='ppair';
    const show=x=>x==null||x===''?'':(isP?Math.round(x*1000)/10:x);
    if(isPair) return `<label class="sf"><span>${label}${help?`<i>${help}</i>`:''}</span><div class="sf2"><input inputmode="decimal" data-k="${k}" data-t="${type}" data-i="0" value="${show(val(k,0))}" placeholder="Lv 1${isP?' %':''}"><b>+</b><input inputmode="decimal" data-k="${k}" data-t="${type}" data-i="1" value="${show(val(k,1))}" placeholder="per lv"></div></label>`;
    return `<label class="sf"><span>${label}${help?`<i>${help}</i>`:''}</span><input inputmode="decimal" data-k="${k}" data-t="${type}" value="${show(v)}" placeholder="${isP?'%':''}"></label>`; };
  const L=st.L, el=EL[d.el]||EL.neutral;
  st.sh.body.querySelector('.studio').innerHTML=`<div class="plankbar"><button class="backb" id="stb">Back</button><div class="plank">Ability Studio</div><button class="findb" id="stnew">+ NEW</button></div>
   <div class="st-wrap"><div class="st-list"><input class="st-q" id="stq" placeholder="Search ${Object.keys(SK).length-1} abilities" value="${esc(st.q)}">
     ${ids.map(id=>`<button class="st-it ${id===st.sel?'on':''}" data-id="${id}">${icon(skIconKey(id),(EL[SK[id].el]||EL.neutral).c,26)}<b>${esc(SK[id].n)}</b>${MOVE_OVR[id]?'<em>edited</em>':''}</button>`).join('')}</div>
   <div class="st-ed">
     <div class="st-prev">${icon(skIconKey(st.sel),el.c,48)}<div><b>${esc(d.n||'')}</b><span>${kind==='passive'?'passive':'mana cost: '+(d.mp?Math.round(lv(d.mp,L)):0)}</span><p id="stdesc"></p></div>
       <div class="st-lv"><span>Level</span><input type="range" min="1" max="10" value="${L}" id="stl"><b>${L}</b></div></div>
     <div class="st-grid">
       <label class="sf"><span>Name</span><input data-k="n" data-t="text" value="${esc(d.n||'')}"></label>
       <label class="sf"><span>Color / element</span><select data-k="el" data-t="sel">${Object.entries(EL).map(([k,v])=>`<option value="${k}" ${d.el===k?'selected':''}>${v.n}</option>`).join('')}</select></label>
       <label class="sf"><span>Kind</span><select data-k="k" data-t="kind">${MOVE_KINDS.map(([k,n])=>`<option value="${k}" ${kind===k?'selected':''}>${n}</option>`).join('')}</select></label>
       ${kind==='passive'?'':`<label class="sf"><span>Mana cost</span><div class="sf2"><input inputmode="decimal" data-k="mp" data-t="pair" data-i="0" value="${val('mp',0)??''}" placeholder="Lv 1"><b>+</b><input inputmode="decimal" data-k="mp" data-t="pair" data-i="1" value="${val('mp',1)??''}" placeholder="per lv"></div></label>`}
       ${MOVE_FIELDS.map(fld).join('')}
       <label class="sf wide"><span>Description<i>Leave blank for automatic. Placeholders: {dmg} {pct} {cost} {tick} {turns} {hits} {amt} {v} {heal} {steal} {leech} {mana} {stun}</i></span><textarea data-k="desc" data-t="text" rows="2">${esc(d.desc||'')}</textarea></label>
     </div>
     <div class="st-foot"><span class="st-used">Used by: ${moveUsers(st.sel).join(', ')||'no monsters yet'}</span>
       ${MOVE_OVR[st.sel]?'<button class="st-b gray" id="strev">Reset to default</button>':''}<button class="st-b ${st.dirty?'':'dim'}" id="stsave">SAVE FOR ALL PLAYERS</button></div>
   </div></div>`;
  const b=st.sh.body, q=s=>b.querySelector(s);
  q('#stdesc').textContent=(()=>{ const keep=SK[st.sel]; SK[st.sel]=d; let t=''; try{ t=skillDesc(st.sel,L); }catch(_){ t='—'; } SK[st.sel]=keep; return t; })();
  q('#stb').onclick=()=>{ if(st.dirty) return confirmBox('Leave without saving your changes?','LEAVE',()=>{ st.sh.close(); STUDIO=null; }); st.sh.close(); STUDIO=null; };
  q('#stq').oninput=e=>{ st.q=e.target.value; const pos=e.target.selectionStart; drawStudio(); const n=q('#stq'); n.focus(); n.setSelectionRange(pos,pos); };
  b.querySelectorAll('.st-it').forEach(x=>x.onclick=()=>{ const go=()=>{ st.sel=x.dataset.id; st.draft=null; st.dirty=false; drawStudio(); }; if(st.dirty) confirmBox('Discard unsaved changes?','DISCARD',go); else go(); });
  q('#stl').oninput=e=>{ st.L=+e.target.value; drawStudio(); };
  b.querySelectorAll('[data-k]').forEach(inp=>{ const ev=inp.tagName==='SELECT'||inp.type==='checkbox'?'change':'change';
    inp.addEventListener(ev,()=>{ const k=inp.dataset.k, t=inp.dataset.t;
      if(t==='text'){ d[k]=inp.value; if(k==='desc'&&!inp.value) delete d.desc; }
      else if(t==='bool'){ if(inp.checked) d[k]=1; else delete d[k]; }
      else if(t==='sel') d[k]=inp.value;
      else if(t==='kind'){ d.k=inp.value; d.t=inp.value==='passive'?'passive':['hit','dot','debuff','drain'].includes(inp.value)?'enemy':'self';
        if(inp.value==='passive'){ delete d.mp; d.p=d.p||'fury'; d.v=d.v||[.1,.02]; } else if(!d.mp) d.mp=[10,5];
        if(inp.value==='dot'){ d.dot=d.dot||'poison'; d.tick=d.tick||[8,5]; d.turns=d.turns||3; } if(inp.value==='shield'){ d.sh=d.sh||'nsh'; d.amt=d.amt||[30,15]; d.turns=d.turns||3; }
        if(inp.value==='buff'){ d.buff=d.buff||'charge'; d.v=d.v||[.15,.03]; d.turns=d.turns||3; } if(inp.value==='debuff'){ d.buff='cripple'; d.v=d.v||[.15,.03]; d.turns=d.turns||3; }
        if(inp.value==='heal'&&!d.heal&&!d.hot) d.heal=[.2,.03]; if(inp.value==='drain'&&!d.stealHp&&!d.steal) d.stealHp=[15,8]; if(inp.value==='hit'&&!d.dmg&&!d.m) d.dmg=[15,8]; }
      else { let x=inp.value.trim()===''?null:parseFloat(inp.value); if(x!=null&&isNaN(x)) x=null; const isP=t==='ppair'||t==='pct'; if(x!=null&&isP) x=x/100;
        if(t==='pair'||t==='ppair'){ const cur=Array.isArray(d[k])?d[k].slice():[0,0]; cur[+inp.dataset.i]=x==null?0:x; if(cur[0]===0&&cur[1]===0) delete d[k]; else d[k]=cur; }
        else { if(x==null||x===0) delete d[k]; else d[k]=x; } }
      st.dirty=true; drawStudio(); }); });
  q('#stsave').onclick=()=>{ if(!st.dirty) return; saveMove(st.sel, d); };
  const rv=q('#strev'); if(rv) rv.onclick=()=>confirmBox(`Put ${esc(d.n)} back to its original settings?`,'RESET',()=>{ const o=Object.assign({},MOVE_OVR); delete o[st.sel]; pushMoves(o,()=>{ st.draft=null; st.dirty=false; drawStudio(); toast('Reset to default'); }); });
  q('#stnew').onclick=()=>{ const go=()=>{ let n=1, id; do{ id='custom'+n++; }while(SK[id]); SK[id]={n:'New Ability',el:'neutral',t:'enemy',k:'hit',mp:[10,5],dmg:[15,8]}; st.sel=id; st.draft=JSON.parse(JSON.stringify(SK[id])); st.dirty=true; drawStudio(); }; if(st.dirty) confirmBox('Discard unsaved changes?','DISCARD',go); else go(); };
}
function saveMove(id,d){ const o=Object.assign({},MOVE_OVR); o[id]=JSON.parse(JSON.stringify(d)); pushMoves(o,()=>{ STUDIO.draft=null; STUDIO.dirty=false; drawStudio(); toast(`${d.n} saved for everyone`); }); }
async function pushMoves(o,done){
  try{ const db=window.claude&&await window.claude.use('db'); if(!db) throw new Error('offline');
    const r=await db.collection('config').doc('moves').set({moves:o, at:Date.now()});
    if(r&&r.ok===0) throw new Error(r.err||'denied');
    applyMoveOverrides(o); try{ localStorage.setItem('mr-moves',JSON.stringify(o)); }catch(_){} done&&done();
  }catch(e){ alertBox(String(e.message||e)==='admin'||String(e.message||e)==='denied'?'The server rejected the admin key.':"Couldn't save. Check your connection and try again."); }
}

// ---------- picking a monster: stay on the same card, just strike a pose ----------
openPick=(function(prev){ return function(side, swap){
  prev(side, swap); const w=PICKEL; if(!w) return; const b=B.b; const sd=b.sides[side];
  w.querySelectorAll('[data-pk]').forEach(btn=>btn.onclick=()=>{
    if(w.classList.contains('picked')) return; const i=+btn.dataset.pk, m=sd.mons[i];
    w.classList.add('picked'); btn.classList.add('sel'); B.going=true; sfx&&sfx('go');
    const t=w.querySelector('.pk-t'); if(t) t.textContent=`Go ${m.n}!`;
    const x=w.querySelector('#pkx'); if(x) x.style.visibility='hidden';
    setTimeout(()=>{ w.classList.add('out'); if(PICKEL===w) PICKEL=null; setTimeout(()=>w.remove(),260); if(!B) return; B.going=false;
      if(swap){ if(B.net&&B.net.role==='guest'){ NET.sendAction({swap:i}); renderBattle(); return; } act(b,{swap:i}); afterAct(); }
      else { const s=side; if(b.pickSide!==s&&b.phase==='pick'&&(b.pickQ||[]).includes(s)&&!B.net){ b.pickQ=[s].concat(b.pickQ.filter(x=>x!==s)); b.pickSide=s; clearTimeout(B.aiPickT); B.aiPickT=null; }
        if(B.net&&B.net.role==='guest'){ NET.sendAction({pick:i}); renderBattle(); return; } pick(b,s,i); afterAct(); }
    },0);
  });
}; })(openPick);

// ---------- battles: raise the ground so monsters stand on it ----------
function battleScene(id){ const z=ZSCENE[id]||ZSCENE.meadow; const sx=z.x; z.x=({palm:'sea',tents:'',cactus:'',deadtrees:''})[sx]??sx; const html=zoneScene(id); z.x=sx;
  return html.replace(/(<circle[^>]*\/><circle[^>]*\/>)([\s\S]*)<\/svg>$/, (_,orb,rest)=>`${orb}<g transform="translate(0 -20)">${rest}</g><rect y="78" width="200" height="22" fill="${z.hills[1]}"/></svg>`); }
renderBattle=(function(prev){ return function(){ prev(); if(!B||!B.b) return; const root=$('#battle'); const sc=root.querySelector('.bzscene');
  if(sc&&!sc.dataset.lift&&B.meta&&B.meta.zi!=null){ sc.dataset.lift=1; sc.innerHTML=battleScene(ZONES[B.meta.zi].id); } }; })(renderBattle);

// ---------- ability animations: one look per element ----------
function fxAt(x,y,cls,html){ const d=document.createElement('div'); d.className='fx '+cls; d.style.left=x+'px'; d.style.top=y+'px'; if(html) d.innerHTML=html; document.body.appendChild(d); return d; }
function fxGo(d,frames,o){ const a=d.animate(frames,Object.assign({fill:'forwards'},o)); a.onfinish=()=>d.remove(); setTimeout(()=>d.remove(),(o.duration||500)+(o.delay||0)+200); return a; }
const C='translate(-50%,-50%)';
function fxBurst(x,y,el,n,dist,dur){ for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, r=dist*(.45+Math.random()*.7), s=.6+Math.random()*.8;
  const p=fxAt(x,y,'pt '+el); p.style.setProperty('--s',s); const rot=el==='nature'?` rotate(${Math.random()*360}deg)`:'';
  fxGo(p,[{transform:`${C} scale(${s})${rot}`,opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*r}px),calc(-50% + ${Math.sin(a)*r+(el==='water'?dist*.35:0)}px)) scale(${s*.3})${rot}`,opacity:0}],{duration:dur*(.7+Math.random()*.5),easing:'cubic-bezier(.15,.8,.3,1)'}); } }
function fxFlash(x,y,el,size){ const f=fxAt(x,y,'flash '+el); f.style.width=f.style.height=size+'px'; fxGo(f,[{transform:`${C} scale(.2)`,opacity:1},{transform:`${C} scale(1.3)`,opacity:0}],{duration:380,easing:'ease-out'}); }
function fxProj(el,x0,y0,x1,y1,start,dur,size){ const ang=Math.atan2(y1-y0,x1-x0)*180/Math.PI; const dx=x1-x0, dy=y1-y0;
  setTimeout(()=>{ const p=fxAt(x0,y0,'proj2 '+el); p.style.setProperty('--s',size+'px');
    fxGo(p,[{transform:`${C} rotate(${ang}deg) scale(.35)`,opacity:.6},{transform:`translate(calc(-50% + ${dx*.15}px),calc(-50% + ${dy*.15}px)) rotate(${ang}deg) scale(1)`,opacity:1,offset:.15},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${ang}deg) scale(1.05)`,opacity:1}],{duration:dur,easing:'cubic-bezier(.45,0,.85,.7)'});
    let k=0; const iv=setInterval(()=>{ k++; const t=Math.min(1,k*35/dur); const e=t*t*.6+t*.4; fxBurst(x0+dx*e,y0+dy*e,el,el==='fire'?2:1,size*.35,320); if(t>=1) clearInterval(iv); },35);
  },start); }
function fxBolt(x1,y1,start,size){ setTimeout(()=>{ const W=document.body.clientWidth, H=document.body.clientHeight;
  const mk=()=>{ let x=x1+(Math.random()-.5)*size, y=-10, pts=[[x,y]]; const steps=9; for(let i=1;i<=steps;i++){ y=-10+(y1+10)*i/steps; x=(i===steps?x1:x1+(Math.random()-.5)*size*.9); pts.push([x,y]); } return pts.map(p=>p.join(',')).join(' '); };
  const s=fxAt(0,0,'boltsvg',`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><polyline points="${mk()}" class="b1"/><polyline points="${mk()}" class="b2"/></svg>`);
  fxGo(s,[{opacity:1},{opacity:.2,offset:.25},{opacity:1,offset:.4},{opacity:.1,offset:.65},{opacity:.9,offset:.75},{opacity:0}],{duration:420,easing:'linear'});
  fxFlash(x1,y1,'bolt',size*1.6); fxBurst(x1,y1,'bolt',10,size*.8,420); },start); }
function fxLeaves(x0,y0,x1,y1,start,size){ for(let i=0;i<6;i++){ const off=(i-2.5)*size*.18, dx=x1-x0, dy=y1-y0, nx=-dy/Math.hypot(dx,dy||1), ny=dx/Math.hypot(dx,dy||1), sp=Math.random()*720-360;
  setTimeout(()=>{ const l=fxAt(x0,y0,'leaf'); l.style.setProperty('--s',size*.42+'px');
    fxGo(l,[{transform:`${C} rotate(0deg) scale(.4)`,opacity:0},{transform:`translate(calc(-50% + ${dx*.5+nx*off*2.2}px),calc(-50% + ${dy*.5+ny*off*2.2-size*.25}px)) rotate(${sp/2}deg) scale(1)`,opacity:1,offset:.5},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${sp}deg) scale(.7)`,opacity:.9}],{duration:300,easing:'ease-in'}); },start+i*22); } }
function fxSlash(x,y,size,start){ setTimeout(()=>{ for(let i=0;i<3;i++){ const s=fxAt(x+(i-1)*size*.18,y-(i-1)*size*.06,'slash'); s.style.setProperty('--s',size*.9+'px');
  fxGo(s,[{transform:`${C} rotate(-38deg) scaleX(0)`,opacity:1},{transform:`${C} rotate(-38deg) scaleX(1)`,opacity:1,offset:.45},{transform:`${C} rotate(-38deg) scaleX(1.1)`,opacity:0}],{duration:360,delay:i*45,easing:'ease-out'}); }
  fxFlash(x,y,'neutral',size*1.2); fxBurst(x,y,'neutral',7,size*.6,380); },start); }
function fxAura(x,y,h,el,size){ fxFlash(x,y,el,size*1.5); for(let i=0;i<12;i++) setTimeout(()=>{ const p=fxAt(x+(Math.random()-.5)*size*.9,y+h*.35,'pt '+el); const s=.6+Math.random()*.7;
  fxGo(p,[{transform:`${C} scale(${s})`,opacity:0},{transform:`${C} scale(${s})`,opacity:1,offset:.2},{transform:`translate(-50%,calc(-50% - ${h*.9}px)) scale(${s*.4})`,opacity:0}],{duration:700,easing:'ease-out'}); },i*40);
  const r=fxAt(x,y+h*.38,'auraring '+el); r.style.setProperty('--s',size*1.1+'px'); fxGo(r,[{transform:`${C} scale(.3)`,opacity:1},{transform:`${C} scale(1.2)`,opacity:0}],{duration:600,easing:'ease-out'}); }
animateBattle=(function(prev){ return function(root,b,animating){
  const r=prev(root,b,animating); if(!animating) return r;
  try{ const evs=b.ev||[]; const a=evs.find(e=>e.k==='act'); const sk=a&&SK[a.sk]; if(!sk) return r;
    const ac=fEl(a.s,a.i); if(!ac) return r; const [x0,y0]=fCenter(ac); const ar=localRect(ac.querySelector('.fart')); const size=Math.max(50,ar.width*.55);
    const el=EL[sk.el]?sk.el:'neutral'; const hits=evs.filter(e=>(e.k==='hit'||e.k==='stun'||e.k==='miss')&&e.s!==a.s);
    const tg=[...new Set(hits.map(h=>h.s+'-'+h.i))].map(k=>fEl(+k.split('-')[0],+k.split('-')[1])).filter(Boolean);
    if(sk.t==='enemy'||sk.t==='allE'){
      if((a.sk==='basic'||a.sk==='acidbite')&&tg.length){ fxTackle(ac,tg[0],a.s===B.mySide); }
      else if(el==='neutral'){ const left=a.s===B.mySide; ac.classList.remove('lunge-r','lunge-l'); void ac.offsetWidth; ac.classList.add(left?'lunge-r':'lunge-l'); setTimeout(()=>ac.classList.remove('lunge-r','lunge-l'),500);
        tg.forEach(t=>{ const [x1,y1]=fCenter(t); fxSlash(x1,y1,size,250); }); }
      else tg.forEach(t=>{ const [x1,y1]=fCenter(t);
        if(el==='bolt') fxBolt(x1,y1,260,size);
        else if(el==='nature'){ fxLeaves(x0,y0,x1,y1,40,size); setTimeout(()=>{ fxBurst(x1,y1,'nature',9,size*.7,450); fxFlash(x1,y1,'nature',size*1.2); },360); }
        else { fxProj(el,x0,y0,x1,y1,40,300,size); setTimeout(()=>{ fxFlash(x1,y1,el,size*1.5); fxBurst(x1,y1,el,el==='water'?14:12,size*.8,480); },340); } });
    } else { const tgt=(sk.t==='self'||!tg.length)?[ac]:tg; tgt.forEach(t=>{ const rr=localRect(t.querySelector('.fart')); fxAura(rr.left+rr.width/2,rr.top+rr.height/2,rr.height,el,size); }); }
  }catch(_){}
  return r; }; })(animateBattle);

// ---------- finished missions reset to 0 so they can be replayed; completion is remembered ----------
function taskDone(zi,k){ const id=ZONES[zi].id; return !!(S.tdone&&S.tdone[id]&&S.tdone[id][k]); }
taskProg=(function(prev){ return function(zi){ const p=prev(zi); const id=ZONES[zi].id, tl=taskList(zi);
  S.tdone=S.tdone||{}; const d=S.tdone[id]=S.tdone[id]||[]; tl.forEach((t,k)=>{ if(p[k]>=t.reps){ d[k]=1; p[k]=0; } }); return p; }; })(taskProg);

// ---------- passive/item icons: tap to show what it does; it stays until you tap elsewhere ----------
removeEventListener('pointerup',endTip,true); removeEventListener('touchend',endTip,true); removeEventListener('pointercancel',endTip,true); removeEventListener('touchcancel',endTip,true);
const endTip2=()=>{ TIPDRAG=false; }; // the tip stays up after you let go; tap anywhere else to close it
addEventListener('pointerup',endTip2,true); addEventListener('touchend',endTip2,true); addEventListener('pointercancel',endTip2,true); addEventListener('touchcancel',endTip2,true);
addEventListener('pointerdown',e=>{ if(!(e.target.closest&&e.target.closest('.hi'))){ TIPH=null; hideTips(); } },true);
placeTip=(function(prev){ return function(h){ prev(h); const tip=document.querySelector('.tipb'); if(!tip||!h) return; const r=localRect(h);
  if(parseFloat(tip.style.top)<r.top+r.height && parseFloat(tip.style.top)+tip.offsetHeight>r.top-2) tip.style.top=(r.top+r.height+10)+'px'; }; })(placeTip);


// ---------- tap a monster in battle: monster + stats, then abilities, then special items ----------
monInfo=function(b,s,i){
  const m=b.sides[s].mons[i]; if(!m) return; const sp=SPI[m.sp], mine=s===B.mySide;
  const all=(sp.sk||[]).slice(0,slotsOf(m.lvl)); const fx=m.fx||{};
  const items=itemCopies(fx,m);
  const eff=Object.keys(ST_ICON).filter(k=>m.st[k]>0);
  const sh=sheet(`<div class="minfo2"><div class="mi2-l"><div class="mi-art">${monSVG(m.sp,m.lvl)}</div>
      <div class="mi-nm"><span class="lvb">${m.lvl}</span><b>${esc(m.n)}</b></div>
      <div class="lb life"><i style="width:${m.hp/m.maxhp*100}%"></i><b>${m.hp} / ${m.maxhp} life</b></div>
      <div class="lb mana"><i style="width:${m.mp/m.maxmp*100}%"></i><b>${m.mp} / ${m.maxmp} mana</b></div>
      <div class="mi-atk">Attack <b>${m.atk}</b></div>
      </div>
    <div class="mi2-r">${eff.length?`<h3 id="mi-effects">Effects</h3><div class="mi2-eff">${stList(m).map(x=>`<div class="pab ${x.exp?'exp':''}"><span class="mi2-it">${x.ic(34)}</span><div class="pab-t"><b>${x.name} <span class="sl">${x.t} turn${x.t>1?'s':''}</span></b><span>${esc(String(x.tip).replace(/ \(\d+ turns?\)$/,''))}</span></div></div>`).join('')}</div>`:''}<h3>Abilities</h3><div class="pabil">${all.map(id=>{ const k=SK[id]; if(!k) return ''; const L=(m.skl&&m.skl[id])||1, c=skCost(id,L);
        return `<div class="pab ${k.k==='passive'?'pas':''}">${icon(skIconKey(id),(EL[k.el]||EL.neutral).c,34)}<div class="pab-t"><b>${esc(k.n)} <span class="sl">Lv ${L}</span>${k.k==='passive'?' <span class="pastag">Passive</span>':''}</b><span>${skillDesc(id,L)}${c?` · ${c} mana`:''}</span></div></div>`; }).join('')}</div>
      ${items.length?`<h3>Items</h3><div class="mi2-items">${items.map(([id])=>`<div class="pab"><span class="mi2-it">${itemSVG(id)}</span><div class="pab-t"><b>${ITEMS[id].n}</b><span>${itemLine(id)}</span></div></div>`).join('')}</div>`:''}</div></div>`,{cls:'mi2sheet'});
  return sh; };
renderBattle=(function(prev){ return function(){ prev(); if(!B||!B.b) return; const b=B.b;
  document.querySelectorAll('#battle .bhp .bpor').forEach(p=>{ if(p.id==='swapb') return; const hp=p.closest('.bhp'); if(!hp) return; const s=+hp.dataset.hs; if(s===B.mySide&&p.classList.contains('swapper')) return;
    p.style.cursor='pointer'; p.onclick=e=>{ e.stopPropagation(); const sd=b.sides[s]; monInfo(b,s,sd.active!=null?sd.active:+hp.dataset.hi||0); }; }); }; })(renderBattle);

// ---------- basic Attack: leap across in attack pose, foe flinches, hop back in regular pose ----------
function fxTackle(ac,tgt,left){ const art=ac.querySelector('.fart'); if(!art) return; const [x0,y0]=fCenter(ac), [x1]=fCenter(tgt); const w=localRect(art).width;
  const dir=x1>x0?1:-1, dx=(x1-x0)-dir*w*.6, h=w*.35; ac.classList.remove('lunge-r','lunge-l','cast','dash-r','dash-l'); ac.classList.add('pose-atk','tackling');
  const an=art.animate([{transform:'translate(0,0)'},{transform:`translate(${dx*.5}px,${-h}px)`,offset:.22},{transform:`translate(${dx}px,0)`,offset:.42},{transform:`translate(${dx-dir*w*.04}px,0)`,offset:.56},{transform:`translate(${dx*.5}px,${-h*.8}px)`,offset:.78},{transform:'translate(0,0)'}],{duration:820,easing:'ease-in-out'});
  setTimeout(()=>{ tgt.classList.add('pose-hit'); setTimeout(()=>tgt.classList.remove('pose-hit'),280); const [tx,ty]=fCenter(tgt); fxFlash(tx-dir*w*.25,ty,'neutral',w*.9); fxBurst(tx-dir*w*.25,ty,'neutral',6,w*.45,340); },345);
  setTimeout(()=>ac.classList.remove('pose-atk'),470);
  an.onfinish=()=>ac.classList.remove('tackling'); setTimeout(()=>ac.classList.remove('tackling','pose-atk'),1000); }

// ---------- monsters slide in when they enter the field (slower, survives re-renders) ----------
renderBattle=(function(prev){ return function(){ prev(); if(!B||!B.b) return; B.enT=B.enT||{}; const now=Date.now();
  document.querySelectorAll('#battle .fighter').forEach(el=>{ const s=el.dataset.s, i=el.dataset.i, f=el.querySelector('.fart'); if(!f) return;
    if(!B.enT[s]||B.enT[s].i!==i) B.enT[s]={i,t:now};
    const e=(now-B.enT[s].t)/1000; if(false&&e<3&&!f._enA){ const L=el.classList.contains('l'), d=L?1:-1, W=document.body.clientWidth*1.2;
      const H=document.body.clientHeight*.45;
      f._enA=f.animate([{transform:`translate(${-d*W}px,0)`,easing:'cubic-bezier(.3,.7,.6,1)'},{transform:`translate(${-d*W*.45}px,${-H}px)`,offset:.36,easing:'cubic-bezier(.45,0,.8,.5)'},{transform:'translate(0,0) scale(1.14,.86)',offset:.68,easing:'ease-out'},
        {transform:'translate(0,-12%) scale(.95,1.06)',offset:.79,easing:'ease-in'},{transform:'translate(0,0) scale(1.06,.94)',offset:.9,easing:'ease-out'},{transform:'none'}],{duration:3000,easing:'linear'});
      f._enA.currentTime=e*1000; } }); }; })(renderBattle);

// ---------- Monster Kingdom style info bubble: description only, sits over the icon row with a tab down to the icon ----------
function stDesc(m,k){ const s=m.st, P=v=>Math.round((v||0)*100)+'%';
  const d={burn:`Takes ${s.burnD|0} damage each turn`, poison:`Takes ${s.poisonD|0} damage each turn`, storm:`Takes ${s.stormD|0} damage each turn`, fwall:`Burns attackers for ${s.fwallV|0}`, frost:`Takes ${s.frostD|0} damage each turn`, stun:`Can't act`,
    bubble:`Shield absorbs ${s.bubbleHp|0} damage`, lsh:`Shield absorbs ${s.lshHp|0} damage`, fsh:`Shield absorbs ${s.fshHp|0} damage`, nsh:`Shield absorbs ${s.nshHp|0} damage`,
    focus:`Deals ${P(s.focusV)} more damage`, charge:`Deals ${P(s.chargeV)} more damage`, cripple:`Deals ${P(s.crippleV)} less damage`, evade:`${P(s.evadeV)} chance to dodge attacks`, absorb:`Turns ${P(s.absorbV)} of damage taken into mana`, crit:`${P(s.critV)} chance to deal double damage`, mshield:`Mana blocks ${P(s.mshieldV)} of damage taken`, pers:`Takes ${P(s.persV)} less damage`, roots:`Recovers ${P(s.rootsV)} of max life each turn`}[k];
  return `${d||BUFF_N[k]||k} (${s[k]} turn${s[k]>1?'s':''})`; }
hudIcons=(function(prev){ return function(m){ if(!m) return ''; let h=prev(m).replace(/<span class="hi st"[\s\S]*?<\/span><\/span>/g,'');
  const add=stList(m).map(x=>`<span class="hi st${x.exp?' exp':''}" data-tip="|${esc(x.tip)}">${x.ic(26)}</span>`).join('');
  const i=h.lastIndexOf('</div>'); return i>=0? h.slice(0,i)+add+h.slice(i) : h+add; }; })(hudIcons);
placeTip=function(h){
  if(TIPH===h&&document.querySelector('.tipb')) return; TIPH=h; hideTips(); if(!h||!h.dataset.tip) return;
  let [,body]=tipText(h); if(!body) body=tipText(h)[0]; const right=!!h.closest('.bhp.r');
  const ic=h.querySelector('.ic')?h.querySelector('.ic').outerHTML:'';
  const tip=document.createElement('div'); tip.className='tipb tipmk '+(right?'r':'l'); tip.innerHTML=right?`<span>${body}</span>${ic}`:`${ic}<span>${body}</span>`;
  const tab=document.createElement('div'); tab.className='tipb tipmk-tab'; document.body.appendChild(tab); document.body.appendChild(tip);
  const r=localRect(h), BR=document.body.getBoundingClientRect(); const W=isRot()?BR.height:innerWidth;
  const tabW=r.width+16, tabL=r.left-8, w=tip.offsetWidth, th=tip.offsetHeight;
  let left=right? tabL+tabW-w : tabL; left=Math.max(4,Math.min(W-w-4,left));
  let top=r.top-6-th; if(top<4) top=4;
  tip.style.left=left+'px'; tip.style.top=top+'px';
  const tTop=top+th-16; tab.style.left=tabL+'px'; tab.style.width=tabW+'px'; tab.style.top=tTop+'px'; tab.style.height=Math.max(20,r.top+r.height+7-tTop)+'px';
};

// ---------- pick card waits until the foe's monster has fully entered and its name has faded ----------
const ENTER_MS=4000;
function pickWaitLeft(){ if(!B||!B.b||B.mode==='local'||!B.enT) return 0; const fs=String(1-B.mySide), e=B.enT[fs]; if(!e) return 0;
  if(!document.querySelector(`#battle .fighter[data-s="${fs}"]`)) return 0; return Math.max(0, e.t+ENTER_MS-Date.now()); }
openPick=(function(prev){ return function(side,swap){ const w=swap?0:pickWaitLeft();
  if(w>0){ if(!B.pkWait) B.pkWait=setTimeout(()=>{ if(!B) return; B.pkWait=null; if(B.b&&B.b.phase==='pick'&&myInput()&&!PICKEL) openPick(side,false); },w+60); return; }
  return prev(side,swap); }; })(openPick);
setInterval(()=>{ if(B&&B.b&&B.b.phase==='pick'&&!PICKEL&&pickWaitLeft()>0) B.stamp=Date.now(); },100);

// ---------- battle sequencing: pick -> 3s entrance -> name on landing for 1s -> next pick -> ... -> abilities slide up ----------
const ENT_MS=1600, LAND_MS=1100, NAME_MS=900, BUSY_MS=LAND_MS+350;
function busyLeft(){ if(!B||!B.enT) return 0; let m=0; Object.values(B.enT).forEach(e=>{ m=Math.max(m,e.t+BUSY_MS-Date.now()); }); return Math.max(0,m); }
pickWaitLeft=busyLeft;
drive=(function(prev){ return function(){ const r=prev(); if(!B||!B.b||B.b.over||B.paused) return r; const w=busyLeft();
  if(w>0){ clearTimeout(B.timer); B.timer=setTimeout(()=>{ if(B) drive(); },w+40); } return r; }; })(drive);
humanAct=(function(prev){ return function(skill,target){ if(busyLeft()>0) return; return prev(skill,target); }; })(humanAct);
renderBattle=(function(prev){ return function(){ prev(); if(!B||!B.b||!B.enT) return; const now=Date.now(), root=$('#battle'); if(!root) return;
  root.querySelectorAll('.fighter').forEach(el=>{ const f=el.querySelector('.fname'), e=B.enT[el.dataset.s]; if(!f) return; f.classList.remove('fnon');
    const t=e?(now-e.t):1e9; if(t<2400){ f.classList.add('fn2'); f.style.animationDelay=(-t/1000)+'s'; } else { f.classList.remove('fn2'); f.style.animationDelay=''; } });
  const busy=busyLeft()>0; root.classList.toggle('busy',busy);
  const ab=root.querySelector('.abil'); if(ab&&!busy&&B.abT&&now-B.abT<700){ ab.classList.add('abin'); ab.style.animationDelay=(-(now-B.abT)/1000)+'s'; } }; })(renderBattle);
setInterval(()=>{ if(!B||!B.b) return; const root=$('#battle'); const busy=busyLeft()>0;
  if(busy){ if(B.swapStamp==null) B.stamp=Date.now(); B.wasBusy=true; }
  else if(B.wasBusy){ B.wasBusy=false; B.abT=Date.now(); if(!B.b.over&&!B.paused&&!(B.net&&B.net.role==='guest')){ clearTimeout(B.timer); drive(); } if(root){ root.classList.remove('busy'); const ab=root.querySelector('.abil'); if(ab){ ab.classList.remove('abin'); void ab.offsetWidth; ab.classList.add('abin'); ab.style.animationDelay='0s'; } } }
  else if(root) root.classList.remove('busy'); },80);
openPick=(function(prev){ return function(side,swap){ if(swap&&busyLeft()>0) return; return prev(side,swap); }; })(openPick);

// ---------- KNOCKED OUT!: thrown-back pose + big text, then the monster slowly slides off its side ----------
const KO_MS=2000, KO_DELAY=600;
function koCheck(){ if(!B||!B.b) return; B.koT=B.koT||{}; const now=Date.now();
  document.querySelectorAll('#battle .fighter').forEach(el=>{ const k=el.dataset.s+'-'+el.dataset.i, f=el.querySelector('.fart'); if(!f) return;
    const m=B.b.sides[+el.dataset.s]&&B.b.sides[+el.dataset.s].mons[+el.dataset.i]; const out=el.classList.contains('ko')||(m&&m.hp<=0);
    if(!out){ if(B.koT[k]&&m&&m.hp>0){ delete B.koT[k]; if(B.koShown) delete B.koShown[k]; } return; }
    if(!B.koT[k]&&B.animEnd&&now<B.animEnd){ clearTimeout(B._koW); B._koW=setTimeout(koCheck,B.animEnd-now+30); return; } // wait for every hit/DoT of the turn to play
    if(!B.koT[k]){ B.koT[k]=now+KO_DELAY; setTimeout(koCheck,KO_DELAY+20); return; }
    if(now<B.koT[k]) return;
    if(!(B.koShown=B.koShown||{})[k]){ B.koShown[k]=1; const [x,y]=fCenter(el); const r=localRect(f);
      const t=fxAt(x,y-r.height*.62,'kotext','<b>KNOCKED</b><b>OUT!</b><i class="ks1">★</i><i class="ks2">★</i><i class="ks3">★</i>');
      fxGo(t,[{transform:'translate(-50%,-50%) scale(.3) rotate(-14deg)',opacity:0},{transform:'translate(-50%,-50%) scale(1.15) rotate(-8deg)',opacity:1,offset:.08},{transform:'translate(-50%,-50%) scale(1) rotate(-8deg)',opacity:1,offset:.14},{transform:'translate(-50%,-50%) scale(1) rotate(-8deg)',opacity:1,offset:.8},{transform:'translate(-50%,-60%) scale(1) rotate(-8deg)',opacity:0}],{duration:1900,easing:'ease-out'}); }
    el.classList.add('ko2'); const e=now-B.koT[k];
    if(!f._koA){ const L=el.classList.contains('l'), d=L?-1:1, W=document.body.clientWidth*.7;
      f._koA=f.animate([{transform:'none',opacity:1},{transform:'none',opacity:1,offset:.35,easing:'cubic-bezier(.45,0,.7,1)'},{transform:`translateX(${d*W}px)`,opacity:1,offset:.92},{transform:`translateX(${d*W}px)`,opacity:0}],{duration:KO_MS,fill:'forwards'});
      f._koA.currentTime=Math.min(e,KO_MS); } }); }
syncFighter=(function(prev){ return function(b,s,i){ const r=prev(b,s,i); koCheck(); return r; }; })(syncFighter);
renderBattle=(function(prev){ return function(){ prev(); koCheck(); }; })(renderBattle);
busyLeft=(function(prev){ return function(){ let m=prev(); if(B&&B.koT) Object.values(B.koT).forEach(t=>{ m=Math.max(m,t+KO_MS*.85-Date.now()); }); return Math.max(0,m); }; })(busyLeft);
pickWaitLeft=busyLeft;
finishBattle=(function(prev){ return function(){ const w=busyLeft(); if(w>0&&B){ setTimeout(()=>finishBattle(),w+100); return; } return prev(); }; })(finishBattle);

// ---------- battle MENU: Flee / Self / Enemy stacked under the MENU button, screen dimmed ----------
const BM_WING='<svg viewBox="0 0 60 40"><path d="M4 30 Q18 6 56 4 Q46 10 50 12 Q40 14 44 18 Q32 18 36 23 Q24 22 26 27 Q16 26 4 30Z" fill="#fff6d0" stroke="#b8902a" stroke-width="2" stroke-linejoin="round"/></svg>';
const BM_GLASS='<svg viewBox="0 0 40 40"><circle cx="17" cy="16" r="11" fill="#9fd4ff" stroke="#fff" stroke-width="4"/><circle cx="17" cy="16" r="11" fill="none" stroke="#7a8aa0" stroke-width="1.5"/><path d="M25 25 L36 37" stroke="#8a96a8" stroke-width="5" stroke-linecap="round"/><path d="M12 11 q3-3 7-2" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>';
battleMenu=function(){
  if(!B||!B.b) return; const b=B.b; document.querySelectorAll('.bm-wrap').forEach(x=>x.remove());
  const mb=document.querySelector('#bmenu'); const r=mb?localRect(mb):{left:0,top:0,width:160,height:44};
  const w=document.createElement('div'); w.className='bm-wrap';
  w.innerHTML=`<div class="bm-col" style="left:${r.left+r.width/2}px;top:${r.top+r.height+10}px;width:${Math.max(r.width*1.3,190)}px">
    <button class="bm-b" data-bm="flee"><span>FLEE</span><i class="bm-w">${BM_WING}</i></button>
    <button class="bm-b" data-bm="self"><span>SELF</span><i class="bm-g">${BM_GLASS}</i></button>
    <button class="bm-b" data-bm="enemy"><span>ENEMY</span><i class="bm-g">${BM_GLASS}</i></button></div>`;
  document.body.appendChild(w);
  const close=()=>w.remove();
  w.addEventListener('click',e=>{ const bt=e.target.closest('[data-bm]'); if(!bt){ close(); return; } const k=bt.dataset.bm; close();
    const mine=B.mySide, foe=1-mine, act=s=>{ const sd=b.sides[s]; return sd.active!=null?sd.active:(typeof focusMon==='function'?focusMon(b,s):0); };
    if(k==='self') monInfo(b,mine,act(mine)); else if(k==='enemy') monInfo(b,foe,act(foe));
    else { if(b.over) return finishBattle(); if(B.net) NET.forfeit(); else { const back=B.mode==='campaign'&&B.meta?B.meta.zi:null; closeBattle(); if(back!=null) openTasks(back); } } });
};
closeBattle=(function(prev){ return function(){ document.querySelectorAll('.bm-wrap').forEach(x=>x.remove()); return prev.apply(this,arguments); }; })(closeBattle);

// ---------- every newly obtained monster starts at level 1 ----------
addMon=(function(prev){ return function(sp){ return prev(sp,1); }; })(addMon);

// ---------- missions: show which ones are completed, and how many are left before the boss ----------
drawTasks=(function(prev){ return function(){ prev(); if(!TASKSH) return; const zi=TASKSH.zi, tl=taskList(zi), pr=taskProg(zi);
  const cards=TASKSH.sh.body.querySelectorAll('.tlist .task'); let left=0;
  tl.forEach((t,k)=>{ const done=taskDone(zi,k)||pr[k]>=t.reps; if(t.t!=='boss'&&!done) left++;
    const c=cards[k]; if(!c) return; c.classList.toggle('tdone',done);
    const h=c.querySelector('.t-h'); if(done&&h&&!h.querySelector('.tchk')) h.insertAdjacentHTML('beforeend','<span class="tchk">✓ Completed</span>'); });
  TASKSH.sh.body.querySelectorAll('.task.lockedq').forEach(c=>{ c.querySelectorAll('*').forEach(el=>{ if(el.children.length===0&&el.textContent.trim()==='Finish the other activities first') el.textContent=`Complete ${left} more ${left===1?'mission':'missions'} to unlock`; }); }); }; })(drawTasks);
// whole team in the corner; the one doing missions is highlighted, tap another to switch
drawTasks=(function(prev){ return function(){ prev(); if(!TASKSH) return; const box=TASKSH.sh.body.querySelector('.thmon'); if(!box) return;
  const tm=teamMons(); if(tm.length<2) return; const cur=monBy(S.zoneMon)||tm[0];
  const wrap=document.createElement('div'); wrap.className='thteam';
  wrap.innerHTML=tm.map(m=>`<div class="thmon on" data-u="${m.uid}">${monSVG(m.sp,m.lvl)}<span class="lvb">${m.lvl}</span></div>`).join('');
  box.replaceWith(wrap);
  wrap.onclick=e=>{ e.stopPropagation(); openTeam(); const iv=setInterval(()=>{ if(TEAMSH) return; clearInterval(iv); if(TASKSH) drawTasks(); },250); }; }; })(drawTasks);

// ---------- energy bar: "17 / 20" fades into "+1 in 1:32" and back ----------
function fmtEnergy(b){ if(!S||!b) return; tickEnergy(); const word=b.dataset.ew!=null?b.dataset.ew:(b.dataset.ew=/energy\s*$/.test(b.textContent)?' energy':'');
  const cnt=`${S.energy} / ${S.maxEnergy}${word}`, full=S.energy>=S.maxEnergy;
  if(full){ if(b.dataset.mode!=='full'){ b.dataset.mode='full'; b.innerHTML=`<span class="ec1">${cnt}</span>`; } else b.firstChild.textContent=cnt; return; }
  const tm=`+1 in ${nextEnergyIn()}`;
  if(b.dataset.mode!=='swap'){ b.dataset.mode='swap'; b.innerHTML=`<span class="ec">${cnt}</span><span class="et">${tm}</span>`; const d=-(Date.now()%6000)/1000+'s'; b.querySelectorAll('span').forEach(x=>x.style.animationDelay=d); }
  else { b.children[0].textContent=cnt; b.children[1].textContent=tm; } }
function fmtAllEnergy(){ document.querySelectorAll('.hbar.energy .ebar b').forEach(fmtEnergy); }
setInterval(fmtAllEnergy,500);
new MutationObserver(ms=>{ for(const m of ms) for(const n of m.addedNodes){ if(n.nodeType===1&&(n.matches&&n.matches('.hbar.energy, .ebar')||n.querySelector&&n.querySelector('.hbar.energy .ebar b'))){ fmtAllEnergy(); return; } } }).observe(document.body,{childList:true,subtree:true});

// ---------- ranks: bronze/silver/gold/cobalt/emerald, each a stripe then a star ----------
RANKS.length=0; [['Bronze','#c07a3e'],['Silver','#c9d1db'],['Gold','#f2c14e'],['Cobalt','#2f6fd8'],['Emerald','#2fbf6a']].forEach(([n,c],i)=>{
  RANKS.push([i===0?0:1000+i*200,n+' Stripe',c,'stripe']); RANKS.push([1100+i*200,n+' Star',c,'star']); });
rankBadge=function(r,size){ const [,n,c,k]=rankOf(r); size=size||26; const hi=shade(c,40), lo=shade(c,-35);
  const g=k==='star'?`<path d="M12 2.2 L14.8 8.6 L21.7 9.2 L16.5 13.8 L18.1 20.6 L12 17 L5.9 20.6 L7.5 13.8 L2.3 9.2 L9.2 8.6Z" fill="${c}" stroke="#1a1a1a" stroke-width="1.2" stroke-linejoin="round"/><path d="M12 5 L13.6 9.4 L11 9.8Z" fill="${hi}" opacity=".8"/>`
    :`<path d="M3 14 L12 7 L21 14 L21 19 L12 12 L3 19Z" fill="${c}" stroke="#1a1a1a" stroke-width="1.2" stroke-linejoin="round"/><path d="M5 14.2 L12 8.8 L19 14.2" fill="none" stroke="${hi}" stroke-width="1" opacity=".8"/><path d="M3 19 L12 12 L21 19" fill="none" stroke="${lo}" stroke-width=".8"/>`;
  return `<svg class="rbadge" viewBox="0 0 24 24" width="${size}" height="${size}"><title>${n}</title>${g}</svg>`; };

// ---------- abilities from Monster Kingdom screenshots: same wording, costs, elements and symbols ----------
Object.assign(ICON,{
  mkdevour:'<path d="M4 9 L8 5 L11 7 L14 4 L16 7 L20 6 L19 10 L21 13 L17 14 L18 17 L14 15 L12 19 L10 15 L6 17 L7 13 L3 12Z" fill="#fff"/><path d="M9 11 l1.5 2 l1.5 -2 l1.5 2 l1.5 -2" stroke="#e85d1f" stroke-width="1.2" fill="none" stroke-linejoin="round"/><circle cx="10" cy="9" r="1" fill="#e85d1f"/>',
  mksoul:'<path d="M5 6 Q12 3 19 6 Q21 13 17 18 Q12 21 7 18 Q3 13 5 6Z" fill="#fff"/><path d="M7.5 10 l3.5 1.5 l-3.5 1Z M16.5 10 l-3.5 1.5 l3.5 1Z" fill="#e85d1f"/><path d="M7.5 14.5 Q12 18.5 16.5 14.5 L15 15.2 L14 14.3 L12.8 15.4 L12 14.4 L11.2 15.4 L10 14.3 L9 15.2Z" fill="#e85d1f"/>',
  mkabsorb:'<path d="M5 13 Q5 6 12 6 Q16 6 18 9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M19.5 6 L18.4 10.3 L14.6 8.6Z" fill="#fff"/><path d="M19 11 Q19 18 12 18 Q8 18 6 15" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M4.5 18 L5.6 13.7 L9.4 15.4Z" fill="#fff"/>',
  mksplash:'<circle cx="15.5" cy="11" r="5" fill="#fff"/><circle cx="9" cy="12.5" r="2.8" fill="#fff"/><circle cx="5" cy="12" r="1.6" fill="#fff"/><circle cx="9" cy="17" r="1.4" fill="#fff"/>',
  mkfury:'<path d="M6 7 h2.5 v-2.5 h2 v2.5 h2.5 v2 h-2.5 v2.5 h-2 v-2.5 h-2.5Z" fill="#fff"/><path d="M14 20 Q9 19 10 14 Q11 11 13.5 9 Q13 12.5 15 13 Q15 10 18 8 Q17 11.5 19 14 Q20 19 14 20Z" fill="#fff"/>',
  mkstatic:'<path d="M9 2.8h6.4l-3.1 3.6h3.1l-6 5.8 1.9-3.9H8.5z" fill="#fff"/><path d="M3.4 10.6l2.3 1.1-1.6.9 2.2 1.1M20.6 10.6l-2.3 1.1 1.6.9-2.2 1.1" stroke="#fff" stroke-width="1.2" fill="none" stroke-linejoin="round"/><path d="M5.2 20.2a6.8 6.3 0 0 1 13.6 0" stroke="#fff" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="M8.9 20.2a3.1 2.8 0 0 1 6.2 0" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round"/>',
  mkspark:'<path d="M9 3 L10.4 8.6 L16 10 L10.4 11.4 L9 17 L7.6 11.4 L2 10 L7.6 8.6Z" fill="#fff"/><path d="M17 12 L17.8 15.2 L21 16 L17.8 16.8 L17 20 L16.2 16.8 L13 16 L16.2 15.2Z" fill="#fff"/><path d="M17 3 L17.6 5.4 L20 6 L17.6 6.6 L17 9 L16.4 6.6 L14 6 L16.4 5.4Z" fill="#fff"/>',
  mkpounce:'<path d="M3.6 10.2C7.8 5 14 5.8 15.6 12.2" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M11.4 11.6l9.2-2.6-1.4 9.8z" fill="#fff"/><path d="M15.6 19.8l2.5-1.4M16.8 21.8l1.9-2.4M19.6 21.9l.3-2.7M13.4 18.4l3.6-.5" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>',
  mkbolt:'<path d="M13.5 2.5 L6 13 L11 13 L9.5 21.5 L18 10 L13 10Z" fill="#fff"/>',
  mkburn:'<path d="M12 21 Q5.5 20 6 13.5 Q6.5 9 10 6 Q9.5 10 12 11 Q11.5 6.5 15 3 Q14.5 8 17.5 11 Q19.5 14.5 17.5 18 Q15.5 21 12 21Z" fill="#fff"/>',
  mkbone:'<path d="M7.6 5.2 a2.2 2.2 0 1 0 -2.4 2.4 L15.4 17.8 a2.2 2.2 0 1 0 2.4 -2.4 a2.2 2.2 0 1 0 1.4 -3.8 a2.2 2.2 0 0 0 -2.6 1.2 L10.8 7 a2.2 2.2 0 0 0 1.2 -2.6 a2.2 2.2 0 1 0 -3.8 1.4 a2.2 2.2 0 0 0 -0.6 -0.6Z" fill="#fff"/>',
  mkpaw:'<ellipse cx="12" cy="15.5" rx="4.6" ry="3.8" fill="#fff"/><ellipse cx="6" cy="10.5" rx="1.9" ry="2.4" fill="#fff"/><ellipse cx="9.6" cy="7" rx="1.9" ry="2.5" fill="#fff"/><ellipse cx="14.4" cy="7" rx="1.9" ry="2.5" fill="#fff"/><ellipse cx="18" cy="10.5" rx="1.9" ry="2.4" fill="#fff"/>',
  mkclaw:'<path d="M5 18 L14 5 L12 10 L17 4 L14 11 L19 6 L9 20Z" fill="#fff"/>',
  mkwave:'<path d="M3 16 Q6 9 12 9 Q17 9 18 13 Q15 11 13.5 13 Q16 13 16 16 Q13 15 11 17 L21 17 L21 19 L3 19Z" fill="#fff"/>'
});
const MK_ICON={devour:'mkdevour',souleater:'mksoul',absorb:'mkabsorb',splash:'mksplash',furyfist:'mkfury',staticd:'mkstatic',spark:'mkspark',pounce:'mkpounce',bolt:'mkbolt',burn:'mkburn',cripple:'mkbone',trample:'mkpaw',berserk:'mkclaw',wave:'mkwave'};
skIconKey=(function(prev){ return function(id){ return MK_ICON[id]||prev(id); }; })(skIconKey);
// exact Monster Kingdom wording and numbers
Object.assign(SK.devour,{el:'neutral',mp:[5,5],leechL:[.5,.05],desc:'Attack the enemy and devour their life essence, stealing {leech} of damage dealt.'});
Object.assign(SK.souleater,{el:'neutral',mp:[8,4],m:[.8,.02],mpAtk:[.4,.01],desc:"Strike the enemy's soul, dealing {pct} of your attack damage and stealing {mana} of your attack in mana."});
Object.assign(SK.absorb,{el:'water',mp:[11,4],v:[.26,.05556],turns:4,desc:'Your mana heals by {v} of any damage taken for the next {turns} turns.'});
Object.assign(SK.splash,{el:'water',mp:[15,11],dmg:[25,13],desc:'Shoots a powerful bubble that deals {dmg} water damage.'});
Object.assign(SK.furyfist,{el:'fire',p:'fury',v:[6,2],desc:'Passively adds {v} damage to your regular attack.'});
Object.assign(SK.staticd,{el:'bolt',mp:[20,9],dmg:[20,12],stormTick:[14,12],stormTurns:2,desc:'Unleash an electrical discharge at your enemy to cause {dmg} direct damage and {tick} damage each turn for {turns} turns.'});
Object.assign(SK.spark,{el:'bolt',mp:[10,6],v:[.40,.04],turns:4,desc:'Gives {v} chance to do a critical 2x damage on any attack for {turns} turns.'});
Object.assign(SK.pounce,{el:'neutral',v:[.05,.01],desc:'Amplifies all damage by {v}.'});
Object.assign(SK.bolt,{el:'bolt',mp:[20,12],dmg:[26,13],dbl:.5,desc:'Strong lightning attack that deals {dmg} damage and has a {dbl} chance to do 2x damage.'});
Object.assign(SK.burn,{mp:[20,9]}); Object.assign(SK.cripple,{mp:[24,7]});
Object.assign(DEFAULT_SK,JSON.parse(JSON.stringify({devour:SK.devour,souleater:SK.souleater,absorb:SK.absorb,splash:SK.splash,furyfist:SK.furyfist,staticd:SK.staticd,spark:SK.spark,pounce:SK.pounce,bolt:SK.bolt,burn:SK.burn,cripple:SK.cripple})));
// placeholders for storm ticks; Fury Fist is a flat bonus on the regular attack
skillDesc=(function(prev){ return function(id,L){ const s=SK[id]; if(s&&s.desc&&s.stormTick){ const t=Math.round(lv(s.stormTick,L||1)); return prev(id,L).replace(/\{tick\}/g,t).replace(/(for )(\s*)(turns)/,'$1'+s.stormTurns+' $3'); } return prev(id,L); }; })(skillDesc);
// in-battle bubble wording for Monster Kingdom passives
const MK_TIP={furyfist:L=>`Adds ${Math.round(lv(SK.furyfist.v,L))} damage to physical attacks`};
hudIcons=(function(prev){ return function(m){ let h=prev(m); if(!m) return h; Object.keys(MK_TIP).forEach(id=>{ if(!(m.sk||[]).includes(id)) return; const L=(m.skl&&m.skl[id])||1;
  h=h.replace(new RegExp('data-tip="'+SK[id].n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+' \\(passive[^"]*"'),`data-tip="|${MK_TIP[id](L)}"`); }); return h; }; })(hudIcons);

// ---------- rank ladder (season starts at 200; nothing below Bronze Stripe) ----------
RANKS.length=0; [[0,'Bronze Stripe','#c07a3e','stripe'],[250,'Bronze Star','#c07a3e','star'],[300,'Silver Stripe','#c9d1db','stripe'],[500,'Silver Star','#c9d1db','star'],
  [700,'Gold Stripe','#f2c14e','stripe'],[1000,'Gold Star','#f2c14e','star'],[1400,'Cobalt Star','#2f6fd8','star'],[1900,'Emerald Stripe','#2fbf6a','stripe'],[2400,'Emerald Star','#2fbf6a','star']].forEach(r=>RANKS.push(r));
const SEASON=2; if(S&&S.season!==SEASON){ S.season=SEASON; S.rank=200; S.lastRankD=null; try{ persist(); }catch(_){} }
rankBadge=(function(prev){ return function(r,size){ const [,n,c,k]=rankOf(r); if(k!=='stripe') return prev(r,size); size=size||26; const id='rb'+(GID++), lt=shade(c,45), dk=shade(c,-30);
  const chev=y=>`<path d="M2.5 ${y+6} L12 ${y} L21.5 ${y+6} L21.5 ${y+10.5} L12 ${y+4.5} L2.5 ${y+10.5}Z" fill="url(#${id})" stroke="${shade(c,-55)}" stroke-width=".6" stroke-linejoin="round"/>`;
  return `<svg class="rbadge" viewBox="0 0 24 24" width="${size}" height="${size}"><title>${n}</title><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lt}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${dk}"/></linearGradient></defs>${chev(2.5)}${n==='Emerald Stripe'?chev(10).replace(`url(#${id})`,`url(#${id}p)`):chev(10)}</svg>`.replace('</defs>',n==='Emerald Stripe'?`<linearGradient id="${id}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b07ae0"/><stop offset="1" stop-color="#5a2a8c"/></linearGradient></defs>`:'</defs>'); }; })(rankBadge);
// Monster Kingdom star artwork: glossy cobalt star; emerald star = purple star in a green ring
rankBadge=(function(prev){ return function(r,size){ const [,n]=rankOf(r); size=size||26; const id='rs'+(GID++);
  const P='M12 3.2 L14.6 9 L20.9 9.6 L16.1 13.8 L17.5 20 L12 16.8 L6.5 20 L7.9 13.8 L3.1 9.6 L9.4 9Z';
  if(n==='Cobalt Star') return `<svg class="rbadge" viewBox="0 0 24 24" width="${size}" height="${size}"><title>${n}</title><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset=".45" stop-color="#4aa3ea"/><stop offset="1" stop-color="#1c5fae"/></linearGradient></defs><path d="${P}" fill="url(#${id})" stroke="#174a86" stroke-width=".6" stroke-linejoin="round"/><path d="M12 3.2 L12 16.8 L6.5 20 L7.9 13.8 L3.1 9.6 L9.4 9Z" fill="#fff" opacity=".22"/></svg>`;
  if(n==='Emerald Star') return `<svg class="rbadge" viewBox="0 0 24 24" width="${size}" height="${size}"><title>${n}</title><defs><radialGradient id="${id}"><stop offset=".6" stop-color="#1d6b2a"/><stop offset="1" stop-color="#7ee04a"/></radialGradient></defs><circle cx="12" cy="12" r="11" fill="url(#${id})" stroke="#c8f56a" stroke-width="1"/><circle cx="12" cy="12" r="8.6" fill="#173d1c"/><path d="${P}" transform="translate(12 12.4) scale(.78) translate(-12 -12)" fill="#5a1f8c" stroke="#7ee04a" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  return prev(r,size); }; })(rankBadge);

// ---------- tap your rank: the full rank ladder ----------
function openRanks(){ const me=myRank(), cur=rankOf(me)[1];
  sheet(`<div class="rkl rkl-v"><h2>Ranks</h2><div class="rkl-grid">${RANKS.map(r=>`<div class="rkl-c ${r[1]===cur?'on':''}">${rankBadge(r[0],40)}<b>${r[1]}</b><span>${r[0]===0?200:r[0]}</span></div>`).join('')}</div></div>`,{cls:'rklsheet rklv'}); }
document.addEventListener('click',e=>{ const t=e.target.closest&&e.target.closest('.hbar.rank, .cc-rank, .ares-r'); if(!t) return; e.stopPropagation(); openRanks(); },true);

// ---------- attack pose face: angry brow + open, toothy mouth (shown only during the attack pose) ----------
const ATK_MOUTH={cat:[1.5,2.1,1.0],hound:[2.9,1.9,1.1],turtle:[1.6,1.9,1.0],dragon:[2.1,2.0,1.1],bird:[1.3,1.7,.9],bug:[1.2,2.0,.9]};
let ATK_FAM='cat';
eye3=(function(prev){ return function(x,y,r,iris,st,tilt){ const base=prev(x,y,r,iris,st,tilt); const [mx,my,ms]=ATK_MOUTH[ATK_FAM]||[1.5,2,1];
  const cx=x+r*mx, cy=y+r*my, w=r*1.5*ms, h=r*1.05*ms;
  const face=`<g class="atkf"><path d="M${x-r*1.3} ${y-r*1.35} L${x+r*1.3} ${y-r*0.45}" stroke="${OL3}" stroke-width="${Math.max(2,r*0.62)}" stroke-linecap="round"/>
    <path d="M${cx-w} ${cy-h*0.35} Q${cx} ${cy-h*0.6} ${cx+w} ${cy-h*0.45} Q${cx+w*0.6} ${cy+h*1.1} ${cx-w*0.1} ${cy+h*0.95} Q${cx-w*0.8} ${cy+h*0.6} ${cx-w} ${cy-h*0.35}Z" fill="#4a1410" stroke="${OL3}" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M${cx-w*0.25} ${cy+h*0.85} Q${cx+w*0.15} ${cy+h*0.35} ${cx+w*0.55} ${cy+h*0.6} Q${cx+w*0.2} ${cy+h*1.05} ${cx-w*0.25} ${cy+h*0.85}Z" fill="#ff7a8a"/>
    <path d="M${cx-w*0.7} ${cy-h*0.32} l${w*0.18} ${h*0.55} l${w*0.18} ${-h*0.58}Z M${cx+w*0.35} ${cy-h*0.42} l${w*0.16} ${h*0.5} l${w*0.16} ${-h*0.52}Z" fill="#fff" stroke="${OL3}" stroke-width=".6"/></g>`;
  return base+face; }; })(eye3);
monSVG=(function(prev){ return function(spId,lvl,cls){ const sp=SPI[spId]; if(sp&&FAM[sp.fam]) ATK_FAM=FAM[sp.fam].shape; return prev(spId,lvl,cls); }; })(monSVG);
animateBattle=(function(prev){ return function(root,b,animating){ const r=prev(root,b,animating); if(!animating) return r;
  try{ const a=(b.ev||[]).find(e=>e.k==='act'); const sk=a&&SK[a.sk]; if(sk&&a.sk!=='basic'&&(sk.t==='enemy'||sk.t==='allE')){ const ac=fEl(a.s,a.i); if(ac){ ac.classList.add('pose-atk'); setTimeout(()=>ac.classList.remove('pose-atk'),650); } } }catch(_){}
  return r; }; })(animateBattle);

// ---------- rank symbols v3: 3D chevrons and faceted stars, Monster Kingdom style ----------
const RK_COL={Bronze:['#e08a4a','#9a4f22'],Silver:['#eef2f6','#9aa6b4'],Gold:['#ffd75a','#c48a12'],Cobalt:['#7cc4f4','#1f6fc4'],Emerald:['#9dfa2a','#8a1fa8']};
function rkStar(cx,cy,R,light,dark,id){ const r=R*0.46; let pts=[]; for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r:R; pts.push([cx+Math.cos(a)*rr, cy+Math.sin(a)*rr]); }
  let g=''; for(let i=0;i<10;i++){ const p=pts[i], q=pts[(i+1)%10]; const lit=(i%2===0)?(i<5?light:shade(dark,25)):(i<5?shade(light,-12):dark);
    g+=`<path d="M${cx} ${cy} L${p[0].toFixed(2)} ${p[1].toFixed(2)} L${q[0].toFixed(2)} ${q[1].toFixed(2)}Z" fill="${lit}" stroke="${lit}" stroke-width=".25"/>`; }
  return {g, outline:'M'+pts.map(p=>p[0].toFixed(2)+' '+p[1].toFixed(2)).join(' L')+'Z'}; }
rankBadge=function(r,size){ const [,n,,k]=rankOf(r); size=size||26; const metal=n.split(' ')[0]; const [top,side]=RK_COL[metal]||['#ccc','#888'];
  let body='';
  if(k==='stripe'){
    const sideC=metal==='Emerald'?side:shade(top,-38), topD=shade(top,-14);
    const chev=(y)=>`<path d="M2.5 ${y+7.5} L12 ${y+2} L21.5 ${y+7.5} L21.5 ${y+10.5} L12 ${y+5} L2.5 ${y+10.5}Z" transform="translate(0 2.2)" fill="${sideC}"/>
      <path d="M2.5 ${y+7.5} L12 ${y+2} L12 ${y+5} L2.5 ${y+10.5}Z" fill="${top}"/><path d="M12 ${y+2} L21.5 ${y+7.5} L21.5 ${y+10.5} L12 ${y+5}Z" fill="${topD}"/>`;
    body=chev(0.5)+chev(7.5);
  } else if(n==='Emerald Star'){
    const s=rkStar(12,12.7,8.2,'#b23ad0','#5c1474');
    body=`<circle cx="12" cy="12" r="10.6" fill="#7a1a96"/><circle cx="12" cy="12" r="10.6" fill="none" stroke="${top}" stroke-width="1.9"/><path d="${s.outline}" fill="none" stroke="#6fe82a" stroke-width="2.4" stroke-linejoin="round"/>${s.g}`;
  } else { const s=rkStar(12,12.8,11,shade(top,18),side); body=s.g; }
  return `<svg class="rbadge" viewBox="0 0 24 24" width="${size}" height="${size}"><title>${n}</title>${body}</svg>`; };

// ---------- in-game keyboard: when the game is rotated on an upright phone, type sideways like the game ----------
const KB_ROWS=[['q','w','e','r','t','y','u','i','o','p'],['a','s','d','f','g','h','j','k','l'],['shift','z','x','c','v','b','n','m','back'],['123','space','done']];
const KB_NUM=[['1','2','3','4','5','6','7','8','9','0'],['-','/',':',';','(',')','$','&','@','"'],['#+=','.',',','?','!',"'",'_','*','back'],['ABC','space','done']];
let KB=null, KBIN=null, KBSHIFT=true, KBNUM=false;
function kbDraw(){ if(!KB) return; const rows=KBNUM?KB_NUM:KB_ROWS;
  KB.innerHTML=rows.map(r=>`<div class="kb-r">${r.map(k=>{ const lab=k==='shift'?'⇧':k==='back'?'⌫':k==='space'?'space':k==='done'?'Done':(KBSHIFT&&k.length===1?k.toUpperCase():k);
    return `<button class="kb-k ${k.length>1&&k!=='#+='?'kb-'+k:''} ${k==='shift'&&KBSHIFT?'on':''}" data-k="${esc(k)}">${esc(lab)}</button>`; }).join('')}</div>`).join(''); }
function kbInsert(t){ const el=KBIN; if(!el) return; const s=el.selectionStart??el.value.length, e=el.selectionEnd??el.value.length, max=el.maxLength>0?el.maxLength:1e9;
  if(t==='\b'){ if(s===e&&s>0){ el.value=el.value.slice(0,s-1)+el.value.slice(e); el.setSelectionRange(s-1,s-1); } else { el.value=el.value.slice(0,s)+el.value.slice(e); el.setSelectionRange(s,s); } }
  else { if(el.value.length-(e-s)+t.length>max) return; el.value=el.value.slice(0,s)+t+el.value.slice(e); el.setSelectionRange(s+t.length,s+t.length); }
  el.dispatchEvent(new Event('input',{bubbles:true})); }
function kbClose(){ if(KB){ KB.remove(); KB=null; } document.body.classList.remove('kb-open'); if(KBIN){ const el=KBIN; KBIN=null; el.blur(); el.dispatchEvent(new Event('change',{bubbles:true})); } }
function kbOpen(el){ KBIN=el; KBSHIFT=!el.value; KBNUM=false; if(!KB){ KB=document.createElement('div'); KB.className='kbd';
    KB.addEventListener('pointerdown',e=>{ e.preventDefault(); const b=e.target.closest('[data-k]'); if(!b) return; const k=b.dataset.k;
      if(k==='shift'){ KBSHIFT=!KBSHIFT; kbDraw(); return; } if(k==='123'||k==='#+='){ KBNUM=true; kbDraw(); return; } if(k==='ABC'){ KBNUM=false; kbDraw(); return; }
      if(k==='back'){ kbInsert('\b'); return; } if(k==='done'){ if(KBIN&&KBIN.tagName==='INPUT'){ const f=KBIN; f.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); } kbClose(); return; }
      kbInsert(k==='space'?' ':(KBSHIFT&&!KBNUM?k.toUpperCase():k)); if(KBSHIFT&&!KBNUM){ KBSHIFT=false; kbDraw(); } });
    document.body.appendChild(KB); }
  document.body.classList.add('kb-open'); kbDraw(); setTimeout(()=>{ try{ el.scrollIntoView({block:'center'}); }catch(_){} },50); }
document.addEventListener('focusin',e=>{ const el=e.target; if(!(el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement)) return; if(el.type&&/checkbox|radio|range|file|button|submit/.test(el.type)) return;
  if(!useKbd()){ el.removeAttribute('inputmode'); return; } el.setAttribute('inputmode','none'); kbOpen(el); },true);
document.addEventListener('pointerdown',e=>{ if(!KB) return; if(e.target.closest('.kbd')||e.target===KBIN) return; kbClose(); },true);

// Mana Shards (MK screenshot: 30 mana, steals 90 at lv 10) and Hydrate cost (132 at lv 10)
Object.assign(ICON,{mkshards:'<path d="M5 19 L8 7 L10 19Z M9.5 19 L12.5 4 L15 19Z M14.5 19 L17.5 9 L19.5 19Z" fill="#fff"/><path d="M4 20 Q12 17 20 20" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
  mkhydrate:'<path d="M9.5 4 H14.5 V9.5 H20 V14.5 H14.5 V20 H9.5 V14.5 H4 V9.5 H9.5Z" fill="#fff"/>'});
Object.assign(MK_ICON,{manashards:'mkshards',hydrate:'mkhydrate'});
SK.manashards={n:'Mana Shards',el:'water',t:'enemy',k:'drain',mp:[12,2],steal:[18,8],desc:"Crystalize {steal} of the enemy's mana, stealing it to gain {steal} mana."};
Object.assign(SK.hydrate,{mp:[15,13]});
DEFAULT_SK.manashards=JSON.parse(JSON.stringify(SK.manashards)); if(DEFAULT_SK.hydrate) DEFAULT_SK.hydrate.mp=[15,13];

// more Monster Kingdom screenshots (lv 10 numbers)
Object.assign(ICON,{
  mkfeedback:'<path d="M2.5 13 H7 L9 8.5 L11.5 18 L14.5 5 L16.5 13 H21.5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/>',
  mkmolten:'<circle cx="12" cy="12" r="2.3" fill="#fff"/><path d="M10.20 8.88 L7.50 4.21 A9 9 0 0 1 16.50 4.21 L13.80 8.88 A3.6 3.6 0 0 0 10.20 8.88Z M15.60 12.00 L21.00 12.00 A9 9 0 0 1 16.50 19.79 L13.80 15.12 A3.6 3.6 0 0 0 15.60 12.00Z M10.20 15.12 L7.50 19.79 A9 9 0 0 1 3.00 12.00 L8.40 12.00 A3.6 3.6 0 0 0 10.20 15.12Z" fill="#fff"/>',
  mkfeed:'<path d="M4 9 Q12 5 20 9 L18.5 12 L17 9.5 L15.5 12.5 L14 9.3 L12.5 12.8 L11 9.3 L9.5 12.5 L8 9.5 L6.5 12 Z" fill="#fff"/><path d="M4.5 15 Q12 19 19.5 15 L18 13.5 L16.8 15.6 L15.3 13.2 L14 16 L12.6 13 L11.2 16 L9.8 13.2 L8.4 15.6 L7 13.5Z" fill="#fff"/>',
  mkflame:'<path d="M18.5 7 Q14 3 9 5 Q4 7.5 4.5 13 Q5.5 19 12 19.5 Q17 19.5 19 15 Q15.5 17 12.5 15.5 Q9.5 13.5 11 10.5 Q13 7.5 18.5 7Z" fill="#fff"/>',
  mkleech:'<path d="M6 10 A6.5 6.5 0 0 1 17.5 8 L19.5 6 L19.5 12 L13.5 12 L15.6 9.9 A3.8 3.8 0 0 0 8.8 11Z M18 14 A6.5 6.5 0 0 1 6.5 16 L4.5 18 L4.5 12 L10.5 12 L8.4 14.1 A3.8 3.8 0 0 0 15.2 13Z" fill="#fff"/>',
  mkblizzard:'<path d="M6 11 Q5 6.5 9.5 6.5 Q11 3.5 14.5 5 Q18.5 4.8 18.5 8.5 Q20.5 9.5 19 11.5Z" fill="#fff"/><g fill="#fff"><circle cx="7.5" cy="14" r="1.2"/><circle cx="11" cy="14.5" r="1.2"/><circle cx="14.5" cy="14" r="1.2"/><circle cx="17.5" cy="15" r="1.1"/><circle cx="9" cy="17.5" r="1.2"/><circle cx="12.5" cy="18" r="1.2"/><circle cx="16" cy="18.2" r="1.1"/><circle cx="11" cy="20.6" r="1"/></g>',
  mkpers:'<path d="M3.5 18 L9.5 12 L12.5 15 L17 10.5 L15 8.5 L21 7.5 L20 13.5 L18.3 11.8 L12.5 17.6 L9.5 14.6 L5 19.2Z" fill="#fff"/>'});
Object.assign(MK_ICON,{feedback:'mkfeedback',moltencore:'mkmolten',feed:'mkfeed',flame:'mkflame',leech:'mkleech',blizzard:'mkblizzard',perseverance:'mkpers',regrowth:'mkhydrate'});
Object.assign(SK.feedback,{el:'nature',mp:[20,13],dmg:[30,16],burnmp:[19,10],desc:'Causes the enemy to burn themselves with their own mana, burning {mana} mana and dealing {dmg} nature damage.'});
Object.assign(SK.moltencore,{mp:[21,14],dmg:[47,28],recoil:.24});
Object.assign(SK.leech,{mp:[18,9],dmg:[18,12],mpLeech:.5}); delete SK.leech.leech;
Object.assign(SK.feed,{mp:[19,11]}); Object.assign(SK.flame,{mp:[19,7]}); Object.assign(SK.blizzard,{mp:[15,7]});
Object.assign(SK.perseverance,{el:'nature',mp:[16,7]}); Object.assign(SK.regrowth,{mp:[19,7]});
['feedback','moltencore','leech','feed','flame','blizzard','perseverance','regrowth'].forEach(k=>{ DEFAULT_SK[k]=JSON.parse(JSON.stringify(SK[k])); });
skillDesc=(function(prev){ return function(id,L){ const s=SK[id]; L=L||1;
  if(id==='moltencore'&&s){ const d=Math.round(lv(s.dmg,L)); return `Launches a powerful attack that deals ${d} fire damage but inflicts ${Math.round(d*(s.recoil||0))} damage on yourself.`; }
  if(id==='leech'&&s&&s.mpLeech){ const d=Math.round(lv(s.dmg,L)); return `A natural attack that deals ${d} damage and steals ${Math.round(d*s.mpLeech)} mana.`; }
  return prev(id,L); }; })(skillDesc);

// Crustan screenshot (lv 10): Wave, Purge, Splash, Camel Back
Object.assign(ICON,{mkpurge:'<path d="M12 3 Q17.5 10 17.5 14.2 A5.5 5.5 0 0 1 6.5 14.2 Q6.5 10 12 3Z" fill="#fff"/><path d="M11 11 H13 V13.2 H15.2 V15.2 H13 V17.4 H11 V15.2 H8.8 V13.2 H11Z" fill="#22a6e3"/>',
  mkcamel:'<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M4 7.4c2.7-2.3 5.3-2.3 8 0s5.3 2.3 8 0"/><path d="M4 12.4c2.7-2.3 5.3-2.3 8 0s5.3 2.3 8 0"/><path d="M4 17.4c2.7-2.3 5.3-2.3 8 0s5.3 2.3 8 0"/></g>'});
Object.assign(MK_ICON,{purge:'mkpurge',camelback:'mkcamel'});
Object.assign(SK.wave,{mp:[16,9],dmg:[15,12],soak:.33,soakTurns:6,desc:"Deals {dmg} water damage and reduces enemy's water resistance by 33% for 6 turns."}); delete SK.wave.weaken;
Object.assign(SK.purge,{mp:[12,4],healFlat:[15,9],desc:'Heals {amt} life and removes all negative effects.'}); delete SK.purge.heal;
Object.assign(SK.splash,{dmg:[22,19]});
Object.assign(SK.camelback,{v:[6,5],desc:'Regenerates {v} mana every turn.'});
['wave','purge','splash','camelback'].forEach(k=>{ DEFAULT_SK[k]=JSON.parse(JSON.stringify(SK[k])); });
ST_ICON.soak=['mkwave','#22a6e3']; BUFF_N.soak='Soaked'; ST_ICON.scorch=['mkember','#e3262d']; BUFF_N.scorch='Scorched';
stDesc=(function(prev){ return function(m,k){ if(k==='scorch') return `Takes ${Math.round((m.st.scorchV||0)*100)}% more fire damage (${m.st.scorch} turn${m.st.scorch>1?'s':''})`; if(k==='soak') return `Takes ${Math.round((m.st.soakV||0)*100)}% more water damage (${m.st.soak} turn${m.st.soak>1?'s':''})`; return prev(m,k); }; })(stDesc);
skillDesc=(function(prev){ return function(id,L){ const s=SK[id]; L=L||1;
  if(id==='wave'&&s&&s.soak) return `Deals ${Math.round(lv(s.dmg,L))} water damage and reduces enemy's water resistance by ${Math.round((Array.isArray(s.soak)?lv(s.soak,L):s.soak)*100)}% for ${s.soakTurns||6} turns.`;
  if(id==='purge'&&s&&s.healFlat) return `Heals ${Math.round(lv(s.healFlat,L))} life and removes all negative effects.`;
  if(id==='camelback'&&s) return `Regenerates ${Math.round(lv(s.v,L))} mana every turn.`;
  return prev(id,L); }; })(skillDesc);

// Trisaurus / arena screenshots (lv 10): Trample, Arc Lightning, Berserk, Nature Shield, Ember Spit, Poison
Object.assign(ICON,{
  mkpoison:'<path d="M12 3.5 C7 3.5 4.5 7 4.5 10.8 C4.5 13.6 6 15.4 7.6 16.2 V19.5 H16.4 V16.2 C18 15.4 19.5 13.6 19.5 10.8 C19.5 7 17 3.5 12 3.5Z" fill="#fff"/><circle cx="9" cy="11" r="2.2" fill="#2f9e44"/><circle cx="15" cy="11" r="2.2" fill="#2f9e44"/><path d="M12 13.3 L13.4 15.6 H10.6Z" fill="#2f9e44"/><path d="M10 17.2 V19.5 M12 17.2 V19.5 M14 17.2 V19.5" stroke="#2f9e44" stroke-width="1"/>',
  mknshield:'<path d="M5 4.5 H19 V12 Q19 18 12 21 Q5 18 5 12Z" fill="#fff"/><path d="M12 17.5 Q8.2 14.5 9.6 10.5 Q10.8 8 13.8 7 Q16 11.5 13.2 14.6 Q12.5 15.4 12 17.5Z M12 17.5 Q12.2 13 13.4 9.6" fill="#2f9e44" stroke="#fff" stroke-width=".6"/>',
  mkember:'<path d="M10 3 H15.5 L13.5 9.5 L16.5 9.5 L13.8 14.2 H17 L12 21 L7 14.2 H10.4 L9 9.5 H11.6Z" fill="#fff"/>',
  mkarc:'<path d="M12.5 3 L8.5 10.5 H11.5 L9 16 L15 8.5 H12 L14.5 3Z" fill="#fff"/><path d="M6 13 Q5.5 18.5 11 20 Q8 17.5 8.2 14.5Z" fill="#fff"/><path d="M17.5 12 L18.2 13.6 L19.8 14.2 L18.2 14.8 L17.5 16.4 L16.8 14.8 L15.2 14.2 L16.8 13.6Z M15.5 18.5 L15.9 19.3 L16.7 19.6 L15.9 19.9 L15.5 20.7 L15.1 19.9 L14.3 19.6 L15.1 19.3Z" fill="#fff"/>'});
Object.assign(MK_ICON,{poison:'mkpoison',nshield:'mknshield',emberspit:'mkember',arclightning:'mkarc'});
Object.assign(SK.trample,{el:'neutral',mp:[14,4],m:[1.5,0],desc:'Physical attack that does your regular attack damage plus an additional 50% damage.'}); delete SK.trample.stun;
Object.assign(SK.arclightning,{mp:[20,8],dmg:[18,11],zap:.35,zapTurns:6}); delete SK.arclightning.hits;
Object.assign(SK.berserk,{el:'fire',mp:[13,8]});
Object.assign(SK.nshield,{mp:[22,9]}); Object.assign(SK.emberspit,{mp:[20,8]});
Object.assign(SK.poison,{mp:[17,7],tick:[11,8],turns:6});
['trample','arclightning','berserk','nshield','emberspit','poison'].forEach(k=>{ DEFAULT_SK[k]=JSON.parse(JSON.stringify(SK[k])); });
ST_ICON.zap=['mkarc','#f29a1f']; BUFF_N.zap='Charged';
stDesc=(function(prev){ return function(m,k){ if(k==='zap') return `Takes ${Math.round((m.st.zapV||0)*100)}% more lightning damage (${m.st.zap} turn${m.st.zap>1?'s':''})`; return prev(m,k); }; })(stDesc);
skillDesc=(function(prev){ return function(id,L){ const s=SK[id]; L=L||1;
  if(id==='arclightning'&&s&&s.zap) return `Lightning zap that deals ${Math.round(lv(s.dmg,L))} damage and reduces enemy's lightning resistance by ${Math.round(s.zap*100)}%.`;
  if(id==='poison'&&s) return `Inflicts poison for ${s.turns} turns, dealing ${Math.round(lv(s.tick,L))} damage each turn.  Penetrates shields.`;
  if(id==='trample'&&s&&s.m) return `Physical attack that does your regular attack damage plus an additional ${Math.round((lv(s.m,L)-1)*100)}% damage.`;
  return prev(id,L); }; })(skillDesc);
ICON.mkclaw='<path d="M4 15 L15.5 5.5 L12.5 9.5 L17 7.5 Z M5 19 L18 8.5 L14.8 12.8 L19.8 10.5 Z M8 21.5 L19.5 12.5 L16.8 16.2 L20.8 14.5 Z" fill="#fff"/>';

// stat +/- buttons: one point when the finger lifts, hold to keep adding; no iOS magnifier
(function(){ let tmr=null, rep=null, sel=null, repeated=false;
  const fire=()=>{ const x=sel&&document.querySelector(sel); if(!x||x.disabled){ clearInterval(rep); rep=null; return; } x.click(); const y=document.querySelector(sel); if(y) y.classList.add('held'); };
  const clear=()=>{ clearTimeout(tmr); clearInterval(rep); tmr=rep=null; document.querySelectorAll('.pbtn.held').forEach(x=>x.classList.remove('held')); };
  const end=e=>{ if(!sel) return; const tap=!repeated && e.type==='touchend'; clear(); if(tap) fire(); document.querySelectorAll('.pbtn.held').forEach(x=>x.classList.remove('held')); sel=null; };
  addEventListener('touchstart',e=>{ const b=e.target.closest&&e.target.closest('[data-pp],[data-pm]'); if(!b) return;
    e.preventDefault(); clear(); if(b.disabled){ sel=null; return; }
    sel=b.dataset.pp?`[data-pp="${b.dataset.pp}"]`:`[data-pm="${b.dataset.pm}"]`; repeated=false; b.classList.add('held');
    b.addEventListener('touchend',end,{once:true}); b.addEventListener('touchcancel',end,{once:true});
    tmr=setTimeout(()=>{ repeated=true; fire(); rep=setInterval(fire,170); },650); },{capture:true,passive:false});
  addEventListener('touchend',end,{capture:true}); addEventListener('touchcancel',end,{capture:true});
  let lastTouch=0; addEventListener('touchstart',()=>{ lastTouch=Date.now(); },{capture:true,passive:true});
  addEventListener('click',e=>{ if(e.isTrusted && Date.now()-lastTouch<1000 && e.target.closest&&e.target.closest('[data-pp],[data-pm]')){ e.preventDefault(); e.stopImmediatePropagation(); } },true);
})();

// mission and rival fights: bring the whole team (Monster Kingdom style: pick one, swap any time)
newBattle=(function(prev){ return function(a,b,o){
  if(o&&o.mode==='campaign'&&a&&a.name===S.name&&a.mons&&a.mons.length===1){
    const tm=teamMons(); if(tm.length>1){ const first=a.mons[0];
      const mons=tm.map(m=>m.uid===first.uid?first:snapOf(m)); if(!tm.some(m=>m.uid===first.uid)) mons.unshift(first); a=Object.assign({},a,{mons}); o=Object.assign({},o,{single:true}); } }
  return prev(a,b,o); }; })(newBattle);
drive=(function(prev){ let introFor=null; return function(){
  if(B&&B.mode==='campaign'&&B.b&&B.b.single&&introFor!==B.b){ introFor=B.b; B.stamp=Date.now(); B.tkey=turnKey(B.b); }
  return prev(); }; })(drive);
// auto battle picks for you right away (missions: your mission monster first)
drive=(function(prev){ return function(){ prev(); const b=B&&B.b; if(!b||B.paused||b.over||!b.single||b.phase!=='pick') return;
  const s=b.pickSide; if(B.ctl[s]!=='human'||!B.auto||(B.net&&B.net.role==='guest')) return;
  clearTimeout(B.timer); B.timer=setTimeout(()=>{ if(!B||B.b!==b||b.phase!=='pick'||b.pickSide!==s||!B.auto) return;
    let i=aiPick(b,s); if(B.mode==='campaign'&&B.meta&&B.meta.uid){ const j=b.sides[s].mons.findIndex(m=>m.uid===B.meta.uid&&m.hp>0); if(j>=0&&b.sides[s].active==null) i=j; }
    pick(b,s,i); afterAct(); },400); }; })(drive);
// auto battle: no ability-name / effect-name words floating over the field
renderBattle=(function(prev){ return function(){ const r=prev.apply(this,arguments); document.body.classList.toggle('auto-on',!!(B&&B.auto)); return r; }; })(renderBattle);
closeBattle=(function(prev){ return function(){ document.body.classList.remove('auto-on'); return prev.apply(this,arguments); }; })(closeBattle);

// ---------- smoother arena entrance: glides in from the side with three easing hops, lands with a soft squash ----------
const ENT_FRAMES=(function(){ const fr=[], LAND=LAND_MS/ENT_MS, N=36;
  for(let k=0;k<=N;k++){ const p=k/N, e=1-Math.pow(1-p,3); const hop=Math.abs(Math.sin(Math.PI*3*p))*(1-p*.55);
    fr.push({p, x:1-e, y:hop, offset:p*LAND}); }
  return fr; })();
function entAnim(f,d,W,H){
  const fr=ENT_FRAMES.map(q=>({transform:`translate(${(-d*W*q.x).toFixed(1)}px,${(-H*q.y).toFixed(1)}px)`,offset:q.offset}));
  const L=LAND_MS/ENT_MS;
  fr.push({transform:'translate(0,0) scale(1.07,.93)',offset:L+.05},{transform:'translate(0,0) scale(.98,1.02)',offset:L+.13},{transform:'none',offset:L+.21},{transform:'none',offset:1});
  return f.animate(fr,{duration:ENT_MS,easing:'linear'}); }
renderBattle=(function(prev){ return function(){
  document.querySelectorAll('#battle .fighter .fart').forEach(f=>{ if(f._enA){ f._enA.cancel(); } });
  prev(); if(!B||!B.b) return; const now=Date.now();
  document.querySelectorAll('#battle .fighter').forEach(el=>{ const s=el.dataset.s, f=el.querySelector('.fart'); if(!f||!B.enT||!B.enT[s]) return;
    const e=now-B.enT[s].t; if(e>=ENT_MS) return; if(f._enA) f._enA.cancel();
    const d=el.classList.contains('l')?1:-1, W=document.body.clientWidth*.62, H=document.body.clientHeight*.11;
    f._enA=entAnim(f,d,W,H); f._enA.currentTime=e; }); }; })(renderBattle);

// one-time admin gift: 1000 mushrooms
(function(){ const give=()=>{ try{ if(!ADMIN||typeof S==='undefined'||!S||S.giftMush1k||String(S.name||'').toLowerCase()!=='george') return false; S.mush=(S.mush|0)+1000; S.giftMush1k=1; persist(); if(typeof renderHUD==='function') renderHUD(); if(typeof toast==='function') toast('+1000 mushrooms'); return true; }catch(_){ return false; } };
  setAdmin=(function(prev){ return function(v){ const r=prev(v); setTimeout(give,300); return r; }; })(setAdmin);
  let n=0; const iv=setInterval(()=>{ if(give()||++n>40) clearInterval(iv); },1500); })();

// home yard: a tap opens the monster actually drawn under your finger (overlapping monsters no longer steal taps)
document.addEventListener('click',e=>{ if(!e.isTrusted) return; const t=e.target; if(t.closest&&t.closest('.pet.roam')) return; if(!(t.closest&&t.closest('#view'))||document.querySelector('#battle')||document.querySelector('.sheet')) return;
  if(t.closest&&t.closest('button,a,input,.sheet,.hbar,[data-go]')) return;
  const x=e.clientX, y=e.clientY; let best=null, bd=1e9;
  document.querySelectorAll('.pet.roam').forEach(p=>{ const r=p.getBoundingClientRect(); const pad=8;
    if(x<r.left-pad||x>r.right+pad||y<r.top-pad||y>r.bottom+pad) return;
    const d=Math.hypot(x-(r.left+r.right)/2,y-(r.top+r.bottom)/2); if(d<bd){ bd=d; best=p; } });
  if(best){ e.stopPropagation(); best.click(); } },true);

// ---------- only one Mana Bowl and one Life Bowl per monster ----------
const ONE_EACH=['manabowl','lifebowl'];
function dupEquip(m,slot,id){ return !!id&&ONE_EACH.includes(id)&&Object.entries(m.eq||{}).some(([k,v])=>v===id&&String(k)!==String(slot)); }
(function(){ setTimeout(()=>{ try{ let ch=0; (S.mons||[]).forEach(m=>{ const seen={}; Object.keys(m.eq||{}).forEach(k=>{ const id=m.eq[k]; if(ONE_EACH.includes(id)){ if(seen[id]){ m.eq[k]=null; S.inv[id]=(S.inv[id]|0)+1; ch=1; } seen[id]=1; } }); }); if(ch) persist(); }catch(_){} },1500); })();
let PICKCTX=null;
pickItem=(function(prev){ return function(m,slot){ PICKCTX={m,slot}; return prev(m,slot); }; })(pickItem);
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('#psel,#s2eq'); if(!b) return; let m,slot,id;
  if(b.id==='s2eq'){ if(!SHOPCTX) return; m=SHOPCTX.m; slot=SHOPCTX.slot; id=SHOPSEL||Object.keys(ITEMS)[0]; }
  else { if(!PICKCTX) return; m=PICKCTX.m; slot=PICKCTX.slot; const s=b.closest('.sheet')&&b.closest('.sheet').querySelector('[data-pi].sel'); id=s?s.dataset.pi:null; }
  if(m&&dupEquip(m,slot,id)){ e.stopImmediatePropagation(); e.preventDefault(); alertBox(`${SPI[m.sp].n} already has a ${ITEMS[id].n} equipped. Only one per monster.`); } },true);

// ---------- life/mana bars and new status icons wait for their moment in the animation ----------
animateBattle=(function(prev){ return function(root,b,animating){
  B.pend=new Map(); B.hideSt=new Map();
  if(animating){ const mon=e=>b.sides[e.s]&&b.sides[e.s].mons[e.i];
    (b.ev||[]).forEach(e=>{ const m=mon(e); if(!m) return;
      if(e.k==='hit'||e.k==='dot'||e.k==='heal'||e.k==='mana'){ const p=B.pend.get(m)||{hp:0,mp:0}; const v=e.rv!=null?e.rv:(e.v|0);
        if(e.k==='hit'||e.k==='dot') p.hp-=v; else if(e.k==='heal') p.hp+=v; else p.mp+=v; B.pend.set(m,p); }
      if(e.k==='buff'&&e.b&&!e.missed&&e.k!=='miss'){ const h=B.hideSt.get(m)||{}; h[e.b]=(h[e.b]|0)+1; B.hideSt.set(m,h); } });
    try{ syncHud(b); }catch(_){} }
  return prev(root,b,animating); }; })(animateBattle);
function evLand(b,e){ const m=b.sides[e.s]&&b.sides[e.s].mons[e.i]; if(!m||!B) return;
  if(B.pend&&B.pend.get&&(e.k==='hit'||e.k==='dot'||e.k==='heal'||e.k==='mana')){ const p=B.pend.get(m); if(p){ const v=e.rv!=null?e.rv:(e.v|0);
    if(e.k==='hit'||e.k==='dot') p.hp+=v; else if(e.k==='heal') p.hp-=v; else p.mp-=v; } }
  if(B.hideSt&&B.hideSt.get&&e.k==='buff'){ const h=B.hideSt.get(m); if(h&&h[e.b]) h[e.b]--; } }
function dotIntro(el,e,b){ const m=b.sides[e.s].mons[e.i]; const src=m.st[e.dk+'Src']||({burn:'burn',poison:'poison',storm:'stormcloud',frost:'blizzard'})[e.dk];
  const ic=document.createElement('div'); ic.className='dotpop'; ic.innerHTML=stIconFor(e.dk,src)(46); el.appendChild(ic); setTimeout(()=>ic.remove(),900);
  const [x,y]=fCenter(el); const bu=document.createElement('div'); bu.className='burst'; bu.style.setProperty('--c',EL[e.el]?EL[e.el].c:'#fff'); bu.style.left=x+'px'; bu.style.top=y+'px'; document.body.appendChild(bu); setTimeout(()=>bu.remove(),460); }
// order: the attack lands on everyone at once; then each damage-over-time plays (icon, then damage); then passive heals; bowls last
function evSchedule(b){ const evs=b.ev||[]; const a=evs.find(e=>e.k==='act'), sk=a&&SK[a.sk];
  let T=0; if(a&&sk){ const ranged=sk.pow&&sk.el!=='neutral'; T=ranged?520:sk.pow?260:300; }
  const per={}; let hitEnd=-1, deb=-1;
  const seqd=e=>e.k==='hit'||e.msh||e.absorb;
  evs.forEach(e=>{ if(e.k==='act'||e.k==='enter'||e.ph||!seqd(e)) return;
    const key=e.s+'-'+e.i; const c=per[key]!=null?per[key]:T; e._d=c; per[key]=c+(e.k==='hit'?320:420); hitEnd=Math.max(hitEnd,e._d); });
  evs.forEach(e=>{ if(e.k==='act'||e.k==='enter'||e.ph||seqd(e)) return;
    if(false);
    else if((e.k==='buff'||e.k==='miss')&&a&&e.s!==a.s&&!(e.k==='miss'||e.missed)){ e._d=hitEnd>=0?hitEnd+450:T+900; deb=Math.max(deb,e._d); }
    else e._d=T+80; });
  let cur=Math.max(hitEnd>=0?hitEnd+700:T+500, deb>=0?deb+500:0);
  [1,2,3].forEach(ph=>evs.forEach(e=>{ if(e.ph!==ph) return; if(ph===1){ e._fx=cur; e._d=cur+(e.k==='dot'?380:0); cur+=850; } else { e._d=cur+(e.pre||0); cur+=650+(e.pre||0); } }));
  const last=Math.max(0,...evs.map(e=>e._d||0)); b._animTotal=Math.max(cur, last+500); return b._animTotal; }
syncHud=(function(prev){ return function(b){ prev(b); if(!B||!B.b) return;
  document.querySelectorAll('#battle .bhp').forEach(el=>{ const s=+el.dataset.hs, i=+el.dataset.hi; const m=b.sides[s]&&b.sides[s].mons[i]; if(!m) return;
    const p=B.pend&&B.pend.get?B.pend.get(m):null; const l=el.querySelectorAll('.lb');
    if(p&&l.length>1){ const hp=Math.max(0,Math.min(m.maxhp,m.hp-p.hp)), mp=Math.max(0,Math.min(m.maxmp,m.mp-p.mp));
      l[0].querySelector('i').style.width=(hp/m.maxhp*100)+'%'; l[0].querySelector('b').textContent=`${hp} / ${m.maxhp} life`;
      l[1].querySelector('i').style.width=(mp/m.maxmp*100)+'%'; l[1].querySelector('b').textContent=`${mp} / ${m.maxmp} mana`; }
    const old=el.querySelector('.hicons'); if(old){ const h=hudIcons(m); if(old.outerHTML!==h){ const t=document.createElement('div'); t.innerHTML=h; old.replaceWith(t.firstElementChild); } } });
  document.querySelectorAll('#battle .fighter').forEach(el=>{ const m=b.sides[+el.dataset.s]&&b.sides[+el.dataset.s].mons[+el.dataset.i]; const p=m&&B.pend&&B.pend.get?B.pend.get(m):null; if(!p||!p.hp) return;
    const bar=el.querySelector('.fhp i'); if(bar) bar.style.width=Math.max(0,(m.hp-p.hp)/m.maxhp*100)+'%'; }); }; })(syncHud);

// ---------- swapping doesn't touch the turn clock: it keeps running through the swap ----------
act=(function(prev){ return function(b,action){ if(B&&B.b===b&&action&&action.swap!=null){ B.swapStamp=B.stamp; B.swapKey=turnKey(b); } return prev(b,action); }; })(act);
setInterval(()=>{ if(!B||!B.b||B.swapStamp==null) return; if(turnKey(B.b)!==B.swapKey){ B.swapStamp=null; return; } B.stamp=B.swapStamp; },40);

// ---------- a short breather after monsters land, before the first move ----------
busyLeft=(function(prev){ return function(){ const base=prev(); if(!B) return base;
  if(base>0){ B._hadBusy=true; B._settleAt=null; return base; }
  if(B._hadBusy){ B._hadBusy=false; if(B.b&&B.b.phase==='fight'&&B.swapStamp==null){ const a=actor(B.b); if(!(a&&B.ctl[a.s]==='human'&&!B.auto)) B._settleAt=Date.now()+600; } }
  const s=B._settleAt?B._settleAt-Date.now():0; return s>0?s:0; }; })(busyLeft);
pickWaitLeft=busyLeft;

// ---------- turn timer only shows while it is actually counting down ----------
function timerRunning(){ if(!B||!B.b||B.paused||B.b.over) return false; const ti=timerInfo(); if(!ti) return false;
  if(B.swapStamp==null && busyLeft()>0) return false;
  const b=B.b; if(b.phase==='pick') return B.ctl[b.pickSide]==='human' || B.ctl[b.pickSide]==='remote';
  const a=actor(b); if(!a) return false; const c=B.ctl[a.s]; return (c==='human'&&!B.auto) || c==='remote'; }
function syncRing(){ const r=document.querySelector('#battle .tring'); if(r) r.classList.toggle('show',timerRunning()); }
renderBattle=(function(prev){ return function(){ const x=prev.apply(this,arguments); syncRing(); return x; }; })(renderBattle);
setInterval(syncRing,80);

// Attack: "Deals 17 damage" (your monster's attack, plus Fury Fist)
let SKD_M=null;
showInfo=(function(prev){ return function(id,a){ SKD_M=a&&a.m; try{ return prev(id,a); } finally{ SKD_M=null; } }; })(showInfo);
skillDesc=(function(prev){ return function(id,L){ if(id==='basic'&&SKD_M){ const m=SKD_M; const d=Math.round(skDmg('basic',1,m))+Math.round((m.pas&&m.pas.fury)||0); return `Deals ${d} damage`; } return prev(id,L); }; })(skillDesc);

// ---------- monster screen, Monster Kingdom look ----------
const PADLOCK_SVG='<svg viewBox="0 0 64 64" class="padlk"><path d="M20 28 V20 a12 12 0 0 1 24 0 V28" fill="none" stroke="#a89e6c" stroke-width="7"/><rect x="12" y="27" width="40" height="30" rx="5" fill="#a89e6c"/><circle cx="32" cy="39" r="4.5" fill="#d8cfa0"/><path d="M30 41 h4 l1.5 9 h-7Z" fill="#d8cfa0"/></svg>';
drawMon=(function(prev){ return function(){ prev(); if(!MONSH) return; const m=monBy(MONSH.uid); if(!m) return; const b=MONSH.sh.body;
  const st=b.querySelector('.pstage'); if(st) st.textContent=STAGE_N[stageOf(m.lvl)].toLowerCase();
  const ps=b.querySelector('.psmall'); if(ps) ps.remove();
  b.querySelectorAll('.eslot.lock').forEach(el=>{ el.innerHTML=PADLOCK_SVG; });
  const up=b.querySelector('.ph .upav'); if(up) up.textContent='(Upgrades Available)';
  const sh=b.closest('.sheet'); if(sh) sh.classList.add('mkprof'); }; })(drawMon);

// Mana Bowl / Life Bowl: pet bowl with a bone and a gold emblem (Monster Kingdom art)
(function(){ const bowl=(c1,c2,c3,emblem)=>`<svg viewBox="0 0 64 64"><defs><linearGradient id="bw${c1.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe58a"/><stop offset="1" stop-color="#d49a1a"/></linearGradient></defs>

  <ellipse cx="32" cy="34" rx="26" ry="8" fill="${c3}" stroke="#2a1a10" stroke-width="2"/><ellipse cx="32" cy="35" rx="21" ry="5.5" fill="#2a1d14"/>
  <g transform="translate(-4 12) rotate(-38 40 18)"><rect x="22" y="14" width="30" height="7" rx="3.5" fill="#f4f1e6" stroke="#6b6250" stroke-width="1.6"/><circle cx="22" cy="14.5" r="4.6" fill="#f4f1e6" stroke="#6b6250" stroke-width="1.6"/><circle cx="22" cy="20.5" r="4.6" fill="#f4f1e6" stroke="#6b6250" stroke-width="1.6"/><circle cx="52" cy="14.5" r="4.6" fill="#f4f1e6" stroke="#6b6250" stroke-width="1.6"/><circle cx="52" cy="20.5" r="4.6" fill="#f4f1e6" stroke="#6b6250" stroke-width="1.6"/><rect x="21" y="14.6" width="32" height="5.8" fill="#f4f1e6"/></g>
  <path d="M6 34 Q7 52 14 54 H50 Q57 52 58 34 Q46 42 32 42 Q18 42 6 34Z" fill="url(#bw${c1.slice(1)})" stroke="#2a1a10" stroke-width="2"/>
  <circle cx="13" cy="44" r="2.6" fill="url(#gd)"/><circle cx="51" cy="44" r="2.6" fill="url(#gd)"/><circle cx="21" cy="48" r="2.2" fill="url(#gd)" opacity=".9"/><circle cx="43" cy="48" r="2.2" fill="url(#gd)" opacity=".9"/>
  ${emblem}</svg>`;
  const heart='<path d="M32 56 C22 49 20 44 22 40.5 C24 37.5 29 37.5 32 41.5 C35 37.5 40 37.5 42 40.5 C44 44 42 49 32 56Z" fill="url(#gd)" stroke="#8a5a0a" stroke-width="1.2"/>';
  const drop='<path d="M32 37 C36 43 39 46 39 50 A7 7 0 0 1 25 50 C25 46 28 43 32 37Z" fill="url(#gd)" stroke="#8a5a0a" stroke-width="1.2"/>';
  const ART={lifebowl:bowl('#ef4a3a','#a8180f','#c42a1e',heart), manabowl:bowl('#4aa8f0','#145fb0','#1f6fc0',drop)};
  itemSVG=(function(prev){ return function(id){ return ART[id]||prev(id); }; })(itemSVG); })();

// Emerald Shift, Acid Bite, Cripple (Monster Kingdom screenshots, lv 10 numbers)
Object.assign(ICON,{
  mkprism:'<path d="M4 18 L12.5 7 L19 18Z" fill="#fff"/><path d="M14 11.5 L21 8.8 V10.6 L14.6 12.6Z" fill="#ff8a8a"/><path d="M14.9 13.3 L21.4 11.6 V13.4 L15.4 14.4Z" fill="#ffd36a"/><path d="M15.6 15.1 L21.6 14.4 V16.2 L16 16.2Z" fill="#8ee08a"/><path d="M2.5 15.5 L9.5 13.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
  mkacid:'<path d="M14.5 3.5 L17.5 6.5 L8.5 15.5 Q6.5 17.5 4.8 15.8 Q3.1 14.1 5.1 12.1Z" fill="#fff"/><path d="M5.6 13.6 L11 8.2 L12.6 9.8 L7.2 15.2 Q6 16.2 5.3 15.3 Q4.6 14.5 5.6 13.6Z" fill="#7ad36a"/><circle cx="15" cy="16" r="1.4" fill="#fff"/><circle cx="18" cy="13.5" r="1" fill="#fff"/><path d="M17 19 L18 17.5 L19 19 L20.5 18.3 L19.6 20" stroke="#fff" stroke-width="1.2" fill="none"/>'});
Object.assign(MK_ICON,{emeraldshift:'mkprism',acidbite:'mkacid'});
SK.emeraldshift={n:'Emerald Shift',el:'nature',t:'enemy',k:'debuff',mp:[10,6],buff:'eshift',v:[.25,.02],v2:[.10,.02],turns:4};
SK.acidbite={n:'Acid Bite',el:'nature',t:'enemy',k:'hit',mp:[2,1],m:[1,0],acid:[.13,.02],acidTurns:4};
Object.assign(SK.cripple,{el:'bolt',mp:[14,5],v:[.16,.0589]});
['emeraldshift','acidbite','cripple'].forEach(k=>{ DEFAULT_SK[k]=JSON.parse(JSON.stringify(SK[k])); });
ST_ICON.acid=['mkacid','#2f9e44']; BUFF_N.acid='Acid'; ST_ICON.eshift=['mkprism','#2f9e44']; BUFF_N.eshift='Emerald Shift';
stDesc=(function(prev){ return function(m,k){ const s=m.st, P=v=>Math.round((v||0)*100)+'%', T=n=>`(${n} turn${n>1?'s':''})`;
  if(k==='acid') return `Takes ${P(s.acidV)} more nature damage ${T(s.acid)}`;
  if(k==='eshift') return `Lightning and physical attacks do ${P(s.eshiftV)} less, takes ${P(s.eshiftR)} more fire and water damage ${T(s.eshift)}`;
  return prev(m,k); }; })(stDesc);
skillDesc=(function(prev){ return function(id,L){ const s=SK[id]; L=L||1; const P=v=>Math.round(v*100)+'%';
  if(id==='emeraldshift'&&s) return `Reduce the enemy's lightning and physical attacks by ${P(lv(s.v,L))} on all direct attacks and reduce their resistance to fire and water by ${P(lv(s.v2,L))}`;
  if(id==='acidbite'&&s) return `Bite the enemy with acid, attacking with the power of nature and reducing their nature defense by ${P(lv(s.acid,L))} for ${s.acidTurns||4} turns.`;
  if(id==='cripple'&&s) return `Cripples your opponent, making them do ${P(Math.min(.75,lv(s.v,L)))} less damage on all direct attacks.`;
  return prev(id,L); }; })(skillDesc);

// nobody moves until the end-of-turn effects (bowl refills, burns, poison ticks) have played out
animateBattle=(function(prev){ return function(root,b,animating){ const r=prev(root,b,animating);
  if(animating){ const tot=b._animTotal||evSchedule(b); const any=(b.ev||[]).some(e=>e.k!=='act'&&e.k!=='enter'); B.animEnd=Date.now()+(any?tot+250:0); }
  return r; }; })(animateBattle);
busyLeft=(function(prev){ return function(){ const base=prev(); const a=B&&B.animEnd?B.animEnd-Date.now():0; return Math.max(base,a>0?a:0); }; })(busyLeft);
pickWaitLeft=busyLeft;

// match over: the monsters still standing relax back into their neutral pose
setInterval(()=>{ if(!B||!B.b||!B.b.over) return; B.overAt=B.overAt||Date.now(); if(Date.now()-B.overAt<900) return;
  document.querySelectorAll('#battle .fighter:not(.ko)').forEach(f=>{ f.classList.remove('cast','casting','lunge-l','lunge-r','dash-l','dash-r','pose-atk','tackling','acting','shake','hitflash'); }); },150);

// mission SUCCESS! in the Monster Kingdom layout: title, wide $ bar, the team, then the XP pill (close with the ✕)
rewardPopup=(function(prev){ return function(o){ const r=prev(o); try{ if(o&&(o.title==='SUCCESS!'||o.title==='DEFEAT'||o.title==='VICTORY!')){ const s=r.body.closest('.sheet')||r.body; s.classList.add('mksucc'); if(o.title==='DEFEAT') s.classList.add('mkdef'); if(!(o.cash>0)){ const cc=r.body.querySelector('.rw-cash:not(.m)'); if(cc) cc.remove(); }
  const c=r.body.querySelector('.rw-cash:not(.m)'); if(c){ const n=(o.cash|0); c.innerHTML=`<div class="mkc"><i>$</i><b>+${n}</b></div><span>dollars</span>`; }
  const x=r.body.querySelector('.rw-xp'); if(x) x.innerHTML=`+${o.xp} <b>XP</b>`; } }catch(_){} return r; }; })(rewardPopup);
// the in-game keyboard closes itself when the box it was typing into goes away (e.g. after Let's go!)
setInterval(()=>{ if(KB&&(!KBIN||!KBIN.isConnected)) kbClose(); },200);
// battle top bars: blank, not "0 / 0", while a side has no monster out yet
renderBattle=(function(prev){ return function(){ const r=prev.apply(this,arguments); if(B&&B.b) document.querySelectorAll('#battle .bhp').forEach(p=>{ const sd=B.b.sides[+p.dataset.hs]; const empty=!sd||sd.active==null; p.classList.toggle('noact',empty); }); return r; }; })(renderBattle);
// tutorial: the Mana Wood is already picked in the item list, the arrow points at Select
pickItem=(function(prev){ return function(m,slot){ const r=prev(m,slot); if(S.tut===6) setTimeout(()=>{ const it=document.querySelector('[data-pi="manawood"]'); if(it){ it.click(); pointAt('#psel'); } },250); return r; }; })(pickItem);
// tutorial step 8: arrows to LET'S GO! and then to a mission's GO!
openZoneSelect=(function(prev){ return function(zi){ const r=prev(zi); if(S.tut===8) setTimeout(()=>pointAt('#lg'),400); return r; }; })(openZoneSelect);
openTasks=(function(prev){ return function(zi){ const r=prev(zi); if(S.tut===8) setTimeout(()=>pointAt('.task:not(.done):not(.fight) .tgo:not([disabled])'),400); return r; }; })(openTasks);
// names never cut off: shrink the text until it fits its card
function fitText(sel,min){ document.querySelectorAll(sel).forEach(el=>{ el.style.fontSize=''; let fs=parseFloat(getComputedStyle(el).fontSize)||14; let n=0; while(el.scrollWidth>el.clientWidth+1&&fs>(min||8)&&n++<20){ fs-=0.5; el.style.fontSize=fs+'px'; } }); }
drawTeam=(function(prev){ return function(){ const r=prev.apply(this,arguments); requestAnimationFrame(()=>fitText('.tcard .tname b, .tcard .tname span:not(.lvb)',8)); return r; }; })(drawTeam);

// ---------- balance: Monster Kingdom numbers are the ability's level-10 values; level 1 stays at our early-game strength ----------
(function(){ const L10=(a,t)=>[a,+((t-a)/9).toFixed(3)];
  const R={ splash:{dmg:[25,193],mp:[15,114]}, feedback:{dmg:[13,174],burnmp:[12,109],mp:[12,137]}, moltencore:{dmg:[32,299],mp:[24,147]},
    leech:{dmg:[16,126],mp:[14,99]}, wave:{dmg:[16,123],mp:[18,97]}, purge:{healFlat:[12,96],mp:[12,48]}, camelback:{v:[3,51]},
    arclightning:{dmg:[20,117],mp:[18,92]}, poison:{tick:[7,83],mp:[16,80]}, manashards:{steal:[10,90],mp:[12,30]},
    feed:{mp:[14,118]}, flame:{mp:[15,82]}, blizzard:{mp:[18,78]}, perseverance:{mp:[12,79]}, regrowth:{mp:[14,82]}, hydrate:{mp:[14,132]},
    berserk:{mp:[16,85]}, nshield:{mp:[14,103]}, emberspit:{mp:[12,92]}, trample:{mp:[12,50]} };
  Object.entries(R).forEach(([id,f])=>{ if(!SK[id]) return; Object.entries(f).forEach(([k,[a,t]])=>{ SK[id][k]=L10(a,t); }); DEFAULT_SK[id]=JSON.parse(JSON.stringify(SK[id])); }); })();

// ---------- four more zones (levels 24–30) ----------
ZONES.push(
  {id:'lagoon', n:'Frost Lagoon', fam:'shell', lv:24, sizes:[3,3,3,3], c:'#8fd8ff'},
  {id:'stormplains', n:'Storm Plains', fam:'volt', lv:26, sizes:[3,3,3,3], c:'#9b8cff'},
  {id:'bog', n:'Shadow Bog', fam:'bug', lv:27, sizes:[3,3,3,3], c:'#5e8a4a'},
  {id:'crags', n:'Crimson Crags', fam:'hound', lv:28, sizes:[3,3,3,3], c:'#d2503a'});
Object.assign(ZTASKS,{
  lagoon:[['act','Skate across the frozen lagoon',24,0,150,210,2,3],['fight','Battle a wild ice turtle',24,0,180,240,3,3],['act','Break through the ice for fish',25,{mp:240},180,240,2,3],['fight','Face the glacier shell leader',25,0,210,280,3,2],['boss','Frost Lagoon Boss',27,0,480,600,5,1]],
  stormplains:[['act','Catch lightning in a jar',26,0,170,230,2,3],['fight','Battle a wild storm cat',26,0,200,270,3,3],['act','Herd the thunder clouds',26,{hp:420},200,270,2,3],['fight','Face the storm pride leader',27,0,240,310,3,2],['boss','Storm Plains Boss',28,0,540,660,5,1]],
  bog:[['act','Wade through the glowing bog',27,0,190,250,2,3],['fight','Battle a wild bog beetle',27,0,220,290,3,3],['act','Gather moonlit spores',27,{mp:280},220,290,2,3],['fight','Face the swarm queen',28,0,260,330,3,2],['boss','Shadow Bog Boss',29,0,600,720,5,1]],
  crags:[['act','Climb the red cliffs',28,0,210,270,2,3],['fight','Battle a wild crag hound',28,0,240,310,3,3],['act','Guard the cliffside dens',29,{hp:480},240,310,2,3],['fight','Face the crimson pack alpha',29,0,280,360,3,2],['boss','Crimson Crags Boss',30,0,700,850,5,1]]
});
Object.assign(ZSCENE,{
  lagoon:{sky:['#a9dcff','#eef8ff'],orb:'#ffffff',ox:72,oy:24,hills:['#dff2ff','#b6dcf2'],x:'ice',sea:'#7cc3e8'},
  stormplains:{sky:['#3b3566','#8a7fc4'],orb:'#e9e4ff',ox:24,oy:22,hills:['#6a7a5a','#4a5a40'],x:'storm'},
  bog:{sky:['#20302a','#5f7a5a'],orb:'#d8ffd0',ox:70,oy:24,hills:['#3e5a36','#2a3e26'],x:'swamp'},
  crags:{sky:['#ff9a6a','#ffd9b0'],orb:'#fff0d0',ox:28,oy:24,hills:['#b4483a','#8a3226'],x:'crags'}
});
Object.assign(ZCOL,{lagoon:['#e6f6ff','#c4e6fa'],stormplains:['#e6e2ff','#c9c0f4'],bog:['#d6e8cc','#aecb9e'],crags:['#ffd8cc','#f2ac98']});
Object.assign(TRACKS,{z_lagoon:TRACKS.z_beach, z_stormplains:TRACKS.z_desert, z_bog:TRACKS.z_hollow, z_crags:TRACKS.z_volcano});
zoneScene=(function(prev){ const X={
    ice:z=>`<rect x="0" y="66" width="200" height="12" fill="${z.sea}"/><path d="M30 70 l10 -14 l12 4 l8 10z M120 70 l14 -20 l10 6 l12 14z" fill="#f4fbff" stroke="#9fcbe6" stroke-width="1"/>`,
    storm:()=>`<g fill="#5a5296"><ellipse cx="50" cy="30" rx="24" ry="9"/><ellipse cx="140" cy="22" rx="30" ry="10"/></g><path d="M140 30 l-8 16 h7 l-5 14 l14 -20 h-7 l5 -10z" fill="#ffe066"/>`,
    swamp:()=>`<g stroke="#2a3e26" stroke-width="2" fill="none"><path d="M40 92 q2 -14 -2 -24 M46 92 q0 -12 4 -20 M150 94 q-2 -14 2 -26"/></g><g fill="#c8ff9a" opacity=".8"><circle cx="70" cy="60" r="1.4"/><circle cx="110" cy="52" r="1.2"/><circle cx="160" cy="62" r="1.5"/></g>`,
    crags:()=>`<path d="M10 80 l18 -34 l14 10 l16 -22 l20 46z M120 80 l22 -40 l12 8 l20 -16 l16 48z" fill="#9a3a2c"/>`};
  return function(id){ const z=ZSCENE[id]; if(!z||!X[z.x]) return prev(id); const g='zg'+id, ex=X[z.x](z), behind=z.x!=='swamp';
    return `<svg class="zscene" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${z.sky[0]}"/><stop offset="1" stop-color="${z.sky[1]}"/></linearGradient></defs>
    <rect width="200" height="100" fill="url(#${g})"/><circle cx="${z.ox*2}" cy="${z.oy}" r="13" fill="${z.orb}" opacity=".95"/><circle cx="${z.ox*2}" cy="${z.oy}" r="22" fill="${z.orb}" opacity=".25"/>
    ${behind?ex:''}<path d="M0 74 Q50 62 100 72 T200 68 V100 H0z" fill="${z.hills[0]}"/><path d="M0 84 Q60 76 120 84 T200 82 V100 H0z" fill="${z.hills[1]}"/>${behind?'':ex}</svg>`; }; })(zoneScene);
QUESTS.push({id:'q11', n:'Clear Crimson Crags', r:30, ok:s=>(s.zones.crags||0)>=4});
// Bubble Shield cost per the wiki (14, 23, 32 … 86 mana)
SK.bubble.mp=[14,9]; DEFAULT_SK.bubble=JSON.parse(JSON.stringify(SK.bubble));

// ---------- music: Arena gets its own fast battle theme; zone missions keep the zone's song ----------
TRACKS.arena={bpm:176,type:'square',ld:.9,lv:.36,
  lead:[64,65,66,67, 68,69,70,71, 72,_,71,_, 72,_,74,_,
        76,_,74,_, 72,_,71,_, 72,_,_,74, 76,_,_,_,
        79,_,77,_, 76,_,74,_, 72,_,74,_, 71,_,_,_,
        76,_,74,_, 72,_,71,_, 69,_,71,72, 74,_,_,_],
  bass:[40,52,40,52, 40,52,40,52, 36,48,36,48, 36,48,36,48, 38,50,38,50, 38,50,38,50, 35,47,35,47, 35,47,39,47], perc:'rock'};
playMusic=(function(prev){ return function(n){ if(n==='battle'&&B){ n=(B.mode==='campaign'&&B.meta&&B.meta.zi!=null)?'z_'+ZONES[B.meta.zi].id:'arena'; } return prev(n); }; })(playMusic);
// start the music as early as the phone allows (iPhone needs the first touch; anything else plays right away)
setTimeout(()=>{ try{ audioInit(); }catch(_){} },400);
// ===== ART v4: four zone-exclusive families (penguin, ram, frog, lizard) in the v3 style =====
function penguinNew(c1,c2,c3,st,id){
  const G=id+'a'; let d=`<defs>${grad(G,c1)}</defs>`, g='';
  g+=`<ellipse cx="44" cy="91" rx="8" ry="2.6" fill="#f2a33a" ${s3}/><ellipse cx="58" cy="91" rx="8" ry="2.6" fill="#f2a33a" ${s3}/>`;
  g+=`<path d="M50 30 Q30 32 30 62 Q30 88 50 89 Q70 88 70 62 Q70 32 50 30Z" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M50 44 Q38 48 39 66 Q40 84 51 85 Q63 84 63 66 Q63 48 50 44Z" fill="${c3}"/>`;
  g+=`<path d="M31 52 Q20 62 24 76 Q30 70 33 60Z" fill="${shade(c1,-18)}" ${s3}/><path d="M69 52 Q80 62 76 76 Q70 70 67 60Z" fill="${shade(c1,-18)}" ${s3}/>`;
  if(st>=1) g+=`<path d="M42 31 l3 -9 l3 7 l3 -10 l3 9 l3 -6 l1 9" fill="${c2}" ${s3} stroke-width="1.5"/>`;
  if(st>=2) g+=`<path d="M30 50 l-7 -6 l9 0z M70 50 l7 -6 l-9 0z" fill="${c2}" ${s3} stroke-width="1.5"/>`;
  g+=`<path d="M58 42 L72 45 L58 49Z" fill="#f2a33a" ${s3}/>`;
  g+=eye3(56,38,st===0?4.4:3.9,'#4fb3ff',st,-4);
  return d+g;
}
function ramNew(c1,c2,c3,st,id){
  const G=id+'a', H=id+'b'; const dk=shade(c1,-30); let d=`<defs>${grad(G,c1)}${grad(H,c3)}</defs>`, g='';
  g+=leg3(34,66,32,78,33,90,5,dk)+leg3(60,66,61,78,60,90,5,dk);
  g+=q3body(G,c3,22,66,50,72);
  for(let k=0;k<6;k++){ const x=26+k*7; g+=`<circle cx="${x}" cy="${51+(k%2)*2}" r="${5+st*.6}" fill="url(#${H})" ${s3} stroke-width="1.4"/>`; }
  g+=`<path d="M20 58 q-6 -2 -7 -8 q5 1 8 4" fill="${c3}" ${s3} stroke-width="1.4"/>`;
  g+=leg3(30,66,27,78,29,91,5.5,`url(#${G})`)+leg3(57,66,58,78,57,91,5.5,`url(#${G})`);
  const hx=74, hy=st===0?46:43;
  g+=`<path d="M60 60 Q64 ${hy+6} ${hx-6} ${hy+4} L${hx+2} ${hy+12} Q68 62 66 68Z" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M${hx-9} ${hy+2} Q${hx-8} ${hy-9} ${hx+2} ${hy-9} Q${hx+12} ${hy-8} ${hx+16} ${hy+3} Q${hx+16} ${hy+11} ${hx+6} ${hy+12} Q${hx-6} ${hy+12} ${hx-9} ${hy+2}Z" fill="url(#${G})" ${s3}/>`;
  const R=5+st*2.2; g+=`<path d="M${hx-4} ${hy-7} q${-R} ${-R*.9} ${-R*1.5} ${R*.3} q${R*.2} ${R*1.4} ${R*1.3} ${R*.9}" fill="none" stroke="${OL3}" stroke-width="${4.8+st}" stroke-linecap="round"/><path d="M${hx-4} ${hy-7} q${-R} ${-R*.9} ${-R*1.5} ${R*.3} q${R*.2} ${R*1.4} ${R*1.3} ${R*.9}" fill="none" stroke="${c2}" stroke-width="${2.8+st}" stroke-linecap="round"/>`;
  if(st>=1) g+=`<path d="M${hx-14} ${hy-12} l-4 6 h3 l-3 6" fill="none" stroke="#ffe066" stroke-width="1.8" stroke-linejoin="round"/>`;
  g+=`<ellipse cx="${hx+14}" cy="${hy+6}" rx="1.5" ry="1.1" fill="${OL3}"/><path d="M${hx+8} ${hy+9} q3 1.4 6 -.4" fill="none" stroke="${OL3}" stroke-width="1.2"/>`;
  g+=eye3(hx+5,hy-1,st===0?4.4:3.9,'#f5c542',st,-6);
  return d+g;
}
function frogNew(c1,c2,c3,st,id){
  const G=id+'a'; let d=`<defs>${grad(G,c1)}</defs>`, g='';
  g+=`<path d="M24 86 Q14 84 16 74 Q22 70 30 76Z" fill="${shade(c1,-20)}" ${s3}/><path d="M76 86 Q86 84 84 74 Q78 70 70 76Z" fill="${shade(c1,-20)}" ${s3}/>`;
  g+=`<path d="M22 78 Q20 52 50 50 Q80 52 78 78 Q76 90 50 90 Q24 90 22 78Z" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M32 80 Q50 92 68 80 Q60 72 50 72 Q40 72 32 80Z" fill="${c3}" opacity=".95"/>`;
  if(st>=1) [[34,60],[62,58],[48,57],[70,68]].forEach(([x,y])=>{ g+=`<circle cx="${x}" cy="${y}" r="2.6" fill="${c2}" opacity=".85"/>`; });
  if(st>=2) g+=`<path d="M38 52 l-4 -9 l7 5 l1 -10 l5 9 l3 -8 l2 10" fill="${c2}" ${s3} stroke-width="1.4"/>`;
  g+=`<path d="M36 88 q-3 2 -8 2 M64 88 q3 2 8 2" stroke="${OL3}" stroke-width="2.2" stroke-linecap="round"/>`;
  g+=`<circle cx="38" cy="50" r="9" fill="url(#${G})" ${s3}/><circle cx="62" cy="50" r="9" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M36 70 Q50 78 66 69" fill="none" stroke="${OL3}" stroke-width="1.8" stroke-linecap="round"/>`;
  g+=eye3(38,50,5.2,'#ffd23a',st,-4)+eye3(62,50,5.2,'#ffd23a',st,4);
  return d+g;
}
function lizardNew(c1,c2,c3,st,id){
  const G=id+'a'; const dk=shade(c1,-28); let d=`<defs>${grad(G,c1)}</defs>`, g='';
  g+=tail3(`M24 74 Q8 76 6 64 Q5 56 12 54`,5.5,c1);
  g+=leg3(30,76,27,84,28,91,4.6,dk)+leg3(58,76,60,84,60,91,4.6,dk);
  g+=`<path d="M22 76 Q22 62 40 61 Q60 60 68 66 Q70 76 60 80 Q40 84 22 76Z" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M28 78 Q44 84 60 78 Q46 74 28 78Z" fill="${c3}" opacity=".9"/>`;
  const n=3+st*2; for(let k=0;k<n;k++){ const x=26+k*(38/n); g+=`<path d="M${x} ${63-k%2} l3 ${-5-st*1.5} l3 ${5+st*1.5}z" fill="${c2}" ${s3} stroke-width="1.3"/>`; }
  g+=leg3(34,77,31,84,33,91,5,`url(#${G})`,1)+leg3(62,76,64,84,64,91,5,`url(#${G})`,1);
  const hx=76, hy=st===0?62:60;
  g+=`<path d="M64 66 Q68 ${hy-8} ${hx} ${hy-7} Q${hx+12} ${hy-6} ${hx+18} ${hy+1} Q${hx+16} ${hy+7} ${hx+4} ${hy+8} Q68 ${hy+10} 64 72Z" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M${hx+3} ${hy+4} Q${hx+10} ${hy+5} ${hx+17} ${hy+2}" fill="none" stroke="${OL3}" stroke-width="1.3"/><ellipse cx="${hx+15}" cy="${hy-2}" rx="1.3" ry="1" fill="${OL3}"/>`;
  if(st>=1) g+=`<path d="M${hx-2} ${hy-6} l-3 -7 l6 4z" fill="${c2}" ${s3} stroke-width="1.3"/>`;
  g+=eye3(hx+4,hy-3,st===0?4:3.6,'#ff9a2a',st,-4);
  return d+g;
}

// zone-exclusive families and their monsters
Object.assign(FAM,{
  pengu:{n:'Penguin', el:'water', shape:'penguin', base:{hp:78,atk:15,mp:47,spd:9}},
  ram:{n:'Ram', el:'bolt', shape:'ram', base:{hp:80,atk:16,mp:43,spd:12}},
  frog:{n:'Frog', el:'nature', shape:'frog', base:{hp:76,atk:15,mp:48,spd:13}},
  lizard:{n:'Lizard', el:'fire', shape:'lizard', base:{hp:75,atk:17,mp:44,spd:14}}});
[['frostbill','Frostbill','pengu',['#4a6fa5','#bfe8ff','#f4fbff'],['blizzard','hydrate','bubble','camelback']],
 ['glacirk','Glacirk','pengu',['#2f3e66','#7fd6ff','#eef8ff'],['wave','mshield','manashards','thickskin']],
 ['slushy','Slushy','pengu',['#6fa8d8','#e8f6ff','#ffffff'],['splash','absorb','purge','sweaty']],
 ['tundrake','Tundrake','pengu',['#3b4a5e','#9fd8f6','#f0f6fb'],['blizzard','wave','hydrate','grounded']],
 ['zapram','Zapram','ram',['#e8e0c8','#f2c400','#fffbe8'],['bolt','charge','lshield','pounce']],
 ['thunderhorn','Thunderhorn','ram',['#8f86b8','#ffd84d','#f3f0ff'],['arclightning','staticd','spark','thickskin']],
 ['voltwool','Voltwool','ram',['#fff3c4','#6b5ab0','#ffffff'],['shock','cripple','nshield','sweaty']],
 ['stormbleat','Stormbleat','ram',['#5d6578','#9be3ff','#eef3f7'],['stormcloud','bolt','charge','grounded']],
 ['bogloon','Bogloon','frog',['#5e8a4a','#c8ff9a','#e9f5df'],['acidbite','poison','leech','roots']],
 ['croakshade','Croakshade','frog',['#3a4a3e','#9b6bd6','#e6efe4'],['feedback','emeraldshift','feed','thickskin']],
 ['mirefang','Mirefang','frog',['#7a8a3a','#e05a3a','#f3f6df'],['acidbite','toxicfumes','naturespower','pounce']],
 ['lilyhop','Lilyhop','frog',['#6fcf8a','#ff8ac0','#f2fff6'],['regrowth','leech','nshield','sweaty']],
 ['cindrel','Cindrel','lizard',['#d2503a','#ffcf4a','#ffe8dc'],['emberspit','burn','flicker','pounce']],
 ['scarscale','Scarscale','lizard',['#8a3226','#ff8a2a','#f6dcd4'],['moltencore','blast','fshield','thickskin']],
 ['pyrotail','Pyrotail','lizard',['#ff8a4a','#5a1a2a','#fff1dc'],['flame','berserk','firefocus','double']],
 ['ashcrawl','Ashcrawl','lizard',['#5a5560','#e3262d','#ecebf2'],['firewall','emberspit','furyfist','grounded']]
].forEach(([id,n,fam,col,sk])=>{ const sp={id,n,fam,col,tw:{},sk:sk.filter(k=>SK[k])}; SP.push(sp); SPI[id]=sp; });
Object.assign(ZONES.find(z=>z.id==='lagoon'),{fam:'pengu'}); Object.assign(ZONES.find(z=>z.id==='stormplains'),{fam:'ram'});
Object.assign(ZONES.find(z=>z.id==='bog'),{fam:'frog'}); Object.assign(ZONES.find(z=>z.id==='crags'),{fam:'lizard'});
Object.assign(ATK_MOUTH,{penguin:[1.3,1.9,.9],ram:[1.6,2.0,1.0],frog:[1.2,2.2,1.1],lizard:[1.6,1.9,.9]});
monSVG=(function(prev){ const F={penguin:penguinNew,ram:ramNew,frog:frogNew,lizard:lizardNew}; return function(spId,lvl,cls){ const sp=SPI[spId]; const shape=sp&&FAM[sp.fam]&&FAM[sp.fam].shape; if(!F[shape]||(typeof CUSTOM_ART!=='undefined'&&CUSTOM_ART[spId])) return prev(spId,lvl,cls);
  const st=stageOf(lvl); const c1=mute(sp.col[0],22), c2=mute(sp.col[1],12), c3=mute(sp.col[2],10); const id='m'+(GID++); const sc=[0.8,0.92,1][st];
  return `<svg class="${cls||''}" viewBox="-4 0 108 100"><g transform="translate(50 92) scale(${sc}) translate(-50 -92)">${F[shape](c1,c2,c3,st,id)}</g></svg>`; }; })(monSVG);

// ---------- no native keyboard in the rotated game: decide before the tap focuses the box ----------
['touchstart','pointerdown'].forEach(ev=>document.addEventListener(ev,e=>{ const el=e.target&&e.target.closest&&e.target.closest('input,textarea'); if(!el||!useKbd()) return; if(el.type&&/checkbox|radio|range|file|button|submit/.test(el.type)) return; el.setAttribute('inputmode','none'); },{capture:true,passive:true}));
new MutationObserver(()=>{ if(!useKbd()) return; document.querySelectorAll('input:not([inputmode="none"]):not([type=checkbox]):not([type=radio]):not([type=range]), textarea:not([inputmode="none"])').forEach(el=>el.setAttribute('inputmode','none')); }).observe(document.documentElement,{childList:true,subtree:true});
kbOpen=(function(prev){ return function(el){ const r=prev(el); setTimeout(()=>{ try{ window.scrollTo(0,0); document.documentElement.scrollTop=0; document.body.scrollTop=0; }catch(_){} },60); return r; }; })(kbOpen);
Element.prototype._siv=Element.prototype.scrollIntoView; Element.prototype.scrollIntoView=function(o){ if(useKbd()&&this.closest&&this.closest('input,textarea,.sheet')) return; return this._siv(o); };

// ---------- move your game between Safari and the home-screen app: a transfer code ----------
function myCode(){ const u=window.MR_UID||localStorage.getItem('mr-uid')||'', k=window.MR_KEY||localStorage.getItem('mr-key')||''; return k?u+'.'+k:u; }
function openRestore(){
  const sh=sheet(`<div class="rst"><h2>Restore your game</h2><p>Enter the transfer code from Menu on your other device or browser.</p><div class="xrow"><input id="rcode" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Transfer code"><button class="btn sm" id="rpaste">Paste</button></div><p class="nm-err" id="rerr"></p><button class="btn" id="rgo">Restore</button></div>`);
  sh.body.querySelector('#rpaste').onclick=async()=>{ try{ const t=await navigator.clipboard.readText(); sh.body.querySelector('#rcode').value=(t||'').trim(); }catch(_){ err('Allow paste, or type the code.'); } };
  const err=t=>{ sh.body.querySelector('#rerr').textContent=t; };
  sh.body.querySelector('#rgo').onclick=async()=>{ const raw=sh.body.querySelector('#rcode').value.trim().replace(/\s+/g,''); if(!/^u[a-z0-9]{8,}(\.k[a-z0-9]{16,64})?$/i.test(raw)) return err("That doesn't look like a transfer code."); const [code,ckey]=raw.split('.');
    err('Checking…'); try{ const db=window.claude&&await window.claude.use('db'); const v=db&&await withTimeout(db.collection('data/users/'+code).doc('save').get(),10000); const save=parseDoc(v);
      if(!save||!save.name) return err('No game found for that code.');
      localStorage.setItem('mr-uid',code); if(ckey) localStorage.setItem('mr-key',ckey); localStorage.setItem(LS_KEY,JSON.stringify(save)); location.reload(); }catch(_){ err("Couldn't reach the server. Try again."); } }; }
PANELS.menu=(function(prev){ return function(){ const c=myCode(); return prev()+`<div class="xfer"><b>Transfer code</b><span>Use it to move your game to another phone or to the home-screen app.</span><div class="xrow"><code id="xcode">${esc(c)}</code><button class="btn sm" id="xcopy">Copy</button></div><button class="btn ghost sm" id="xrest">Restore a game</button></div><div class="diag">${diagLine()}</div>`; }; })(PANELS.menu);
function diagLine(){ const l=window.__lay||{}; return `v292 · ${l.SA?'app':'web'} · ${l.iw}×${l.ih} · scr ${l.sw}×${l.sh} · in ${l.t}/${l.b} · pad ${l.pl||0}/${l.pr||0} · ${l.L}×${l.S} · ♪ ${(window.__musicLoop&&window.__musicLoop().playing)?'loop':'live'}`; }
bindView=(function(prev){ return function(v){ prev(v); v=v||document; const cp=v.querySelector('#xcopy'); if(cp) cp.onclick=()=>{ const c=myCode(); (navigator.clipboard?navigator.clipboard.writeText(c):Promise.reject()).then(()=>toast('Copied'),()=>{ const r=document.createRange(); r.selectNodeContents(v.querySelector('#xcode')); const s=getSelection(); s.removeAllRanges(); s.addRange(r); toast('Code selected'); }); };
  const rs=v.querySelector('#xrest'); if(rs) rs.onclick=openRestore; }; })(bindView);
new MutationObserver(()=>{ const onb=[...document.querySelectorAll('.onb')].find(x=>!x.querySelector('#onbrst')); const go=onb&&onb.querySelector('#go'); if(!go) return; const b=document.createElement('button'); b.id='onbrst'; b.className='btn ghost sm'; b.textContent='Already playing? Restore your game'; b.onclick=e=>{ e.preventDefault(); e.stopPropagation(); openRestore(); }; go.insertAdjacentElement('afterend',b); }).observe(document.documentElement,{childList:true,subtree:true});

// rotated play: tapping a text box never focuses it (no iPhone AutoFill bar), our keyboard types into it directly
document.addEventListener('touchstart',e=>{ if(!useKbd()) return; const el=e.target&&e.target.closest&&e.target.closest('input,textarea'); if(!el) return; if(el.type&&/checkbox|radio|range|file|button|submit/.test(el.type)) return;
  e.preventDefault(); if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); if(KBIN!==el){ if(KB) kbClose(); kbOpen(el); } },{capture:true,passive:false});
kbOpen=(function(prev){ return function(el){ document.querySelectorAll('.kbf').forEach(x=>x.classList.remove('kbf')); const r=prev.apply(this,arguments); if(el){ el.classList.add('kbf'); try{ const n=el.value.length; el.setSelectionRange(n,n); }catch(_){} if(document.activeElement===el) el.blur(); } return r; }; })(kbOpen);
kbClose=(function(prev){ return function(){ document.querySelectorAll('.kbf').forEach(x=>x.classList.remove('kbf')); return prev.apply(this,arguments); }; })(kbClose);

// show unexpected errors on screen so a screenshot tells us what broke on a real phone
(function(){ let last=0; const show=m=>{ const n=Date.now(); if(n-last<3000) return; last=n; try{ toast('⚠ '+String(m).slice(0,90)); }catch(_){} };
  addEventListener('error',e=>show(e.message||'error')); addEventListener('unhandledrejection',e=>show((e.reason&&(e.reason.message||e.reason))||'error')); })();

// only one partner screen at a time, even when the cloud save arrives mid-intro
onboarding=(function(prev){ let busy=false; return function(){ if(S&&S.name) return; if(busy||document.querySelector('.onb')) return; busy=true;
  const t=setInterval(()=>{ if(S&&S.name){ busy=false; clearInterval(t); } },500);
  try{ return prev.apply(this,arguments); }catch(e){ busy=false; clearInterval(t); throw e; } }; })(onboarding);

// ---------- suspended accounts ----------
function showBanned(){ if(document.querySelector('.banned')) return; try{ kbClose(); }catch(_){}
  const w=document.createElement('div'); w.className='banned'; w.innerHTML='<div><b>Account suspended</b><p>This account can no longer play Monster Realm.</p></div>';
  document.body.appendChild(w); }
addEventListener('mr-banned',showBanned);

// ---------- admin: players ----------
function agoTxt(t){ if(!t) return 'never'; const s=(Date.now()-t)/1000; return s<90?'just now':s<3600?Math.round(s/60)+'m ago':s<86400?Math.round(s/3600)+'h ago':Math.round(s/86400)+'d ago'; }
function openPlayers(){
  const PER=4; let all=[], pg=0, me='', q='';
  const sh=sheet(`<div class="adm"><div class="adm-top"><h2>Players</h2><input id="aq" placeholder="Search name or code" autocomplete="off"><span class="adm-n" id="an"></span></div><div class="adm-list" id="al"><p class="adm-msg">Loading…</p></div><div class="adm-pg"><button class="btn ghost sm" id="ap">‹</button><span id="api"></span><button class="btn ghost sm" id="anx">›</button></div></div>`);
  const $a=s=>sh.body.querySelector(s);
  const load=async()=>{ $a('#al').innerHTML='<p class="adm-msg">Loading…</p>'; let r; try{ r=await withTimeout(MR_ACCT.adm('list',{q}),15000); }catch(_){ r=null; }
    if(!r||!r.ok){ $a('#al').innerHTML=`<p class="adm-msg">${r&&r.err==='admin'?'Admins only.':"Couldn't reach the server."}</p>`; return; }
    all=r.players; me=r.me; pg=0; draw(); };
  const draw=()=>{ const n=Math.max(1,Math.ceil(all.length/PER)); pg=Math.min(pg,n-1);
    $a('#an').textContent=all.length+(all.length===1?' player':' players'); $a('#api').textContent=(pg+1)+' / '+n;
    $a('#ap').disabled=pg===0; $a('#anx').disabled=pg>=n-1;
    const rows=all.slice(pg*PER,pg*PER+PER);
    $a('#al').innerHTML=rows.length?rows.map(p=>`<div class="adm-row${p.banned?' ban':''}" data-u="${esc(p.uid)}">
      <div class="adm-who"><b>${esc(p.name||'(no name)')}${p.uid===me?' · you':''}${p.banned?' <i>Banned</i>':''}</b><span>Lv ${p.lv} · ${p.mons} monster${p.mons===1?'':'s'} · ${agoTxt(p.seen)}</span><code data-copy="${esc(p.uid)}">${esc(p.uid)}</code></div>
      ${p.uid===me?`<div class="adm-act"><button class="btn sm ghost" data-gift>Gift 🍄</button></div>`:`<div class="adm-act"><button class="btn sm ghost" data-gift>Gift 🍄</button><button class="btn sm ghost" data-op="${p.banned?'unban':'ban'}">${p.banned?'Unban':'Ban'}</button><button class="btn sm ghost" data-op="rename">Rename</button><button class="btn sm red" data-op="delete">Delete</button></div>`}</div>`).join(''):'<p class="adm-msg">No players found.</p>';
    sh.body.querySelectorAll('[data-copy]').forEach(c=>c.onclick=()=>{ (navigator.clipboard?navigator.clipboard.writeText(c.dataset.copy):Promise.reject()).then(()=>toast('Code copied'),()=>{}); });
    sh.body.querySelectorAll('[data-gift]').forEach(b=>b.onclick=()=>{ const t=b.closest('.adm-row').dataset.u, p=all.find(x=>x.uid===t);
      const g=sheet(`<div class="gift"><h2>Gift mushrooms</h2><p>To <b>${esc(p.name||t)}</b>. They get them the next time their game saves.</p><div class="gift-row">${[50,100,500,1000,5000].map(n=>`<button class="btn sm" data-n="${n}">${n} 🍄</button>`).join('')}</div><h2 style="margin-top:10px">Gift cash</h2><div class="gift-row">${[10000,100000,1000000].map(n=>`<button class="btn sm" data-n="${n}" data-k="cash">$${n.toLocaleString()}</button>`).join('')}</div></div>`);
      g.body.querySelectorAll('[data-n]').forEach(x=>x.onclick=async()=>{ x.disabled=true; let r; try{ r=await withTimeout(MR_ACCT.adm('gift',{t,n:+x.dataset.n,kind:x.dataset.k||''}),15000); }catch(_){ r=null; }
        if(!r||!r.ok){ x.disabled=false; return toast(r&&r.err==='unknown op'?'Update the server first':"Couldn't reach the server"); }
        g.close(); toast(x.dataset.k?`Sent $${(+x.dataset.n).toLocaleString()} to ${p.name||'player'}`:`Sent ${x.dataset.n} 🍄 to ${p.name||'player'}`); if(t===me) setTimeout(()=>persist(),300); }); });
    sh.body.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>{ const row=b.closest('.adm-row'), t=row.dataset.u, p=all.find(x=>x.uid===t), nm=esc(p.name||t), op=b.dataset.op;
      const go=async()=>{ b.disabled=true; let r; try{ r=await withTimeout(MR_ACCT.adm(op,{t}),15000); }catch(_){ r=null; }
        if(!r||!r.ok){ b.disabled=false; return toast(r&&r.err==='self'?"You can't do that to yourself":"Couldn't reach the server"); }
        if(op==='delete'){ all=all.filter(x=>x.uid!==t); toast('Deleted '+(p.name||'account')); }
        else if(op==='ban'||op==='unban'){ p.banned=op==='ban'; toast((op==='ban'?'Banned ':'Unbanned ')+(p.name||'account')); }
        else if(op==='rename'){ toast((p.name||'Player')+' will pick a new name'); p.name=null; }
        draw(); };
      const msg={ban:`Ban <b>${nm}</b>? They won't be able to save, battle or chat. You can unban later.`,
        unban:`Unban <b>${nm}</b>?`, rename:`Clear the name <b>${nm}</b>? They'll be asked to pick a new one.`,
        delete:`Delete <b>${nm}</b> forever? Their monsters and progress are erased and the name is freed. This can't be undone.`}[op];
      confirmBox(msg, {ban:'Ban',unban:'Unban',rename:'Clear name',delete:'Delete'}[op], go); }); };
  $a('#ap').onclick=()=>{ pg--; draw(); }; $a('#anx').onclick=()=>{ pg++; draw(); };
  let tq; $a('#aq').addEventListener('input',()=>{ clearTimeout(tq); tq=setTimeout(()=>{ q=$a('#aq').value.trim(); load(); },500); });
  load(); }

// ---------- rotate gate: upright phones must turn sideways (turn off Rotation Lock if needed) ----------
(function(){ let w=null;
  const upright=()=>matchMedia('(pointer:coarse)').matches && innerHeight>innerWidth;
  const sync=()=>{ if(upright()){ if(w) return; try{ kbClose(); }catch(_){}
      w=document.createElement('div'); w.className='rothint on';
      w.innerHTML=`<div class="rh-in"><svg viewBox="0 0 120 120" class="rh-ph"><g><rect x="38" y="14" width="44" height="92" rx="9" fill="none" stroke="#fff" stroke-width="5"/><rect x="53" y="20" width="14" height="4" rx="2" fill="#fff"/></g></svg><b>Turn your phone sideways</b><span>Not rotating? Turn off Rotation Lock in Control Center.</span></div>`;
      w.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); },true);
      document.documentElement.appendChild(w); }
    else if(w){ const x=w; w=null; x.classList.remove('on'); setTimeout(()=>x.remove(),250); } };
  addEventListener('resize',sync); addEventListener('orientationchange',()=>setTimeout(sync,150));
  if(window.visualViewport) visualViewport.addEventListener('resize',sync);
  setInterval(sync,700); sync(); })();

// ---------- ability numbers from the Monster Realm Abilities sheet (level 1 → level 10) ----------
(function(){ const P=(a,t)=>[a,+((t-a)/9).toFixed(4)];
  const SHEET={
    bolt:{dmg:P(22,143)},
    bubble:{amt:P(35,237), mp:P(14,95)},
    blizzard:{k:'dot', dot:'frost', tick:P(16,84), turns:5, dmg:null, stun:null, mp:P(18,78),
      desc:'Conjures a storm that deals {tick} damage each turn for {turns} turns. Penetrates shields.'},
    charge:{v:P(.19,1.53), el:'bolt'},
    cripple:{v:P(.16,.69), mp:P(14,59)},
    feed:{k:'hit', dmg:P(18,141), leech:1, stealHp:null, desc:'Bites your opponent, dealing {dmg} nature damage and stealing 100% of damage dealt.'},
    hydrate:{heal:null, healFlat:P(30,264), mp:P(15,132), desc:'Taps into the aquatic rejuvenation power, healing {amt} life.'},
    perseverance:{v:P(.10,.46), turns:4, desc:'Adds {v} resistance to all damage for {turns} turns.'},
    purge:{healFlat:P(60,96)},
    shock:{dmg:P(42,307), stun:null, selfStun:1, desc:'Extremely powerful attack that deals {dmg} damage, but stuns yourself for one turn.'},
    spark:{v:P(.13,.76), turns:4},
    stormcloud:{tick:P(19,94), desc:'Hangs a storm cloud over your enemy, dealing {tick} damage each turn for {turns} turns. Penetrates shields.'},
    emberspit:{dmg:P(14,86), scorch:P(.07,.41), scorchTurns:6, burn:null, btick:null, desc:"Fiery attack that deals {dmg} damage and reduces enemy's fire resistance by {scorch} for 6 turns."},
    wave:{dmg:P(20,123), soak:P(.06,.33), soakTurns:6, desc:"Deals {dmg} water damage and reduces enemy's water resistance by {soak} for 6 turns."},
    souleater:{m:P(.8,.84), mpAtk:P(.4,.42), mp:P(8,16)},
    mshield:{v:P(.13,.67), el:'water'},
    aircurrent:{el:'bolt'}, flicker:{el:'fire'}, hardened:{el:'nature'}, invuln:{el:'nature'}, roots:{el:'neutral'}, sweaty:{el:'neutral'}
  };
  Object.entries(SHEET).forEach(([id,f])=>{ if(!SK[id]) return; Object.entries(f).forEach(([k,v])=>{ if(v===null) delete SK[id][k]; else SK[id][k]=v; });
    DEFAULT_SK[id]=JSON.parse(JSON.stringify(SK[id])); });
  try{ applyMoveOverrides(MOVE_OVR); }catch(_){} })();

// one-time gift: $1,000,000 for the george admin account only
(function(){ const give=()=>{ try{ if(!ADMIN||typeof S==='undefined'||!S||S.giftCash1m||String(S.name||'').toLowerCase()!=='george') return false;
    S.cash=(S.cash|0)+1000000; S.giftCash1m=1; persist(); if(typeof renderHUD==='function') renderHUD(); else if(typeof render==='function') render(); if(typeof toast==='function') toast('+$1,000,000'); return true; }catch(_){ return false; } };
  setAdmin=(function(prev){ return function(v){ const r=prev(v); setTimeout(give,300); return r; }; })(setAdmin);
  let n=0; const iv=setInterval(()=>{ if(give()||++n>40) clearInterval(iv); },1500); })();

// ---------- eyes: one style per family, varied per species; babies stay round and cute ----------
var EYE_FAM='', EYE_SEED=0; var EYES_CLASSIC=false; try{ EYES_CLASSIC=localStorage.getItem('mr-eyes')==='classic'; }catch(_){}
monSVG=(function(prev){ return function(spId,lvl,cls){ const sp=SPI[spId]; EYE_FAM=(sp&&FAM[sp.fam]&&FAM[sp.fam].shape)||''; let h=0; String(spId).split('').forEach(c=>h=(h*31+c.charCodeAt(0))>>>0); EYE_SEED=h; try{ return prev(spId,lvl,cls); } finally{ EYE_FAM=''; } }; })(monSVG);
eye3=(function(base){
  const IRIS={cat:['#f5c542','#9be15d','#5fd0e8'], hound:['#ffb347','#ff6b4a','#e8e04a'], turtle:['#6b4a2b','#3c7a4a','#2f5d8a'],
    dragon:['#ffcf4a','#ff7a3d','#c7f05a'], bird:['#ff9f1a','#ffd23f','#e85d5d'], ram:['#c99a3a','#e0b84a','#9fc36a'],
    frog:['#ffd23a','#ff9a2a','#e8f06a'], lizard:['#ff9a2a','#ffd23a','#7fe07a'], penguin:['#1a120c']};
  const W='#fffdf6', K='#120c08';
  const hl=(x,y,r,st)=>`<circle cx="${x+r*0.32}" cy="${y-r*0.32}" r="${r*(st===0?0.22:0.15)}" fill="#fff"/>`+(st===0?`<circle cx="${x-r*0.2}" cy="${y+r*0.25}" r="${r*0.09}" fill="#fff"/>`:'');
  const brow=(x,y,r,st,ang)=>st>=1?`<path d="M${x-r*1.15} ${y-r*(1.05+ang)} Q${x} ${y-r*1.4} ${x+r*1.2} ${y-r*(0.75-ang)}" fill="none" stroke="${OL3}" stroke-width="${1.6+st*0.4}" stroke-linecap="round"/>`:'';
  const almond=(x,y,r,h)=>`<path d="M${x-r} ${y} Q${x-r*0.2} ${y-r*h} ${x+r} ${y-r*0.15} Q${x+r*0.2} ${y+r*h*0.9} ${x-r} ${y}Z" fill="${W}" ${s3} stroke-width="1.5"/>`;
  return function(x,y,r,iris,st,tilt){
    const f=({elephant:'ram',tiger:'cat',squirrel:'bird'})[EYE_FAM]||EYE_FAM; if(!f||!IRIS[f]||EYES_CLASSIC) return base(x,y,r,iris,st,tilt);
    const pal=IRIS[f]; const ir=pal[EYE_SEED%pal.length]; r=r*(0.94+((EYE_SEED>>3)%5)*0.03); tilt=tilt||0;
    const px=x+r*0.22, py=y-r*0.06; let e='', b='';
    if(st===0 && f!=='penguin'){ // baby: big round shiny eyes for every family
      e=`<circle cx="${x}" cy="${y}" r="${r*1.05}" fill="${W}" ${s3} stroke-width="1.5"/><circle cx="${x+r*0.15}" cy="${y}" r="${r*0.68}" fill="${ir}"/><circle cx="${x+r*0.18}" cy="${y}" r="${r*0.42}" fill="${K}"/>`+hl(x+r*0.15,y,r*0.9,0);
    } else if(f==='cat'||f==='lizard'||f==='dragon'){ // slit pupils
      const lid=f==='lizard'||f==='dragon';
      e=almond(x,y,r,0.95)+`<circle cx="${px}" cy="${py}" r="${r*0.58}" fill="${ir}"/><ellipse cx="${px}" cy="${py}" rx="${r*(f==='cat'?0.12:0.1)}" ry="${r*0.5}" fill="${K}"/>`+hl(px,py,r*0.7,st);
      if(lid) e+=`<path d="M${x-r*1.05} ${y-r*0.05} Q${x-r*0.1} ${y-r*0.95} ${x+r*1.05} ${y-r*0.2} L${x+r} ${y-r*0.45} Q${x-r*0.1} ${y-r*1.2} ${x-r*1.05} ${y-r*0.3}Z" fill="${OL3}" opacity=".85"/>`;
      b=brow(x,y,r,st,f==='cat'?0:0.15);
    } else if(f==='hound'){ // narrow, fierce
      e=`<path d="M${x-r} ${y+r*0.1} L${x+r*0.2} ${y-r*0.6} Q${x+r*0.9} ${y-r*0.5} ${x+r*1.05} ${y-r*0.05} Q${x+r*0.3} ${y+r*0.6} ${x-r} ${y+r*0.1}Z" fill="${W}" ${s3} stroke-width="1.5"/><circle cx="${px}" cy="${py}" r="${r*0.45}" fill="${ir}"/><circle cx="${px+r*0.05}" cy="${py}" r="${r*0.24}" fill="${K}"/>`+hl(px,py,r*0.55,st);
      b=st>=1?`<path d="M${x-r*1.2} ${y-r*1.15} L${x+r*1.15} ${y-r*0.45}" stroke="${OL3}" stroke-width="${2+st*0.5}" stroke-linecap="round"/>`:'';
    } else if(f==='turtle'){ // round and calm, heavy-lidded
      e=`<circle cx="${x}" cy="${y}" r="${r*0.9}" fill="${W}" ${s3} stroke-width="1.5"/><circle cx="${px*0.6+x*0.4}" cy="${y+r*0.05}" r="${r*0.55}" fill="${ir}"/><circle cx="${px*0.6+x*0.4}" cy="${y+r*0.05}" r="${r*0.3}" fill="${K}"/>`+hl(px*0.6+x*0.4,y,r*0.6,st)+
        `<path d="M${x-r*0.95} ${y-r*0.1} Q${x} ${y-r*1.15} ${x+r*0.95} ${y-r*0.1} Q${x} ${y-r*0.55} ${x-r*0.95} ${y-r*0.1}Z" fill="${OL3}" opacity=".8"/>`;
    } else if(f==='bird'){ // round with a bright ring
      e=`<circle cx="${x}" cy="${y}" r="${r*0.95}" fill="${ir}" ${s3} stroke-width="1.5"/><circle cx="${x+r*0.12}" cy="${y}" r="${r*0.62}" fill="${W}"/><circle cx="${x+r*0.2}" cy="${y}" r="${r*0.38}" fill="${K}"/>`+hl(x+r*0.2,y,r*0.5,st);
      b=st>=2?brow(x,y,r,st,0.2):'';
    } else if(f==='penguin'){ // small beady eyes
      e=`<circle cx="${x}" cy="${y}" r="${r*(st===0?0.62:0.5)}" fill="${K}"/><circle cx="${x+r*0.16}" cy="${y-r*0.18}" r="${r*0.17}" fill="#fff"/>`;
    } else if(f==='ram'){ // sleepy, sideways goat pupils
      e=almond(x,y,r,0.85)+`<circle cx="${px}" cy="${py}" r="${r*0.55}" fill="${ir}"/><rect x="${px-r*0.42}" y="${py-r*0.12}" width="${r*0.84}" height="${r*0.24}" rx="${r*0.12}" fill="${K}"/>`+
        `<path d="M${x-r*1.05} ${y+r*0.02} Q${x} ${y-r*1.05} ${x+r*1.05} ${y-r*0.12} Q${x} ${y-r*0.15} ${x-r*1.05} ${y+r*0.02}Z" fill="${OL3}" opacity=".85"/>`;
      b=brow(x,y,r,st,0.05);
    } else if(f==='frog'){ // big bulging eyes, sideways pupils
      e=`<circle cx="${x}" cy="${y}" r="${r*1.1}" fill="${W}" ${s3} stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="${r*0.7}" fill="${ir}"/><ellipse cx="${x}" cy="${y}" rx="${r*0.5}" ry="${r*0.22}" fill="${K}"/>`+hl(x,y,r*0.75,st);
    }
    return `<g transform="rotate(${tilt} ${x} ${y})">${e}</g>${b}`;
  };
})(eye3);

// everything (including the zone-exclusive monsters) is loaded now: redraw anything drawn early
if(typeof S!=='undefined'&&S){ try{ render(); }catch(e){ console.warn(e); } }

// ---------- view-only monster card (another player's monster): no XP, no stat buttons ----------
const MASTER_STAR=`<span class="lvb mst" title="Mastered"><svg viewBox="0 0 24 24"><path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.6l-5.2 2.8 1-5.9L3.5 9.4l5.9-.8z" fill="#fff"/></svg></span>`;
function lvBadge(lvl){ return lvl>=MAXLVL?MASTER_STAR:`<span class="lvb">${lvl}</span>`; }
function openMonRO(t, owner){
  const sp=SPI[t.sp]; if(!sp) return; const fam=FAM[sp.fam]; const base=statsOf(t.sp,t.lvl), b=t.bonus||{};
  const st={atk:base.atk+(b.atk|0), hp:base.hp+(b.hp|0), mp:base.mp+(b.mp|0)}; const slots=slotsOf(t.lvl); const skl=t.skl||{};
  const stat=(label,val)=>`<div class="pstat"><span>${label}</span><b>${val}</b></div>`;
  const sh=sheet(`<div class="prof ro"><div class="ptop"><div class="ppor" style="--c:${EL[fam.el].c}">${monSVG(t.sp,t.lvl)}</div>
      <div class="pinfo"><div class="pname">${lvBadge(t.lvl)}${esc(sp.n)}</div><span class="pstage">${STAGE_N[stageOf(t.lvl)].toLowerCase()}${owner?` · ${esc(owner)}`:''}</span>
        ${stat('Attack',st.atk)}${stat('Life',st.hp)}${stat('Mana',st.mp)}</div></div>
    <h3 class="ph">Abilities</h3>
    <div class="pabil">${sp.sk.slice(0,slots).map(id=>{ const k=SK[id]; if(!k) return ''; const L=skl[id]||1, c=skCost(id,L), pas=k.k==='passive';
      return `<div class="pab ${pas?'pas':''}">${icon(skIconKey(id),(EL[k.el]||EL.neutral).c,40)}<div class="pab-t"><b>${esc(k.n)} <span class="sl">Lv ${L}</span>${pas?' <span class="pastag">Passive</span>':''}</b><span>${skillDesc(id,L)}${c?` · ${c} mana`:''}</span></div></div>`; }).join('')}</div></div>`,{cls:'panel mkprof'});
  return sh; }
// battle info card: gold star for mastered monsters
monInfo=(function(prev){ return function(b,s,i){ const r=prev(b,s,i); const m=b.sides[s]&&b.sides[s].mons[i];
  if(m&&m.lvl>=MAXLVL) document.querySelectorAll('.minfo2 .mi-nm .lvb').forEach(x=>{ x.outerHTML=MASTER_STAR; }); return r; }; })(monInfo);

// team rule: at most 3 monsters, no duplicates, only monsters you own — enforced everywhere
var FIXTEAM_SPECIES=false;
function fixTeam(){ if(typeof S==='undefined'||!S||!Array.isArray(S.team)) return; const seen=new Set();
  const t=S.team.filter(u=>{ const m=u&&!seen.has(u)&&seen.add(u)&&monBy(u); return m&&(!FIXTEAM_SPECIES||!window.__defsReady||SPI[m.sp]); }).slice(0,3);
  if(!t.length&&S.mons&&S.mons.length) t.push(S.mons[0].uid);
  if(t.length!==S.team.length||t.some((u,i)=>u!==S.team[i])) S.team=t; }
teamMons=(function(prev){ return function(){ fixTeam(); return prev.apply(this,arguments).slice(0,3); }; })(teamMons);
persist=(function(prev){ return function(){ fixTeam(); return prev.apply(this,arguments); }; })(persist);
FIXTEAM_SPECIES=true; setTimeout(fixTeam,0); // after the rares further down are defined, or they get dropped from the team on every launch

// the game screen never scrolls: only panels/lists that really scroll may move
(function(){ const canScroll=el=>{ for(let n=el;n&&n!==document.body&&n!==document.documentElement;n=n.parentElement){ const cs=getComputedStyle(n);
      if(/(auto|scroll)/.test(cs.overflowY+cs.overflowX)&&(n.scrollHeight>n.clientHeight+1||n.scrollWidth>n.clientWidth+1)) return true; } return false; };
  // only block real drags: a finger that wiggles a few pixels during a tap must still count as a tap on iPhone
  let sx=0, sy=0, dragging=false;
  document.addEventListener('touchstart',e=>{ const t=e.touches[0]; if(t){ sx=t.clientX; sy=t.clientY; } dragging=false; },{capture:true,passive:true});
  document.addEventListener('touchmove',e=>{ if(e.touches.length>1) return; const t=e.touches[0];
    if(!dragging){ if(Math.hypot(t.clientX-sx,t.clientY-sy)<12) return; dragging=true; }
    if(!canScroll(e.target)) e.preventDefault(); },{passive:false});
  const pin=()=>{ if(window.scrollX||window.scrollY) window.scrollTo(0,0); if(document.documentElement.scrollTop) document.documentElement.scrollTop=0; };
  addEventListener('scroll',pin,{passive:true}); if(window.visualViewport) visualViewport.addEventListener('scroll',pin); })();

// Back and close (X) buttons react the moment your finger lifts (don't wait on iOS's delayed click)
(function(){ let down=null, fired=0;
  addEventListener('pointerdown',e=>{ const b=e.target.closest&&e.target.closest('.backb,.sheet-x'); down=b?{b,x:e.clientX,y:e.clientY}:null; },true);
  addEventListener('pointerup',e=>{ if(!down) return; const d=down; down=null; const b=e.target.closest&&e.target.closest('.backb,.sheet-x');
    if(b!==d.b||Math.hypot(e.clientX-d.x,e.clientY-d.y)>24) return; fired=Date.now(); b.click(); },true);
  addEventListener('click',e=>{ if(!e.isTrusted||Date.now()-fired>700) return; fired=0; e.stopPropagation(); e.preventDefault(); },true); })();

// Fire Wall: fixed fire damage back at anyone who hits you for 3 turns
SK.firewall.desc='Deals {dmg} fire damage, then surrounds you with a wall of fire for 3 turns. Anyone who hits you takes {wall} fire damage.';
DEFAULT_SK.firewall=JSON.parse(JSON.stringify(SK.firewall)); try{ applyMoveOverrides(MOVE_OVR); }catch(_){}

// tap the energy bar when it isn't full → offer a recharge for 10 mushrooms
document.addEventListener('click',e=>{ const bar=e.target.closest&&e.target.closest('.hbar.energy'); if(!bar||(typeof B!=='undefined'&&B&&B.b&&!B.b.over)) return;
  e.stopPropagation(); e.preventDefault(); tickEnergy(); if(S.energy>=S.maxEnergy) return;
  confirmBox(`<span style="white-space:nowrap">Recharge energy for <b>10</b> <span style="display:inline-block;width:1.15em;height:1.15em;vertical-align:-.2em">${mushroomSVG('#b04fd6').replace('<svg','<svg width="100%" height="100%"')}</span>?</span>`,'Recharge',()=>{
    tickEnergy(); if(S.energy>=S.maxEnergy) return toast('Energy is already full');
    if((S.mush|0)<10){ toast('You need 10 🍄'); SHOPTAB='mush'; return openShop(); }
    S.mush-=10; S.energy=S.maxEnergy; S.energyAt=Date.now(); persist(); try{ renderHUD(); }catch(_){} try{ render(); }catch(_){} sfx&&sfx('coin'); toast('Energy recharged!'); }); },true);

// ---------- battery: music plays from pre-rendered loops instead of live synthesis ----------
(function(){
  const liveSchedule=schedule; const cache=new Map(); let src=null, srcName=null, gain=null, pending=null;
  const gcd=(a,b)=>b?gcd(b,a%b):a, lcm=(a,b)=>a/gcd(a,b)*b;
  async function render(name){
    if(cache.has(name)) return cache.get(name);
    const T=TRACKS[name]; if(!T||!SND.ctx) return null;
    const st=60/T.bpm/2; const L=Math.min(256,[T.lead.length,T.bass.length,32].reduce(lcm,1)); const dur=L*st, tail=2.0, sr=22050;
    const off=new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,Math.ceil((dur+tail)*sr),sr);
    const fake={ get currentTime(){ return (L-0.5)*st-0.25; }, createOscillator:()=>off.createOscillator(), createGain:()=>off.createGain(),
      createBufferSource:()=>off.createBufferSource(), createBiquadFilter:()=>off.createBiquadFilter(), destination:off.destination };
    const keep={ctx:SND.ctx,mus:SND.mus,track:SND.track,step:SND.step,next:SND.next};
    try{ SND.ctx=fake; SND.mus=off.destination; SND.track=name; SND.step=0; SND.next=0; liveSchedule(); }
    finally{ Object.assign(SND,keep); }
    const full=await off.startRendering(); const n=Math.round(dur*sr), out=SND.ctx.createBuffer(1,n,sr), a=full.getChannelData(0), o=out.getChannelData(0);
    o.set(a.subarray(0,n)); for(let i=n;i<a.length;i++) o[i-n]+=a[i];   // wrap the tail onto the start: seamless loop
    if(cache.size>=4) cache.delete(cache.keys().next().value); cache.set(name,out); return out; }
  function stop(fade){ if(!src) return; const s=src, g=gain; src=null; srcName=null; try{ const t=SND.ctx.currentTime; g.gain.setTargetAtTime(0,t,fade||.08); s.stop(t+(fade||.08)*5); }catch(_){ try{s.stop();}catch(_){} } }
  async function loop(name){
    if(srcName===name&&src) return; pending=name;
    const buf=await render(name); if(!buf||pending!==name||SND.track!==name) return;
    stop(.15); const c=SND.ctx; gain=c.createGain(); gain.gain.setValueAtTime(0,c.currentTime); gain.gain.linearRampToValueAtTime(1,c.currentTime+.25); gain.connect(SND.mus);
    src=c.createBufferSource(); src.buffer=buf; src.loop=true; src.connect(gain); src.start(); srcName=name; }
  schedule=function(){ clearInterval(SND.timer); SND.timer=null; if(!SND.ctx) return; if(!TRACKS[SND.track]){ stop(); return; } loop(SND.track).catch(e=>{ console.warn('music loop failed',e&&e.message); window.__mErr=String(e&&e.message); SND.timer=setInterval(liveSchedule,40); }); };
  schedule.alwaysOn=true; liveSchedule.alwaysOn=true;
  window.__musicLoop=()=>({playing:srcName, cached:[...cache.keys()]});
  window.__musicStats=()=>[...cache.entries()].map(([n,b])=>{ const d=b.getChannelData(0); let s=0,pk=0; for(let i=0;i<d.length;i+=7){ s+=d[i]*d[i]; pk=Math.max(pk,Math.abs(d[i])); }
    const k=Math.min(200,d.length-1); let jump=0; for(let i=1;i<k;i++) jump=Math.max(jump,Math.abs(d[i]-d[i-1])); return {n,sec:+b.duration.toFixed(1),rms:+Math.sqrt(s/(d.length/7)).toFixed(3),peak:+pk.toFixed(2),seam:+Math.abs(d[0]-d[d.length-1]).toFixed(3),maxStep:+jump.toFixed(3)}; });
})();

// ---------- Practice: same "Choose Your Champions" screen as Live Arena ----------
openChampions=(function(prev){ return function(opts){ const practice=!!(opts&&opts.practice); prev();
  const sh=PANEL_LAST_FULL(); if(!sh||!practice) return;
  const fix=()=>{ const t=sh.body.querySelector('.cc-title'); if(t&&t.textContent!=='Practice Match') t.textContent='Practice Match';
    const r=sh.body.querySelector('#ccr'); if(r&&!r._prac){ r._prac=1; r.onclick=e=>{ e.stopPropagation(); if(!S.team.length) return alertBox('Add a champion first!'); if(!spend(1)) return; persist(); sh.close(); startBattle({mode:'practice', foe:practiceTeam()}); }; } };
  fix(); new MutationObserver(fix).observe(sh.body,{childList:true,subtree:true}); }; })(openChampions);
function PANEL_LAST_FULL(){ const w=[...document.querySelectorAll('.sheet-wrap')].pop(); if(!w) return null; return {body:w, close:()=>{ const x=w.querySelector('#bhb'); w.classList.remove('open'); setTimeout(()=>w.remove(),300); }}; }

// ---------- Practice opponents: your team's average level, matched training, picked to counter you ----------
function practiceTeam(){
  const mine=mySnap(); const n=Math.max(1,mine.length);
  const lvl=Math.max(1,Math.round(mine.reduce((t,m)=>t+m.lvl,0)/n));
  const avg=k=>Math.round(mine.reduce((t,m)=>t+((m.bonus&&m.bonus[k])|0),0)/n);
  const bonus={atk:avg('atk'),hp:avg('hp'),mp:avg('mp')};
  // items aren't averaged: foe #k carries exactly what your monster #k carries
  const gear=k=>{ const m=mine[k]||{}, b=m.bonus||{}; return {g:{rmp:b.rmp|0,rhp:b.rhp|0,dflat:b.dflat|0,tflat:b.tflat|0,belem:b.belem|0,bphys:b.bphys|0,dnat:b.dnat|0,dwat:b.dwat|0,dfir:b.dfir|0}, items:(m.items||[]).slice()}; };
  const abil=Math.max(1,Math.round(mine.reduce((t,m)=>{ const v=Object.values(m.skl||{}); return t+(v.length?v.reduce((a,b)=>a+b,0)/v.length:1); },0)/n));
  const myEls=mine.map(m=>FAM[SPI[m.sp].fam].el);
  const pool=SP.filter(s=>FAM[s.fam]&&FAM[s.fam].shape!=='dummy'&&s.fam!=='dummy'&&!s.boss&&!s.rare&&!s.legacy).map(s=>{ const el=FAM[s.fam].el;
    const sc=myEls.reduce((t,me)=>t+elemMult(el,me)-0.5*elemMult(me,el),0)+Math.random()*0.6; return {s,sc}; }).sort((a,b)=>b.sc-a.sc);
  const pickd=[], fams=new Set();
  for(const {s} of pool){ if(pickd.length>=3) break; if(fams.has(s.fam)) continue; fams.add(s.fam); pickd.push(s); }
  const names=['Nour','Sami','Maya','Karim','Lina','Rami','Dana','Tarek','Yara'];
  return {name:names[Math.floor(Math.random()*names.length)], mons:pickd.map(s=>{ const skl={}; s.sk.slice(0,slotsOf(lvl)).forEach(id=>skl[id]=Math.min(10,abil)); const G=gear(pickd.indexOf(s)); return {sp:s.id,lvl,bonus:Object.assign({},bonus,G.g),items:G.items,skl}; })};
}

// ---------- Smarter AI for arena-style fights: looks ahead at each option and your likely reply ----------
(function(){
  const baseAI=aiChoose;
  const clone=b=>JSON.parse(JSON.stringify(b));
  function settle(c){ let g=0; while(!c.over&&c.phase==='pick'&&g++<4){ const s=c.pickSide; const i=aiPick(c,s); if(i==null||!pick(c,s,i)) break; } }
  function evalFor(c,s){ if(c.over) return c.winner===s?1e5:-1e5; let v=0;
    c.sides.forEach((sd,k)=>{ const sign=k===s?1:-1; sd.mons.forEach(m=>{ if(m.hp<=0) return; let x=60+100*m.hp/m.maxhp+12*m.mp/Math.max(1,m.maxmp);
      ['burn','poison','storm','frost'].forEach(d=>{ if(m.st[d]>0) x-=Math.min(60,(m.st[d+'D']||0)*m.st[d]/m.maxhp*100*0.7); });
      ['bubble','lsh','fsh','nsh','mshield','pers','fwall'].forEach(z=>{ if(m.st[z]>0) x+=4; }); if(m.st.stun>0) x-=15; v+=sign*x; }); }); return v; }
  function options(b){ const a=actor(b); const m=a.m; const opts=[];
    ['basic',...usable(m)].forEach(id=>{ let ts=[]; try{ ts=validTargets(b,a.s,id)||[]; }catch(_){ ts=[]; } if(!ts.length) ts=[null]; ts.forEach(t=>opts.push({skill:id,target:t})); });
    return opts; }
  function score(b,s,o){ let tot=0; const N=2;
    for(let k=0;k<N;k++){ const c=clone(b); c.rng=((b.rng|0)+7919*(k+1))|0; c.ev=[]; c.log=[];
      if(!act(c,o)){ return -1e9; } settle(c);
      // your most likely reply
      let g=0; while(!c.over&&g++<2){ const a2=actor(c); if(!a2||a2.s===s) break; const r=baseAI(c); if(!r||!act(c,r)) break; settle(c); }
      tot+=evalFor(c,s); }
    return tot/N; }
  function smartChoose(b){ try{ const a=actor(b); if(!a) return baseAI(b); let best=null,bs=-Infinity;
      for(const o of options(b)){ const v=score(b,a.s,o); if(v>bs){ bs=v; best=o; } }
      return best||baseAI(b); }catch(e){ console.warn('smart AI fell back',e); return baseAI(b); } }
  window.__aiSmart=smartChoose; window.__aiBase=baseAI;
  aiChoose=function(b){ const smart=typeof B!=='undefined'&&B&&['practice','rival','challenge'].includes(B.mode)&&B.b===b; return smart?smartChoose(b):baseAI(b); };
})();

// ---------- MK families after Cerberus: Elephant, Tiger, Squirrel (levels 29–30) ----------
function elephantNew(c1,c2,c3,st,id){
  const G=id+'a', dk=shade(c1,-26); let d=`<defs>${grad(G,c1)}</defs>`, g='';
  g+=tail3(`M18 64 Q12 66 12 74`,2.2,c1);
  g+=leg3(28,74,27,84,28,91,7,dk)+leg3(56,74,57,84,57,91,7,dk);
  g+=`<path d="M16 70 Q14 50 38 47 Q60 45 68 56 Q72 70 62 79 Q40 84 22 79Z" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M26 78 Q42 83 58 78" fill="none" stroke="${c3}" stroke-width="2.4" opacity=".8"/>`;
  if(st>=1) g+=`<path d="M28 52 Q40 47 54 50" fill="none" stroke="${c2}" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`;
  g+=leg3(33,76,32,84,33,91,7.4,`url(#${G})`,1)+leg3(61,75,62,84,62,91,7.4,`url(#${G})`,1);
  const hx=74, hy=54, er=9+st*2;
  g+=`<path d="M${hx-8} ${hy-6} Q${hx-12-er} ${hy-10-er*0.4} ${hx-14} ${hy+6+er*0.5} Q${hx-6} ${hy+10} ${hx-3} ${hy+2}Z" fill="${shade(c1,-12)}" ${s3}/><path d="M${hx-9} ${hy-3} Q${hx-9-er*0.8} ${hy-6} ${hx-12} ${hy+4+er*0.4} Q${hx-7} ${hy+6} ${hx-5} ${hy+1}Z" fill="${c3}" opacity=".7"/>`;
  g+=`<path d="M${hx-6} ${hy+2} Q${hx-7} ${hy-12} ${hx+4} ${hy-12} Q${hx+14} ${hy-11} ${hx+14} ${hy} Q${hx+13} ${hy+8} ${hx+5} ${hy+10} Q${hx-4} ${hy+10} ${hx-6} ${hy+2}Z" fill="url(#${G})" ${s3}/>`;
  const tk=`M${hx+10} ${hy+4} Q${hx+16} ${hy+12} ${hx+14} ${hy+22} Q${hx+13} ${hy+30} ${hx+19} ${hy+31}`;
  g+=`<path d="${tk}" fill="none" stroke="${OL3}" stroke-width="9" stroke-linecap="round"/><path d="${tk}" fill="none" stroke="${c1}" stroke-width="5.6" stroke-linecap="round"/>`;
  if(st>=1){ const tl=4+st*3; g+=`<path d="M${hx+6} ${hy+8} Q${hx+8} ${hy+12+tl} ${hx+3} ${hy+14+tl}" fill="none" stroke="${OL3}" stroke-width="4.4" stroke-linecap="round"/><path d="M${hx+6} ${hy+8} Q${hx+8} ${hy+12+tl} ${hx+3} ${hy+14+tl}" fill="none" stroke="#fff8e8" stroke-width="2.4" stroke-linecap="round"/>`; }
  if(st>=2) g+=`<path d="M${hx-2} ${hy-12} l2 -6 l3 4 l3 -6 l3 6 l3 -4 l1 6" fill="${c2}" ${s3} stroke-width="1.3"/>`;
  g+=eye3(hx+5,hy-3,st===0?4.4:3.8,'#6b4a2b',st,-4);
  return d+g; }
function tigerNew(c1,c2,c3,st,id){
  const base=catNew(c1,c2,c3,st,id), dk=shade(c1,-45), n=3+st, hx=st===0?72:74, hy=st===0?44:40;
  let s=''; for(let k=0;k<n;k++){ const x=30+k*(26/n); s+=`<path d="M${x} 53 q2 5 0 10 M${x+3} 55 q-1 3 1 6" fill="none" stroke="${dk}" stroke-width="2.2" stroke-linecap="round" opacity=".75"/>`; }
  s+=`<path d="M${hx-4} ${hy-9} l1 4 M${hx} ${hy-10} l0 4 M${hx+4} ${hy-9} l-1 4" stroke="${dk}" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>`;
  s+=`<path d="M${hx-10} ${hy+3} l4 1 M${hx-10} ${hy+6} l4 0" stroke="${dk}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;
  return base+s; }
function squirrelNew(c1,c2,c3,st,id){
  const G=id+'a', T=id+'t'; let d=`<defs>${grad(G,c1)}${grad(T,shade(c1,8))}</defs>`, g='';
  const ts=1+st*0.14;
  g+=`<g transform="translate(34 80) scale(${ts}) translate(-34 -80)"><path d="M40 82 Q14 86 12 62 Q10 40 26 30 Q38 24 40 36 Q30 38 28 50 Q28 62 38 66 Q46 70 44 80Z" fill="url(#${T})" ${s3}/><path d="M24 40 Q18 50 22 62" fill="none" stroke="${c3}" stroke-width="2.4" opacity=".7"/></g>`;
  g+=leg3(46,80,44,86,42,91,5,shade(c1,-26))+leg3(60,80,62,86,64,91,5,shade(c1,-26));
  g+=`<path d="M40 82 Q38 60 52 56 Q66 58 66 76 Q64 88 52 88 Q42 88 40 82Z" fill="url(#${G})" ${s3}/><ellipse cx="54" cy="76" rx="8" ry="10" fill="${c3}" opacity=".85"/>`;
  g+=`<path d="M48 70 Q52 74 56 70 M58 70 Q62 74 64 70" fill="none" stroke="${OL3}" stroke-width="1.6" stroke-linecap="round"/>`;
  if(st>=1) g+=`<ellipse cx="56" cy="74" rx="4" ry="3.4" fill="#b07a3a" ${s3} stroke-width="1.2"/><path d="M52.5 72 Q56 68 59.5 72" fill="#6b4a2b" ${s3} stroke-width="1.1"/>`;
  [[48,1],[64,-1]].forEach(([x,sg])=>{ g+=`<ellipse cx="${x}" cy="${37-st}" rx="4.6" ry="${6+st}" transform="rotate(${-sg*14} ${x} ${37-st})" fill="url(#${G})" ${s3}/><ellipse cx="${x}" cy="${38-st}" rx="2.4" ry="${3.6+st*.6}" transform="rotate(${-sg*14} ${x} ${38-st})" fill="${c3}"/>`; if(st>=2) g+=`<path d="M${x} ${31-st*2} l${-sg} -4" stroke="${OL3}" stroke-width="1.6" stroke-linecap="round"/>`; });
  g+=`<ellipse cx="56" cy="48" rx="13" ry="11.5" fill="url(#${G})" ${s3}/><ellipse cx="58" cy="53" rx="6" ry="4.4" fill="${c3}"/><ellipse cx="59" cy="51" rx="1.6" ry="1.2" fill="${OL3}"/>`;
  g+=`<path d="M56 54.5 Q59 57 62 54.5" fill="none" stroke="${OL3}" stroke-width="1.3" stroke-linecap="round"/><rect x="57.6" y="55" width="2.8" height="2.4" rx=".5" fill="#fff" stroke="${OL3}" stroke-width=".6"/>`;
  if(st>=1) g+=`<path d="M44 46 l-4 -1 M44 49 l-4 1" stroke="${c2}" stroke-width="1.6" stroke-linecap="round"/>`;
  g+=eye3(51,46,st===0?4.4:3.9,'#3a2a1a',st,-3)+eye3(62,46,st===0?4.4:3.9,'#3a2a1a',st,3);
  return d+g; }
Object.assign(FAM,{
  elephant:{n:'Elephant', el:'water', shape:'elephant', base:{hp:86,atk:14,mp:44,spd:8}},
  tiger:{n:'Tiger', el:'bolt', shape:'tiger', base:{hp:72,atk:18,mp:44,spd:15}},
  squirrel:{n:'Squirrel', el:'bolt', shape:'squirrel', base:{hp:64,atk:6,mp:96,spd:15}}});
[['trunkle','Trunkle','elephant',['#8fa8c8','#4a9cf0','#eef4fb'],['bubble','camelback','hydrate','grounded']],
 ['tuskmoor','Tuskmoor','elephant',['#a89a8a','#3aa6b8','#f6f1ec'],['wave','hardened','splash','thickskin']],
 ['mammoss','Mammoss','elephant',['#8a6a5a','#9be3ff','#f4ece6'],['blizzard','perseverance','mshield','roots']],
 ['quakeph','Quakeph','elephant',['#6a7a9a','#ffcf4a','#eceff6'],['absorb','trample','purge','sweaty']],
 ['stripel','Stripel','tiger',['#f29a3a','#3a3a3c','#fff3e2'],['bolt','stormcloud','spark','double']],
 ['shadestripe','Shadestripe','tiger',['#4a4a5a','#9b8cff','#eeeef4'],['zap','flicker','cripple','sweaty']],
 ['voltiger','Voltiger','tiger',['#ffd84d','#5a3a22','#fff8dc'],['shock','charge','lshield','pounce']],
 ['frostrype','Frostrype','tiger',['#e8eef6','#4a5a8a','#ffffff'],['thunder','staticd','purge','grounded']],
 ['nutzap','Nutzap','squirrel',['#c8834a','#ffd84d','#fff1e0'],['zap','hardened','lshield','grounded']],
 ['acorvolt','Acorvolt','squirrel',['#9a6a4a','#ff8a3a','#f6ebe2'],['bolt','cripple','spark','double']],
 ['bristlet','Bristlet','squirrel',['#a8a8b8','#5fd0e8','#f2f2f8'],['shock','hydrate','aircurrent','sweaty']],
 ['cloudtuft','Cloudtuft','squirrel',['#e0b87a','#b9a7ff','#fff8ec'],['thunder','regrowth','stormcloud','pounce']]
].forEach(([id,n,fam,col,sk])=>{ const sp={id,n,fam,col,tw:{},sk:sk.filter(k=>SK[k])}; SP.push(sp); SPI[id]=sp; });
Object.assign(ATK_MOUTH,{elephant:[1.6,2.0,1.0],tiger:[1.5,2.1,1.0],squirrel:[1.2,1.8,.9]});
monSVG=(function(prev){ const F={elephant:elephantNew,tiger:tigerNew,squirrel:squirrelNew}; return function(spId,lvl,cls){ const sp=SPI[spId]; const shape=sp&&FAM[sp.fam]&&FAM[sp.fam].shape; if(!F[shape]) return prev(spId,lvl,cls);
  const st=stageOf(lvl); const c1=mute(sp.col[0],22), c2=mute(sp.col[1],12), c3=mute(sp.col[2],10); const id='m'+(GID++); const sc=[0.8,0.92,1][st];
  return `<svg class="${cls||''}" viewBox="-4 0 108 100"><g transform="translate(50 92) scale(${sc}) translate(-50 -92)">${F[shape](c1,c2,c3,st,id)}</g></svg>`; }; })(monSVG);
ZONES.push(
  {id:'cliffs', n:'Quake Cliffs', fam:'elephant', lv:29, sizes:[3,3,3,3], c:'#a89a8a'},
  {id:'mintwood', n:'Mintleaf Forest', fam:'tiger', lv:29, sizes:[3,3,3,3], c:'#5fd3a0'},
  {id:'grasslands', n:'Sky Grasslands', fam:'squirrel', lv:30, sizes:[3,3,3,3], c:'#9be15d'});
Object.assign(ZTASKS,{
  cliffs:[['act','Climb the rumbling cliffs',29,0,230,300,2,3],['fight','Battle a wild elephant',29,0,260,330,3,3],['act','Fill the water troughs',29,{mp:300},260,330,2,3],['fight','Face the cliffside herd',30,0,300,380,3,2],['boss','Quake Cliffs Boss',30,0,560,700,5,1]],
  mintwood:[['act','Track pawprints through the mint',29,0,240,310,2,3],['fight','Battle a wild tiger',29,0,270,340,3,3],['act','Cross the crackling stream',30,{hp:520},270,340,2,3],['fight','Face the striped pride',30,0,310,390,3,2],['boss','Mintleaf Forest Boss',30,0,580,720,5,1]],
  grasslands:[['act','Chase the wind through the grass',30,0,250,320,2,3],['fight','Battle a wild squirrel',30,0,280,360,3,3],['act','Gather storm acorns',30,{mp:340},280,360,2,3],['fight','Face the treetop gang',30,0,320,400,3,2],['boss','Sky Grasslands Boss',30,0,600,750,5,1]]
});
Object.assign(ZSCENE,{
  cliffs:{sky:['#d8b48a','#f6e6cc'],orb:'#fffbe0',ox:74,oy:22,hills:['#b89a7a','#8a6a4a'],x:'cliffs'},
  mintwood:{sky:['#9fe8c8','#e8fff4'],orb:'#fffbe0',ox:70,oy:22,hills:['#5fd3a0','#3a9a6a'],x:'wood'},
  grasslands:{sky:['#7fc8ff','#e2f4ff'],orb:'#ffffff',ox:26,oy:22,hills:['#9be15d','#6fb83a'],x:'grass'}
});
Object.assign(ZCOL,{cliffs:['#f4ebe0','#dccab4'],mintwood:['#e0f8ee','#b4e8d0'],grasslands:['#eef8e0','#cceaa8']});
Object.assign(TRACKS,{z_cliffs:TRACKS.z_desert, z_mintwood:TRACKS.z_hollow, z_grasslands:TRACKS.z_beach});
zoneScene=(function(prev){ const X={
    cliffs:()=>`<path d="M0 80 L18 46 L34 52 L50 30 L70 50 L90 40 V100 H0Z" fill="#9a7a5a"/><path d="M200 78 L184 44 L168 54 L150 34 L134 56 L120 48 V100 H200Z" fill="#8a6a4a"/><path d="M50 30 l-6 10 l6 -2 l6 2z M150 34 l-6 10 l6 -2 l6 2z" fill="#e8d8c4"/>`,
    wood:()=>`<g fill="#2e7a5a"><path d="M14 92 l14 -44 l14 44z"/><path d="M170 92 l14 -50 l14 50z"/><path d="M150 92 l10 -32 l10 32z"/></g><g fill="#5a3a22"><rect x="25" y="88" width="6" height="6"/><rect x="181" y="88" width="6" height="6"/></g><g fill="#fff" opacity=".8"><circle cx="40" cy="60" r="1.4"/><circle cx="160" cy="56" r="1.4"/></g>`,
    grass:()=>`<g fill="#5aa82a">${[10,26,44,62,140,158,176,192].map(x=>`<path d="M${x} 92 q-2 -10 2 -16 q1 8 2 16z"/>`).join('')}</g><g fill="#fff" opacity=".9"><ellipse cx="60" cy="26" rx="16" ry="6"/><ellipse cx="150" cy="18" rx="12" ry="5"/></g>`};
  return function(id){ const z=ZSCENE[id]; if(!z||!X[z.x]) return prev(id); const g='zg'+id, ex=X[z.x](z);
    return `<svg class="zscene" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${z.sky[0]}"/><stop offset="1" stop-color="${z.sky[1]}"/></linearGradient></defs><rect width="200" height="100" fill="url(#${g})"/><circle cx="${z.ox}" cy="${z.oy}" r="10" fill="${z.orb}" opacity=".9"/><path d="M0 74 Q50 62 100 70 T200 66 V100 H0Z" fill="${z.hills[0]}"/>${ex}<path d="M0 84 Q60 76 120 84 T200 82 V100 H0Z" fill="${z.hills[1]}"/></svg>`; }; })(zoneScene);
QUESTS.push({id:'q12', n:'Clear Sky Grasslands', r:35, ok:s=>(s.zones.grasslands||0)>=4});

// ---------- status icons use the icon of the ability that caused them; stacked effects show one icon each ----------
function stIconFor(k,src){ const s=src&&SK[src]; return s? (n=>icon(skIconKey(src),(EL[s.el]||EL.neutral).c,n)) : (n=>icon(ST_ICON[k][0],ST_ICON[k][1],n)); }
function stList(m){ const r=stList0(m); const H=B&&B.hideSt&&B.hideSt.get?B.hideSt.get(m):null; let out=r;
  if(H){ const left=Object.assign({},H); out=r.filter(x=>{ if(left[x.k]>0){ if(x.stack){ left[x.k]--; return false; } return false; } return true; }); }
  return out.sort((a,b)=>(a.at||0)-(b.at||0)); }
function stName(k,src){ const s=src&&src!=='basic'&&SK[src]; return s?s.n:(BUFF_N[k]||(k[0].toUpperCase()+k.slice(1))); }
function stList0(m){ const st=m.st, out=[], P=v=>Math.round((v||0)*100)+'%', T=t=>`${t} turn${t>1?'s':''}`;
  Object.keys(ST_ICON).filter(k=>st[k]>0).forEach(k=>{
    const S=st[k+'S'];
    if((k==='soak'||k==='scorch'||k==='acid')&&S&&S.length){ const what=k==='soak'?'water':k==='acid'?'nature':'fire', dsrc=k==='soak'?'wave':k==='acid'?'acidbite':'emberspit';
      S.slice().sort((a,b)=>(b.at||0)-(a.at||0)).forEach(x=>out.push({k, stack:1, at:x.at||0, t:x.t, exp:x.t<=1, name:stName(k,x.src||dsrc), ic:stIconFor(k,x.src||dsrc), tip:`Takes ${P(x.v)} more ${what} damage (${T(x.t)})`})); return; }
    out.push({k, at:st[k+'At']||0, t:st[k], exp:st[k]<=1, name:stName(k,st[k+'Src']), ic:stIconFor(k,st[k+'Src']), tip:stDesc(m,k)}); });
  return out; }
act=(function(prev){ return function(b,action){
  const snap=b.sides.map(sd=>sd.mons.map(m=>{ const o={}; Object.keys(ST_ICON).forEach(k=>o[k]=m.st[k]|0); return o; }));
  const sk=action&&action.skill&&SK[action.skill]?action.skill:'basic';
  const r=prev(b,action);
  if(r) b.sides.forEach((sd,s)=>sd.mons.forEach((m,i)=>{ const o=snap[s]&&snap[s][i]; if(!o) return;
    Object.keys(ST_ICON).forEach(k=>{ if((m.st[k]|0)>o[k]&&k!=='soak'&&k!=='scorch'&&k!=='acid'){ m.st[k+'Src']=sk; m.st[k+'At']=stSeq(); } }); }));
  return r; }; })(act);
// items listed one card per copy (three Krill's Swords show as three)
function itemLine(id){ const it=ITEMS[id], f=it.fx||{}, b=it.b||{};
  if(f.rmp) return `Recovers ${f.rmp} mana after each turn`; if(f.rhp) return `Recovers ${f.rhp} life after each turn`;
  if(f.dflat) return `Deals ${f.dflat} more damage to foes, takes ${f.tflat} more damage from foes`;
  if(f.dnat) return `Deals ${f.dnat} more nature damage to foes`; if(f.dwat) return `Deals ${f.dwat} more water damage to foes`; if(f.dfir) return `Deals ${f.dfir} more fire damage to foes`;
  if(f.belem||f.bphys) return `Reduces incoming physical damage by ${f.bphys|0} and all elemental damage by ${f.belem|0}`;
  return Object.keys(b).map(k=>`+${b[k]} ${STAT_N[k]||k}`).join(', '); }
function itemCopies(fx,m){
  if(m&&Array.isArray(m.items)&&m.items.length) return m.items.filter(id=>ITEMS[id]).map(id=>[id,null]);
  const out=[]; const keyOf={manabowl:'rmp',lifebowl:'rhp',blade:'dflat'};
  ['manabowl','lifebowl','blade'].forEach(id=>{ const k=keyOf[id], tot=fx[k]|0; if(!tot) return; const it=ITEMS[id], per=(it.fx&&it.fx[k])|0;
    const n=per>0&&tot%per===0?tot/per:1; for(let j=0;j<n;j++) out.push([id,null]); });
  return out; }
// ---------- activities keep their scroll position when the list redraws ----------
drawTasks=(function(prev){ return function(){ const l=document.querySelector('.tscreen.tasks .tlist'), y=l?l.scrollTop:0;
  const r=prev.apply(this,arguments); const n=document.querySelector('.tscreen.tasks .tlist'); if(n&&y) n.scrollTop=y; return r; }; })(drawTasks);


// ---------- new shop items: Force Capacitor, Goldphoro's Crown, Bob's Vest, Professor Goh's Diploma ----------
(function(){ const S0='<svg viewBox="0 0 64 64">', E='</svg>';
  const ART={
    capacitor:S0+'<rect x="14" y="14" width="36" height="42" rx="6" fill="#3a4a5a" stroke="#1a2430" stroke-width="2.5"/><rect x="24" y="7" width="16" height="8" rx="2" fill="#9aa6b4" stroke="#1a2430" stroke-width="2"/><rect x="18" y="20" width="28" height="30" rx="3" fill="#2a8cff"/><path d="M35 22 25 37h7l-3 11 11-16h-7z" fill="#ffe14a" stroke="#8a6a0a" stroke-width="1.4"/>'+E,
    gcrown:S0+'<path d="M8 48 6 18l13 12 13-20 13 20 13-12-2 30z" fill="#ffcf3a" stroke="#9a6a08" stroke-width="2.5" stroke-linejoin="round"/><rect x="8" y="46" width="48" height="9" rx="2" fill="#f2b81a" stroke="#9a6a08" stroke-width="2.5"/><circle cx="32" cy="36" r="5" fill="#e3262d" stroke="#7a0a0a" stroke-width="1.5"/><circle cx="18" cy="39" r="3" fill="#2a8cff"/><circle cx="46" cy="39" r="3" fill="#2fbf4a"/><circle cx="32" cy="10" r="3" fill="#fff6c0"/>'+E,
    vest:S0+'<path d="M20 8 L12 14 L10 54 Q20 58 30 56 L30 22 Z" fill="#3a6ad8" stroke="#1a2a5a" stroke-width="2.5" stroke-linejoin="round"/><path d="M44 8 L52 14 L54 54 Q44 58 34 56 L34 22 Z" fill="#3a6ad8" stroke="#1a2a5a" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 8 Q26 18 30 22 M44 8 Q38 18 34 22" stroke="#1a2a5a" stroke-width="2.5" fill="none"/><circle cx="27" cy="32" r="2" fill="#ffd84d"/><circle cx="27" cy="42" r="2" fill="#ffd84d"/><path d="M14 30 L28 28 M50 30 L36 28" stroke="#ffd84d" stroke-width="3"/>'+E,
    diploma:S0+'<rect x="8" y="16" width="48" height="28" rx="3" fill="#fff6dc" stroke="#7a5a2a" stroke-width="2.5"/><circle cx="8" cy="30" r="6" fill="#e8d6a8" stroke="#7a5a2a" stroke-width="2"/><circle cx="56" cy="30" r="6" fill="#e8d6a8" stroke="#7a5a2a" stroke-width="2"/><path d="M16 24h24M16 30h28M16 36h18" stroke="#b09a6a" stroke-width="2" stroke-linecap="round"/><circle cx="44" cy="40" r="7" fill="#e3262d" stroke="#7a0a0a" stroke-width="1.6"/><path d="M40 46 37 58 44 54 51 58 48 46" fill="#e3262d" stroke="#7a0a0a" stroke-width="1.4"/>'+E };
  itemSVG=(function(prev){ return function(id){ return ART[id]||prev(id); }; })(itemSVG); })();
// other players' monster cards list each equipped item (three Krill's Swords show as three)
openMonRO=(function(prev){ return function(t,owner){ const sh=prev(t,owner); try{ const b=t.bonus||{};
  const items=itemCopies({rmp:b.rmp|0,rhp:b.rhp|0,dflat:b.dflat|0,tflat:b.tflat|0},{items:t.items});
  if(items.length&&sh&&sh.body){ const p=sh.body.querySelector('.prof'); if(p) p.insertAdjacentHTML('beforeend',`<h3 class="ph">Items</h3><div class="mi2-items">${items.map(([id])=>`<div class="pab"><span class="mi2-it">${itemSVG(id)}</span><div class="pab-t"><b>${ITEMS[id].n}</b><span>${itemLine(id)}</span></div></div>`).join('')}</div>`); } }catch(_){} return sh; }; })(openMonRO);

// weakening abilities (Cripple): their own icon drops onto the foe, who shrinks for a moment
animateBattle=(function(prev){ return function(root,b,animating){ const r=prev(root,b,animating); if(!animating) return r;
  try{ const evs=b.ev||[]; const a=evs.find(e=>e.k==='act'); const sk=a&&SK[a.sk]; if(!sk||sk.k!=='debuff') return r;
    evs.filter(e=>e.k==='buff'&&e.s!==a.s&&!e.missed).forEach(e=>{ setTimeout(()=>{ const el=fEl(e.s,e.i); if(!el) return;
      const ic=document.createElement('div'); ic.className='dotpop'; ic.innerHTML=icon(skIconKey(a.sk),(EL[sk.el]||EL.neutral).c,46); el.appendChild(ic); setTimeout(()=>ic.remove(),900);
      el.classList.remove('weaken'); void el.offsetWidth; el.classList.add('weaken'); setTimeout(()=>el.classList.remove('weaken'),700); },260); }); }catch(_){}
  return r; }; })(animateBattle);

document.addEventListener('click',e=>{ const hi=e.target.closest&&e.target.closest('#battle .hicons'); if(!hi||!B||!B.b) return; const p=hi.closest('.bhp'); if(!p) return;
  e.stopPropagation(); const s=+p.dataset.hs, sd=B.b.sides[s]; monInfo(B.b,s,sd.active!=null?sd.active:+p.dataset.hi||0); },true);

// ---------- elemental damage items: Gauntlets (nature), Hydrant (water), Flamethrower (fire) ----------
(function(){ const S0='<svg viewBox="0 0 64 64">', E='</svg>';
  const ART={
    gauntlets:S0+'<path d="M14 30 Q12 14 22 12 L26 12 L26 22 L30 10 L36 10 L36 22 L40 12 L46 14 L44 26 Q52 26 50 36 L44 50 Q40 56 30 56 L22 56 Q14 54 14 44Z" fill="#3fae4a" stroke="#1d5a24" stroke-width="2.5" stroke-linejoin="round"/><rect x="16" y="44" width="30" height="10" rx="3" fill="#8a5a2a" stroke="#4a2a0a" stroke-width="2"/><path d="M24 30 q6 -8 12 0 q-6 8 -12 0z" fill="#b6f07a" stroke="#1d5a24" stroke-width="1.4"/>'+E,
    hydrant:S0+'<rect x="20" y="20" width="24" height="34" rx="5" fill="#2a8cff" stroke="#0a3a7a" stroke-width="2.5"/><path d="M18 20 Q32 4 46 20Z" fill="#2a8cff" stroke="#0a3a7a" stroke-width="2.5"/><rect x="10" y="30" width="10" height="9" rx="2" fill="#5fb0ff" stroke="#0a3a7a" stroke-width="2"/><rect x="44" y="30" width="10" height="9" rx="2" fill="#5fb0ff" stroke="#0a3a7a" stroke-width="2"/><rect x="16" y="52" width="32" height="6" rx="2" fill="#0a3a7a"/><circle cx="32" cy="35" r="5" fill="#d8eeff" stroke="#0a3a7a" stroke-width="1.6"/>'+E,
    flamethrower:S0+'<rect x="8" y="30" width="34" height="12" rx="4" fill="#5a5a66" stroke="#22222a" stroke-width="2.5"/><rect x="14" y="40" width="9" height="14" rx="3" fill="#3a3a44" stroke="#22222a" stroke-width="2"/><rect x="40" y="32" width="8" height="8" fill="#8a8a96" stroke="#22222a" stroke-width="2"/><path d="M48 36 Q58 26 56 18 Q62 26 60 34 Q64 32 62 26 Q68 36 58 44 Q54 46 48 40Z" fill="#ff8a1a" stroke="#a83a0a" stroke-width="1.8"/><path d="M50 37 Q56 32 56 26 Q60 34 54 40Z" fill="#ffe14a"/>'+E };
  itemSVG=(function(prev){ return function(id){ return ART[id]||prev(id); }; })(itemSVG); })();

// ---------- MK items: art for the stat items, plus redrawn Diploma, Vest and Crown ----------
(function(){ const S0='<svg viewBox="0 0 64 64">', E='</svg>', O='stroke="#2b2216" stroke-width="2.2" stroke-linejoin="round"';
  const ART={
    manaplant:S0+`<path d="M18 40h28l-4 18H22z" fill="#c8723a" ${O}/><rect x="15" y="36" width="34" height="7" rx="2" fill="#e08a4a" ${O}/><path d="M32 37 Q30 26 34 18 Q38 12 34 8" fill="none" stroke="#2b2216" stroke-width="5" stroke-linecap="round"/><path d="M32 37 Q30 26 34 18 Q38 12 34 8" fill="none" stroke="#6ab8f0" stroke-width="3" stroke-linecap="round"/><path d="M33 24 Q20 16 14 24 Q22 30 33 24Z M34 20 Q46 10 52 18 Q44 26 34 20Z M34 10 Q28 2 22 8 Q28 14 34 10Z" fill="#7cc6f6" ${O}/><circle cx="36" cy="7" r="2.6" fill="#bfe6ff" ${O} stroke-width="1.4"/>`+E,
    potion:S0+`<rect x="27" y="6" width="10" height="6" rx="2" fill="#f2e6c8" ${O}/><path d="M28 12h8v10 Q50 30 46 46 Q42 58 32 58 Q22 58 18 46 Q14 30 28 22Z" fill="#cfe6f2" ${O}/><path d="M18.5 44 Q32 38 45.5 44 Q42 57 32 57 Q22 57 18.5 44Z" fill="#e3262d"/><path d="M26 22 Q32 28 38 22" fill="none" stroke="#c4231c" stroke-width="3"/><path d="M22 32 Q20 38 22 42" stroke="#fff" stroke-width="2.4" fill="none" opacity=".8" stroke-linecap="round"/>`+E,
    blaster:S0+`<path d="M8 30h36l8 4v10H40l-4 14h-10l2-14H8z" fill="#5a6270" ${O}/><rect x="44" y="33" width="14" height="7" rx="2" fill="#3a404a" ${O}/><circle cx="22" cy="36" r="4" fill="#ffd84d" ${O} stroke-width="1.6"/><path d="M28 34h3M33 34h3M38 34h3" stroke="#ffd84d" stroke-width="2.4"/><rect x="26" y="14" width="7" height="17" rx="3" fill="#bfe6ff" ${O}/><rect x="27" y="22" width="5" height="8" fill="#5fd36a"/>`+E,
    talisman:S0+`<path d="M12 18 L26 10 L34 18 L46 10 L54 22 L48 34 L54 46 L40 54 L30 46 L18 54 L10 42 L16 32Z" fill="#cfd6dc" ${O}/><path d="M24 22v20M24 22l8 6-8 6M38 22l6 8-6 8M30 40l4-6 4 6" fill="none" stroke="#8a7a5a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`+E,
    medipod:S0+`<path d="M10 34h44v16 Q54 56 48 56H16 Q10 56 10 50Z" fill="#d8443a" ${O}/><path d="M12 34 Q14 12 32 10 Q50 12 52 34Z" fill="#cfe6f2" ${O} opacity=".95"/><path d="M20 30 Q22 18 32 16" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="32" cy="45" r="6" fill="#ffd84d" ${O} stroke-width="1.6"/><path d="M32 41v8M28 45h8" stroke="#d8443a" stroke-width="2.4"/><rect x="50" y="26" width="7" height="12" rx="3" fill="#5fb0ff" ${O} stroke-width="1.6"/>`+E,
    powersuit:S0+`<path d="M20 22 Q32 16 44 22 L48 42 Q40 56 32 58 Q24 56 16 42Z" fill="#4a5a6a" ${O}/><path d="M24 26 Q32 22 40 26 L42 40 Q32 48 22 40Z" fill="#ffd84d" opacity=".25"/><path d="M22 12 Q24 20 28 22 M42 12 Q40 20 36 22" stroke="#ffd84d" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M26 30h12M28 36h8M30 42h4" stroke="#ffd84d" stroke-width="2.4" stroke-linecap="round"/><path d="M14 28 Q8 34 12 42 M50 28 Q56 34 52 42" stroke="#2b2216" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M14 28 Q8 34 12 42 M50 28 Q56 34 52 42" stroke="#6a7a8a" stroke-width="3" fill="none" stroke-linecap="round"/>`+E,
    medallion:S0+`<path d="M18 8 Q8 22 22 30 M46 8 Q56 22 42 30" stroke="#2b2216" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M18 8 Q8 22 22 30 M46 8 Q56 22 42 30" stroke="#7a8ad8" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M32 26 L50 42 L32 58 L14 42Z" fill="#f2e6a8" ${O}/><path d="M32 32 L44 42 L32 52 L20 42Z" fill="#fff"/><circle cx="28" cy="40" r="3.4" fill="#5fd0e8"/><circle cx="36" cy="40" r="3.4" fill="#e07ad8"/><circle cx="32" cy="46" r="3.4" fill="#9be15d"/>`+E,
    amulet:S0+`<circle cx="32" cy="32" r="24" fill="#d8c070" ${O}/><circle cx="32" cy="32" r="11" fill="#7a8a9a" ${O}/><path d="M32 8 A24 24 0 0 1 56 32 L43 32 A11 11 0 0 0 32 21Z" fill="#a8483a"/><path d="M8 32 A24 24 0 0 1 32 8 L32 21 A11 11 0 0 0 21 32Z" fill="#5a6270"/><path d="M32 56 A24 24 0 0 1 8 32 L21 32 A11 11 0 0 0 32 43Z" fill="#f2c84a"/><circle cx="32" cy="32" r="24" fill="none" ${O}/><circle cx="32" cy="32" r="11" fill="none" ${O}/>`+E,
    diploma:S0+`<path d="M10 46 Q8 38 16 38 L50 38 Q58 40 54 48 L18 52 Q10 52 10 46Z" fill="#f6ecc8" ${O}/><path d="M16 38 Q12 44 18 52" fill="none" stroke="#2b2216" stroke-width="2"/><path d="M4 22 L32 10 L60 22 L32 34Z" fill="#4a4ad0" ${O}/><path d="M18 28v10 Q32 46 46 38V28" fill="#3a3ab0" ${O}/><path d="M32 22 L50 28 L50 40" fill="none" stroke="#d87a5a" stroke-width="2.4" stroke-linecap="round"/><circle cx="50" cy="42" r="2.6" fill="#d87a5a"/>`+E,
    vest:S0+`<path d="M20 8 L12 14 L10 54 Q20 58 30 56 L30 22 Z" fill="#3a8ad8" ${O}/><path d="M44 8 L52 14 L54 54 Q44 58 34 56 L34 22 Z" fill="#3a8ad8" ${O}/><path d="M11 30h19M11 36h19M11 42h19M34 30h19M34 36h19M34 42h19" stroke-width="5"/><path d="M11 30h19M34 30h19" stroke="#e3262d" stroke-width="5"/><path d="M11 36h19M34 36h19" stroke="#ffd84d" stroke-width="5"/><path d="M11 42h19M34 42h19" stroke="#5fd36a" stroke-width="5"/><path d="M20 8 L12 14 L10 54 Q20 58 30 56 L30 22 Z M44 8 L52 14 L54 54 Q44 58 34 56 L34 22 Z" fill="none" ${O}/><path d="M30 22 L30 56 M34 22 L34 56" stroke="#2a4a7a" stroke-width="3"/>`+E,
    gcrown:S0+`<path d="M12 48 Q10 28 16 8 Q22 28 24 44Z M26 44 Q28 20 32 4 Q36 20 38 44Z M40 44 Q42 28 48 8 Q54 28 52 48Z" fill="#f4f0e4" ${O}/><path d="M14 40 Q32 34 50 40 L52 54 Q32 48 12 54Z" fill="#e3c04a" ${O}/><path d="M20 46l3-4 3 4 3-4 3 4 3-4 3 4 3-4 3 4" fill="none" stroke="#a8781a" stroke-width="1.8"/><circle cx="32" cy="45" r="3" fill="#e3262d" ${O} stroke-width="1.4"/>`+E };
  itemSVG=(function(prev){ return function(id){ return ART[id]||prev(id); }; })(itemSVG); })();

// ---------- Elric: rare monster (shop only, 50 mushrooms) and his MK moves ----------
function EGGSP(){ return SP.filter(s=>!s.rare&&!s.boss&&s.fam!=='dummy'&&FAM[s.fam]&&FAM[s.fam].shape!=='dummy'); }
(function(){ const P=(a,t)=>[a,+((t-a)/9).toFixed(4)];
  SK.crushpunch={n:'Crush Punch', el:'neutral', t:'enemy', k:'hit', mp:P(3,11), m:[1,.03], crush:P(.06,.28), crushTurns:4,
    desc:"Break the enemy's defense, attacking and reducing their physical defence by {crush} for 4 turns."};
  SK.haymaker={n:'Haymaker', el:'neutral', t:'enemy', k:'hit', mp:P(3,11), m:[1.25,.05], stun:P(.05,.14),
    desc:'Powerful attack that has a {stun} chance to stun the enemy for one turn.'};
  Object.assign(SK.furyfist,{v:P(6,51)});
  Object.assign(SK.firefocus,{v:P(.2,.7), turns:4, mp:P(12,100), desc:'Amplifies all damage by an additional {v} for {turns} turns.'});
  ['crushpunch','haymaker','furyfist','firefocus'].forEach(k=>{ DEFAULT_SK[k]=JSON.parse(JSON.stringify(SK[k])); });
  ST_ICON.crush=['fist','#8a5a3a']; BUFF_N.crush='Crush Punch';
  stDesc=(function(prev){ return function(m,k){ if(k==='crush') return `Takes ${Math.round((m.st.crushV||0)*100)}% more physical damage (${m.st.crush} turn${m.st.crush>1?'s':''})`; return prev(m,k); }; })(stDesc);
  skillDesc=(function(prev){ return function(id,L){ const s=SK[id]; L=L||1; if(s&&s.desc&&(id==='crushpunch'||id==='haymaker'||id==='firefocus')){ const pc=v=>Math.round(v*100)+'%';
    let t=s.desc; if(s.crush) t=t.replace('{crush}',pc(lv(s.crush,L))); if(s.stun) t=t.replace('{stun}',pc(lv(s.stun,L))); if(s.v) t=t.replace('{v}',pc(lv(s.v,L))); return t.replace('{turns}',s.turns||''); } return prev(id,L); }; })(skillDesc);
  FAM.brawler={n:'Rare', el:'fire', shape:'brawler', base:{hp:70,atk:15,mp:30,spd:12}};
  const sp={id:'elric',n:'Elric',fam:'brawler',col:['#c8743a','#ffb02e','#fff0dc'],tw:{},sk:['crushpunch','haymaker','furyfist','firefocus'],rare:1};
  SP.push(sp); SPI.elric=sp; ATK_MOUTH.brawler=[1.4,2,1];
  function brawlerNew(c1,c2,c3,st,id){ const G=id+'a', dk=shade(c1,-28); let d=`<defs>${grad(G,c1)}</defs>`, g='';
    const tl=`M34 70 Q16 72 14 58 Q13 50 18 46`;
    g+=`<path d="${tl}" fill="none" stroke="${OL3}" stroke-width="7" stroke-linecap="round"/><path d="${tl}" fill="none" stroke="${c1}" stroke-width="4" stroke-linecap="round"/>`;
    const fl=6+st*3; g+=`<path d="M18 47 Q${12-st} ${40-fl} 19 ${36-fl} Q20 ${42-fl*.4} 24 ${38-fl*.5} Q25 44 18 47Z" fill="${c2}" ${s3} stroke-width="1.6"/><path d="M19 45 Q17 ${40-fl*.5} 20 ${38-fl*.6} Q22 42 19 45Z" fill="#fff3b0"/>`;
    g+=leg3(42,76,40,84,39,91,6.4,dk)+leg3(58,76,60,84,61,91,6.4,dk);
    g+=`<path d="M34 56 Q32 40 50 38 Q68 40 66 56 L64 74 Q50 82 36 74Z" fill="url(#${G})" ${s3}/><path d="M42 54 Q50 50 58 54 L57 70 Q50 74 43 70Z" fill="${c3}" opacity=".9"/>`;
    if(st>=1) g+=`<path d="M44 58h12M45 63h10" stroke="${dk}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;
    const fr=7+st*1.6;
    g+=`<path d="M36 48 Q26 52 24 62" fill="none" stroke="${OL3}" stroke-width="8.5" stroke-linecap="round"/><path d="M36 48 Q26 52 24 62" fill="none" stroke="${c1}" stroke-width="5.5" stroke-linecap="round"/>`;
    g+=`<path d="M64 48 Q74 52 77 60" fill="none" stroke="${OL3}" stroke-width="8.5" stroke-linecap="round"/><path d="M64 48 Q74 52 77 60" fill="none" stroke="${c1}" stroke-width="5.5" stroke-linecap="round"/>`;
    g+=`<circle cx="24" cy="${64+fr*.3}" r="${fr}" fill="${c2}" ${s3}/><path d="M${24-fr*.6} ${64} q${fr*.6} -${fr*.5} ${fr*1.2} 0" fill="none" stroke="${OL3}" stroke-width="1.4"/>`;
    g+=`<circle cx="78" cy="${62+fr*.3}" r="${fr}" fill="${c2}" ${s3}/><path d="M${78-fr*.6} ${62} q${fr*.6} -${fr*.5} ${fr*1.2} 0" fill="none" stroke="${OL3}" stroke-width="1.4"/>`;
    const hx=51, hy=30;
    g+=`<path d="M${hx-9} ${hy-8} L${hx-14-st*2} ${hy-17-st*2} L${hx-5} ${hy-11}Z M${hx+9} ${hy-8} L${hx+14+st*2} ${hy-17-st*2} L${hx+5} ${hy-11}Z" fill="#f4ead8" ${s3} stroke-width="1.6"/>`;
    g+=`<ellipse cx="${hx}" cy="${hy}" rx="13" ry="11.5" fill="url(#${G})" ${s3}/><path d="M${hx-8} ${hy+3} Q${hx} ${hy+9} ${hx+8} ${hy+3} Q${hx} ${hy+12} ${hx-8} ${hy+3}Z" fill="${c3}" ${s3} stroke-width="1.3"/>`;
    g+=`<path d="M${hx-4} ${hy+5} l1.5 2.6 l1.5 -2.6 M${hx+1} ${hy+5} l1.5 2.6 l1.5 -2.6" fill="#fff" stroke="${OL3}" stroke-width=".9"/>`;
    if(st>=2) g+=`<path d="M${hx-11} ${hy-4} Q${hx} ${hy-9} ${hx+11} ${hy-4}" fill="none" stroke="${c2}" stroke-width="2.6" stroke-linecap="round"/>`;
    g+=`<path d="M${hx-9} ${hy-5} l6 2 M${hx+9} ${hy-5} l-6 2" stroke="${OL3}" stroke-width="2" stroke-linecap="round"/>`;
    g+=eye3(hx-5,hy-1,st===0?3.6:3.2,'#c4231c',st,-3)+eye3(hx+5,hy-1,st===0?3.6:3.2,'#c4231c',st,3);
    return d+g; }
  monSVG=(function(prev){ return function(spId,lvl,cls){ const s=SPI[spId]; if(!s||s.fam!=='brawler') return prev(spId,lvl,cls);
    const st=stageOf(lvl); const c1=mute(s.col[0],22), c2=mute(s.col[1],12), c3=mute(s.col[2],10); const id='m'+(GID++); const sc=[0.82,0.92,1][st];
    return `<svg class="${cls||''}" viewBox="-4 0 108 100"><g transform="translate(50 92) scale(${sc}) translate(-50 -92)">${brawlerNew(c1,c2,c3,st,id)}</g></svg>`; }; })(monSVG);
})();
var RARE_COST=50;
function buyRare(id){ const s=SPI[id]; if(!s) return; if(S.mush<RARE_COST) return toast(`You need ${RARE_COST} 🍄`);
  confirmBox(`Buy ${s.n} for ${RARE_COST} 🍄?`,"Buy",()=>{ if(S.mush<RARE_COST) return; S.mush-=RARE_COST; const m=addMon(id,1); if(S.team.length<3) S.team.push(m.uid); persist(); render(); try{ drawShop(); }catch(_){} reveal(m,`${s.n} joined your team!`); }); }
// Cripple uses MK's symbol: a white bone lying flat on an orange disc
ICON.mkbone='<g transform="translate(0.5 3.6) rotate(-45 12 12)">'+ICON.mkbone+'</g>';
icon=(function(prev){ return function(key,bg,size){ return prev(key, key==='mkbone'?'#f39a2b':bg, size); }; })(icon);

// Spiked Collar: gold band with white spikes
itemSVG=(function(prev){ const A='<svg viewBox="0 0 64 64">'+[...Array(12)].map((_,i)=>{ const a=i/12*Math.PI*2, x=32+Math.cos(a)*17, y=34+Math.sin(a)*11, X=32+Math.cos(a)*30, Y=34+Math.sin(a)*22;
    const px=-Math.sin(a)*4.4, py=Math.cos(a)*3; return `<path d="M${(x+px).toFixed(1)} ${(y+py).toFixed(1)} L${X.toFixed(1)} ${Y.toFixed(1)} L${(x-px).toFixed(1)} ${(y-py).toFixed(1)}Z" fill="#f4f0e4" stroke="#2b2216" stroke-width="1" stroke-linejoin="round"/>`; }).join('')
  +'<ellipse cx="32" cy="34" rx="18" ry="11.5" fill="none" stroke="#2b2216" stroke-width="8"/><ellipse cx="32" cy="34" rx="18" ry="11.5" fill="none" stroke="#e8b52a" stroke-width="5"/><ellipse cx="32" cy="33" rx="18" ry="11.5" fill="none" stroke="#ffe27a" stroke-width="1.4" stroke-dasharray="9 6"/></svg>';
  return function(id){ return id==='collar'?A:prev(id); }; })(itemSVG);
// home Shop button opens the shop straight away (no pop-up list)
openSub=(function(prev){ return function(key,btn){ if(key==='shop'){ closeSub(); SHOPTAB='items'; openShop(); return; } return prev(key,btn); }; })(openSub);

// ---------- Taunt (MK): hit, then the foe hits harder physically but takes more physical damage for 4 turns ----------
(function(){ const P=(a,t)=>[a,+((t-a)/9).toFixed(4)];
  ICON.mklol='<path d="M4.2 5.5 Q4.2 3.6 6.2 3.6 H17.8 Q19.8 3.6 19.8 5.5 V13.6 Q19.8 15.5 17.8 15.5 H10.4 L6.6 19.6 L7.4 15.5 H6.2 Q4.2 15.5 4.2 13.6Z" fill="#fff"/><text x="12" y="12.6" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="6.6" fill="#e8501e" transform="rotate(-8 12 10)">LOL!</text>';
  SK.taunt={n:'Taunt', el:'neutral', t:'enemy', k:'hit', mp:P(3,11), m:[1,.03], taunt:P(.1,.47), tauntTurns:4,
    desc:'Attack the enemy and drive them crazy, increasing their physical attacks by {taunt} and reducing their physical defense by {taunt} for 4 turns.'};
  DEFAULT_SK.taunt=JSON.parse(JSON.stringify(SK.taunt));
  MK_ICON.taunt='mklol'; ST_ICON.taunt=['mklol','#e8501e']; BUFF_N.taunt='Taunt';
  skIconKey=(function(prev){ return function(id){ return id==='taunt'?'mklol':prev(id); }; })(skIconKey);
  stDesc=(function(prev){ return function(m,k){ if(k==='taunt'){ const p=Math.round((m.st.tauntV||0)*100)+'%'; return `Deals ${p} more physical damage and takes ${p} more physical damage (${m.st.taunt} turn${m.st.taunt>1?'s':''})`; } return prev(m,k); }; })(stDesc);
  skillDesc=(function(prev){ return function(id,L){ if(id==='taunt'){ const p=Math.round(lv(SK.taunt.taunt,L||1)*100)+'%'; return SK.taunt.desc.split('{taunt}').join(p); } return prev(id,L); }; })(skillDesc);
})();
// ---------- Monster Kingdom roster (phase 1): names, moves, colors and zone order from the MK wiki ----------
(function(){
  const MK=[ // id, MK name, family, colors [body, accent, belly], moves
   ['shellby','Chelamon','shell',['#3fbf4a','#e8c25a','#f2ecc8'],['hydrate','perseverance','blizzard','grounded']],
   ['tidepip','Chelydra','shell',['#e8b52a','#8ab83a','#f6eec8'],['bubble','lshield','wave','roots']],
   ['coraldon','Chelopo','shell',['#d83a2a','#5aa84a','#f2ecc8'],['mshield','firefocus','camelback','pounce']],
   ['brinemaw','Chelupa','shell',['#2a6ab8','#a99ad8','#ece6f6'],['absorb','splash','purge','sweaty']],
   ['ampurr','Feliger','volt',['#5a5866','#3fbf4a','#c8c6d2'],['bolt','nshield','spark','sweaty']],
   ['sparkpaw','Felida','volt',['#ece2c4','#e86a2a','#fff8e8'],['shock','firefocus','lshield','roots']],
   ['thundra','Felixu','volt',['#f2d04a','#3a6ad8','#fff4d0'],['stormcloud','purge','cripple','thickskin']],
   ['voltkit','Felinera','volt',['#8ab8dc','#f2a83a','#e8f2fa'],['shock','charge','aircurrent','pounce']],
   ['ashfang','Red XIII','hound',['#e84a2a','#6a4a3a','#fff2e8'],['blast','furyfist','emberspit','double']],
   ['rubblejaw','Ghost','hound',['#9a9aa2','#c4231c','#f2f2f4'],['moltencore','feed','flame','roots']],
   ['gravelpup','Fangor','hound',['#d8cf8a','#8a7a3a','#fff8dc'],['burn','cripple','fshield','grounded']],
   ['cragmaw','Barghest','hound',['#4a3e5a','#3ab8d8','#8a7e9a'],['flicker','poison','burn','thickskin']],
   ['nutzap','Meeko','squirrel',['#efe6c8','#5a9ad8','#ffffff'],['zap','hardened','lshield','grounded']],
   ['acorvolt','Zuko','squirrel',['#f2c42a','#2b2216','#fff4d0'],['bolt','cripple','spark','double']],
   ['bristlet','Bariko','squirrel',['#b8743a','#3ab8d8','#fff2e0'],['shock','hydrate','aircurrent','sweaty']],
   ['cloudtuft','Pipiko','squirrel',['#7a8ad0','#f2d04a','#eef0fa'],['thunder','regrowth','stormcloud','pounce']],
   ['stripel','Tigera','tiger',['#e8c87a','#d87a2a','#fff6e0'],['bolt','stormcloud','spark','double']],
   ['shadestripe','Panthera','tiger',['#f4f2f2','#c4231c','#ffffff'],['zap','flicker','cripple','sweaty']],
   ['voltiger','Tigermon','tiger',['#f28a2a','#2b2216','#fff2e0'],['thunder','manaheal','aircurrent','roots']],
   ['frostrype','Tigerix','tiger',['#c8f24a','#7a5ab8','#f6ffd8'],['shock','poison','lshield','pounce']],
   ['trunkle','Elephia','elephant',['#a8a8b0','#3a8ad8','#eceef2'],['bubble','camelback','hydrate','grounded']],
   ['tuskmoor','Elephoro','elephant',['#f28ad0','#6a3a8a','#fdeaf6'],['mshield','thunder','absorb','thickskin']],
   ['mammoss','Elephera','elephant',['#a8aaa8','#6a9a3a','#eef0ea'],['blizzard','natureswill','bubble','double']],
   ['quakeph','Elephury','elephant',['#8ab0d0','#d83a2a','#eaf2fa'],['manaheal','flicker','wave','pounce']],
   ['zephyra','Chikamon','wing',['#f2e04a','#5ab83a','#fffbe0'],['firefocus','zap','burn','sweaty']],
   ['gustling','Chikaru','wing',['#6a6a72','#d8b23a','#c8c8d0'],['emberspit','leech','blast','double']],
   ['featherby','Chikazon','wing',['#3ae8b0','#d84ad8','#e8fff6'],['furyfist','bubble','moltencore','roots']],
   ['squallix','Chikaki','wing',['#f4f4f8','#2a6ad8','#ffffff'],['firewall','flame','fshield','thickskin']],
   ['emberling','Furymon','drake',['#3a6ad8','#f2d04a','#e8eefa'],['blast','charge','burn','double']],
   ['magmaw','Furydon','drake',['#e8342a','#f28a2a','#ffe8d8'],['flame','hardened','fshield','thickskin']],
   ['scorchet','Furyia','drake',['#3fbf3a','#2a8a2a','#e8f8d8'],['furyfist','firefocus','emberspit','pounce']],
   ['pyrodrake','Furyzon','drake',['#6a4a8a','#c8f24a','#e8e0f2'],['firewall','flicker','moltencore','grounded']],
   ['leafwing','Minnie','bug',['#d8282a','#f2d04a','#fff0e0'],['moltencore','burn','firefocus','thickskin']],
   ['thornet','Uberlord','bug',['#2a5a5e','#e8c83a','#a8c8c8'],['nshield','poison','naturespower','feedback']],
   ['mossbug','Algonzo','bug',['#f2b82a','#d8282a','#fff4d0'],['feedback','leech','feed','roots']],
   ['buzzlet','Hunnybee','bug',['#c8f23a','#2b2216','#f6ffd8'],['double','bubble','pounce','lshield']]];
  const order=[];
  MK.forEach(([id,n,fam,col,sk])=>{ const s=SPI[id]; if(!s) return; Object.assign(s,{n,fam,col,sk:sk.filter(k=>SK[k])}); order.push(s); });
  // monsters that aren't in Monster Kingdom stay with players who own them, but no longer appear anywhere new
  ['pengu','ram','frog','lizard'].forEach(f=>SP.forEach(s=>{ if(s.fam===f) s.legacy=1; }));
  const rest=SP.filter(s=>!order.includes(s)); SP.length=0; order.concat(rest).forEach(s=>SP.push(s));
  Object.assign(FAM.hound,{base:{hp:80,atk:15,mp:44,spd:11}}); Object.assign(FAM.shell,{base:{hp:79,atk:15,mp:45,spd:8}}); Object.assign(FAM.volt,{base:{hp:71,atk:17,mp:45,spd:14}});
  // MK zone order: Mochi Beach (Turtle), Felis Desert (Feline), Luna Woods (Cerberus), Sora Grasslands (Squirrel),
  // Peppermint Forest (Tiger), Earthshaker Cliffs (Elephant), Vernon Village (Avian), Bolera Volcano (Dragon)
  const PLAN=[['meadow','Training Camp',1],['beach','Mochi Beach',4],['desert','Felis Desert',8],['hollow','Luna Woods',12],['grasslands','Sora Grasslands',16],
              ['mintwood','Peppermint Forest',20],['cliffs','Earthshaker Cliffs',23],['peaks','Vernon Village',26],['volcano','Bolera Volcano',28]];
  const byId={}; ZONES.forEach(z=>byId[z.id]=z);
  const next=PLAN.map(([id,n,lv])=>{ const z=byId[id]; if(!z) return null; const old=z.lv;
    if(old!==lv&&ZTASKS[id]) ZTASKS[id]=ZTASKS[id].map(t=>{ const u=t.slice(); const r=lv/old; u[2]=Math.max(1,Math.min(lv+3,lv+(t[2]-old))); u[4]=Math.round(t[4]*r); u[5]=Math.round(t[5]*r);
      if(u[3]&&typeof u[3]==='object'){ u[3]=Object.assign({},u[3]); ['mp','hp','atk'].forEach(k=>{ if(u[3][k]) u[3][k]=Math.round(u[3][k]*r); }); } return u; });
    return Object.assign(z,{n,lv}); }).filter(Boolean);
  ZONES.length=0; next.forEach(z=>ZONES.push(z));
  zoneUnlocked=function(i){ if(!ZONES[i]) return false; return i===0 || (S.zones[ZONES[i-1].id]||0)>=4 || (S.zones[ZONES[i].id]||0)>0; };
  try{ if(S&&S.lastZone!=null&&!ZONES[S.lastZone]) S.lastZone=null; }catch(_){}
  const q12=QUESTS.find(q=>q.id==='q12'); if(q12) q12.n='Clear Sora Grasslands';
  const prevEgg=EGGSP; EGGSP=function(){ return prevEgg().filter(s=>!s.legacy); };
})();
// ---------- MK level-10 numbers from in-game screenshots ----------
(function(){ const P=(a,t)=>[a,+((t-a)/9).toFixed(4)];
  Object.assign(SK.burn,{tick:P(10,72), turns:4, mp:P(20,64), desc:'Burns your opponent over {turns} turns, dealing {tick} damage each turn. Penetrates shields.'});
  Object.assign(SK.flame,{dmg:null, pctCur:P(.1,.31), noCrit:1, burnBonus:0, mp:P(15,82), desc:"Casts a deadly flame that deals {pct} of the target's current life in damage. Does not critical hit."});
  Object.assign(SK.thunder,{dmg:P(30,143), stun:P(.15,.4), mp:P(24,128), desc:'Powerful attack that deals {dmg} lightning damage and has a {stun} chance to stun the enemy for one turn.'});
  Object.assign(SK.flicker,{v:P(.15,.35), turns:4, mp:P(14,83), desc:'Gives you a chance to evade attacks by {v} for {turns} turns.'});
  Object.assign(SK.firefocus,{v:P(.2,.9), turns:4, mp:P(12,80)});
  Object.assign(SK.blast,{dmg:P(22,219), mp:P(16,129), pierce:0, desc:'Hurls a fiery blast, dealing {dmg} fire damage.'});
  SK.souldrain={n:'Soul Drain', el:'nature', t:'enemy', k:'dot', dot:'soul', tick:P(12,70), heal:P(11,68), turns:4, mp:P(14,83),
    desc:"Poison your enemy's soul for {turns} turns, dealing {tick} damage and healing yourself for {heal} each turn. Penetrates shields."};
  ['burn','flame','thunder','flicker','firefocus','blast','souldrain'].forEach(k=>{ DEFAULT_SK[k]=JSON.parse(JSON.stringify(SK[k])); });
  ST_ICON.soul=['swirl','#2fa84f']; BUFF_N.soul='Soul Drain';
  stDesc=(function(prev){ return function(m,k){ if(k==='soul') return `Takes ${Math.round(m.st.soulD||0)} damage each turn and heals the caster ${m.st.soulH||0} (${m.st.soul} turn${m.st.soul>1?'s':''})`; return prev(m,k); }; })(stDesc);
  const MKD=['burn','flame','thunder','flicker','blast','souldrain'];
  skillDesc=(function(prev){ return function(id,L){ const s=SK[id]; L=L||1; if(!MKD.includes(id)||!s||!s.desc) return prev(id,L); const pc=v=>Math.round(v*100)+'%', n=v=>Math.round(lv(v,L));
    let t=s.desc; if(s.tick) t=t.replace('{tick}',n(s.tick)); if(s.heal) t=t.replace('{heal}',n(s.heal)); if(s.dmg) t=t.replace('{dmg}',n(s.dmg)); if(s.stun) t=t.replace('{stun}',pc(lv(s.stun,L)));
    if(s.pctCur) t=t.replace('{pct}',pc(lv(s.pctCur,L))); if(s.v) t=t.replace('{v}',pc(lv(s.v,L))); return t.replace('{turns}',s.turns||''); }; })(skillDesc);
  // item level requirements from MK's equip screen
  Object.assign(ITEMS.vest,{lv:10}); Object.assign(ITEMS.diploma,{lv:10}); Object.assign(ITEMS.blade,{lv:10});
  Object.assign(ITEMS.hydrant,{lv:17}); Object.assign(ITEMS.gauntlets,{lv:17}); Object.assign(ITEMS.flamethrower,{lv:17});
  // General Krill's creation: Firescream guards Vernon Village
  FAM.krill={n:'Avian', el:'neutral', shape:'bird', base:{hp:84,atk:17,mp:58,spd:15}};
  const fs={id:'firescream',n:'Firescream',fam:'krill',col:['#5ab0e8','#e85a2a','#e8f4fc'],tw:{},sk:['burn','flame','thunder','spark'],boss:1};
  SP.push(fs); SPI.firescream=fs; ATK_MOUTH.krill=ATK_MOUTH.wing||ATK_MOUTH.bird;
})();
var ZBOSS={peaks:'firescream'};
// ---------- Warhog: rare monster (shop only, 50 mushrooms) with Warcry ----------
(function(){ const P=(a,t)=>[a,+((t-a)/9).toFixed(4)];
  SK.warcry={n:'Warcry', el:'neutral', t:'self', k:'buff', buff:'wdef', v:P(.05,.23), wcry:P(.12,.4), turns:4, mp:P(15,60),
    desc:"A bellowing warcry which reduces your enemy's physical attack by {wcry} and raises your own physical defense by {v} for {turns} turns."};
  DEFAULT_SK.warcry=JSON.parse(JSON.stringify(SK.warcry));
  ICON.mkwarcry='<path d="M5 9.5h3.2L13.6 5v14l-5.4-4.5H5Z" fill="#fff"/><path d="M16 8.2q2.4 3.8 0 7.6M18.4 6.2q3.8 5.8 0 11.6" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/>';
  skIconKey=(function(prev){ return function(id){ return id==='warcry'?'mkwarcry':prev(id); }; })(skIconKey);
  ST_ICON.wdef=['mkwarcry','#e8501e']; ST_ICON.wcry=['mkwarcry','#e8501e']; BUFF_N.wdef='Warcry'; BUFF_N.wcry='Warcry';
  stDesc=(function(prev){ return function(m,k){ const T=t=>`${t} turn${t>1?'s':''}`, p=v=>Math.round((v||0)*100)+'%';
    if(k==='wdef') return `Takes ${p(m.st.wdefV)} less physical damage (${T(m.st.wdef)})`; if(k==='wcry') return `Deals ${p(m.st.wcryV)} less physical damage (${T(m.st.wcry)})`; return prev(m,k); }; })(stDesc);
  skillDesc=(function(prev){ return function(id,L){ if(id!=='warcry') return prev(id,L); const s=SK.warcry, pc=v=>Math.round(lv(v,L||1)*100)+'%'; return s.desc.replace('{wcry}',pc(s.wcry)).replace('{v}',pc(s.v)).replace('{turns}',s.turns); }; })(skillDesc);
  FAM.warhog={n:'Rare', el:'neutral', shape:'warhog', base:{hp:84,atk:16,mp:52,spd:11}};
  const sp={id:'warhog',n:'Warhog',fam:'warhog',col:['#f07aa0','#3ab8c8','#fff0f4'],tw:{},sk:['warcry','trample','devour','pounce'],rare:1};
  SP.push(sp); SPI.warhog=sp; ATK_MOUTH.warhog=[1.4,2,1];
  function warhogNew(c1,c2,c3,st,id){ const G=id+'a', dk=shade(c1,-30); let d=`<defs>${grad(G,c1)}</defs>`, g='';
    g+=`<path d="M17 60 q-6 -2 -6 4 q2 3 5 0" fill="none" stroke="${OL3}" stroke-width="2.2" stroke-linecap="round"/>`;
    g+=leg3(28,72,26,82,26,90,6.6,dk)+leg3(52,72,54,82,54,90,6.6,dk);
    g+=`<path d="M16 64 Q14 46 34 42 Q56 38 66 50 Q72 62 64 72 Q44 80 24 74Z" fill="url(#${G})" ${s3}/>`;
    for(let k=0;k<3+st;k++){ const x=26+k*9; g+=`<path d="M${x} 46 q4 12 0 26" fill="none" stroke="${c2}" stroke-width="3" stroke-linecap="round" opacity=".85"/>`; }
    const mh=6+st*3; g+=`<path d="M24 46 Q30 ${38-mh} 38 ${42-mh*.6} Q44 ${34-mh} 50 ${40-mh*.6} Q58 ${34-mh*.8} 62 44 Q46 40 24 46Z" fill="${c2}" ${s3}/>`;
    if(st>=1) g+=`<path d="M34 50 Q24 42 18 50 Q24 56 34 54Z" fill="#f4f0e4" ${s3} stroke-width="1.6"/>`;
    g+=leg3(33,74,32,83,32,90,7,`url(#${G})`,1)+leg3(58,72,60,82,61,90,7,`url(#${G})`,1);
    const hx=72, hy=56;
    g+=`<path d="M${hx-12} ${hy-8} Q${hx-6} ${hy-16} ${hx+6} ${hy-12} Q${hx+16} ${hy-6} ${hx+16} ${hy+4} Q${hx+14} ${hy+12} ${hx+2} ${hy+12} Q${hx-10} ${hy+10} ${hx-12} ${hy-8}Z" fill="url(#${G})" ${s3}/>`;
    g+=`<path d="M${hx-6} ${hy-12} l-3 -8 l7 5Z" fill="${c1}" ${s3} stroke-width="1.6"/>`;
    g+=`<ellipse cx="${hx+14}" cy="${hy+5}" rx="5" ry="4.4" fill="${c3}" ${s3} stroke-width="1.6"/><circle cx="${hx+13}" cy="${hy+4}" r="1" fill="${OL3}"/><circle cx="${hx+16}" cy="${hy+4.6}" r="1" fill="${OL3}"/>`;
    const tl=6+st*4; g+=`<path d="M${hx+8} ${hy+8} Q${hx+14+tl*.4} ${hy+8+tl*.3} ${hx+12+tl*.5} ${hy-tl*.6}" fill="none" stroke="${OL3}" stroke-width="5.2" stroke-linecap="round"/><path d="M${hx+8} ${hy+8} Q${hx+14+tl*.4} ${hy+8+tl*.3} ${hx+12+tl*.5} ${hy-tl*.6}" fill="none" stroke="#fff8e8" stroke-width="3" stroke-linecap="round"/>`;
    g+=eye3(hx+4,hy-3,st===0?3.8:3.3,'#3a2a1a',st,4);
    return d+g; }
  monSVG=(function(prev){ return function(spId,lvl,cls){ const s=SPI[spId]; if(!s||s.fam!=='warhog') return prev(spId,lvl,cls);
    const st=stageOf(lvl); const c1=mute(s.col[0],22), c2=mute(s.col[1],12), c3=mute(s.col[2],10); const id='m'+(GID++); const sc=[0.82,0.92,1][st];
    return `<svg class="${cls||''}" viewBox="-4 0 108 100"><g transform="translate(50 92) scale(${sc}) translate(-50 -92)">${warhogNew(c1,c2,c3,st,id)}</g></svg>`; }; })(monSVG);
})();
// ---------- Hozi: rare decorated monkey (shop only, 50 mushrooms) ----------
(function(){
  FAM.hozi={n:'Rare', el:'nature', shape:'monkey', base:{hp:76,atk:14,mp:50,spd:13}};
  const sp={id:'hozi',n:'Hozi',fam:'hozi',col:['#b07a5a','#d84ac8','#f6dcc8'],tw:{},sk:['souldrain','poison','purge','sweaty'].filter(k=>SK[k]),rare:1};
  SP.push(sp); SPI.hozi=sp; ATK_MOUTH.monkey=[1.2,1.8,.9];
  function monkeyNew(c1,c2,c3,st,id){ const G=id+'a', dk=shade(c1,-28); let d=`<defs>${grad(G,c1)}</defs>`, g='';
    const tl=`M38 80 Q18 84 16 70 Q14 58 24 58 Q30 60 26 66 Q22 70 26 72`;
    g+=`<path d="${tl}" fill="none" stroke="${OL3}" stroke-width="6.4" stroke-linecap="round"/><path d="${tl}" fill="none" stroke="${c1}" stroke-width="3.6" stroke-linecap="round"/>`;
    if(st>=2){ g+=`<path d="M40 56 Q22 38 14 46 Q20 50 18 56 Q26 54 28 62 Q34 56 40 62Z" fill="#5fc8e8" ${s3} stroke-width="1.8"/><path d="M60 56 Q78 38 86 46 Q80 50 82 56 Q74 54 72 62 Q66 56 60 62Z" fill="#5fc8e8" ${s3} stroke-width="1.8"/>`; }
    g+=leg3(44,80,42,86,40,91,5.6,dk)+leg3(56,80,58,86,60,91,5.6,dk);
    g+=`<path d="M38 82 Q34 60 50 56 Q66 60 62 82 Q50 88 38 82Z" fill="url(#${G})" ${s3}/><ellipse cx="50" cy="72" rx="8" ry="10" fill="${c3}" opacity=".9"/>`;
    g+=`<path d="M38 62 Q30 66 32 76" fill="none" stroke="${OL3}" stroke-width="6.4" stroke-linecap="round"/><path d="M38 62 Q30 66 32 76" fill="none" stroke="${c1}" stroke-width="3.8" stroke-linecap="round"/>`;
    g+=`<path d="M62 62 Q70 66 68 76" fill="none" stroke="${OL3}" stroke-width="6.4" stroke-linecap="round"/><path d="M62 62 Q70 66 68 76" fill="none" stroke="${c1}" stroke-width="3.8" stroke-linecap="round"/>`;
    g+=`<rect x="29.5" y="69" width="5" height="3" rx="1" fill="#f2c84a" stroke="${OL3}" stroke-width="1"/><rect x="65.5" y="69" width="5" height="3" rx="1" fill="#f2c84a" stroke="${OL3}" stroke-width="1"/>`;
    [42,46,50,54,58].forEach((x,k)=>{ g+=`<circle cx="${x}" cy="${60+Math.abs(k-2)*-1+2}" r="1.9" fill="${['#5fc8e8','#f2c84a',c2,'#f2c84a','#5fc8e8'][k]}" stroke="${OL3}" stroke-width=".8"/>`; });
    const hx=50, hy=42;
    g+=`<circle cx="${hx-14}" cy="${hy}" r="5.4" fill="url(#${G})" ${s3}/><circle cx="${hx-14}" cy="${hy}" r="2.8" fill="${c3}"/><circle cx="${hx+14}" cy="${hy}" r="5.4" fill="url(#${G})" ${s3}/><circle cx="${hx+14}" cy="${hy}" r="2.8" fill="${c3}"/>`;
    g+=`<ellipse cx="${hx}" cy="${hy}" rx="12.5" ry="11.5" fill="url(#${G})" ${s3}/><path d="M${hx-9} ${hy-1} Q${hx-9} ${hy-7} ${hx-3} ${hy-6} Q${hx} ${hy-4} ${hx+3} ${hy-6} Q${hx+9} ${hy-7} ${hx+9} ${hy-1} Q${hx+9} ${hy+9} ${hx} ${hy+9} Q${hx-9} ${hy+9} ${hx-9} ${hy-1}Z" fill="${c3}" ${s3} stroke-width="1.4"/>`;
    g+=`<path d="M${hx-3} ${hy+5} Q${hx} ${hy+7} ${hx+3} ${hy+5}" fill="none" stroke="${OL3}" stroke-width="1.3" stroke-linecap="round"/><circle cx="${hx-1.5}" cy="${hy+2.5}" r=".8" fill="${OL3}"/><circle cx="${hx+1.5}" cy="${hy+2.5}" r=".8" fill="${OL3}"/>`;
    const nf=2+st*2; for(let k=0;k<nf;k++){ const a=(-90+(k-(nf-1)/2)*(70/Math.max(1,nf-1)))*Math.PI/180, len=10+st*3, x0=hx+Math.cos(a)*9, y0=hy-8+Math.sin(a)*2, x1=hx+Math.cos(a)*(9+len), y1=hy-8+Math.sin(a)*len;
      g+=`<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} Q${((x0+x1)/2-3).toFixed(1)} ${((y0+y1)/2).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)} Q${((x0+x1)/2+3).toFixed(1)} ${((y0+y1)/2).toFixed(1)} ${x0.toFixed(1)} ${y0.toFixed(1)}Z" fill="${[c2,'#5fc8e8','#f2c84a'][k%3]}" ${s3} stroke-width="1.2"/>`; }
    g+=`<path d="M${hx-10} ${hy-8} Q${hx} ${hy-12} ${hx+10} ${hy-8}" fill="none" stroke="#f2c84a" stroke-width="3" stroke-linecap="round"/><path d="M${hx-10} ${hy-8} Q${hx} ${hy-12} ${hx+10} ${hy-8}" fill="none" stroke="${OL3}" stroke-width=".8" stroke-dasharray="2 2"/>`;
    g+=`<path d="M${hx-7} ${hy-3} l3 1.4 M${hx+7} ${hy-3} l-3 1.4" stroke="#5fc8e8" stroke-width="1.6" stroke-linecap="round"/>`;
    g+=eye3(hx-4.5,hy-1,st===0?3.4:3,'#3a2a1a',st,-3)+eye3(hx+4.5,hy-1,st===0?3.4:3,'#3a2a1a',st,3);
    return d+g; }
  monSVG=(function(prev){ return function(spId,lvl,cls){ const s=SPI[spId]; if(!s||s.fam!=='hozi') return prev(spId,lvl,cls);
    const st=stageOf(lvl); const c1=mute(s.col[0],22), c2=mute(s.col[1],12), c3=mute(s.col[2],10); const id='m'+(GID++); const sc=[0.82,0.92,1][st];
    return `<svg class="${cls||''}" viewBox="-4 0 108 100"><g transform="translate(50 92) scale(${sc}) translate(-50 -92)">${monkeyNew(c1,c2,c3,st,id)}</g></svg>`; }; })(monSVG);
})();
// ---------- Profile icons: our own set in the spirit of MK's (trainers, story characters, monster portraits) ----------
(function(){
  const OL='#2a1d16';
  const BG=[['#fff04a','#3fbf3a'],['#3fd0ff','#2fbf5a'],['#ff7ad8','#ffe04a'],['#ffe04a','#ff8a2a'],['#6ae0ff','#3a6ad8'],['#b8f04a','#2a9a4a'],['#ff5a7a','#7a2ad8'],['#ffd84a','#c8461a'],
            ['#5ae8c8','#2a7ab8'],['#e8a8ff','#5a3ab8'],['#ffb84a','#e8342a'],['#9be15d','#1f7a3a']];
  const frame=(bg,inner,id)=>`<svg viewBox="0 0 80 80"><defs><linearGradient id="ib${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>
    <rect width="80" height="80" fill="#fff"/><rect x="4" y="4" width="72" height="72" rx="3" fill="url(#ib${id})" stroke="${OL}" stroke-width="2"/>
    <g clip-path="inset(0)"><svg x="4" y="4" width="72" height="72" viewBox="0 0 80 80">${inner}</svg></g><rect x="4" y="4" width="72" height="72" rx="3" fill="none" stroke="${OL}" stroke-width="2"/></svg>`;
  // a person: skin, hair colour + style, shirt, and optional extras
  function person(o){ const sk=o.skin, h=o.hair||'#2a1a12', dk=shade(sk,-20); let back='', front='', top='';
    const hs=o.hs||'short';
    if(hs==='long') back=`<path d="M17 46 Q14 16 40 14 Q66 16 63 46 L66 76 Q54 70 52 58 L28 58 Q26 70 14 76Z" fill="${h}" stroke="${OL}" stroke-width="2"/>`;
    if(hs==='bun') back=`<circle cx="40" cy="12" r="9" fill="${h}" stroke="${OL}" stroke-width="2"/>`;
    if(hs==='pony') back=`<path d="M58 30 Q74 34 70 60 Q66 50 60 46Z" fill="${h}" stroke="${OL}" stroke-width="2"/>`;
    if(hs==='short') front=`<path d="M21 38 Q20 18 40 17 Q60 18 59 38 Q56 27 48 26 Q40 30 30 26 Q24 28 21 38Z" fill="${h}" stroke="${OL}" stroke-width="2"/>`;
    if(hs==='spiky') front=`<path d="M20 38 L18 22 L26 26 L28 12 L36 22 L42 8 L46 22 L56 12 L56 26 L64 22 L60 38 Q52 27 40 28 Q28 27 20 38Z" fill="${h}" stroke="${OL}" stroke-width="2" stroke-linejoin="round"/>`;
    if(hs==='messy') front=`<path d="M19 40 Q14 22 26 16 Q32 8 44 12 Q58 10 62 24 Q66 32 60 40 Q56 30 48 30 Q44 24 36 30 Q28 28 19 40Z" fill="${h}" stroke="${OL}" stroke-width="2"/>`;
    if(hs==='long'||hs==='bun'||hs==='pony') front=`<path d="M22 38 Q24 19 40 19 Q56 19 58 38 Q52 26 42 27 Q34 26 22 38Z" fill="${h}" stroke="${OL}" stroke-width="2"/>`;
    if(hs==='bald') front=`<path d="M22 38 Q22 30 24 28 M58 38 Q58 30 56 28" stroke="${h}" stroke-width="4"/>`;
    if(o.hat==='straw') top=`<path d="M6 30 L40 8 L74 30 Q40 26 6 30Z" fill="#f2dc9a" stroke="${OL}" stroke-width="2"/><path d="M22 22 Q40 18 58 22" stroke="#c8461a" stroke-width="3" fill="none"/>`;
    if(o.hat==='helm') top=`<path d="M19 40 Q16 12 40 10 Q64 12 61 40 L56 40 Q56 24 40 22 Q24 24 24 40Z" fill="#c8b25a" stroke="${OL}" stroke-width="2"/><path d="M36 10 Q40 0 46 4 Q52 8 54 16 Q48 8 40 10" fill="#e3262d" stroke="${OL}" stroke-width="1.6"/>`;
    if(o.hat==='cap') top=`<path d="M20 30 Q20 14 40 14 Q60 14 60 30Z" fill="${o.capc||'#e3262d'}" stroke="${OL}" stroke-width="2"/><path d="M40 30 L70 30 Q66 36 40 34Z" fill="${shade(o.capc||'#e3262d',-20)}" stroke="${OL}" stroke-width="2"/>`;
    if(o.hat==='officer') top=`<path d="M16 26 Q40 6 64 26 L60 32 L20 32Z" fill="#7a2a1e" stroke="${OL}" stroke-width="2"/><rect x="20" y="28" width="40" height="6" fill="#1a1a1a" stroke="${OL}" stroke-width="1.6"/><circle cx="40" cy="20" r="3.6" fill="#f2c84a" stroke="${OL}" stroke-width="1.2"/>`;
    if(o.hat==='wizard') top=`<path d="M18 30 L40 0 L62 30Z" fill="#5a3ab8" stroke="${OL}" stroke-width="2"/><path d="M12 30 Q40 24 68 30 Q40 36 12 30Z" fill="#7a5ad8" stroke="${OL}" stroke-width="2"/><circle cx="38" cy="18" r="2" fill="#ffe04a"/>`;
    let face=`<path d="M10 82 Q12 64 40 62 Q68 64 70 82Z" fill="${o.shirt||'#2f62d8'}" stroke="${OL}" stroke-width="2"/>`+(o.coat?`<path d="M30 63 L40 82 L50 63" fill="#fff" stroke="${OL}" stroke-width="1.6"/>`:`<path d="M33 62 L40 70 L47 62" fill="none" stroke="#fff" stroke-width="2"/>`)
      +`<rect x="34" y="52" width="12" height="12" rx="4" fill="${dk}" stroke="${OL}" stroke-width="1.6"/>`
      +`<ellipse cx="22" cy="42" rx="4" ry="5" fill="${sk}" stroke="${OL}" stroke-width="1.6"/><ellipse cx="58" cy="42" rx="4" ry="5" fill="${sk}" stroke="${OL}" stroke-width="1.6"/>`
      +`<ellipse cx="40" cy="40" rx="17" ry="19" fill="${sk}" stroke="${OL}" stroke-width="2"/>`;
    if(o.beard) face+=`<path d="M23 44 Q24 70 40 72 Q56 70 57 44 Q52 54 40 55 Q28 54 23 44Z" fill="${o.beard}" stroke="${OL}" stroke-width="1.6"/>`;
    face+=`<ellipse cx="33.5" cy="40" rx="2.4" ry="2.8" fill="#1c1410"/><ellipse cx="46.5" cy="40" rx="2.4" ry="2.8" fill="#1c1410"/><circle cx="34.3" cy="39" r=".8" fill="#fff"/><circle cx="47.3" cy="39" r=".8" fill="#fff"/>`
      +`<path d="M30 34.5 Q33.5 ${o.angry?35.5:32.5} 37 ${o.angry?36:34} M43 ${o.angry?36:34} Q46.5 ${o.angry?35.5:32.5} 50 34.5" stroke="${shade(h,-10)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
      +`<path d="M40 41 Q38.5 46 41 46.5" stroke="${shade(sk,-35)}" stroke-width="1.3" fill="none"/>`;
    if(o.must) face+=`<path d="M30 50 Q35 46 40 49 Q45 46 50 50 Q46 53 40 51 Q34 53 30 50Z" fill="${o.must}" stroke="${OL}" stroke-width="1.2"/>`;
    else face+=`<path d="M34 50 Q40 ${o.angry?49:55} 46 50" stroke="${OL}" stroke-width="1.8" fill="${o.f?'#c8505a':'none'}" stroke-linecap="round"/>`;
    if(o.glasses) face+=`<rect x="28" y="36" width="10" height="8" rx="2" fill="${o.glasses}" fill-opacity=".25" stroke="${OL}" stroke-width="1.6"/><rect x="42" y="36" width="10" height="8" rx="2" fill="${o.glasses}" fill-opacity=".25" stroke="${OL}" stroke-width="1.6"/><path d="M38 40h4" stroke="${OL}" stroke-width="1.6"/>`;
    if(o.goggles) face+=`<path d="M20 30 Q40 24 60 30" stroke="#5a3a1e" stroke-width="3.4" fill="none"/><circle cx="32" cy="30" r="5" fill="#9be6ff" stroke="${OL}" stroke-width="1.6"/><circle cx="48" cy="30" r="5" fill="#9be6ff" stroke="${OL}" stroke-width="1.6"/>`;
    if(o.band) face+=`<path d="M22 30 Q40 25 58 30" stroke="${o.band}" stroke-width="4" fill="none"/>`;
    return back+face+front+top; }
  function robot(c){ return `<path d="M12 82 Q14 64 40 62 Q66 64 68 82Z" fill="#7a8a9a" stroke="${OL}" stroke-width="2"/><rect x="34" y="52" width="12" height="12" fill="#5a6a7a" stroke="${OL}" stroke-width="1.6"/>
    <rect x="20" y="20" width="40" height="36" rx="6" fill="${c}" stroke="${OL}" stroke-width="2"/><rect x="25" y="28" width="30" height="14" rx="4" fill="#1a2430" stroke="${OL}" stroke-width="1.6"/>
    <circle cx="33" cy="35" r="3.4" fill="#ffe04a"/><circle cx="47" cy="35" r="3.4" fill="#ffe04a"/><path d="M30 48h20" stroke="${OL}" stroke-width="2"/><path d="M40 20 V10" stroke="${OL}" stroke-width="2"/><circle cx="40" cy="9" r="3" fill="#e3262d" stroke="${OL}" stroke-width="1.4"/>`; }
  const monPort=(sp,lvl)=>{ const s=monSVG(sp,lvl); return s.replace('<svg class="','<svg x="-4" y="2" width="88" height="82" preserveAspectRatio="xMidYMid meet" class="'); };
  const S1='#f6d7c3',S2='#eec19f',S3='#d9a074',S4='#b97a4f',S5='#8d5a36',S6='#5e3b22';
  const H=[ // people
    {skin:S1,hair:'#a0622a',hs:'short',shirt:'#2f62d8'}, {skin:S5,hair:'#1a1a1a',hs:'short',shirt:'#30a05a'}, {skin:S2,hair:'#1a1a1a',hs:'spiky',shirt:'#f2a91a'},
    {skin:S1,hair:'#c8461a',hs:'messy',shirt:'#e0475b',glasses:'#9be6ff'}, {skin:S1,hair:'#f2d06a',hs:'long',shirt:'#e07ad8',f:1}, {skin:S4,hair:'#2a1a2a',hs:'long',shirt:'#7a5ad8',f:1},
    {skin:S2,hair:'#8a3a1e',hs:'pony',shirt:'#1f9e8f',f:1}, {skin:S3,hair:'#1a1a1a',hs:'messy',shirt:'#3a3a44',glasses:'#5fd36a'}, {skin:S6,hair:'#1a1a1a',hs:'bald',shirt:'#f2a91a'},
    {skin:S1,hair:'#5fd36a',hs:'long',shirt:'#e07ad8',f:1,band:'#ffe04a'}, {skin:S2,hair:'#c8461a',hs:'pony',shirt:'#5a6a7a',f:1,goggles:1},
    {skin:S1,hair:'#3a2418',hs:'short',shirt:'#2a4a7a',hat:'straw'}, {skin:S2,hair:'#2a1a12',hs:'bald',shirt:'#7a2a1e',hat:'officer',must:'#2a1a12',angry:1},
    {skin:S1,hair:'#d8d8d8',hs:'bald',shirt:'#fff',coat:1,glasses:'#9be6ff',beard:'#e8e8e8'}, {skin:S2,hair:'#e8e8e8',hs:'bald',shirt:'#5a3ab8',hat:'wizard',beard:'#f2f2f2'},
    {skin:S3,hair:'#2a1a12',hs:'short',shirt:'#c8b25a',hat:'helm',angry:1}, {skin:S2,hair:'#7a5a3a',hs:'short',shirt:'#e3262d',hat:'cap',capc:'#2f62d8'},
    {skin:S1,hair:'#e07ad8',hs:'bun',shirt:'#30a05a',f:1,glasses:'#e07ad8'}, {skin:S5,hair:'#f2d06a',hs:'spiky',shirt:'#1f9e8f'}];
  const M=['shellby','thundra','ashfang','acorvolt','stripel','tuskmoor','squallix','magmaw','leafwing','firescream','elric','warhog','hozi','cloudtuft','featherby','pyrodrake','tidepip','frostrype'];
  window.ICONS=[]; H.forEach((o,i)=>ICONS.push(()=>frame(BG[i%BG.length],person(o),'h'+i)));
  ICONS.splice(14,0,()=>frame(BG[4],robot('#c8d2dc'),'r1')); ICONS.splice(9,0,()=>frame(BG[7],robot('#f2a91a'),'r2'));
  M.filter(id=>SPI[id]).forEach((id,i)=>ICONS.push(()=>frame(BG[(i+3)%BG.length],monPort(id,MAXLVL),'m'+i)));
  const cache={}; window.iconSVG=i=>cache[i]||(cache[i]=ICONS[i]?ICONS[i]():ICONS[0]());
  const pS=sanitizeAv; sanitizeAv=function(a){ if(a&&a.t==='icon') return {t:'icon',i:Math.max(0,Math.min(ICONS.length-1,a.i|0))}; return pS(a); };
  const pA=avatarSVG; avatarSVG=function(a){ const s=sanitizeAv(a); if(s&&s.t==='icon') return iconSVG(s.i); return pA(a); };
  const pM=myAvatar; myAvatar=function(){ const a=sanitizeAv(S.avatar); if(a&&a.t==='icon') return a; return {t:'icon',i:0}; };
  openAvatar=function(){ const sh=sheet(`<div class="avpick"></div>`);
    const draw=()=>{ const cur=myAvatar();
      sh.body.querySelector('.avpick').innerHTML=`<h2 class="game-h">Profile Picture</h2><div class="avgrid icons">${ICONS.map((_,i)=>`<button class="avo ic2 ${cur.i===i?'sel':''}" data-i="${i}">${iconSVG(i)}</button>`).join('')}</div>`;
      sh.body.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{ S.avatar={t:'icon',i:+b.dataset.i}; persist(); renderHUD(); NET.updatePresence&&NET.updatePresence(); draw(); }); };
    draw(); return sh; };
})();
// ---------- zone runs: missions show done/not done for the current run; beating the boss starts the next run ----------
function zoneRun(id){ S.trun=S.trun||{}; if(!S.trun[id]) S.trun[id]=(S.zones[id]||0)>=4?2:1; return S.trun[id]; }
function runDone(id){ S.tdr=S.tdr||{}; if(!S.tdr[id]){ S.tdr[id]=[]; if(zoneRun(id)===1&&S.tdone&&S.tdone[id]) S.tdone[id].forEach((v,k)=>{ if(v) S.tdr[id][k]=1; }); } return S.tdr[id]; }
taskDone=function(zi,k){ const id=ZONES[zi]&&ZONES[zi].id; if(!id) return false; return runDone(id)[k]===zoneRun(id); };
taskProg=(function(prev){ return function(zi){ const id=ZONES[zi].id, tl=taskList(zi); const p=S.tasks&&S.tasks[id]?S.tasks[id].slice():null;
  const before=p?tl.map((t,k)=>p[k]>=t.reps):[]; const r=prev(zi);
  // prev() resets finished missions to 0; record those as done in this run
  const run=zoneRun(id), d=runDone(id); let bossDone=false;
  tl.forEach((t,k)=>{ if(before[k]&&r[k]===0){ d[k]=run; if(t.t==='boss') bossDone=true; } });
  if(bossDone){ S.trun[id]=run+1; } return r; }; })(taskProg);
drawTasks=(function(prev){ return function(){ prev(); if(!TASKSH) return; const zi=TASKSH.zi, z=ZONES[zi], tl=taskList(zi), cards=TASKSH.sh.body.querySelectorAll('.tlist .task'), run=zoneRun(z.id);
  tl.forEach((t,k)=>{ const c=cards[k]; if(!c) return; const done=taskDone(zi,k); c.classList.toggle('tdone',done);
    const chip=c.querySelector('.tchk'); if(chip) chip.textContent=done?'✓ Done':''; if(chip&&!done) chip.remove();
    if(done){ if(!c.querySelector('.tchk')){ const h=c.querySelector('.t-h'); h&&h.insertAdjacentHTML('beforeend','<span class="tchk">✓ Done</span>'); }
      const bar=c.querySelector('.t-prog i'), em=c.querySelector('.t-prog em'); if(bar) bar.style.width='100%'; if(em) em.textContent=`${t.reps} / ${t.reps}`; } });
  const f=TASKSH.sh.body.querySelector('.zfoot em'); const left=tl.filter((t,k)=>!taskDone(zi,k)).length;
  if(f) f.textContent=run>1?`${z.n} — Run ${run} · ${tl.length-left} of ${tl.length} missions done`:`${z.n} — ${tl.length-left} of ${tl.length} missions done`; }; })(drawTasks);
// battle missions only need to be won once
taskList=(function(prev){ return function(zi){ return prev(zi).map(t=>(t.t==='fight'||t.t==='boss')?Object.assign(t,{reps:1}):t); }; })(taskList);
// only real Monster Kingdom monsters: remove retired species from saves, returning their items
function purgeRetired(){ if(!window.__defsReady||typeof S==='undefined'||!S||!Array.isArray(S.mons)) return 0;
  const bad=m=>!m||!SPI[m.sp]||SPI[m.sp].legacy; const gone=S.mons.filter(bad); if(!gone.length) return 0;
  S.inv=S.inv||{}; let top=1; gone.forEach(m=>{ top=Math.max(top,m.lvl|0); (m.eq||[]).forEach(id=>{ if(id) S.inv[id]=(S.inv[id]|0)+1; }); });
  S.mons=S.mons.filter(m=>!bad(m)); S.team=(S.team||[]).filter(u=>S.mons.some(m=>m.uid===u));
  if(!S.mons.length) addMon('zephyra',top);
  [...S.mons].sort((a,b)=>(b.lvl|0)-(a.lvl|0)).forEach(m=>{ if(S.team.length<3&&!S.team.includes(m.uid)) S.team.push(m.uid); });
  return gone.length; }
setTimeout(()=>{ if(purgeRetired()){ try{ persist(); render(); }catch(e){} } },0); // after every monster (incl. later rares) is defined
persist=(function(prev){ return function(){ purgeRetired(); return prev.apply(this,arguments); }; })(persist);

// Camel Back passive shows its own three-wave icon in battle
PAS_IC.camel='mkcamel';
// one-time make-up: reruns finished before v200 didn't award their monster
function rerunMakeup(){ try{ if(!S||S.rerunFix) return; S.rerunFix=1; const got=[];
  ZONES.forEach((z,zi)=>{ const runs=((S.trun&&S.trun[z.id])||0)-2; if(zi<1||runs<1) return;
    const pool=SP.filter(x=>x.fam===z.fam&&!(SPI[x.id]||{}).legacy); if(!pool.length) return;
    for(let i=0;i<runs;i++){ const nm=addMon(pool[Math.floor(Math.random()*pool.length)].id,Math.max(2,z.lv)); got.push(nm); } });
  persist(); if(got.length){ setTimeout(()=>{ let p=Promise.resolve(); got.forEach(m=>{ p=p.then(()=>new Promise(res=>reveal2(m,'Your rerun reward!',res))); }); },1500); }
}catch(e){} }
rerunMakeup();
// one-time admin gift #2: 1000 mushrooms
(function(){ const give=()=>{ try{ if(!ADMIN||typeof S==='undefined'||!S||S.giftMush1k2||String(S.name||'').toLowerCase()!=='george') return false; S.mush=(S.mush|0)+1000; S.giftMush1k2=1; persist(); if(typeof renderHUD==='function') renderHUD(); if(typeof render==='function'&&!B) render(); if(typeof toast==='function') toast('+1000 mushrooms'); return true; }catch(_){ return false; } };
  setAdmin=(function(prev){ return function(v){ const r=prev(v); setTimeout(give,300); return r; }; })(setAdmin);
  let n=0; const t=setInterval(()=>{ if(give()||++n>40) clearInterval(t); },1500); })();
// MK level-10 values: Trample +50% (5% per level, 50 mana); Devour regular attack + heals 104 a turn for 2 turns (92 mana)
(function(){ const L10=(a,t)=>[a,+((t-a)/9).toFixed(3)];
  Object.assign(SK.trample,{m:[1.05,.05]});
  Object.assign(SK.devour,{m:[1,0],mp:L10(10,92),hotFlat:L10(14,104),turns:2,desc:''}); delete SK.devour.leech; delete SK.devour.leechL;
  DEFAULT_SK.trample=JSON.parse(JSON.stringify(SK.trample)); DEFAULT_SK.devour=JSON.parse(JSON.stringify(SK.devour));
  skillDesc=(function(prev){ return function(id,L){ if(id==='devour'&&SK.devour.hotFlat) return `Grab your prey and take a bite out of them causing physical damage and healing for ${Math.round(lv(SK.devour.hotFlat,L||1))} health for ${SK.devour.turns} turns.`; return prev(id,L); }; })(skillDesc);
})();
// Soul Drain heal buff on the caster
ST_ICON.soulh=['swirl','#2fa84f']; BUFF_N.soulh='Soul Drain';
stDesc=(function(prev){ return function(m,k){ if(k==='soulh') return `Heals ${m.st.soulhV||0} life each turn (${m.st.soulh} turn${m.st.soulh>1?'s':''})`; if(k==='soul') return `Takes ${Math.round(m.st.soulD||0)} damage each turn (${m.st.soul} turn${m.st.soul>1?'s':''})`; return prev(m,k); }; })(stDesc);
// ---------- Cheep (piranha) and Crustan (crab): rares, shop only, 50 mushrooms ----------
(function(){
  FAM.cheep={n:'Rare', el:'water', shape:'fish', base:{hp:72,atk:14,mp:58,spd:14}};
  FAM.crustan={n:'Rare', el:'water', shape:'crab', base:{hp:84,atk:13,mp:52,spd:11}};
  const cheep={id:'cheep',n:'Cheep',fam:'cheep',col:['#3cb4e8','#f08a2a','#fff4e0'],tw:{},sk:['splash','hydrate','manashards','camelback'].filter(k=>SK[k]),rare:1};
  const crustan={id:'crustan',n:'Crustan',fam:'crustan',col:['#e0342a','#f2e04a','#fff0e8'],tw:{},sk:['wave','purge','splash','camelback'].filter(k=>SK[k]),rare:1};
  SP.push(cheep,crustan); SPI.cheep=cheep; SPI.crustan=crustan; ATK_MOUTH.fish=[1.2,1.8,.9]; ATK_MOUTH.crab=[1.3,1.9,1.0];
  // one piranha centred on (x,y), facing right
  function fish(x,y,s,c1,c2,G,G2,st){ const T=(a,b)=>`${x+a*s} ${y+b*s}`; let g='';
    g+=`<path d="M${T(-16,0)} L${T(-27,-10)} Q${T(-24,0)} ${T(-27,10)}Z" fill="url(#${G})" ${s3}/>`;
    g+=`<path d="M${T(-4,-11)} Q${T(2,-22)} ${T(8,-12)}Z" fill="url(#${G})" ${s3}/>`;
    g+=`<path d="M${T(-17,0)} Q${T(-12,-14)} ${T(4,-13)} Q${T(17,-11)} ${T(18,0)} Q${T(17,11)} ${T(4,12)} Q${T(-12,13)} ${T(-17,0)}Z" fill="url(#${G})" ${s3}/>`;
    g+=`<path d="M${T(-16,3)} Q${T(0,1)} ${T(17,3)} Q${T(15,11)} ${T(4,12)} Q${T(-12,13)} ${T(-16,3)}Z" fill="url(#${G2})"/>`;
    g+=`<path d="M${T(-17,0)} Q${T(-12,-14)} ${T(4,-13)} Q${T(17,-11)} ${T(18,0)} Q${T(17,11)} ${T(4,12)} Q${T(-12,13)} ${T(-17,0)}Z" fill="none" ${s3}/>`;
    g+=`<path d="M${T(-2,6)} Q${T(2,12)} ${T(-6,13)}" fill="${c2}" ${s3} stroke-width="1.4"/>`;
    g+=`<path d="M${T(9,4)} L${T(17,3)} M${T(10,4)} l${1.2*s} ${2*s} l${1.4*s} ${-2*s} l${1.4*s} ${2*s} l${1.4*s} ${-2*s}" fill="none" stroke="#fff" stroke-width="${1.3*s}" stroke-linejoin="round"/>`;
    g+=`<circle cx="${x+8*s}" cy="${y-4*s}" r="${3.2*s}" fill="#ffd84a" ${s3} stroke-width="1.3"/><circle cx="${x+9*s}" cy="${y-3.6*s}" r="${1.4*s}" fill="${OL3}"/>`;
    g+=`<path d="M${T(4,-8.5)} L${T(12,-6.5)}" stroke="${OL3}" stroke-width="${1.8*s}" stroke-linecap="round"/>`;
    [-8,-3].forEach(a=>{ g+=`<path d="M${T(a,-6)} q${2*s} ${4*s} 0 ${8*s}" fill="none" stroke="${shade(c1,-25)}" stroke-width="${1.2*s}" stroke-linecap="round" opacity=".7"/>`; });
    return g; }
  function cheepNew(c1,c2,c3,st,id){ const G=id+'a', G2=id+'b'; let d=`<defs>${grad(G,c1)}${grad(G2,c2)}</defs>`, g='';
    if(st===0){ // fry: round head, curling tail
      g+=`<path d="M44 66 Q30 70 30 82 Q32 90 42 86 Q36 84 38 78 Q42 72 50 72" fill="url(#${G})" ${s3}/><path d="M30 82 Q32 90 42 86 Q36 84 37 80Z" fill="url(#${G2})" ${s3} stroke-width="1.6"/>`;
      g+=`<ellipse cx="55" cy="60" rx="15" ry="13" fill="url(#${G})" ${s3}/><path d="M44 66 Q54 74 66 66" fill="none" stroke="${c3}" stroke-width="2" opacity=".6"/>`;
      g+=`<circle cx="60" cy="56" r="5.4" fill="#fff" ${s3}/><circle cx="61.4" cy="56.6" r="2.9" fill="${OL3}"/><circle cx="60.4" cy="55.4" r="1" fill="#fff"/>`+`<path d="M62 66 q3 2 6 0" fill="none" stroke="${OL3}" stroke-width="1.6" stroke-linecap="round"/>`; return d+g; }
    if(st===1){ g+=fish(52,64,1.45,c1,c2,G,G2,st); return d+g; }
    g+=fish(38,46,.85,c1,c2,G,G2,st)+fish(72,40,.62,c1,c2,G,G2,st)+fish(54,70,1.3,c1,c2,G,G2,st); return d+g; }
  function claw(x,y,s,G,flip,big){ const f=flip?-1:1, T=(a,b)=>`${x+a*s*f} ${y+b*s}`; let g='';
    g+=`<path d="M${T(0,0)} Q${T(-2,-8)} ${T(2,-14)}" fill="none" stroke="${OL3}" stroke-width="${5.4*s}" stroke-linecap="round"/><path d="M${T(0,0)} Q${T(-2,-8)} ${T(2,-14)}" fill="none" stroke="url(#${G})" stroke-width="${3.4*s}" stroke-linecap="round"/>`;
    const r=big?1.25:1;
    g+=`<path d="M${T(2,-12)} Q${T(-8*r,-18*r)} ${T(-4*r,-30*r)} Q${T(2,-26*r)} ${T(4,-20*r)} Q${T(10*r,-28*r)} ${T(14*r,-24*r)} Q${T(14*r,-14)} ${T(2,-12)}Z" fill="url(#${G})" ${s3}/>`;
    g+=`<path d="M${T(-1*r,-26*r)} Q${T(1,-22*r)} ${T(3,-20*r)}" fill="none" stroke="#fff" stroke-width="${1.4*s}" stroke-linecap="round" opacity=".7"/>`;
    return g; }
  function crustanNew(c1,c2,c3,st,id){ const G=id+'a', dk=shade(c1,-30); let d=`<defs>${grad(G,c1)}</defs>`, g='';
    const w=[20,24,27][st], top=[64,58,56][st], cy=top+12;
    [[-1,0],[-1,1],[-1,2],[1,0],[1,1],[1,2]].forEach(([sd,k])=>{ const x0=50+sd*(w-6-k*3), x1=50+sd*(w+6+k*2); g+=`<path d="M${x0} ${cy+2+k*2} Q${x1} ${cy-2+k*3} ${x1+sd*3} ${cy+12+k*2}" fill="none" stroke="${OL3}" stroke-width="5" stroke-linecap="round"/><path d="M${x0} ${cy+2+k*2} Q${x1} ${cy-2+k*3} ${x1+sd*3} ${cy+12+k*2}" fill="none" stroke="${shade(c3,-8)}" stroke-width="3" stroke-linecap="round"/>`; });
    const big=st>0, cs=[.8,1.05,1.15][st];
    g+=claw(50-w-3,cy-3,cs,G,false,big)+claw(50+w+3,cy-3,cs,G,true,big);
    g+=`<path d="M${50-w} ${cy} Q${50-w} ${top-4} 50 ${top-6} Q${50+w} ${top-4} ${50+w} ${cy} Q${50+w-2} ${cy+12} 50 ${cy+12} Q${50-w+2} ${cy+12} ${50-w} ${cy}Z" fill="url(#${G})" ${s3}/>`;
    g+=`<path d="M${50-w+6} ${cy+4} Q50 ${cy+9} ${50+w-6} ${cy+4}" fill="none" stroke="${dk}" stroke-width="1.6" stroke-linecap="round"/>`;
    if(st===2){ for(let k=-3;k<=3;k++){ const x=50+k*w/3.6; g+=`<path d="M${x-3} ${top-4+Math.abs(k)*1.4} L${x} ${top-11+Math.abs(k)*1.6} L${x+3} ${top-4+Math.abs(k)*1.4}Z" fill="${c3}" ${s3} stroke-width="1.4"/>`; } }
    const ey=st===0?top-16:top-10, es=st===0?5.6:4.2;
    [-1,1].forEach(sd=>{ const ex=50+sd*(st===0?7:8);
      g+=`<path d="M${50+sd*4} ${top-3} L${ex} ${ey+es}" stroke="${OL3}" stroke-width="4.2" stroke-linecap="round"/><path d="M${50+sd*4} ${top-3} L${ex} ${ey+es}" stroke="${c1}" stroke-width="2.4" stroke-linecap="round"/>`;
      if(st===0){ g+=`<circle cx="${ex}" cy="${ey}" r="${es}" fill="#fff" ${s3}/><circle cx="${ex+sd*1.2}" cy="${ey+.6}" r="${es*.45}" fill="${OL3}"/><circle cx="${ex+sd*1.2-1}" cy="${ey-.6}" r="${es*.15}" fill="#fff"/>`; }
      else { g+=`<ellipse cx="${ex}" cy="${ey}" rx="${es}" ry="${es*.85}" fill="${c2}" ${s3}/><circle cx="${ex+sd*.6}" cy="${ey+.6}" r="${es*.35}" fill="${OL3}"/><path d="M${ex-es*sd} ${ey-es*.9} L${ex+es*sd*.8} ${ey-es*.1}" stroke="${OL3}" stroke-width="2" stroke-linecap="round"/>`; } });
    g+= st===0? `<path d="M46 ${cy+3} q4 3 8 0" fill="none" stroke="${OL3}" stroke-width="1.6" stroke-linecap="round"/>`
      : `<path d="M${st===2?40:43} ${cy+3} l3.4 3 l3.3 -3 l3.3 3 l3.3 -3 ${st===2?'l3.3 3 l3.3 -3':''}" fill="#fff" ${s3} stroke-width="1.4" stroke-linejoin="round"/>`;
    return d+g; }
  monSVG=(function(prev){ return function(spId,lvl,cls){ const s=SPI[spId]; if(!s||(s.fam!=='cheep'&&s.fam!=='crustan')) return prev(spId,lvl,cls);
    const st=stageOf(lvl); const c1=mute(s.col[0],18), c2=mute(s.col[1],10), c3=mute(s.col[2],8); const id='m'+(GID++); const sc=[0.82,0.92,1][st];
    const body=s.fam==='cheep'?cheepNew(c1,c2,c3,st,id):crustanNew(c1,c2,c3,st,id);
    return `<svg class="${cls||''}" viewBox="-4 0 108 100"><g transform="translate(50 92) scale(${sc}) translate(-50 -92)">${body}</g></svg>`; }; })(monSVG);
})();
// admin only: instantly max a monster to the top level (profile button next to the XP bar)
drawMon=(function(prev){ return function(){ prev(); if(!MONSH||!ADMIN) return; const m=monBy(MONSH.uid); if(!m||m.lvl>=MAXLVL) return;
  const xp=MONSH.sh.body.querySelector('.pxp'); if(!xp||xp.parentNode.querySelector('.admax')) return;
  xp.insertAdjacentHTML('afterend','<button class="admax">Max Lv</button>');
  const btn=xp.parentNode.querySelector('.admax'); btn.style.top=(xp.offsetTop)+'px'; btn.style.height=xp.offsetHeight+'px';
  btn.onclick=e=>{ e.stopPropagation(); const r=giveXp(m,1e9); { const i=LVQ.indexOf(m.uid); if(i>=0) LVQ.splice(i,1); } persist(); drawMon(); toast(`${m.n||SPI[m.sp].n} is now level ${m.lvl}`); }; }; })(drawMon);
// one-time admin fix: put Crustan back to level 1 with no stat points spent
(function(){ const fix=()=>{ try{ if(!ADMIN||typeof S==='undefined'||!S||S.fixCrustan1||String(S.name||'').toLowerCase()!=='george') return false; S.fixCrustan1=1;
    (S.mons||[]).filter(m=>m.sp==='crustan').forEach(m=>{ m.lvl=1; m.xp=0; m.pts={atk:0,hp:0,mp:0}; m.free=0; });
    persist(); if(typeof render==='function'&&!B) render(); return true; }catch(_){ return false; } };
  setAdmin=(function(prev){ return function(v){ const r=prev(v); setTimeout(fix,300); return r; }; })(setAdmin);
  let n=0; const iv=setInterval(()=>{ if(fix()||++n>40) clearInterval(iv); },1500); })();
// stat points can always be taken back with minus (not just the ones added since opening the profile)
// admin menu is just Players now; Ability Studio and the eye style switch are gone
(function(){ const strip=()=>{ SUBMENUS.menu=SUBMENUS.menu.filter(x=>x[0]!=='Ability Studio'&&!/^Eye style/.test(x[0])); };
  setAdmin=(function(prev){ return function(v){ const r=prev(v); strip(); return r; }; })(setAdmin); strip(); })();
// Brian (br6pack) gets the Max Lv button without any server change
function canMaxLv(){ return ADMIN || ['george','br6pack'].includes(String((typeof S!=='undefined'&&S&&S.name)||'').toLowerCase()); }
drawMon=(function(prev){ return function(){ const a=ADMIN; if(!a&&canMaxLv()) ADMIN=true; try{ prev(); } finally{ ADMIN=a; } }; })(drawMon);

// one-time: give George back the Cheep and Crustan that the old cleanup removed by mistake
(function(){ const fix=()=>{ try{ if(typeof S==='undefined'||!S||!S.name) return false; if(S.restoreRares1) return true; if(String(S.name).toLowerCase()!=='george') return true;
    S.restoreRares1=1; ['cheep','crustan'].forEach(id=>{ if(SPI[id]&&!S.mons.some(m=>m.sp===id)) addMon(id,1); }); persist(); if(typeof render==='function'&&!B) render(); if(typeof toast==='function') toast('Cheep and Crustan are back'); return true; }catch(_){ return false; } };
  let n=0; const iv=setInterval(()=>{ if(fix()||++n>40) clearInterval(iv); },1500); })();
// one-time gift for George: 5099 mushrooms
(function(){ const give=()=>{ try{ if(typeof S==='undefined'||!S||!S.name) return false; if(S.giftMush5099||String(S.name).toLowerCase()!=='george') return true;
    S.mush=(S.mush|0)+5099; S.giftMush5099=1; persist(); if(typeof renderHUD==='function') renderHUD(); if(typeof render==='function'&&!B) render(); if(typeof toast==='function') toast('+5099 mushrooms'); return true; }catch(_){ return false; } };
  let n=0; const iv=setInterval(()=>{ if(give()||++n>40) clearInterval(iv); },1500); })();
// Mana Shards: ice crystals burst out of the foe
function fxShards(x,y,size){ const R=size*1.9, n=14; let p='';
  for(let i=0;i<n;i++){ const a=(i/n)*Math.PI*2+(i%2?.12:0), L=R*(i%2?.78:1), w=size*(i%2?.09:.12), r0=size*.22;
    const ca=Math.cos(a), sa=Math.sin(a), px=-sa, py=ca;
    const bx=r0*ca, by=r0*sa, mx=(r0+L*.55)*ca, my=(r0+L*.55)*sa, tx=(r0+L)*ca, ty=(r0+L)*sa;
    p+=`<polygon points="${bx},${by} ${mx+px*w},${my+py*w} ${tx},${ty} ${mx-px*w},${my-py*w}" fill="url(#shg)" stroke="#eaffff" stroke-width="1.4" stroke-opacity=".9"/>`;
    p+=`<line x1="${bx}" y1="${by}" x2="${tx*.92}" y2="${ty*.92}" stroke="#fff" stroke-width="1" opacity=".7"/>`; }
  const S2=R*2+20, d=fxAt(x,y,'shards',`<svg width="${S2}" height="${S2}" viewBox="${-S2/2} ${-S2/2} ${S2} ${S2}"><defs><linearGradient id="shg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c8f6ff" stop-opacity=".95"/><stop offset=".6" stop-color="#5ac8f0" stop-opacity=".8"/><stop offset="1" stop-color="#2a8ad8" stop-opacity=".55"/></linearGradient></defs>${p}</svg>`);
  d.style.cssText+=`;width:${S2}px;height:${S2}px;margin:${-S2/2}px 0 0 ${-S2/2}px;pointer-events:none;z-index:60`;
  d.animate([{transform:'scale(.15) rotate(0deg)',opacity:0},{transform:'scale(1) rotate(70deg)',opacity:1,offset:.25},{transform:'scale(1.04) rotate(230deg)',opacity:1,offset:.8},{transform:'scale(1.1) rotate(290deg)',opacity:0}],{duration:1150,easing:'linear'}).onfinish=()=>d.remove();
  fxFlash(x,y,'water',size*1.4); }
animateBattle=(function(prev){ return function(root,b,animating){ const r=prev(root,b,animating); if(!animating) return r;
  try{ const evs=b.ev||[]; const a=evs.find(e=>e.k==='act'); if(!a||a.sk!=='manashards') return r;
    const fs=1-a.s, side=b.sides[fs]; const hit=evs.find(e=>e.s===fs&&e.i!=null); const ti=hit?hit.i:(b.single?side.active:(a.t!=null?a.t:0));
    const t=fEl(fs,ti); const ac=fEl(a.s,a.i); if(!t) return r; const rr=localRect(t.querySelector('.fart')); const ar=ac?localRect(ac.querySelector('.fart')):rr;
    setTimeout(()=>fxShards(rr.left+rr.width/2,rr.top+rr.height/2,Math.max(50,ar.width*.55)),120);
    const g=evs.find(e=>e.hyd); if(g&&ac){ setTimeout(()=>fxAura(ar.left+ar.width/2,ar.top+ar.height/2,ar.height,'water',Math.max(50,ar.width*.55)),Math.max(0,(g._d||1400)-520)); } }catch(_){}
  return r; }; })(animateBattle);
// everything above (every monster, incl. rares) is defined once this runs; only then may saves be cleaned up
setTimeout(()=>{ window.__defsReady=true; try{ const n=purgeRetired(); fixTeam(); if(n) persist(); if(!B) render(); /* early renders ran before the rares existed, leaving empty roamers */ }catch(_){} },0);

// the server corrects impossible numbers (and adds gifted mushrooms); take its values
addEventListener('mr-fix',e=>{ const f=e.detail||{}; if(typeof S==='undefined'||!S) return; let gift=0;
  if(f.mush!=null){ gift=f.mush-(S.mush|0); S.mush=f.mush; } if(f.cash!=null) S.cash=f.cash;
  if(Array.isArray(f.mons)){ const byU={}; f.mons.forEach(m=>byU[m.uid]=m); S.mons.forEach(m=>{ const n=byU[m.uid]; if(n){ m.lvl=n.lvl; m.pts=n.pts; m.free=n.free; } }); }
  try{ localStorage.setItem(LS_KEY,JSON.stringify(S)); }catch(_){} try{ renderHUD(); }catch(_){} try{ if(!B) render(); }catch(_){}
  if(gift>0) toast(`+${gift} 🍄`); });
// this device's key doesn't match the account (e.g. a second phone set up before account keys existed)
addEventListener('mr-forbidden',()=>{ if(window.__forbidShown) return; window.__forbidShown=1;
  confirmBox("This device can't save to your account. Open Menu on the phone you play on, copy its transfer code, and restore it here.","Restore",()=>openRestore()); });
// Rankings list every player (from the server), online ones marked; ONLINE NOW is unchanged
openFriends=(function(prev){ return function(tab){ prev(tab); const sh=PANEL_LAST_FULL(); if(!sh||!window.MR_ACCT||!MR_ACCT.top) return;
  let all=null; const myId=String(window.MR_UID||'').slice(-6);
  const paint=()=>{ const on=sh.body.querySelector('.fr-t.blue.on'); const box=sh.body.querySelector('.fr-list'); if(!on||!box||!all||box._top) return; box._top=1;
    const online=new Set(NET.peers.filter(p=>!p.me).map(p=>(p.name||'').toLowerCase()));
    const list=all.map(p=>p.id===myId?Object.assign({},p,{me:true,rank:myRank(),name:S.name||p.name}):p).sort((a,b)=>b.rank-a.rank);
    box.innerHTML=list.map((p,i)=>`<div class="fr-row ${p.me?'me':''}"><div class="fr-dot ${online.has(p.name.toLowerCase())||p.me?'':'off'}"><i></i></div><div class="fr-rk"><b class="fr-pos">${i+1}</b>${rankBadge(p.rank,26)}<span>${p.rank}</span></div><div class="fr-n">${esc(p.name)}${p.me?' <small>you</small>':''}</div></div>`).join(''); };
  MR_ACCT.top().then(r=>{ if(r&&r.ok&&Array.isArray(r.players)){ all=r.players; if(!all.some(p=>p.id===myId)) all.push({id:myId,name:S.name||'You',rank:myRank()}); paint(); } }).catch(()=>{});
  new MutationObserver(paint).observe(sh.body,{childList:true,subtree:true}); }; })(openFriends);
// tap a trainer in Online Now or Rankings to open their profile
function profileFromSave(save,rank){ const S0=save||{}; const byU={}; (S0.mons||[]).forEach(m=>byU[m.uid]=m);
  const team=(S0.team||[]).map(u=>byU[u]).filter(m=>m&&SPI[m.sp]).slice(0,3).map(m0=>{ const m=JSON.parse(JSON.stringify(m0)); try{ return snapOf(m); }catch(_){ return {sp:m.sp,lvl:m.lvl}; } });
  const st=S0.stats||{};
  return cleanProfile({name:S0.name, avatar:S0.avatar, rank:rank!=null?rank:(S0.rank==null?200:S0.rank), motto:S0.motto, team,
    stats:{wins:st.wins, arenaWins:st.arenaWins, pvpWins:st.pvpWins, mons:(S0.mons||[]).length, kinds:new Set((S0.mons||[]).filter(m=>SPI[m.sp]&&!SPI[m.sp].legacy).map(m=>m.sp)).size, quests:Object.keys(S0.quests||{}).length}}); }
openFriends=(function(prev){ return function(tab){ prev(tab); const sh=PANEL_LAST_FULL(); if(!sh) return; let top=null;
  const topP=(window.MR_ACCT&&MR_ACCT.top)?MR_ACCT.top().then(r=>{ if(r&&r.ok) top=r.players||[]; }).catch(()=>{}):Promise.resolve();
  // the list re-draws as trainers come and go, so remember the row at touch-down and open it on release
  let down=null;
  sh.body.addEventListener('pointerdown',e=>{ const row=e.target.closest('.fr-row'); if(!row||e.target.closest('button')){ down=null; return; }
    const name=(row.querySelector('.fr-n')||{}).childNodes; down={x:e.clientX,y:e.clientY,me:row.classList.contains('me'),nm:name&&name[0]?String(name[0].textContent||'').trim():''}; row.classList.add('fr-press'); },true);
  sh.body.addEventListener('pointercancel',()=>{ down=null; },true);
  sh.body.addEventListener('pointerup',async e=>{ sh.body.querySelectorAll('.fr-press').forEach(r=>r.classList.remove('fr-press')); const d=down; down=null; if(!d||Math.hypot(e.clientX-d.x,e.clientY-d.y)>14) return;
    if(d.me) return openProfile({me:true});
    const nm=d.nm; if(!nm) return;
    const peer=NET.peers.find(p=>!p.me&&(p.name||'').trim().toLowerCase()===nm.toLowerCase());
    if(peer) return openProfile(cleanProfile(peer));
    if(!top) await topP; const t=(top||[]).find(p=>(p.name||'').toLowerCase()===nm.toLowerCase()); if(!t||!t.uid) return toast('Profile not available yet');
    openTrainer(t); });
  }; })(openFriends);
// ---------- Smarter AI v2: considers swaps, your best reply (not your average one), and reads buffs/debuffs/stacks ----------
(function(){
  const base=window.__aiBase||aiChoose; const clone=b=>JSON.parse(JSON.stringify(b));
  const DOTS=['burn','poison','storm','frost','soul'], MINE_GOOD=['bubble','lsh','fsh','nsh','mshield','pers','fwall','absorb','focus','charge','crit','evade','wcry','eshift','soulh','roots','zap'];
  const FOE_BAD=['cripple','crush','taunt','acid'];
  function settle(c){ let g=0; while(!c.over&&c.phase==='pick'&&g++<4){ const s=c.pickSide; const i=aiPick(c,s); if(i==null||!pick(c,s,i)) break; } }
  function monVal(c,m,sd,k,s){ if(m.hp<=0) return 0; const st=m.st||{}; let x=70+110*m.hp/m.maxhp+14*m.mp/Math.max(1,m.maxmp)+0.08*m.atk;
    const benched=c.single&&sd.active!==sd.mons.indexOf(m); DOTS.forEach(d=>{ if(st[d]>0) x-=(benched?0.4:1)*Math.min(70,((st[d+'D']||0)*st[d])/m.maxhp*100*0.75); });
    MINE_GOOD.forEach(z=>{ if(st[z]>0) x+=5+Math.min(3,st[z]); });
    FOE_BAD.forEach(z=>{ if(st[z]>0) x-=7; });
    if(st.soakV>0) x-=st.soakV*30; if(st.scorchV>0) x-=st.scorchV*30; if(st.stun>0) x-=18;
    // the monster that is actually out matters more, and type matchup against the other side's active one
    if(c.single){ const act=sd.active===sd.mons.indexOf(m); if(act){ x*=1.08; const o=c.sides[1-k], om=o.mons[o.active]; if(om&&om.hp>0) x+=22*(elemMult(m.el,om.el)-1)-14*(elemMult(om.el,m.el)-1); } }
    return x; }
  function evalFor(c,s){ if(c.over) return c.winner===s?1e5:-1e5; let v=0;
    c.sides.forEach((sd,k)=>{ const sign=k===s?1:-1; sd.mons.forEach(m=>{ v+=sign*monVal(c,m,sd,k,s); }); }); return v; }
  function options(b){ const a=actor(b); const m=a.m; const opts=[];
    ['basic',...usable(m)].forEach(id=>{ let ts=[]; try{ ts=validTargets(b,a.s,id)||[]; }catch(_){ ts=[]; } if(!ts.length) ts=[null]; ts.forEach(t=>opts.push({skill:id,target:t})); });
    if(b.single&&!b.swapped){ try{ benchOf(b,a.s).forEach(i=>opts.push({swap:i})); }catch(_){} }
    return opts; }
  function sim(c,o){ c.ev=[]; c.log=[]; if(!act(c,o)) return false; settle(c); return true; }
  function bestReplyValue(c,s){ // opponent picks the reply that is worst for us (one quick sample each)
    const a=actor(c); if(!a||a.s===s||c.over) return evalFor(c,s);
    let worst=Infinity; const opts=options(c); for(const o of opts){ const d=clone(c); if(!sim(d,o)) continue;
      // let the turn come back around once if it's still theirs (multi-monster sides)
      let g=0; while(!d.over&&g++<2){ const a2=actor(d); if(!a2||a2.s===s) break; const r=base(d); if(!r||!sim(d,r)) break; }
      const v=evalFor(d,s); if(v<worst) worst=v; }
    return worst===Infinity?evalFor(c,s):worst; }
  function score(b,s,o){ let tot=0; const N=2;
    for(let k=0;k<N;k++){ const c=clone(b); c.rng=((b.rng|0)+7919*(k+1))|0; if(!sim(c,o)) return -1e9;
      tot+=0.35*evalFor(c,s)+0.65*bestReplyValue(c,s); }
    let v=tot/N; if(o.swap!=null) v-=6; v-=aiDotPenalty(b,s,o); return v; }
  // a swap is only worth it if the monster coming in then does clearly better than staying (it still has to act this turn)
  function swapValue(b,s,o){ const c=clone(b); if(!sim(c,o)) return -1e9; let bv=-Infinity; for(const o2 of options(c)){ if(o2.swap!=null) continue; const v=score(c,s,o2); if(v>bv) bv=v; } return bv; }
  function smart2(b){ try{ const a=actor(b); if(!a) return base(b); const t0=Date.now(); let best=null,bs=-Infinity, bestSw=null, sw=-Infinity;
      for(const o of options(b)){ if(o.swap!=null) continue; const v=score(b,a.s,o); if(v>bs){ bs=v; best=o; } }
      if(b.single&&!b.swapped&&a.m.hp>0){ for(const o of options(b)){ if(o.swap==null) continue; if(Date.now()-t0>1200) break; const v=swapValue(b,a.s,o); if(v>sw){ sw=v; bestSw=o; } } }
      // needs a real reason: a clear gain, more so while the current monster is still healthy
      const recent=b._aiSw&&b._aiSw[a.s]!=null&&(b.seq|0)-b._aiSw[a.s]<5; const margin=(recent?40:8)+(recent?40:18)*(a.m.hp/a.m.maxhp);
      if(bestSw&&sw>bs+margin){ (b._aiSw=b._aiSw||{})[a.s]=b.seq|0; return bestSw; }
      return best||base(b); }catch(e){ console.warn('smart AI fell back',e); return base(b); } }
  window.__aiSmart1=window.__aiSmart; window.__aiSmart=smart2;
  // every computer opponent uses it: practice, rivals, challenges and zone fights
  aiChoose=function(b){ const ours=typeof B!=='undefined'&&B&&B.b===b&&B.mode!=='pvp'; return ours?smart2(b):base(b); };
})();
// trainer profile: no level badges, and the team of 3 wanders the field like on the home screen
function roamProfile(field){ if(!field||field._roam) return; field._roam=1;
  const els=[...field.querySelectorAll('.tp-m')]; if(!els.length) return;
  const team=field.querySelector('.tp-team'); if(team) team.classList.add('tp-free');
  const R=els.map((el,k)=>({el, x:22+k*28+Math.random()*6, y:72+Math.random()*16, dir:1, tx:null, ty:null, wait:400+Math.random()*1800, walk:false}));
  R.forEach(r=>{ r.el.style.animation='none'; r.el.insertAdjacentHTML('afterbegin','<i class="shadow"></i>'); const s=r.el.querySelector('svg'); if(s){ s.outerHTML=`<div class="flip">${s.outerHTML}</div>`; } });
  let last=0; const tick=t=>{ if(!field.isConnected) return; requestAnimationFrame(tick); if(t-last<30) return; const dt=Math.min(80,t-(last||t)); last=t;
    const W=field.clientWidth, H=field.clientHeight;
    R.forEach(r=>{ if(r.wait>0){ r.wait-=dt; if(r.walk){ r.walk=false; r.el.classList.remove('walk'); } if(r.wait<=0){ r.tx=10+Math.random()*80; r.ty=66+Math.random()*24; } }
      else if(r.tx==null) r.wait=1000+Math.random()*3000;
      else { const dx=r.tx-r.x, dy=r.ty-r.y, d=Math.hypot(dx,dy*1.6);
        if(d<0.6){ r.tx=null; r.wait=1200+Math.random()*3500; }
        else { const sp=0.0045*dt; r.x+=dx/d*sp; r.y+=dy/d*sp*0.6; const nd=dx<0?-1:1; if(nd!==r.dir){ r.dir=nd; const f=r.el.querySelector('.flip'); f&&f.classList.toggle('l',nd<0); } if(!r.walk){ r.walk=true; r.el.classList.add('walk'); } } }
      const sc=(0.8+(r.y-66)/24*0.3).toFixed(3);
      r.el.style.transform=`translate3d(${(r.x/100*W).toFixed(1)}px,${(r.y/100*H).toFixed(1)}px,0) translate(-50%,-100%) scale(${sc})`; r.el.style.zIndex=Math.round(r.y); }); };
  requestAnimationFrame(tick); }
openProfile=(function(prev){ return function(p){ const r=prev(p); setTimeout(()=>{ const box=[...document.querySelectorAll('.tprof')].pop(); if(!box) return;
  const go=()=>roamProfile(box.querySelector('.tp-field')); go(); new MutationObserver(go).observe(box,{childList:true}); },30); return r; }; })(openProfile);
// someone else's monster: just the stage, no owner name
openMonRO=(function(prev){ return function(t,owner){ return prev(t); }; })(openMonRO);

// FIND: search every trainer by name and open their profile
async function openTrainer(t){ const peer=NET.peers.find(p=>!p.me&&(p.name||'').trim().toLowerCase()===(t.name||'').toLowerCase());
  if(peer) return openProfile(cleanProfile(peer)); if(!t.uid) return toast('Profile not available yet');
  try{ const db=window.claude&&await window.claude.use('db'); const v=db&&await withTimeout(db.collection('data/users/'+t.uid).doc('save').get(),10000); const save=parseDoc(v);
    if(!save) return toast("Couldn't load that profile"); openProfile(profileFromSave(save,t.rank)); }catch(_){ toast("Couldn't load that profile"); } }
function openFind(){ let all=null; const myId=String(window.MR_UID||'');
  const sh=sheet(`<div class="fnd"><h2>Find a trainer</h2><input id="fq" placeholder="Search by username" autocomplete="off" autocapitalize="off" spellcheck="false"><div class="fnd-list" id="fl"><p class="fnd-msg">Loading trainers…</p></div></div>`);
  const $f=x=>sh.body.querySelector(x);
  const draw=()=>{ if(!all) return; const q=($f('#fq').value||'').trim().toLowerCase(); const list=all.filter(p=>p.uid!==myId&&(!q||(p.name||'').toLowerCase().includes(q))).slice(0,30);
    $f('#fl').innerHTML=list.length?list.map((p,i)=>`<button class="fnd-row" data-i="${all.indexOf(p)}">${rankBadge(p.rank,22)}<span class="fnd-rk">${p.rank}</span><b>${esc(p.name)}</b></button>`).join(''):`<p class="fnd-msg">${q?'No trainers found.':'No other trainers yet.'}</p>`;
    sh.body.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>openTrainer(all[+b.dataset.i])); };
  $f('#fq').addEventListener('input',draw);
  (window.MR_ACCT&&MR_ACCT.top?MR_ACCT.top():Promise.resolve(null)).then(r=>{ all=(r&&r.ok&&r.players)||[]; if(!r||!r.ok) $f('#fl').innerHTML='<p class="fnd-msg">Couldn\'t reach the server.</p>'; else draw(); }).catch(()=>{ $f('#fl').innerHTML='<p class="fnd-msg">Couldn\'t reach the server.</p>'; }); }
openFriends=(function(prev){ return function(tab){ prev(tab); const sh=PANEL_LAST_FULL(); if(!sh) return;
  sh.body.addEventListener('click',e=>{ if(e.target.closest('#frf')){ e.stopImmediatePropagation(); e.preventDefault(); openFind(); } },true); }; })(openFriends);
// opening someone's profile: instant feedback while it loads, and remember profiles we've already fetched
(function(){ const cache={};
  function loader(name){ const d=document.createElement('div'); d.className='pload'; d.innerHTML=`<div class="pload-b"><i class="pload-s"></i><span>Loading ${esc(name||'trainer')}…</span></div>`; document.body.appendChild(d); requestAnimationFrame(()=>d.classList.add('on')); return ()=>{ d.classList.remove('on'); setTimeout(()=>d.remove(),200); }; }
  async function fetchSave(uid){ if(cache[uid]&&Date.now()-cache[uid].at<120000) return cache[uid].save;
    const db=window.claude&&await window.claude.use('db'); const v=db&&await withTimeout(db.collection('data/users/'+uid).doc('save').get(),10000); const save=parseDoc(v); if(save) cache[uid]={save,at:Date.now()}; return save; }
  window.__prefetchProfile=uid=>{ if(uid&&!cache[uid]) fetchSave(uid).catch(()=>{}); };
  openTrainer=async function(t){ const peer=NET.peers.find(p=>!p.me&&(p.name||'').trim().toLowerCase()===(t.name||'').toLowerCase());
    if(peer) return openProfile(cleanProfile(peer)); if(!t.uid) return toast('Profile not available yet');
    const done=cache[t.uid]?()=>{}:loader(t.name);
    try{ const save=await fetchSave(t.uid); done(); if(!save) return toast("Couldn't load that profile"); openProfile(profileFromSave(save,t.rank)); }catch(_){ done(); toast("Couldn't load that profile"); } };
})();
// Rankings/Online rows: route through openTrainer (loader + cache), and warm up the top few profiles
openFriends=(function(prev){ return function(tab){ prev(tab); const sh=PANEL_LAST_FULL(); if(!sh||!window.MR_ACCT||!MR_ACCT.top) return;
  MR_ACCT.top().then(r=>{ if(r&&r.ok) (r.players||[]).filter(p=>p.uid&&p.uid!==window.MR_UID).slice(0,8).forEach(p=>window.__prefetchProfile(p.uid)); }).catch(()=>{}); }; })(openFriends);
// ---------- MK zones 10-11: Valley of the Wind (Marlboro) and Creepvine Jungle (Gorilla), original art ----------
function marlNew(c1,c2,c3,st,id){ const G=id+'a', L=id+'l'; const dk=shade(c1,-30); let d=`<defs>${grad(G,c1)}${grad(L,c2)}</defs>`, g='';
  const stripes=(pts)=>pts.map(([x,y,r])=>`<path d="M${x-4} ${y} q4 ${-r} 8 0" fill="none" stroke="${c2}" stroke-width="3" stroke-linecap="round" opacity=".9"/>`).join('');
  if(st===0){ // bulb
    [[-1,-24],[0,0],[1,24]].forEach(([k,a])=>{ g+=`<path d="M50 60 Q${44+k*10} 44 ${48+k*16} 38 Q${52+k*6} 48 52 60Z" fill="url(#${L})" ${s3} transform="rotate(${a*.3} 50 60)"/>`; });
    g+=`<path d="M50 56 Q66 58 68 76 Q66 92 50 92 Q34 92 32 76 Q34 58 50 56Z" fill="url(#${G})" ${s3}/>`+stripes([[40,70,3],[58,72,3],[48,84,3]]);
    g+=`<circle cx="45" cy="71" r="5" fill="#fff" ${s3}/><circle cx="46.5" cy="71.75" r="2.75" fill="${OL3}"/><circle cx="45" cy="69.5" r="1.1" fill="#fff"/>`+`<circle cx="57" cy="71" r="5" fill="#fff" ${s3}/><circle cx="58.5" cy="71.75" r="2.75" fill="${OL3}"/><circle cx="57" cy="69.5" r="1.1" fill="#fff"/>`+`<path d="M44 82 Q51 88 58 82" fill="#fff" ${s3} stroke-width="1.4"/><path d="M47 83 l1 2 l1 -2 M51 84 l1 2 l1 -2 M55 83 l1 2 l1 -2" stroke="${OL3}" stroke-width=".9" fill="none"/>`; return d+g; }
  if(st===1){ // sprout serpent
    g+=`<path d="M38 92 q-8 -2 -10 -6 q8 0 12 2 M60 92 q8 -2 10 -6 q-8 0 -12 2" fill="url(#${L})" ${s3}/>`;
    g+=`<path d="M40 92 Q30 80 42 72 Q56 64 50 56 Q46 50 52 44 L62 46 Q58 52 62 58 Q70 70 56 78 Q46 84 58 92Z" fill="url(#${G})" ${s3}/>`+stripes([[44,74,3],[55,66,3],[50,86,3],[57,52,2]]);
    g+=`<path d="M56 30 Q64 22 70 30" fill="none" stroke="${c2}" stroke-width="3" stroke-linecap="round"/><ellipse cx="60" cy="40" rx="12" ry="10" fill="url(#${G})" ${s3}/>`;
    g+=`<circle cx="56" cy="36" r="4.6" fill="#fff" ${s3}/><circle cx="57.38" cy="36.69" r="2.53" fill="${OL3}"/><circle cx="56" cy="34.62" r="1.012" fill="#fff"/>`+`<circle cx="66" cy="35" r="4.6" fill="#fff" ${s3}/><circle cx="67.38" cy="35.69" r="2.53" fill="${OL3}"/><circle cx="66" cy="33.62" r="1.012" fill="#fff"/>`+`<path d="M56 45 Q63 50 70 44" fill="#fff" ${s3} stroke-width="1.3"/>`; return d+g; }
  // flytrap
  [[30,92,-1],[44,94,-.4],[60,94,.4],[72,92,1]].forEach(([x,y,k])=>{ g+=`<path d="M50 74 Q${x-k*6} ${y-14} ${x} ${y} Q${x+4} ${y-4} ${x+6} ${y-2}" fill="none" stroke="${OL3}" stroke-width="7.4" stroke-linecap="round"/><path d="M50 74 Q${x-k*6} ${y-14} ${x} ${y} Q${x+4} ${y-4} ${x+6} ${y-2}" fill="none" stroke="${c1}" stroke-width="4" stroke-linecap="round"/>`; });
  g+=`<path d="M44 80 Q36 66 46 56 L58 60 Q52 68 56 80Z" fill="url(#${G})" ${s3}/>`+stripes([[46,72,3],[50,64,2]]);
  g+=`<path d="M40 30 Q30 14 46 12 Q42 22 48 28Z M58 26 Q66 10 78 18 Q66 20 64 30Z" fill="url(#${L})" ${s3}/>`;
  g+=`<path d="M36 42 Q40 54 92 60 L94 34 Q60 38 36 42Z" fill="#7a1a2a" ${s3} stroke-width="1.4"/>`;
  g+=`<path d="M32 44 Q30 16 62 16 Q90 18 96 34 Q66 36 36 42Z" fill="url(#${G})" ${s3}/><path d="M34 48 Q38 76 64 74 Q90 72 94 60 Q64 58 38 50Z" fill="url(#${G})" ${s3}/>`;
  let t=''; for(let k=0;k<7;k++){ const x=42+k*7.4, yt=41-k*0.8, yb=50+k*1.4; t+=`<path d="M${x} ${yt} l3.4 7 l3.4 -7.4Z M${x+1} ${yb} l3.4 -7 l3.4 7.4Z" fill="#fff" stroke="${OL3}" stroke-width=".9"/>`; } g+=t;
  g+=stripes([[46,28,3],[62,24,3],[50,64,-3],[66,66,-3]])+eye3(56,27,4,'#2a3a5a',2,-6)+eye3(67,25,3.8,'#2a3a5a',2,4);
  return d+g; }
function gorNew(c1,c2,c3,st,id){ const G=id+'a', P=id+'p', M=id+'m'; const face=shade(c1,38); let d=`<defs>${grad(G,c1)}${grad(P,c2)}${grad(M,c3)}</defs>`, g='';
  if(st===0){ // little boxer kid
    g+=leg3(44,80,43,86,42,91,6,shade(c1,-20))+leg3(56,80,57,86,58,91,6,shade(c1,-20));
    g+=`<path d="M40 70 Q40 62 50 62 Q60 62 60 70 L60 76 Q50 80 40 76Z" fill="url(#${G})" ${s3}/><path d="M39 74 L61 74 L62 84 L52 84 L50 80 L48 84 L38 84Z" fill="url(#${P})" ${s3}/>`;
    g+=`<path d="M40 66 Q32 60 30 52 M60 66 Q68 60 70 52" fill="none" stroke="${OL3}" stroke-width="6.4" stroke-linecap="round"/><path d="M40 66 Q32 60 30 52 M60 66 Q68 60 70 52" fill="none" stroke="${c1}" stroke-width="3.6" stroke-linecap="round"/>`;
    g+=`<circle cx="30" cy="50" r="4.6" fill="url(#${M})" ${s3}/><circle cx="70" cy="50" r="4.6" fill="url(#${M})" ${s3}/>`;
    g+=`<ellipse cx="50" cy="48" rx="14" ry="13" fill="url(#${G})" ${s3}/><ellipse cx="51" cy="52" rx="10" ry="8" fill="${face}"/>`;
    g+=eye3(46,46,4.6,'#3aa83a',0,-4)+eye3(56,46,4.6,'#3aa83a',0,4)+`<path d="M44 54 Q51 61 58 54Z" fill="#fff" ${s3} stroke-width="1.3"/><path d="M48 55 v3 M51 55.4 v3.4 M54 55 v3" stroke="${OL3}" stroke-width=".8"/>`; return d+g; }
  if(st===1){ // knuckle-walking
    g+=leg3(34,78,32,85,30,91,8,shade(c1,-20))+leg3(48,80,48,86,48,91,8,shade(c1,-20));
    g+=`<path d="M24 76 Q20 50 44 44 Q66 40 72 56 Q74 70 64 78 Q44 84 24 76Z" fill="url(#${G})" ${s3}/><path d="M26 72 L52 76 L50 84 L28 82Z" fill="url(#${P})" ${s3}/>`;
    g+=`<path d="M62 60 Q72 72 70 88" fill="none" stroke="${OL3}" stroke-width="10.6" stroke-linecap="round"/><path d="M62 60 Q72 72 70 88" fill="none" stroke="${c1}" stroke-width="7" stroke-linecap="round"/><ellipse cx="71" cy="89" rx="6" ry="3.2" fill="url(#${G})" ${s3}/>`;
    g+=`<ellipse cx="70" cy="50" rx="11" ry="10" fill="url(#${G})" ${s3}/><path d="M64 52 Q72 48 80 52 Q80 60 72 60 Q64 60 64 52Z" fill="${face}" ${s3} stroke-width="1.2"/>`;
    g+=`<path d="M62 44 Q71 40 80 44" fill="none" stroke="${OL3}" stroke-width="3" stroke-linecap="round"/>`+eye3(68,47,3,'#3aa83a',1,-2)+eye3(75,47,3,'#3aa83a',1,4)+`<path d="M70 56 Q74 58 78 55" fill="none" stroke="${OL3}" stroke-width="1.4" stroke-linecap="round"/>`; return d+g; }
  // champion boxer
  g+=leg3(40,78,38,85,36,91,9,shade(c1,-20))+leg3(60,78,62,85,64,91,9,shade(c1,-20));
  g+=`<path d="M30 60 Q28 34 50 30 Q72 34 70 60 Q70 76 50 78 Q30 76 30 60Z" fill="url(#${G})" ${s3}/><path d="M38 44 Q50 50 62 44 Q62 62 50 64 Q38 62 38 44Z" fill="${face}" opacity=".85"/>`;
  g+=`<path d="M31 70 L69 70 L70 84 L54 84 L50 80 L46 84 L30 84Z" fill="url(#${P})" ${s3}/><path d="M30 64 Q50 70 70 64 L70 71 Q50 77 30 71Z" fill="#f2c83a" ${s3} stroke-width="1.5"/><ellipse cx="50" cy="69" rx="7" ry="5" fill="#ffe27a" ${s3} stroke-width="1.4"/><path d="M47 69 l3 -3 l3 3 l-3 2z" fill="#c99a1e"/>`;
  [[30,46,22,60,1],[70,46,78,58,-1]].forEach(([x0,y0,x1,y1])=>{ g+=`<path d="M${x0} ${y0} Q${x1} ${y0+4} ${x1} ${y1}" fill="none" stroke="${OL3}" stroke-width="11" stroke-linecap="round"/><path d="M${x0} ${y0} Q${x1} ${y0+4} ${x1} ${y1}" fill="none" stroke="${c1}" stroke-width="7.4" stroke-linecap="round"/><ellipse cx="${x1}" cy="${y1+6}" rx="8" ry="9" fill="url(#${M})" ${s3}/><path d="M${x1-6} ${y1+10} q6 3 12 0" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7"/>`; });
  g+=`<ellipse cx="52" cy="24" rx="11" ry="10" fill="url(#${G})" ${s3}/><path d="M45 27 Q52 23 59 27 Q59 34 52 34 Q45 34 45 27Z" fill="${face}" ${s3} stroke-width="1.2"/>`;
  g+=`<path d="M43 19 Q52 15 61 19" fill="none" stroke="${OL3}" stroke-width="3.2" stroke-linecap="round"/>`+eye3(48,22,2.8,'#3aa83a',2,-2)+eye3(56,22,2.8,'#3aa83a',2,4)+`<path d="M48 31 Q52 29 56 31" fill="none" stroke="${OL3}" stroke-width="1.4" stroke-linecap="round"/>`;
  return d+g; }
(function(){
  Object.assign(FAM,{ marlboro:{n:'Marlboro', el:'nature', shape:'marlboro', base:{hp:78,atk:15,mp:50,spd:10}}, gorilla:{n:'Gorilla', el:'neutral', shape:'gorilla', base:{hp:86,atk:17,mp:40,spd:9}} });
  [['marly','Marly','marlboro',['#8fd4c4','#a070c8','#f6eefc'],['poison','firewall','nshield','roots']],
   ['marlow','Marlow','marlboro',['#9ad84a','#e8e04a','#f6fbe0'],['poison','absorb','regrowth','thickskin']],
   ['marina','Marina','marlboro',['#9ac8e8','#f070b8','#fdeef6'],['poison','invuln','hardened','sweaty']],
   ['marvuu','Marvuu','marlboro',['#f2d03a','#f08a2a','#fff6dc'],['perseverance','bolt','feedback','pounce']],
   ['gorzanga','Gorzanga','gorilla',['#b89ad8','#e0342a','#e0342a'],['regrowth','burn','nshield','thickskin']],
   ['gorgamel','Gorgamel','gorilla',['#9aa0d8','#3a7ae0','#f2c83a'],['feedback','splash','feed','grounded']],
   ['gorbamba','Gorbamba','gorilla',['#7a5a4a','#f2c83a','#6a7ad8'],['natureswill','cripple','invuln','sweaty']],
   ['gorgie','Gorgie','gorilla',['#9ad0f0','#f05a9a','#5ad85a'],['feed','invuln','natureswill','double']]
  ].forEach(([id,n,fam,col,sk])=>{ if(SPI[id]) return; const sp={id,n,fam,col,tw:{},sk:sk.filter(k=>SK[k])}; SP.push(sp); SPI[id]=sp; });
  Object.assign(ATK_MOUTH,{marlboro:[1.7,1.4,1.0],gorilla:[1.6,1.2,1.0]});
  monSVG=(function(prev){ const F={marlboro:marlNew,gorilla:gorNew}; return function(spId,lvl,cls){ const sp=SPI[spId]; const shape=sp&&FAM[sp.fam]&&FAM[sp.fam].shape; if(!F[shape]) return prev(spId,lvl,cls);
    const st=stageOf(lvl); const c1=mute(sp.col[0],20), c2=mute(sp.col[1],10), c3=mute(sp.col[2],8); const id='m'+(GID++); const sc=[0.8,0.92,1][st];
    return `<svg class="${cls||''}" viewBox="-4 0 108 100"><g transform="translate(50 92) scale(${sc}) translate(-50 -92)">${F[shape](c1,c2,c3,st,id)}</g></svg>`; }; })(monSVG);
  if(!ZONES.some(z=>z.id==='valley')) ZONES.push({id:'valley', n:'Valley of the Wind', fam:'marlboro', lv:29, sizes:[3,3,3,3], c:'#8fd4a0'});
  if(!ZONES.some(z=>z.id==='jungle')) ZONES.push({id:'jungle', n:'Creepvine Jungle', fam:'gorilla', lv:30, sizes:[3,3,3,3], c:'#3a9a4a'});
  Object.assign(ZTASKS,{
    valley:[['act','Ride the valley winds',29,0,260,330,2,3],['fight','Battle a wild marlboro',29,0,290,360,3,1],['act','Water the snapping sprouts',30,{mp:340},290,360,2,3],['fight','Face the flytrap patch',30,0,330,410,3,1],['boss','Valley of the Wind Boss',30,0,620,780,5,1]],
    jungle:[['act','Swing through the creepvines',30,0,270,340,2,3],['fight','Battle a wild gorilla',30,0,300,380,3,1],['act','Spar at the jungle gym',30,{atk:60},300,380,2,3],['fight','Face the jungle champions',30,0,340,420,3,1],['boss','Creepvine Jungle Boss',30,0,650,800,5,1]] });
  Object.assign(ZSCENE,{ valley:{sky:['#a8e0ff','#eaf8ff'],orb:'#ffffff',ox:72,oy:20,hills:['#8fd4a0','#5aa86a'],x:'valley'}, jungle:{sky:['#7ac88a','#d8f4d8'],orb:'#fff6c8',ox:24,oy:18,hills:['#3a9a4a','#226a30'],x:'jungle'} });
  Object.assign(ZCOL,{valley:['#eaf8ee','#c4e8cc'],jungle:['#e0f4e0','#b4dcb8']});
  Object.assign(TRACKS,{z_valley:TRACKS.z_beach, z_jungle:TRACKS.z_hollow});
  zoneScene=(function(prev){ const X={
      valley:()=>`<g fill="#fff" opacity=".85"><path d="M20 30 q20 -6 40 0 q-20 4 -40 0z M120 22 q24 -6 48 0 q-24 4 -48 0z"/></g><g fill="none" stroke="#fff" stroke-width="1.4" opacity=".8" stroke-linecap="round"><path d="M10 50 q14 -6 28 0 t28 0"/><path d="M130 46 q14 -6 28 0 t28 0"/></g><g fill="#5aa86a">${[16,30,170,186].map(x=>`<path d="M${x} 92 q-3 -12 0 -20 q3 8 0 20z"/>`).join('')}</g>`,
      jungle:()=>`<g fill="#1e5a28"><path d="M0 0 H200 V10 Q180 22 160 10 Q140 24 120 10 Q100 22 80 10 Q60 24 40 10 Q20 22 0 10Z"/></g><g fill="none" stroke="#2e7a3a" stroke-width="2.4" stroke-linecap="round"><path d="M30 8 q-4 20 4 36"/><path d="M90 8 q4 16 -2 30"/><path d="M168 8 q-6 22 4 40"/></g><g fill="#3a9a4a"><ellipse cx="34" cy="46" rx="5" ry="3"/><ellipse cx="172" cy="50" rx="5" ry="3"/></g>`};
    return function(id){ const z=ZSCENE[id]; if(!z||!X[z.x]) return prev(id); const g='zg'+id, ex=X[z.x](z);
      return `<svg class="zscene" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${z.sky[0]}"/><stop offset="1" stop-color="${z.sky[1]}"/></linearGradient></defs><rect width="200" height="100" fill="url(#${g})"/><circle cx="${z.ox}" cy="${z.oy}" r="9" fill="${z.orb}"/><path d="M0 70 Q50 56 100 66 T200 62 V100 H0Z" fill="${z.hills[0]}"/><path d="M0 84 Q60 72 120 82 T200 80 V100 H0Z" fill="${z.hills[1]}"/>${ex}</svg>`; }; })(zoneScene);
})();
// ability cards laid out like Monster Kingdom: icon with "level N" under it, then name, "mana cost: N" (or passive), then the description
function mkAbilCard(p){ if(p._mk) return; const b=p.querySelector('.pab-t > b'); if(!b) return; const sl=b.querySelector('.sl'); const pas=!!b.querySelector('.pastag')||p.classList.contains('pas');
  const locked=p.classList.contains('locked'); if(!(sl&&/^Lv\s*\d+/.test(sl.textContent))&&!locked) return; p._mk=1; p.classList.add('mkab');
  const ic=p.firstElementChild; const lv=sl?sl.textContent.replace(/^Lv\s*/,''):'';
  if(ic&&!ic.classList.contains('pab-t')){ const w=document.createElement('div'); w.className='pab-ic'; p.insertBefore(w,ic); w.appendChild(ic); if(lv) w.insertAdjacentHTML('beforeend',`<em>level ${lv}</em>`); }
  if(sl) sl.remove(); const tag=b.querySelector('.pastag'); if(tag) tag.remove();
  const span=b.nextElementSibling; let mana=null; if(span&&span.tagName==='SPAN'){ const m=span.innerHTML.match(/\s*·\s*(\d+)\s*mana\s*$/); if(m){ mana=m[1]; span.innerHTML=span.innerHTML.slice(0,m.index); } }
  if(!locked) b.insertAdjacentHTML('afterend',`<i class="pab-mc">${pas?'passive':mana?`mana cost: ${mana}`:'free'}</i>`); }
function mkAbilScan(root){ (root||document).querySelectorAll('.pabil .pab, .mi2-r .pab').forEach(mkAbilCard); }
new MutationObserver(ms=>{ for(const m of ms) for(const n of m.addedNodes){ if(n.nodeType===1&&(n.matches&&n.matches('.pab, .pabil, .sheet-wrap, .sheet, .prof, .mi2-r')||n.querySelector&&n.querySelector('.pab'))){ mkAbilScan(n.nodeType===1?n:document); } } }).observe(document.body,{childList:true,subtree:true});
// ---------- MK zone order (from George): Training Camp, then Mochi Beach ... Paleozoic Park ----------
var ZONE_ORDER=['meadow','beach','desert','hollow','grasslands','mintwood','valley','jungle','cliffs','enchanted','terajima','peaks','volcano','swamp','manor','lostcity','vale','skylands','kor','lab','cosmos','paleo'];
var ZONE_LV={beach:4,desert:8,hollow:12,grasslands:15,mintwood:18,valley:20,jungle:22,cliffs:24,enchanted:25,terajima:26,peaks:27,volcano:28,swamp:28,manor:29,lostcity:29,vale:29,skylands:30,kor:30,lab:30,cosmos:30,paleo:30};
function applyZoneOrder(){ const byId={}; ZONES.forEach(z=>byId[z.id]=z);
  ZONES.forEach(z=>{ const lv=ZONE_LV[z.id]; if(!lv||z.lv===lv||!ZTASKS[z.id]) return; const old=z.lv, r=lv/old;
    ZTASKS[z.id]=ZTASKS[z.id].map(t=>{ const u=t.slice(); u[2]=Math.max(1,Math.min(30,lv+(t[2]-old))); u[4]=Math.round(t[4]*r); u[5]=Math.round(t[5]*r);
      if(u[3]&&typeof u[3]==='object'){ u[3]=Object.assign({},u[3]); ['mp','hp','atk'].forEach(k=>{ if(u[3][k]) u[3][k]=Math.round(u[3][k]*r); }); } return u; }); z.lv=lv; });
  const next=ZONE_ORDER.map(id=>byId[id]).filter(Boolean).concat(ZONES.filter(z=>!ZONE_ORDER.includes(z.id)));
  ZONES.length=0; next.forEach(z=>ZONES.push(z));
  try{ if(S&&S.lastZone!=null&&!ZONES[S.lastZone]) S.lastZone=null; }catch(_){} }
applyZoneOrder();
// Training Camp has no monsters: your starter trains against the straw dummy, then Jay and Bob
ZTASKS.meadow=[['act','Play catch with your monster',1,0,10,15,2,2],['fight','Spar with the straw dummy',1,0,20,20,3,1,'dummy'],['act','Bring enough mana to class',1,{mp:50},20,20,2,3],
  ['fight','Spar with Jay',2,0,25,25,3,1,'jay'],['act','Pass the camp fitness test',2,{hp:90},25,25,2,3],['fight','Spar with Bob',2,0,25,25,3,1,'bob'],['boss','Graduation match: Jay & Bob',3,0,60,60,5,1,'grad']];
// Bushwhacker Swamp: the Insect family's real home (after Bolera Volcano)
(function(){ if(ZONES.some(z=>z.id==='swamp')) return;
  ZONES.push({id:'swamp', n:'Bushwhacker Swamp', fam:'bug', lv:28, sizes:[3,3,3,3], c:'#6a8a3a'});
  ZTASKS.swamp=[['act','Wade through the bog',28,0,250,320,2,3],['fight','Battle a wild insect',28,0,280,350,3,1],['act','Swat the swamp flies',29,{mp:320},280,350,2,3],['fight','Face the hive guard',29,0,320,400,3,1],['boss','Bushwhacker Swamp Boss',29,0,600,760,5,1]];
  ZSCENE.swamp={sky:['#8aa86a','#dfe8c8'],orb:'#f4f0c8',ox:68,oy:22,hills:['#6a8a3a','#3f5a22'],x:'swamp'}; ZCOL.swamp=['#e4ecd4','#c4d4a8']; TRACKS.z_swamp=TRACKS.z_hollow;
  zoneScene=(function(prev){ return function(id){ if(id!=='swamp') return prev(id); const z=ZSCENE.swamp, g='zgswamp';
    return `<svg class="zscene" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${z.sky[0]}"/><stop offset="1" stop-color="${z.sky[1]}"/></linearGradient></defs><rect width="200" height="100" fill="url(#${g})"/><circle cx="${z.ox}" cy="${z.oy}" r="9" fill="${z.orb}" opacity=".8"/><path d="M0 70 Q50 58 100 66 T200 62 V100 H0Z" fill="${z.hills[0]}"/><ellipse cx="100" cy="88" rx="70" ry="7" fill="#4a6a5a" opacity=".7"/><path d="M0 86 Q60 78 120 86 T200 84 V100 H0Z" fill="${z.hills[1]}"/><g fill="#3f5a22">${[14,28,172,188].map(x=>`<path d="M${x} 90 q-2 -16 1 -24 q2 10 1 24z"/><ellipse cx="${x+1}" cy="${66}" rx="1.6" ry="4" fill="#6b4a2b"/>`).join('')}</g></svg>`; }; })(zoneScene);
  applyZoneOrder();
})();
// ---------- Enchanted Forest (Equine) and Terajima Shrine (Bear), original art ----------
function horseNew(c1,c2,c3,st,id){ const G=id+'a', M=id+'m', H=id+'h'; const dk=shade(c1,-28); let d=`<defs>${grad(G,c1)}${grad(M,c2)}${grad(H,c3)}</defs>`, g='';
  const rainbow=c2==='RAINBOW'; if(rainbow){ d=`<defs>${grad(G,c1)}<linearGradient id="${M}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4a4a"/><stop offset=".25" stop-color="#ffb02a"/><stop offset=".5" stop-color="#f4e43a"/><stop offset=".72" stop-color="#3ac85a"/><stop offset="1" stop-color="#7a4ae0"/></linearGradient>${grad(H,c3)}</defs>`; }
  const s=[0.82,0.95,1][st];
  // wings (adult)
  if(st===2){ g+=`<path d="M46 52 Q30 30 14 30 Q22 34 20 40 Q12 40 8 46 Q18 46 18 52 Q10 54 8 60 Q24 58 40 62Z" fill="url(#${H})" ${s3}/><path d="M18 40 Q30 44 40 54 M18 52 Q30 54 40 60" fill="none" stroke="${OL3}" stroke-width="1" opacity=".5"/>`; }
  // tail
  g+=`<path d="M30 60 Q14 60 14 76 Q18 70 22 72 Q18 80 24 86 Q26 76 32 70Z" fill="url(#${M})" ${s3}/>`;
  // legs
  [[36,70,1],[44,72,0],[60,72,1],[66,70,0]].forEach(([x,y,b])=>{ g+=`<path d="M${x-3} ${y} L${x-3+ (b?-2:2)} 88 L${x+3+(b?-2:2)} 88 L${x+3} ${y}Z" fill="${b?dk:'url(#'+G+')'}" ${s3}/><rect x="${x-4+(b?-2:2)}" y="87" width="8" height="4" rx="1.5" fill="#d8b23a" ${s3} stroke-width="1.2"/>`; });
  // body
  g+=`<ellipse cx="50" cy="64" rx="${18*s+2}" ry="${11*s}" fill="url(#${G})" ${s3}/>`;
  // neck + head
  g+=`<path d="M60 60 Q62 46 66 38 L76 42 Q72 52 70 62Z" fill="url(#${G})" ${s3}/><path d="M64 34 Q74 28 84 36 Q88 42 84 46 Q78 48 72 46 Q64 44 64 34Z" fill="url(#${G})" ${s3}/>`;
  g+=`<ellipse cx="84" cy="43" rx="1.2" ry="1" fill="${OL3}"/><path d="M68 30 l2 -7 l4 6Z" fill="url(#${G})" ${s3} stroke-width="1.4"/>`;
  // mane
  g+=`<path d="M66 30 Q56 32 58 44 Q54 48 58 54 Q62 50 64 52 Q62 44 68 40 Q70 34 66 30Z" fill="url(#${M})" ${s3}/><path d="M68 30 Q72 26 76 30 Q72 32 68 33Z" fill="url(#${M})" ${s3} stroke-width="1.3"/>`;
  if(st>=1) g+=`<path d="M74 30 L${st===2?82:80} ${st===2?14:18} L77 31Z" fill="#f2d24a" ${s3} stroke-width="1.3"/><path d="M75 27 l4 -1 M76 23 l3 -1" stroke="${OL3}" stroke-width=".8"/>`;
  g+=eye3(75,36,st===0?3.8:3.2,'#2a1d16',st,4);
  return d+g; }
function bearNew(c1,c2,c3,st,id){ const G=id+'a', R=id+'r', F=id+'f'; const panda=c3==='PANDA'; const face=panda?'#f4f0ea':shade(c1,30); let d=`<defs>${grad(G,c1)}${grad(R,c2)}${grad(F,face)}</defs>`, g='';
  if(st===0){ // cub in a straw hat
    g+=`<ellipse cx="50" cy="78" rx="15" ry="13" fill="url(#${G})" ${s3}/><path d="M38 70 Q50 76 62 70 L62 84 Q50 90 38 84Z" fill="url(#${R})" ${s3}/>`;
    g+=`<ellipse cx="50" cy="58" rx="14" ry="12" fill="url(#${F})" ${s3}/>`+(panda?`<ellipse cx="44" cy="58" rx="4" ry="5" fill="#3a3448"/><ellipse cx="56" cy="58" rx="4" ry="5" fill="#3a3448"/>`:'');
    g+=eye3(44,58,3.6,'#3aa86a',0,-4)+eye3(56,58,3.6,'#3aa86a',0,4)+`<ellipse cx="50" cy="64" rx="2.2" ry="1.6" fill="${OL3}"/>`;
    g+=`<path d="M30 50 Q50 30 70 50 Z" fill="${c2}" ${s3}/><path d="M34 49 Q50 36 66 49" fill="none" stroke="${shade(c2,-25)}" stroke-width="1.2"/><circle cx="50" cy="38" r="2" fill="${shade(c2,-20)}"/>`;
    return d+g; }
  const big=st===2;
  g+=leg3(42,80,40,86,38,91,10,shade(c1,-20))+leg3(60,80,62,86,64,91,10,shade(c1,-20));
  g+=`<path d="M30 70 Q28 ${big?40:46} 50 ${big?38:44} Q72 ${big?40:46} 70 70 Q68 84 50 84 Q32 84 30 70Z" fill="url(#${G})" ${s3}/>`;
  if(panda) g+=`<path d="M34 54 Q50 50 66 54 L66 64 Q50 60 34 64Z" fill="#3a3448"/>`;
  g+=`<path d="M32 52 Q50 62 68 52 L66 76 Q50 82 34 76Z" fill="url(#${R})" ${s3}/><circle cx="50" cy="62" r="4" fill="#f2c83a" ${s3} stroke-width="1.2"/><path d="M50 58.5 v7 M46.5 62 h7" stroke="${shade(c2,-30)}" stroke-width="1"/>`;
  if(big){ g+=`<path d="M64 46 L82 28" stroke="${OL3}" stroke-width="6" stroke-linecap="round"/><path d="M64 46 L82 28" stroke="#c99a3a" stroke-width="3.6" stroke-linecap="round"/><path d="M80 30 l5 -5" stroke="#8a8a8a" stroke-width="3" stroke-linecap="round"/>`; }
  [[30,58,24,72],[70,58,76,72]].forEach(([x0,y0,x1,y1])=>{ g+=`<path d="M${x0} ${y0} Q${x1} ${y0+4} ${x1} ${y1}" fill="none" stroke="${OL3}" stroke-width="10" stroke-linecap="round"/><path d="M${x0} ${y0} Q${x1} ${y0+4} ${x1} ${y1}" fill="none" stroke="${panda?'#3a3448':c1}" stroke-width="6.6" stroke-linecap="round"/>`; });
  const hy=big?30:36; [[40,-1],[60,1]].forEach(([x])=>{ g+=`<circle cx="${x}" cy="${hy-9}" r="4.6" fill="${panda?'#3a3448':'url(#'+G+')'}" ${s3}/>`; });
  g+=`<ellipse cx="50" cy="${hy}" rx="13" ry="11" fill="url(#${F})" ${s3}/>`+(panda?`<ellipse cx="45" cy="${hy}" rx="3.6" ry="4.4" fill="#3a3448"/><ellipse cx="55" cy="${hy}" rx="3.6" ry="4.4" fill="#3a3448"/>`:'');
  g+=`<ellipse cx="50" cy="${hy+5}" rx="5" ry="3.6" fill="${panda?'#f4f0ea':shade(c1,45)}" ${s3} stroke-width="1.1"/><ellipse cx="50" cy="${hy+4}" rx="1.8" ry="1.3" fill="${OL3}"/>`;
  g+=eye3(45,hy-1,2.8,'#3aa86a',st,-2)+eye3(55,hy-1,2.8,'#3aa86a',st,4);
  if(big) g+=`<path d="M46 ${hy+8} l1.4 2 l1.4 -2 M51 ${hy+8} l1.4 2 l1.4 -2" stroke="#fff" stroke-width="1" fill="none"/>`;
  return d+g; }
(function(){
  Object.assign(FAM,{ equine:{n:'Equine', el:'neutral', shape:'horse', base:{hp:76,atk:16,mp:50,spd:14}}, bear:{n:'Bear', el:'nature', shape:'bear', base:{hp:88,atk:17,mp:40,spd:9}} });
  [['cora','Cora','equine',['#f6f6fa','#3a7ae0','#eef4ff'],['feedback','blizzard','perseverance','roots']],
   ['nightmare','Nightmare','equine',['#4a4a52','#ff7a2a','#3a3a40'],['leech','thunder','invuln','pounce']],
   ['sleipnir','Sleipnir','equine',['#d8a868','#4a4a52','#e8d0a0'],['nshield','flame','natureswill','thickskin']],
   ['starlite','Starlite','equine',['#f6f6fa','RAINBOW','#ffffff'],['leech','regrowth','mshield','roots']],
   ['po','Po','bear',['#7a6a8a','#3ab84a','PANDA'],['invuln','purge','feed','sweaty']],
   ['grizz','Grizz','bear',['#b07a4a','#e0342a','#f0d0a0'],['feed','furyfist','hardened','double']],
   ['firefox','Firefox','bear',['#b84a5a','#f0a02a','PANDA'],['feedback','blast','charge','double']],
   ['iorek','Iorek','bear',['#eef2f6','#3a7ae0','#ffffff'],['regrowth','stormcloud','hardened','thickskin']]
  ].forEach(([id,n,fam,col,sk])=>{ if(SPI[id]) return; const sp={id,n,fam,col,tw:{},sk:sk.filter(k=>SK[k])}; SP.push(sp); SPI[id]=sp; });
  Object.assign(ATK_MOUTH,{horse:[1.8,1.4,1.0],bear:[1.5,1.3,1.0]});
  monSVG=(function(prev){ const F={horse:horseNew,bear:bearNew}; return function(spId,lvl,cls){ const sp=SPI[spId]; const shape=sp&&FAM[sp.fam]&&FAM[sp.fam].shape; if(!F[shape]) return prev(spId,lvl,cls);
    const st=stageOf(lvl); const k=c=>/^#/.test(c); const c1=mute(sp.col[0],16), c2=k(sp.col[1])?mute(sp.col[1],8):sp.col[1], c3=k(sp.col[2])?mute(sp.col[2],6):sp.col[2]; const id='m'+(GID++); const sc=[0.8,0.92,1][st];
    return `<svg class="${cls||''}" viewBox="-4 0 108 100"><g transform="translate(50 92) scale(${sc}) translate(-50 -92)">${F[shape](c1,c2,c3,st,id)}</g></svg>`; }; })(monSVG);
  const add=(id,n,fam,c,sky,hills,tasks)=>{ if(ZONES.some(z=>z.id===id)) return; ZONES.push({id,n,fam,lv:25,sizes:[3,3,3,3],c}); ZTASKS[id]=tasks; ZSCENE[id]={sky,orb:'#fffbe0',ox:70,oy:20,hills,x:id}; ZCOL[id]=[shade(hills[0],60),shade(hills[0],35)]; };
  add('enchanted','Enchanted Forest','equine','#7a5ac8',['#b8a0f0','#f0e8ff'],['#6ac88a','#3a8a5a'],
    [['act','Follow the glowing hoofprints',25,0,240,310,2,3],['fight','Battle a wild equine',25,0,270,340,3,1],['act','Collect fallen stardust',25,{mp:300},270,340,2,3],['fight','Face the moonlit herd',26,0,310,390,3,1],['boss','Enchanted Forest Boss',26,0,560,720,5,1]]);
  add('terajima','Terajima Shrine','bear','#c84a3a',['#ffc8a8','#fff0e0'],['#9ac86a','#5a8a3a'],
    [['act','Sweep the shrine steps',26,0,250,320,2,3],['fight','Battle a wild bear',26,0,280,350,3,1],['act','Meditate under the waterfall',26,{hp:520},280,350,2,3],['fight','Face the shrine guardians',27,0,320,400,3,1],['boss','Terajima Shrine Boss',27,0,580,740,5,1]]);
  TRACKS.z_enchanted=TRACKS.z_hollow; TRACKS.z_terajima=TRACKS.z_desert;
  zoneScene=(function(prev){ const X={
      enchanted:()=>`<g fill="#3a7a5a">${[14,40,160,186].map(x=>`<path d="M${x} 92 l10 -40 l10 40z"/>`).join('')}</g><g fill="#fff">${[[30,30],[60,18],[120,24],[150,40],[90,12],[170,20]].map(([x,y])=>`<path d="M${x} ${y-3} l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1z"/>`).join('')}</g>`,
      terajima:()=>`<g><rect x="80" y="48" width="40" height="4" fill="#c84a3a"/><path d="M74 44 Q100 38 126 44 L124 48 Q100 43 76 48Z" fill="#a83a2a"/><rect x="86" y="52" width="4" height="40" fill="#c84a3a"/><rect x="110" y="52" width="4" height="40" fill="#c84a3a"/></g><g fill="#ffb8c8">${[[30,40],[40,46],[160,36],[172,44]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5"/>`).join('')}</g>`};
    return function(id){ const z=ZSCENE[id]; if(!z||!X[id]) return prev(id); const g='zg'+id;
      return `<svg class="zscene" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${z.sky[0]}"/><stop offset="1" stop-color="${z.sky[1]}"/></linearGradient></defs><rect width="200" height="100" fill="url(#${g})"/><circle cx="${z.ox}" cy="${z.oy}" r="9" fill="${z.orb}"/><path d="M0 70 Q50 56 100 66 T200 62 V100 H0Z" fill="${z.hills[0]}"/><path d="M0 84 Q60 72 120 82 T200 80 V100 H0Z" fill="${z.hills[1]}"/>${X[id]()}</svg>`; }; })(zoneScene);
  applyZoneOrder();
})();
// ---------- remaining MK zones: placeholder versions of not-yet-seen abilities (fix numbers later from screenshots) ----------
(function(){ const P=(a,t)=>[a,+((t-a)/9).toFixed(4)];
  const A={
    pestilence:{n:'Pestilence',el:'nature',t:'enemy',k:'dot',mp:P(18,90),dot:'poison',tick:P(10,70),turns:4,desc:'Spreads a plague on the enemy, dealing {tick} nature damage each turn for {turns} turns.'},
    spiky:{n:'Spiky',el:'neutral',t:'passive',k:'passive',p:'hard',v:P(.08,.25),desc:'Always on: spikes reduce physical damage taken by {v}.'},
    explosivefist:{n:'Explosive Fist',el:'fire',t:'enemy',k:'hit',mp:P(14,80),m:P(1.1,1.6),desc:'An explosive punch that deals your regular attack plus extra fire damage.'},
    shell:{n:'Shell',el:'water',t:'self',k:'shield',mp:P(16,96),sh:'bubble',amt:P(45,260),turns:3,desc:'Hides in a hard shell that absorbs {amt} damage for {turns} turns.'},
    rubyshift:Object.assign({},SK.emeraldshift,{n:'Ruby Shift',el:'fire'}),
    sapphireshift:Object.assign({},SK.emeraldshift,{n:'Sapphire Shift',el:'water'}),
    topazshift:Object.assign({},SK.emeraldshift,{n:'Topaz Shift',el:'bolt'}),
    deathroll:{n:'Death Roll',el:'neutral',t:'enemy',k:'hit',mp:P(16,90),m:P(1.2,1.7),stun:P(.1,.3),desc:'Grabs the enemy and rolls, dealing heavy physical damage with a {stun} chance to stun.'},
    steamblast:{n:'Steam Blast',el:'water',t:'enemy',k:'hit',mp:P(20,120),dmg:P(26,200),desc:'Blasts scalding steam that deals {dmg} water damage.'},
    pollenbloom:Object.assign({},SK.regrowth,{n:'Pollen Bloom'}),
    flash:{n:'Flash',el:'bolt',t:'enemy',k:'hit',mp:P(12,70),dmg:P(12,90),stun:P(.15,.35),desc:'A blinding flash that deals {dmg} lightning damage with a {stun} chance to stun.'}};
  Object.keys(A).forEach(k=>{ if(!SK[k]){ SK[k]=A[k]; DEFAULT_SK[k]=JSON.parse(JSON.stringify(A[k])); } });
})();
// ---------- remaining MK families: original art from shared parts ----------
const ART2={};
function outl(d,w,c){ return `<path d="${d}" fill="none" stroke="${OL3}" stroke-width="${w+3.4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`; }
function eyesPair(x1,x2,y,r,iris,st,big){ return big? [x1,x2].map(x=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${s3}/><circle cx="${x+r*.3}" cy="${y+r*.1}" r="${r*.55}" fill="${OL3}"/><circle cx="${x}" cy="${y-r*.3}" r="${r*.2}" fill="#fff"/>`).join('') : eye3(x1,y,r,iris,st,-3)+eye3(x2,y,r,iris,st,4); }
// four-legged creature facing right
function quad(o,c1,c2,c3,st,id){ const G=id+'a', B=id+'b', C=id+'c'; const dk=shade(c1,-26); let d=`<defs>${grad(G,c1)}${grad(B,c2)}${grad(C,c3)}</defs>`, g='';
  const bw=[14,19,22][st], bh=[10,12,14][st], bx=46, by=[70,66,64][st], hx=bx+bw+4, hy=by-[8,12,14][st], hr=[11,9.5,10][st];
  // wings behind
  if(o.wings&&st>=1){ const w=st===2?1.2:.8; g+=`<path d="M${bx} ${by-6} Q${bx-20*w} ${by-34*w} ${bx-34*w} ${by-30*w} Q${bx-26*w} ${by-24*w} ${bx-30*w} ${by-16*w} Q${bx-20*w} ${by-14*w} ${bx-6} ${by-2}Z" fill="url(#${B})" ${s3}/>`; }
  // tail
  const tx=bx-bw+2, ty=by-2;
  if(o.tail==='bushy') g+=`<path d="M${tx} ${ty} Q${tx-16} ${ty-6} ${tx-14} ${ty-22} Q${tx-4} ${ty-14} ${tx+4} ${ty-4}Z" fill="url(#${B})" ${s3}/>`;
  else if(o.tail==='thin') g+=outl(`M${tx} ${ty} Q${tx-12} ${ty+2} ${tx-14} ${ty-10}`,3,c1);
  else if(o.tail==='long') g+=outl(`M${tx} ${ty+2} Q${tx-18} ${ty+6} ${tx-26} ${ty-2}`,6,c1);
  else if(o.tail==='tuft') g+=outl(`M${tx} ${ty} Q${tx-10} ${ty+4} ${tx-12} ${ty+12}`,2.4,dk)+`<ellipse cx="${tx-12}" cy="${ty+14}" rx="3" ry="4" fill="${c2}" ${s3} stroke-width="1.2"/>`;
  // legs
  const legs=[[bx-bw+6,1],[bx-bw+12,0],[bx+bw-10,1],[bx+bw-4,0]];
  legs.forEach(([x,back])=>{ g+=leg3(x,by+bh-4,x+(back?-1:1),by+bh+6,x,91,o.thin?4:6,back?dk:shade(c1,-10)); if(o.hooves) g+=`<rect x="${x-3.4}" y="88.5" width="7" height="3.4" rx="1.2" fill="${OL3}"/>`; });
  // body
  g+=`<ellipse cx="${bx}" cy="${by}" rx="${bw}" ry="${bh}" fill="url(#${G})" ${s3}/>`;
  if(o.belly) g+=`<ellipse cx="${bx+2}" cy="${by+bh*.45}" rx="${bw*.65}" ry="${bh*.4}" fill="${c3}" opacity=".8"/>`;
  if(o.stripes) for(let k=0;k<3+st;k++){ const x=bx-bw*.5+k*(bw/(2+st)); g+=`<path d="M${x} ${by-bh+2} q3 ${bh*.6} 0 ${bh}" fill="none" stroke="${c2}" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>`; }
  if(o.spikes) for(let k=0;k<3+st*2;k++){ const x=bx-bw*.7+k*(bw*1.4/(2+st*2)); g+=`<path d="M${x-3} ${by-bh+2} L${x} ${by-bh-4-st*2} L${x+3} ${by-bh+2}Z" fill="${c2}" ${s3} stroke-width="1.4"/>`; }
  if(o.crystals&&st>=1) for(let k=0;k<2+st*2;k++){ const x=bx-bw*.6+k*(bw*1.2/(1+st*2)), h=6+st*4+(k%2)*4; g+=`<path d="M${x-3.4} ${by-bh+3} L${x-1} ${by-bh-h} L${x+3.4} ${by-bh+3}Z" fill="url(#${B})" ${s3} stroke-width="1.4"/><path d="M${x-1} ${by-bh-h+2} L${x} ${by-bh+2}" stroke="#fff" stroke-width="1" opacity=".7"/>`; }
  if(o.mane) g+=`<path d="M${hx-10} ${hy-6} Q${hx-20} ${hy+4} ${hx-14} ${hy+16} Q${hx-6} ${hy+12} ${hx-2} ${hy+14}Z" fill="url(#${B})" ${s3}/>`;
  if(o.leaves&&st>=1) for(let k=0;k<2+st*2;k++){ const x=bx-bw*.6+k*(bw*1.2/(1+st*2)); g+=`<path d="M${x} ${by-bh+2} q-4 -8 0 -12 q4 4 0 12z" fill="${c2}" ${s3} stroke-width="1.2"/>`; }
  if(o.flower&&st>=1) g+=`<g transform="translate(${bx-2} ${by-bh-4}) scale(${st===2?1.3:.9})">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-5" rx="3.4" ry="5" transform="rotate(${a})" fill="${c3}" ${s3} stroke-width="1.1"/>`).join('')}<circle r="3" fill="#f2c83a" ${s3} stroke-width="1"/></g>`;
  // neck + head
  if(o.neck) g+=`<path d="M${hx-10} ${by-4} Q${hx-6} ${hy+6} ${hx-2} ${hy+2} L${hx+6} ${hy+6} Q${hx} ${by-2} ${hx-2} ${by+2}Z" fill="url(#${G})" ${s3}/>`;
  const sn=o.snout||'short';
  if(o.beak){ g+=`<circle cx="${hx}" cy="${hy}" r="${hr}" fill="url(#${B})" ${s3}/><path d="M${hx+hr-3} ${hy-3} Q${hx+hr+9} ${hy} ${hx+hr+2} ${hy+6} Q${hx+hr-2} ${hy+4} ${hx+hr-3} ${hy+2}Z" fill="#f2b83a" ${s3} stroke-width="1.4"/>`;
    if(st>=1) g+=`<path d="M${hx-6} ${hy-hr+1} Q${hx-12} ${hy-hr-8} ${hx-2} ${hy-hr-4} Q${hx} ${hy-hr-10} ${hx+4} ${hy-hr}Z" fill="url(#${B})" ${s3} stroke-width="1.4"/>`; }
  else { g+=`<ellipse cx="${hx}" cy="${hy}" rx="${hr}" ry="${hr*.92}" fill="url(#${G})" ${s3}/>`;
    if(sn==='long') g+=`<path d="M${hx+hr-4} ${hy-2} L${hx+hr+14} ${hy} Q${hx+hr+16} ${hy+5} ${hx+hr+12} ${hy+6} L${hx+hr-4} ${hy+5}Z" fill="url(#${G})" ${s3}/>`+(o.teeth?`<path d="M${hx+hr} ${hy+5} l2 2 l2 -2 l2 2 l2 -2 l2 2" fill="#fff" stroke="${OL3}" stroke-width=".8"/>`:'');
    else g+=`<ellipse cx="${hx+hr*.7}" cy="${hy+hr*.3}" rx="${hr*.5}" ry="${hr*.38}" fill="${c3}" ${s3} stroke-width="1.3"/><ellipse cx="${hx+hr*1.05}" cy="${hy+hr*.2}" rx="1.6" ry="1.2" fill="${OL3}"/>`; }
  if(o.mask) g+=`<path d="M${hx-hr*.8} ${hy-hr*.35} Q${hx} ${hy-hr*.1} ${hx+hr*.9} ${hy-hr*.45} L${hx+hr*.8} ${hy+hr*.15} Q${hx} ${hy+hr*.3} ${hx-hr*.7} ${hy+hr*.1}Z" fill="${OL3}" opacity=".8"/>`;
  // ears
  const ex=hx-hr*.35, ey=hy-hr*.75;
  if(o.ears==='long') [[0,0],[5,8]].forEach(([dx,a])=>{ g+=`<ellipse cx="${ex+dx}" cy="${ey-9-st*2}" rx="3.4" ry="${9+st*2}" transform="rotate(${-10+a} ${ex+dx} ${ey})" fill="url(#${G})" ${s3}/>`; });
  else if(o.ears==='round') [[-3],[6]].forEach(([dx])=>{ g+=`<circle cx="${ex+dx}" cy="${ey}" r="3.6" fill="url(#${G})" ${s3}/>`; });
  else if(o.ears==='point') [[-2],[6]].forEach(([dx])=>{ g+=`<path d="M${ex+dx-3.4} ${ey+3} L${ex+dx} ${ey-7} L${ex+dx+3.4} ${ey+3}Z" fill="url(#${G})" ${s3} stroke-width="1.5"/>`; });
  if(o.antlers&&st>=1){ const s=st===2?1.4:1; [[-2],[5]].forEach(([dx])=>{ g+=outl(`M${ex+dx} ${ey} L${ex+dx-2*s} ${ey-12*s} M${ex+dx-1*s} ${ey-6*s} L${ex+dx-7*s} ${ey-10*s} M${ex+dx-2*s} ${ey-10*s} L${ex+dx+3*s} ${ey-16*s}`,1.8,o.antlers); }); }
  if(o.horns){ const s=[.6,.9,1.2][st]; g+=`<path d="M${ex} ${ey+2} Q${ex-8*s} ${ey-2} ${ex-6*s} ${ey-10*s} Q${ex-2} ${ey-4} ${ex+3} ${ey+2}Z" fill="#f0e6c8" ${s3} stroke-width="1.4"/>`; }
  if(o.horn&&st>=1) g+=`<path d="M${hx+2} ${hy-hr} L${hx+6} ${hy-hr-10-st*3} L${hx+7} ${hy-hr+1}Z" fill="#f0e6c8" ${s3} stroke-width="1.4"/>`;
  g+=eyesPair(hx-1,hx+5,hy-2,st===0?3.6:3,o.iris||'#2a1d16',st,o.bigEyes);
  if(o.spark&&st>=1) g+=`<path d="M${hx-14} ${hy-6} l6 -4 l-2 5 l7 -3" fill="none" stroke="#f2d24a" stroke-width="2.4" stroke-linejoin="round"/>`;
  return d+g; }
// two-legged creature
function biped(o,c1,c2,c3,st,id){ const G=id+'a', B=id+'b', C=id+'c'; const dk=shade(c1,-24); let d=`<defs>${grad(G,c1)}${grad(B,c2)}${grad(C,c3)}</defs>`, g='';
  const bw=[11,14,17][st], bh=[11,15,18][st], by=[78,72,68][st], hy=by-bh-[8,8,9][st], hr=[11,10,11][st];
  if(o.wings&&st>=1){ const w=st===2?1.25:.85; [[-1],[1]].forEach(([s])=>{ g+=`<path d="M${50+s*6} ${by-bh+4} Q${50+s*30*w} ${by-bh-16*w} ${50+s*34*w} ${by-bh+6} Q${50+s*24*w} ${by-bh+2} ${50+s*22*w} ${by-bh+12} Q${50+s*16} ${by-bh+8} ${50+s*8} ${by-bh+12}Z" fill="url(#${B})" ${s3}/>`; }); }
  if(o.tail==='ring') { g+=`<path d="M${50-bw} ${by+4} Q${50-bw-16} ${by} ${50-bw-12} ${by-20} Q${50-bw-2} ${by-12} ${50-bw+4} ${by-2}Z" fill="url(#${G})" ${s3}/>`; [0,1,2].forEach(k=>{ g+=`<path d="M${50-bw-13+k*2} ${by-6-k*5} q4 -1 8 2" fill="none" stroke="${OL3}" stroke-width="2.4" opacity=".75"/>`; }); }
  if(o.tail==='skunk') g+=`<path d="M${50-bw} ${by+4} Q${50-bw-20} ${by-4} ${50-bw-8} ${by-30} Q${50-bw+2} ${by-20} ${50-bw+6} ${by-4}Z" fill="${OL3}" ${s3}/><path d="M${50-bw-10} ${by-4} Q${50-bw-14} ${by-14} ${50-bw-8} ${by-26}" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>`;
  if(o.tail==='lizard') g+=outl(`M${50-bw+2} ${by+6} Q${50-bw-14} ${by+12} ${50-bw-22} ${by+4}`,6,c1);
  if(o.tail==='fin') g+=`<path d="M${50-bw+2} ${by+4} Q${50-bw-14} ${by+6} ${50-bw-20} ${by-6} L${50-bw-16} ${by+12} Q${50-bw-6} ${by+10} ${50-bw+2} ${by+10}Z" fill="url(#${G})" ${s3}/>`;
  g+=leg3(50-bw*.45,by+bh-6,50-bw*.5,by+bh,48-bw*.5,91,o.chunky?8:6,dk)+leg3(50+bw*.45,by+bh-6,50+bw*.5,by+bh,52+bw*.5,91,o.chunky?8:6,shade(c1,-12));
  g+=`<ellipse cx="50" cy="${by}" rx="${bw}" ry="${bh}" fill="url(#${G})" ${s3}/>`;
  if(o.belly) g+=`<ellipse cx="51" cy="${by+bh*.2}" rx="${bw*.6}" ry="${bh*.6}" fill="${c3}" opacity=".85"/>`;
  if(o.armor&&st>=1) g+=`<path d="M${50-bw+2} ${by-bh*.4} Q50 ${by-bh*.1} ${50+bw-2} ${by-bh*.4} L${50+bw-3} ${by+bh*.4} Q50 ${by+bh*.7} ${50-bw+3} ${by+bh*.4}Z" fill="url(#${B})" ${s3}/>`;
  if(o.robe&&st>=1) g+=`<path d="M${50-bw+1} ${by-bh*.5} L${50+bw-1} ${by-bh*.5} L${50+bw} ${by+bh*.8} L${50-bw} ${by+bh*.8}Z" fill="url(#${B})" ${s3}/>`;
  if(o.ribs&&st>=1) for(let k=0;k<3;k++) g+=`<path d="M${44} ${by-bh*.3+k*4} q6 2 12 0" fill="none" stroke="#f0ece0" stroke-width="2" stroke-linecap="round"/>`;
  if(o.spikes) for(let k=0;k<2+st;k++){ const y=by-bh*.6+k*6; g+=`<path d="M${50-bw+1} ${y} l-6 -2 l5 5Z" fill="${c2}" ${s3} stroke-width="1.2"/>`; }
  if(o.crystals&&st>=1) for(let k=0;k<2+st*2;k++){ const x=50-bw*.8+k*(bw*1.6/(1+st*2)), h=6+st*5+(k%2)*5; g+=`<path d="M${x-3.4} ${by-bh+4} L${x} ${by-bh-h} L${x+3.4} ${by-bh+4}Z" fill="url(#${B})" ${s3} stroke-width="1.4"/>`; }
  // arms
  const ay=by-bh*.45; g+=outl(`M${50-bw+2} ${ay} Q${50-bw-8} ${ay+6} ${50-bw-6} ${ay+14}`,o.chunky?6:4.4,c1)+outl(`M${50+bw-2} ${ay} Q${50+bw+8} ${ay+6} ${50+bw+6} ${ay+14}`,o.chunky?6:4.4,c1);
  if(o.claws) g+=`<path d="M${50-bw-9} ${ay+15} l-2 3 M${50-bw-6} ${ay+16} l0 3 M${50+bw+9} ${ay+15} l2 3 M${50+bw+6} ${ay+16} l0 3" stroke="${OL3}" stroke-width="1.4"/>`;
  if(o.sword&&st>=1){ g+=outl(`M${50+bw+6} ${ay+14} L${50+bw+16} ${ay-10}`,2.6,'#d8dce4')+`<path d="M${50+bw+3} ${ay+12} l8 -1" stroke="#c99a3a" stroke-width="3" stroke-linecap="round"/>`; }
  if(o.shield&&st>=1) g+=`<path d="M${50-bw-14} ${ay+2} L${50-bw-2} ${ay+2} L${50-bw-3} ${ay+16} Q${50-bw-8} ${ay+22} ${50-bw-13} ${ay+16}Z" fill="url(#${B})" ${s3}/>`;
  if(o.knife&&st>=1) g+=outl(`M${50+bw+6} ${ay+14} L${50+bw+10} ${ay+2}`,2.4,'#dfe4ea');
  if(o.scythe&&st===2) g+=outl(`M${50+bw+6} ${ay+18} L${50+bw+12} ${ay-22}`,2.4,'#8a6a4a')+`<path d="M${50+bw+12} ${ay-22} Q${50+bw-6} ${ay-28} ${50+bw-10} ${ay-14} Q${50+bw-2} ${ay-20} ${50+bw+11} ${ay-18}Z" fill="#dfe4ea" ${s3} stroke-width="1.4"/>`;
  // head
  const hx=50+(o.lean||0);
  if(o.tv){ g+=`<rect x="${hx-hr}" y="${hy-hr}" width="${hr*2}" height="${hr*1.9}" rx="4" fill="#4a4e58" ${s3}/><rect x="${hx-hr+3}" y="${hy-hr+3}" width="${hr*2-6}" height="${hr*1.9-6}" rx="2.4" fill="#1a1c22"/>`;
    g+=st===0?`<path d="M${hx-4} ${hy-3} v3 M${hx+4} ${hy-3} v3 M${hx-5} ${hy+4} q5 4 10 0" stroke="#f2d24a" stroke-width="2" fill="none" stroke-linecap="round"/>`:`<ellipse cx="${hx-4}" cy="${hy-1}" rx="2" ry="3" fill="none" stroke="#f2d24a" stroke-width="1.8"/><ellipse cx="${hx+4}" cy="${hy-1}" rx="2" ry="3" fill="none" stroke="#f2d24a" stroke-width="1.8"/>`;
    if(st===2) g+=outl(`M${hx+4} ${hy-hr} l2 -8`,1.6,'#c84a3a');
    return d+g; }
  if(o.horns) [[-1],[1]].forEach(([s])=>{ g+=`<path d="M${hx+s*hr*.5} ${hy-hr*.6} Q${hx+s*hr*1.1} ${hy-hr*1.6} ${hx+s*hr*.7} ${hy-hr*2} Q${hx+s*hr*.6} ${hy-hr*1.3} ${hx+s*hr*.15} ${hy-hr*.8}Z" fill="${o.horns}" ${s3} stroke-width="1.4"/>`; });
  if(o.ears==='round') [[-1],[1]].forEach(([s])=>{ g+=`<circle cx="${hx+s*hr*.7}" cy="${hy-hr*.75}" r="${hr*.36}" fill="url(#${G})" ${s3}/>`; });
  if(o.ears==='point') [[-1],[1]].forEach(([s])=>{ g+=`<path d="M${hx+s*hr*.3} ${hy-hr*.7} L${hx+s*hr*.9} ${hy-hr*1.5} L${hx+s*hr*.95} ${hy-hr*.4}Z" fill="url(#${G})" ${s3} stroke-width="1.5"/>`; });
  if(o.antenna) [[-1],[1]].forEach(([s])=>{ g+=outl(`M${hx+s*3} ${hy-hr+1} Q${hx+s*6} ${hy-hr-6} ${hx+s*5} ${hy-hr-10}`,1.6,c1)+`<circle cx="${hx+s*5}" cy="${hy-hr-11}" r="2.2" fill="${c2}" ${s3} stroke-width="1"/>`; });
  if(o.fin) g+=`<path d="M${hx-4} ${hy-hr+1} Q${hx+2} ${hy-hr-12} ${hx+8} ${hy-hr-6} L${hx+6} ${hy-hr+3}Z" fill="url(#${G})" ${s3}/>`;
  if(o.crest) g+=`<path d="M${hx-6} ${hy-hr+2} Q${hx-4} ${hy-hr-10} ${hx+2} ${hy-hr-4} Q${hx+6} ${hy-hr-12} ${hx+8} ${hy-hr+2}Z" fill="url(#${B})" ${s3}/>`;
  g+=`<ellipse cx="${hx}" cy="${hy}" rx="${hr}" ry="${hr*.95}" fill="url(#${G})" ${s3}/>`;
  if(o.mask) g+=`<path d="M${hx-hr*.9} ${hy-hr*.25} Q${hx} ${hy} ${hx+hr*.9} ${hy-hr*.25} L${hx+hr*.8} ${hy+hr*.25} Q${hx} ${hy+hr*.35} ${hx-hr*.8} ${hy+hr*.25}Z" fill="${OL3}" opacity=".8"/>`;
  if(o.stripe) g+=`<path d="M${hx} ${hy-hr} L${hx} ${hy+hr*.2}" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>`;
  if(o.snout) g+=`<ellipse cx="${hx}" cy="${hy+hr*.38}" rx="${hr*.42}" ry="${hr*.3}" fill="${c3}" ${s3} stroke-width="1.2"/><ellipse cx="${hx}" cy="${hy+hr*.28}" rx="1.6" ry="1.2" fill="${OL3}"/>`;
  if(o.cyclops){ const r=st===0?5.4:4.6; g+=`<circle cx="${hx}" cy="${hy-2}" r="${r}" fill="#fff" ${s3}/><circle cx="${hx+1}" cy="${hy-1.6}" r="${r*.55}" fill="${o.iris||'#e0a020'}"/><circle cx="${hx+1.4}" cy="${hy-1.6}" r="${r*.25}" fill="${OL3}"/>`; }
  else g+=eyesPair(hx-hr*.4,hx+hr*.4,hy-hr*.12,st===0?3.8:3.2,o.iris||'#2a1d16',st,o.bigEyes);
  if(o.goggles&&st>=1) g+=`<path d="M${hx-hr} ${hy-hr*.15} H${hx+hr}" stroke="${OL3}" stroke-width="3"/><circle cx="${hx-hr*.4}" cy="${hy-hr*.12}" r="4" fill="none" stroke="${OL3}" stroke-width="2"/><circle cx="${hx+hr*.4}" cy="${hy-hr*.12}" r="4" fill="none" stroke="${OL3}" stroke-width="2"/>`;
  if(o.fangs) g+=`<path d="M${hx-hr*.4} ${hy+hr*.45} q${hr*.4} ${hr*.25} ${hr*.8} 0" fill="none" stroke="${OL3}" stroke-width="1.4"/><path d="M${hx-hr*.25} ${hy+hr*.5} l1 3 l1 -3 M${hx+hr*.15} ${hy+hr*.5} l1 3 l1 -3" fill="#fff" stroke="${OL3}" stroke-width=".8"/>`;
  else if(!o.snout) g+=`<path d="M${hx-hr*.35} ${hy+hr*.45} q${hr*.35} ${hr*.25} ${hr*.7} 0" fill="none" stroke="${OL3}" stroke-width="1.4" stroke-linecap="round"/>`;
  if(o.hat&&st>=1) g+=`<path d="M${hx-hr-4} ${hy-hr*.55} Q${hx} ${hy-hr*1.9} ${hx+hr+4} ${hy-hr*.55}Z" fill="url(#${B})" ${s3}/>`;
  return d+g; }
// one-offs
ART2.bat=(c1,c2,c3,st,id)=>{ const G=id+'a',B=id+'b'; let d=`<defs>${grad(G,c1)}${grad(B,c2)}</defs>`,g=''; const w=[.7,1,1.2][st], y=[66,58,54][st];
  [[-1],[1]].forEach(([s])=>{ g+=`<path d="M50 ${y} Q${50+s*16*w} ${y-18*w} ${50+s*34*w} ${y-10*w} Q${50+s*28*w} ${y} ${50+s*30*w} ${y+8*w} Q${50+s*22*w} ${y+2} ${50+s*18*w} ${y+10*w} Q${50+s*12} ${y+4} ${50+s*6} ${y+8}Z" fill="url(#${G})" ${s3}/>`; });
  if(st===2){ g+=`<path d="M38 ${y+6} Q50 ${y+40} 62 ${y+6} L58 ${y+30} L42 ${y+30}Z" fill="#c8302a" ${s3}/>`; g+=leg3(46,y+26,45,y+30,44,91,4,shade(c1,-20))+leg3(54,y+26,55,y+30,56,91,4,shade(c1,-20)); g+=`<rect x="42" y="${y+8}" width="16" height="20" rx="5" fill="#5a5a66" ${s3}/>`; }
  g+=`<ellipse cx="50" cy="${y+2}" rx="${10+st}" ry="${10+st}" fill="url(#${G})" ${s3}/>`+[[-1],[1]].map(([s])=>`<path d="M${50+s*4} ${y-6} L${50+s*9} ${y-16-st*2} L${50+s*10} ${y-4}Z" fill="url(#${G})" ${s3} stroke-width="1.4"/>`).join('');
  g+=eyesPair(46,54,y,3.4,'#f2c83a',st,st===0)+`<path d="M46 ${y+6} q4 3 8 0" fill="none" stroke="${OL3}" stroke-width="1.3"/><path d="M47 ${y+6.4} l1 2.4 l1 -2.4 M51 ${y+6.4} l1 2.4 l1 -2.4" fill="#fff" stroke="${OL3}" stroke-width=".7"/>`;
  if(st<2) g+=`<ellipse cx="50" cy="90" rx="10" ry="2" fill="rgba(0,0,0,.12)"/>`; return d+g; };
ART2.ghost=(c1,c2,c3,st,id)=>{ const G=id+'a',B=id+'b'; let d=`<defs>${grad(G,c1)}${grad(B,c2)}</defs>`,g=''; const s=[.8,1,1.15][st];
  if(st===2) g+=outl('M70 86 L76 30',2.4,'#8a6a4a')+`<path d="M76 30 Q56 22 50 36 Q60 30 75 34Z" fill="#dfe4ea" ${s3} stroke-width="1.4"/>`;
  g+=`<path d="M${50-16*s} 84 Q${50-18*s} ${56-14*s} 50 ${44-12*s} Q${50+18*s} ${56-14*s} ${50+16*s} 84 L${50+10*s} 80 L${50+4*s} 86 L${50-3*s} 80 L${50-9*s} 86Z" fill="url(#${st>=1?B:G})" ${s3}/>`;
  const fy=60-6*s; if(st>=1) g+=`<ellipse cx="50" cy="${fy}" rx="${10*s}" ry="${9*s}" fill="${st===2?'#1a1c22':'#f6f6fa'}" ${s3} stroke-width="1.3"/>`;
  g+=st===2?`<circle cx="46" cy="${fy-2}" r="2.2" fill="#7ae04a"/><circle cx="54" cy="${fy-2}" r="2.2" fill="#7ae04a"/><path d="M44 ${fy+4} l2 2 l2 -2 l2 2 l2 -2 l2 2" fill="none" stroke="#7ae04a" stroke-width="1.4"/>`:`<ellipse cx="45.5" cy="${fy-1}" rx="2.6" ry="3.4" fill="${OL3}"/><ellipse cx="54.5" cy="${fy-1}" rx="2.6" ry="3.4" fill="${OL3}"/><path d="M44 ${fy+5} q6 5 12 0Z" fill="${OL3}"/>`;
  g+=`<ellipse cx="50" cy="91" rx="12" ry="2" fill="rgba(0,0,0,.12)"/>`; return d+g; };
ART2.pumpkin=(c1,c2,c3,st,id)=>{ const G=id+'a',B=id+'b'; let d=`<defs>${grad(G,c1)}${grad(B,c2)}</defs>`,g=''; const py=[76,48,42][st], r=[14,12,13][st];
  if(st>=1){ g+=leg3(45,py+30,44,py+36,43,91,5,'#6b4a2b')+leg3(55,py+30,56,py+36,57,91,5,'#6b4a2b'); g+=`<path d="M40 ${py+12} Q50 ${py+8} 60 ${py+12} L58 ${py+32} L42 ${py+32}Z" fill="${st===2?'url(#'+B+')':'#c8a86a'}" ${s3}/>`; g+=outl(`M41 ${py+16} Q32 ${py+22} 34 ${py+30}`,4,'#c8a86a')+outl(`M59 ${py+16} Q68 ${py+22} 66 ${py+30}`,4,'#c8a86a'); if(st===2) g+=outl(`M66 ${py+30} L72 ${py+16}`,2.4,'#dfe4ea'); }
  g+=`<ellipse cx="50" cy="${py}" rx="${r+3}" ry="${r}" fill="url(#${G})" ${s3}/><path d="M50 ${py-r} Q44 ${py} 50 ${py+r} M50 ${py-r} Q56 ${py} 50 ${py+r} M${50-r*.7} ${py-r*.7} Q${50-r*1.1} ${py} ${50-r*.7} ${py+r*.7} M${50+r*.7} ${py-r*.7} Q${50+r*1.1} ${py} ${50+r*.7} ${py+r*.7}" fill="none" stroke="${shade(c1,-25)}" stroke-width="1.4"/>`;
  g+=`<path d="M49 ${py-r} q1 -6 5 -7" fill="none" stroke="#5a7a2a" stroke-width="3" stroke-linecap="round"/>`;
  g+=`<path d="M42 ${py-4} l4 -4 l3 4Z M52 ${py-4} l3 -4 l4 4Z" fill="#ffe27a" ${s3} stroke-width="1.1"/><path d="M41 ${py+4} l3 3 l3 -2 l3 3 l3 -3 l3 2 l3 -3 Q50 ${py+12} 41 ${py+4}Z" fill="#ffe27a" ${s3} stroke-width="1.1"/>`;
  if(st===0) g+=`<ellipse cx="50" cy="91" rx="14" ry="2" fill="rgba(0,0,0,.12)"/>`; return d+g; };
ART2.nautilus=(c1,c2,c3,st,id)=>{ const G=id+'a',B=id+'b',C=id+'c'; let d=`<defs>${grad(G,c1)}${grad(B,c2)}${grad(C,c3)}</defs>`,g=''; const s=[.75,.95,1.15][st];
  for(let k=0;k<4+st;k++){ const x=52+k*3; g+=outl(`M${x} ${84} q${2+k} 6 ${-2+k*2} 7`,2.2,c3); }
  g+=`<circle cx="${42}" cy="${74-8*s}" r="${18*s}" fill="url(#${G})" ${s3}/>`; for(let k=0;k<4;k++) g+=`<path d="M42 ${74-8*s} L${42+Math.cos(k*1.4)*18*s} ${74-8*s+Math.sin(k*1.4)*18*s}" stroke="${c2}" stroke-width="2.6" opacity=".85"/>`;
  g+=`<path d="M${42} ${74-8*s} m-6 0 a6 6 0 1 1 6 6" fill="none" stroke="${OL3}" stroke-width="1.6"/>`;
  if(st===2) for(let k=0;k<6;k++){ const a=-2.6+k*0.5; g+=`<path d="M${42+Math.cos(a)*18*s} ${74-8*s+Math.sin(a)*18*s} l${Math.cos(a)*6} ${Math.sin(a)*6} l3 2Z" fill="#f0e6c8" ${s3} stroke-width="1.1"/>`; }
  g+=`<ellipse cx="62" cy="78" rx="${11*s}" ry="${9*s}" fill="url(#${C})" ${s3}/>`+eyesPair(60,67,75,3,'#2a3a5a',st,st===0);
  return d+g; };
ART2.fishy=(o)=>(c1,c2,c3,st,id)=>{ const G=id+'a',B=id+'b'; let d=`<defs>${grad(G,c1)}${grad(B,c2)}</defs>`,g=''; const s=[.75,1,1.15][st], y=[74,64,58][st];
  g+=`<path d="M${50-20*s} ${y} L${50-34*s} ${y-12*s} Q${50-30*s} ${y} ${50-34*s} ${y+12*s}Z" fill="url(#${B})" ${s3}/>`;
  g+=`<path d="M${50-22*s} ${y} Q${50-14*s} ${y-16*s} ${50+8*s} ${y-14*s} Q${50+24*s} ${y-10*s} ${50+24*s} ${y} Q${50+22*s} ${y+12*s} ${50+4*s} ${y+13*s} Q${50-14*s} ${y+12*s} ${50-22*s} ${y}Z" fill="url(#${G})" ${s3}/>`;
  if(o.armor) for(let k=0;k<3+st;k++) g+=`<path d="M${50-12*s+k*7*s} ${y-12*s} q3 6 0 12" fill="none" stroke="${c2}" stroke-width="3" opacity=".8"/>`;
  if(o.spikes&&st>=1) for(let k=0;k<3+st;k++){ const x=50-10*s+k*7*s; g+=`<path d="M${x-3} ${y-13*s} L${x} ${y-20*s-st*2} L${x+3} ${y-13*s}Z" fill="url(#${B})" ${s3} stroke-width="1.2"/>`; }
  if(o.arms&&st>=1) g+=outl(`M${50+6*s} ${y+8*s} Q${50+12*s} ${y+18*s} ${50+20*s} ${y+16*s}`,4,c2)+`<circle cx="${50+21*s}" cy="${y+16*s}" r="${3+st}" fill="url(#${B})" ${s3}/>`;
  g+=eyesPair(50+12*s,50+18*s,y-4*s,st===0?3.4:2.8,'#2a3a5a',st,st===0)+`<path d="M${50+16*s} ${y+4*s} l${4*s} 1" stroke="${OL3}" stroke-width="1.4"/>`+(st===2?`<path d="M${50+14*s} ${y+5*s} l1.4 2 l1.4 -2 l1.4 2 l1.4 -2" fill="none" stroke="#fff" stroke-width="1"/>`:'');
  if(st===2) g+=`<path d="M${50+4*s} ${y+13*s} L${48} 91 M${50-6*s} ${y+12*s} L${42} 91" stroke="${OL3}" stroke-width="5" stroke-linecap="round"/><path d="M${50+4*s} ${y+13*s} L${48} 91 M${50-6*s} ${y+12*s} L${42} 91" stroke="${shade(c1,-15)}" stroke-width="2.6" stroke-linecap="round"/>`;
  else g+=`<ellipse cx="50" cy="91" rx="16" ry="2" fill="rgba(0,0,0,.1)"/>`;
  return d+g; };
const Q=o=>(c1,c2,c3,st,id)=>quad(o,c1,c2,c3,st,id), Bp=o=>(c1,c2,c3,st,id)=>biped(o,c1,c2,c3,st,id);
(function(){
  const FAMS={ haunts:['Haunts','neutral',{hp:76,atk:16,mp:50}], varmint:['Varmint','neutral',{hp:78,atk:17,mp:44}], fawna:['Fawna','nature',{hp:78,atk:15,mp:50}],
    griffyn:['Griffyn','neutral',{hp:80,atk:17,mp:46}], bunnirax:['Bunnirax','neutral',{hp:82,atk:18,mp:42}], gremlin:['Gremlin','fire',{hp:78,atk:17,mp:46}],
    crystalloid:['Crystalloid','neutral',{hp:80,atk:18,mp:46}], paleozar:['Paleozar','water',{hp:84,atk:17,mp:44}] };
  Object.keys(FAMS).forEach(k=>{ const [n,el,b]=FAMS[k]; FAM[k]={n,el,shape:'art2_'+k,base:Object.assign({spd:11},b)}; });
  const R=[
   ['vamp','Vamp','haunts',['#8a5ab8','#c8302a','#f0e6ff'],['manashards','feed','leech','sweaty'],ART2.bat],
   ['balth','Balth','haunts',['#f6f6fa','#4a4a8a','#ffffff'],['flicker','toxicfumes','feed','roots'],ART2.ghost],
   ['jackie','Jackie','haunts',['#f08a2a','#2a7a3a','#ffe27a'],['arclightning','bolt','berserk','thickskin'],ART2.pumpkin],
   ['zombear','Zombear','haunts',['#6aa84a','#7a5a9a','#d8f0c0'],['berserk','furyfist','fshield','pounce'],Bp({ears:'round',snout:1,chunky:1,ribs:1,claws:1,iris:'#7ae04a'})],
   ['garth','Garth','varmint',['#5a6a8a','#c8302a','#f0f0f4'],['trample','firefocus','firewall','hardened'],Bp({ears:'round',stripe:1,snout:1,armor:1,sword:1,shield:1})],
   ['timmeh','Timmeh','varmint',['#a8a8b0','#c89a5a','#f0f0f0'],['bolt','thunder','grounded','zap'],Bp({ears:'point',mask:1,snout:1,tail:'ring',claws:1})],
   ['vicks','Vicks','varmint',['#3a3a44','#5ae04a','#f0f0f0'],['cripple','poison','perseverance','camelback'],Bp({ears:'round',stripe:1,snout:1,tail:'skunk',goggles:1})],
   ['tanuchan','Tanuchan','varmint',['#b8682a','#c8a86a','#f0dcc0'],['arclightning','cripple','furyfist','spark'],Bp({ears:'round',mask:1,snout:1,tail:'ring',hat:1})],
   ['ayla','Ayla','fawna',['#d8a878','#f08ab8','#fff0e8'],['emberspit','firewall','grounded','moltencore'],Q({ears:'point',neck:1,thin:1,hooves:1,antlers:'#8a5a3a',flower:1,belly:1})],
   ['acteon','Acteon','fawna',['#b8482a','#f2d24a','#f0d0b0'],['bolt','arclightning','grounded','stormcloud'],Q({ears:'point',neck:1,thin:1,hooves:1,antlers:'#f2d24a',stripes:1,spark:1})],
   ['nifleos','Nifleos','fawna',['#e0c8a0','#7ad8e8','#ffffff'],['blizzard','mshield','roots','wave'],Q({ears:'point',neck:1,thin:1,hooves:1,antlers:'#a8f0ff',crystals:1,belly:1})],
   ['tatonka','Tatonka','fawna',['#7a4a2a','#3a9a3a','#c89a6a'],['nshield','natureswill','thickskin','leech'],Q({ears:'none',hooves:1,horns:1,mane:1,leaves:1,tail:'tuft'})],
   ['goldenbeak','Goldenbeak','griffyn',['#e8a83a','#f2d24a','#fff0c8'],['cripple','arclightning','hardened','zap'],Q({beak:1,wings:1,tail:'tuft',mane:1})],
   ['wildclaw','Wildclaw','griffyn',['#f0e6c8','#f2d24a','#ffffff'],['pestilence','poison','roots','invuln'],Q({beak:1,wings:1,tail:'tuft',mane:1})],
   ['feathercrown','Feathercrown','griffyn',['#f07ab0','#7ae04a','#ffe0f0'],['taunt','souleater','thickskin','pestilence'],Q({beak:1,wings:1,tail:'tuft',mane:1})],
   ['darkwing','Darkwing','griffyn',['#3a3a44','#3ac8e8','#5a5a66'],['souleater','mshield','sweaty','blizzard'],Q({beak:1,wings:1,tail:'tuft',mane:1,iris:'#3ac8e8'})],
   ['walarax','Walarax','bunnirax',['#a8c0d0','#f07a3a','#f0f4f8'],['devour','souleater','thickskin','spiky'],Q({ears:'long',tail:'bushy',spikes:1,mane:1,belly:1})],
   ['necrorax','Necrorax','bunnirax',['#8a8a90','#a85ac8','#f0ece0'],['devour','poison','pounce','pestilence'],Q({ears:'long',tail:'bushy',spikes:1,belly:1,iris:'#a85ac8'})],
   ['tanirax','Tanirax','bunnirax',['#3a6a9a','#5ad8f0','#c8e8f8'],['devour','blizzard','camelback','bubble'],Q({ears:'long',tail:'bushy',crystals:1,belly:1})],
   ['zayrax','Zayrax','bunnirax',['#5ac87a','#2a8a4a','#d8f8e0'],['devour','souleater','furyfist','haymaker'],Q({ears:'long',tail:'bushy',mane:1,horn:1,belly:1})],
   ['anung','Anung','gremlin',['#d8302a','#5a1a1a','#f0a08a'],['firewall','explosivefist','double','firefocus'],Bp({horns:'#3a1a1a',wings:1,goggles:1,chunky:1,fangs:1,tail:'lizard'})],
   ['grogg','Grogg','gremlin',['#7ab83a','#4a7a2a','#d8f0a8'],['acidbite','souleater','thickskin','regrowth'],Bp({cyclops:1,ears:'point',spikes:1,claws:1,chunky:1,fangs:1})],
   ['neriti','Neriti','gremlin',['#d8c0f0','#c83a8a','#f8f0ff'],['shell','blizzard','thickskin','wave'],Bp({antenna:1,bigEyes:1,armor:1,iris:'#3a7ae0'})],
   ['rom','Rom','gremlin',['#f2c83a','#5a5a66','#ffe27a'],['flash','zap','thickskin','thunder'],Bp({tv:1,armor:1})],
   ['crystalwulf','Crystalwulf','crystalloid',['#6a4a9a','#f2b83a','#e8d8f8'],['rubyshift','haymaker','furyfist','explosivefist'],Bp({ears:'point',snout:1,crystals:1,claws:1,chunky:1,tail:'lizard'})],
   ['sphyro','Sphyro','crystalloid',['#3a8ab8','#f08a2a','#f0f8ff'],['sapphireshift','wave','grounded','hydrate'],Bp({fin:1,belly:1,fangs:1,tail:'fin',claws:1,iris:'#d8f04a'})],
   ['necrodile','Necrodile','crystalloid',['#5a8a4a','#c8f05a','#d0e0c0'],['emeraldshift','feedback','roots','pestilence'],Q({snout:'long',teeth:1,tail:'long',spikes:1,crystals:1})],
   ['electyra','Electyra','crystalloid',['#f2a82a','#3aa8f0','#fff0c8'],['topazshift','thunder','grounded','arclightning'],ART2.fishy({spikes:1,arms:1})],
   ['leviatho','Leviatho','paleozar',['#e8c89a','#c87a3a','#d8b0e8'],['staticd','spark','pounce','bolt'],ART2.nautilus],
   ['salissor','Salissor','paleozar',['#3a8ad8','#f2c83a','#e8f0f8'],['deathroll','trample','furyfist','souleater'],Q({snout:'long',teeth:1,tail:'long',crystals:1,belly:1})],
   ['sturgiok','Sturgiok','paleozar',['#8a8a90','#b8823a','#e8e0d0'],['steamblast','splash','thickskin','hydrate'],ART2.fishy({armor:1,spikes:1})],
   ['florathor','Florathor','paleozar',['#a8c84a','#5a8a2a','#f05a4a'],['pollenbloom','natureswill','pounce','toxicfumes'],Q({snout:'short',tail:'long',spikes:1,flower:1,belly:1,iris:'#e0302a'})]];
  const DRAW={};
  R.forEach(([id,n,fam,col,sk,fn])=>{ DRAW[id]=fn; if(SPI[id]) return; const sp={id,n,fam,col,tw:{},sk:sk.filter(k=>SK[k])}; SP.push(sp); SPI[id]=sp; });
  Object.keys(FAMS).forEach(k=>ATK_MOUTH['art2_'+k]=[1.6,1.4,1.0]);
  monSVG=(function(prev){ return function(spId,lvl,cls){ const f=DRAW[spId]; if(!f) return prev(spId,lvl,cls); const sp=SPI[spId];
    const st=stageOf(lvl); const c1=mute(sp.col[0],16), c2=mute(sp.col[1],8), c3=mute(sp.col[2],6); const id='m'+(GID++); const sc=[0.8,0.92,1][st];
    return `<svg class="${cls||''}" viewBox="-4 0 108 100"><g transform="translate(50 92) scale(${sc}) translate(-50 -92)">${f(c1,c2,c3,st,id)}</g></svg>`; }; })(monSVG);
  // zones
  const Z=[['manor','Belmont Manor','haunts','#5a4a7a',['#5a4a7a','#c8b8e0'],['#4a5a3a','#2a3a22'],['Light the manor candles','Battle a wild haunt','Escape the hall of mirrors','Face the midnight ghouls']],
    ['lostcity','Lost City','varmint','#b89a5a',['#e8c88a','#fff4dc'],['#c8a86a','#8a6a3a'],['Dig up old relics','Battle a wild varmint','Disarm the temple traps','Face the ruin raiders']],
    ['vale','Watcher\'s Vale','fawna','#6ab88a',['#a8d8f0','#f0faff'],['#7ac86a','#4a8a3a'],['Follow the deer trail','Battle a wild fawna','Gather vale blossoms','Face the antlered herd']],
    ['skylands','Ayram Skylands','griffyn','#7ab8f0',['#7ab8f0','#eaf6ff'],['#e8f0f8','#b8c8d8'],['Ride the high winds','Battle a wild griffyn','Climb the floating isles','Face the sky lords']],
    ['kor','Ruins of Kor','bunnirax','#8a7a6a',['#c8a88a','#f4e8dc'],['#a8988a','#6a5a4a'],['Search the broken halls','Battle a wild bunnirax','Solve the rune doors','Face the ruin beasts']],
    ['lab','Dante\'s Lab','gremlin','#5a7a8a',['#3a4a5a','#a8c0d0'],['#5a6a7a','#2a3a4a'],['Sneak past the lasers','Battle a wild gremlin','Fix the power core','Face the lab experiments']],
    ['cosmos','Crystal Cosmos','crystalloid','#7a4ab8',['#2a1a5a','#7a5ac8'],['#5a3a9a','#3a1a6a'],['Mine star crystals','Battle a wild crystalloid','Cross the gem bridge','Face the crystal titans']],
    ['paleo','Paleozoic Park','paleozar','#8a9a4a',['#f0c88a','#fff4e0'],['#9ab84a','#5a7a2a'],['Track the giant footprints','Battle a wild paleozar','Hatch the ancient eggs','Face the ancient pack']]];
  Z.forEach(([id,n,fam,c,sky,hills,t])=>{ if(ZONES.some(z=>z.id===id)) return; ZONES.push({id,n,fam,lv:29,sizes:[3,3,3,3],c});
    ZTASKS[id]=[['act',t[0],29,0,280,350,2,3],['fight',t[1],29,0,310,390,3,1],['act',t[2],30,{mp:360},310,390,2,3],['fight',t[3],30,0,350,430,3,1],['boss',n+' Boss',30,0,680,840,5,1]];
    ZSCENE[id]={sky,orb:id==='cosmos'||id==='manor'?'#f4f0ff':'#fffbe0',ox:72,oy:20,hills,x:'z2'}; ZCOL[id]=[shade(hills[0],55),shade(hills[0],30)]; TRACKS['z_'+id]=TRACKS.z_hollow; });
  zoneScene=(function(prev){ return function(id){ const z=ZSCENE[id]; if(!z||z.x!=='z2') return prev(id); const g='zg'+id;
    const extra={manor:`<rect x="80" y="30" width="40" height="40" fill="#3a2a4a"/><path d="M76 32 L100 14 L124 32Z" fill="#2a1a3a"/><rect x="96" y="50" width="8" height="20" fill="#f2c83a" opacity=".7"/>`,
      lostcity:`<g fill="#b89a6a"><rect x="20" y="50" width="10" height="34"/><rect x="170" y="44" width="12" height="40"/><path d="M80 84 L100 40 L120 84Z"/></g>`,
      skylands:`<g fill="#b8a88a"><ellipse cx="40" cy="52" rx="20" ry="5"/><ellipse cx="160" cy="40" rx="16" ry="4"/></g><g fill="#fff" opacity=".9"><ellipse cx="90" cy="30" rx="20" ry="6"/></g>`,
      kor:`<g fill="#8a7a6a"><rect x="30" y="54" width="8" height="30"/><rect x="44" y="60" width="8" height="24"/><rect x="160" y="50" width="10" height="34"/></g>`,
      lab:`<g fill="#7a8a9a"><rect x="20" y="40" width="30" height="44"/><rect x="150" y="34" width="34" height="50"/></g><circle cx="35" cy="56" r="4" fill="#5af07a"/><circle cx="167" cy="50" r="4" fill="#f05a5a"/>`,
      cosmos:`<g fill="#fff">${[[20,20],[50,10],[130,16],[170,28],[100,8],[150,6]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.2"/>`).join('')}</g><g fill="#c8a8ff">${[[30,84],[170,84]].map(([x,y])=>`<path d="M${x-6} ${y} L${x} ${y-20} L${x+6} ${y}Z"/>`).join('')}</g>`,
      paleo:`<g fill="#5a7a2a">${[20,40,170].map(x=>`<path d="M${x} 90 q-6 -24 4 -34 q-2 16 2 34z"/>`).join('')}</g>`,
      vale:`<g fill="#ffd0e0">${[[30,44],[44,40],[160,46]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g>`}[id]||'';
    return `<svg class="zscene" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${z.sky[0]}"/><stop offset="1" stop-color="${z.sky[1]}"/></linearGradient></defs><rect width="200" height="100" fill="url(#${g})"/><circle cx="${z.ox}" cy="${z.oy}" r="9" fill="${z.orb}"/><path d="M0 70 Q50 56 100 66 T200 62 V100 H0Z" fill="${z.hills[0]}"/><path d="M0 84 Q60 72 120 82 T200 80 V100 H0Z" fill="${z.hills[1]}"/>${extra}</svg>`; }; })(zoneScene);
  applyZoneOrder();
})();
// Back on the missions screen returns to Zone and Monster Select, not home
drawTasks=(function(prev){ return function(){ prev(); if(!TASKSH) return; const T=TASKSH, b=T.sh.body.querySelector('#tb'); if(!b) return;
  b.onclick=()=>{ const zi=T.zi; T.sh.close(); if(!document.querySelector('.sheet-wrap .zsel')) setTimeout(()=>openZoneSelect(zi),60); }; }; })(drawTasks);
// battle info card in the Monster Kingdom layout: picture left, name + stats right, then effects, abilities, items below (whole card scrolls)
monInfo=(function(prev){ return function(b,s,i){ const r=prev(b,s,i); try{ const box=[...document.querySelectorAll('.minfo2')].pop(); if(!box||box._mk) return r; box._mk=1;
  const m=b.sides[s].mons[i]; const L=box.querySelector('.mi2-l'), R=box.querySelector('.mi2-r'); if(!L||!R) return r;
  const top=document.createElement('div'); top.className='mi3-top'; const info=document.createElement('div'); info.className='mi3-info';
  const art=L.querySelector('.mi-art'), nm=L.querySelector('.mi-nm'); top.appendChild(art); top.appendChild(info);
  if(nm){ info.appendChild(nm); nm.insertAdjacentHTML('afterend',`<span class="mi3-stage">${STAGE_N[stageOf(m.lvl)].toLowerCase()}</span>`); }
  L.querySelectorAll('.lb').forEach(x=>info.appendChild(x));
  info.insertAdjacentHTML('beforeend',`<div class="mi3-stats"><div><span>Attack</span><b>${m.atk}</b></div><div><span>Life</span><b>${m.maxhp}</b></div><div><span>Mana</span><b>${m.maxmp}</b></div></div>`);
  L.remove(); box.insertBefore(top,R); box.classList.add('mi3'); }catch(_){} return r; }; })(monInfo);
// Hardened (MK): reduces all incoming damage by a flat amount, 51 at level 10
(function(){ const P=(a,t)=>[a,+((t-a)/9).toFixed(4)];
  Object.assign(SK.hardened,{p:'hardF',v:P(6,51),desc:'Reduces incoming damage by {v}.'}); DEFAULT_SK.hardened=JSON.parse(JSON.stringify(SK.hardened));
  skillDesc=(function(prev){ return function(id,L){ if(id==='hardened') return `Reduces incoming damage by ${Math.round(lv(SK.hardened.v,L||1))}.`; return prev(id,L); }; })(skillDesc); })();
PAS_IC.hardF='shield';
// Roots uses the Life Bowl's red plus
MK_ICON.roots='mkroots';
icon=(function(prev){ return function(key,bg,size){ return key==='mkroots'?prev('plus','#e0475b',size):prev(key,bg,size); }; })(icon);
// stat +/- buttons: react on touch-down (no missed taps from the swipe-to-close sheet), hold to repeat
(function(){ let t=null, iv=null; const stop=()=>{ clearTimeout(t); clearInterval(iv); t=iv=null; };
  document.addEventListener('pointerdown',e=>{ const b=e.target.closest&&e.target.closest('.pbtns .pbtn'); if(!b||b.disabled) return; e.preventDefault(); e.stopPropagation();
    const sel=b.dataset.pm?`.pbtns .minus[data-pm="${b.dataset.pm}"]`:`.pbtns .plus[data-pp="${b.dataset.pp}"]`; const fire=()=>{ const x=document.querySelector(sel); if(x&&!x.disabled){ x._ok=1; x.click(); } else stop(); };
    fire(); stop(); t=setTimeout(()=>{ iv=setInterval(fire,90); },380); },true);
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>document.addEventListener(ev,stop,true));
  // swallow the browser's own click that follows the touch, so one tap = one point
  document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('.pbtns .pbtn'); if(!b) return; if(b._ok){ b._ok=0; return; } e.preventDefault(); e.stopImmediatePropagation(); },true);
})();
// Roots (MK): +52 life after each of its turns at level 10 (flat)
(function(){ const P=(a,t)=>[a,+((t-a)/9).toFixed(4)];
  Object.assign(SK.roots,{v:P(6,52)}); DEFAULT_SK.roots=JSON.parse(JSON.stringify(SK.roots));
  skillDesc=(function(prev){ return function(id,L){ if(id==='roots') return `Regenerates ${Math.round(lv(SK.roots.v,L||1))} life every turn.`; return prev(id,L); }; })(skillDesc); })();
// Roots: 53 at level 10, plus icon in the physical-attack color
(function(){ Object.assign(SK.roots,{v:[6,+((53-6)/9).toFixed(4)]}); DEFAULT_SK.roots=JSON.parse(JSON.stringify(SK.roots));
  icon=(function(prev){ return function(key,bg,size){ return key==='mkroots'?prev('plus',(EL.neutral||{}).c||bg,size):prev(key,bg,size); }; })(icon); })();
// Leech steals a fixed amount of mana (63 at level 10), not half the damage
(function(){ Object.assign(SK.leech,{mpSteal:[8,+((63-8)/9).toFixed(4)]}); DEFAULT_SK.leech=JSON.parse(JSON.stringify(SK.leech));
  skillDesc=(function(prev){ return function(id,L){ if(id==='leech'){ L=L||1; return `A natural attack that deals ${Math.round(lv(SK.leech.dmg,L))} damage and steals ${Math.round(lv(SK.leech.mpSteal,L))} mana.`; } return prev(id,L); }; })(skillDesc); })();
// Regrowth (MK): heals 123 life every turn for 4 turns, 82 mana at level 10; green plus icon; swirling leaves on the caster
(function(){ const P=(a,t)=>[a,+((t-a)/9).toFixed(4)];
  Object.assign(SK.regrowth,{hot:P(14,123),hotIsFlat:1,hotNow:1,turns:4,mp:P(14,82)}); DEFAULT_SK.regrowth=JSON.parse(JSON.stringify(SK.regrowth));
  if(SK.pollenbloom) Object.assign(SK.pollenbloom,{hot:SK.regrowth.hot,hotIsFlat:1});
  skillDesc=(function(prev){ return function(id,L){ if(id==='regrowth') return `Heals your life by ${Math.round(lv(SK.regrowth.hot,L||1))} every turn for ${SK.regrowth.turns} turns.`; return prev(id,L); }; })(skillDesc);
  MK_ICON.regrowth='mkregrow';
  icon=(function(prev){ return function(key,bg,size){ return key==='mkregrow'?prev('plus','#22a046',size):prev(key,bg,size); }; })(icon); })();
function fxRegrowLeaves(x,y,size){ const n=9; for(let i=0;i<n;i++){ const d=fxAt(x,y,'leaf',`<svg width="${size*.5}" height="${size*.3}" viewBox="0 0 20 12"><path d="M1 6 Q8 -2 19 6 Q8 14 1 6Z" fill="#5ae05a" fill-opacity=".85" stroke="#d8ffd0" stroke-width="1"/><path d="M2 6 L17 6" stroke="#2a9a3a" stroke-width=".8"/></svg>`);
    d.style.cssText+=`;width:${size*.5}px;height:${size*.3}px;margin:${-size*.15}px 0 0 ${-size*.25}px;pointer-events:none;z-index:60`;
    const a0=i/n*Math.PI*2, R=size*.55;
    d.animate([0,.25,.5,.75,1].map(t=>{ const a=a0+t*Math.PI*2.2, r=R*(0.4+0.6*Math.sin(Math.PI*Math.min(1,t*1.3))); return {transform:`translate(${Math.cos(a)*r}px,${Math.sin(a)*r*.7 - t*size*.4}px) rotate(${a*57}deg) scale(${0.6+0.6*Math.sin(Math.PI*t)})`,opacity:t<.85?1:0}; }),{duration:1200,delay:i*40,easing:'ease-out',fill:'both'}).onfinish=()=>d.remove(); }
  fxFlash(x,y,'nature',size*1.2); }
animateBattle=(function(prev){ return function(root,b,animating){ const r=prev(root,b,animating); if(!animating) return r;
  try{ const a=(b.ev||[]).find(e=>e.k==='act'); if(!a||(a.sk!=='regrowth'&&a.sk!=='pollenbloom')) return r; const ac=fEl(a.s,a.i); if(!ac) return r; const rr=localRect(ac.querySelector('.fart'));
    setTimeout(()=>fxRegrowLeaves(rr.left+rr.width/2,rr.top+rr.height/2,Math.max(60,rr.width*.8)),100); }catch(_){} return r; }; })(animateBattle);
// Regrowth effect text matches the ability: heals a flat amount each turn
stDesc=(function(prev){ return function(m,k){ if(k==='roots'){ const v=Math.round((m.st.rootsV||0)*m.maxhp), t=m.st.roots|0; return `Heals ${v} life every turn (${t} turn${t>1?'s':''})`; } return prev(m,k); }; })(stDesc);
// Soul Eater: level 3 = 84% damage, steals 42% of attack as mana, 16 mana (earlier I'd treated those as level-10 numbers)
Object.assign(SK.souleater,{m:[.8,.02],mpAtk:[.4,.01],mp:[8,4]}); DEFAULT_SK.souleater=JSON.parse(JSON.stringify(SK.souleater));
// Death Roll (MK): physical bite that heals 104 for 2 turns, 92 mana at level 10 (same effect as Devour)
(function(){ const P=(a,t)=>[a,+((t-a)/9).toFixed(4)];
  SK.deathroll={n:'Death Roll',el:'neutral',t:'enemy',k:'hit',m:[1,0],mp:P(10,92),hotFlat:P(14,104),turns:2}; DEFAULT_SK.deathroll=JSON.parse(JSON.stringify(SK.deathroll));
  skillDesc=(function(prev){ return function(id,L){ if(id==='deathroll') return `Grab your prey and take a bite out of them causing physical damage and healing for ${Math.round(lv(SK.deathroll.hotFlat,L||1))} health for ${SK.deathroll.turns} turns.`; return prev(id,L); }; })(skillDesc);
  ICON.mkdeathroll='<path d="M5 13.5 C5 7.5 10 4.5 14.5 6 C19 7.5 20 13 16 15.5 C13 17.4 9.5 15.6 10 12.6 C10.4 10.4 13.2 10 14.2 11.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><path d="M14.5 6 L19.5 5 L17 8.6Z" fill="#fff"/><circle cx="16.6" cy="7.4" r=".9" fill="#f05a22"/>';
  MK_ICON.deathroll='mkdeathroll'; })();
// Static Discharge: fixed damage that penetrates all shields and can't be raised or lowered
SK.staticd.trueDmg=1; DEFAULT_SK.staticd=JSON.parse(JSON.stringify(SK.staticd));
skillDesc=(function(prev){ return function(id,L){ const d=prev(id,L); return id==='staticd'&&!/Penetrates/.test(d)?d.replace(/\.$/,'')+'. Penetrates all shields.':d; }; })(skillDesc);

// ---------- Mana Heal (MK): restores 333 mana for 49 mana at level 10 ----------
(function(){ const P=(a,t)=>[a,+((t-a)/9).toFixed(4)];
  SK.manaheal={n:'Mana Heal',el:'water',t:'self',k:'heal',mp:P(10,49),mpHeal:P(40,333)}; DEFAULT_SK.manaheal=JSON.parse(JSON.stringify(SK.manaheal));
  // Air Current is a shield: a column of wind that cuts every hit while it's up
  SK.aircurrent={n:'Air Current',el:'bolt',t:'self',k:'shield',sh:'ash',mp:P(12,70),amt:P(8,60),turns:3}; DEFAULT_SK.aircurrent=JSON.parse(JSON.stringify(SK.aircurrent));
  ST_ICON.ash=[skIconKey('aircurrent'),'#7ac8e8']; BUFF_N.ash='Air Current';
  skillDesc=(function(prev){ return function(id,L){ L=L||1;
    if(id==='manaheal') return `Restores ${Math.round(lv(SK.manaheal.mpHeal,L))} mana.`;
    if(id==='aircurrent') return `Surrounds you in a column of wind that reduces each incoming hit by ${Math.round(lv(SK.aircurrent.amt,L))} for ${SK.aircurrent.turns} turns.`;
    return prev(id,L); }; })(skillDesc);
  stDesc=(function(prev){ return function(m,k){ if(k==='ash') return `Reduces each incoming hit by ${m.st.ashHp|0} (${m.st.ash} turn${m.st.ash>1?'s':''})`; return prev(m,k); }; })(stDesc);
})();
function fxColumn(x,y,w,h){ const d=fxAt(x,y,'aircol','<i></i>'); d.style.cssText+=`;width:${w}px;height:${h}px;margin:${-h*.62}px 0 0 ${-w/2}px;pointer-events:none;z-index:4`;
  d.animate([{opacity:0,transform:'scaleY(.2)'},{opacity:.85,transform:'scaleY(1)',offset:.25},{opacity:.75,offset:.75},{opacity:0}],{duration:1300,easing:'ease-out',fill:'both'}).onfinish=()=>d.remove(); }
animateBattle=(function(prev){ return function(root,b,animating){ const r=prev(root,b,animating); if(!animating) return r;
  try{ const a=(b.ev||[]).find(e=>e.k==='act'); if(!a||a.sk!=='aircurrent') return r; const ac=fEl(a.s,a.i); if(!ac) return r; const rr=localRect(ac.querySelector('.fart'));
    fxColumn(rr.left+rr.width/2,rr.top+rr.height/2,rr.width*1.1,rr.height*1.7); }catch(_){} return r; }; })(animateBattle);
// ---------- Sudden Death: 30 turns without a knockout -> red screen, then damage doubles every round ----------
act=(function(prev){ return function(b,action){ if(!b||b.over) return prev(b,action); const a=actor(b); if(!a) return prev(b,action);
  const isTurn=!(action&&action.swap!=null); // swapping in doesn't use up a turn
  let trig=false, c=b.sdC||0;
  if(isTurn){ if(!b.sd&&(b.sdN||0)>=30) trig=true; else if(b.sd) c++; }
  const on=b.sd||trig; b.sdMul=on&&c>0?1+Math.ceil(c/2):1; // trigger turn normal, then x2 x2 x3 x3 x4 ...
  const ko0=b.sides.reduce((t,sd)=>t+sd.mons.filter(m=>m.hp<=0).length,0);
  const r=prev(b,action); if(!r) return r;
  if(trig){ b.sd=true; c=0; (b.ev=b.ev||[]).unshift({k:'sudden'}); }
  b.sdC=c;
  const ko1=b.sides.reduce((t,sd)=>t+sd.mons.filter(m=>m.hp<=0).length,0);
  if(ko1>ko0){ if(b.sd) (b.ev=b.ev||[]).push({k:'sdoff'}); b.sdN=0; b.sd=false; b.sdC=0; b.sdMul=1; return r; }
  if(isTurn&&!b.sd) b.sdN=(b.sdN||0)+1;
  return r; }; })(act);
function sdSync(){ const bt=document.getElementById('battle'); if(!bt||!B) return; const on=!!(B&&B.b&&B.b.sd); if(on&&B._sdAt&&Date.now()<B._sdAt) return; if(!on&&B._sdOffAt&&Date.now()<B._sdOffAt) return; bt.classList.toggle('sdeath',on); }
animateBattle=(function(prev){ return function(root,b,animating){ const r=prev(root,b,animating);
  try{ const evs=b.ev||[]; if(animating&&evs.some(e=>e.k==='sudden')){ const tot=0; B._sdAt=0; setTimeout(()=>{ B._sdAt=0; sdSync(); const t=fxAt(0,0,'sdtext','Sudden Death!');
      t.animate([{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.06)',offset:.15},{opacity:1,transform:'scale(1)',offset:.7},{opacity:0,transform:'scale(1)'}],{duration:2200,fill:'both'}).onfinish=()=>t.remove(); },tot);
    } else if(animating&&evs.some(e=>e.k==='sdoff')){ const tot=(b._animTotal||evSchedule(b)||0); B._sdOffAt=Date.now()+tot; setTimeout(()=>{ B._sdOffAt=0; sdSync(); },tot); } else sdSync(); }catch(_){} return r; }; })(animateBattle);
renderBattle=(function(prev){ return function(){ prev(); sdSync(); }; })(renderBattle);
// ---------- Gains show only what actually fits: no +16 life at full health, +4 at 996/1000 ----------
act=(function(prev){ return function(b,action){ const n0=(b&&b.ev)?b.ev.length:0; const r=prev(b,action);
  if(r&&b&&b.ev){ b.ev=b.ev.filter(e=>{ if((e.k==='heal'||e.k==='mana')&&e.v>0){ if(e.rv!=null) e.v=e.rv; return true; } return true; }); }
  return r; }; })(act);
// ---------- Practice foes pick their own items to fit each monster (same number of items as yours) ----------
// what kind of fighter a monster is: physical hitters (neutral attacks, basic-attack boosters) vs mana/elemental casters
const AI_PHYS_PAS=['furyfist','berserk','pounce','trample','double','charge','focus'];
const AI_MANA_PAS=['absorb','mshield','camelback','manaheal','manashards','leech','feedback'];
function aiRole(spId){ const s=SPI[spId]; const sks=(s&&s.sk||[]).filter(id=>SK[id]);
  const off=sks.filter(id=>SK[id].t==='enemy'&&SK[id].k!=='passive');
  const physSk=off.filter(id=>SK[id].el==='neutral'&&SK[id].k!=='dot'), elemSk=off.filter(id=>SK[id].el!=='neutral');
  let ps=physSk.length*1.2+sks.filter(id=>AI_PHYS_PAS.includes(id)).length, ms=elemSk.length+sks.filter(id=>AI_MANA_PAS.includes(id)).length*1.2;
  const role=ps>=ms?'phys':'mana';
  const useSk=sks.filter(id=>{ const k=SK[id]; return (k.t==='enemy'&&k.k!=='passive'&&k.el==='neutral'&&!k.dmg&&k.k!=='dot')||(k.t==='self'&&k.k==='buff'); });
  const costs=useSk.map(id=>skCost(id,10)).sort((x,y)=>y-x); const physMana=costs.length?(costs[0]*2+(costs[1]||0)*2):0;
  const costly=sks.reduce((t,id)=>t+skCost(id,10),0)/Math.max(1,sks.length);
  return {sks,role,physMana,physFrac:role==='phys'?1:0.08,manaNeed:role==='mana'?1.4:(physMana>120?.9:physMana>40?.4:0),
    elFrac:el=>elemSk.filter(id=>SK[id].el===el&&SK[id].k!=='dot').length/Math.max(1,off.length)}; }
function aiLoadout(spId,lvl,count,vsEls){ const s=SPI[spId]; if(!s||count<=0) return []; const R=aiRole(spId);
  const phys=vsEls.length?vsEls.filter(e=>e==='neutral').length/vsEls.length:.5;
  const val=(id,have)=>{ const it=ITEMS[id], b=it.b||{}, f=it.fx||{}; let v=0;
    const nAtk=Object.keys(have).reduce((t,k)=>t+((ITEMS[k].b&&ITEMS[k].b.atk)?have[k]:0),0);
    v+=(b.atk|0)*7*R.physFrac*Math.pow(.62,nAtk)+(b.hp|0)*1.3+(b.mp|0)*(R.role==='mana'?1.15:.3*R.manaNeed);
    if(f.rhp) v+=f.rhp*4.5*(have[id]?0:1); if(f.rmp) v+=f.rmp*4*R.manaNeed*(have[id]?0:1);
    if(f.dwat) v+=f.dwat*9*R.elFrac('water'); if(f.dfir) v+=f.dfir*9*R.elFrac('fire'); if(f.dnat) v+=f.dnat*9*R.elFrac('nature');
    if(f.dflat) v+=f.dflat*8*R.physFrac-(f.tflat|0)*6;
    if(f.bphys||f.belem) v+=((f.bphys|0)*phys+(f.belem|0)*(1-phys))*5;
    return v*Math.pow(0.7,have[id]|0); };
  const pool=Object.keys(ITEMS).filter(id=>(ITEMS[id].lv|0)<=lvl&&!(typeof ONE_EACH!=='undefined'&&false)); const out=[], have={};
  for(let n=0;n<Math.min(5,count);n++){ let best=null,bv=0; pool.forEach(id=>{ const v=val(id,have)*(0.94+Math.random()*0.12); if(v>bv){ bv=v; best=id; } }); if(!best) break; out.push(best); have[best]=(have[best]|0)+1; }
  return out; }
// practice foes: always level 30 with level 10 abilities, stat points and items picked to fit how the monster fights
// one build routine for every computer-controlled team: points and items fit the monster's role, never a glass cannon
function aiBuild(fm,lvl,itemCount,vsEls){ const R=aiRole(fm.sp); fm.lvl=lvl; const skl={}; (SPI[fm.sp].sk||[]).forEach(id=>skl[id]=lvl>=MAXLVL?MAXSKL:Math.max(1,Math.min(MAXSKL,Math.ceil(lvl/3)))); fm.skl=skl;
  const items=aiLoadout(fm.sp,lvl,itemCount,vsEls);
  const pts=(lvl-1)*5; let wa=0, wm=0;
  if(R.role==='mana') wm=.4; else { const need=Math.max(0,R.physMana-statsOf(fm.sp,lvl).mp); wm=Math.min(.25,Math.ceil(need/PT.mp)/Math.max(1,pts)); wa=.45; }
  const wh=Math.max(.4,1-wa-wm); const tot=wa+wm+wh; wa/=tot; wm/=tot;
  const pa=Math.round(pts*wa), pm=Math.round(pts*wm), ph=pts-pa-pm;
  const b={atk:pa*PT.atk,hp:ph*PT.hp,mp:pm*PT.mp,spd:0}; items.forEach(id=>{ const it=ITEMS[id]; Object.entries(it.b||{}).forEach(([q,v])=>b[q]=(b[q]||0)+v); Object.entries(it.fx||{}).forEach(([q,v])=>b[q]=(b[q]||0)+v); });
  if(skl.souleater&&items.includes('manabowl')) skl.souleater=3; // 16 mana: the bowl pays for it every turn
  fm.bonus=b; fm.items=items; return fm; }
function aiVsEls(){ const v=[]; mySnap().forEach(m=>(SPI[m.sp].sk||[]).forEach(id=>{ const k=SK[id]; if(k&&k.t==='enemy') v.push(k.el); })); return v; }
// practice foes: always level 30 with level 10 abilities
practiceTeam=(function(prev){ return function(){ const t=prev(); try{ const mine=mySnap(), vs=aiVsEls();
    t.mons.forEach((fm,k)=>aiBuild(fm,MAXLVL,Math.max(((mine[k]||{}).items||[]).length,3),vs)); }catch(e){ console.warn('loadout',e); } return t; }; })(practiceTeam);
// computer trainers in the arena build the same way at your team's level
rivalTeam=(function(prev){ return function(){ const t=prev(); try{ const mine=mySnap(), vs=aiVsEls(); t.mons.forEach((fm,k)=>aiBuild(fm,fm.lvl,((mine[k]||{}).items||[]).length,vs)); }catch(e){ console.warn('rival',e); } return t; }; })(rivalTeam);
// ---------- AI judgment: don't throw DoTs into a Purge or onto a DoT that's already running ----------
function aiDotPenalty(b,s,o){ if(!o||o.swap!=null||!o.skill) return 0; const sk=SK[o.skill]; if(!sk||sk.k!=='dot') return 0;
  const foe=b.sides[1-s]; const tg=foe.mons[o.target!=null?o.target:foe.active]||foe.mons[foe.active]; if(!tg||tg.hp<=0) return 0;
  const cl=m=>m&&m.hp>0&&(m.sk||[]).some(id=>SK[id]&&SK[id].cleanse&&m.mp>=skCost(id,(m.skl||{})[id]||1));
  let p=0; if(tg.st&&tg.st[sk.dot]>1) p+=150; if(cl(tg)) p+=200; return p; }
// ---------- status / item icons: one tap shows what it does and it stays up; tap anywhere else to close ----------
removeEventListener('pointerup',hideTips,true); removeEventListener('touchend',hideTips,true);
addEventListener('pointerdown',e=>{ const h=e.target.closest&&e.target.closest('.hi[data-tip]'); if(!h) return;
  e.preventDefault(); e.stopPropagation(); if(TIPH===h&&document.querySelector('.tipb')){ TIPH=null; hideTips(); return; } TIPH=null; placeTip(h); TIPDRAG=true; },true);
addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('#battle .hi[data-tip]')){ e.preventDefault(); e.stopPropagation(); } },true);
// ---------- one pick at a time: when the pick timer runs out it chooses once, no flurry of "Go ...!" panels ----------
doPick=(function(prev){ return function(idx){ if(!B||B.going||B._picking) return; B._picking=true; closePick();
  const b=B.b, s=b.pickSide, seq=b.seq; prev(idx); const clear=()=>{ if(!B) return; if(B.b!==b||b.seq!==seq||b.phase!=='pick'||b.pickSide!==s||!B.going){ B._picking=false; return; } setTimeout(clear,120); }; setTimeout(clear,300); }; })(doPick);
autoMove=(function(prev){ return function(){ if(!B||B.going||B._picking) return; return prev(); }; })(autoMove);
// ---------- opening pick is a race vs the computer: whoever sends a monster out first moves first ----------
(function(){ const race=b=>b&&b.single&&b.phase==='pick'&&!b.round&&b.firstOut==null&&B&&!B.net&&B.ctl&&B.ctl.includes('ai')&&B.ctl.includes('human');
  const me=()=>B.ctl.indexOf('human');
  doPick=(function(prev){ return function(idx){ const b=B&&B.b; if(race(b)&&b.pickSide!==me()&&b.pickQ.includes(me())){ clearTimeout(B.timer); clearTimeout(B.aiPickT); b.pickQ=[me()].concat(b.pickQ.filter(x=>x!==me())); b.pickSide=me(); } return prev(idx); }; })(doPick);
  drive=(function(prev){ return function(){ const b=B&&B.b; if(!race(b)) return prev();
    renderBattle(); if(B.paused) return;
    if(!PICKEL&&!B.going&&!B._picking&&!B.auto) setTimeout(()=>{ if(B&&B.b===b&&race(b)&&!PICKEL&&!B.going&&!B._picking) openPick(me(),false); },350);
    if(B.ctl[b.pickSide]==='ai'){}
    else if(B.auto&&B.ctl[b.pickSide]==='human') prev(); }; })(drive);
  // the computer starts thinking when your pick panel is up, and takes 1.5-5s
  setInterval(()=>{ const b=B&&B.b; if(!race(b)||!PICKEL||B.aiPickT||B.ctl[b.pickSide]!=='ai') return; const s=b.pickSide;
    B.aiPickT=setTimeout(()=>{ B.aiPickT=null; if(!B||B.b!==b||!race(b)||b.pickSide!==s||B.going||B._picking) return; closePick(); pick(b,s,aiPick(b,s)); afterAct(); },1500+Math.random()*3500); },100);
  autoMove=(function(prev){ return function(){ const b=B&&B.b; if(race(b)&&!B.going&&!B._picking){ closePick(); return doPick(aiPick(b,me())); } return prev(); }; })(autoMove);
})();
// ---------- My Monsters keeps its scroll position when it redraws (closing a profile, equipping, team changes) ----------
drawTeam=(function(prev){ return function(){ const body=TEAMSH&&TEAMSH.body; const keep=[];
  if(body) body.querySelectorAll('*').forEach(el=>{ if(el.scrollLeft||el.scrollTop){ const c=[...el.classList].join('.'); if(c) keep.push(['.'+c,el.scrollLeft,el.scrollTop]); } });
  const r=prev.apply(this,arguments);
  if(body) keep.forEach(([sel,x,y])=>{ const el=body.querySelector(sel); if(el){ el.scrollLeft=x; el.scrollTop=y; } });
  return r; }; })(drawTeam);
// one-time gift: $1,000,000 for the br6pack admin account (testing)
(function(){ const give=()=>{ try{ if(!ADMIN||typeof S==='undefined'||!S||S.giftCashB1m||String(S.name||'').toLowerCase()!=='br6pack') return false;
    S.cash=(S.cash|0)+1000000; S.giftCashB1m=1; persist(); if(typeof renderHUD==='function') renderHUD(); else if(typeof render==='function') render(); if(typeof toast==='function') toast('+$1,000,000'); return true; }catch(_){ return false; } };
  setAdmin=(function(prev){ return function(v){ const r=prev(v); setTimeout(give,300); return r; }; })(setAdmin);
  let n=0; const iv=setInterval(()=>{ if(give()||++n>40) clearInterval(iv); },1500); })();
// ---------- motto Save works on the first tap (fires on touch-down, before the keyboard closes and the sheet jumps); Enter saves too ----------
addEventListener('pointerdown',e=>{ const b=e.target.closest&&e.target.closest('#mtok'); if(!b||b._fired) return; e.preventDefault(); b._fired=1; b.click(); },true);
addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target&&e.target.id==='mtin'){ e.preventDefault(); const b=document.getElementById('mtok'); if(b&&!b._fired){ b._fired=1; b.click(); } } },true);
// ---------- live battles as the guest: swapping happens instantly on your phone and goes out together with your attack (one trip to the server instead of two) ----------
NET.sendAction=(function(prev){ return function(a){ if(!B||!B.net||B.net.role!=='guest'||!B.b) return prev(a);
  const b=B.b;
  if(a&&a.swap!=null&&!a.skill){ // apply the swap locally, keep the turn's seq so the host still sees it as this turn
    if(B.net.pendSwap!=null&&b.seq!==B.net.baseSeq) B.net.pendSwap=null; if(B.net.pendSwap==null) B.net.baseSeq=b.seq; if(act(b,{swap:a.swap|0})){ B.net.pendSwap=a.swap|0; b.seq=B.net.baseSeq; } renderBattle(); return; }
  if(B.net.pendSwap!=null&&b.seq!==B.net.baseSeq) B.net.pendSwap=null; // the turn moved on without it
  if(B.net.pendSwap!=null&&a&&a.skill){ const m=Object.assign({swap:B.net.pendSwap,seq:B.net.baseSeq},a); B.net.pendSwap=null; B.net.sent=B.net.baseSeq; B.net.action=m; NET.mr.emit('action',Object.assign({matchId:B.net.matchId},m)); a4predict(a,B.net.baseSeq+2); return; }
  if(a&&a.skill&&B.b.phase==='fight'){ const base=B.b.seq; prev(a); a4predict(a,base+1); return; }
  return prev(a); }; })(NET.sendAction);
// the guest plays its own move right away (same battle state + same dice = same result as the host), then the host's copy confirms it
function a4predict(a,seq){ try{ const b=B.b; const ac=actor(b); if(!ac||ac.s!==B.mySide) return; if(!act(b,{skill:a.skill,target:a.target})) return; b.seq=seq; B.net.pred=seq; renderBattle(); }catch(e){ console.warn('predict',e); } }
joinMatch=(function(prev){ return async function(id){ const mr=await prev(id); const on=mr.on;
  mr.on=(t,f)=>on(t, t!=='state'?f:(s=>{ try{ if(B&&B.net&&B.net.role==='guest'&&B.net.pred!=null&&B.b&&s&&s.b&&s.matchId===B.net.matchId){
      if(s.b.seq===B.b.seq){ const sig=x=>JSON.stringify(x.sides.map(sd=>[sd.active,sd.mons.map(m=>[m.hp,m.mp])]))+x.turnIdx+x.phase+x.over;
        if(sig(s.b)!==sig(B.b)){ B.b=s.b; B.net.pred=null; B.net.sent=null; B.net.heard=Date.now(); B.animSeq=s.b.seq; renderBattle(); } else B.net.heard=Date.now(); return; }
      if(s.b.seq>B.b.seq) B.net.pred=null; } }catch(_){} return f(s); }));
  return mr; }; })(joinMatch);
// ---------- quitting a ranked live battle counts as a loss (it used to skip the rank change entirely) ----------
NET.forfeit=(function(prev){ return function(){ try{ if(B&&B.mode==='pvp'&&!B.spar&&B.b&&!B.b.over&&!B._rankDone){ const me=myRank(), op=B.oppRank||200; const x=rankChange(me,op,false), d=Math.ceil(x); S.rank=Math.max(0,me+d); S.lastRankD=d; S.lastRankX=x; B._rankDone=1; persist(); if(typeof toast==='function') toast(`Forfeit · ${x.toFixed(2)} rank`); } }catch(_){} return prev.apply(this,arguments); }; })(NET.forfeit);
finishBattle=(function(prev){ return function(){ if(B&&B._rankDone){ const keepD=S.lastRankD, keepX=S.lastRankX, keepR=S.rank; const r=prev.apply(this,arguments); S.rank=keepR; S.lastRankD=keepD; S.lastRankX=keepX; return r; } return prev.apply(this,arguments); }; })(finishBattle);
// ---------- battery: when the app is in the background, freeze every animation and stop the lobby check-ins ----------
document.addEventListener('visibilitychange',()=>{ const hid=document.hidden; document.documentElement.classList.toggle('paused',hid);
  try{ document.getAnimations().forEach(a=>{ if(hid&&a.playState==='running'){ a._bp=1; a.pause(); } else if(!hid&&a._bp){ a._bp=0; a.play(); } }); }catch(_){}
  window.MR_HIDDEN=hid; });
// the lobby checks in faster only while you're looking at who's online (arena / friends lists); a challenge popup still arrives within a few seconds otherwise
setInterval(()=>{ window.MR_ARENA_OPEN=!!document.querySelector('.fr-tabs,.arena,#bh-arena:not([disabled])')&&!document.hidden; },2000);
// ---------- floating numbers on the same monster stack neatly instead of piling on top of each other ----------
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{ if(n.nodeType!==1||!n.classList||!n.classList.contains('float2')) return;
  const host=n.parentNode; if(!host) return; const live=[...host.querySelectorAll(':scope > .float2')].filter(x=>x!==n&&x._at&&performance.now()-x._at<1100);
  n._at=performance.now(); if(!live.length) return;
  const base=n.classList.contains('mana')?26:0; const used=live.map(x=>x._row|0); let row=0; while(used.includes(row)) row++;
  n._row=row; n.style.top=(base+row*38)+'px'; }))).observe(document.body,{childList:true,subtree:true});
// ---------- life/mana bars glide to their new value instead of snapping (the bar is rebuilt on each redraw, so carry the old width over) ----------
renderBattle=(function(prev){ return function(){ const old={};
  document.querySelectorAll('#battle .bhp').forEach(h=>{ const k=h.dataset.hs; h.querySelectorAll('i').forEach((x,j)=>{ if(x.style&&x.style.width) old[k+':'+j]=x.style.width; }); });
  const r=prev.apply(this,arguments);
  const moves=[]; document.querySelectorAll('#battle .bhp').forEach(h=>{ const k=h.dataset.hs; h.querySelectorAll('i').forEach((x,j)=>{ const o=old[k+':'+j]; if(o&&x.style&&x.style.width&&x.style.width!==o){ moves.push([x,x.style.width]); x.style.transition='none'; x.style.width=o; } }); });
  if(moves.length){ void document.body.offsetWidth; moves.forEach(([x,w])=>{ x.style.transition=''; x.style.width=w; }); }
  return r; }; })(renderBattle);
