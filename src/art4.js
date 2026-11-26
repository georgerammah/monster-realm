// ===== ART4: redraws modeled on the Monster Kingdom look (original drawings, same creatures/colors/features) =====
const ART4={};
const A4OL='#2a1d16';
const a4s=(w)=>`stroke="${A4OL}" stroke-width="${w||1.8}" stroke-linejoin="round" stroke-linecap="round"`;
function a4g(id,c,top,bot){ // soft 3D: light from the upper left, shadow toward the lower right
  return `<radialGradient id="${id}" cx=".36" cy=".3" r=".85" fx=".32" fy=".24"><stop offset="0" stop-color="${shade(c,top==null?24:top)}"/><stop offset=".45" stop-color="${c}"/><stop offset=".85" stop-color="${shade(c,bot==null?-20:bot)}"/><stop offset="1" stop-color="${shade(c,(bot==null?-20:bot)-12)}"/></radialGradient>`; }
function a4eye(x,y,r,iris,st,look){ look=look||0; const pr=r*(st===0?.62:.55);
  return `<ellipse cx="${x}" cy="${y}" rx="${r*.82}" ry="${r}" fill="#fffdf6" ${a4s(1.4)}/><circle cx="${x+look+r*.12}" cy="${y+r*.08}" r="${pr}" fill="${iris}"/><circle cx="${x+look+r*.16}" cy="${y+r*.1}" r="${pr*.55}" fill="#120c08"/><circle cx="${x+look+r*.32}" cy="${y-r*.18}" r="${pr*.3}" fill="#fff"/>`; }
function a4brow(x,y,r,dir){ return `<path d="M${x-r} ${y-r*1.05+(dir>0?-1:1)} L${x+r} ${y-r*1.05+(dir>0?1.6:-1.6)}" stroke="${A4OL}" stroke-width="2" stroke-linecap="round"/>`; }
function a4leg(x,top,bot,w,fill,paw){ paw=paw==null?w*.62:paw; const h=bot-top;
  // shoulder/thigh bulge tapering to the wrist, then a rounded paw with toe lines
  return `<path d="M${x-w*.62} ${top} C${x-w*.85} ${top+h*.35} ${x-w*.42} ${top+h*.62} ${x-w*.4} ${bot-2.6} L${x+w*.56} ${bot-2.6} C${x+w*.52} ${top+h*.6} ${x+w*.78} ${top+h*.3} ${x+w*.6} ${top}Z" fill="${fill}" ${a4s(1.6)}/>`+
    `<path d="M${x-w*.5-paw*.4} ${bot-.4} Q${x-w*.55-paw*.3} ${bot-5.4} ${x+1} ${bot-5.2} Q${x+w*.55+paw*.6} ${bot-5} ${x+w*.55+paw*.65} ${bot-.4}Z" fill="${fill}" ${a4s(1.5)}/>`+
    `<path d="M${x-1} ${bot-.6} l0 -2.2 M${x+2.4} ${bot-.6} l0 -2.2" stroke="${A4OL}" stroke-width=".9" opacity=".7"/>`; }
function a4sockLeg(x,top,c,sock,lw,tilt,haunch){ tilt=tilt||0; const h=89-top, bx=x+tilt;
  const L=`M${x-lw*(haunch?1.2:.62)} ${top} C${x-lw*(haunch?1.4:.8)} ${top+h*.42} ${bx-lw*.35} ${top+h*.6} ${bx-lw*.4} 89`, R=`M${bx+lw*.5} 89 C${bx+lw*.45} ${top+h*.55} ${x+lw*(haunch?1.5:.8)} ${top+h*.32} ${x+lw*(haunch?1.1:.6)} ${top}`;
  let s=`<path d="${L} ${R.replace('M','L')}Z" fill="${c}"/>`;
  if(sock) s+=`<path d="M${bx-lw*.45} ${top+h*.62} C${bx-lw*.4} 85 ${bx-lw*.45} 88 ${bx-lw*.4} 89 L${bx+lw*.5} 89 C${bx+lw*.46} 86 ${bx+lw*.46} 82 ${bx+lw*.52} ${top+h*.6}Z" fill="${sock}"/>`;
  s+=`<path d="${L}" fill="none" ${a4s(1.5)}/><path d="${R}" fill="none" ${a4s(1.5)}/>`;
  s+=`<path d="M${bx-lw*.85} 91 Q${bx-lw*.9} 87.6 ${bx+.6} 87.6 Q${bx+lw*1.2} 87.6 ${bx+lw*1.25} 91Z" fill="${sock||c}" ${a4s(1.4)}/>`; return s; }
function a4hind(x,top,w,fill){ // rounded haunch + bent hind leg ending in a paw at x
  return `<path d="M${x-w*.2} ${top} Q${x+w*1.1} ${top+4} ${x+w*.55} ${top+12} Q${x+w*.1} ${top+16} ${x+w*.7} 90.4 L${x-w*.75} 90.4 Q${x-w*.9} ${top+14} ${x-w*1.05} ${top+7} Q${x-w*1.2} ${top} ${x-w*.2} ${top}Z" fill="${fill}" ${a4s(1.6)}/><ellipse cx="${x}" cy="90.4" rx="${w*.85}" ry="2.6" fill="${fill}" ${a4s(1.5)}/>`; }
function a4shadow(cx,rx){ return `<ellipse cx="${cx}" cy="92.5" rx="${rx}" ry="3" fill="#000" opacity=".16"/>`; }
const A4_SC=[0.74,0.88,1];
monSVG=(function(prev){ return function(spId,lvl,cls){ const sp=SPI[spId]; const f=sp&&ART4[sp.fam]; if(!f) return prev(spId,lvl,cls);
  const st=stageOf(lvl||1), id='a4'+(GID++); let body; try{ body=f(sp,st,id); }catch(e){ console.warn('art4',sp.id,e); return prev(spId,lvl,cls); } if(!body) return prev(spId,lvl,cls);
  return `<svg class="${cls||''}" viewBox="-4 0 108 100"><g transform="translate(50 92) scale(${A4_SC[st]}) translate(-50 -92)">${body}</g></svg>`; }; })(monSVG);

// ---------- Volt family: kitten -> elegant cat with a jeweled collar -> winged sphinx in a striped headdress ----------
const A4_CAT={
  ampurr:   {b:'#6c6874',l:'#8e8a96',ft:'#2a2830',e:'#e8c43a',n:['#3aa84a','#f0d23a'],g:'#3fbf4a',in:'#c99aa8'},
  sparkpaw: {b:'#e6dcbc',l:'#f8f2de',ft:'#8a8478',e:'#4ab84a',n:['#d4482a','#f6f0e0'],g:'#d83a2a',in:'#f0b0b8'},
  thundra:  {b:'#f0d26a',l:'#fbecb0',ft:'#9a8a4a',e:'#4ab84a',n:['#3a5ab8','#f6f0e0'],g:'#3a5ab8',in:'#f0b0a0',s:'#3a5ab8'},
  voltkit:  {b:'#9ab8d8',l:'#c8dbee',ft:'#5a6a82',e:'#e8c43a',n:['#e8a030','#f6d860'],g:'#e8a030',in:'#e8b0c0'}};
