// ===== ART4: redraws modeled on the Monster Kingdom look (original drawings, same creatures/colors/features) =====
const ART4={};
const A4OL='#2a1d16';
const a4s=(w)=>`stroke="${A4OL}" stroke-width="${w||1.8}" stroke-linejoin="round" stroke-linecap="round"`;
function a4g(id,c,top,bot){ return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c,top==null?18:top)}"/><stop offset=".6" stop-color="${c}"/><stop offset="1" stop-color="${shade(c,bot==null?-22:bot)}"/></linearGradient>`; }
function a4eye(x,y,r,iris,st,look){ look=look||0; const pr=r*(st===0?.62:.55);
  return `<ellipse cx="${x}" cy="${y}" rx="${r*.82}" ry="${r}" fill="#fffdf6" ${a4s(1.4)}/><circle cx="${x+look+r*.12}" cy="${y+r*.08}" r="${pr}" fill="${iris}"/><circle cx="${x+look+r*.16}" cy="${y+r*.1}" r="${pr*.55}" fill="#120c08"/><circle cx="${x+look+r*.32}" cy="${y-r*.18}" r="${pr*.3}" fill="#fff"/>`; }
function a4brow(x,y,r,dir){ return `<path d="M${x-r} ${y-r*1.05+(dir>0?-1:1)} L${x+r} ${y-r*1.05+(dir>0?1.6:-1.6)}" stroke="${A4OL}" stroke-width="2" stroke-linecap="round"/>`; }
function a4leg(x,top,bot,w,fill,paw){ paw=paw==null?w*.62:paw;
  return `<path d="M${x-w/2} ${top} Q${x-w/2-.5} ${(top+bot)/2} ${x-w/2+.4} ${bot-2} L${x+w/2+.6} ${bot-2} Q${x+w/2+.4} ${(top+bot)/2} ${x+w/2} ${top}Z" fill="${fill}" ${a4s(1.6)}/><ellipse cx="${x+1}" cy="${bot-1.6}" rx="${w/2+paw*.6}" ry="2.6" fill="${fill}" ${a4s(1.5)}/>`; }
function a4hind(x,top,w,fill){ // rounded haunch + bent hind leg ending in a paw at x
  return `<path d="M${x-w*.2} ${top} Q${x+w*1.1} ${top+4} ${x+w*.55} ${top+12} Q${x+w*.1} ${top+16} ${x+w*.7} 90.4 L${x-w*.75} 90.4 Q${x-w*.9} ${top+14} ${x-w*1.05} ${top+7} Q${x-w*1.2} ${top} ${x-w*.2} ${top}Z" fill="${fill}" ${a4s(1.6)}/><ellipse cx="${x}" cy="90.4" rx="${w*.85}" ry="2.6" fill="${fill}" ${a4s(1.5)}/>`; }
function a4shadow(cx,rx){ return `<ellipse cx="${cx}" cy="92.5" rx="${rx}" ry="3" fill="#000" opacity=".16"/>`; }
const A4_SC=[0.74,0.88,1];
monSVG=(function(prev){ return function(spId,lvl,cls){ const sp=SPI[spId]; const f=sp&&ART4[sp.fam]; if(!f) return prev(spId,lvl,cls);
  const st=stageOf(lvl||1), id='a4'+(GID++); let body; try{ body=f(sp,st,id); }catch(e){ console.warn('art4',sp.id,e); return prev(spId,lvl,cls); }
  return `<svg class="${cls||''}" viewBox="-4 0 108 100"><g transform="translate(50 92) scale(${A4_SC[st]}) translate(-50 -92)">${body}</g></svg>`; }; })(monSVG);

