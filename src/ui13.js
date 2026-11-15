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
  Object.entries(MOVE_OVR).forEach(([id,v])=>{ if(v===null){ delete SK[id]; return; } SK[id]=JSON.parse(JSON.stringify(v)); }); }
try{ applyMoveOverrides(JSON.parse(localStorage.getItem('mr-moves')||'{}')); }catch(_){}
(async()=>{ try{ const db=window.claude&&await window.claude.use('db'); if(!db) return; const v=await db.collection('config').doc('moves').get();
  if(v&&v.moves){ applyMoveOverrides(v.moves); try{ localStorage.setItem('mr-moves',JSON.stringify(v.moves)); }catch(_){} if(!B) try{ render(); }catch(_){} } }catch(_){} })();

// custom descriptions with placeholders
skillDesc=(function(prev){ return function(id,L){ const s=SK[id]; L=L||1; if(!s) return '';
  if(s.desc){ const f=x=>Math.round(x), P=x=>Math.round(x*100)+'%';
    const map={dmg:s.dmg?f(lv(s.dmg,L)):'', pct:s.m?P(lv(s.m,L)):'', cost:skCost(id,L), tick:s.tick?f(lv(s.tick,L)):'', turns:s.turns||'', hits:s.hits||1,
      amt:s.amt?f(lv(s.amt,L)):'', v:s.v?(lv(s.v,L)<1?P(lv(s.v,L)):f(lv(s.v,L))):'', heal:s.heal?P(lv(s.heal,L)):s.hot?P(lv(s.hot,L)):'',
      steal:s.stealHp?f(lv(s.stealHp,L)):s.steal?f(lv(s.steal,L)):'', leech:s.leechL?P(lv(s.leechL,L)):'', mana:s.mpAtk?P(lv(s.mpAtk,L)):s.burnmp?f(lv(s.burnmp,L)):'',
      stun:s.stun?P(lv(s.stun,L)):'', recoil:s.recoil?P(s.recoil):'', dbl:s.dbl?P(s.dbl):''};
    return s.desc.replace(/\{(\w+)\}/g,(a,k)=>k in map?map[k]:a); }
  if(MOVE_OVR[id] && (!DEFAULT_SK[id] || DEFAULT_SK[id].k!==s.k)) return skillDescBase(id,L);
  return prev(id,L); }; })(skillDesc);

// ---------- unique usernames + server-decided admins ----------
let ADMIN=false; try{ ADMIN=localStorage.getItem('mr-admin')==='1'; }catch(_){}
function setAdmin(v){ ADMIN=!!v; try{ localStorage.setItem('mr-admin',ADMIN?'1':'0'); localStorage.removeItem('mr-admin-key'); }catch(_){}
  SUBMENUS.menu=SUBMENUS.menu.filter(x=>x[0]!=='Ability Studio'); if(ADMIN) SUBMENUS.menu.push(['Ability Studio',()=>openStudio()]); }
setAdmin(ADMIN);
function nameError(err){ return err==='taken'?'That name is already taken. Try another one!':err==='invalid'?'Names can be 2–16 letters, numbers, spaces, - _ or .':"Couldn't check that name right now. Try again."; }
async function claimName(name){ if(!window.MR_ACCT) return {ok:1}; try{ const r=await MR_ACCT.claim(name); if(r&&r.ok) setAdmin(r.admin); return r||{ok:0}; }catch(_){ return {ok:0,err:'net'}; } }
function askNewName(msg){ return new Promise(res=>{
  const w=document.createElement('div'); w.className='abox-wrap on';
  w.innerHTML=`<div class="abox"><p>${msg}</p><input id="nn" maxlength="16" autocomplete="off" value="${esc(S.name||'')}" style="width:100%;padding:10px;border-radius:8px;border:0;font:17px system-ui;margin-bottom:10px;box-sizing:border-box"><p class="nn-err" style="min-height:1.2em;font-size:14px;color:#ffd0c8;margin:0 0 8px"></p><button class="abox-ok" id="nok">Save name</button></div>`;
  document.body.appendChild(w); const inp=w.querySelector('#nn'), er=w.querySelector('.nn-err'); setTimeout(()=>inp.focus(),60);
  w.querySelector('#nok').onclick=async()=>{ const v=inp.value.trim(); if(!v) return; er.textContent='Checking…'; const r=await claimName(v); if(!r.ok){ er.textContent=nameError(r.err); return; }
    S.name=v.slice(0,16); persist(); renderHUD&&renderHUD(); NET.updatePresence(); w.remove(); res(v); }; }); }
// on launch: make sure this player's name is claimed, and learn admin status
(async()=>{ if(!window.MR_ACCT) return; await new Promise(r=>setTimeout(r,2500)); try{
  const me=await MR_ACCT.whoami(); if(!me||!me.ok) return;
  setAdmin(!!me.admin); if(me.name) return;
  if(S&&S.name&&S.tut>=0){ const r=await claimName(S.name); if(!r.ok&&r.err==='taken') await askNewName(`Someone already has the name "${esc(S.name)}". Pick a new trainer name:`); }
}catch(_){} })();
// onboarding: the name must be free before you can start
document.addEventListener('click',async e=>{ const go=e.target.closest&&e.target.closest('#go'); if(!go||!window.MR_ACCT||go.dataset.ok) return; const nm=document.querySelector('#nm'); if(!nm) return;
  e.stopImmediatePropagation(); e.preventDefault(); const v=nm.value.trim(); if(!v) return;
  go.disabled=true; const old=go.textContent; go.textContent='Checking name…'; const r=await claimName(v); go.textContent=old; go.disabled=false;
  if(!r.ok){ alertBox(nameError(r.err)); return; } go.dataset.ok=1; go.click(); },true);

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
