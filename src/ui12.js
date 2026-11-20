// ===== V12: loading screen flow =====
function TT_ELE(){ return `<svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg"><g stroke="#163457" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<circle cx="52" cy="88" r="46" fill="#79aee6"/><circle cx="168" cy="88" r="46" fill="#79aee6"/>
<circle cx="58" cy="92" r="28" fill="#a8cdf4" stroke="none"/><circle cx="162" cy="92" r="28" fill="#a8cdf4" stroke="none"/>
<path d="M110 120 q2 34 -6 50 q-6 12 8 16" fill="none" stroke-width="27"/>
<path d="M110 120 q2 34 -6 50 q-6 12 8 16" fill="none" stroke="#8cc0f5" stroke-width="17"/>
<ellipse cx="110" cy="92" rx="50" ry="48" fill="#8cc0f5"/>
<path d="M90 126 q-2 12 -12 14 M130 126 q2 12 12 14" fill="none" stroke-width="13"/><path d="M90 126 q-2 12 -12 14 M130 126 q2 12 12 14" fill="none" stroke="#fff" stroke-width="7"/>
</g>

<circle cx="93" cy="90" r="5.5" fill="#163457"/><circle cx="127" cy="90" r="5.5" fill="#163457"/>
<circle cx="95" cy="88" r="1.8" fill="#fff"/><circle cx="129" cy="88" r="1.8" fill="#fff"/></svg>`; }
function splash(){
  return new Promise(res=>{
    const el=$('#splash');
    el.classList.add('studio');
    el.innerHTML=`<div class="tt-wrap"><div class="tt-ele">${TT_ELE()}</div><div class="tt-name"><b>Tiny Tusk</b><span>STUDIOS</span></div></div>`;
    setTimeout(()=>{ el.insertAdjacentHTML('beforeend','<div class="tt-cover"></div>'); setTimeout(()=>{ el.innerHTML=''; el.classList.remove('studio'); loading(); },420); },2300);
    const loading=()=>{
    const sparks=Array.from({length:26},()=>{ const s=(.5+Math.random()*1.3).toFixed(2); return `<i class="spark glow" style="left:${Math.random()*100}%;--dx:${(Math.random()*80-40).toFixed(0)}px;--s:${s};animation-duration:${(5+Math.random()*6).toFixed(1)}s;animation-delay:-${(Math.random()*10).toFixed(1)}s"></i>`; }).join('');
    el.innerHTML=`${sparks}<div class="sp-plate"><div class="sp-mon l">${monSVG('pyrodrake',22)}</div><div class="sp-mon r">${monSVG('thundra',22)}</div><div class="sp-title"><span>Monster</span><span>Realm</span></div></div>
      <div class="ld-box"><div class="ld-t" id="sptxt">Checking Content...</div><div class="ld-bar"><i></i></div></div><div class="ld-studio">Tiny Tusk Studios</div><div class="ld-ver">v1.0 (202).0</div>`;
    const bar=el.querySelector('.ld-bar i'), txt=el.querySelector('#sptxt');
    let done=false; const finish=()=>{ if(done) return; done=true; el.classList.add('out'); setTimeout(()=>{ el.remove(); res(); },500); };
    setTimeout(()=>{
      txt.textContent='Starting Game...'; let p=0;
      const t=setInterval(()=>{ p=Math.min(100,p+6+Math.random()*10); bar.style.width=p+'%';
        if(p>=100){ clearInterval(t); setTimeout(finish,350); } },120);
    },1000);
    };
  });
}

function snapRow(el){ if(!el.classList||!el.classList.contains('zd-row')) return; const mid=el.scrollLeft+el.clientWidth/2; let best=null,bd=1e9;
  el.querySelectorAll('.zd-card').forEach(c=>{ const d=Math.abs(c.offsetLeft+c.offsetWidth/2-mid); if(d<bd){bd=d;best=c;} });
  if(best) el.scrollTo({left:best.offsetLeft+best.offsetWidth/2-el.clientWidth/2,behavior:'smooth'}); }
// ---- rotated-mode scrolling: map finger movement into the rotated frame ----
(function(){
  let st=null, moved=false, raf=0;
  const canY=el=>{ const c=getComputedStyle(el); return /(auto|scroll)/.test(c.overflowY) && el.scrollHeight>el.clientHeight+1; };
  const canX=el=>{ const c=getComputedStyle(el); return /(auto|scroll)/.test(c.overflowX) && el.scrollWidth>el.clientWidth+1; };
  const find=(t,dir)=>{ for(let el=t; el && el!==document.body; el=el.parentElement){ if(el.matches&&el.matches('.ab,.hi,[data-noscroll]')) return null; if(dir==='y'?canY(el):canX(el)) return el; } return null; };
  addEventListener('touchstart',e=>{
    if(!isRot()||e.touches.length!==1) { st=null; return; }
    cancelAnimationFrame(raf); const t=e.touches[0];
    st={x:t.clientX,y:t.clientY,lx:t.clientX,ly:t.clientY,t:performance.now(),v:0,el:null,ax:null,target:e.target}; moved=false;
  },{passive:true,capture:true});
  addEventListener('touchmove',e=>{
    if(!st||!isRot()) return; const t=e.touches[0];
    // rotate(90deg): local x = physical y, local y = -physical x
    const ldx=t.clientY-st.ly, ldy=-(t.clientX-st.lx);
    if(!st.ax){ const tx=t.clientY-st.y, ty=-(t.clientX-st.x); if(Math.hypot(tx,ty)<6) return;
      st.ax=Math.abs(ty)>=Math.abs(tx)?'y':'x'; st.el=find(st.target,st.ax); if(!st.el){ st=null; return; } moved=true; }
    e.preventDefault();
    const now=performance.now(), d=st.ax==='y'?ldy:ldx, dt=Math.max(1,now-st.t);
    if(st.ax==='y') st.el.scrollTop-=d; else st.el.scrollLeft-=d;
    st.v=.8*(-d/dt)+.2*st.v; st.t=now; st.lx=t.clientX; st.ly=t.clientY;
  },{passive:false,capture:true});
  addEventListener('touchend',()=>{
    if(!st||!st.el){ st=null; return; } const el=st.el, ax=st.ax; let v=st.v*16; st=null;
    if(performance.now()-0>0){ const step=()=>{ if(Math.abs(v)<.4){ snapRow(el); return; } if(ax==='y') el.scrollTop+=v; else el.scrollLeft+=v; v*=.95; raf=requestAnimationFrame(step); }; raf=requestAnimationFrame(step); }
  },{passive:true,capture:true});
  addEventListener('click',e=>{ if(moved){ moved=false; e.stopPropagation(); e.preventDefault(); } },true);
})();

// ---- zone music: one original loop per zone ----
Object.assign(TRACKS,{
  z_meadow:{bpm:112,type:'triangle',ld:1.7,lv:.5,
    lead:[67,_,71,74, 76,_,74,71, 72,_,71,69, 67,_,_,_, 69,_,71,72, 74,_,76,74, 71,_,69,_, 67,_,_,_],
    bass:[43,_,50,_, 43,_,50,_, 48,_,55,_, 48,_,55,_, 45,_,52,_, 50,_,57,_, 43,_,50,_, 43,_,_,_], perc:'shaker'},
  z_beach:{bpm:120,type:'sine',ld:.9,lv:.6,oct:true,
    lead:[77,_,77,81, _,79,77,_, 74,_,76,77, _,76,74,_, 72,_,74,76, _,77,79,_, 77,_,_,_, _,_,_,_],
    bass:[41,_,_,41, 48,_,41,_, 46,_,_,46, 53,_,46,_, 48,_,_,48, 55,_,48,_, 41,_,_,41, 48,_,41,_], perc:'calypso'},
  z_desert:{bpm:96,type:'sawtooth',ld:1.4,lv:.22,
    lead:[62,63,66,_, 67,_,66,63, 62,_,_,_, 69,70,69,67, 66,_,67,66, 63,_,62,_, 62,_,_,_, _,_,_,_],
    bass:[38,_,_,38, _,_,45,_, 38,_,_,38, _,_,43,_, 38,_,_,38, _,_,45,_, 39,_,_,38, _,_,_,_], perc:'drum'},
  z_hollow:{bpm:80,type:'sine',ld:3,lv:.45,bd:4,
    lead:[64,_,_,67, _,_,71,_, 70,_,_,_, 67,_,_,_, 64,_,_,62, _,_,64,_, _,_,_,_, _,_,_,_,
          76,_,_,74, _,_,71,_, 72,_,_,_, 71,_,_,_, 67,_,_,66, _,_,64,_, _,_,_,_, _,_,_,_],
    bass:[40,_,_,_,_,_,_,_, 36,_,_,_,_,_,_,_, 38,_,_,_,_,_,_,_, 40,_,_,_,_,_,_,_], perc:'wind'},
  z_volcano:{bpm:144,type:'square',ld:1.5,lv:.4,
    lead:[72,_,75,72, 79,_,78,75, 72,_,70,72, 75,_,_,_, 68,_,72,68, 75,_,74,72, 71,_,74,_, 79,_,_,_],
    bass:[36,36,48,36, 36,48,36,48, 32,32,44,32, 32,44,32,44, 34,34,46,34, 34,46,34,46, 31,31,43,31, 35,35,47,35], perc:'rock'},
  z_peaks:{bpm:100,type:'sine',ld:2.2,lv:.42,oct:true,
    lead:[65,69,72,76, 79,76,72,69, 67,71,74,79, 83,79,74,71, 65,69,72,76, 77,76,72,69, 72,_,_,_, _,_,_,_],
    bass:[41,_,_,_,48,_,_,_, 43,_,_,_,50,_,_,_, 41,_,_,_,48,_,_,_, 48,_,_,_,_,_,_,_], perc:'chime'}
});
schedule=function(){
  const c=SND.ctx; const T=TRACKS[SND.track]; if(!T) return;
  const st=60/T.bpm/2;
  while(SND.next<c.currentTime+.25){
    const i=SND.step, t=SND.next;
    const ln=T.lead[i%T.lead.length];
    if(ln!=null){ tone(mtof(ln),t,st*(T.ld||1.7),T.type,T.lv||.5,SND.mus); if(T.oct) tone(mtof(ln+12),t,st*(T.ld||1.7)*.6,'sine',(T.lv||.5)*.3,SND.mus); }
    const bn=T.bass[i%T.bass.length]; if(bn!=null) tone(mtof(bn),t,st*(T.bd||.9),'triangle',.55,SND.mus);
    switch(T.perc){
      case 'shaker': if(i%2) noise(t,.03,.07,7000,SND.mus,1); break;
      case 'calypso': if(i%4===2) noise(t,.04,.22,2500,SND.mus,3); noise(t,.025,i%2?.06:.1,8000,SND.mus,1); if(i%8===0) tone(90,t,.15,'sine',.6,SND.mus,45); break;
      case 'drum': if(i%8===0||i%8===3) tone(95,t,.22,'sine',.75,SND.mus,55); if(i%8===2||i%8===6) noise(t,.06,.25,1100,SND.mus,4); if(i%8===7) noise(t,.04,.12,3000,SND.mus,3); break;
      case 'wind': if(i%32===0) noise(t,2.6,.05,500,SND.mus,.5); if(i%16===8) tone(55,t,.6,'sine',.5,SND.mus,40); break;
      case 'rock': if(i%4===0) tone(110,t,.14,'sine',.9,SND.mus,40); if(i%8===4) noise(t,.12,.45,1600,SND.mus,.7); noise(t,.03,i%2?.14:.22,8500,SND.mus,1); break;
      case 'chime': if(i%8===0) tone(mtof(96),t,.6,'sine',.08,SND.mus); if(i%4===2) noise(t,.02,.05,10000,SND.mus,1); break;
      default:
        if(T.hat){ noise(t,.03,i%2?.18:.28,8000,SND.mus,1); if(i%4===0) tone(110,t,.12,'sine',.8,SND.mus,40); if(i%8===4) noise(t,.09,.4,1800,SND.mus,.7); }
        else if(i%4===0) noise(t,.02,.08,9000,SND.mus,1);
    }
    SND.step++; SND.next+=st;
  }
};
let ZMUS=null;
const bgTrack=()=>B?'battle':(ZMUS?ZMUS:'home');
const _oz12=openZone; openZone=function(zi){ const r=_oz12(zi); if(zoneUnlocked(zi)){ ZMUS='z_'+ZONES[zi].id; playMusic(ZMUS); } return r; };
const _ozs12=openZoneSelect; openZoneSelect=function(zi){ ZMUS='z_'+ZONES[zi].id; playMusic(ZMUS); return _ozs12(zi); };
const _ot12=openTasks; openTasks=function(zi){ ZMUS='z_'+ZONES[zi].id; playMusic(ZMUS); const r=_ot12(zi);
  const sh=TASKSH&&TASKSH.sh; if(sh&&sh.body){ new MutationObserver((m,o)=>{ if(!document.body.contains(sh.body)){ o.disconnect(); if(!TASKSH){ ZMUS=null; if(!B) playMusic('home'); } } }).observe(document.body,{childList:true,subtree:true}); }
  return r; };