ART4.volt=function(sp,st,id){ const P=A4_CAT[sp.id]||{b:sp.col[0],l:sp.col[2],ft:shade(sp.col[0],-40),e:'#4ab84a',n:[sp.col[1],'#f6f0e0'],g:sp.col[1],in:'#f0b0b8'};
  const B=id+'b', Bd=id+'d', dk=shade(P.b,-26); let d=`<defs>${a4g(B,P.b)}${a4g(Bd,dk)}</defs>`, g='';
  const baby=st===0, adult=st===2;
  // proportions: kittens are big-headed, grown cats are tall and slender
  const k=baby?{bx0:30,bx1:62,by0:59,by1:77,hx:66,hy:46,hr:15,leg:6}:{bx0:26,bx1:68,by0:49,by1:68,hx:76,hy:30,hr:11.5,leg:6.2};
  const {bx0,bx1,by0,by1,hx,hy,hr}=k, lw=k.leg;
  g+=a4shadow(48,baby?22:30);
  // tail: question-mark curl standing up behind
  const tail=baby?`M${bx0+3} ${by0+6} Q20 ${by0+4} 20 ${by0-6} Q20 ${by0-14} 27 ${by0-14}`:`M${bx0+3} ${by0+5} Q12 ${by0+2} 13 ${by0-12} Q14 ${by0-26} 24 ${by0-26} Q30 ${by0-26} 29 ${by0-20}`;
  g+=`<path d="${tail}" fill="none" stroke="${A4OL}" stroke-width="${baby?7.4:7}" stroke-linecap="round"/><path d="${tail}" fill="none" stroke="${P.b}" stroke-width="${baby?4.2:3.8}" stroke-linecap="round"/>`;
  if(P.s) g+=`<path d="${tail}" fill="none" stroke="${P.s}" stroke-width="3.8" stroke-dasharray="2.4 5"/>`;
  // a slender leg with a dark sock
  const legC=(x,top,c,tilt,haunch)=>{ tilt=tilt||0; const h=89-top, bx=x+tilt, sock=shade(P.ft,c===P.b?0:-12);
    const L=`M${x-lw*(haunch?1.2:.62)} ${top} C${x-lw*(haunch?1.4:.8)} ${top+h*.42} ${bx-lw*.35} ${top+h*.6} ${bx-lw*.4} 89`, R=`M${bx+lw*.5} 89 C${bx+lw*.45} ${top+h*.55} ${x+lw*(haunch?1.5:.8)} ${top+h*.32} ${x+lw*(haunch?1.1:.6)} ${top}`;
    let s=`<path d="${L} L${bx+lw*.5} 89 C${bx+lw*.45} ${top+h*.55} ${x+lw*(haunch?1.5:.8)} ${top+h*.32} ${x+lw*(haunch?1.1:.6)} ${top}Z" fill="${c}"/>`;
    s+=`<path d="M${bx-lw*.45} ${top+h*.64} C${bx-lw*.4} 85 ${bx-lw*.45} 88 ${bx-lw*.4} 89 L${bx+lw*.5} 89 C${bx+lw*.46} 86 ${bx+lw*.46} 82 ${bx+lw*.52} ${top+h*.62}Z" fill="${sock}"/>`;
    s+=`<path d="${L}" fill="none" ${a4s(1.5)}/><path d="${R}" fill="none" ${a4s(1.5)}/>`;
    s+=`<path d="M${bx-lw*.85} 91 Q${bx-lw*.9} 87.6 ${bx+.6} 87.6 Q${bx+lw*1.2} 87.6 ${bx+lw*1.25} 91Z" fill="${sock}" ${a4s(1.4)}/>`; return s; };
  // far legs
  g+=legC(baby?40:37,by1-10,`url(#${Bd})`,-1.5,1)+legC(baby?57:64,by1-10,`url(#${Bd})`,2);
  // adult wing behind the body (swept back, layered white feathers)
  if(adult){ const W='#fafafd', W2='#e2e4ec', W3='#c6cad6';
    g+=`<g transform="translate(4 -10) rotate(8 56 56)">`;
    g+=`<path d="M58 54 Q44 30 8 26 Q14 31 10 34 Q20 36 12 41 Q24 42 16 47 Q28 48 22 53 Q34 54 30 59 Q44 58 52 62Z" fill="${W}" ${a4s(1.6)}/>`;
    g+=`<path d="M56 54 Q42 38 14 34 M54 57 Q40 46 18 44 M50 60 Q38 54 26 52" fill="none" stroke="${W2}" stroke-width="2.6" stroke-linecap="round"/>`;
    g+=`<path d="M10 34 Q20 36 12 41 M16 47 Q28 48 22 53" fill="none" stroke="${W3}" stroke-width="1.2"/>`; g+='</g>'; }
  // body
  g+=`<path d="M${bx0+2} ${by1-3} Q${bx0-3} ${by0+2} ${bx0+10} ${by0} Q${(bx0+bx1)/2} ${by0+3} ${bx1-6} ${by0-3} Q${bx1+4} ${by0-2} ${bx1+3} ${by1-6} Q${bx1} ${by1+1} ${bx1-8} ${by1} Q${(bx0+bx1)/2} ${by1-3} ${bx0+10} ${by1+1} Q${bx0+3} ${by1+1} ${bx0+2} ${by1-3}Z" fill="url(#${B})" ${a4s()}/>`;
  if(P.s) for(let i=0;i<(baby?3:5);i++){ const x=bx0+9+i*((bx1-bx0-14)/(baby?3:5)); g+=`<path d="M${x} ${by0+.5} q-2.4 4 0 8" fill="none" stroke="${P.s}" stroke-width="2.6" stroke-linecap="round"/>`; }
  // near legs (front leg steps forward)
  g+=legC(baby?33:31,by1-14,P.b,-2,1)+legC(baby?52:58,by1-12,P.b,3);
  // neck
  if(!baby) g+=`<path d="M${bx1-14} ${by0+4} Q${hx-9} ${hy+8} ${hx-6} ${hy+4} L${hx+5} ${hy+7} Q${bx1+2} ${by0} ${bx1+3} ${by0+10} L${bx1-8} ${by0+12}Z" fill="url(#${B})"/><path d="M${bx1-14} ${by0+2} Q${hx-9} ${hy+8} ${hx-6} ${hy+4}" fill="none" ${a4s()}/><path d="M${hx+5} ${hy+7} Q${bx1+2} ${by0} ${bx1+3} ${by0+10}" fill="none" ${a4s()}/>`;
  // jeweled broad collar (teen) / gold collar (adult)
  if(st>=1){ const cx=hx-2, cy=hy+hr+3; const col=adult?'#e8b830':'#f4f0e4';
    g+=`<path d="M${cx-9} ${cy-4} Q${cx} ${cy+2} ${cx+9} ${cy-5} L${cx+10} ${cy} Q${cx} ${cy+8} ${cx-10} ${cy+1}Z" fill="${col}" ${a4s(1.4)}/>`;
    g+=`<path d="M${cx-9.5} ${cy-1.5} Q${cx} ${cy+5} ${cx+9.5} ${cy-2.5}" fill="none" stroke="${P.g}" stroke-width="1.6"/>`;
    g+=`<path d="M${cx} ${cy+3} l2.6 3.2 l-2.6 3.4 l-2.6 -3.4Z" fill="${P.g}" ${a4s(1.2)}/><circle cx="${cx-.8}" cy="${cy+5.4}" r=".8" fill="#fff" opacity=".8"/>`; }
  // ears: tall triangles
  const ear=(x0,x1,tx,ty)=>`<path d="M${x0} ${hy-hr*.4} L${tx} ${ty} L${x1} ${hy-hr*.78}Z" fill="url(#${B})" ${a4s()}/><path d="M${x0+(tx-x0)*.32} ${hy-hr*.5} L${tx} ${ty+4} L${x1-(x1-tx)*.3} ${hy-hr*.74}Z" fill="${P.in}" opacity=".85"/>`;
  if(!adult) g+=ear(hx-hr*.95,hx-hr*.18,hx-hr*.72,hy-hr*(baby?1.75:2))+ear(hx+hr*.1,hx+hr*.92,hx+hr*.72,hy-hr*(baby?1.8:2.05));
  // adult: nemes lappet + braided beard behind the face
  if(adult){ g+=`<path d="M${hx-hr+.5} ${hy-3} L${hx-hr-6} ${hy+18} L${hx-1} ${hy+16} L${hx+1} ${hy+2}Z" fill="${P.n[0]}" ${a4s(1.5)}/>`;
    for(let i=1;i<5;i++){ const y=hy-2+i*4.3; g+=`<path d="M${hx-hr-.6-i*1.2} ${y} L${hx} ${y-.4}" stroke="${P.n[1]}" stroke-width="2.1"/>`; }
    g+=`<path d="M${hx+4} ${hy+hr*.8} L${hx+3} ${hy+hr*.8+9} L${hx+7} ${hy+hr*.8+9} L${hx+6.4} ${hy+hr*.8}Z" fill="#e8b830" ${a4s(1.2)}/><path d="M${hx+3.2} ${hy+hr*.8+3} h3.6 M${hx+3.1} ${hy+hr*.8+6} h3.8" stroke="${shade('#e8b830',-30)}" stroke-width="1"/>`; }
  // head
  g+=`<path d="M${hx-hr} ${hy+1} Q${hx-hr} ${hy-hr} ${hx} ${hy-hr} Q${hx+hr+1} ${hy-hr} ${hx+hr+1.5} ${hy+1} Q${hx+hr+1} ${hy+hr*.85} ${hx+1} ${hy+hr*.9} Q${hx-hr} ${hy+hr*.88} ${hx-hr} ${hy+1}Z" fill="url(#${B})" ${a4s()}/>`;
  g+=`<path d="M${hx-hr+2} ${hy+hr*.55} q2 1.6 4 .4 M${hx-hr+1.5} ${hy+hr*.35} q2 1 4 .2" fill="none" stroke="${shade(P.b,-25)}" stroke-width="1" opacity=".8"/>`;
  if(P.s&&!adult) g+=`<path d="M${hx-3} ${hy-hr+1} l1 4 M${hx+1} ${hy-hr+.5} l0 4 M${hx+5} ${hy-hr+1} l-1 4" stroke="${P.s}" stroke-width="2" stroke-linecap="round"/>`;
  // muzzle
  const mx=hx+hr*.45, my=hy+hr*.4;
  g+=`<ellipse cx="${mx}" cy="${my}" rx="${hr*.4}" ry="${hr*.28}" fill="${P.l}"/><path d="M${mx-1.5} ${my-hr*.2} l3 0 l-1.5 2Z" fill="#e88a9a" ${a4s(1)}/>`;
  g+=baby?`<path d="M${mx-3} ${my+1.4} Q${mx} ${my+5.4} ${mx+3} ${my+1.4}Z" fill="#c8505a" ${a4s(1.1)}/>`:`<path d="M${mx-3} ${my+1.6} Q${mx-1.5} ${my+3.2} ${mx} ${my+1.4} Q${mx+1.5} ${my+3.2} ${mx+3} ${my+1.6}" fill="none" stroke="${A4OL}" stroke-width="1.2" stroke-linecap="round"/>`;
  g+=`<path d="M${mx+hr*.42} ${my-.4} l${hr*.4} -1.6 M${mx+hr*.42} ${my+1.4} l${hr*.42} .6 M${mx-hr*.42} ${my} l${-hr*.36} -1" stroke="${A4OL}" stroke-width=".8" opacity=".55"/>`;
  // eyes: kittens wide and round, grown cats narrowed and haughty
  const er=baby?4.4:3.1;
  g+=a4eye(hx-hr*.28,hy-hr*.06,er,P.e,st,.4)+a4eye(hx+hr*.42,hy-hr*.08,er*.92,P.e,st,.4);
  if(st>=1) g+=`<path d="M${hx-hr*.28-er-.5} ${hy-hr*.06-er*.35} Q${hx-hr*.28} ${hy-hr*.06-er*1.05} ${hx-hr*.28+er+.5} ${hy-hr*.06-er*.5}" fill="${P.b}" stroke="${A4OL}" stroke-width="1.6"/><path d="M${hx+hr*.42-er-.5} ${hy-hr*.08-er*.5} Q${hx+hr*.42} ${hy-hr*.08-er*1.05} ${hx+hr*.42+er+.5} ${hy-hr*.08-er*.35}" fill="${P.b}" stroke="${A4OL}" stroke-width="1.6"/>`;
  // adult nemes over the crown with gold band and cobra
  if(adult){ const N=id+'n'; d+=`<pattern id="${N}" width="4.2" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(8)"><rect width="4.2" height="40" fill="${P.n[0]}"/><rect width="2.1" height="40" fill="${P.n[1]}"/></pattern>`;
    g+=`<path d="M${hx-hr-1.5} ${hy} Q${hx-hr-1} ${hy-hr-5} ${hx+1} ${hy-hr-4.5} Q${hx+hr+2} ${hy-hr-4} ${hx+hr+2.4} ${hy-1} L${hx+hr-1.6} ${hy-hr*.38} Q${hx} ${hy-hr*.8} ${hx-hr+2} ${hy-hr*.36}Z" fill="url(#${N})" ${a4s(1.5)}/>`;
    g+=`<path d="M${hx-hr+2} ${hy-hr*.36} Q${hx} ${hy-hr*.8} ${hx+hr-1.6} ${hy-hr*.38}" fill="none" stroke="${A4OL}" stroke-width="4.2"/><path d="M${hx-hr+2} ${hy-hr*.36} Q${hx} ${hy-hr*.8} ${hx+hr-1.6} ${hy-hr*.38}" fill="none" stroke="#e8b830" stroke-width="2.4"/>`;
    g+=`<path d="M${hx+2.6} ${hy-hr*.72} q-1.6 -4 .6 -6.6 q2.6 1.4 1.4 6.4Z" fill="#e8b830" ${a4s(1.1)}/>`;
    g+=`<path d="M${hx+hr+1.4} ${hy-2} L${hx+hr+3.6} ${hy+9} L${hx+hr-.6} ${hy+9}Z" fill="url(#${N})" ${a4s(1.2)}/>`;
    g+=`<path d="M${hx-hr*.62} ${hy-hr*1.2} L${hx-hr*.5} ${hy-hr*1.95} L${hx-hr*.1} ${hy-hr*1.1}Z" fill="url(#${B})" ${a4s(1.4)}/>`; }
  return d+g; };
// ---------- Tiger family: chunky cub -> prowling cat with spiked cuffs -> snarling sabertooth (Tigera grows a lion's mane) ----------
const A4_TIG={
  stripel:    {b:'#f0cf7a',l:'#fbedc4',s:null,mane:'#d8742a',e:'#3fbf4a'},
  shadestripe:{b:'#f6f3f2',l:'#ffffff',s:'#cf2a2a',e:'#3fbf4a'},
  voltiger:   {b:'#f28a2a',l:'#fbe4c6',s:'#2b2216',e:'#3fbf4a'},
  frostrype:  {b:'#c4ee44',l:'#ecffc4',s:'#8a4ab8',e:'#3fbf4a'}};
function a4wedge(x,y,len,ang,w,c){ const a=ang*Math.PI/180, dx=Math.cos(a), dy=Math.sin(a), nx=-dy, ny=dx;
  return `<path d="M${(x+nx*w).toFixed(1)} ${(y+ny*w).toFixed(1)} Q${(x+dx*len*.5+nx*w*.8).toFixed(1)} ${(y+dy*len*.5+ny*w*.8).toFixed(1)} ${(x+dx*len).toFixed(1)} ${(y+dy*len).toFixed(1)} Q${(x+dx*len*.5-nx*w*.6).toFixed(1)} ${(y+dy*len*.5-ny*w*.6).toFixed(1)} ${(x-nx*w).toFixed(1)} ${(y-ny*w).toFixed(1)}Z" fill="${c}"/>`; }
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
  const CL=id+'cb'; d+=`<clipPath id="${CL}"><path d="${body}"/></clipPath>`;
  g+=`<path d="${body}" fill="url(#${B})"/>`;
  let inner=`<ellipse cx="${baby?60:70}" cy="${baby?80:70}" rx="${baby?12:14}" ry="${baby?8:10}" fill="${P.l}"/><ellipse cx="${baby?46:50}" cy="${baby?88:80}" rx="${baby?16:22}" ry="6" fill="${P.l}" opacity=".9"/>`;
  if(P.s){ const n=baby?4:7; for(let i=0;i<n;i++){ const x=(baby?32:26)+i*(baby?8:7.4), top=baby?58:(52-Math.sin(i/(n-1)*3)*8); inner+=a4wedge(x,top-2,baby?11:15+(i%2)*4,96+(i%3)*6,baby?2.2:2.8,P.s); } }
  g+=`<g clip-path="url(#${CL})">${inner}</g><path d="${body}" fill="none" ${a4s()}/>`;
  // near legs (front leg is thick and muscular)
  g+=a4hind(baby?30:28,baby?66:56,baby?8:9.4,P.b);
  const fx=baby?56:66; g+=a4leg(fx,baby?68:58,92,baby?9:12,P.b,baby?5:6);
  if(P.s) [[fx-(baby?4.4:5.8),70],[fx-(baby?4.4:5.8),76.5],[baby?24.5:22.5,68],[baby?25:23,74.5]].forEach(([x,y])=>g+=a4wedge(x,y,baby?4:5.6,6,1.4,P.s));
  if(st>=1) g+=a4cuff(fx+.5,84,baby?9:12)+a4cuff(baby?62:72,84,baby?8:10)+a4cuff(baby?30:28,84,baby?8:10);
  g+=`<path d="M${fx-4} 91 l0 -2.6 M${fx} 91.4 l0 -2.6 M${fx+4} 91 l0 -2.6" stroke="${A4OL}" stroke-width="1.1"/>`;
  // Tigera's mane
  if(P.mane&&adult){ const cx=hx-3, cy=hy-1, n=20, a0=-4.5, a1=0.45; let m='';
    for(let k=0;k<=n;k++){ const a=a0+(a1-a0)*k/n, r=k%2?hr+4:hr+10; m+=(k?'L':'M')+(cx+Math.cos(a)*r).toFixed(1)+' '+(cy+Math.sin(a)*r).toFixed(1)+' '; }
    g+=`<path d="${m}Z" fill="${P.mane}" ${a4s(1.6)}/><path d="${m}Z" fill="none" stroke="${shade(P.mane,-20)}" stroke-width="1" transform="translate(${cx} ${cy}) scale(.8) translate(${-cx} ${-cy})"/>`; }
  // ears
  [[hx-hr*.62,-1],[hx+hr*.42,1]].forEach(([x,sg])=>{ g+=`<ellipse cx="${x}" cy="${hy-hr*.86}" rx="${hr*.32}" ry="${hr*.3}" fill="${P.b}" ${a4s(1.6)}/><ellipse cx="${x}" cy="${hy-hr*.82}" rx="${hr*.17}" ry="${hr*.15}" fill="${shade(P.b,-25)}"/>`; });
  // head
  g+=`<path d="M${hx-hr} ${hy} Q${hx-hr} ${hy-hr*.95} ${hx} ${hy-hr*.95} Q${hx+hr*1.05} ${hy-hr*.95} ${hx+hr*1.1} ${hy+1} Q${hx+hr*1.12} ${hy+hr*.85} ${hx+2} ${hy+hr*.88} Q${hx-hr*1.05} ${hy+hr*.9} ${hx-hr} ${hy}Z" fill="url(#${B})" ${a4s()}/>`;
  g+=`<path d="M${hx-hr*.9} ${hy+hr*.15} L${hx-hr*1.3} ${hy+hr*.5} L${hx-hr*.85} ${hy+hr*.55} L${hx-hr*1.15} ${hy+hr*.85} L${hx-hr*.55} ${hy+hr*.8}Z" fill="url(#${B})" ${a4s(1.3)}/>`;
  if(P.s){ g+=a4wedge(hx-1,hy-hr*.95,6,90,1.6,P.s)+a4wedge(hx+3,hy-hr*.92,5,95,1.4,P.s)+a4wedge(hx-5,hy-hr*.88,4.6,80,1.3,P.s)+a4wedge(hx-hr,hy,6,8,1.5,P.s)+a4wedge(hx-hr,hy+4,5,0,1.3,P.s); }
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

