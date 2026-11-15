// ===== V12: loading screen flow =====
function TT_ELE(){ return `<svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg"><g stroke="#163457" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<circle cx="52" cy="88" r="46" fill="#79aee6"/><circle cx="168" cy="88" r="46" fill="#79aee6"/>
<circle cx="58" cy="92" r="28" fill="#a8cdf4" stroke="none"/><circle cx="162" cy="92" r="28" fill="#a8cdf4" stroke="none"/>
<path d="M110 120 q2 34 -6 50 q-6 12 8 16" fill="none" stroke-width="27"/>
<path d="M110 120 q2 34 -6 50 q-6 12 8 16" fill="none" stroke="#8cc0f5" stroke-width="17"/>
<ellipse cx="110" cy="92" rx="50" ry="48" fill="#8cc0f5"/>
<path d="M90 126 q-2 12 -12 14 M130 126 q2 12 12 14" fill="none" stroke-width="13"/><path d="M90 126 q-2 12 -12 14 M130 126 q2 12 12 14" fill="none" stroke="#fff" stroke-width="7"/>
</g>
<path d="M104 132 q6 4 12 0 l-1 8 q-5 3 -10 0 z" fill="#8cc0f5"/>
<circle cx="93" cy="90" r="5.5" fill="#163457"/><circle cx="127" cy="90" r="5.5" fill="#163457"/>
<circle cx="95" cy="88" r="1.8" fill="#fff"/><circle cx="129" cy="88" r="1.8" fill="#fff"/></svg>`; }
function splash(){
  return new Promise(res=>{
    const el=$('#splash');
    el.classList.add('studio');
    el.innerHTML=`<div class="tt-wrap"><div class="tt-ele">${TT_ELE()}</div><div class="tt-name"><b>Tiny Tusk</b><span>STUDIOS</span></div></div>`;
    setTimeout(()=>{ el.classList.add('tt-out'); setTimeout(()=>{ el.classList.remove('studio','tt-out'); loading(); },420); },2300);
    const loading=()=>{
    const sparks=Array.from({length:26},()=>{ const s=(.5+Math.random()*1.3).toFixed(2); return `<i class="spark glow" style="left:${Math.random()*100}%;--dx:${(Math.random()*80-40).toFixed(0)}px;--s:${s};animation-duration:${(5+Math.random()*6).toFixed(1)}s;animation-delay:-${(Math.random()*10).toFixed(1)}s"></i>`; }).join('');
    el.innerHTML=`${sparks}<div class="sp-plate"><div class="sp-mon l">${monSVG('pyrodrake',22)}</div><div class="sp-mon r">${monSVG('thundra',22)}</div><div class="sp-title"><span>Monster</span><span>Realm</span></div></div>
      <div class="ld-box"><div class="ld-t" id="sptxt">Checking Content...</div><div class="ld-bar"><i></i></div></div><div class="ld-studio">Tiny Tusk Studios</div><div class="ld-ver">v1.0.0</div>`;
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
function curZone(){ if(S.lastZone!=null&&zoneUnlocked(S.lastZone)) return S.lastZone; let z=0; ZONES.forEach((_,i)=>{ if(zoneUnlocked(i)) z=i; }); return z; }
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
            <div class="zs-foot">${zi===0?'<div class="zs-ft">Learn the basics with Lila</div>':`<div class="zs-ft">Monsters Found</div><div class="zs-found">${fam.map(s=>`<div class="zs-f ${owned.has(s.id)||found.has(s.id)?'':'sil'}">${monSVG(s.id,1)}</div>`).join('')}</div>`}</div></button>
          <div class="zs-card zs-team">${tm.map(m=>{ const sp=SPI[m.sp]; const pct=m.lvl>=MAXLVL?100:(m.xp|0)/xpNeed(m.lvl)*100;
            return `<button class="zs-m ${m.uid===S.zoneMon?'sel':''}" data-zm="${m.uid}"><div class="zs-mart">${monSVG(m.sp,m.lvl)}</div><div class="zs-minfo"><b>${esc(sp.n)}</b><div class="xpbar"><span class="lvb">${m.lvl}</span><div><i style="width:${pct}%"></i><em>${m.lvl>=MAXLVL?'MAX':`${m.xp|0} / ${xpNeed(m.lvl)}`}</em></div></div></div></button>`; }).join('')}</div>
        </div>
        <button class="letsgo" id="lg">LET'S GO! <i>▶</i></button>
      </div>`;
    const q=s=>sh.body.querySelector(s);
    q('#zb').onclick=sh.close;
    q('#zpick').onclick=()=>pickZone(i=>{ zi=i; ZMUS='z_'+ZONES[zi].id; playMusic(ZMUS); persist(); draw(); });
    sh.body.querySelectorAll('[data-zm]').forEach(b=>b.onclick=()=>{ S.zoneMon=b.dataset.zm; persist(); draw(); });
    q('#lg').onclick=()=>{ if(!S.zoneMon) return toast('You need a monster first'); persist(); sh.close(); openTasks(zi); };
  };
  draw();
  if(S.tut===1){ S.tut=2; persist(); setTimeout(async()=>{ await lilaSay(["Zones are where you train to earn dollars and XP for your monster. Let's start at Training Camp!"]); pointAt('#lg'); },350); }
};
function pickZone(cb){
  const sh=sheet(`<div class="zpl"><h2>Choose a Zone</h2>${ZONES.map((z,i)=>{ const open=zoneUnlocked(i), pct=zonePct(i), rep=SP.filter(s=>s.fam===z.fam)[0];
    return `<button class="zone ${open?'':'locked'}" data-pz="${i}" style="--zc:${z.c}"><div class="zone-art">${monSVG(rep.id,pct>=100?20:1)}</div>
      <div class="zone-info"><b><span class="lvb sm">${z.lv}</span> ${z.n}</b><div class="zbar"><i style="width:${pct}%"></i><em>${pct}% complete</em></div></div><div class="zone-go">${open?'›':'🔒'}</div></button>`; }).join('')}</div>`,{cls:'panel'});
  sh.body.querySelectorAll('[data-pz]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.pz; if(!zoneUnlocked(i)) return toast(`Finish ${ZONES[i-1].n} first`); sh.close(); cb(i); });
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
        <div class="zd-foot">${i===0?'<div class="zs-ft">Learn the basics with Lila</div>':!open?`<div class="zs-ft">Complete ${ZONES[i-1].n} to unlock!</div>`:`<div class="zs-ft">Monsters Found</div><div class="zs-found">${SP.filter(s=>s.fam===z.fam).map(s=>`<div class="zs-f ${owned.has(s.id)||found.has(s.id)?'':'sil'}">${monSVG(s.id,1)}</div>`).join('')}</div>`}</div></button>`; }).join('')}</div></div></div>`,{cls:'full'});
  sh.body.querySelector('#zdb').onclick=sh.close;
  sh.body.querySelectorAll('[data-pz]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.pz; if(!zoneUnlocked(i)) return toast(`Finish ${ZONES[i-1].n} first`); sh.close(); cb(i); });
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
      <button class="s2card" id="hatchc"><div class="egg plain"></div><b>Monster Egg</b><span>A random monster, a few levels lower</span><em class="g">$${eggCost()}</em></button></div>`;
  } else if(SHOPTAB==='energy'){
    body=`<div class="s2cards"><button class="s2card" id="refill"><div class="egg bolt">⚡</div><b>Energy Refill</b><span>Fill your energy to max</span><em>15 🍄</em></button></div>`;
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
  const rf=q('#refill'); if(rf) rf.onclick=()=>{ tickEnergy(); if(S.energy>=S.maxEnergy) return toast('Energy is already full'); if(S.mush<15) return toast('You need 15 🍄'); S.mush-=15; S.energy=S.maxEnergy; S.energyAt=Date.now(); persist(); drawShop(); toast('Energy refilled!'); };
  const cur=q('.s2item.sel'), row=q('.s2row'); if(cur&&row&&!row._init){ row._init=1; row.scrollLeft=cur.offsetLeft-(row.clientWidth-cur.offsetWidth)/2; }
}

// ---- zone complete screen ----
function zoneCompleteScreen(zi){
  return new Promise(res=>{
    const z=ZONES[zi];
    const sh=sheet(`<div class="tscreen zdone"><div class="tfield">${sceneBG()}<div class="zd-dim"></div>
      <h2 class="zd-title">You completed ${esc(z.n)}!</h2>
      <div class="zd-lila">${lilaSVG()}</div>
      <div class="zd-side"><p>${zi===0?'When you complete other zones you find new monsters!':'You found a new monster in this zone!'}</p><button class="zd-done" id="zdd">DONE</button></div></div></div>`,{cls:'full',locked:true,onClose:res});
    sh.body.querySelector('#zdd').onclick=sh.close;
  });
}