const _cb12=closeBattle; closeBattle=function(){ _cb12(); playMusic(bgTrack()); };
const _rw12=rewardPopup; rewardPopup=function(o){ const r=_rw12(o); if(o.title==='SUCCESS!') playMusic(bgTrack()); return r; };
const _pm12=playMusic; playMusic=function(n){ if(n==='home'&&ZMUS&&!B) n=ZMUS; return _pm12(n); };

// ---- bigger roamers + "!" when a monster has unspent points ----
const _scene12=sceneHTML;
sceneHTML=function(){
  return _scene12().replace(/<button class="pet roam" data-pet="([^"]+)"([^>]*)>/g,(a,uid,rest)=>{ const m=monBy(uid); return m&&m.free>0?`<button class="pet roam" data-pet="${uid}"${rest}><b class="roam-alert">!</b>`:a; });
};

// ---- Zone and Monster Select (ZONES opens straight here) ----
const _nb12=newBattle; newBattle=function(a,b,o){ try{ if(o&&o.mode==='campaign'&&b&&b.mons){ S.found=S.found||[]; b.mons.forEach(x=>{ if(x.sp&&!S.found.includes(x.sp)) S.found.push(x.sp); }); } }catch(_){} return _nb12(a,b,o); };
function curZone(){ if(S.lastZone!=null&&!ZONES[S.lastZone]) S.lastZone=null; if(S.lastZone!=null&&zoneUnlocked(S.lastZone)) return S.lastZone; let z=0; ZONES.forEach((_,i)=>{ if(zoneUnlocked(i)) z=i; }); return z; }
openPanel=(function(prev){ return function(name){ if(name==='zones'){ if(PANEL) PANEL.sh.close(); return openZoneSelect(curZone()); } return prev(name); }; })(openPanel);
openZoneSelect=function(zi){
  ZMUS='z_'+ZONES[zi].id; playMusic(ZMUS);
  const sh=sheet(`<div class="tscreen zsel"></div>`,{cls:'full'});
  const team=()=>{ let t=teamMons(); if(!t.length) t=S.mons.slice().sort((a,b)=>b.lvl-a.lvl).slice(0,3); return t; };
  const draw=()=>{
    const z=ZONES[zi]; S.lastZone=zi;
    let tm=team(); if(!tm.some(m=>m.uid===S.zoneMon)) S.zoneMon=tm[0]&&tm[0].uid;
    const owned=new Set(S.mons.map(m=>m.sp)), found=new Set(S.found||[]);
    const fam=SP.filter(s=>s.fam===z.fam);
    sh.body.querySelector('.zsel').innerHTML=`<div class="plankbar"><button class="backb" id="zb">Back</button><div class="plank">Zone and Monster Select</div></div>
      <div class="tfield">${sceneBG()}
        <div class="zs-row">
          <button class="zs-card zs-zone" id="zpick"><div class="zs-h"><span class="lvb">${z.lv}</span><b>${z.n}</b><i class="zs-chg">⇄</i></div>${zoneArt(zi)}
            <div class="zs-foot">${zi===0?'<div class="zs-ft">Learn the basics with Lila</div>':`<div class="zs-ft">Monsters Found</div><div class="zs-found">${fam.map(s=>`<div class="zs-f ${owned.has(s.id)?'':'sil'}">${monSVG(s.id,1)}</div>`).join('')}</div>`}</div></button>
          <div class="zs-card zs-team"><i class="zs-chg zs-tchg">⇄</i>${tm.map(m=>{ const sp=SPI[m.sp]; const pct=m.lvl>=MAXLVL?100:(m.xp|0)/xpNeed(m.lvl)*100;
            return `<button class="zs-m" data-zm="${m.uid}"><div class="zs-mart">${monSVG(m.sp,m.lvl)}</div><div class="zs-minfo"><b>${esc(sp.n)}</b><div class="xpbar"><span class="lvb">${m.lvl}</span><div><i style="width:${pct}%"></i><em>${m.lvl>=MAXLVL?'MAX':`${m.xp|0} / ${xpNeed(m.lvl)}`}</em></div></div></div></button>`; }).join('')}</div>
        </div>
        <button class="letsgo" id="lg">LET'S GO! <i>▶</i></button>
      </div>`;
    const q=s=>sh.body.querySelector(s);
    q('#zb').onclick=sh.close;
    q('#zpick').onclick=()=>pickZone(i=>{ zi=i; ZMUS='z_'+ZONES[zi].id; playMusic(ZMUS); persist(); draw(); });
    const toTeam=()=>{ openTeam(); const iv=setInterval(()=>{ if(TEAMSH) return; clearInterval(iv); if(!document.body.contains(sh.body)) return; draw(); },250); };
    sh.body.querySelectorAll('[data-zm]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); toTeam(); });
    q('.zs-team').onclick=toTeam;
    q('#lg').onclick=()=>{ if(!S.zoneMon) return toast('You need a monster first'); persist(); sh.close(); openTasks(zi); };
  };
  draw();
  if(S.tut===1){ S.tut=2; persist(); setTimeout(async()=>{ await lilaSay(["Zones are where you train to earn dollars and XP for your monster. Let's start at Training Camp!"]); pointAt('#lg'); },350); }
};
function pickZone(cb){
  const sh=sheet(`<div class="zpl"><h2>Choose a Zone</h2>${ZONES.map((z,i)=>{ const open=zoneUnlocked(i), pct=zonePct(i), rep=SP.filter(s=>s.fam===z.fam)[0];
    return `<button class="zone ${open?'':'locked'}" data-pz="${i}" style="--zc:${z.c}"><div class="zone-art">${monSVG(rep.id,pct>=100?20:1)}</div>
      <div class="zone-info"><b><span class="lvb sm">${z.lv}</span> ${z.n}</b><div class="zbar"><i style="width:${pct}%"></i><em>${pct}% complete</em></div></div><div class="zone-go">${open?'›':'🔒'}</div></button>`; }).join('')}</div>`,{cls:'panel'});
  const zrow=sh.body.querySelector('.zd-row');
  const glide=(row,to)=>{ const from=row.scrollLeft, t0=performance.now(), D=320; const step=t=>{ const k=Math.min(1,(t-t0)/D), e=1-Math.pow(1-k,3); row.scrollLeft=from+(to-from)*e; if(k<1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
  sh.body.querySelectorAll('[data-pz]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.pz;
    const target=b.offsetLeft-(zrow.clientWidth-b.offsetWidth)/2, max=zrow.scrollWidth-zrow.clientWidth, to=Math.max(0,Math.min(max,target));
    if(Math.abs(zrow.scrollLeft-to)>b.offsetWidth*0.2){ glide(zrow,to); return; }
    if(!zoneUnlocked(i)) return toast(`Finish ${ZONES[i-1].n} first`); sh.close(); cb(i); });
}

// ---- team cards: "!" for unspent points, no type stripe ----
tcard=function(m,inTeam){
  const sp=SPI[m.sp];
  return `<div class="tcard ${inTeam?'on':''}" data-t="${m.uid}"><button class="info" data-info="${m.uid}">i</button>${m.free>0?'<b class="roam-alert tc-alert">!</b>':''}${monSVG(m.sp,m.lvl)}<div class="tname"><span class="lvb">${m.lvl}</span><b>${sp.n}</b></div></div>`;
};
// ---- mastered star: level-30 badges become a gold star ----
const STAR_SVG='<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z" fill="#fff" stroke="#8a5a00" stroke-width="1.4" stroke-linejoin="round"/></svg>';
function starify(root){ (root.querySelectorAll?root:document).querySelectorAll('.lvb:not(.mast)').forEach(b=>{ if(b.textContent.trim()===String(MAXLVL)&&!b.closest('.zs-h,.zone-info,.zd-h')){ b.classList.add('mast'); b.innerHTML=STAR_SVG; } }); }
new MutationObserver(ms=>{ for(const m of ms) m.addedNodes.forEach(n=>{ if(n.nodeType===1) starify(n.parentNode||n); }); }).observe(document.documentElement,{childList:true,subtree:true});

// ---- zone scenery ----
const ZSCENE={
  meadow:{sky:['#8fd3ff','#d8f1ff'],orb:'#fffbe0',ox:70,oy:30,hills:['#7cc463','#4f9a3c'],x:'tents'},
  beach:{sky:['#5ec8ff','#c9f0ff'],orb:'#fff6c8',ox:25,oy:28,hills:['#f2dc9a','#e7c877'],x:'palm',sea:'#2fa6d8'},
  desert:{sky:['#ffb86b','#ffe2a8'],orb:'#fff1c4',ox:75,oy:26,hills:['#e9b45a','#cf8f3a'],x:'cactus'},
  hollow:{sky:['#3c3550','#8a6a5a'],orb:'#f3e7d0',ox:30,oy:26,hills:['#5a4a3e','#3a2f28'],x:'deadtrees'},
  volcano:{sky:['#5a1e1e','#ff8a4a'],orb:'#ffd0a0',ox:80,oy:22,hills:['#4a2a26','#2e1a18'],x:'volcano'},
  peaks:{sky:['#7fb8ff','#e6f3ff'],orb:'#ffffff',ox:22,oy:24,hills:['#b9c9e6','#8fa4c8'],x:'peaks'}
};
function zoneScene(id){
  const z=ZSCENE[id]||ZSCENE.meadow, g='zg'+id;
  const extra={
    sea:`<rect x="0" y="66" width="200" height="12" fill="${z.sea}"/>`,
    tents:'<path d="M40 74 l12 -16 l12 16z" fill="#e8743b"/><path d="M52 58 v16" stroke="#8a3a12" stroke-width="1.5"/><path d="M140 76 l10 -13 l10 13z" fill="#f2c14e"/>',
    palm:`<rect x="0" y="66" width="200" height="12" fill="${z.sea}"/><path d="M150 92 q4 -20 2 -36" stroke="#8a5a2e" stroke-width="4" fill="none"/><path d="M152 56 q-14 -6 -24 4 M152 56 q14 -8 24 2 M152 56 q-6 -12 -18 -12 M152 56 q8 -12 20 -10" stroke="#3f9a3a" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    cactus:'<path d="M60 92 v-30 m0 10 h-8 v-8 m8 12 h8 v-10" stroke="#3f8a3a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M150 90 v-20 m0 8 h6 v-6" stroke="#3f8a3a" stroke-width="5" fill="none" stroke-linecap="round"/>',
    deadtrees:'<path d="M50 92 v-34 m0 12 l-10 -8 m10 0 l9 -10 m-9 22 l8 -4" stroke="#241a14" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M150 92 v-28 m0 8 l-8 -8 m8 2 l8 -9" stroke="#241a14" stroke-width="3" fill="none" stroke-linecap="round"/>',
    volcano:'<path d="M70 80 l30 -40 h12 l30 40z" fill="#3a201c"/><path d="M100 40 q6 -14 0 -26 q14 8 10 26z" fill="#ff7a2a" opacity=".85"/><path d="M106 40 l-6 18 l10 -6 l-2 14" stroke="#ff6a2a" stroke-width="3" fill="none"/>',
    peaks:'<path d="M20 78 l40 -50 l40 50z M90 78 l45 -58 l45 58z" fill="#8fa4c8"/><path d="M60 28 l-11 14 l7 -3 l4 5 l4 -5 l7 3z M135 20 l-12 16 l7 -3 l5 6 l5 -6 l7 3z" fill="#fff"/>'
  }[z.x]||'';
  return `<svg class="zscene" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${z.sky[0]}"/><stop offset="1" stop-color="${z.sky[1]}"/></linearGradient></defs>
    <rect width="200" height="100" fill="url(#${g})"/><circle cx="${z.ox*2}" cy="${z.oy}" r="13" fill="${z.orb}" opacity=".95"/><circle cx="${z.ox*2}" cy="${z.oy}" r="22" fill="${z.orb}" opacity=".25"/>
    ${z.x==='palm'||z.x==='volcano'||z.x==='peaks'?extra:''}<path d="M0 74 Q50 62 100 72 T200 68 V100 H0z" fill="${z.hills[0]}"/><path d="M0 84 Q60 76 120 84 T200 82 V100 H0z" fill="${z.hills[1]}"/>${z.x==='palm'||z.x==='volcano'||z.x==='peaks'?'':extra}</svg>`;
}
zoneArt=function(zi){ return `<div class="zart scn">${zoneScene(ZONES[zi].id)}</div>`; };
const ZCOL={meadow:['#d9f2c6','#b5e09c'],beach:['#cfeeff','#9fd8f6'],desert:['#ffeab0','#f6d27a'],hollow:['#e6d6cc','#c7ae9e'],volcano:['#ffd2c2','#f4a68c'],peaks:['#e4ecff','#c3d3f4']};
pickZone=function(cb){
  const owned=new Set(S.mons.map(m=>m.sp)), found=new Set(S.found||[]);
  const sh=sheet(`<div class="tscreen zdest"><div class="tfield">${sceneBG()}<div class="zd-top"><button class="backb" id="zdb">Back</button><h2>Choose Your Destination</h2></div>
    <div class="zd-row">${ZONES.map((z,i)=>{ const open=zoneUnlocked(i), c=ZCOL[z.id]||['#eee','#ddd'];
      return `<button class="zd-card ${open?'':'locked'}" data-pz="${i}" style="--c1:${c[0]};--c2:${c[1]}"><div class="zd-h"><span class="lvb">${z.lv}</span><b>${z.n}</b></div><div class="zd-art">${zoneScene(z.id)}${open?'':'<div class="zd-lock">🔒</div>'}</div>
        <div class="zd-foot">${i===0?'<div class="zs-ft">Learn the basics with Lila</div>':!open?`<div class="zs-ft">Complete ${ZONES[i-1].n} to unlock!</div>`:`<div class="zs-ft">Monsters Found</div><div class="zs-found">${SP.filter(s=>s.fam===z.fam).map(s=>`<div class="zs-f ${owned.has(s.id)?'':'sil'}">${monSVG(s.id,1)}</div>`).join('')}</div>`}</div></button>`; }).join('')}</div></div></div>`,{cls:'full'});
  sh.body.querySelector('#zdb').onclick=sh.close;
  const zrow=sh.body.querySelector('.zd-row');
  const glide=(row,to)=>{ const from=row.scrollLeft, t0=performance.now(), D=320; const step=t=>{ const k=Math.min(1,(t-t0)/D), e=1-Math.pow(1-k,3); row.scrollLeft=from+(to-from)*e; if(k<1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
  sh.body.querySelectorAll('[data-pz]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.pz;
    const target=b.offsetLeft-(zrow.clientWidth-b.offsetWidth)/2, max=zrow.scrollWidth-zrow.clientWidth, to=Math.max(0,Math.min(max,target));
    if(Math.abs(zrow.scrollLeft-to)>b.offsetWidth*0.2){ glide(zrow,to); return; }
    if(!zoneUnlocked(i)) return toast(`Finish ${ZONES[i-1].n} first`); sh.close(); cb(i); });
  const cur=sh.body.querySelector(`[data-pz="${S.lastZone|0}"]`), row=sh.body.querySelector('.zd-row'); if(cur) setTimeout(()=>{ row.scrollLeft=cur.offsetLeft-(row.clientWidth-cur.offsetWidth)/2; },30);
};
const _dt12=drawTeam; drawTeam=function(){ _dt12(); const f=TEAMSH&&TEAMSH.body.querySelector('.tfield .scene'); if(f) f.outerHTML=sceneBG(); };

// ---- simple alert popup ----
function alertBox(msg){
  const w=document.createElement('div'); w.className='abox-wrap';
  w.innerHTML=`<div class="abox"><p>${esc(msg)}</p><button class="abox-ok">OK</button></div>`;
  document.body.appendChild(w); requestAnimationFrame(()=>w.classList.add('on'));
  const close=()=>{ w.classList.remove('on'); setTimeout(()=>w.remove(),200); };
  w.querySelector('.abox-ok').onclick=close; w.onclick=e=>{ if(e.target===w) close(); };
}

// ---- full-screen shop ----
let SHOPSH=null, SHOPCTX=null;
const SHOP_TABS=[['items','Items'],['eggs','Eggs'],['energy','Energy'],['mush','Mushrooms']];
function openShop(ctx){
  if(PANEL) PANEL.sh.close(); if(SHOPSH) SHOPSH.close();
  SHOPCTX=ctx||null; if(ctx) SHOPTAB='items';
  if(S.tut===5){ SHOPTAB='items'; SHOPSEL='manawood'; }
  const sh=sheet(`<div class="tscreen shopscr"></div>`,{cls:'full', onClose:()=>{ if(SHOPSH===sh){ SHOPSH=null; SHOPCTX=null; } render(); }});
  SHOPSH=sh; drawShop();
  if(S.tut===5) setTimeout(()=>pointAt('#buy'),400);
}
openPanel=(function(prev){ return function(name){ if(name==='shop') return openShop(); return prev(name); }; })(openPanel);
function drawShop(){
  if(!SHOPSH) return; const sh=SHOPSH; tickEnergy(); S.inv=S.inv||{};
  let body='';
  if(SHOPTAB==='items'){
    const ids=Object.keys(ITEMS); const sel=SHOPSEL&&ITEMS[SHOPSEL]?SHOPSEL:ids[0]; const it=ITEMS[sel], have=S.inv[sel]|0;
    const m=SHOPCTX&&SHOPCTX.m; const canEq=m&&have>0;
    body=`<div class="s2row">${ids.map(id=>`<button class="s2item ${id===sel?'sel':''} ${ITEMS[id].lv>highLvl()?'dim':''}" data-si="${id}"><div class="s2art">${itemSVG(id)}</div><span><b class="g">$</b> ${ITEMS[id].cost}</span></button>`).join('')}</div>
      <div class="s2det"><div class="s2h"><b>${it.n}</b><span>Inventory: x${have}</span></div>
        <div class="s2r"><span class="s2c"><b class="g">$</b> ${it.cost}</span><span class="s2lv">Requires Level: <b>${it.lv}</b></span>
          ${canEq?`<button class="s2btn eq" id="s2eq">EQUIP</button>`:''}<button class="s2btn" id="buy" data-buy="${sel}">BUY</button></div>
        <p>${itemDesc(sel)}</p></div>`;
  } else if(SHOPTAB==='eggs'){
    body=`<div class="s2cards"><button class="s2card" id="hatch"><div class="egg"></div><b>Mystery Egg</b><span>Hatches a random monster</span><em>10 🍄</em></button>
      <button class="s2card" id="hatchc"><div class="egg plain"></div><b>Monster Egg</b><span>A random monster, a few levels lower</span><em class="g">$${eggCost()}</em></button>
      ${SP.filter(s=>s.rare).map(s=>`<button class="s2card rare" data-rare="${s.id}"><div class="s2mon">${monSVG(s.id,1)}</div><b>${s.n}</b><span>Rare monster</span><em>50 🍄</em></button>`).join('')}</div>`;
  } else if(SHOPTAB==='energy'){
    body=`<div class="s2cards"><button class="s2card" id="refill"><div class="egg bolt">⚡</div><b>Energy Refill</b><span>Fill your energy to max</span><em>10 🍄</em></button></div>`;
  } else {
    body=`<div class="s2cards">${[[60,'$0.99'],[330,'$4.99'],[700,'$9.99'],[1500,'$19.99']].map(([n,p])=>`<div class="s2card soon"><div class="s2m">${mushroomSVG('#b04fd6')}</div><b>${n} Mushrooms</b><em>${p}</em><span class="s2soon">Coming soon</span></div>`).join('')}</div>`;
  }
  sh.body.querySelector('.shopscr').innerHTML=`<div class="thud"><button class="backb" id="s2b">Back</button>
      <div class="thcol"><div class="hbar energy"><span class="ico">⚡</span><div class="ebar"><i style="width:${S.energy/S.maxEnergy*100}%"></i><b>${S.energy<S.maxEnergy?`+1 in ${nextEnergyIn()} · `:''}${S.energy} / ${S.maxEnergy}</b></div></div>
      <div class="hrow"><div class="hbar cash"><span class="ico c">$</span><b>${S.cash|0}</b></div><div class="hbar shrooms"><span class="ico m">${mushroomSVG('#b04fd6')}</span><b>${S.mush}</b></div></div></div></div>
    <div class="s2tabs">${SHOP_TABS.map(([k,n])=>`<button class="s2tab ${SHOPTAB===k?'on':''}" data-st2="${k}">${n}</button>`).join('')}</div>
    <div class="s2body">${body}</div>`;
  const q=s=>sh.body.querySelector(s);
  q('#s2b').onclick=sh.close;
  sh.body.querySelectorAll('[data-st2]').forEach(b=>b.onclick=()=>{ SHOPTAB=b.dataset.st2; drawShop(); });
  sh.body.querySelectorAll('[data-si]').forEach(b=>b.onclick=()=>{ SHOPSEL=b.dataset.si; const r=q('.s2row'), x=r.scrollLeft; drawShop(); q('.s2row').scrollLeft=x; });
  const bu=q('#buy'); if(bu) bu.onclick=()=>{ const r=q('.s2row'), x=r?r.scrollLeft:0; buyItem(bu.dataset.buy); if(S.tut===6){ sh.close(); return; } drawShop(); const r2=q('.s2row'); if(r2) r2.scrollLeft=x; };
  const eq=q('#s2eq'); if(eq) eq.onclick=()=>{ const {m,slot}=SHOPCTX, id=SHOPSEL||Object.keys(ITEMS)[0];
    if(ITEMS[id].lv>m.lvl) return alertBox(`${SPI[m.sp].n} needs to be level ${ITEMS[id].lv} to use this.`);
    const cur=m.eq[slot]; if(cur) S.inv[cur]=(S.inv[cur]|0)+1; S.inv[id]--; m.eq[slot]=id; persist(); sh.close(); openMon(m.uid); toast(`Equipped ${ITEMS[id].n}!`); };
  const h=q('#hatch'); if(h) h.onclick=()=>{ hatch(); drawShop(); };
  const hc=q('#hatchc'); if(hc) hc.onclick=()=>{ hatchCash(); drawShop(); };
  document.querySelectorAll('[data-rare]').forEach(b=>b.onclick=()=>buyRare(b.dataset.rare));
  const rf=q('#refill'); if(rf) rf.onclick=()=>{ tickEnergy(); if(S.energy>=S.maxEnergy) return toast('Energy is already full'); if(S.mush<10) return toast('You need 10 🍄'); S.mush-=10; S.energy=S.maxEnergy; S.energyAt=Date.now(); persist(); drawShop(); toast('Energy refilled!'); };
  const cur=q('.s2item.sel'), row=q('.s2row'); if(cur&&row&&!row._init){ row._init=1; row.scrollLeft=cur.offsetLeft-(row.clientWidth-cur.offsetWidth)/2; }
}

// ---- zone complete screen ----
function zoneCompleteScreen(zi){
  return new Promise(res=>{
    const z=ZONES[zi];
    const sh=sheet(`<div class="tscreen zdone"><div class="tfield">${sceneBG()}<div class="zd-dim"></div>
      <h2 class="zd-title">${zi===0?`You completed ${esc(z.n)}!`:'You Found a New Monster'}</h2>
      <div class="zd-lila">${lilaSVG()}</div>
      <div class="zd-side"><p>${zi===0?'When you complete other zones you find new monsters!':"Hey! Looks like you found a new friend to join you on your adventure. Let's see who it is!"}</p><button class="zd-done ${zi?'go':''}" id="zdd">${zi===0?'DONE':"LET'S GO! <i>▶</i>"}</button></div></div></div>`,{cls:'full',locked:true,onClose:res});
    sh.body.querySelector('#zdd').onclick=sh.close;
  });
}

// ---- story rivals: Jay and Bob ----
SPI.rival_jay={id:'rival_jay',n:'Jay',fam:'hound',col:['#c0392b','#2b2b2b','#f3d9a8'],tw:{},sk:['furyfist','devour','souleater','pounce'],rival:1};
SPI.rival_bob={id:'rival_bob',n:'Bob',fam:'shell',col:['#5b4a8a','#c9a227','#efe6ff'],tw:{},sk:['hardened','splash','wave','grounded'],rival:1};
const RIVALS={
  'jay1':{sp:'rival_jay',name:'Jay',zone:'beach',title:'Teach Jay a lesson in manners!',
    say:["Uh oh — that's Jay. He's been shoving the little monsters off this beach.","He fights dirty and his Fury Fist hits hard. Show him some manners!"]},
  'bob1':{sp:'rival_bob',name:'Bob',zone:'desert',title:'Stop Bob from hogging the oasis',
    say:["That big shell over there is Bob — Jay's buddy.","He's been hogging the only oasis in the desert. His shell is tough, so keep the pressure on!"]},
  'jay2':{sp:'rival_jay',name:'Jay',zone:'hollow',title:'Jay wants a rematch!',
    say:["Jay followed you into the woods. He's still sore about the beach.","He's gotten stronger — don't hold back!"]},
  'bob2':{sp:'rival_bob',name:'Bob',zone:'volcano',title:'Bob is blocking the crater path',
    say:["Bob again! He's parked himself right on the crater path.","Beat him and he'll have to move. Good luck!"]}
};
Object.entries(RIVALS).forEach(([key,r])=>{ const list=ZTASKS[r.zone]; if(!list||list.some(x=>x[8]==='rival:'+key)) return;
  const prev=list[list.length-2]||list[0]; const lv=prev[2]; list.splice(list.length-1,0,['fight',r.title,lv,0,Math.round(prev[4]*1.2),Math.round(prev[5]*1.2),4,1,'rival:'+key]); });
taskProg=(function(prev){ return function(zi){ const id=ZONES[zi].id; S.tasks=S.tasks||{}; const n=ZTASKS[id].length, a=S.tasks[id];
  if(a&&a.length===n-1) a.splice(a.length-1,0,0); return prev(zi); }; })(taskProg);
const _doTask12=doTask;
doTask=function(zi,k){
  const t=taskList(zi)[k]; const sp=t.special||'';
  if(sp.startsWith('rival:')){
    const key=sp.slice(6), r=RIVALS[key]; S.story=S.story||{};
    const go=()=>{ if(!spend(t.en)){ drawTasks(); return; } const pr=taskProg(zi); if(pr[k]>=t.reps) pr[k]=0; persist();
      const m=monBy(S.zoneMon)||teamMons()[0];
      const b=newBattle({name:S.name, mons:[snapOf(m)]}, {name:r.name, mons:[{sp:r.sp, lvl:t.lv, hpMul:1}]}, {mode:'campaign'});
      B={b, mode:'campaign', meta:{zi, task:k, uid:m.uid}, mySide:0, ctl:['human','ai'], tgt:{}};
      openBattle(); NET.updatePresence(); drive(); };
    if(!S.story[key]){ S.story[key]=1; persist(); lilaSay(r.say).then(go); return; }
    return go();
  }
  return _doTask12(zi,k);
};
const _drawTasks12=drawTasks;
drawTasks=function(){ _drawTasks12(); if(!TASKSH) return; const tl=taskList(TASKSH.zi);
  TASKSH.sh.body.querySelectorAll('.tasks .task').forEach((el,k)=>{ const sp=(tl[k]&&tl[k].special)||''; if(!sp.startsWith('rival:')) return; const r=RIVALS[sp.slice(6)];
    el.classList.add('rivalq'); const h=el.querySelector('.t-h'); if(h&&!h.querySelector('.t-rv')) h.insertAdjacentHTML('beforeend',`<span class="t-rv">${monSVG(r.sp,tl[k].lv|0)}</span>`); }); };
// campaign battles: passive/item icons with hold-for-info, and the zone's own scenery
hudPanel=(function(prev){ return function(b,side,right,ctx){ const h=prev(b,side,right,ctx); const m=b.sides[side].mons[focusMon(b,side)]; return h.slice(0,-6)+hudIcons(m)+'</div>'; }; })(hudPanel);
renderBattle=(function(prev){ return function(){ prev(); if(!B||!B.b||B.b.single) return; const root=$('#battle');
  root.querySelectorAll('.bhp .hi').forEach(bindTip);
  if(B.mode==='campaign'&&B.meta&&B.meta.zi!=null){ const f=root.querySelector('.bfield'); if(f&&!f.dataset.z){ f.dataset.z=1; f.innerHTML=`<div class="bzscene">${zoneScene(ZONES[B.meta.zi].id)}</div>`; } } }; })(renderBattle);
skillDesc=(function(prev){ return function(id,L){ if(id==='splash') return `Shoots a powerful bubble that deals ${Math.round(lv(SK.splash.dmg,L||1))} water damage.`; if(id==='devour') return `Attack the enemy and devour their life essence, stealing ${Math.round(lv(SK.devour.leechL,L||1)*100)}% of damage dealt.`; if(id==='souleater') return `Strike the enemy's soul, dealing ${Math.round(lv(SK.souleater.m,L||1)*100)}% of your attack damage and stealing ${Math.round(lv(SK.souleater.mpAtk,L||1)*100)}% of your attack in mana.`; return prev(id,L); }; })(skillDesc);

// ---- Breta: Lila's friend who scans new monsters ----
function bretaSVG(){
  return `<svg viewBox="0 0 120 140"><path d="M14 140 Q16 100 60 98 Q104 100 106 140Z" fill="#5fae8a"/><path d="M44 100 L60 116 L76 100Z" fill="#f4f1e8"/>
    <rect x="52" y="82" width="16" height="20" rx="6" fill="#f0c8a4"/>
    <path d="M26 66 Q22 28 60 24 Q98 28 94 66 L94 84 Q88 86 84 80 L84 56 Q60 48 36 56 L36 80 Q32 86 26 84Z" fill="#a0522d"/>
    <ellipse cx="60" cy="62" rx="24" ry="27" fill="#f6d2b0"/>
    <path d="M36 52 Q60 36 84 52 Q74 42 60 41 Q46 42 36 52Z" fill="#a0522d"/>
    <circle cx="49" cy="63" r="9" fill="#e9fbff" stroke="#1f8f9a" stroke-width="3"/><circle cx="71" cy="63" r="9" fill="#e9fbff" stroke="#1f8f9a" stroke-width="3"/><path d="M58 63 h4" stroke="#1f8f9a" stroke-width="3"/>
    <circle cx="50" cy="64" r="3" fill="#2a1a12"/><circle cx="72" cy="64" r="3" fill="#2a1a12"/><circle cx="51" cy="63" r="1" fill="#fff"/><circle cx="73" cy="63" r="1" fill="#fff"/>
    <path d="M52 78 Q60 84 68 78" stroke="#7a3a2a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="42" cy="73" r="3.5" fill="#f2a28a" opacity=".5"/><circle cx="78" cy="73" r="3.5" fill="#f2a28a" opacity=".5"/>
    <rect x="70" y="112" width="30" height="22" rx="3" fill="#2f3a4a"/><rect x="73" y="115" width="24" height="16" rx="2" fill="#7fe0ff"/><path d="M76 124 l4 -4 l4 3 l5 -6 l5 5" stroke="#1f6f8a" stroke-width="1.6" fill="none"/></svg>`;
}
lilaSay=(function(prev){ return function(lines,opts={}){ if(opts.who!=='breta') return prev(lines,opts);
  return new Promise(res=>{ prev(lines,opts).then(res); const w=[...document.querySelectorAll('.lila-wrap')].pop(); if(!w) return;
    const fix=()=>{ const p=w.querySelector('.lila-por'); if(p&&!p.dataset.b){ p.dataset.b=1; p.innerHTML=`${bretaSVG()}<div class="lila-name">Breta</div>`; } };
    fix(); new MutationObserver(fix).observe(w,{childList:true,subtree:true}); }); }; })(lilaSay);
openBattle=(function(prev){ return function(){ const r=prev.apply(this,arguments);
  try{ if(B&&B.mode==='campaign'&&B.b){ const foe=B.b.sides[1].mons[0]; const sp=SPI[foe.sp]; S.scanned=S.scanned||{};
    if(sp&&sp.fam!=='dummy'&&!S.scanned[foe.sp]&&S.tut>=99){ S.scanned[foe.sp]=1; persist(); B.paused=true;
      const ks=(sp.sk||[]).map(id=>SK[id]).filter(Boolean); const atk=ks.find(k=>k.k==='hit'&&k.el!=='neutral')||ks.find(k=>k.k==='hit')||ks.find(k=>k.k!=='passive');
      setTimeout(()=>lilaSay([sp.rival?`That's ${sp.n}! Careful — he hits hard with ${atk?atk.n:'his attacks'}.`:`It's a ${sp.n}! Look out for its ${atk?atk.n:'attacks'}!`],{who:'breta'}).then(()=>{ if(B){ B.paused=false; drive(); } }),500); } } }catch(_){}
  return r; }; })(openBattle);

ST_ICON.absorb=['swirl','#22a6e3'];

// ---- ability upgrade buttons + train popup ----
upCost=function(sl){ return 200*sl; };
drawMon=(function(prev){ return function(){ prev(); if(!MONSH) return; const m=monBy(MONSH.uid); if(!m) return; const b=MONSH.sh.body;
  b.querySelectorAll('[data-up]').forEach(x=>{ const id=x.dataset.up, sl=m.skl[id]||1, need=upNeed(sl+1), can=m.lvl>=need;
    const nb=document.createElement('button'); nb.className='upb2'+(can?' glow':''); nb.innerHTML='<i>+</i><span>upgrade</span>'; x.replaceWith(nb);
    nb.onclick=()=>{ if(!can) return alertBox(`${SPI[m.sp].n} needs to be level ${need} to train this ability.`); trainPopup(m,id); }; }); }; })(drawMon);
function trainPopup(m,id){
  const sl=m.skl[id]||1, nl=sl+1, k=SK[id], c=upCost(sl), cost=skCost(id,nl);
  const w=document.createElement('div'); w.className='abox-wrap';
  w.innerHTML=`<div class="tpop"><h3>Train level ${nl} ${esc(k.n)}</h3>
    <div class="tp-card"><div class="tp-ic">${icon(skIconKey(id),EL[k.el].c,64)}<b>level ${nl}</b></div><div><b class="tp-n">${esc(k.n)}</b>${k.k!=='passive'?`<div class="tp-c">mana cost: ${cost}</div>`:''}<p>${skillDesc(id,nl)}</p></div></div>
    <div class="tp-cost">Cost: $${c.toLocaleString()}</div><div class="tp-btns"><button class="tp-b" id="tpc">CANCEL</button><button class="tp-b" id="tpt">TRAIN</button></div>
    <div class="tp-have">You have: $${(S.cash|0).toLocaleString()}</div></div>`;
  document.body.appendChild(w); requestAnimationFrame(()=>w.classList.add('on'));
  const close=()=>{ w.classList.remove('on'); setTimeout(()=>w.remove(),200); };
  w.querySelector('#tpc').onclick=close;
  w.querySelector('#tpt').onclick=()=>{ if((S.cash|0)<c){ close(); return alertBox(`You need $${c.toLocaleString()} to train this.`); } S.cash-=c; m.skl[id]=nl; persist(); close(); drawMon(); renderHUD(); toast(`${k.n} is now level ${nl}!`); };
}
// ---- locked (needs evolving) abilities show their info under a lock; Reset Monster ----
drawMon=(function(prev){ return function(){ prev(); if(!MONSH) return; const m=monBy(MONSH.uid); if(!m) return; const b=MONSH.sh.body; const sp=SPI[m.sp];
  b.querySelectorAll('.pab').forEach((row,i)=>{ if(!row.classList.contains('locked')) return; const id=sp.sk[i], k=SK[id]; if(!k||row.dataset.lk) return; row.dataset.lk=1;
    const s=row.querySelector('.pab-t > span'); const t=row.querySelector('.pab-t > b'); if(t) t.innerHTML=`${esc(k.n)}${k.k==='passive'?' <span class="pastag">Passive</span>':''}`;
    if(s) s.textContent=skillDesc(id,1)+(k.k!=='passive'&&skCost(id,1)?` · ${skCost(id,1)} mana`:'');
    row.insertAdjacentHTML('beforeend',`<div class="pab-lock"><svg viewBox="0 0 40 48"><path d="M10 20 V14 a10 10 0 0 1 20 0 V20" fill="none" stroke="currentColor" stroke-width="5"/><rect x="5" y="20" width="30" height="24" rx="4" fill="currentColor"/><circle cx="20" cy="30" r="4" fill="#cfd8c8"/><rect x="18" y="31" width="4" height="8" fill="#cfd8c8"/></svg><em>Evolve to unlock</em></div>`); });
  const host=b.querySelector('#tact')||b; if(!b.querySelector('#rsm')){ host.insertAdjacentHTML('afterend',`<div class="rsm-wrap"><button class="rsm" id="rsm">RESET MONSTER <i></i></button></div>`);
    b.querySelector('#rsm').onclick=()=>confirmBox(`Reset ${esc(sp.n)}? All stat points come back to spend again, and every ability goes back to level 1.`,'RESET',()=>{
      const p=m.pts||{atk:0,hp:0,mp:0}; m.free=(m.free|0)+(p.atk|0)+(p.hp|0)+(p.mp|0); m.pts={atk:0,hp:0,mp:0}; Object.keys(m.skl||{}).forEach(k=>m.skl[k]=1); persist(); drawMon(); renderHUD(); toast(`${sp.n} was reset`); }); }
}; })(drawMon);
function confirmBox(msg,ok,fn){
  const w=document.createElement('div'); w.className='abox-wrap';
  w.innerHTML=`<div class="abox"><p>${msg}</p><div class="abox-row"><button class="abox-ok" id="cbn">Cancel</button><button class="abox-ok red" id="cby">${ok}</button></div></div>`;
  document.body.appendChild(w); requestAnimationFrame(()=>w.classList.add('on'));
  const close=()=>{ w.classList.remove('on'); setTimeout(()=>w.remove(),200); };
  w.querySelector('#cbn').onclick=close; w.querySelector('#cby').onclick=()=>{ close(); fn(); };
}

// mushroom-priced items (bowls)
const priceHTML=id=>{ const it=ITEMS[id]; return it.mush?`<span class="mprice">${mushroomSVG('#b04fd6')}</span> ${it.mush}`:`<b class="g">$</b> ${it.cost}`; };
buyItem=(function(prev){ return function(id){ const it=ITEMS[id]; if(!it||!it.mush) return prev(id);
  if(it.lv>highLvl()) return toast(`Requires a Lv ${it.lv} monster`);
  if((S.mush|0)<it.mush) return alertBox(`You need ${it.mush} mushrooms for the ${it.n}.`);
  S.mush-=it.mush; S.inv=S.inv||{}; S.inv[id]=(S.inv[id]|0)+1; persist(); render(); toast(`Bought ${it.n}!`); }; })(buyItem);
drawShop=(function(prev){ return function(){ prev(); if(!SHOPSH||SHOPTAB!=='items') return; const b=SHOPSH.body;
  b.querySelectorAll('.s2item').forEach(el=>{ const id=el.dataset.si; if(ITEMS[id]&&ITEMS[id].mush){ const sp=el.querySelector('span'); if(sp) sp.innerHTML=priceHTML(id); } });
  const sel=b.querySelector('.s2item.sel'), c=b.querySelector('.s2c'); if(sel&&c&&ITEMS[sel.dataset.si].mush) c.innerHTML=priceHTML(sel.dataset.si); }; })(drawShop);

// ---- NEW MONSTER! popup ----
reveal2=function(m,title,done){
  const sp=SPI[m.sp]; const st=monStats(m); const partner=/partner/i.test(title||'');
  const w=document.createElement('div'); w.className='abox-wrap nm-wrap';
  w.innerHTML=`<div class="nmpop"><button class="nm-x" aria-label="Close">✕</button><h2 class="nm-t">NEW MONSTER!</h2>
    <i class="nm-s s1">★</i><i class="nm-s s2">★</i><i class="nm-s s3">★</i><i class="nm-s s4">★</i>
    <div class="nm-row"><div class="nm-art">${monSVG(m.sp,m.lvl)}</div><div class="nm-info"><h3>${partner?`Your partner is ${esc(sp.n)}!`:`You found ${/^[aeiou]/i.test(sp.n)?"an":"a"} ${esc(sp.n)}!`}</h3>
      <div class="nm-stats"><div><span>★</span>Attack<b>${st.atk}</b></div><div><span class="h">♥</span>Life<b>${st.hp}</b></div><div><span class="m">💧</span>Mana<b>${st.mp}</b></div></div></div></div></div>`;
  document.body.appendChild(w); requestAnimationFrame(()=>w.classList.add('on')); try{ sfx('level'); }catch(_){}
  const close=()=>{ w.classList.remove('on'); setTimeout(()=>{ w.remove(); done&&done(); },200); };
  w.querySelector('.nm-x').onclick=close; w.onclick=e=>{ if(e.target===w) close(); };
  return {close};
};
// battle missions finish after a single win
Object.values(ZTASKS).forEach(list=>list.forEach(t=>{ if(t[0]==='fight'||t[0]==='boss') t[7]=1; }));

// stop iOS magnifier / double-tap zoom on rapid taps
(function(){ let last=0, lastEl=null;
  addEventListener('touchend',e=>{ if(e.target.closest&&e.target.closest('[data-pp],[data-pm]')) return; const el=e.target.closest&&e.target.closest('button,.pbtn'); const now=Date.now();
    if(el && el===lastEl && now-last<350){ e.preventDefault(); el.click(); }
    last=now; lastEl=el; },{capture:true,passive:false});
  addEventListener('dblclick',e=>e.preventDefault(),{capture:true});
  document.addEventListener('selectstart',e=>{ if(!/INPUT|TEXTAREA/.test(e.target.tagName||'')) e.preventDefault(); });
})();

// ---- "Opponent Fled!" ----
function fledPopup(){ return new Promise(res=>{
  const w=document.createElement('div'); w.className='abox-wrap';
  w.innerHTML=`<div class="fledpop"><button class="nm-x" aria-label="Close">✕</button><div class="fp-lila">${lilaSVG()}</div><div class="fp-side"><p>Opponent Fled!</p><button class="tp-b" id="fpok">OK</button></div></div>`;
  document.body.appendChild(w); requestAnimationFrame(()=>w.classList.add('on'));
  const close=()=>{ w.classList.remove('on'); setTimeout(()=>{ w.remove(); res(); },200); };
  w.querySelector('#fpok').onclick=close; w.querySelector('.nm-x').onclick=close; }); }
finishBattle=(function(prev){ return function(){ if(B&&B.b&&B.b.fled!=null&&B.b.fled!==B.mySide&&!B.fledShown){ B.fledShown=true; fledPopup().then(()=>{ if(B) prev(); }); return; } return prev(); }; })(finishBattle);

// ===== bottom-bar pop-up submenus =====
const SUBMENUS={
  social:[['My Wall',()=>openProfile({me:true})],['Forums',()=>alertBox('Forums are coming soon!')],['Friends',()=>openPanelRaw('social')],['Top Trainers',()=>openTopTrainers()]],
  menu:[['My Profile',()=>openProfile({me:true})],['Quests',()=>openPanelRaw('quests')],['Profile Picture',()=>openAvatar()],['Settings',()=>openPanelRaw('menu')]],
  shop:[['Items',()=>{ SHOPTAB='items'; openShop(); }],['Eggs',()=>{ SHOPTAB='eggs'; openShop(); }],['Energy',()=>{ SHOPTAB='energy'; openShop(); }],['Mushrooms',()=>{ SHOPTAB='mush'; openShop(); }]]
};
let SUBM=null;
function closeSub(){ if(SUBM){ SUBM.remove(); SUBM=null; document.querySelectorAll('#bar .nb.subon').forEach(x=>x.classList.remove('subon')); } }
function openSub(key,btn){
  const was=SUBM&&SUBM.dataset.k===key; closeSub(); if(was) return;
  const r=localRect(btn), R=isRot()?{w:document.body.getBoundingClientRect().height}:{w:innerWidth};
  const el=document.createElement('div'); el.className='submenu'; el.dataset.k=key;
  el.innerHTML=SUBMENUS[key].map(([n],i)=>`<button class="subb" data-i="${i}">${n}</button>`).join('');
  document.body.appendChild(el);
  const w=el.offsetWidth; el.style.left=Math.max(8,Math.min(R.w-w-8, r.left+r.width/2-w/2))+'px'; el.style.bottom=(document.body.getBoundingClientRect()[isRot()?'width':'height']-r.top+8)+'px';
  btn.classList.add('subon'); SUBM=el;
  el.querySelectorAll('.subb').forEach(b=>b.onclick=e=>{ e.stopPropagation(); closeSub(); SUBMENUS[key][+b.dataset.i][1](); });
}
addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('#bar [data-p]'); if(b&&b.dataset.p==='shop'&&S.tut===5){ e.stopPropagation(); e.preventDefault(); closeSub(); SHOPTAB='items'; SHOPSEL='manawood'; openShop(); return; } if(b&&SUBMENUS[b.dataset.p]){ e.stopPropagation(); e.preventDefault(); openSub(b.dataset.p,b); return; }
  if(SUBM&&!e.target.closest('.submenu')) closeSub(); },true);
function openPanelRaw(name){ closeSub(); if(PANEL) PANEL.sh.close(); const sh=sheet(PANELS[name](),{cls:'panel', onClose:()=>{ if(PANEL&&PANEL.sh===sh) PANEL=null; }}); PANEL={name, sh}; TAB=name; bindView(sh.body); }
function openTopTrainers(){
  const list=[{name:S.name||'You',rank:myRank(),me:true,avatar:myAvatar()}].concat(NET.peers.filter(p=>!p.me).map(p=>({name:p.name||'Trainer',rank:p.rank||1000,avatar:sanitizeAv(p.avatar)}))).sort((a,b)=>b.rank-a.rank);
  sheet(`<h2>Top Trainers</h2><div class="list">${list.map((p,i)=>`<div class="row ${p.me?'me':''}"><b class="tt-n">${i+1}</b><div class="soc-av">${avatarSVG(p.avatar||{t:'trainer',i:0})}</div><div><b>${esc(p.name)}${p.me?' (you)':''}</b><span>${rankBadge(p.rank,16)} ${p.rank}</span></div></div>`).join('')}</div><p class="muted small center">Showing trainers online right now.</p>`);
}
// Get More! goes straight to mushrooms
document.addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('#getmore')){ e.stopPropagation(); e.preventDefault(); SHOPTAB='mush'; openShop(); } },true);

