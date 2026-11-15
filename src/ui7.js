// ===== V7: home layout — top banner, mail button, angled bottom bar =====
const BIC={
  map:`<svg viewBox="0 0 40 40"><path d="M4 9l10-4 12 4 10-4v26l-10 4-12-4-10 4z" fill="#f3e2b8" stroke="#5a3a1a" stroke-width="2" stroke-linejoin="round"/><path d="M14 5v26M26 9v26" stroke="#c9a067" stroke-width="1.6"/><path d="M8 26c4-6 8 2 12-4s6-6 10-8" stroke="#c4231c" stroke-width="2.2" stroke-dasharray="3 3" fill="none"/><path d="M28 11l4 4m0-4l-4 4" stroke="#c4231c" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  chat:`<svg viewBox="0 0 40 40"><path d="M6 10c0-3 3-5 6-5h16c3 0 6 2 6 5v11c0 3-3 5-6 5H18l-8 7 1-7c-3 0-5-2-5-5z" fill="#5fd84a" stroke="#1f6a12" stroke-width="2" stroke-linejoin="round"/><circle cx="14" cy="16" r="2" fill="#fff"/><circle cx="20" cy="16" r="2" fill="#fff"/><circle cx="26" cy="16" r="2" fill="#fff"/></svg>`,
  gear:`<svg viewBox="0 0 40 40"><path d="M20 6l3 1 1 4 3 2 4-1 2 3-2 4v3l2 4-2 3-4-1-3 2-1 4-3 1-3-1-1-4-3-2-4 1-2-3 2-4v-3l-2-4 2-3 4 1 3-2 1-4z" fill="#d8dde3" stroke="#4a525a" stroke-width="2" stroke-linejoin="round"/><circle cx="20" cy="20" r="5" fill="#4a525a"/></svg>`,
  shroom:`<svg viewBox="0 0 40 40"><rect x="15" y="20" width="10" height="14" rx="4" fill="#f4ead2" stroke="#5a3a1a" stroke-width="2"/><path d="M3 22Q3 6 20 6t17 16q-17 4-34 0z" fill="#b04fd6" stroke="#4a1a5a" stroke-width="2"/><circle cx="12" cy="14" r="3" fill="#fff"/><circle cx="23" cy="11" r="2.6" fill="#fff"/><circle cx="29" cy="18" r="2.4" fill="#fff"/><circle cx="18" cy="18" r="2" fill="#fff"/></svg>`,
  sword:`<svg viewBox="0 0 40 40"><path d="M32 4l4 4-18 18-4-4z" fill="#e8eef4" stroke="#4a525a" stroke-width="2" stroke-linejoin="round"/><path d="M10 20l10 10M8 28l4 4" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/><circle cx="7" cy="33" r="3" fill="#f2c14e" stroke="#7a5a12" stroke-width="1.5"/></svg>`,
  mail:`<svg viewBox="0 0 60 60"><rect x="8" y="16" width="44" height="30" rx="3" fill="#fff" stroke="#9aa3ad" stroke-width="2" transform="rotate(-8 30 31)"/><path d="M10 20l20 14 20-14" fill="none" stroke="#9aa3ad" stroke-width="2" transform="rotate(-8 30 31)"/><rect x="40" y="16" width="7" height="8" fill="#e0475b" transform="rotate(-8 30 31)"/></svg>`
};
document.getElementById('bar').innerHTML=`
  <button class="nb red l" data-p="zones"><span>ZONES</span><i>${BIC.map}</i></button>
  <button class="nb blue" data-p="social"><span>SOCIAL</span><i>${BIC.chat}</i></button>
  <button class="nb blue" data-p="menu"><span>MENU</span><i>${BIC.gear}</i><em id="qbadge"></em></button>
  <button class="nb blue" data-p="shop"><span>SHOP</span><i>${BIC.shroom}</i></button>
  <button class="nb red r" data-p="battle"><span>BATTLE</span><i>${BIC.sword}</i></button>`;
document.querySelectorAll('#bar [data-p]').forEach(b=>b.onclick=()=>openPanel(b.dataset.p));

renderHUD=function(){
  const pct=S.energy/S.maxEnergy*100;
  $('#hud').innerHTML=`<div class="avatar">${avatarSVG(myAvatar())}</div>
    <div class="hcol">
      <div class="hrow"><div class="hbar name"><span class="ico">♛</span><b>${esc(S.name||'Trainer')}</b></div>
        <div class="hbar rank"><span class="ico r">${rankBadge(myRank(),20)}</span><b>${myRank()}</b></div>
        <div class="hbar cash"><span class="ico c">$</span><b>${S.cash|0}</b></div></div>
      <div class="hrow"><div class="hbar energy"><span class="ico">⚡</span><div class="ebar"><i style="width:${pct}%"></i><b>${S.energy<S.maxEnergy?`+1 in ${nextEnergyIn()} · `:''}${S.energy} / ${S.maxEnergy} energy</b></div></div>
        <button class="hbar shrooms" id="getmore"><span class="ico m">${mushroomSVG('#b04fd6')}</span><b>${S.mush}</b><em class="gm2">Get More!</em></button></div>
    </div>`;
  $('#getmore').onclick=()=>openPanel('shop');
  const av=$('#hud .avatar'); av.onclick=openAvatar;
};
const _sceneHTML7=sceneHTML;
sceneHTML=function(){
  return _sceneHTML7().replace(/<button class="banner"[^>]*>[\s\S]*?<\/button>/,'<button class="banner top" id="myteam">MY MONSTERS</button><button class="mailb" id="mailb">'+BIC.mail+'<em id="mailn"></em></button>');
};
const _render7=render;
render=function(){
  _render7();
  const mb=$('#mailb'); if(mb) mb.onclick=()=>openPanel('quests');
  const qn=QUESTS.filter(q=>!S.quests[q.id] && q.ok(S)).length;
  const mn=$('#mailn'); if(mn){ mn.textContent=qn; mn.style.display=qn?'':'none'; }
};

// ---- Social + Menu panels ----
function viewSocial(){
  const peers=NET.peers.filter(p=>!p.me);
  const link=location.href.split('#')[0];
  return `<h1>Social</h1>
    <div class="card"><div class="card-h"><h3>Trainers online</h3><span class="live ${NET.status==='on'?'on':''}">${NET.status==='on'?'● Online':'○ Offline'}</span></div>
      ${peers.length?`<div class="list">${peers.map(p=>`<div class="row"><div class="soc-av">${avatarSVG(sanitizeAv(p.avatar)||{t:'trainer',i:0})}</div><div><b>${esc(p.name||'Trainer')}</b><span>${rankBadge(p.rank||1000,16)} ${p.rank||1000}${p.busy?' · in a battle':''}</span></div><button class="btn sm" data-ch="${esc(p.cid)}" ${p.busy||NET.pending?'disabled':''}>Battle</button></div>`).join('')}</div>`
        :`<p class="muted small">No one else is online right now.</p>`}</div>
    <div class="card"><div class="card-h"><h3>Invite a friend</h3></div><p class="muted small">Send them this link. Once they open it, they'll show up here.</p>
      <div class="invrow"><input readonly value="${esc(link)}" id="invl"><button class="btn sm" id="invc">Copy</button></div></div>`;
}
function viewMenu(){
  const qn=QUESTS.filter(q=>!S.quests[q.id] && q.ok(S)).length;
  return `<h1>Menu</h1><div class="menugrid">
    <button class="mg" data-go="quests">${BIC.mail}<b>Quests</b>${qn?`<em>${qn}</em>`:''}</button>
    <button class="mg" data-go="monsters">${BIC.shroom}<b>My Monsters</b></button>
    <button class="mg" data-go="avatar">${avatarSVG(myAvatar())}<b>Profile Picture</b></button>
    <button class="mg" data-go="zones">${BIC.map}<b>Zones</b></button></div>`;
}
PANELS.social=viewSocial; PANELS.menu=viewMenu;
const _bindView7=bindView;
bindView=function(v){
  _bindView7(v); v=v||document;
  v.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{ const g=b.dataset.go; PANEL&&PANEL.sh.close(); setTimeout(()=>{ if(g==='avatar') openAvatar(); else openPanel(g); },120); });
  const c=$('#invc',v); if(c) c.onclick=()=>{ const i=$('#invl',v); i.select(); try{ navigator.clipboard.writeText(i.value).then(()=>toast('Link copied')); }catch(e){ document.execCommand&&document.execCommand('copy'); toast('Link copied'); } };
};
if(typeof S!=='undefined'&&S){ render(); }
