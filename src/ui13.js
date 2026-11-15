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

// ---------- picking a monster: stay on the same card, just strike a pose ----------
openPick=(function(prev){ return function(side, swap){
  prev(side, swap); const w=PICKEL; if(!w) return; const b=B.b; const sd=b.sides[side];
  w.querySelectorAll('[data-pk]').forEach(btn=>btn.onclick=()=>{
    if(w.classList.contains('picked')) return; const i=+btn.dataset.pk, m=sd.mons[i];
    w.classList.add('picked'); btn.classList.add('sel'); B.going=true; sfx&&sfx('go');
    const t=w.querySelector('.pk-t'); if(t) t.textContent=`Go ${m.n}!`;
    const x=w.querySelector('#pkx'); if(x) x.style.visibility='hidden';
    setTimeout(()=>{ w.classList.add('out'); setTimeout(()=>{ if(PICKEL===w) PICKEL=null; w.remove(); if(!B) return; B.going=false;
      if(swap){ if(B.net&&B.net.role==='guest'){ NET.sendAction({swap:i}); renderBattle(); return; } act(b,{swap:i}); afterAct(); }
      else { const s=b.pickSide; if(B.net&&B.net.role==='guest'){ NET.sendAction({pick:i}); renderBattle(); return; } pick(b,s,i); afterAct(); }
    },220); },850);
  });
}; })(openPick);

// ---------- battles: raise the ground so monsters stand on it ----------
function battleScene(id){ const z=ZSCENE[id]||ZSCENE.meadow;
  return zoneScene(id).replace(/(<circle[^>]*\/><circle[^>]*\/>)([\s\S]*)<\/svg>$/, (_,orb,rest)=>`${orb}<g transform="translate(0 -20)">${rest}</g><rect y="78" width="200" height="22" fill="${z.hills[1]}"/></svg>`); }
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
    const el=EL[sk.el]?sk.el:'neutral'; const hits=evs.filter(e=>(e.k==='hit'||e.k==='dot'||e.k==='stun'||e.k==='miss')&&e.s!==a.s);
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
const endTip2=()=>{ TIPDRAG=false; };
addEventListener('pointerup',endTip2,true); addEventListener('touchend',endTip2,true); addEventListener('pointercancel',endTip2,true); addEventListener('touchcancel',endTip2,true);
addEventListener('pointerdown',e=>{ if(!(e.target.closest&&e.target.closest('.hi'))){ TIPH=null; hideTips(); } },true);
placeTip=(function(prev){ return function(h){ prev(h); const tip=document.querySelector('.tipb'); if(!tip||!h) return; const r=localRect(h);
  if(parseFloat(tip.style.top)<r.top+r.height && parseFloat(tip.style.top)+tip.offsetHeight>r.top-2) tip.style.top=(r.top+r.height+10)+'px'; }; })(placeTip);
bindTip=(function(prev){ return function(h){ prev(h); if(h._tip3) return; h._tip3=1; h.addEventListener('click',e=>{ e.stopPropagation(); TIPH=null; placeTip(h); }); }; })(bindTip);