// ===== Battle hub: Arena / Practice / Challenges =====
const CHALLENGES=[
  {n:'Bug Swarm',fam:'bug',lv:6,d:'Three angry insects block the trail.'},
  {n:'Sky Raiders',fam:'wing',lv:12,d:'A flock of avians swoops down.'},
  {n:'Dragon Den',fam:'drake',lv:18,d:'Wake the dragons — if you dare.'},
  {n:'Thunder Pack',fam:'volt',lv:24,d:'A pack of storm felines strikes.'}
];
openPanel=(function(prev){ return function(name){ if(name==='battle') return openBattleHub(); return prev(name); }; })(openPanel);
function hubHud(){ tickEnergy(); return `<div class="thud"><button class="backb" id="bhb">Back</button>
  <div class="thcol"><div class="hrow"><div class="hbar name"><span class="ico">♛</span><b>${esc(S.name||'Trainer')}</b></div><div class="hbar rank"><span class="ico r">${rankBadge(myRank(),22)}</span><b>${myRank()}</b></div><div class="hbar cash"><span class="ico c">$</span><b>${S.cash|0}</b></div></div>
  <div class="hrow"><div class="hbar energy"><span class="ico">⚡</span><div class="ebar"><i style="width:${S.energy/S.maxEnergy*100}%"></i><b>${S.energy<S.maxEnergy?`+1 in ${nextEnergyIn()} · `:''}${S.energy} / ${S.maxEnergy}</b></div></div><div class="hbar shrooms"><span class="ico m">${mushroomSVG('#b04fd6')}</span><b>${S.mush}</b></div></div></div></div>`; }