// ---------- Hound family: fox pup -> collared fox -> snarling two-headed wolf with a spiked collar ----------
const A4_HND={
  ashfang:  {b:'#e84a2a',l:'#fff4ea',leg:'#5a3a2a',tip:'#fff4ea',c:'#d8a83a',e:'#e8c43a'},
  rubblejaw:{b:'#9c9ca4',l:'#ececf0',leg:'#64646c',tip:'#64646c',c:'#c4231c',e:'#c4231c'},
  gravelpup:{b:'#dad18e',l:'#fff8dc',leg:'#57513c',tip:'#57513c',c:'#b8902a',e:'#3a2a1a'},
  cragmaw:  {b:'#4e4462',l:'#7a7090',leg:'#2e2840',tip:'#2e2840',c:'#3ab8d8',e:'#3ab8d8'}};
function a4foxHead(hx,hy,r,P,st,id,snarl,B){ let g='';
  // ears
  g+=`<path d="M${hx-r*.9} ${hy-r*.25} L${hx-r*.7} ${hy-r*2.3} L${hx+r*.1} ${hy-r*.75}Z" fill="${P.b}" ${a4s()}/><path d="M${hx-r*.62} ${hy-r*.5} L${hx-r*.52} ${hy-r*1.45} L${hx-r*.15} ${hy-r*.75}Z" fill="${P.leg}" opacity=".55"/>`;
  g+=`<path d="M${hx+r*.0} ${hy-r*.7} L${hx+r*.7} ${hy-r*2.35} L${hx+r*.95} ${hy-r*.4}Z" fill="${P.b}" ${a4s()}/><path d="M${hx+r*.22} ${hy-r*.75} L${hx+r*.6} ${hy-r*1.5} L${hx+r*.68} ${hy-r*.6}Z" fill="${P.leg}" opacity=".55"/>`;
  // skull + long snout
  g+=`<path d="M${hx-r} ${hy+r*.1} Q${hx-r} ${hy-r} ${hx} ${hy-r*.92} Q${hx+r*.8} ${hy-r*.9} ${hx+r*.95} ${hy-r*.15} L${hx+r*2} ${hy+r*.12} Q${hx+r*2.15} ${hy+r*.45} ${hx+r*1.9} ${hy+r*.6} L${hx+r*.6} ${hy+r*.9} Q${hx-r*.3} ${hy+r*1.05} ${hx-r} ${hy+r*.1}Z" fill="url(#${B})" ${a4s()}/>`;
  g+=`<path d="M${hx-r*.2} ${hy+r*.95} Q${hx+r*.6} ${hy+r*.7} ${hx+r*1.9} ${hy+r*.6} Q${hx+r*.9} ${hy+r*1.35} ${hx-r*.2} ${hy+r*.95}Z" fill="${P.l}" ${a4s(1.3)}/>`;
  g+=`<ellipse cx="${hx+r*2}" cy="${hy+r*.22}" rx="${r*.22}" ry="${r*.17}" fill="#1e1612"/>`;
  if(snarl){ g+=`<path d="M${hx+r*.5} ${hy+r*.72} L${hx+r*1.85} ${hy+r*.6} L${hx+r*1.6} ${hy+r*1.15} Q${hx+r} ${hy+r*1.3} ${hx+r*.5} ${hy+r*.72}Z" fill="#7a1e1e" ${a4s(1.2)}/>`;
    for(let k=0;k<4;k++) g+=`<path d="M${hx+r*(.75+k*.28)} ${hy+r*(.7-k*.03)} l${r*.08} ${r*.26} l${r*.08} ${-r*.26}Z" fill="#fff" ${a4s(.8)}/>`;
    g+=`<path d="M${hx+r*1.1} ${hy-r*.05} q${r*.3} ${-r*.1} ${r*.6} ${r*.05}" fill="none" stroke="${A4OL}" stroke-width="1.2"/>`; }
  else g+=`<path d="M${hx+r*1.2} ${hy+r*.78} q${r*.25} ${r*.15} ${r*.5} ${-r*.05}" fill="none" stroke="${A4OL}" stroke-width="1.2" stroke-linecap="round"/>`;
  // eye (profile-ish 3/4)
  const er=st===0?r*.36:r*.28; g+=a4eye(hx+r*.38,hy-r*.18,er,P.e,st,.4);
  if(st>=1) g+=`<path d="M${hx+r*.38-er} ${hy-r*.18-er*.7} L${hx+r*.38+er*1.1} ${hy-r*.18-er*.15}" stroke="${A4OL}" stroke-width="2" stroke-linecap="round"/>`;
  return g; }
ART4.hound=function(sp,st,id){ const P=A4_HND[sp.id]||{b:sp.col[0],l:sp.col[2],leg:shade(sp.col[0],-40),tip:sp.col[2],c:sp.col[1],e:'#3a2a1a'};
  const B=id+'b', Bd=id+'d'; let d=`<defs>${a4g(B,P.b)}${a4g(Bd,shade(P.b,-22))}</defs>`, g='';
  const baby=st===0, adult=st===2;
  const bx0=baby?32:24, bx1=baby?62:66, by0=baby?64:54, by1=baby?80:74, lw=baby?5.8:6.4;
  g+=a4shadow(48,30);
  // big fluffy tail curling up, tufted edge
  const tl=baby?`M${bx0+2} 72 Q16 74 13 60 L17 61 Q14 54 18 48 L21 52 Q22 44 28 44 Q24 52 27 58 Q30 66 ${bx0+6} 66Z`
                :`M${bx0+2} 62 Q8 64 5 46 L9 47 Q6 38 11 30 L14 34 Q16 24 24 22 Q19 32 21 42 Q24 54 ${bx0+8} 56Z`;
  g+=`<path d="${tl}" fill="url(#${B})" ${a4s()}/>`;
  const TC=id+'tc'; d+=`<clipPath id="${TC}"><path d="${tl}"/></clipPath>`;
  g+=`<g clip-path="url(#${TC})"><ellipse cx="${baby?20:14}" cy="${baby?48:26}" rx="${baby?10:13}" ry="${baby?9:12}" fill="${P.tip}"/></g><path d="${tl}" fill="none" ${a4s()}/>`;
  // far legs
  g+=a4sockLeg(baby?41:37,by1-10,`url(#${Bd})`,shade(P.leg,-12),lw,-1.5,1)+a4sockLeg(baby?57:61,by1-8,`url(#${Bd})`,shade(P.leg,-12),lw,2);
  // body
  const body=`M${bx0} ${by1-5} Q${bx0-2} ${by0} ${bx0+12} ${by0} L${bx1-6} ${by0-1} Q${bx1+5} ${by0} ${bx1+3} ${by1-6} Q${bx1} ${by1+1} ${bx1-10} ${by1} L${bx0+10} ${by1} Q${bx0+1} ${by1} ${bx0} ${by1-5}Z`;
  const CL=id+'cb'; d+=`<clipPath id="${CL}"><path d="${body}"/></clipPath>`;
  g+=`<path d="${body}" fill="url(#${B})"/><g clip-path="url(#${CL})"><ellipse cx="${bx1-2}" cy="${by1-2}" rx="11" ry="9" fill="${P.l}"/></g><path d="${body}" fill="none" ${a4s()}/>`;
  // near legs
  g+=a4sockLeg(baby?34:30,by1-12,P.b,P.leg,lw+.6,-2,1)+a4sockLeg(baby?53:56,by1-10,P.b,P.leg,lw+.6,3);
  // neck + chest ruff
  const hx=baby?64:70, hy=baby?50:38, r=baby?12:9.5;
  if(!baby){ g+=`<path d="M${bx1-14} ${by0+3} Q${hx-8} ${hy+6} ${hx-6} ${hy} L${hx+6} ${hy+4} Q${bx1+3} ${by0} ${bx1+3} ${by0+9} L${bx1-8} ${by0+12}Z" fill="url(#${B})"/><path d="M${bx1-14} ${by0+2} Q${hx-8} ${hy+6} ${hx-6} ${hy}" fill="none" ${a4s()}/>`;
    let ruff=`M${hx+6} ${hy+4}`; for(let i=0;i<5;i++){ const y=hy+6+i*3.6; ruff+=` L${hx+10-i*.8} ${y+1.6} L${hx+6-i*.6} ${y+3}`; } ruff+=` L${bx1-6} ${by0+12} L${bx1-8} ${by0+4}Z`;
    g+=`<path d="${ruff}" fill="${P.l}" ${a4s(1.4)}/>`; }
  // adult: two extra heads behind
  if(adult){ const B2=id+'c'; d+=a4g(B2,shade(P.b,-16)); const P2=Object.assign({},P,{b:shade(P.b,-16)});
    g+=`<g transform="translate(-17 -3) rotate(-16 ${hx} ${hy})">${a4foxHead(hx,hy,r*.86,P2,st,id,true,B2)}</g>`;
    g+=`<g transform="translate(-9 12) rotate(18 ${hx} ${hy})">${a4foxHead(hx,hy,r*.86,P2,st,id,true,B2)}</g>`; }
  g+=a4foxHead(hx,hy,r,P,st,id,adult,B);
  // collar
  if(st>=1){ const cx=hx-2, cy=hy+r*1.05+2; g+=`<path d="M${cx-8} ${cy-4} Q${cx+1} ${cy+3} ${cx+9} ${cy-4}" fill="none" stroke="${A4OL}" stroke-width="5.6" stroke-linecap="round"/><path d="M${cx-8} ${cy-4} Q${cx+1} ${cy+3} ${cx+9} ${cy-4}" fill="none" stroke="${P.c}" stroke-width="3.2" stroke-linecap="round"/>`;
    if(adult){ for(let k=0;k<5;k++){ const x=cx-7+k*4, y=cy-2.6+Math.abs(k-2)*-1; g+=`<path d="M${x-1.4} ${y} l1.4 ${k===2?5:3.6} l1.4 ${k===2?-5:-3.6}Z" fill="#eceef2" ${a4s(.9)}/>`; } }
    else g+=`<circle cx="${cx+1}" cy="${cy+2.6}" r="2.2" fill="#e8c43a" ${a4s(1.1)}/>`; }
  return d+g; };
// ---------- Bug family: round beetle -> horned beetle on legs -> rearing beetle with raised wing cases (Hunnybee is a bee) ----------
const A4_BUG={
  leafwing:{sh:'#d8282a',sp:'#1e1612',spA:'#ecd44a',hd:'#2a2020',leg:'#2a2020',e:'#e8d04a',bk:'#c8282a'},
  thornet: {sh:'#2c5c62',sp:'#1c3c40',spike:1,hd:'#2c5c62',leg:'#1c3236',e:'#e8d04a',bk:'#e8c83a',belly:'#e8c83a'},
  mossbug: {sh:'#f2b82a',st:'#5a3a1a',hd:'#f2b82a',leg:'#d8282a',e:'#3fbf4a',bk:'#f2c83a'},
  buzzlet: {bee:1,sh:'#c8f23a',st:'#1e1a14',hd:'#c8f23a',leg:'#1e1a14',e:'#1e1a14',bk:'#9ac82a'}};