// ---------- Volt family: kitten -> sleek cat with a gem collar -> winged sphinx in a striped headdress ----------
const A4_CAT={
  ampurr:   {b:'#6c6874',l:'#8e8a96',e:'#e8c43a',n:['#3aa84a','#f0d23a'],g:'#3fbf4a',in:'#c99aa8'},
  sparkpaw: {b:'#ece2c4',l:'#f8f2de',e:'#4ab84a',n:['#d4482a','#f6f0e0'],g:'#e8862a',in:'#f0b0b8'},
  thundra:  {b:'#f0d26a',l:'#fbecb0',e:'#4ab84a',n:['#3a5ab8','#f6f0e0'],g:'#e8a830',in:'#f0b0a0',s:'#3a5ab8'},
  voltkit:  {b:'#9ab8d8',l:'#c8dbee',e:'#e8c43a',n:['#e8a030','#f6d860'],g:'#e8ecf4',in:'#e8b0c0'}};
ART4.volt=function(sp,st,id){ const P=A4_CAT[sp.id]||{b:sp.col[0],l:sp.col[2],e:'#4ab84a',n:[sp.col[1],'#f6f0e0'],g:sp.col[1],in:'#f0b0b8'};
  const B=id+'b', dk=shade(P.b,-30); let d=`<defs>${a4g(B,P.b)}</defs>`, g='';
  const baby=st===0, adult=st===2;
  // layout
  const hx=baby?62:75, hy=baby?50:37, hr=baby?16.5:12.5;
  const bx0=baby?30:25, bx1=baby?60:70, by0=baby?62:52, by1=baby?84:77;
  g+=a4shadow(baby?46:48, baby?22:30);
  // tail
  const tail=baby?`M${bx0+3} 74 Q16 74 15 62 Q15 53 23 54`:`M${bx0+3} 62 Q10 60 11 44 Q12 34 21 36`;
  g+=`<path d="${tail}" fill="none" stroke="${A4OL}" stroke-width="${baby?8:8.6}" stroke-linecap="round"/><path d="${tail}" fill="none" stroke="${P.b}" stroke-width="${baby?4.6:5}" stroke-linecap="round"/>`;
  if(P.s) g+=`<path d="${tail}" fill="none" stroke="${P.s}" stroke-width="5" stroke-dasharray="3 6" stroke-linecap="butt" opacity=".9"/>`;
  // far legs
  g+=a4hind(baby?40:37,by1-14,baby?6.4:7,dk)+a4leg(baby?55:64,by1-8,91,baby?6.6:6.8,dk);
  // adult wing (behind body)
  if(adult){ const W='#f8f8fb', Ws='#c9cdd8';
    g+=`<path d="M50 58 Q40 26 4 14 Q9 22 4 25 Q15 28 6 33 Q18 35 9 41 Q21 42 13 48 Q25 48 19 54 Q31 53 28 59 Q38 58 44 62Z" fill="${W}" ${a4s(1.7)}/>`;
    g+=`<path d="M44 52 Q32 34 12 24 M42 56 Q30 42 12 34 M38 58 Q26 48 14 44 M34 60 Q26 54 20 52" fill="none" stroke="${Ws}" stroke-width="2" stroke-linecap="round"/>`; }
  // body
  g+=`<path d="M${bx0+1} ${by1-6} Q${bx0-3} ${by0+1} ${bx0+12} ${by0} Q${(bx0+bx1)/2} ${by0+3} ${bx1-8} ${by0-3} Q${bx1+4} ${by0-1} ${bx1+2} ${(by0+by1)/2+3} Q${bx1} ${by1+1} ${bx1-10} ${by1-1} Q${(bx0+bx1)/2} ${by1-5} ${bx0+12} ${by1} Q${bx0+3} ${by1+1} ${bx0+1} ${by1-6}Z" fill="url(#${B})" ${a4s()}/>`;
  g+=`<path d="M${bx1-14} ${by1-3} Q${bx1-6} ${by1-1} ${bx1-2} ${by1-8}" fill="none" stroke="${P.l}" stroke-width="3.4" stroke-linecap="round" opacity=".85"/>`;
  if(P.s){ for(let k=0;k<(baby?2:4);k++){ const x=bx0+12+k*((bx1-bx0-16)/(baby?2:4)); g+=`<path d="M${x} ${by0+1} q-2 6 1 11" fill="none" stroke="${P.s}" stroke-width="3" stroke-linecap="round"/>`; } }
  // near legs
  g+=a4hind(baby?33:31,by1-16,baby?7.2:8,P.b)+a4leg(baby?50:58,by1-12,92,baby?7.4:7.8,P.b);
  // neck/chest up to head
  if(!baby) g+=`<path d="M${bx1-12} ${by0+4} Q${hx-8} ${hy+4} ${hx-6} ${hy+2} L${hx+6} ${hy+6} Q${bx1+2} ${by0+6} ${bx1} ${by0+12}Z" fill="url(#${B})" ${a4s()}/>`;
  // collar (teen) / jeweled collar (adult)
  if(st>=1){ const cx=hx-1, cy=hy+hr+1; g+=`<path d="M${cx-9} ${cy-3} Q${cx} ${cy+4} ${cx+9} ${cy-3}" fill="none" stroke="${A4OL}" stroke-width="5.4" stroke-linecap="round"/><path d="M${cx-9} ${cy-3} Q${cx} ${cy+4} ${cx+9} ${cy-3}" fill="none" stroke="${adult?'#e8b830':P.g}" stroke-width="3" stroke-linecap="round"/>`;
    g+=`<path d="M${cx} ${cy+1} l3 4 l-3 4 l-3 -4Z" fill="${P.g}" ${a4s(1.3)}/>`; }
  // ears
  const ear=(x0,x1,tx,ty)=>`<path d="M${x0} ${hy-hr*.45} L${tx} ${ty} L${x1} ${hy-hr*.75}Z" fill="${P.b}" ${a4s()}/><path d="M${x0+(tx-x0)*.3} ${hy-hr*.5} L${tx+(x0<tx?0:0)} ${ty+3.5} L${x1-(x1-tx)*.35} ${hy-hr*.72}Z" fill="${P.in}"/>`;
  if(!adult){ g+=ear(hx-hr*.95,hx-hr*.2,hx-hr*.75,hy-hr*1.75)+ear(hx+hr*.15,hx+hr*.9,hx+hr*.75,hy-hr*1.8); }
  // adult headdress flaps fall behind the head to the shoulders
  if(adult){ g+=`<path d="M${hx-hr+1} ${hy-4} L${hx-hr-7} ${hy+19} L${hx+hr*.1} ${hy+17} L${hx+2} ${hy+2}Z" fill="${P.n[0]}" ${a4s(1.6)}/>`;
    for(let k=1;k<5;k++){ const y=hy-3+k*4.4; g+=`<path d="M${hx-hr-1-k*1.3} ${y} L${hx+1} ${y-.5}" stroke="${P.n[1]}" stroke-width="2.2"/>`; } }
  // head
  g+=`<path d="M${hx-hr} ${hy+1} Q${hx-hr} ${hy-hr} ${hx} ${hy-hr} Q${hx+hr+1} ${hy-hr} ${hx+hr+1} ${hy+1} Q${hx+hr+1} ${hy+hr*.9} ${hx} ${hy+hr*.92} Q${hx-hr} ${hy+hr*.9} ${hx-hr} ${hy+1}Z" fill="url(#${B})" ${a4s()}/>`;
  if(P.s&&!adult) g+=`<path d="M${hx-3} ${hy-hr+1} l1 4 M${hx+1} ${hy-hr+.5} l0 4 M${hx+5} ${hy-hr+1} l-1 4" stroke="${P.s}" stroke-width="2" stroke-linecap="round"/>`;
  // muzzle
  const mx=hx+hr*.45, my=hy+hr*.38;
  g+=`<ellipse cx="${mx}" cy="${my}" rx="${hr*.42}" ry="${hr*.3}" fill="${P.l}" opacity=".95"/><path d="M${mx-1.6} ${my-hr*.2} l3.2 0 l-1.6 2Z" fill="#e88a9a" ${a4s(1)}/>`;
  g+=`<path d="M${mx-3.2} ${my+1.6} Q${mx-1.6} ${my+3.4} ${mx} ${my+1.4} Q${mx+1.6} ${my+3.4} ${mx+3.2} ${my+1.6}" fill="none" stroke="${A4OL}" stroke-width="1.3" stroke-linecap="round"/>`;
  g+=`<path d="M${mx+hr*.45} ${my} l${hr*.35} -1.4 M${mx+hr*.45} ${my+1.6} l${hr*.36} .6" stroke="${A4OL}" stroke-width=".9" opacity=".6"/>`;
  // eyes
  const er=baby?4.6:3.3;
  g+=a4eye(hx-hr*.3,hy-hr*.08,er,P.e,st,.4)+a4eye(hx+hr*.42,hy-hr*.1,er*.92,P.e,st,.4);
  if(st>=1) g+=`<path d="M${hx-hr*.3-er} ${hy-hr*.08-er*.55} L${hx-hr*.3+er} ${hy-hr*.08-er*.95}" stroke="${A4OL}" stroke-width="1.8" stroke-linecap="round"/><path d="M${hx+hr*.42-er} ${hy-hr*.1-er} L${hx+hr*.42+er} ${hy-hr*.1-er*.55}" stroke="${A4OL}" stroke-width="1.8" stroke-linecap="round"/>`;
  // adult nemes headdress over the crown
  if(adult){ const N=id+'n'; d+=`<pattern id="${N}" width="4.4" height="40" patternUnits="userSpaceOnUse"><rect width="4.4" height="40" fill="${P.n[0]}"/><rect width="2.2" height="40" fill="${P.n[1]}"/></pattern>`;
    g+=`<path d="M${hx-hr-1.5} ${hy-1} Q${hx-hr} ${hy-hr-6} ${hx+1} ${hy-hr-5} Q${hx+hr+2} ${hy-hr-4} ${hx+hr+2} ${hy-2} L${hx+hr-2} ${hy-hr*.42} Q${hx} ${hy-hr*.82} ${hx-hr+2} ${hy-hr*.4}Z" fill="url(#${N})" ${a4s(1.6)}/>`;
    g+=`<path d="M${hx-hr+2} ${hy-hr*.4} Q${hx} ${hy-hr*.82} ${hx+hr-2} ${hy-hr*.42}" fill="none" stroke="#e8b830" stroke-width="2.4"/><path d="M${hx+2} ${hy-hr-5} l1.6 -4 l1.6 4Z" fill="#e8b830" ${a4s(1.2)}/>`;
    g+=`<path d="M${hx+hr+1} ${hy-3} L${hx+hr+3} ${hy+8} L${hx+hr-1} ${hy+8}Z" fill="${P.n[0]}" ${a4s(1.3)}/>`; }
  return d+g; };