function openBattleHub(){
  closeSub(); if(PANEL) PANEL.sh.close();
  const sh=sheet(`<div class="tscreen bhub"></div>`,{cls:'full'});
  sh.body.querySelector('.bhub').innerHTML=`${hubHud()}<div class="bh-body">
    <button class="bh-b red" id="bh-arena">ARENA <i>★</i></button><p>Battle rival trainers for money and rank!</p>
    <button class="bh-b blue" id="bh-prac">PRACTICE</button><p>An unranked practice match for fun and XP!</p>
    <button class="bh-b green" id="bh-chal"><em>NEW!</em>CHALLENGES!</button><p>Complete difficult fights for new monsters!</p></div>`;
  const q=s=>sh.body.querySelector(s);
  q('#bhb').onclick=sh.close;
  q('#bh-arena').onclick=()=>{ sh.close(); openPanelRaw('battle'); };
  q('#bh-prac').onclick=()=>{ sh.close(); openChampions({practice:true}); };
  q('#bh-chal').onclick=()=>{ sh.close(); openChallenges(); };
}
function openChallenges(){
  S.chal=S.chal||{};
  const sh=sheet(`<div class="tscreen chals"></div>`,{cls:'full'});
  const draw=()=>{ sh.body.querySelector('.chals').innerHTML=`${hubHud()}<div class="ch-row">${CHALLENGES.map((c,i)=>{ const done=S.chal[i], fam=SP.filter(s=>s.fam===c.fam);
    return `<div class="ch-card ${done?'done':''}"><div class="ch-h"><span class="lvb">${c.lv}</span><b>${c.n}</b></div>
      <div class="ch-foes">${fam.slice(0,3).map(s=>`<div>${monSVG(s.id,c.lv)}</div>`).join('')}</div><p>${c.d}</p>
      <div class="ch-rw"><span>${done?'Completed':'Reward: a new monster'}</span><div class="ch-sil">${monSVG(fam[3].id,1)}</div></div>
      <button class="tgo" data-ch2="${i}">${done?'AGAIN':'FIGHT!'} <i>▶</i></button><small>⚡ 3</small></div>`; }).join('')}</div>`;
    sh.body.querySelector('#bhb').onclick=()=>{ sh.close(); openBattleHub(); };
    sh.body.querySelectorAll('[data-ch2]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.ch2, c=CHALLENGES[i];
      if(!S.team.length) return alertBox('Add a monster to your team first!');
      if(highLvl()<c.lv-4) return alertBox(`Your monsters should be at least level ${c.lv-4} for this challenge!`);
      if(!spend(3)) return; persist(); sh.close();
      const fam=SP.filter(s=>s.fam===c.fam); const foe={name:c.n, mons:[0,1,2].map(k=>({sp:fam[k].id, lvl:c.lv+1, hpMul:1.1}))};
      startBattle({mode:'challenge', foe, meta:{ci:i}}); }); };
  draw();
}
finishBattle=(function(prev){ return function(){ if(B&&B.mode==='challenge'&&B.b&&B.b.over){ const win=B.b.winner===B.mySide, ci=B.meta.ci, c=CHALLENGES[ci];
    if(win){ S.chal=S.chal||{}; const first=!S.chal[ci]; S.chal[ci]=1; let nm=null;
      if(first){ const fam=SP.filter(s=>s.fam===c.fam); const owned=new Set(S.mons.map(m=>m.sp)); let pool=fam.filter(s=>!owned.has(s.id)); if(!pool.length) pool=fam; nm=addMon(pool[Math.floor(Math.random()*pool.length)].id, Math.max(2,c.lv-4)); if(S.team.length<3) S.team.push(nm.uid); }
      else { S.cash=(S.cash|0)+c.lv*15; }
      persist(); prev(); if(nm) setTimeout(()=>reveal2(nm,'You found a new monster!',()=>{}),900); return; } }
  return prev(); }; })(finishBattle);

