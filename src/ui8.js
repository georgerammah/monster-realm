// ===== V8: original music + sound effects (Web Audio synthesis) =====
const SND={ctx:null, master:null, mus:null, sfx:null, track:null, timer:null, step:0, next:0,
  get musicOn(){ return !(S&&S.settings&&S.settings.music===false); }, get sfxOn(){ return !(S&&S.settings&&S.settings.sfx===false); }};
function audioInit(){
  if(SND.ctx){ if(SND.ctx.state==='suspended') SND.ctx.resume(); return; }
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  const c=new AC(); SND.ctx=c;
  SND.master=c.createGain(); SND.master.gain.value=.8; SND.master.connect(c.destination);
  SND.mus=c.createGain(); SND.mus.gain.value=SND.musicOn?.16:0; SND.mus.connect(SND.master);
  SND.sfx=c.createGain(); SND.sfx.gain.value=SND.sfxOn?.5:0; SND.sfx.connect(SND.master);
  const len=c.sampleRate*.5, buf=c.createBuffer(1,len,c.sampleRate), d=buf.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1; SND.noise=buf;
  playMusic(B?'battle':'home');
}
['pointerdown','touchend','keydown'].forEach(ev=>addEventListener(ev,audioInit,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{ if(!SND.ctx) return; if(document.hidden) SND.ctx.suspend(); else SND.ctx.resume(); });
const mtof=n=>440*Math.pow(2,(n-69)/12);
function tone(f,t,dur,type,vol,dest,slide){
  const c=SND.ctx; const o=c.createOscillator(), g=c.createGain();
  o.type=type||'square'; o.frequency.setValueAtTime(f,t); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),t+dur);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.008); g.gain.exponentialRampToValueAtTime(.0008,t+dur);
  o.connect(g); g.connect(dest||SND.sfx); o.start(t); o.stop(t+dur+.02);
}
function noise(t,dur,vol,freq,dest,q){
  const c=SND.ctx; const s=c.createBufferSource(); s.buffer=SND.noise; const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=freq||2000; f.Q.value=q||.8;
  const g=c.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0008,t+dur);
  s.connect(f); f.connect(g); g.connect(dest||SND.sfx); s.start(t); s.stop(t+dur+.02);
}
// ---- music: two original loops ----
const _=null;
const TRACKS={
  home:{bpm:108, lead:[72,_,76,79, 77,_,76,74, 72,_,74,76, 74,_,_,_, 69,_,72,76, 74,_,72,71, 72,_,67,_, _,_,_,_,
                       72,_,76,79, 81,_,79,77, 76,_,77,79, 76,_,74,_, 72,_,74,76, 77,_,76,74, 72,_,_,_, _,_,_,_],
        bass:[48,_,55,_, 53,_,55,_, 45,_,52,_, 50,_,55,_, 53,_,57,_, 55,_,50,_, 48,_,55,_, 48,_,_,_],
        type:'triangle', hat:false},
  battle:{bpm:150, lead:[69,_,72,69, 76,_,74,72, 71,_,72,74, 72,_,_,_, 69,_,72,69, 77,_,76,74, 72,_,71,_, 69,_,_,_,
                         74,_,77,74, 81,_,79,77, 76,_,77,79, 76,_,72,_, 74,_,72,71, 72,_,74,76, 69,_,_,_, _,_,_,_],
        bass:[45,45,57,45, 45,57,45,57, 43,43,55,43, 43,55,43,55, 41,41,53,41, 41,53,41,53, 40,40,52,40, 44,44,56,44],
        type:'square', hat:true}
};
function playMusic(name){
  if(!SND.ctx){ SND.want=name; return; }
  if(SND.track===name) return;
  SND.track=name; SND.step=0; SND.next=SND.ctx.currentTime+.08;
  clearInterval(SND.timer); SND.timer=setInterval(schedule,40);
}
function schedule(){
  const c=SND.ctx; const T=TRACKS[SND.track]; if(!T) return;
  const st=60/T.bpm/2;
  while(SND.next<c.currentTime+.25){
    const i=SND.step, t=SND.next;
    const ln=T.lead[i%T.lead.length]; if(ln!=null) tone(mtof(ln),t,st*1.7,T.type,.5,SND.mus);
    const bn=T.bass[i%T.bass.length]; if(bn!=null) tone(mtof(bn),t,st*.9,'triangle',.55,SND.mus);
    if(T.hat){ noise(t,.03,i%2?.18:.28,8000,SND.mus,1); if(i%4===0) tone(110,t,.12,'sine',.8,SND.mus,40); if(i%8===4) noise(t,.09,.4,1800,SND.mus,.7); }
    else if(i%4===0) noise(t,.02,.08,9000,SND.mus,1);
    SND.step++; SND.next+=st;
  }
}
// ---- sound effects ----
function sfx(kind,delay,opt){
  if(!SND.ctx||!SND.sfxOn) return; const t=SND.ctx.currentTime+(delay||0)/1000; opt=opt||{};
  switch(kind){
    case 'tap': tone(880,t,.05,'triangle',.25); break;
    case 'coin': tone(988,t,.07,'square',.25); tone(1319,t+.07,.18,'square',.25); break;
    case 'hit': noise(t,.14,.7,opt.crit?900:1400,null,.6); tone(opt.crit?140:200,t,.16,'square',.35,null,60); if(opt.crit) noise(t+.05,.2,.5,500); break;
    case 'zap': tone(1200,t,.18,'sawtooth',.25,null,300); noise(t,.12,.3,5000); break;
    case 'fire': noise(t,.3,.45,700,null,.5); tone(300,t,.25,'sawtooth',.18,null,120); break;
    case 'water': tone(500,t,.12,'sine',.4,null,900); tone(700,t+.08,.12,'sine',.35,null,1200); break;
    case 'whoosh': noise(t,.22,.35,1200,null,.4); break;
    case 'heal': [72,76,79,84].forEach((n,k)=>tone(mtof(n),t+k*.06,.22,'triangle',.3)); break;
    case 'buff': [67,71,74].forEach((n,k)=>tone(mtof(n+12),t+k*.05,.18,'sine',.3)); noise(t,.3,.12,6000); break;
    case 'miss': noise(t,.18,.25,3000,null,.4); break;
    case 'stun': [0,1,2].forEach(k=>tone(1400-k*200,t+k*.07,.08,'square',.2)); break;
    case 'faint': tone(400,t,.6,'triangle',.4,null,80); break;
    case 'go': tone(mtof(67),t,.1,'square',.3); tone(mtof(72),t+.1,.25,'square',.3); break;
    case 'vs': noise(t,.5,.4,600,null,.5); tone(mtof(43),t,.6,'sawtooth',.3); tone(mtof(55),t+.12,.5,'square',.25); break;
    case 'win': [72,76,79,84,79,84].forEach((n,k)=>tone(mtof(n),t+k*.12,k===5?.6:.14,'square',.3)); break;
    case 'lose': [67,64,60,55].forEach((n,k)=>tone(mtof(n),t+k*.18,.3,'triangle',.35)); break;
    case 'level': [60,64,67,72,76,79,84].forEach((n,k)=>tone(mtof(n),t+k*.07,.2,'square',.25)); break;
  }
}
// ---- hooks ----
document.addEventListener('click',e=>{ if(e.target.closest('button')) sfx('tap'); },true);
const _openB8=openBattle; openBattle=function(){ _openB8(); playMusic('battle'); };
const _closeB8=closeBattle; closeBattle=function(){ _closeB8(); playMusic('home'); };
const _anim8=animateBattle;
animateBattle=function(root,b,animating){
  if(animating){
    const evs=b.ev||[]; const actE=evs.find(e=>e.k==='act'); const sk=actE&&SK[actE.sk];
    const ranged=sk&&sk.pow!=null&&sk.el!=='neutral'; let T=0;
    if(actE&&sk){ if(sk.k==='hit'||sk.k==='dot'){ sfx('whoosh'); T=ranged?520:260; } else T=120; }
    let hitN=0;
    evs.forEach(e=>{
      if(e.k==='hit'){ const el=e.el; const d=T+hitN*110; hitN++;
        if(el==='bolt') sfx('zap',d-60); else if(el==='fire') sfx('fire',d-80); else if(el==='water') sfx('water',d-80);
        sfx('hit',d,{crit:e.crit}); }
      else if(e.k==='heal' && !e.end) sfx('heal',T+60);
      else if(e.k==='buff') sfx('buff',T+60);
      else if(e.k==='miss') sfx('miss',T+60);
      else if(e.k==='stun') sfx('stun',T+600);
      else if(e.k==='dot') sfx('hit',T+600);
    });
    b.sides.forEach((sd,s)=>sd.mons.forEach((m,i)=>{ const p=B&&B.prev&&B.prev[s+'-'+i]; if(p&&p.hp>0&&m.hp<=0) sfx('faint',T+500); }));
  }
  return _anim8(root,b,animating);
};
const _showGo8=showGo; showGo=function(m,done){ sfx('go'); return _showGo8(m,done); };
const _intro8=showIntro; showIntro=function(done){ sfx('vs',1500); return _intro8(done); };
const _rew8=rewardPopup; rewardPopup=function(o){ sfx(o.lose?'lose':o.title==='SUCCESS!'?'coin':'win'); if(o.title==='SUCCESS!') playMusic('home'); return _rew8(o); };
const _lvl8=showLevelUps; showLevelUps=function(){ if(LVQ.length) sfx('level'); return _lvl8(); };
// ---- settings in Menu ----
function setSnd(k,on){ S.settings=Object.assign({},S.settings,{[k]:on}); persist(); if(SND.ctx){ if(k==='music') SND.mus.gain.value=on?.16:0; else SND.sfx.gain.value=on?.5:0; } }
const _menu8=PANELS.menu;
PANELS.menu=function(){ return _menu8()+`<div class="sndrow"><button class="sndb ${SND.musicOn?'on':''}" data-snd="music">♫ Music ${SND.musicOn?'On':'Off'}</button><button class="sndb ${SND.sfxOn?'on':''}" data-snd="sfx">🔊 Sound ${SND.sfxOn?'On':'Off'}</button></div>`; };
const _bind8=bindView;
bindView=function(v){ _bind8(v); v=v||document; v.querySelectorAll('[data-snd]').forEach(b=>b.onclick=()=>{ const k=b.dataset.snd; setSnd(k, !(k==='music'?SND.musicOn:SND.sfxOn)); render(); }); };
