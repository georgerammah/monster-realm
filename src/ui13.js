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
      else { const s=b.pickSide; if(B.net&&B.net.role==='guest'){ NET.sendAction({pick:i}); renderBattle(); return; } pick(b,s,i); afterAct(); }
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
      if(a.sk==='basic'&&tg.length){ fxTackle(ac,tg[0],a.s===B.mySide); }
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
const endTip2=()=>{ TIPDRAG=false; TIPH=null; hideTips(); };
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
    const e=(now-B.enT[s].t)/1000; if(e<3&&!f._enA){ const L=el.classList.contains('l'), d=L?1:-1, W=document.body.clientWidth*1.2;
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
  mkstatic:'<path d="M5 11 Q4 6 9 6 Q11 3 15 5 Q20 5 19 10 Q21 13 17 14 L7 14 Q4 14 5 11Z" fill="#fff"/><path d="M9 10.5 Q10 9.5 11 10.5 M13 10.5 Q14 9.5 15 10.5" stroke="#e8a000" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M10 12.8 Q12 11.5 14 12.8" stroke="#e8a000" stroke-width="1" fill="none"/><path d="M12.5 14 L10.5 17.5 L12.5 17.5 L11 21 L15 16.5 L13 16.5 L14 14Z" fill="#fff"/>',
  mkspark:'<path d="M9 3 L10.4 8.6 L16 10 L10.4 11.4 L9 17 L7.6 11.4 L2 10 L7.6 8.6Z" fill="#fff"/><path d="M17 12 L17.8 15.2 L21 16 L17.8 16.8 L17 20 L16.2 16.8 L13 16 L16.2 15.2Z" fill="#fff"/><path d="M17 3 L17.6 5.4 L20 6 L17.6 6.6 L17 9 L16.4 6.6 L14 6 L16.4 5.4Z" fill="#fff"/>',
  mkpounce:'<path d="M4 15 Q5 6 14 6 L14 3.5 L19 8 L14 12.5 L14 10 Q8 10 7 16Z" fill="#fff"/><path d="M13 20 l2 -5 M16 20 l1.5 -4.5 M19 19 l1 -4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
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
  sheet(`<div class="rkl"><h2>Ranks</h2><div class="rkl-grid">${RANKS.map((r,i)=>{ const nx=RANKS[i+1]; return `<div class="rkl-c ${r[1]===cur?'on':''}">${rankBadge(r[0],40)}<div><b>${r[1]}</b><span>${nx?`${r[0]} – ${nx[0]-1}`:`${r[0]}+`}</span></div></div>`; }).join('')}</div>
    <p class="rkl-me">You: ${rankBadge(me,20)} <b>${me}</b> · Every season starts at 200</p></div>`,{cls:'rklsheet'}); }
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
  mkcamel:'<path d="M4 7.5 Q8 5.5 12 7.5 T20 7.5 V10.5 Q16 8.5 12 10.5 T4 10.5Z M4 12.5 Q8 10.5 12 12.5 T20 12.5 V15.5 Q16 13.5 12 15.5 T4 15.5Z M4 17.5 Q8 15.5 12 17.5 T20 17.5 V20 Q16 18 12 20 T4 20Z" fill="#fff"/>'});
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
(function(){ const give=()=>{ try{ if(!ADMIN||typeof S==='undefined'||!S||S.giftMush1k) return false; S.mush=(S.mush|0)+1000; S.giftMush1k=1; persist(); if(typeof renderHUD==='function') renderHUD(); if(typeof toast==='function') toast('+1000 mushrooms'); return true; }catch(_){ return false; } };
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
  [1,2,3].forEach(ph=>evs.forEach(e=>{ if(e.ph!==ph) return; if(ph===1){ e._fx=cur; e._d=cur+(e.k==='dot'?380:0); cur+=850; } else { e._d=cur; cur+=650; } }));
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
function myCode(){ return window.MR_UID||localStorage.getItem('mr-uid')||''; }
function openRestore(){
  const sh=sheet(`<div class="rst"><h2>Restore your game</h2><p>Enter the transfer code from Menu on your other device or browser.</p><div class="xrow"><input id="rcode" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Transfer code"><button class="btn sm" id="rpaste">Paste</button></div><p class="nm-err" id="rerr"></p><button class="btn" id="rgo">Restore</button></div>`);
  sh.body.querySelector('#rpaste').onclick=async()=>{ try{ const t=await navigator.clipboard.readText(); sh.body.querySelector('#rcode').value=(t||'').trim(); }catch(_){ err('Allow paste, or type the code.'); } };
  const err=t=>{ sh.body.querySelector('#rerr').textContent=t; };
  sh.body.querySelector('#rgo').onclick=async()=>{ const code=sh.body.querySelector('#rcode').value.trim().replace(/\s+/g,''); if(!/^u[a-z0-9]{8,}$/i.test(code)) return err("That doesn't look like a transfer code.");
    err('Checking…'); try{ const db=window.claude&&await window.claude.use('db'); const v=db&&await withTimeout(db.collection('data/users/'+code).doc('save').get(),10000); const save=parseDoc(v);
      if(!save||!save.name) return err('No game found for that code.');
      localStorage.setItem('mr-uid',code); localStorage.setItem(LS_KEY,JSON.stringify(save)); location.reload(); }catch(_){ err("Couldn't reach the server. Try again."); } }; }
PANELS.menu=(function(prev){ return function(){ const c=myCode(); return prev()+`<div class="xfer"><b>Transfer code</b><span>Use it to move your game to another phone or to the home-screen app.</span><div class="xrow"><code id="xcode">${esc(c)}</code><button class="btn sm" id="xcopy">Copy</button></div><button class="btn ghost sm" id="xrest">Restore a game</button></div><div class="diag">${diagLine()}</div>`; }; })(PANELS.menu);
function diagLine(){ const l=window.__lay||{}; return `v177 · ${l.SA?'app':'web'} · ${l.iw}×${l.ih} · scr ${l.sw}×${l.sh} · in ${l.t}/${l.b} · pad ${l.pl||0}/${l.pr||0} · ${l.L}×${l.S} · ♪ ${(window.__musicLoop&&window.__musicLoop().playing)?'loop':'live'}`; }
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
      ${p.uid===me?'':`<div class="adm-act"><button class="btn sm ghost" data-op="${p.banned?'unban':'ban'}">${p.banned?'Unban':'Ban'}</button><button class="btn sm ghost" data-op="rename">Rename</button><button class="btn sm red" data-op="delete">Delete</button></div>`}</div>`).join(''):'<p class="adm-msg">No players found.</p>';
    sh.body.querySelectorAll('[data-copy]').forEach(c=>c.onclick=()=>{ (navigator.clipboard?navigator.clipboard.writeText(c.dataset.copy):Promise.reject()).then(()=>toast('Code copied'),()=>{}); });
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
  const t=S.team.filter(u=>{ const m=u&&!seen.has(u)&&seen.add(u)&&monBy(u); return m&&(!FIXTEAM_SPECIES||SPI[m.sp]); }).slice(0,3);
  if(!t.length&&S.mons&&S.mons.length) t.push(S.mons[0].uid);
  if(t.length!==S.team.length||t.some((u,i)=>u!==S.team[i])) S.team=t; }
teamMons=(function(prev){ return function(){ fixTeam(); return prev.apply(this,arguments).slice(0,3); }; })(teamMons);
persist=(function(prev){ return function(){ fixTeam(); return prev.apply(this,arguments); }; })(persist);
FIXTEAM_SPECIES=true; fixTeam();

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
  const gear=k=>{ const m=mine[k]||{}, b=m.bonus||{}; return {g:{rmp:b.rmp|0,rhp:b.rhp|0,dflat:b.dflat|0,tflat:b.tflat|0,belem:b.belem|0,bphys:b.bphys|0}, items:(m.items||[]).slice()}; };
  const abil=Math.max(1,Math.round(mine.reduce((t,m)=>{ const v=Object.values(m.skl||{}); return t+(v.length?v.reduce((a,b)=>a+b,0)/v.length:1); },0)/n));
  const myEls=mine.map(m=>FAM[SPI[m.sp].fam].el);
  const pool=SP.filter(s=>FAM[s.fam]&&FAM[s.fam].shape!=='dummy'&&s.fam!=='dummy'&&!s.boss).map(s=>{ const el=FAM[s.fam].el;
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
    if((k==='soak'||k==='scorch')&&S&&S.length){ const what=k==='soak'?'water':'fire';
      S.slice().sort((a,b)=>(b.at||0)-(a.at||0)).forEach(x=>out.push({k, stack:1, at:x.at||0, t:x.t, exp:x.t<=1, name:stName(k,x.src||(k==='soak'?'wave':'emberspit')), ic:stIconFor(k,x.src||(k==='soak'?'wave':'emberspit')), tip:`Takes ${P(x.v)} more ${what} damage (${T(x.t)})`})); return; }
    out.push({k, at:st[k+'At']||0, t:st[k], exp:st[k]<=1, name:stName(k,st[k+'Src']), ic:stIconFor(k,st[k+'Src']), tip:stDesc(m,k)}); });
  return out; }
act=(function(prev){ return function(b,action){
  const snap=b.sides.map(sd=>sd.mons.map(m=>{ const o={}; Object.keys(ST_ICON).forEach(k=>o[k]=m.st[k]|0); return o; }));
  const sk=action&&action.skill&&SK[action.skill]?action.skill:'basic';
  const r=prev(b,action);
  if(r) b.sides.forEach((sd,s)=>sd.mons.forEach((m,i)=>{ const o=snap[s]&&snap[s][i]; if(!o) return;
    Object.keys(ST_ICON).forEach(k=>{ if((m.st[k]|0)>o[k]&&k!=='soak'&&k!=='scorch'){ m.st[k+'Src']=sk; m.st[k+'At']=stSeq(); } }); }));
  return r; }; })(act);
// items listed one card per copy (three Krill's Swords show as three)
function itemLine(id){ const it=ITEMS[id], f=it.fx||{}, b=it.b||{};
  if(f.rmp) return `Recovers ${f.rmp} mana after each turn`; if(f.rhp) return `Recovers ${f.rhp} life after each turn`;
  if(f.dflat) return `Deals ${f.dflat} more damage to foes, takes ${f.tflat} more damage from foes`;
  if(f.belem||f.bphys) return `Blocks ${f.belem|0} elemental and ${f.bphys|0} physical damage`;
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