// ===== My Friends (online now / rankings) =====
function openFriends(tab){
  closeSub(); if(PANEL) PANEL.sh.close(); tab=tab||'online';
  const sh=sheet(`<div class="tscreen friends"></div>`,{cls:'full'});
  const draw=()=>{
    const peers=NET.peers.filter(p=>!p.me).map(p=>({name:p.name||'Trainer',rank:p.rank||1000,cid:p.cid,busy:p.busy,avatar:sanitizeAv(p.avatar)}));
    let list=tab==='online'?peers:peers.concat([{name:S.name||'You',rank:myRank(),me:true}]);
    list=list.sort((a,b)=>b.rank-a.rank);
    sh.body.querySelector('.friends').innerHTML=`<div class="plankbar"><button class="backb" id="frb">Back</button><div class="plank">My Friends</div><button class="findb" id="frf">FIND 🔍</button></div>
      <div class="fr-tabs"><button class="fr-t ${tab==='online'?'on':''}" data-ft="online"><i class="dot"></i>ONLINE NOW</button><button class="fr-t blue ${tab==='rank'?'on':''}" data-ft="rank">★ RANKINGS</button></div>
      <div class="fr-list">${list.length?list.map((p,i)=>`<div class="fr-row ${p.me?'me':''}"><div class="fr-dot"><i></i></div><div class="fr-rk">${tab==='rank'?`<b class="fr-pos">${i+1}</b>`:''}${rankBadge(p.rank,26)}<span>${p.rank}</span></div><div class="fr-n">${esc(p.name)}${p.busy?' <small>in a battle</small>':''}</div>${p.me?'':`<button class="sparb" data-ch="${esc(p.cid||'')}" ${p.busy||NET.status!=='on'?'disabled':''}>SPAR ⚡</button>`}</div>`).join('')
        :`<p class="fr-empty">${NET.status==='on'?'No trainers are online right now. Share the game link with friends and they will show up here!':'Live features work when the game is online.'}</p>`}</div>`;
    const q=s=>sh.body.querySelector(s);
    q('#frb').onclick=sh.close; q('#frf').onclick=()=>alertBox('Friend search is coming soon!');
    sh.body.querySelectorAll('[data-ft]').forEach(b=>b.onclick=()=>{ tab=b.dataset.ft; draw(); });
    sh.body.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>{ if(!b.dataset.ch) return; NET.challenge(b.dataset.ch); });
  };
  draw();
}
SUBMENUS.social[2][1]=()=>openFriends('online');
SUBMENUS.social[3][1]=()=>openFriends('rank');

