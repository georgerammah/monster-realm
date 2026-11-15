// ===== V10: continuous clouds + tap a monster in battle for its info =====
const _scene10=sceneHTML;
sceneHTML=function(){
  const now=performance.now()/1000;
  return _scene10().replace(/class="cloud (c\d)"/g,(m,c)=>{ const dur={c1:70,c2:90,c3:110}[c], off={c1:20,c2:60,c3:5}[c]; return `${m} style="animation-delay:-${((now+off)%dur).toFixed(2)}s"`; });
};
function monInfo(b,s,i){
  const m=b.sides[s].mons[i]; if(!m) return;
  const sp=SPI[m.sp], mine=s===B.mySide;
  const eff=Object.keys(ST_ICON).filter(k=>m.st[k]>0);
  const all=(sp.sk||[]).slice(0,slotsOf(m.lvl));
  const fx=m.fx||{}; const items=[]; if(fx.dflat) items.push(`+${fx.dflat} damage dealt, +${fx.tflat} taken`); if(fx.rhp) items.push(`+${fx.rhp} life each turn`); if(fx.rmp) items.push(`+${fx.rmp} mana each turn`);
  sheet(`<div class="minfo"><div class="mi-top"><div class="mi-art">${monSVG(m.sp,m.lvl)}</div>
      <div class="mi-id"><div class="mi-nm"><span class="lvb">${m.lvl}</span><b>${m.n}</b></div><span class="muted small">${FAM[sp.fam].n} · ${esc(b.sides[s].name)}${mine?' (you)':''}</span>
        <div class="lb life"><i style="width:${m.hp/m.maxhp*100}%"></i><b>${m.hp} / ${m.maxhp} life</b></div>
        <div class="lb mana"><i style="width:${m.mp/m.maxmp*100}%"></i><b>${m.mp} / ${m.maxmp} mana</b></div>
        <div class="mi-atk">Attack <b>${m.atk}</b></div></div></div>
    ${eff.length?`<div class="mi-eff">${eff.map(k=>`<span>${icon(ST_ICON[k][0],ST_ICON[k][1],20)} ${BUFF_N[k]||k} · ${m.st[k]} turn${m.st[k]>1?'s':''}</span>`).join('')}</div>`:''}
    <div class="pabil">${all.map(id=>{ const k=SK[id], L=(m.skl&&m.skl[id])||1, c=skCost(id,L); return `<div class="pab ${k.k==='passive'?'pas':''}">${icon(skIconKey(id),EL[k.el].c,36)}<div class="pab-t"><b>${k.n} <span class="sl">Lv ${L}</span>${k.k==='passive'?' <span class="pastag">Passive</span>':''}</b><span>${skillDesc(id,L)}${c?` · ${c} mana`:''}</span></div></div>`; }).join('')}</div>
    ${items.length?`<p class="muted small">Items: ${items.join(' · ')}</p>`:''}</div>`);
}
const _rb10=renderBattle;
renderBattle=function(){
  _rb10();
  if(!B||!B.b) return; const b=B.b;
  document.querySelectorAll('#battle .fighter').forEach(el=>{
    el.onclick=e=>{ e.stopPropagation(); const s=+el.dataset.s, i=+el.dataset.i;
      if(el.classList.contains('tap')){ B.tgt[s]=i; document.querySelectorAll(`#battle .fighter[data-s="${s}"]`).forEach(x=>x.classList.toggle('tsel',x===el)); }
      monInfo(b,s,i); };
    el.style.cursor='pointer';
  });
};