// ---------- Tiger family: chunky cub -> prowling cat with spiked cuffs -> snarling sabertooth (Tigera grows a lion's mane) ----------
const A4_TIG={
  stripel:    {b:'#f0cf7a',l:'#fbedc4',s:null,mane:'#d8742a',e:'#3fbf4a'},
  shadestripe:{b:'#f6f3f2',l:'#ffffff',s:'#cf2a2a',e:'#3fbf4a'},
  voltiger:   {b:'#f28a2a',l:'#fbe4c6',s:'#2b2216',e:'#3fbf4a'},
  frostrype:  {b:'#c4ee44',l:'#ecffc4',s:'#8a4ab8',e:'#3fbf4a'}};
function a4cuff(x,y,w){ let g=`<rect x="${x-w/2-1.2}" y="${y-2.4}" width="${w+2.4}" height="4.8" rx="2" fill="#c8302a" ${a4s(1.4)}/>`; for(let k=0;k<3;k++) g+=`<path d="M${x-w/2+k*(w/2)} ${y-2.4} l1.2 -2.6 l1.2 2.6Z" fill="#f4f4f4" ${a4s(1)}/>`; return g; }
ART4.tiger=function(sp,st,id){ const P=A4_TIG[sp.id]||{b:sp.col[0],l:sp.col[2],s:sp.col[1],e:'#3fbf4a'};
  const B=id+'b', dk=shade(P.b,-28); let d=`<defs>${a4g(B,P.b)}</defs>`, g='';
  const baby=st===0, adult=st===2;
  const hx=baby?70:78, hy=baby?54:52, hr=baby?15:13;
  g+=a4shadow(50,32);
  // tail curling up
  const tail=baby?'M28 70 Q16 66 18 54 Q20 46 27 49':'M26 60 Q12 54 15 38 Q18 26 28 29';
  g+=`<path d="${tail}" fill="none" stroke="${A4OL}" stroke-width="${baby?8:9}" stroke-linecap="round"/><path d="${tail}" fill="none" stroke="${P.b}" stroke-width="${baby?4.6:5.4}" stroke-linecap="round"/>`;
  if(P.s) g+=`<path d="${tail}" fill="none" stroke="${P.s}" stroke-width="5.4" stroke-dasharray="3 5" opacity=".95"/>`;
  // far legs
  g+=a4hind(baby?38:36,baby?66:58,baby?7:8.4,dk)+a4leg(baby?62:72,baby?70:62,91,baby?8:10,dk);
  // body: heavy shoulders, low head
  const body=baby?'M26 76 Q22 62 36 61 Q50 60 60 56 Q72 54 74 66 Q74 80 62 84 Q46 86 34 84 Q26 83 26 76Z'
                 :'M22 66 Q18 50 34 48 Q48 46 58 40 Q72 35 79 46 Q84 62 74 73 Q58 78 42 76 Q24 76 22 66Z';
  g+=`<path d="${body}" fill="url(#${B})" ${a4s()}/>`;
  g+=`<path d="${baby?'M40 83 Q52 85 62 82':'M44 75 Q58 77 72 71'}" fill="none" stroke="${P.l}" stroke-width="3.6" stroke-linecap="round" opacity=".9"/>`;
  if(P.s){ const xs=baby?[38,46,54]:[30,38,46,54,62]; xs.forEach((x,k)=>{ const y=baby?61:(48-k*1.6); g+=`<path d="M${x} ${y} q-3 5 0 10 q1 3 -1 6" fill="none" stroke="${P.s}" stroke-width="${baby?2.6:3.2}" stroke-linecap="round"/>`; }); }
  // near legs (front leg is thick and muscular)
  g+=a4hind(baby?30:28,baby?66:56,baby?8:9.4,P.b);
  const fx=baby?56:66; g+=a4leg(fx,baby?68:58,92,baby?9:12,P.b,baby?5:6);
  if(P.s&&!baby) g+=`<path d="M${fx-5} 70 l4 1 M${fx-5} 76 l4 1" stroke="${P.s}" stroke-width="2.6" stroke-linecap="round"/>`;
  if(st>=1) g+=a4cuff(fx+.5,84,baby?9:12)+a4cuff(baby?62:72,84,baby?8:10);
  g+=`<path d="M${fx-4} 91 l0 -2.6 M${fx} 91.4 l0 -2.6 M${fx+4} 91 l0 -2.6" stroke="${A4OL}" stroke-width="1.1"/>`;
  // Tigera's mane
  if(P.mane&&adult){ const cx=hx-3, cy=hy-1, n=20, a0=-4.5, a1=0.45; let m='';
    for(let k=0;k<=n;k++){ const a=a0+(a1-a0)*k/n, r=k%2?hr+4:hr+10; m+=(k?'L':'M')+(cx+Math.cos(a)*r).toFixed(1)+' '+(cy+Math.sin(a)*r).toFixed(1)+' '; }
    g+=`<path d="${m}Z" fill="${P.mane}" ${a4s(1.6)}/><path d="${m}Z" fill="none" stroke="${shade(P.mane,-20)}" stroke-width="1" transform="translate(${cx} ${cy}) scale(.8) translate(${-cx} ${-cy})"/>`; }
  // ears
  [[hx-hr*.62,-1],[hx+hr*.42,1]].forEach(([x,sg])=>{ g+=`<ellipse cx="${x}" cy="${hy-hr*.86}" rx="${hr*.32}" ry="${hr*.3}" fill="${P.b}" ${a4s(1.6)}/><ellipse cx="${x}" cy="${hy-hr*.82}" rx="${hr*.17}" ry="${hr*.15}" fill="${shade(P.b,-25)}"/>`; });
  // head
  g+=`<path d="M${hx-hr} ${hy} Q${hx-hr} ${hy-hr*.95} ${hx} ${hy-hr*.95} Q${hx+hr*1.05} ${hy-hr*.95} ${hx+hr*1.1} ${hy+1} Q${hx+hr*1.12} ${hy+hr*.85} ${hx+2} ${hy+hr*.88} Q${hx-hr*1.05} ${hy+hr*.9} ${hx-hr} ${hy}Z" fill="url(#${B})" ${a4s()}/>`;
  if(P.s) g+=`<path d="M${hx-2} ${hy-hr*.92} l.6 4 M${hx+2.5} ${hy-hr*.9} l0 4 M${hx-hr*.95} ${hy+1} l4 1 M${hx-hr*.9} ${hy+4.5} l4 0" stroke="${P.s}" stroke-width="2.2" stroke-linecap="round"/>`;
  // muzzle
  const mx=hx+hr*.48, my=hy+hr*.42;
  g+=`<ellipse cx="${mx}" cy="${my}" rx="${hr*.5}" ry="${hr*.36}" fill="${P.l}" ${a4s(1.3)}/><path d="M${mx+hr*.18} ${my-hr*.3} l3.4 0 l-1.7 2.4Z" fill="#c87a6a" ${a4s(1)}/>`;
  if(adult){ g+=`<path d="M${mx-hr*.34} ${my+2} Q${mx+2} ${my+8} ${mx+hr*.46} ${my+1.4}" fill="#7a1e1e" ${a4s(1.3)}/>`;
    g+=`<path d="M${mx-1} ${my+3} l1.6 9 l1.6 -9Z M${mx+4.6} ${my+2.6} l1.4 8 l1.4 -8Z" fill="#fffdf2" ${a4s(1.2)}/>`; }
  else g+=`<path d="M${mx-3} ${my+2} Q${mx-1} ${my+4} ${mx+1} ${my+2} Q${mx+3} ${my+4} ${mx+5} ${my+2}" fill="none" stroke="${A4OL}" stroke-width="1.3" stroke-linecap="round"/>`;
  // eyes
  const er=baby?4.4:3.4; const ex1=hx-hr*.32, ex2=hx+hr*.32, ey=hy-hr*.18;
  g+=a4eye(ex1,ey,er,P.e,st,.5)+a4eye(ex2,ey-.3,er*.92,P.e,st,.5);
  if(st>=1) g+=`<path d="M${ex1-er} ${ey-er*.7} L${ex1+er} ${ey-er*.25}" stroke="${A4OL}" stroke-width="2.2" stroke-linecap="round"/><path d="M${ex2-er} ${ey-er*.3} L${ex2+er} ${ey-er*.85}" stroke="${A4OL}" stroke-width="2.2" stroke-linecap="round"/>`;
  return d+g; };