skillDesc=(function(prev){ return function(id,L){ L=L||1;
  if(id==='pounce') return `Amplifies all damage by ${Math.round(lv(SK.pounce.v,L)*100)}%.`;
  if(id==='spark') return `Gives ${Math.round(lv(SK.spark.v,L)*100)}% chance to do a critical 2x damage on any attack for 4 turns.`;
  if(id==='bolt') return `Strong lightning attack that deals ${Math.round(lv(SK.bolt.dmg,L))} damage and has a 50% chance to do 2x damage.`;
  if(id==='staticd') return `Unleash an electrical discharge at your enemy to cause ${Math.round(lv(SK.staticd.dmg,L))} direct damage and ${Math.round(lv(SK.staticd.stormTick,L))} damage each turn for 2 turns.`;
  return prev(id,L); }; })(skillDesc);
ST_ICON.crit=['star','#f7b500'];
PAS_IC.pounce='claw';

// ===== Arena: Choose Your Champions -> READY -> Live Arena matchmaking =====
function openChampions(){
  closeSub(); if(PANEL) PANEL.sh.close();
  const sh=sheet(`<div class="tscreen champs"></div>`,{cls:'full'});
  const draw=()=>{ const tm=teamMons();
    sh.body.querySelector('.champs').innerHTML=`${hubHud()}<h2 class="cc-title">Choose Your Champions</h2>
      <div class="cc-row">${[0,1,2].map(i=>{ const m=tm[i]; if(!m) return `<button class="cc-card empty" data-add="1"><span>+</span><b>Add a monster</b></button>`;
        const st=monStats(m), sp=SPI[m.sp];
        return `<div class="cc-card"><button class="cc-x" data-rm="${m.uid}">✕</button><div class="cc-h"><span class="lvb">${m.lvl}</span><b>${esc(sp.n)}</b></div>
          <div class="cc-art">${monSVG(m.sp,m.lvl)}</div><div class="cc-st"><span><i class="h">♥</i>${st.hp}</span><span><i class="m">💧</i>${st.mp}</span><span><i class="a">★</i>${st.atk}</span></div></div>`; }).join('')}</div>
      <div class="cc-bot"><div class="cc-av">${avatarSVG(myAvatar())}</div><div class="cc-rank">Rank: ${rankBadge(myRank(),34)} <b>${myRank()}</b></div><button class="cc-ready" id="ccr"><i></i>READY!</button></div>`;
    const q=s=>sh.body.querySelector(s);
    q('#bhb').onclick=()=>{ sh.close(); openBattleHub(); };
    sh.body.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{ if(S.team.length<=1) return alertBox('You need at least one champion!'); S.team=S.team.filter(u=>u!==b.dataset.rm); persist(); draw(); });
    sh.body.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{ const bench=S.mons.filter(m=>!S.team.includes(m.uid)).sort((a,b)=>b.lvl-a.lvl);
      if(!bench.length) return alertBox("You don't have any other monsters yet!");
      const p=sheet(`<h2>Add a Champion</h2><div class="cc-pick">${bench.map(m=>`<button class="cc-pk" data-pk="${m.uid}">${monSVG(m.sp,m.lvl)}<b>${esc(SPI[m.sp].n)}</b><span class="lvb">${m.lvl}</span></button>`).join('')}</div>`);
      p.body.querySelectorAll('[data-pk]').forEach(x=>x.onclick=()=>{ if(S.team.length<3) S.team.push(x.dataset.pk); persist(); p.close(); draw(); }); });
    q('#ccr').onclick=()=>{ if(!S.team.length) return alertBox('Add a champion first!'); startSearch(sh); };
    sh.body.querySelectorAll('.cc-card:not(.empty)').forEach((c,i)=>{ const m=tm[i]; if(!m) return; c.style.cursor='pointer';
      c.onclick=e=>{ if(e.target.closest('.cc-x')) return; openMon(m.uid); }; });
    setTimeout(()=>sh.body.querySelectorAll('.cc-h b').forEach(b=>{ if(b.clientWidth<20) return; let f=parseFloat(getComputedStyle(b).fontSize); while(b.scrollWidth>b.clientWidth+1&&f>11){ f-=1; b.style.fontSize=f+'px'; } }),80);
  };
  draw();
}
let SEARCH=null;
NET.updatePresence=(function(prev){ return function(){ if(!NET.room||!S) return; try{ NET.room.presence({cid:NET.cid, name:S.name||'Trainer', power:teamPower(), rank:myRank(), busy:!!B, searching:!!SEARCH, avatar:myAvatar()}); }catch(e){ prev(); } }; })(NET.updatePresence);
function stopSearch(){ if(!SEARCH) return; clearInterval(SEARCH.t); SEARCH.w&&SEARCH.w.remove(); SEARCH=null; NET.updatePresence(); }
function startSearch(champSh){
  if(NET.status!=='on'){ return confirmBox("Live Arena needs an internet connection. Battle a computer trainer instead?","BATTLE",()=>{ champSh.close(); startBattle({mode:'rival', foe:rivalTeam()}); }); }
  const w=document.createElement('div'); w.className='abox-wrap on';
  w.innerHTML=`<div class="srch"><button class="nm-x" id="sx">✕</button><h2>Live Arena!</h2><div class="sr-box"><div class="sr-spin"></div><p>Searching for opponent...</p></div><div class="sr-est">Estimated wait: 1 minute</div><div class="sr-btns"><button class="tp-b" id="sc">CANCEL</button><button class="tp-b blue" id="scpu" style="display:none">VS COMPUTER</button></div></div>`;
  document.body.appendChild(w);
  SEARCH={w,t0:Date.now(),tried:{},champSh}; NET.updatePresence();
  w.querySelector('#sx').onclick=stopSearch; w.querySelector('#sc').onclick=stopSearch;
  w.querySelector('#scpu').onclick=()=>{ stopSearch(); champSh.close(); startBattle({mode:'rival', foe:rivalTeam()}); };
  SEARCH.t=setInterval(()=>{ if(!SEARCH) return;
    if(B){ const c=SEARCH.champSh; stopSearch(); c&&c.close(); return; }
    if(Date.now()-SEARCH.t0>20000) w.querySelector('#scpu').style.display='';
    const c=NET.peers.filter(p=>!p.me&&p.searching&&!p.busy&&p.cid&&p.cid>NET.cid&&!(SEARCH.tried[p.cid]>Date.now()-8000));
    if(c.length&&!NET.pending){ c.sort((a,b)=>Math.abs((a.rank|0)-myRank())-Math.abs((b.rank|0)-myRank())); SEARCH.tried[c[0].cid]=Date.now(); NET.challenge(c[0].cid); }
  },1500);
}
NET.showIncoming=(function(prev){ return function(d){ prev(d); if(SEARCH){ const a=[...document.querySelectorAll('#acc')].pop(); if(a) setTimeout(()=>a.click(),50); } }; })(NET.showIncoming);
openBattle=(function(prev){ return function(){ if(SEARCH){ const c=SEARCH.champSh; stopSearch(); try{ c&&c.close(); }catch(_){} } return prev.apply(this,arguments); }; })(openBattle);
openPanelRaw=(function(prev){ return function(name){ if(name==='battle') return openChampions(); return prev(name); }; })(openPanelRaw);

