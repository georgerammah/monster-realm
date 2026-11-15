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