ART4.bug=function(sp,st,id){ const P=A4_BUG[sp.id]||{sh:sp.col[0],sp:sp.col[1],hd:shade(sp.col[0],-30),leg:'#2a2020',e:'#e8d04a',bk:sp.col[1]};
  const B=id+'b', H=id+'h'; let d=`<defs>${a4g(B,P.sh,26,-26)}${a4g(H,P.hd)}</defs>`, g=''; const baby=st===0, adult=st===2;
  g+=a4shadow(48,30);
  if(P.bee){ // bee
    const cx=baby?46:44, cy=baby?72:62, rx=baby?18:20, ry=baby?14:15;
    if(!baby) g+=`<path d="M${cx-rx+2} ${cy+4} L${cx-rx-9} ${cy+9} L${cx-rx+3} ${cy+11}Z" fill="#1e1a14" ${a4s(1.3)}/>`;
    // wings
    const wg=(x,y,a,s)=>`<ellipse cx="${x}" cy="${y}" rx="${10*s}" ry="${5.5*s}" transform="rotate(${a} ${x} ${y})" fill="#e8f2f8" opacity=".85" ${a4s(1.4)}/><path d="M${x-7*s} ${y} L${x+7*s} ${y}" transform="rotate(${a} ${x} ${y})" stroke="#9ab0bc" stroke-width="1"/>`;
    g+=wg(cx-4,cy-ry-6,-30,baby?.8:1.25)+wg(cx+4,cy-ry-3,-55,baby?.7:1.1);
    // legs
    if(!baby) [cx-8,cx+2,cx+10].forEach((x,k)=>{ g+=`<path d="M${x} ${cy+ry-4} q${-3+k} 8 ${-1+k*2} 15" fill="none" stroke="${A4OL}" stroke-width="4.2" stroke-linecap="round"/><path d="M${x} ${cy+ry-4} q${-3+k} 8 ${-1+k*2} 15" fill="none" stroke="${P.leg}" stroke-width="2" stroke-linecap="round"/>`; });
    g+=`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${B})" ${a4s()}/>`;
    const C=id+'c'; d+=`<clipPath id="${C}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath>`;
    g+=`<g clip-path="url(#${C})">${[-.55,-.1,.35].map(f=>`<rect x="${cx+rx*f-3}" y="${cy-ry}" width="6" height="${ry*2}" fill="${P.st}"/>`).join('')}</g><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" ${a4s()}/>`;
    // head
    const hx=cx+rx+(baby?-2:3), hy=cy-(baby?2:4), hr=baby?11:9;
    g+=`<path d="M${hx-3} ${hy-hr+1} q-2 -9 -8 -11 M${hx+2} ${hy-hr+1} q2 -9 8 -10" fill="none" stroke="${A4OL}" stroke-width="1.8" stroke-linecap="round"/><circle cx="${hx-11}" cy="${hy-hr-10}" r="2" fill="${A4OL}"/><circle cx="${hx+10}" cy="${hy-hr-9}" r="2" fill="${A4OL}"/>`;
    g+=`<circle cx="${hx}" cy="${hy}" r="${hr}" fill="url(#${H})" ${a4s()}/>`;
    if(!baby) g+=`<path d="M${hx+hr-2} ${hy+1} L${hx+hr+12} ${hy+5} L${hx+hr-1} ${hy+7}Z" fill="${P.bk}" ${a4s(1.4)}/>`;
    g+=a4eye(hx+1,hy-2,baby?4.4:3.4,P.e,st,.6)+a4eye(hx+hr*.6,hy-2.4,baby?3.8:3,P.e,st,.6);
    if(baby) g+=`<path d="M${hx+1} ${hy+5} q3 3 6 0" fill="none" stroke="${A4OL}" stroke-width="1.4" stroke-linecap="round"/>`;
    return d+g; }
  // beetles
  const cx=baby?40:40, cy=baby?72:66, rx=baby?22:23, ry=baby?16:15;
  // legs (curly, adult)
  const legs=baby?[]:adult?[[cx-10,1],[cx,0],[cx+10,-1]]:[[cx-12,1],[cx-2,0],[cx+8,-1]];
  legs.forEach(([x,k])=>{ const p=adult?`M${x} ${cy+6} q${-6+k*2} 10 ${-2} 16 q4 4 ${-3} 6`:`M${x} ${cy+8} q${-5+k} 8 ${-3+k*2} 16`;
    g+=`<path d="${p}" fill="none" stroke="${A4OL}" stroke-width="${adult?6:5}" stroke-linecap="round"/><path d="${p}" fill="none" stroke="${P.leg}" stroke-width="${adult?3.2:2.6}" stroke-linecap="round"/>`; });
  if(P.belly&&!baby) g+=`<path d="M${cx-rx+4} ${cy+6} Q${cx} ${cy+ry+4} ${cx+rx} ${cy+4}" fill="none" stroke="${A4OL}" stroke-width="6" stroke-linecap="round"/><path d="M${cx-rx+4} ${cy+6} Q${cx} ${cy+ry+4} ${cx+rx} ${cy+4}" fill="none" stroke="${P.belly}" stroke-width="3.4" stroke-linecap="round"/>`;
  // head
  const hx=cx+rx+(baby?5:2), hy=cy+(baby?3:-2), hr=baby?11:9.5;
  g+=`<path d="M${hx-2} ${hy-hr+1} q-4 -12 -12 -16 M${hx+3} ${hy-hr+1} q2 -12 9 -15" fill="none" stroke="${A4OL}" stroke-width="2.6" stroke-linecap="round"/><path d="M${hx-2} ${hy-hr+1} q-4 -12 -12 -16 M${hx+3} ${hy-hr+1} q2 -12 9 -15" fill="none" stroke="${P.mossbug||P.leg===P.hd?'#e83a2a':P.leg}" stroke-width="1" stroke-linecap="round"/>`;
  g+=`<path d="M${hx-hr} ${hy} Q${hx-hr} ${hy-hr} ${hx} ${hy-hr} Q${hx+hr*1.1} ${hy-hr} ${hx+hr*1.15} ${hy+1} Q${hx+hr} ${hy+hr*.9} ${hx} ${hy+hr*.9} Q${hx-hr} ${hy+hr*.85} ${hx-hr} ${hy}Z" fill="url(#${H})" ${a4s()}/>`;
  if(!baby){ // beak / horn
    g+=`<path d="M${hx+hr*.8} ${hy-2} Q${hx+hr+10} ${hy-1} ${hx+hr+12} ${hy+6} Q${hx+hr+4} ${hy+4} ${hx+hr*.7} ${hy+5}Z" fill="${P.bk}" ${a4s(1.5)}/>`;
    if(adult) g+=`<path d="M${hx+2} ${hy-hr+1} L${hx+6} ${hy-hr-11} L${hx+9} ${hy-hr+3}Z" fill="${P.bk}" ${a4s(1.4)}/>`; }
  g+=a4eye(hx+1,hy-1.5,baby?4.2:3.2,P.e,st,.6);
  if(st>=1) g+=`<path d="M${hx-3} ${hy-5.4} L${hx+4.5} ${hy-3.4}" stroke="${A4OL}" stroke-width="2" stroke-linecap="round"/>`;
  else g+=`<path d="M${hx+2} ${hy+4} q3 2.6 6 -.6" fill="none" stroke="${A4OL}" stroke-width="1.4" stroke-linecap="round"/>`;
  // shell (adult: two wing cases raised behind)
  if(adult){ const E=(a,dx)=>`<path d="M${cx+4+dx} ${cy-6} Q${cx-18+dx} ${cy-34} ${cx-12+dx} ${cy-44} Q${cx+8+dx} ${cy-30} ${cx+10+dx} ${cy-8}Z" transform="rotate(${a} ${cx+6} ${cy-6})" fill="url(#${B})" ${a4s()}/>`;
    g+=E(-8,-6); }
  g+=`<path d="M${cx-rx} ${cy+5} Q${cx-rx} ${cy-ry} ${cx+2} ${cy-ry} Q${cx+rx+3} ${cy-ry+1} ${cx+rx+2} ${cy+4} Q${cx} ${cy+ry*.62} ${cx-rx} ${cy+5}Z" fill="url(#${B})" ${a4s()}/>`;
  if(!adult) g+=`<path d="M${cx+1} ${cy-ry+.5} Q${cx-2} ${cy-2} ${cx-1} ${cy+ry*.55}" fill="none" stroke="${A4OL}" stroke-width="1.5"/>`;
  if(adult) g+=`<path d="M${cx+2} ${cy-6} Q${cx-16} ${cy-30} ${cx-6} ${cy-40} Q${cx+14} ${cy-28} ${cx+14} ${cy-8}Z" fill="url(#${B})" ${a4s()}/>`;
  // markings
  const spc=adult&&P.spA?P.spA:P.sp;
  if(P.sp){ const pts=adult?[[cx-4,cy-28,3.4],[cx+4,cy-20,3],[cx+8,cy-32,2.4],[cx-12,cy-4,3],[cx+10,cy-6,3]]:[[cx-9,cy-6,3.4],[cx+7,cy-8,3],[cx-2,cy+2,2.6],[cx+14,cy,2.4],[cx-15,cy+1,2.2]];
    pts.forEach(([x,y,r])=>g+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${spc}"/>`); }
  if(P.st){ const sx=adult?[cx-4,cx+2,cx+8]:[cx-12,cx-4,cx+4,cx+12]; sx.forEach(x=>g+=`<path d="M${x} ${cy-ry+2} Q${x-3} ${cy} ${x-1} ${cy+6}" fill="none" stroke="${P.st}" stroke-width="2.6" stroke-linecap="round"/>`); }
  if(P.spike){ const n=adult?5:4; for(let k=0;k<n;k++){ const x=cx-rx+8+k*((rx*2-10)/n), y=cy-ry+Math.abs(k-(n-1)/2)*2.2; g+=`<path d="M${x-3} ${y+2} L${x} ${y-6} L${x+3} ${y+2}Z" fill="${P.sp}" ${a4s(1.2)}/>`; } }
  if(baby) g+=`<path d="M${cx-rx+5} ${cy-4} Q${cx-6} ${cy-ry+3} ${cx+4} ${cy-ry+2}" fill="none" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/>`;
  return d+g; };

// ---------- Varmint family: upright critters with claws up (badger knight, raccoon brave, gas-mask skunk, wandering tanuki) ----------
const A4_VAR={
  garth:   {b:'#6f7f9c',l:'#f2f2f6',m:'#2e3446',tail:'#6f7f9c',ring:null,e:'#e8c43a',kind:'badger'},
  timmeh:  {b:'#a8a296',l:'#f2f0ea',m:'#3a342c',tail:'#a8a296',ring:'#4a4236',e:'#e8c43a',kind:'raccoon'},
  vicks:   {b:'#2e2e36',l:'#f4f4f4',m:'#2e2e36',tail:'#2e2e36',stripe:'#f4f4f4',e:'#e8c43a',kind:'skunk'},
  tanuchan:{b:'#b8642a',l:'#f0d8b4',m:'#4a2a18',tail:'#c87a3a',ring:'#4a2a18',e:'#e8c43a',kind:'tanuki'}};
ART4.varmint=function(sp,st,id){ const P=A4_VAR[sp.id]||{b:sp.col[0],l:sp.col[2],m:shade(sp.col[0],-40),tail:sp.col[0],e:'#e8c43a'};
  const B=id+'b'; let d=`<defs>${a4g(B,P.b)}</defs>`, g=''; const baby=st===0, adult=st===2;
  g+=a4shadow(48,24);
  const cx=baby?46:46, cy=baby?74:68, hx=baby?52:56, hy=baby?52:42, hr=baby?15:12.5;
  // tail
  const big=P.kind==='skunk';
  const tl=big?(baby?`M${cx-10} 82 Q14 84 12 62 Q12 46 24 48 Q20 58 26 66 Q30 76 ${cx-6} 76Z`:`M${cx-12} 78 Q8 80 6 54 Q6 32 22 34 Q16 48 24 58 Q30 70 ${cx-8} 70Z`)
              :(baby?`M${cx-10} 82 Q20 84 18 70 Q18 62 26 64 Q26 74 ${cx-6} 78Z`:`M${cx-12} 78 Q14 80 12 62 Q12 52 22 54 Q22 68 ${cx-8} 72Z`);
  g+=`<path d="${tl}" fill="${P.tail}" ${a4s()}/>`;
  if(P.stripe) g+=`<path d="${baby?'M24 50 Q18 60 22 72':'M20 36 Q10 52 16 70'}" fill="none" stroke="${P.stripe}" stroke-width="${baby?4:5}" stroke-linecap="round"/>`;
  if(P.ring){ const C=id+'t'; d+=`<clipPath id="${C}"><path d="${tl}"/></clipPath>`; g+=`<g clip-path="url(#${C})">${[0,1,2,3].map(k=>`<rect x="0" y="${(baby?60:50)+k*(baby?7:9)}" width="40" height="${baby?3.4:4.4}" fill="${P.ring}" transform="rotate(-25 20 70)"/>`).join('')}</g><path d="${tl}" fill="none" ${a4s()}/>`; }
  // feet
  g+=`<ellipse cx="${cx-6}" cy="90.4" rx="6" ry="3" fill="${shade(P.b,-25)}" ${a4s(1.5)}/><ellipse cx="${cx+8}" cy="90.6" rx="6.4" ry="3" fill="${shade(P.b,-15)}" ${a4s(1.5)}/>`;
  // body
  g+=`<path d="M${cx-14} ${cy+12} Q${cx-18} ${cy-10} ${cx-2} ${cy-16} Q${cx+14} ${cy-18} ${cx+16} ${cy} Q${cx+16} ${cy+18} ${cx+2} ${cy+21} Q${cx-12} ${cy+21} ${cx-14} ${cy+12}Z" fill="url(#${B})" ${a4s()}/>`;
  g+=`<path d="M${cx-2} ${cy-10} Q${cx+12} ${cy-8} ${cx+10} ${cy+10} Q${cx+4} ${cy+19} ${cx-4} ${cy+16} Q${cx-6} ${cy} ${cx-2} ${cy-10}Z" fill="${P.l}" opacity=".95"/>`;
  // adult outfits on the body
  if(adult&&P.kind==='tanuki') g+=`<path d="M${cx-14} ${cy-4} Q${cx} ${cy-14} ${cx+15} ${cy-6} L${cx+15} ${cy+14} Q${cx} ${cy+22} ${cx-13} ${cy+12}Z" fill="#c85a1a" ${a4s(1.6)}/><path d="M${cx-12} ${cy+2} L${cx+15} ${cy+2}" stroke="#2e2e36" stroke-width="3"/>`;
  if(adult&&P.kind==='skunk') g+=`<rect x="${cx-24}" y="${cy-14}" width="10" height="22" rx="4" fill="#5ae04a" ${a4s(1.6)}/><path d="M${cx-19} ${cy-14} Q${cx-10} ${cy-26} ${hx+4} ${hy+12}" fill="none" stroke="#2a2a2a" stroke-width="3"/>`;
  // arm behind
  g+=`<path d="M${cx+8} ${cy-8} Q${cx+22} ${cy-14} ${cx+24} ${cy-22}" fill="none" stroke="${A4OL}" stroke-width="8" stroke-linecap="round"/><path d="M${cx+8} ${cy-8} Q${cx+22} ${cy-14} ${cx+24} ${cy-22}" fill="none" stroke="${shade(P.b,-12)}" stroke-width="4.6" stroke-linecap="round"/>`;
  // weapon / prop in the back hand
  if(adult){ const px=cx+24, py=cy-22;
    if(P.kind==='badger') g+=`<path d="M${px-1} ${py+3} L${px+5} ${py-30} L${px+9} ${py-29} L${px+3} ${py+4}Z" fill="#e6eaf0" ${a4s(1.4)}/><rect x="${px-5}" y="${py+1}" width="13" height="3.4" rx="1.2" fill="#c8a03a" ${a4s(1.2)}/>`;
    if(P.kind==='raccoon') g+=`<path d="M${px+1} ${py+8} L${px+5} ${py-22}" stroke="${A4OL}" stroke-width="4.6" stroke-linecap="round"/><path d="M${px+1} ${py+8} L${px+5} ${py-22}" stroke="#8a5a2a" stroke-width="2.4" stroke-linecap="round"/><path d="M${px+3} ${py-22} Q${px+16} ${py-24} ${px+14} ${py-12} Q${px+8} ${py-16} ${px+4} ${py-14}Z" fill="#d8dce4" ${a4s(1.4)}/>`;
    if(P.kind==='tanuki'){ g+=`<path d="M${px+2} ${py+10} L${px+4} ${py-24}" stroke="${A4OL}" stroke-width="4.6" stroke-linecap="round"/><path d="M${px+2} ${py+10} L${px+4} ${py-24}" stroke="#8a5a2a" stroke-width="2.4"/><path d="M${px+4} ${py-22} q8 0 9 6" fill="none" stroke="${A4OL}" stroke-width="1.4"/><rect x="${px+8}" y="${py-16}" width="9" height="12" rx="3" fill="#f6f2e8" ${a4s(1.4)}/><rect x="${px+10}" y="${py-12}" width="5" height="4" fill="#e8483a"/>`; } }
  // head
  const ex=hx+hr*.08, ey=hy-hr*.06;
  if(P.kind==='raccoon'||P.kind==='tanuki'||P.kind==='skunk'){ [[hx-hr*.7,-1],[hx+hr*.55,1]].forEach(([x])=>g+=`<path d="M${x-4.6} ${hy-hr*.5} L${x} ${hy-hr*1.3} L${x+4.6} ${hy-hr*.6}Z" fill="${P.kind==='tanuki'?P.m:P.b}" ${a4s(1.6)}/>`); }
  else [[hx-hr*.62],[hx+hr*.5]].forEach(([x])=>g+=`<ellipse cx="${x}" cy="${hy-hr*.82}" rx="4" ry="3.6" fill="${P.b}" ${a4s(1.5)}/>`);
  g+=`<path d="M${hx-hr} ${hy} Q${hx-hr} ${hy-hr} ${hx} ${hy-hr} Q${hx+hr*.9} ${hy-hr} ${hx+hr} ${hy-hr*.2} L${hx+hr*1.55} ${hy+hr*.25} Q${hx+hr*1.55} ${hy+hr*.6} ${hx+hr*1.2} ${hy+hr*.65} Q${hx+hr*.4} ${hy+hr} ${hx-hr*.2} ${hy+hr*.9} Q${hx-hr} ${hy+hr*.7} ${hx-hr} ${hy}Z" fill="url(#${B})" ${a4s()}/>`;
  // face markings
  if(P.kind==='badger') g+=`<path d="M${hx-1} ${hy-hr+.5} Q${hx+3} ${hy-2} ${hx+hr*1.45} ${hy+hr*.2} L${hx+hr*1.2} ${hy+hr*.6} Q${hx+2} ${hy+4} ${hx-5} ${hy-hr+1.5}Z" fill="${P.l}"/><path d="M${hx-hr+2} ${hy-2} Q${hx-2} ${hy-6} ${hx+4} ${hy-1} Q${hx-2} ${hy+4} ${hx-hr+3} ${hy+3}Z" fill="${P.m}"/>`;
  else { g+=`<path d="M${hx-hr+2} ${hy-1} Q${hx} ${hy-7} ${hx+hr*.95} ${hy-3} Q${hx+hr} ${hy+3} ${hx} ${hy+2} Q${hx-hr+3} ${hy+4} ${hx-hr+2} ${hy-1}Z" fill="${P.m}"/>`;
    g+=`<path d="M${hx+hr*.1} ${hy+3} Q${hx+hr*1.1} ${hy+1} ${hx+hr*1.5} ${hy+hr*.3} Q${hx+hr*1.2} ${hy+hr*.75} ${hx+hr*.2} ${hy+hr*.85}Z" fill="${P.l}"/>`;
    if(P.kind==='skunk') g+=`<path d="M${hx-1} ${hy-hr+.5} L${hx+3} ${hy-5}" stroke="${P.l}" stroke-width="3.2" stroke-linecap="round"/>`; }
  g+=`<ellipse cx="${hx+hr*1.5}" cy="${hy+hr*.25}" rx="2.4" ry="1.9" fill="#1e1612"/>`;
  // mouth: teen/adult snarl
  if(st>=1) g+=`<path d="M${hx+hr*.5} ${hy+hr*.55} L${hx+hr*1.3} ${hy+hr*.5} Q${hx+hr*.9} ${hy+hr*.95} ${hx+hr*.5} ${hy+hr*.55}Z" fill="#7a1e1e" ${a4s(1.1)}/><path d="M${hx+hr*.7} ${hy+hr*.54} l1 2.6 l1 -2.6 M${hx+hr*1.05} ${hy+hr*.52} l1 2.4 l1 -2.4" fill="#fff" ${a4s(.6)}/>`;
  else g+=`<path d="M${hx+hr*.7} ${hy+hr*.6} q2 2 4 0" fill="none" stroke="${A4OL}" stroke-width="1.3" stroke-linecap="round"/>`;
  // eyes
  const er=baby?4:3.1;
  if(!(adult&&P.kind==='skunk')){ g+=a4eye(ex-3,ey,er,P.e,st,.5)+a4eye(ex+hr*.55,ey-.4,er*.9,P.e,st,.5);
    if(st>=1) g+=`<path d="M${ex-3-er} ${ey-er*.8} L${ex-3+er} ${ey-er*.2}" stroke="${A4OL}" stroke-width="1.9" stroke-linecap="round"/><path d="M${ex+hr*.55-er} ${ey-er*.3} L${ex+hr*.55+er} ${ey-er*.9}" stroke="${A4OL}" stroke-width="1.9" stroke-linecap="round"/>`; }
  // adult headgear
  if(adult){
    if(P.kind==='skunk') g+=`<ellipse cx="${ex+3}" cy="${ey}" rx="9" ry="6" fill="#3a3a3a" ${a4s(1.5)}/><circle cx="${ex-1}" cy="${ey}" r="3.2" fill="#5ae04a" ${a4s(1.2)}/><circle cx="${ex+7}" cy="${ey-.4}" r="3" fill="#5ae04a" ${a4s(1.2)}/><circle cx="${hx+hr*1.1}" cy="${hy+hr*.5}" r="4.4" fill="#4a4a4a" ${a4s(1.4)}/>`;
    if(P.kind==='raccoon'){ for(let k=0;k<7;k++){ const a=-2.7+k*.32; g+=`<path d="M${hx+Math.cos(a)*hr*.8} ${hy+Math.sin(a)*hr*.8} L${hx+Math.cos(a)*(hr+12)} ${hy+Math.sin(a)*(hr+12)} L${hx+Math.cos(a+.12)*hr*.85} ${hy+Math.sin(a+.12)*hr*.85}Z" fill="${k%2?'#e8dcc0':'#c8a060'}" ${a4s(1.2)}/>`; } g+=`<path d="M${hx-hr} ${hy-hr*.45} Q${hx} ${hy-hr*.9} ${hx+hr*.95} ${hy-hr*.5}" fill="none" stroke="${A4OL}" stroke-width="5" stroke-linecap="round"/><path d="M${hx-hr} ${hy-hr*.45} Q${hx} ${hy-hr*.9} ${hx+hr*.95} ${hy-hr*.5}" fill="none" stroke="#c8402a" stroke-width="3" stroke-linecap="round"/>`; }
    if(P.kind==='tanuki') g+=`<path d="M${hx-hr-8} ${hy-hr*.5} Q${hx} ${hy-hr*1.9} ${hx+hr+8} ${hy-hr*.55} Q${hx} ${hy-hr*.95} ${hx-hr-8} ${hy-hr*.5}Z" fill="#e8c86a" ${a4s(1.5)}/>`;
    if(P.kind==='badger') g+=`<path d="M${cx-18} ${cy-10} L${cx-4} ${cy-12} L${cx-4} ${cy+4} Q${cx-11} ${cy+14} ${cx-18} ${cy+4}Z" fill="#c8302a" ${a4s(1.6)}/><path d="M${cx-11} ${cy-11} L${cx-11} ${cy+9} M${cx-17} ${cy-3} L${cx-5} ${cy-3}" stroke="#e8e8ee" stroke-width="2.4"/>`; }
  // front arm with claws
  const ax=cx+6, ay=cy-6, tx=hx+hr*.9, ty=hy+hr*1.7;
  g+=`<path d="M${ax} ${ay} Q${ax+8} ${ay+2} ${tx} ${ty}" fill="none" stroke="${A4OL}" stroke-width="9" stroke-linecap="round"/><path d="M${ax} ${ay} Q${ax+8} ${ay+2} ${tx} ${ty}" fill="none" stroke="${P.b}" stroke-width="5.6" stroke-linecap="round"/>`;
  g+=`<path d="M${tx+2} ${ty-2} l4 -1.4 M${tx+2.4} ${ty} l4.4 0 M${tx+2} ${ty+2} l4 1.4" stroke="${A4OL}" stroke-width="1.6" stroke-linecap="round"/><circle cx="${tx}" cy="${ty}" r="2.4" fill="#e88aa8"/>`;
  return d+g; };

// ---------- Squirrel family: fluffy kit -> long-eared bunny-squirrel in a bandana -> scrappy fighter with a vest ----------
const A4_SQ={
  nutzap:   {b:'#efe8cc',l:'#ffffff',t1:'#efe8cc',t2:'#5a9ad8',ban:'#d83a2a',e:'#e8c43a'},
  acorvolt: {b:'#f2c42a',l:'#fff6d6',t1:'#2b2216',t2:'#f2c42a',ban:'#3fbf4a',e:'#3fbf4a'},
  bristlet: {b:'#b8743a',l:'#fff2e0',t1:'#f6ead0',t2:'#b8743a',ban:'#3ab8d8',e:'#3ab8d8'},
  cloudtuft:{b:'#7a8ad0',l:'#f6ecc0',t1:'#f2d04a',t2:'#7a8ad0',ban:'#f2b83a',e:'#3a2a1a'}};
ART4.squirrel=function(sp,st,id){ const P=A4_SQ[sp.id]||{b:sp.col[0],l:sp.col[2],t1:sp.col[2],t2:sp.col[1],ban:sp.col[1],e:'#3a2a1a'};
  const B=id+'b'; let d=`<defs>${a4g(B,P.b)}</defs>`, g=''; const baby=st===0, adult=st===2;
  g+=a4shadow(46,24);
  const cx=baby?48:48, cy=baby?76:70, hx=baby?54:58, hy=baby?54:42, hr=baby?14:11;
  // big banded tail curling up behind
  const tl=baby?`M${cx-8} 84 Q18 86 16 68 Q14 52 28 50 Q36 52 32 60 Q24 62 26 72 Q30 80 ${cx-4} 78Z`:`M${cx-10} 82 Q10 84 8 60 Q8 36 26 34 Q38 36 34 46 Q22 46 22 60 Q24 74 ${cx-6} 74Z`;
  const C=id+'t'; d+=`<clipPath id="${C}"><path d="${tl}"/></clipPath>`;
  g+=`<path d="${tl}" fill="${P.t1}"/><g clip-path="url(#${C})">${[0,1,2,3,4].map(k=>`<rect x="-10" y="${(baby?46:30)+k*(baby?9:11)}" width="70" height="${baby?4.6:5.6}" fill="${P.t2}" transform="rotate(-18 20 60)"/>`).join('')}</g><path d="${tl}" fill="none" ${a4s()}/>`;
  // feet
  g+=`<path d="M${cx-4} 91 q8 -1 12 -1 q-1 -4 -7 -4 q-5 0 -5 5Z" fill="${shade(P.b,-12)}" ${a4s(1.5)}/><path d="M${cx+6} 91.4 q9 -.6 13 -1 q-1 -4.4 -7.4 -4.4 q-5.6 0 -5.6 5.4Z" fill="${P.b}" ${a4s(1.5)}/>`;
  // body (pear, upright)
  g+=`<path d="M${cx-12} ${cy+12} Q${cx-16} ${cy-6} ${cx} ${cy-14} Q${cx+14} ${cy-14} ${cx+14} ${cy+2} Q${cx+15} ${cy+17} ${cx+2} ${cy+19} Q${cx-10} ${cy+19} ${cx-12} ${cy+12}Z" fill="url(#${B})" ${a4s()}/>`;
  g+=`<path d="M${cx} ${cy-8} Q${cx+11} ${cy-6} ${cx+10} ${cy+6} Q${cx+8} ${cy+16} ${cx+1} ${cy+16} Q${cx-5} ${cy+6} ${cx} ${cy-8}Z" fill="${P.l}"/>`;
  if(adult){ g+=`<path d="M${cx-13} ${cy-4} Q${cx-4} ${cy-13} ${cx+6} ${cy-12} L${cx+4} ${cy+6} Q${cx-6} ${cy+10} ${cx-12} ${cy+8}Z" fill="#6a4a2a" ${a4s(1.5)}/><path d="M${cx-12} ${cy+8} Q${cx} ${cy+12} ${cx+14} ${cy+6}" fill="none" stroke="${A4OL}" stroke-width="5" stroke-linecap="round"/><path d="M${cx-12} ${cy+8} Q${cx} ${cy+12} ${cx+14} ${cy+6}" fill="none" stroke="#8a6a3a" stroke-width="3" stroke-linecap="round"/><rect x="${cx-9}" y="${cy+6}" width="6" height="7" rx="1.4" fill="#a8743a" ${a4s(1.2)}/>`; }
  // back arm (fist up)
  if(!baby) g+=`<path d="M${cx+6} ${cy-8} Q${cx+18} ${cy-10} ${cx+22} ${cy-16}" fill="none" stroke="${A4OL}" stroke-width="7.4" stroke-linecap="round"/><path d="M${cx+6} ${cy-8} Q${cx+18} ${cy-10} ${cx+22} ${cy-16}" fill="none" stroke="${shade(P.b,-12)}" stroke-width="4.4" stroke-linecap="round"/><circle cx="${cx+23}" cy="${cy-17}" r="3.6" fill="${shade(P.b,-12)}" ${a4s(1.4)}/>`;
  // ears (long bunny ears from teen on)
  const el=baby?8:16, ew=baby?5:5;
  [[hx-hr*.45,-16],[hx+hr*.35,8]].forEach(([x,a],k)=>{ g+=`<g transform="rotate(${a} ${x} ${hy-hr*.6})"><ellipse cx="${x}" cy="${hy-hr*.6-el}" rx="${ew}" ry="${el+2}" fill="${k?P.b:shade(P.b,-10)}" ${a4s(1.6)}/><ellipse cx="${x}" cy="${hy-hr*.6-el+1}" rx="${ew*.5}" ry="${el*.8}" fill="#f0b8b8" opacity=".8"/></g>`; });
  // bandana
  if(st>=1){ g+=`<path d="M${hx-hr*.9} ${hy+hr*.75} Q${hx} ${hy+hr*1.15} ${hx+hr*.9} ${hy+hr*.7} L${hx+hr*.2} ${hy+hr*1.6}Z" fill="${P.ban}" ${a4s(1.4)}/>`; }
  else g+=`<path d="M${hx-hr*.7} ${hy+hr*.8} Q${hx} ${hy+hr*1.1} ${hx+hr*.7} ${hy+hr*.75} L${hx+hr*.1} ${hy+hr*1.35}Z" fill="${P.ban}" ${a4s(1.3)}/>`;
  // head
  g+=`<path d="M${hx-hr} ${hy} Q${hx-hr} ${hy-hr} ${hx} ${hy-hr} Q${hx+hr} ${hy-hr} ${hx+hr*1.15} ${hy} Q${hx+hr*1.4} ${hy+hr*.45} ${hx+hr*1.1} ${hy+hr*.7} Q${hx+hr*.3} ${hy+hr*1.05} ${hx-hr*.3} ${hy+hr*.92} Q${hx-hr} ${hy+hr*.7} ${hx-hr} ${hy}Z" fill="url(#${B})" ${a4s()}/>`;
  g+=`<ellipse cx="${hx+hr*.75}" cy="${hy+hr*.42}" rx="${hr*.45}" ry="${hr*.32}" fill="${P.l}"/><ellipse cx="${hx+hr*1.12}" cy="${hy+hr*.28}" rx="2" ry="1.6" fill="#e07a8a" ${a4s(1)}/>`;
  g+=`<path d="M${hx+hr*.6} ${hy+hr*.6} q2 2.4 4.4 0" fill="none" stroke="${A4OL}" stroke-width="1.3" stroke-linecap="round"/><rect x="${hx+hr*.72}" y="${hy+hr*.62}" width="2.6" height="2.2" rx=".5" fill="#fff" ${a4s(.6)}/>`;
  if(adult) g+=`<path d="M${hx-hr*.95} ${hy-hr*.45} Q${hx} ${hy-hr*.85} ${hx+hr*.95} ${hy-hr*.45}" fill="none" stroke="${A4OL}" stroke-width="4.4" stroke-linecap="round"/><path d="M${hx-hr*.95} ${hy-hr*.45} Q${hx} ${hy-hr*.85} ${hx+hr*.95} ${hy-hr*.45}" fill="none" stroke="${P.ban}" stroke-width="2.4" stroke-linecap="round"/>`;
  const er=baby?4.4:3.3; g+=a4eye(hx-hr*.2,hy-hr*.12,er,P.e,st,.5)+a4eye(hx+hr*.5,hy-hr*.16,er*.9,P.e,st,.5);
  if(st>=1) g+=`<path d="M${hx-hr*.2-er} ${hy-hr*.12-er*.85} L${hx-hr*.2+er} ${hy-hr*.12-er*.35}" stroke="${A4OL}" stroke-width="1.8" stroke-linecap="round"/>`;
  // front arm
  const fx=cx+12, fy=cy-2; g+=`<path d="M${cx+2} ${cy-8} Q${cx+8} ${cy+2} ${fx} ${fy}" fill="none" stroke="${A4OL}" stroke-width="8" stroke-linecap="round"/><path d="M${cx+2} ${cy-8} Q${cx+8} ${cy+2} ${fx} ${fy}" fill="none" stroke="${P.b}" stroke-width="5" stroke-linecap="round"/><circle cx="${fx+1}" cy="${fy-1}" r="${baby?3.4:4}" fill="${P.b}" ${a4s(1.4)}/>`;
  return d+g; };

// ---------- Wing family: round chick -> strutting bird -> eagle with wings raised ----------
const A4_WG={
  zephyra:  {b:'#f4e04a',w:'#5ab83a',w2:'#f4e04a',bk:'#f29a2a',l:'#fff6c0',e:'#3a2a1a'},
  gustling: {b:'#5c5c66',w:'#d8a83a',w2:'#3a3a44',bk:'#f2c43a',l:'#8a8a94',e:'#e8a030'},
  featherby:{b:'#3ae0b0',w:'#d84ad8',w2:'#4ab8f0',bk:'#f2c43a',l:'#b8f8e4',e:'#3a2a1a'},
  squallix: {b:'#f6f6fa',w:'#2a6ad8',w2:'#f6f6fa',bk:'#f29a2a',l:'#e85a3a',e:'#3a2a1a'}};
ART4.wing=function(sp,st,id){ const P=A4_WG[sp.id]||{b:sp.col[0],w:sp.col[1],w2:sp.col[0],bk:'#f29a2a',l:sp.col[2],e:'#3a2a1a'};
  const B=id+'b'; let d=`<defs>${a4g(B,P.b)}</defs>`, g=''; const baby=st===0, adult=st===2;
  g+=a4shadow(48,22);
  const legs=(x,top)=>`<path d="M${x} ${top} L${x} 89 M${x} 89 l-4 2 M${x} 89 l4 2 M${x} 89 l1 3" fill="none" stroke="${A4OL}" stroke-width="4" stroke-linecap="round"/><path d="M${x} ${top} L${x} 89 M${x} 89 l-4 2 M${x} 89 l4 2" fill="none" stroke="${P.bk}" stroke-width="2" stroke-linecap="round"/>`;
  if(baby){ g+=legs(44,82)+legs(52,82);
    g+=`<ellipse cx="48" cy="72" rx="15" ry="14" fill="url(#${B})" ${a4s()}/><path d="M36 70 Q30 76 38 80 Q42 76 40 70Z" fill="${shade(P.b,-12)}" ${a4s(1.4)}/>`;
    g+=`<path d="M58 68 L67 70 L58 74Z" fill="${P.bk}" ${a4s(1.4)}/><path d="M46 58 q2 -5 5 -1" fill="none" stroke="${A4OL}" stroke-width="1.6"/>`;
    g+=a4eye(50,66,4.4,P.e,0,.5)+a4eye(57,65.6,3.6,P.e,0,.5); return d+g; }
  if(!adult){ // teen: strutting bird
    g+=`<path d="M30 66 Q14 56 12 42 Q22 50 30 52 Q22 44 22 34 Q32 48 38 58Z" fill="${P.w}" ${a4s(1.6)}/>`;
    g+=legs(44,76)+legs(52,76);
    g+=`<path d="M28 66 Q30 52 46 52 Q62 54 62 66 Q60 80 46 80 Q32 80 28 66Z" fill="url(#${B})" ${a4s()}/>`;
    g+=`<path d="M34 62 Q46 58 52 66 Q44 74 34 70Z" fill="${P.w}" ${a4s(1.5)}/>`;
    g+=`<path d="M52 56 Q54 44 58 38 L66 40 Q66 50 60 60Z" fill="url(#${B})" ${a4s()}/>`;
    g+=`<circle cx="62" cy="36" r="8" fill="url(#${B})" ${a4s()}/><path d="M57 29 q-2 -7 3 -8 q0 5 3 7 q2 -6 6 -5 q-3 4 -3 7" fill="${P.w}" ${a4s(1.3)}/>`;
    g+=`<path d="M69 34 L77 37 L69 40Z" fill="${P.bk}" ${a4s(1.3)}/>`+a4eye(64,34,3,P.e,1,.5);
    return d+g; }
  // adult eagle: wings raised in a V
  const wing=(dx,flip,c1,c2)=>`<g transform="translate(${dx} 0)"><path d="M48 56 Q${flip?62:34} 40 ${flip?74:22} 14 Q${flip?72:24} 22 ${flip?80:16} 22 Q${flip?74:22} 28 ${flip?82:14} 32 Q${flip?72:24} 36 ${flip?78:18} 42 Q${flip?66:30} 46 ${flip?70:26} 52 Q${flip?58:38} 54 48 62Z" fill="${c1}" ${a4s(1.6)}/><path d="M48 58 Q${flip?60:36} 48 ${flip?70:26} 40 M48 60 Q${flip?60:36} 54 ${flip?68:28} 50" fill="none" stroke="${c2}" stroke-width="2.6" stroke-linecap="round"/></g>`;
  g+=wing(-6,false,P.w,P.w2)+wing(6,true,shade(P.w,-12),P.w2);
  g+=`<path d="M40 80 L32 90 L40 88 L44 92 L48 84Z" fill="${P.w2===P.b?shade(P.w,-15):P.w2}" ${a4s(1.5)}/>`;
  g+=legs(44,80)+legs(54,80);
  g+=`<path d="M38 76 Q34 58 46 52 Q58 50 60 64 Q60 82 48 84 Q40 84 38 76Z" fill="url(#${B})" ${a4s()}/>`;
  g+=`<path d="M44 62 Q52 60 56 68 Q52 80 46 80 Q42 72 44 62Z" fill="${P.l}" opacity=".9"/>`;
  // head with crest
  g+=`<path d="M46 40 q-8 -6 -6 -14 q4 6 8 6 q-2 -8 4 -12 q1 8 5 10 q2 -6 8 -6 q-3 5 -2 10Z" fill="${P.w}" ${a4s(1.4)}/>`;
  g+=`<path d="M44 48 Q42 34 54 33 Q64 34 64 44 Q62 52 52 54 Q46 54 44 48Z" fill="url(#${B})" ${a4s()}/>`;
  g+=`<path d="M62 39 Q72 38 72 46 Q70 49 66 46 L62 47Z" fill="${P.bk}" ${a4s(1.4)}/>`;
  g+=a4eye(57,41.6,3.1,P.e,2,.5)+`<path d="M53 37.6 L60.4 39.6" stroke="${A4OL}" stroke-width="2.2" stroke-linecap="round"/>`;
  return d+g; };

// ---------- Shell family: big-eyed hatchling -> armored turtle -> stego-turtle with back plates and a spiked tail ----------
const A4_SH={
  shellby: {b:'#5ad04a',sh:'#3fbf4a',pl:'#c8f0a8',e:'#3a2a1a'},
  tidepip: {b:'#8ac83a',sh:'#e8b52a',pl:'#f6e6a0',e:'#3a2a1a'},
  coraldon:{b:'#5aa84a',sh:'#d83a2a',pl:'#e8e0c0',e:'#3a2a1a'},
  brinemaw:{b:'#b8a8dc',sh:'#2a6ab8',pl:'#e8e4f4',e:'#3a2a1a'}};
ART4.shell=function(sp,st,id){ const P=A4_SH[sp.id]||{b:sp.col[1],sh:sp.col[0],pl:sp.col[2],e:'#3a2a1a'};
  const B=id+'b', S=id+'s'; let d=`<defs>${a4g(B,P.b)}${a4g(S,P.sh,30,-30)}</defs>`, g=''; const baby=st===0, adult=st===2;
  g+=a4shadow(48,30);
  const cx=baby?44:42, cy=baby?74:68, rx=baby?18:24, ry=baby?13:17;
  // tail
  if(adult){ g+=`<path d="M${cx-rx+4} ${cy+6} Q${cx-rx-12} ${cy+8} ${cx-rx-16} ${cy-2} Q${cx-rx-6} ${cy+2} ${cx-rx+4} ${cy-2}Z" fill="url(#${B})" ${a4s()}/>`;
    [[cx-rx-14,cy-1],[cx-rx-8,cy+1]].forEach(([x,y])=>g+=`<path d="M${x} ${y} l-3 -7 l5 4Z" fill="${P.pl}" ${a4s(1.2)}/>`); }
  else g+=`<path d="M${cx-rx+3} ${cy+6} L${cx-rx-6} ${cy+9} L${cx-rx+4} ${cy+10}Z" fill="url(#${B})" ${a4s(1.4)}/>`;
  // legs
  const leg=(x,c)=>`<path d="M${x-4.6} ${cy+4} L${x-5} 90 L${x+5.4} 90 L${x+5} ${cy+4}Z" fill="${c}" ${a4s(1.6)}/><ellipse cx="${x}" cy="90" rx="6.6" ry="2.8" fill="${c}" ${a4s(1.4)}/>`;
  g+=leg(cx-rx*.5+3,shade(P.b,-18))+leg(cx+rx*.55+2,shade(P.b,-18));
  // adult back plates
  if(adult){ const n=5; for(let k=0;k<n;k++){ const x=cx-rx+10+k*((rx*2-16)/(n-1)), h=10+(k===1||k===2||k===3?6:0); g+=`<path d="M${x-5} ${cy-ry+5} L${x} ${cy-ry-h} L${x+5} ${cy-ry+5}Z" fill="${P.pl}" ${a4s(1.4)}/>`; } }
  // shell dome
  g+=`<path d="M${cx-rx} ${cy+6} Q${cx-rx} ${cy-ry} ${cx} ${cy-ry} Q${cx+rx} ${cy-ry} ${cx+rx} ${cy+6}Z" fill="url(#${S})" ${a4s()}/>`;
  g+=`<path d="M${cx-rx-1} ${cy+6} L${cx+rx+1} ${cy+6}" stroke="${A4OL}" stroke-width="5" stroke-linecap="round"/><path d="M${cx-rx-1} ${cy+6} L${cx+rx+1} ${cy+6}" stroke="${P.pl}" stroke-width="2.8" stroke-linecap="round"/>`;
  if(!baby){ g+=`<path d="M${cx-rx*.5} ${cy+5} L${cx-rx*.3} ${cy-ry*.55} L${cx+rx*.3} ${cy-ry*.55} L${cx+rx*.5} ${cy+5} M${cx-rx*.3} ${cy-ry*.55} L${cx-rx*.6} ${cy-ry*.75} M${cx+rx*.3} ${cy-ry*.55} L${cx+rx*.6} ${cy-ry*.75}" fill="none" stroke="${shade(P.sh,-30)}" stroke-width="1.6"/>`;
    if(!adult) for(let k=0;k<3;k++){ const x=cx-rx*.45+k*rx*.45; g+=`<path d="M${x-3} ${cy-ry+2+Math.abs(k-1)*3} L${x} ${cy-ry-5+Math.abs(k-1)*3} L${x+3} ${cy-ry+2+Math.abs(k-1)*3}Z" fill="${P.pl}" ${a4s(1.2)}/>`; } }
  g+=`<path d="M${cx-rx*.6} ${cy-ry*.6} Q${cx-rx*.2} ${cy-ry*.95} ${cx+rx*.2} ${cy-ry*.85}" fill="none" stroke="#fff" stroke-width="2.4" opacity=".45" stroke-linecap="round"/>`;
  g+=leg(cx-rx*.62,P.b)+leg(cx+rx*.42,P.b);
  // neck + head
  const hx=cx+rx+(baby?6:8), hy=cy-(baby?8:12), hr=baby?11:9;
  g+=`<path d="M${cx+rx-6} ${cy+4} Q${hx-8} ${hy+10} ${hx-6} ${hy+2} L${hx+4} ${hy+6} Q${hx-2} ${cy+4} ${cx+rx+2} ${cy+6}Z" fill="url(#${B})" ${a4s()}/>`;
  g+=`<path d="M${hx-hr} ${hy} Q${hx-hr} ${hy-hr} ${hx} ${hy-hr} Q${hx+hr*1.2} ${hy-hr} ${hx+hr*1.3} ${hy} Q${hx+hr*1.2} ${hy+hr*.8} ${hx} ${hy+hr*.8} Q${hx-hr} ${hy+hr*.8} ${hx-hr} ${hy}Z" fill="url(#${B})" ${a4s()}/>`;
  if(adult) g+=`<path d="M${hx-4} ${hy-hr+1} l-4 -6 l7 3Z M${hx+2} ${hy-hr} l0 -7 l4 6Z" fill="${P.pl}" ${a4s(1.1)}/>`;
  g+=`<path d="M${hx+hr*.4} ${hy+hr*.4} Q${hx+hr} ${hy+hr*.5} ${hx+hr*1.2} ${hy+hr*.2}" fill="none" stroke="${A4OL}" stroke-width="1.4" stroke-linecap="round"/>`;
  const er=baby?4.6:3.3; g+=a4eye(hx+hr*.1,hy-hr*.2,er,P.e,st,.5)+a4eye(hx+hr*.75,hy-hr*.25,er*.85,P.e,st,.5);
  if(st>=1) g+=`<path d="M${hx+hr*.1-er} ${hy-hr*.2-er*.85} L${hx+hr*.1+er} ${hy-hr*.2-er*.3}" stroke="${A4OL}" stroke-width="1.9" stroke-linecap="round"/>`;
  return d+g; };

// ---------- Crystalloids: Sphyro (shark that stands up) and Crystalwulf (purple beast covered in gold crystals) ----------
ART4.crystalloid=function(sp,st,id){ const baby=st===0, adult=st===2;
  if(sp.id==='sphyro'){ const b='#3a8ab8', l='#f2f8ff', B=id+'b'; let d=`<defs>${a4g(B,b)}</defs>`, g=a4shadow(48,22);
    if(baby){ g+=`<path d="M26 74 L16 66 L18 80Z" fill="${b}" ${a4s(1.5)}/><path d="M24 74 Q30 62 48 62 Q66 64 70 74 Q64 84 46 84 Q30 84 24 74Z" fill="url(#${B})" ${a4s()}/><path d="M44 62 L48 52 L54 63Z" fill="${b}" ${a4s(1.4)}/><path d="M40 78 Q54 84 68 76 Q56 80 40 78Z" fill="${l}" ${a4s(1.2)}/><path d="M42 80 l-4 8 l8 -6Z" fill="${b}" ${a4s(1.3)}/><path d="M58 78 L68 75" stroke="${A4OL}" stroke-width="1.4"/>`+a4eye(58,69,3.6,'#3a2a1a',0,.5); return d+g; }
    const s=adult?1.12:1;
    g+=`<g transform="translate(48 92) scale(${s}) translate(-48 -92)">`;
    g+=`<path d="M40 76 Q28 80 22 90 Q32 88 38 84Z" fill="${b}" ${a4s(1.5)}/>`;
    g+=a4leg(42,74,92,8,shade(b,-15))+a4leg(54,74,92,8,b);
    g+=`<path d="M34 78 Q30 54 44 42 Q58 34 66 46 Q70 60 62 78 Q50 84 34 78Z" fill="url(#${B})" ${a4s()}/>`;
    g+=`<path d="M46 76 Q46 56 58 48 Q64 58 60 76Z" fill="${l}"/>`;
    g+=`<path d="M38 50 L30 34 L46 44Z" fill="${b}" ${a4s(1.5)}/>`;
    // shark head: long snout with toothy grin
    g+=`<path d="M46 46 Q44 28 58 26 Q72 26 80 36 Q78 44 66 46 Q56 48 46 46Z" fill="url(#${B})" ${a4s()}/><path d="M60 40 Q70 42 78 38 Q72 46 60 44Z" fill="${l}" ${a4s(1.2)}/>`;
    for(let k=0;k<4;k++) g+=`<path d="M${62+k*4} ${40.6+k*-.3} l1.4 3 l1.4 -3Z" fill="#fff" ${a4s(.7)}/>`;
    g+=`<path d="M50 38 l2 3 M53 37 l2 3 M56 36 l2 3" stroke="${shade(b,-30)}" stroke-width="1.2"/>`+a4eye(64,32,3,'#e8c43a',st,.4)+`<path d="M60 28.6 L67.6 30.6" stroke="${A4OL}" stroke-width="2" stroke-linecap="round"/>`;
    // arms
    g+=`<path d="M58 52 Q70 56 72 66" fill="none" stroke="${A4OL}" stroke-width="8.6" stroke-linecap="round"/><path d="M58 52 Q70 56 72 66" fill="none" stroke="${b}" stroke-width="5.6" stroke-linecap="round"/><circle cx="72" cy="67" r="4" fill="${b}" ${a4s(1.4)}/>`;
    if(adult) g+=`<path d="M40 60 L56 56" stroke="${A4OL}" stroke-width="1.2" opacity=".5"/><rect x="36" y="64" width="26" height="4" rx="2" fill="#2a3a4a" ${a4s(1.2)}/>`;
    return d+g+'</g>'; }
  if(sp.id==='crystalwulf'){ const b='#6a4a9a', cr='#f2b83a', B=id+'b', C=id+'c'; let d=`<defs>${a4g(B,b)}${a4g(C,cr,30,-25)}</defs>`, g=a4shadow(48,28);
    const big=baby?0:1; const hx=baby?62:70, hy=baby?56:46, hr=baby?12:11;
    g+=`<path d="${baby?'M30 76 Q20 72 22 62':'M26 68 Q10 64 14 48'}" fill="none" stroke="${A4OL}" stroke-width="8" stroke-linecap="round"/><path d="${baby?'M30 76 Q20 72 22 62':'M26 68 Q10 64 14 48'}" fill="none" stroke="${b}" stroke-width="4.6" stroke-linecap="round"/>`;
    if(!baby) g+=a4hind(36,60,8,shade(b,-15))+a4leg(64,64,91,8,shade(b,-15));
    g+=`<path d="${baby?'M28 78 Q26 64 40 62 Q56 60 62 66 Q66 80 54 84 Q36 86 28 78Z':'M22 70 Q18 52 34 50 Q50 46 62 44 Q76 46 76 60 Q74 76 60 78 Q38 80 22 70Z'}" fill="url(#${B})" ${a4s()}/>`;
    if(baby) g+=a4leg(36,78,92,7,b)+a4leg(54,78,92,7,b); else g+=a4hind(30,58,9,b)+a4leg(60,66,92,9,b);
    // crystals along the back
    const n=baby?3:6; for(let k=0;k<n;k++){ const x=(baby?36:28)+k*(baby?8:8.5), y=(baby?62:50)-Math.sin(k/(n-1)*3.1)*3, h=(baby?8:14)+(k%2)*4*big;
      g+=`<path d="M${x-4} ${y+3} L${x-1} ${y-h} L${x+5} ${y+2}Z" fill="url(#${C})" ${a4s(1.4)}/><path d="M${x-1} ${y-h+3} L${x} ${y+1}" stroke="#fff3c0" stroke-width="1.2" opacity=".8"/>`; }
    if(adult) g+=`<path d="M56 66 L64 76 L70 66Z M64 60 L74 68 L76 58Z" fill="url(#${C})" ${a4s(1.3)}/>`;
    // head
    g+=`<path d="M${hx-hr*.6} ${hy-hr*.6} L${hx-hr*.2} ${hy-hr*1.9} L${hx+hr*.3} ${hy-hr*.7}Z" fill="url(#${C})" ${a4s(1.4)}/>`;
    g+=`<path d="M${hx-hr} ${hy} Q${hx-hr} ${hy-hr} ${hx} ${hy-hr} Q${hx+hr} ${hy-hr} ${hx+hr*1.1} ${hy-hr*.2} L${hx+hr*1.8} ${hy+hr*.2} Q${hx+hr*1.8} ${hy+hr*.7} ${hx+hr*1.2} ${hy+hr*.75} Q${hx} ${hy+hr*1.1} ${hx-hr} ${hy}Z" fill="url(#${B})" ${a4s()}/>`;
    g+=`<path d="M${hx+hr*.6} ${hy+hr*.5} L${hx+hr*1.6} ${hy+hr*.42}" stroke="${A4OL}" stroke-width="1.3"/><ellipse cx="${hx+hr*1.75}" cy="${hy+hr*.18}" rx="1.8" ry="1.4" fill="#1e1612"/>`;
    if(!baby) g+=`<path d="M${hx+hr*.8} ${hy+hr*.46} l1 3 l1.2 -3 M${hx+hr*1.2} ${hy+hr*.44} l1 3 l1.2 -3" fill="#fff" ${a4s(.6)}/>`;
    g+=a4eye(hx+hr*.3,hy-hr*.2,baby?4.2:3.1,'#e8c43a',st,.5); if(st>=1) g+=`<path d="M${hx+hr*.3-3.4} ${hy-hr*.2-3} L${hx+hr*.3+3.6} ${hy-hr*.2-1}" stroke="${A4OL}" stroke-width="2" stroke-linecap="round"/>`;
    return d+g; }
  if(sp.id==='electyra'&&st>=1){ const b='#f2a02a', fin='#3aa8f0', B=id+'b'; let d=`<defs>${a4g(B,b,30,-20)}</defs>`, g=a4shadow(48,18); const adult=st===2;
    // curled seahorse tail
    g+=`<path d="M44 66 Q34 80 42 88 Q52 92 54 84 Q54 78 48 80" fill="none" stroke="${A4OL}" stroke-width="10" stroke-linecap="round"/><path d="M44 66 Q34 80 42 88 Q52 92 54 84 Q54 78 48 80" fill="none" stroke="${b}" stroke-width="6.6" stroke-linecap="round"/>`;
    // back fins
    g+=`<path d="M38 44 L22 36 L30 48 L20 52 L34 58 L26 66 L42 64Z" fill="${fin}" ${a4s(1.5)}/>`;
    if(adult) g+=`<path d="M40 40 L30 18 L42 28 L44 12 L50 28 L58 16 L56 34Z" fill="#f25a2a" ${a4s(1.4)}/><path d="M42 34 L38 24 L46 30 L48 20 L52 32Z" fill="#f2d24a"/>`;
    // body S
    g+=`<path d="M40 70 Q30 56 38 44 Q46 32 56 34 Q66 38 62 50 Q58 60 52 66 Q48 72 40 70Z" fill="url(#${B})" ${a4s()}/>`;
    for(let k=0;k<4;k++) g+=`<path d="M${52-k*2} ${46+k*5} q4 1 6 -1" fill="none" stroke="#f6e0a0" stroke-width="2" stroke-linecap="round"/>`;
    // head with snout
    g+=`<path d="M50 38 Q48 24 60 22 Q70 22 72 30 L82 34 Q82 39 76 39 L66 40 Q56 44 50 38Z" fill="url(#${B})" ${a4s()}/>`;
    g+=`<path d="M56 24 L52 14 L60 20 L62 12 L64 22Z" fill="${fin}" ${a4s(1.3)}/>`;
    g+=a4eye(63,29,3.2,'#3a2a1a',st,.5)+`<path d="M59.4 25.6 L66.6 27" stroke="${A4OL}" stroke-width="2" stroke-linecap="round"/>`;
    g+=`<path d="M60 48 L70 50 L62 56Z" fill="${fin}" ${a4s(1.3)}/>`;
    return d+g; }
  return null; };

// ---------- Elephants: a draped saddle cloth from teen, and a stone war tower on the adult's back ----------
monSVG=(function(prev){ const CL={trunkle:['#3a7ad8','#e8c43a'],tuskmoor:['#8a3aa8','#e8c43a'],mammoss:['#4a8a3a','#d8482a'],quakeph:['#c8302a','#e8c43a']};
  return function(spId,lvl,cls){ const out=prev(spId,lvl,cls); const sp=SPI[spId]; if(!sp||sp.fam!=='elephant') return out; const st=stageOf(lvl||1); if(st<1) return out;
    const [c,t]=CL[spId]||[sp.col[1],'#e8c43a']; let o=`<path d="M34 52 Q48 44 64 50 L66 70 Q50 76 32 70Z" fill="${c}" ${a4s(1.6)}/><path d="M33 68 Q50 74 66 68" fill="none" stroke="${t}" stroke-width="2.6"/>`;
    for(let k=0;k<4;k++) o+=`<circle cx="${37+k*8.6}" cy="${71.6-Math.abs(k-1.5)*.8}" r="1.6" fill="${t}"/>`;
    if(st===2){ o+=`<rect x="38" y="28" width="22" height="22" rx="1.5" fill="#a8a8ae" ${a4s(1.6)}/><path d="M38 28 v-5 h4.4 v3 h4 v-3 h4.4 v3 h4 v-3 h4.4 v5" fill="#a8a8ae" ${a4s(1.4)}/>`;
      o+=`<path d="M38 36 H60 M38 43 H60 M45 28 V36 M53 36 V43 M45 43 V50" stroke="#7a7a82" stroke-width="1.2"/><rect x="46" y="31" width="5" height="7" rx="2.4" fill="#2a2420"/>`; }
    const i=out.lastIndexOf('</g></svg>'); return i>0? out.slice(0,i)+o+out.slice(i) : out; }; })(monSVG);

// ---------- Drake family: little S-shaped wyrm -> low dragon with stubby wings -> rearing dragon with big bat wings ----------
const A4_DR={
  emberling:{b:'#3a6ad8',s:'#f2d04a',w:'#f2d04a',e:'#f2d04a'},
  magmaw:   {b:'#e8342a',s:'#f2a02a',w:'#f28a2a',e:'#f2d04a'},
  scorchet: {b:'#3fbf3a',s:'#b8f04a',w:'#2a8a2a',e:'#f2d04a'},
  pyrodrake:{b:'#6a4a8a',s:'#c8f24a',w:'#c8f24a',e:'#c8f24a'}};
ART4.drake=function(sp,st,id){ const P=A4_DR[sp.id]||{b:sp.col[0],s:sp.col[1],w:sp.col[1],e:'#f2d04a'};
  const B=id+'b', Bd=id+'d', W=id+'w'; let d=`<defs>${a4g(B,P.b)}${a4g(Bd,shade(P.b,-22))}${a4g(W,P.w,20,-25)}</defs>`, g=''; const baby=st===0, adult=st===2;
  g+=a4shadow(48,baby?14:28);
  const jaw=(hx,hy,r,open)=>{ let s=`<path d="M${hx-r} ${hy} Q${hx-r} ${hy-r} ${hx} ${hy-r*1.02} Q${hx+r*1.2} ${hy-r*1.05} ${hx+r*2.1} ${hy-r*.15} Q${hx+r*2.3} ${hy+r*.25} ${hx+r*2.05} ${hy+r*.38} L${hx+r*.5} ${hy+r*.55} Q${hx-r*.6} ${hy+r*.9} ${hx-r} ${hy}Z" fill="url(#${B})" ${a4s()}/>`;
    if(open){ s+=`<path d="M${hx+r*.4} ${hy+r*.5} L${hx+r*2} ${hy+r*.4} Q${hx+r*1.6} ${hy+r*1.2} ${hx+r*.7} ${hy+r*1.25}Z" fill="#7a1e1e" ${a4s(1.2)}/><path d="M${hx+r*.5} ${hy+r*1.25} Q${hx+r*1.3} ${hy+r*1.5} ${hx+r*1.9} ${hy+r*1}" fill="none" ${a4s(1.4)}/>`;
      for(let i=0;i<4;i++) s+=`<path d="M${hx+r*(.7+i*.33)} ${hy+r*(.5-i*.03)} l${r*.09} ${r*.3} l${r*.09} ${-r*.3}Z" fill="#fff" ${a4s(.6)}/>`; }
    else s+=`<path d="M${hx+r*.8} ${hy+r*.45} Q${hx+r*1.5} ${hy+r*.55} ${hx+r*2} ${hy+r*.3}" fill="none" ${a4s(1.3)}/>`;
    s+=`<circle cx="${hx+r*1.85}" cy="${hy-r*.1}" r="${r*.08}" fill="${A4OL}"/>`;
    const er=baby?r*.38:r*.28; s+=a4eye(hx+r*.45,hy-r*.35,er,P.e,st,.5); if(st>=1) s+=`<path d="M${hx+r*.45-er} ${hy-r*.35-er*.9} L${hx+r*.45+er*1.2} ${hy-r*.35-er*.3}" stroke="${A4OL}" stroke-width="2" stroke-linecap="round"/>`;
    return s; };
  if(baby){ // S-shaped wyrm standing on its tail
    const sp1='M44 90 Q30 90 34 80 Q40 70 52 70 Q62 68 58 58 Q54 48 48 52';
    g+=`<path d="${sp1}" fill="none" stroke="${A4OL}" stroke-width="13" stroke-linecap="round"/><path d="${sp1}" fill="none" stroke="url(#${B})" stroke-width="9.6" stroke-linecap="round"/>`;
    g+=`<path d="M38 84 Q44 76 54 74 M58 64 Q60 60 58 56" fill="none" stroke="${P.s}" stroke-width="4" stroke-linecap="round"/>`;
    g+=jaw(52,46,9,false); return d+g; }
  if(!adult){ // low dragon on short legs, stubby wings
    g+=`<path d="M28 74 Q14 76 10 66 Q8 58 16 60 Q14 66 22 68Z" fill="url(#${B})" ${a4s()}/>`;
    g+=a4sockLeg(38,72,`url(#${Bd})`,null,6,-2,1)+a4sockLeg(60,72,`url(#${Bd})`,null,6,2);
    g+=`<path d="M42 62 L34 46 L40 50 L38 40 L48 54Z" fill="url(#${W})" ${a4s(1.5)}/>`;
    const body='M24 72 Q22 58 38 56 Q54 54 64 50 Q74 50 74 62 Q72 76 58 78 Q40 80 24 72Z';
    const CL=id+'c'; d+=`<clipPath id="${CL}"><path d="${body}"/></clipPath>`;
    g+=`<path d="${body}" fill="url(#${B})"/><g clip-path="url(#${CL})"><path d="M20 76 Q46 70 76 66 L76 82 L20 82Z" fill="${P.s}"/>${[34,44,54].map(x=>a4wedge(x,57,9,100,2.4,P.s)).join('')}</g><path d="${body}" fill="none" ${a4s()}/>`;
    g+=a4sockLeg(32,72,P.b,null,6.6,-2,1)+a4sockLeg(56,72,P.b,null,6.6,3);
    [44,52,60].forEach((x,i)=>g+=`<path d="M${x-3} ${56-i*1.4} L${x} ${50-i*1.4} L${x+3} ${55-i*1.4}Z" fill="${P.s}" ${a4s(1.1)}/>`);
    g+=jaw(70,46,10,false); g+=`<path d="M66 37 l-3 -6 l6 3Z M71 36 l0 -6 l4 5Z" fill="${P.s}" ${a4s(1)}/>`;
    return d+g; }
  // adult: rearing dragon with big bat wings
  const wing=(dx,dy,flip,c)=>`<g transform="translate(${dx} ${dy})"><path d="M50 50 L36 14 Q30 22 26 20 Q24 30 16 30 Q18 40 8 42 Q16 50 10 56 Q24 54 34 60Z" fill="${c}" ${a4s(1.6)}/><path d="M50 50 L26 20 M48 52 L16 30 M44 56 L8 42" fill="none" stroke="${shade(P.b,-20)}" stroke-width="2.4" stroke-linecap="round"/></g>`;
  g+=wing(10,-4,false,`url(#${W})`);
  g+=`<path d="M34 80 Q16 86 10 76 Q6 68 14 66 Q14 74 26 74Z" fill="url(#${B})" ${a4s()}/>`;
  g+=a4sockLeg(62,70,`url(#${Bd})`,null,7,3);
  const body='M30 82 Q24 64 38 54 Q48 46 56 40 Q66 36 70 46 Q72 60 64 72 Q56 84 30 82Z';
  const CL=id+'c'; d+=`<clipPath id="${CL}"><path d="${body}"/></clipPath>`;
  g+=`<path d="${body}" fill="url(#${B})"/><g clip-path="url(#${CL})"><path d="M56 40 Q72 50 64 72 Q56 84 40 84 L60 84 L76 40Z" fill="${P.s}"/>${[[36,58],[42,52],[48,48]].map(([x,y])=>a4wedge(x,y,10,70,2.4,P.s)).join('')}</g><path d="${body}" fill="none" ${a4s()}/>`;
  for(let i=0;i<5;i++) g+=`<path d="M${30+i*5.6} ${62-i*4.4} l-4 -4 l5 0Z" fill="${P.s}" ${a4s(1)}/>`;
  g+=a4hind(38,66,10,`url(#${B})`);
  g+=`<path d="M62 56 Q72 60 74 70" fill="none" stroke="${A4OL}" stroke-width="8" stroke-linecap="round"/><path d="M62 56 Q72 60 74 70" fill="none" stroke="${P.b}" stroke-width="5" stroke-linecap="round"/><path d="M72 71 l2 4 M75 70 l3 3" stroke="${A4OL}" stroke-width="1.6" stroke-linecap="round"/>`;
  g+=wing(16,-8,false,`url(#${W})`);
  g+=`<path d="M60 40 Q64 32 70 30" fill="none" stroke="${A4OL}" stroke-width="11" stroke-linecap="round"/><path d="M60 40 Q64 32 70 30" fill="none" stroke="${P.b}" stroke-width="7.6" stroke-linecap="round"/>`;
  g+=`<path d="M68 22 L62 12 L71 18Z M74 21 L74 10 L78 19Z" fill="#f4eee0" ${a4s(1.2)}/>`;
  g+=jaw(72,28,9.5,true);
  return d+g; };