// ---- passive/item tooltips: bigger touch target, smart placement, never left behind ----
function hideTips(){ document.querySelectorAll('.tipb').forEach(x=>x.remove()); }
bindTip=function(h){
  if(h._tip) return; h._tip=1;
  const show=e=>{ e.preventDefault(); hideTips(); const t=h.dataset.tip; if(!t) return;
    const [title,body]=t.split('|'); const tip=document.createElement('div'); tip.className='tipb';
    tip.innerHTML=`<b>${title}</b>${body?`<span>${body}</span>`:''}`; document.body.appendChild(tip);
    const r=localRect(h), BR=document.body.getBoundingClientRect(); const W=isRot()?BR.height:innerWidth, H=isRot()?BR.width:innerHeight;
    const right=!!h.closest('.bhp.r'); const w=tip.offsetWidth, th=tip.offsetHeight;
    let left=right? r.left+r.width-w : r.left; left=Math.max(8,Math.min(W-w-8,left));
    let top=r.top+r.height+8; if(top+th>H-8) top=Math.max(8,r.top-th-8);
    tip.style.left=left+'px'; tip.style.top=top+'px'; };
  h.addEventListener('pointerdown',show);
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>h.addEventListener(ev,hideTips));
  h.addEventListener('contextmenu',e=>e.preventDefault());
};
addEventListener('pointerup',hideTips,true); addEventListener('touchend',hideTips,true);
closeBattle=(function(prev){ return function(){ hideTips(); return prev.apply(this,arguments); }; })(closeBattle);
finishBattle=(function(prev){ return function(){ hideTips(); return prev.apply(this,arguments); }; })(finishBattle);

