// ===== V12: loading screen flow =====
function splash(){
  return new Promise(res=>{
    const el=$('#splash');
    const sparks=Array.from({length:26},()=>{ const s=(.5+Math.random()*1.3).toFixed(2); return `<i class="spark glow" style="left:${Math.random()*100}%;--dx:${(Math.random()*80-40).toFixed(0)}px;--s:${s};animation-duration:${(5+Math.random()*6).toFixed(1)}s;animation-delay:-${(Math.random()*10).toFixed(1)}s"></i>`; }).join('');
    el.innerHTML=`${sparks}<div class="sp-plate"><div class="sp-mon l">${monSVG('pyrodrake',22)}</div><div class="sp-mon r">${monSVG('thundra',22)}</div><div class="sp-title"><span>Monster</span><span>Realm</span></div></div>
      <div class="ld-box"><div class="ld-t" id="sptxt">Checking Content...</div><div class="ld-bar"><i></i></div></div><div class="ld-ver">v1.0.0</div>`;
    const bar=el.querySelector('.ld-bar i'), txt=el.querySelector('#sptxt');
    let done=false; const finish=()=>{ if(done) return; done=true; el.classList.add('out'); setTimeout(()=>{ el.remove(); res(); },500); };
    setTimeout(()=>{
      txt.textContent='Starting Game...'; let p=0;
      const t=setInterval(()=>{ p=Math.min(100,p+6+Math.random()*10); bar.style.width=p+'%';
        if(p>=100){ clearInterval(t); setTimeout(finish,350); } },120);
    },1000);
  });
}

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
    if(performance.now()-0>0){ const step=()=>{ if(Math.abs(v)<.4) return; if(ax==='y') el.scrollTop+=v; else el.scrollLeft+=v; v*=.95; raf=requestAnimationFrame(step); }; raf=requestAnimationFrame(step); }
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