// ---------- tap a monster in battle: monster + stats, then abilities, then special items ----------
monInfo=function(b,s,i){
  const m=b.sides[s].mons[i]; if(!m) return; const sp=SPI[m.sp], mine=s===B.mySide;
  const all=(sp.sk||[]).slice(0,slotsOf(m.lvl)); const fx=m.fx||{};
  const items=[fx.rmp&&'manabowl', fx.rhp&&'lifebowl', fx.dflat&&'blade'].filter(Boolean);
  const eff=Object.keys(ST_ICON).filter(k=>m.st[k]>0);
  const sh=sheet(`<div class="minfo2"><div class="mi2-l"><div class="mi-art">${monSVG(m.sp,m.lvl)}</div>
      <div class="mi-nm"><span class="lvb">${m.lvl}</span><b>${esc(m.n)}</b></div>
      <div class="lb life"><i style="width:${m.hp/m.maxhp*100}%"></i><b>${m.hp} / ${m.maxhp} life</b></div>
      <div class="lb mana"><i style="width:${m.mp/m.maxmp*100}%"></i><b>${m.mp} / ${m.maxmp} mana</b></div>
      <div class="mi-atk">Attack <b>${m.atk}</b></div>
      ${eff.length?`<div class="mi-eff">${eff.map(k=>`<span>${icon(ST_ICON[k][0],ST_ICON[k][1],18)} ${BUFF_N[k]||k} · ${m.st[k]}</span>`).join('')}</div>`:''}</div>
    <div class="mi2-r"><h3>Abilities</h3><div class="pabil">${all.map(id=>{ const k=SK[id]; if(!k) return ''; const L=(m.skl&&m.skl[id])||1, c=skCost(id,L);
        return `<div class="pab ${k.k==='passive'?'pas':''}">${icon(skIconKey(id),(EL[k.el]||EL.neutral).c,34)}<div class="pab-t"><b>${esc(k.n)} <span class="sl">Lv ${L}</span>${k.k==='passive'?' <span class="pastag">Passive</span>':''}</b><span>${skillDesc(id,L)}${c?` · ${c} mana`:''}</span></div></div>`; }).join('')}</div>
      ${items.length?`<h3>Items</h3><div class="mi2-items">${items.map(id=>`<div class="pab"><span class="mi2-it">${itemSVG(id)}</span><div class="pab-t"><b>${ITEMS[id].n}</b><span>${id==='manabowl'?`Recovers ${fx.rmp} mana after each turn`:id==='lifebowl'?`Recovers ${fx.rhp} life after each turn`:`+${fx.dflat} damage on attacks, takes +${fx.tflat} more`}</span></div></div>`).join('')}</div>`:''}</div></div>`,{cls:'mi2sheet'});
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
    const e=(now-B.enT[s].t)/1000; if(e<1.5&&!f._enA){ const L=el.classList.contains('l'), d=L?1:-1, W=document.body.clientWidth*1.2;
      const H=document.body.clientHeight*.45;
      f._enA=f.animate([{transform:`translate(${-d*W}px,0)`,easing:'cubic-bezier(.3,.7,.6,1)'},{transform:`translate(${-d*W*.45}px,${-H}px)`,offset:.28,easing:'cubic-bezier(.45,0,.8,.5)'},{transform:'translate(0,0) scale(1.14,.86)',offset:.52,easing:'ease-out'},
        {transform:'translate(0,-12%) scale(.95,1.06)',offset:.66,easing:'ease-in'},{transform:'translate(0,0) scale(1.06,.94)',offset:.8,easing:'ease-out'},{transform:'none'}],{duration:1500,easing:'linear'});
      f._enA.currentTime=e*1000; } }); }; })(renderBattle);

// ---------- Monster Kingdom style info bubble: description only, sits over the icon row with a tab down to the icon ----------
function stDesc(m,k){ const s=m.st, P=v=>Math.round((v||0)*100)+'%';
  const d={burn:`Takes ${s.burnD|0} damage each turn`, poison:`Takes ${s.poisonD|0} damage each turn`, storm:`Takes ${s.stormD|0} damage each turn`, stun:`Can't act`,
    bubble:`Shield absorbs ${s.bubbleHp|0} damage`, lsh:`Shield absorbs ${s.lshHp|0} damage`, fsh:`Shield absorbs ${s.fshHp|0} damage`, nsh:`Shield absorbs ${s.nshHp|0} damage`,
    focus:`Deals ${P(s.focusV)} more damage`, charge:`Deals ${P(s.chargeV)} more damage`, cripple:`Deals ${P(s.crippleV)} less damage`, evade:`${P(s.evadeV)} chance to dodge attacks`}[k];
  return `${d||BUFF_N[k]||k} (${s[k]} turn${s[k]>1?'s':''})`; }
hudIcons=(function(prev){ return function(m){ if(!m) return ''; let h=prev(m).replace(/<span class="hi st"[\s\S]*?<\/span><\/span>/g,'');
  const add=Object.keys(ST_ICON).filter(k=>m.st[k]>0).map(k=>`<span class="hi st" data-tip="|${esc(stDesc(m,k))}">${icon(ST_ICON[k][0],ST_ICON[k][1],26)}</span>`).join('');
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