// ---- stat points lock in once the profile is closed; Reset Monster costs mushrooms ----
const RESET_COST=15;
openMon=(function(prev){ return function(uid){ const r=prev(uid); const m=monBy(uid); if(MONSH&&m){ ensureMon(m); MONSH.base=Object.assign({atk:0,hp:0,mp:0},m.pts); drawMon(); } return r; }; })(openMon);
drawMon=(function(prev){ return function(){ prev(); if(!MONSH) return; const m=monBy(MONSH.uid); if(!m) return; const base=MONSH.base||m.pts, b=MONSH.sh.body;
  b.querySelectorAll('[data-pm]').forEach(x=>{ const k=x.dataset.pm; const can=m.pts[k]>(base[k]|0); x.disabled=!can;
    x.onclick=()=>{ if(!(m.pts[k]>(base[k]|0))) return; m.pts[k]--; m.free++; persist(); drawMon(); if(TASKSH) drawTasks(); }; });
  const rb=b.querySelector('#rsm'); if(rb&&!rb.dataset.c){ rb.dataset.c=1; rb.innerHTML=`RESET MONSTER <span class="rsm-c">${mushroomSVG('#b04fd6')} ${RESET_COST}</span>`;
    rb.onclick=()=>{ const sp=SPI[m.sp]; if((S.mush|0)<RESET_COST) return alertBox(`Resetting costs ${RESET_COST} mushrooms. You have ${S.mush|0}.`);
      confirmBox(`Reset ${esc(sp.n)} for ${RESET_COST} mushrooms? All stat points come back to spend again, and every ability goes back to level 1.`,'RESET',()=>{
        S.mush-=RESET_COST; const p=m.pts||{atk:0,hp:0,mp:0}; m.free=(m.free|0)+(p.atk|0)+(p.hp|0)+(p.mp|0); m.pts={atk:0,hp:0,mp:0}; MONSH.base={atk:0,hp:0,mp:0};
        Object.keys(m.skl||{}).forEach(k=>m.skl[k]=1); persist(); drawMon(); renderHUD(); toast(`${sp.n} was reset`); }); }; } }; })(drawMon);

// ---- abilities you can't afford: still tappable for info, but won't swipe up ----
bindAbility=function(btn,a){
  const id=btn.dataset.sk; const poor=btn.disabled; btn.disabled=false; if(poor) btn.classList.add('poor');
  let p0=null, moved=false; const dyOf=e=> isRot() ? -(e.clientX-p0.x) : (e.clientY-p0.y);
  btn.addEventListener('pointerdown',e=>{ p0={x:e.clientX,y:e.clientY}; moved=false; btn.classList.add('press'); try{btn.setPointerCapture(e.pointerId);}catch(_){} });
  btn.addEventListener('pointermove',e=>{ if(!p0) return; const dy=dyOf(e); if(dy<-6){ moved=true; if(!poor) btn.style.transform=`translateY(${Math.max(-90,dy)}px)`; } });
  btn.addEventListener('pointerup',e=>{ if(!p0) return; const dy=dyOf(e); p0=null; btn.classList.remove('press'); btn.style.transform='';
    if(dy<-45 && !poor){ hideInfo(); humanAct(id, castTarget(a,id)); } else if(dy<-45 && poor){ toast('Not enough mana'); } else if(!moved) showInfo(id,a); });
  btn.addEventListener('pointercancel',()=>{ p0=null; btn.style.transform=''; btn.classList.remove('press'); });
};

// ---- tooltips v2: short text, beside the icon (clear of the thumb), drag across icons to scan ----
function tipText(h){ const t=h.dataset.tip||''; let [title,body]=t.split('|'); title=(title||'').replace(/\s*\(.*?\)\s*$/,'');
  body=(body||'').replace(/^always on:\s*/i,'').replace(/^passively\s+/i,''); if(body) body=body.charAt(0).toUpperCase()+body.slice(1); return [title,body]; }
let TIPH=null;
function placeTip(h){
  if(TIPH===h&&document.querySelector('.tipb')) return; TIPH=h; hideTips(); if(!h||!h.dataset.tip) return;
  const [title,body]=tipText(h); const tip=document.createElement('div'); tip.className='tipb big';
  tip.innerHTML=`<b>${title}</b>${body?`<span>${body}</span>`:''}${h.querySelector('.ic')?h.querySelector('.ic').outerHTML:''}`; document.body.appendChild(tip);
  const r=localRect(h), BR=document.body.getBoundingClientRect(); const W=isRot()?BR.height:innerWidth, H=isRot()?BR.width:innerHeight;
  const right=!!h.closest('.bhp.r'); const w=tip.offsetWidth, th=tip.offsetHeight;
  let left=right? r.left+r.width-w : r.left; left=Math.max(6,Math.min(W-w-6,left));
  let top=r.top-th-10; if(top<4) top=4;
  tip.style.left=left+'px'; tip.style.top=top+'px';
}
bindTip=function(h){ if(h._tip2) return; h._tip2=1; h._tip=1;
  h.addEventListener('pointerdown',e=>{ e.preventDefault(); TIPH=null; placeTip(h); TIPDRAG=true; try{ h.releasePointerCapture(e.pointerId); }catch(_){} });
  h.addEventListener('contextmenu',e=>e.preventDefault()); };
let TIPDRAG=false;
addEventListener('pointermove',e=>{ if(!TIPDRAG) return; const el=document.elementFromPoint(e.clientX,e.clientY); const h=el&&el.closest&&el.closest('.hi'); if(h) placeTip(h); },true);
addEventListener('touchmove',e=>{ if(!TIPDRAG) return; const t=e.touches[0]; const el=document.elementFromPoint(t.clientX,t.clientY); const h=el&&el.closest&&el.closest('.hi'); if(h) placeTip(h); e.preventDefault(); },{capture:true,passive:false});
const endTip=()=>{ if(TIPDRAG){ TIPDRAG=false; TIPH=null; hideTips(); } };
addEventListener('pointerup',endTip,true); addEventListener('touchend',endTip,true); addEventListener('pointercancel',endTip,true); addEventListener('touchcancel',endTip,true);

// ---- no iOS magnifier/loupe anywhere: swallow every quick second tap and long-press selection ----
(function(){ let last=0;
  addEventListener('touchend',e=>{ const now=Date.now(); const t=e.target; const field=t&&/INPUT|TEXTAREA/.test(t.tagName); if(t&&t.closest&&t.closest('[data-pp],[data-pm]')){ last=0; return; }
    if(!field && now-last<400){ const already=e.defaultPrevented; e.preventDefault(); if(already){ last=now; return; } const b=t.closest&&t.closest('button,[data-pp],[data-pm],a'); if(b&&!b._dt){ b.click(); } }
    last=now; },{capture:true,passive:false});
  addEventListener('touchstart',e=>{ if(e.touches.length>1) e.preventDefault(); },{capture:true,passive:false});
  ['gesturestart','gesturechange','dblclick','contextmenu'].forEach(ev=>addEventListener(ev,e=>{ if(!/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||'')) e.preventDefault(); },{capture:true,passive:false}));
})();

// ---- zone activities: tap your monster (top right) to open My Monsters ----
drawTasks=(function(prev){ return function(){ prev(); if(!TASKSH) return; const t=TASKSH.sh.body.querySelector('.thmon'); if(t){ t.style.cursor='pointer'; t.onclick=()=>openTeam(); } }; })(drawTasks);
// hide +/- unless there's something to allocate or undo (space stays reserved so nothing shifts)
drawMon=(function(prev){ return function(){ prev(); if(!MONSH) return; const m=monBy(MONSH.uid); if(!m) return; const base=MONSH.base||m.pts;
  const any=(m.free|0)>0 || ['atk','hp','mp'].some(k=>m.pts[k]>(base[k]|0));
  MONSH.sh.body.querySelectorAll('.pbtns').forEach(x=>x.style.visibility=any?'':'hidden'); }; })(drawMon);
// keep every energy timer ticking (hub, shop, zones, champions)
setInterval(()=>{ if(!S) return; tickEnergy(); const pct=S.energy/S.maxEnergy*100, txt=`${S.energy<S.maxEnergy?`+1 in ${nextEnergyIn()} · `:''}${S.energy} / ${S.maxEnergy}`;
  document.querySelectorAll('.thud .ebar').forEach(e=>{ const i=e.querySelector('i'), b=e.querySelector('b'); if(i) i.style.width=pct+'%'; }); },1000);
// monster name shows when it enters the field, then fades (survives re-renders)
renderBattle=(function(prev){ return function(){ prev(); if(!B||!B.b) return; B.fnT=B.fnT||{}; const now=Date.now();
  document.querySelectorAll('#battle .fighter').forEach(el=>{ const s=el.dataset.s, i=el.dataset.i, f=el.querySelector('.fname'); if(!f) return;
    const k=s; if(!B.fnT[k]||B.fnT[k].i!==i){ B.fnT[k]={i,t:now}; }
    const el2=(now-B.fnT[k].t)/1000; if(el2<2.8){ f.classList.add('fnon'); f.style.animationDelay=(-el2)+'s'; } }); }; })(renderBattle);
// tap anywhere outside the move card (or another move) to dismiss it
addEventListener('pointerdown',e=>{ const el=document.getElementById('abinfo'); if(!el||!el.classList.contains('show')) return;
  if(e.target.closest&&e.target.closest('#abinfo,.ab')) return; hideInfo(); },true);
