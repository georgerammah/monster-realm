// ===== ART v3: natural-proportion cartoon creatures with soft gradient shading =====
let GID=0;
function mute(hex,p){ const n=parseInt(hex.slice(1),16); let r=n>>16,g=n>>8&255,b=n&255; const l=(r*0.3+g*0.59+b*0.11); const f=p/100;
  r=Math.round(r+(l-r)*f); g=Math.round(g+(l-g)*f); b=Math.round(b+(l-b)*f); return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1); }
const OL3='#2a1d16';
const s3 = `stroke="${OL3}" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"`;
function grad(id,c){ return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c,22)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c,-24)}"/></linearGradient>`; }
function eye3(x,y,r,iris,st,tilt){
  tilt=tilt||0;
  const brow = st>=1?`<path d="M${x-r*1.2} ${y-r*0.95} Q${x} ${y-r*1.45} ${x+r*1.25} ${y-r*0.55}" fill="none" stroke="${OL3}" stroke-width="${1.6+st*0.4}" stroke-linecap="round"/>`:'';
  return `<g transform="rotate(${tilt} ${x} ${y})"><path d="M${x-r} ${y} Q${x-r*0.2} ${y-r*0.95} ${x+r} ${y-r*0.15} Q${x+r*0.2} ${y+r*0.85} ${x-r} ${y}Z" fill="#fffdf6" ${s3} stroke-width="1.5"/>
    <circle cx="${x+r*0.22}" cy="${y-r*0.08}" r="${r*0.55}" fill="${iris}"/><circle cx="${x+r*0.3}" cy="${y-r*0.08}" r="${r*0.28}" fill="#120c08"/><circle cx="${x+r*0.42}" cy="${y-r*0.3}" r="${r*0.14}" fill="#fff"/></g>${brow}`;
}
function leg3(x0,y0,x1,y1,x2,y2,w,fill,claws){
  // thigh -> joint -> paw
  return `<path d="M${x0-w/2} ${y0} Q${x1-w/2-1} ${y1} ${x2-w/2} ${y2-2} L${x2+w/2+2.5} ${y2-2} Q${x1+w/2+1} ${y1} ${x0+w/2} ${y0}Z" fill="${fill}" ${s3}/>
    <ellipse cx="${x2+1}" cy="${y2-1}" rx="${w/2+2.6}" ry="2.6" fill="${fill}" ${s3}/>${claws?`<path d="M${x2+w/2+2} ${y2-2} l2 1 M${x2+w/2} ${y2} l2 1" stroke="${OL3}" stroke-width="1.2"/>`:''}`;
}
function tail3(d,w,c){ return `<path d="${d}" fill="none" stroke="${OL3}" stroke-width="${w+3.6}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`; }

function q3body(G, belly, x0, x1, top, bot){
  // quadruped torso: hips at x0, chest at x1
  return `<path d="M${x0} ${bot-6} Q${x0-4} ${top+4} ${x0+8} ${top} Q${(x0+x1)/2} ${top-3} ${x1-4} ${top+1} Q${x1+6} ${top+4} ${x1+5} ${bot-4} Q${x1} ${bot+2} ${(x0+x1)/2} ${bot} Q${x0+4} ${bot+1} ${x0} ${bot-6}Z" fill="url(#${G})" ${s3}/>
    <path d="M${x0+8} ${bot-2} Q${(x0+x1)/2} ${bot+3} ${x1} ${bot-3} Q${(x0+x1)/2} ${bot-6} ${x0+8} ${bot-2}Z" fill="${belly}" opacity=".9"/>`;
}

function catNew(c1,c2,c3,st,id){
  const G=id+'a', H=id+'b';
  const dk=shade(c1,-30);
  let d=`<defs>${grad(G,c1)}${grad(H,c1)}</defs>`, g='';
  const tipB = st>=1?`<path d="M12 30 l-5 -7 l6 0 l-3 -9 l10 10 l-6 0 l3 6z" fill="${c2}" ${s3} stroke-width="1.5"/>`:`<ellipse cx="13" cy="30" rx="4" ry="5" fill="${c2}" ${s3} stroke-width="1.5"/>`;
  g+=tail3(`M26 60 Q10 62 9 48 Q8 38 13 32`,4.6,c1)+tipB;
  g+=leg3(34,64,31,78,33,90,5,dk)+leg3(60,64,61,78,60,90,5,dk);
  g+=q3body(G,c3,24,64,52,70);
  g+=`<path d="M30 54 Q44 50 58 53" fill="none" stroke="${shade(c1,30)}" stroke-width="2" opacity=".5"/>`;
  if(st>=1) g+=`<path d="M38 53 l3 6 l-4 1 l3 7 M48 52 l3 6 l-4 1 l3 7" fill="none" stroke="${c2}" stroke-width="2.2" stroke-linejoin="round"/>`;
  g+=leg3(30,64,26,78,29,91,5.5,`url(#${G})`,1)+leg3(56,64,57,78,56,91,5.5,`url(#${G})`,1);
  // neck + head
  const hx=st===0?72:74, hy=st===0?44:40;
  if(st>=2) for(let k=0;k<6;k++){ const a=2.0+k*0.38; g+=`<path d="M${hx-2+Math.cos(a)*7} ${hy+4+Math.sin(a)*7} L${hx-2+Math.cos(a+0.18)*20} ${hy+4+Math.sin(a+0.18)*18} L${hx-2+Math.cos(a+0.36)*7} ${hy+4+Math.sin(a+0.36)*7}Z" fill="${c2}" ${s3} stroke-width="1.5"/>`; }
  g+=`<path d="M58 58 Q60 ${hy+6} ${hx-6} ${hy+4} L${hx+2} ${hy+12} Q66 60 64 66Z" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M${hx-9} ${hy-3} L${hx-11} ${hy-22-st*2} L${hx-1} ${hy-8}Z" fill="${c1}" ${s3}/><path d="M${hx-8.5} ${hy-6} L${hx-9.5} ${hy-18-st*2} L${hx-3.5} ${hy-8}Z" fill="${c3}"/>`;
  g+=`<path d="M${hx-11} ${hy+2} Q${hx-10} ${hy-10} ${hx} ${hy-10} Q${hx+9} ${hy-10} ${hx+12} ${hy-1} L${hx+19} ${hy+3} Q${hx+20} ${hy+8} ${hx+13} ${hy+10} Q${hx+4} ${hy+15} ${hx-6} ${hy+11} Q${hx-12} ${hy+8} ${hx-11} ${hy+2}Z" fill="url(#${H})" ${s3}/>`;
  g+=`<path d="M${hx+1} ${hy-9} L${hx+4} ${hy-24-st*2} L${hx+10} ${hy-6}Z" fill="${c1}" ${s3}/><path d="M${hx+3} ${hy-9} L${hx+4.5} ${hy-20-st*2} L${hx+7.5} ${hy-7}Z" fill="${c3}"/>`;
  g+=`<path d="M${hx+6} ${hy+4} Q${hx+13} ${hy+3} ${hx+19} ${hy+4} Q${hx+16} ${hy+10} ${hx+8} ${hy+10}Z" fill="${c3}"/><ellipse cx="${hx+19}" cy="${hy+3}" rx="1.8" ry="1.4" fill="${OL3}"/>`;
  g+=`<path d="M${hx+11} ${hy+8} q3 1.5 6 -0.5" fill="none" stroke="${OL3}" stroke-width="1.3"/><path d="M${hx+13} ${hy+5} L${hx+25} ${hy+3} M${hx+13} ${hy+7} L${hx+25} ${hy+8}" stroke="${OL3}" stroke-width=".8" opacity=".55"/>`;
  g+=`<path d="M${hx-3} ${hy-7} l-2 4 h3 l-2 4" fill="none" stroke="${c2}" stroke-width="2" stroke-linejoin="round"/>`;
  g+=eye3(hx+5,hy-1,st===0?4.6:4,'#f5c542',st,-6);
  return d+g;
}
function houndHead3(x,y,s,c1,c2,c3,st,G,dark){
  const C=dark?shade(c1,-20):`url(#${G})`;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-6 -6 L-10 -22 L0 -10Z" fill="${dark?shade(c2,-15):c2}" ${s3}/>
    <path d="M-12 2 Q-12 -10 0 -10 Q8 -10 11 -4 L23 -1 Q26 3 22 6 L10 8 Q2 12 -6 9 Q-12 7 -12 2Z" fill="${C}" ${s3}/>
    <path d="M8 5 L22 4 Q20 8 12 9Z" fill="${c3}" opacity=".9"/>
    <ellipse cx="23" cy="0.5" rx="2.4" ry="1.9" fill="${OL3}"/>
    <path d="M10 7 Q16 8 21 5" fill="none" stroke="${OL3}" stroke-width="1.3"/>
    ${st>=2?`<path d="M13 7 l1 2.5 l1.5 -2.4 M17 6.5 l1 2.5 l1.5 -2.5" fill="#fff" stroke="${OL3}" stroke-width=".7"/>`:''}
    <path d="M1 -9 L4 -21 L9 -8Z" fill="${dark?shade(c2,-15):c2}" ${s3}/>
    ${eye3(4,-2,dark?3.2:3.8,'#ffb347',Math.max(1,st),-8)}</g>`;
}
function houndNew(c1,c2,c3,st,id){
  const G=id+'a'; const dk=shade(c1,-30);
  let d=`<defs>${grad(G,c1)}</defs>`, g='';
  g+=tail3(`M24 58 Q12 54 12 42`,6,c1)+`<path d="M8 44 l4 -9 l4 9z" fill="${c2}" ${s3} stroke-width="1.5"/>`;
  g+=leg3(34,64,31,78,33,90,6.5,dk)+leg3(60,64,62,78,61,90,6.5,dk);
  g+=q3body(G,c3,22,64,50+(st===0?3:0),71);
  const n=3+st*2; for(let k=0;k<n;k++){ const x=28+k*(32/(n-1)); const y=50.5-Math.sin((k+0.5)/n*Math.PI)*3+(st===0?3:0); const h=5+st*3; g+=`<path d="M${x-4} ${y+3} L${x-1.5} ${y-h} L${x+3.5} ${y-h+3} L${x+4.5} ${y+3}Z" fill="${c2}" ${s3} stroke-width="1.5"/><path d="M${x-1.5} ${y-h} L${x+1} ${y+2}" stroke="${shade(c2,25)}" stroke-width="1"/>`; }
  g+=`<circle cx="36" cy="64" r="2.6" fill="${c2}" opacity=".6"/><circle cx="48" cy="67" r="2" fill="${c2}" opacity=".6"/>`;
  g+=leg3(29,64,25,78,28,91,7,`url(#${G})`,1)+leg3(56,64,57,78,56,91,7,`url(#${G})`,1);
  g+=`<path d="M56 58 Q60 46 66 44 L72 52 Q66 60 64 66Z" fill="url(#${G})" ${s3}/>`;
  if(st===0) g+=houndHead3(70,46,1,c1,c2,c3,st,G,false);
  else if(st===1){ g+=houndHead3(63,36,.82,c1,c2,c3,st,G,true); g+=houndHead3(72,48,1,c1,c2,c3,st,G,false); }
  else { g+=houndHead3(56,34,.76,c1,c2,c3,st,G,true); g+=houndHead3(74,32,.78,c1,c2,c3,st,G,true); g+=houndHead3(71,48,1,c1,c2,c3,st,G,false); }
  return d+g;
}
function turtleNew(c1,c2,c3,st,id){
  const G=id+'a', S=id+'s'; const dk=shade(c1,-30);
  let d=`<defs>${grad(G,c1)}${grad(S,c2)}</defs>`, g='';
  g+=`<path d="M22 72 L8 76 L22 79Z" fill="url(#${G})" ${s3}/>`;
  g+=leg3(34,70,32,80,33,89,7,dk,1)+leg3(62,70,63,80,63,89,7,dk,1);
  const hx=st===0?78:82, hy=st===0?54:52;
  g+=`<path d="M62 70 Q70 ${hy+2} ${hx-6} ${hy-2} L${hx-2} ${hy+8} Q74 68 70 74Z" fill="url(#${G})" ${s3}/><path d="M66 66 q4 -4 8 -6 M65 70 q5 -3 9 -5" stroke="${shade(c1,-25)}" stroke-width="1" fill="none"/>`;
  g+=`<path d="M${hx-9} ${hy} Q${hx-9} ${hy-11} ${hx+1} ${hy-11} Q${hx+12} ${hy-11} ${hx+15} ${hy-1} Q${hx+16} ${hy+5} ${hx+11} ${hy+7} L${hx-4} ${hy+8} Q${hx-10} ${hy+6} ${hx-9} ${hy}Z" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M${hx+3} ${hy+3} Q${hx+10} ${hy+5} ${hx+15} ${hy+1}" fill="none" stroke="${OL3}" stroke-width="1.4"/><circle cx="${hx+13}" cy="${hy-3}" r="1" fill="${OL3}"/>`;
  g+=eye3(hx+3,hy-4,st===0?4.4:3.8,'#ffcf4a',st,-4);
  g+=`<ellipse cx="46" cy="74" rx="28" ry="6" fill="${c3}" ${s3}/>`;
  const top=st===0?44:38;
  if(st>=2) for(let k=0;k<5;k++){ const x=24+k*11, y=top+9-Math.sin((k+0.5)/5*Math.PI)*10; g+=`<path d="M${x-4} ${y+6} L${x} ${y-7} L${x+4} ${y+6}Z" fill="${c3}" ${s3} stroke-width="1.5"/>`; }
  g+=`<path d="M16 73 Q16 ${top} 46 ${top} Q76 ${top} 76 73Z" fill="url(#${S})" ${s3}/>`;
  g+=`<path d="M28 ${top+18} L36 ${top+8} L56 ${top+8} L64 ${top+18} L58 ${top+30} L34 ${top+30}Z" fill="none" stroke="${shade(c2,-30)}" stroke-width="1.6"/><path d="M36 ${top+8} L32 ${top+2} M56 ${top+8} L60 ${top+2} M28 ${top+18} L18 ${top+24} M64 ${top+18} L74 ${top+24} M34 ${top+30} L30 72 M58 ${top+30} L62 72" stroke="${shade(c2,-30)}" stroke-width="1.6"/>`;
  g+=`<path d="M14 73 Q46 81 78 73" fill="none" ${s3} stroke-width="3"/>`;
  g+=`<ellipse cx="34" cy="${top+7}" rx="9" ry="2.6" fill="#fff" opacity=".3" transform="rotate(-16 34 ${top+7})"/>`;
  g+=leg3(28,74,26,82,27,90,8,`url(#${G})`,1)+leg3(56,74,57,82,57,90,8,`url(#${G})`,1);
  return d+g;
}
function dragonNew(c1,c2,c3,st,id){
  const G=id+'a', W=id+'w'; const dk=shade(c1,-30);
  let d=`<defs>${grad(G,c1)}${grad(W,c2)}</defs>`, g='';
  if(st>=1){ const w=st>=2?1.25:1; g+=`<path d="M46 54 Q${38-8*w} ${30-20*w} ${18-10*w} ${22-10*w} L${24-6*w} ${36-4*w} L${12-8*w} ${36-2*w} L${22-4*w} ${46} L${14-4*w} ${50} Q28 52 34 58Z" fill="url(#${W})" ${s3}/><path d="M44 54 L${18-10*w} ${22-10*w} M40 55 L${12-8*w} ${36-2*w} M37 57 L${14-4*w} 50" stroke="${shade(c2,-30)}" stroke-width="1.2"/>`; }
  g+=tail3(`M26 70 Q10 76 5 62 Q3 54 8 50`,5,c1)+`<path d="M8 51 Q2 44 7 36 Q9 43 13 45 Q14 50 8 51Z" fill="#ffb000" ${s3} stroke-width="1.5"/><path d="M8 48 Q6 44 8 40 Q10 45 8 48Z" fill="#fff3a0"/>`;
  g+=leg3(36,66,33,78,35,90,6,dk,1)+leg3(58,66,60,78,59,90,6,dk,1);
  g+=q3body(G,c3,24,62,54,72);
  g+=`<path d="M52 60 h8 M51 65 h9 M50 70 h8" stroke="${shade(c3,-28)}" stroke-width="1.1"/>`;
  if(st>=1) for(let k=0;k<4;k++){ const x=31+k*7, y=53-k*0.5; g+=`<path d="M${x-3} ${y+2} L${x} ${y-5-st} L${x+3} ${y+2}Z" fill="${c2}" ${s3} stroke-width="1.4"/>`; }
  g+=leg3(31,66,27,78,30,91,6.5,`url(#${G})`,1)+leg3(54,66,55,78,54,91,6.5,`url(#${G})`,1);
  const hx=st===0?70:72, hy=st===0?42:36;
  g+=`<path d="M56 58 Q58 ${hy+8} ${hx-6} ${hy+2} L${hx+2} ${hy+10} Q64 58 62 66Z" fill="url(#${G})" ${s3}/>`;
  const hl=st>=2?14:st===1?10:6;
  g+=tail3(`M${hx-6} ${hy-5} Q${hx-12} ${hy-6-hl/2} ${hx-16} ${hy-6-hl}`,3,c3)+tail3(`M${hx} ${hy-7} Q${hx+2} ${hy-8-hl} ${hx+6} ${hy-8-hl}`,3,c3);
  g+=`<path d="M${hx-10} ${hy+2} Q${hx-10} ${hy-9} ${hx} ${hy-9} Q${hx+8} ${hy-9} ${hx+12} ${hy-3} L${hx+22} ${hy} Q${hx+25} ${hy+4} ${hx+21} ${hy+7} L${hx+8} ${hy+9} Q${hx} ${hy+13} ${hx-6} ${hy+9} Q${hx-10} ${hy+7} ${hx-10} ${hy+2}Z" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M${hx+7} ${hy+7} L${hx+21} ${hy+6}" stroke="${OL3}" stroke-width="1.3"/><circle cx="${hx+20}" cy="${hy+1}" r="1.1" fill="${OL3}"/>`;
  if(st>=1) g+=`<path d="M${hx+12} ${hy+7} l1 2.2 l1.2 -2.2 M${hx+16} ${hy+6.7} l1 2.2 l1.2 -2.2" fill="#fff" stroke="${OL3}" stroke-width=".7"/>`;
  g+=eye3(hx+4,hy-2,st===0?4.4:3.8,'#ffd23f',st,-8);
  if(st>=2) g+=`<circle cx="${hx+27}" cy="${hy+2}" r="1.8" fill="#ffb000" opacity=".9"/><circle cx="${hx+31}" cy="${hy-1}" r="1.2" fill="#ff6a3d" opacity=".8"/>`;
  return d+g;
}
function birdNew(c1,c2,c3,st,id){
  const G=id+'a', W=id+'w'; const c2d=shade(c2,-28);
  let d=`<defs>${grad(G,c1)}${grad(W,c2)}</defs>`, g='';
  const tl=st===0?8:st===1?13:18;
  for(let k=0;k<2+st;k++){ const a=k*5; g+=`<path d="M30 ${60-a/2} Q${18-tl} ${54-a-tl/3} ${10-tl/2} ${50-a-tl/2} Q${20-tl/3} ${60-a/2} 32 ${66-a/3}Z" fill="${k%2?c3:`url(#${W})`}" ${s3} stroke-width="1.5"/>`; }
  g+=`<path d="M46 74 L44 89 M44 89 l-5 1.5 M44 89 l4 1.5 M55 74 L56 89 M56 89 l-4 1.5 M56 89 l5 1.5" stroke="${OL3}" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M46 74 L44 89 M44 89 l-5 1.5 M44 89 l4 1.5 M55 74 L56 89 M56 89 l-4 1.5 M56 89 l5 1.5" stroke="#e8a12a" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  g+=`<path d="M28 62 Q30 44 48 44 Q64 44 66 56 Q68 72 52 76 Q34 78 28 62Z" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M54 52 Q66 58 62 70 Q56 76 48 75 Q60 66 54 52Z" fill="${c3}" opacity=".95"/>`;
  const hx=st===0?66:68, hy=st===0?40:36, hr=st===0?11:10;
  for(let k=0;k<st+2;k++){ const x=hx-7+k*4; g+=`<path d="M${x} ${hy-hr+3} Q${x-8-k*2} ${hy-hr-9-st*3} ${x-4} ${hy-hr-14-st*4+k*2} Q${x+1} ${hy-hr-4} ${x+4} ${hy-hr+3}Z" fill="url(#${W})" ${s3} stroke-width="1.4"/>`; }
  g+=`<path d="M58 50 Q60 40 ${hx} ${hy+6} L${hx+4} ${hy+10} Q64 52 62 58Z" fill="url(#${G})" ${s3}/>`;
  g+=`<circle cx="${hx}" cy="${hy}" r="${hr}" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M${hx+hr-2} ${hy-3} Q${hx+hr+9} ${hy-1} ${hx+hr+13} ${hy+3} Q${hx+hr+6} ${hy+5} ${hx+hr-2} ${hy+4}Z" fill="#f2b33d" ${s3} stroke-width="1.5"/><path d="M${hx+hr-2} ${hy+1} L${hx+hr+9} ${hy+2}" stroke="${OL3}" stroke-width="1"/>`;
  g+=eye3(hx+3,hy-2,st===0?4.2:3.6,'#ff9f1a',st,-6);
  const ww=st===0?1:st===1?1.12:1.25;
  g+=`<path d="M34 52 Q48 ${44-3*ww} 58 54 Q${54} ${66+3*ww} ${28-6*ww} ${74+3*ww} L${33-5*ww} ${68+2*ww} L${26-6*ww} ${70+2*ww} Q30 60 34 52Z" fill="url(#${W})" ${s3}/><path d="M38 60 Q46 63 52 59 M36 66 Q42 69 48 65" fill="none" stroke="${c2d}" stroke-width="1.3"/>`;
  return d+g;
}
function bugNew(c1,c2,c3,st,id){
  const G=id+'a'; const dk=shade(c1,-34);
  let d=`<defs>${grad(G,c1)}</defs>`, g='';
  if(st>=1){ const w=st>=2?1.3:1; g+=`<path d="M48 54 Q${30} ${22-8*w} ${16-6*w} ${28-6*w} Q${22} ${44} 46 56Z" fill="${c3}" opacity=".62" ${s3} stroke-width="1.3"/><path d="M47 55 Q30 34 ${16-6*w} ${28-6*w}" stroke="${OL3}" stroke-width=".8" opacity=".5" fill="none"/>`;
    if(st>=2) g+=`<path d="M48 56 Q32 38 14 42 Q26 54 46 58Z" fill="${c3}" opacity=".5" ${s3} stroke-width="1.2"/>`; }
  g+=`<path d="M50 66 Q46 76 42 88 M56 67 Q57 78 56 89 M62 65 Q66 76 70 87" stroke="${OL3}" stroke-width="4.2" stroke-linecap="round" fill="none"/><path d="M50 66 Q46 76 42 88 M56 67 Q57 78 56 89 M62 65 Q66 76 70 87" stroke="${dk}" stroke-width="2" stroke-linecap="round" fill="none"/>`;
  if(st>=2) g+=`<path d="M14 68 L4 72 L14 74Z" fill="${c2}" ${s3} stroke-width="1.4"/>`;
  g+=`<path d="M${st===0?22:16} 66 Q${st===0?22:16} 52 34 52 Q48 52 50 64 Q50 76 34 78 Q${st===0?22:16} 78 ${st===0?22:16} 66Z" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M${st===0?28:24} 54 Q${st===0?25:21} 65 ${st===0?28:24} 76 M35 52 Q32 65 35 78 M42 54 Q40 65 43 76" fill="none" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>`;
  g+=`<ellipse cx="55" cy="60" rx="8.5" ry="8" fill="url(#${G})" ${s3}/>`;
  const hx=st===0?67:69, hy=st===0?54:52;
  g+=tail3(`M${hx+2} ${hy-8} Q${hx+8} ${hy-20} ${hx+16} ${hy-22-st*3}`,1.8,c2)+`<circle cx="${hx+16}" cy="${hy-22-st*3}" r="2.6" fill="${c2}" ${s3} stroke-width="1.3"/>`;
  g+=tail3(`M${hx-3} ${hy-8} Q${hx-2} ${hy-20} ${hx+5} ${hy-25-st*3}`,1.8,c2)+`<circle cx="${hx+5}" cy="${hy-25-st*3}" r="2.6" fill="${c2}" ${s3} stroke-width="1.3"/>`;
  g+=`<path d="M${hx-9} ${hy+1} Q${hx-9} ${hy-9} ${hx} ${hy-9} Q${hx+9} ${hy-9} ${hx+10} ${hy} Q${hx+10} ${hy+8} ${hx} ${hy+9} Q${hx-9} ${hy+9} ${hx-9} ${hy+1}Z" fill="url(#${G})" ${s3}/>`;
  g+=`<path d="M${hx+8} ${hy+4} q5 1 6 5 q-4 0 -6 -2" fill="${c2}" ${s3} stroke-width="1.3"/>`;
  g+=`<ellipse cx="${hx+3.5}" cy="${hy-1.5}" rx="${st===0?4.8:4.2}" ry="${st===0?5.6:5}" fill="#1a120c"/><ellipse cx="${hx+3.5}" cy="${hy-1.5}" rx="${st===0?3.4:3}" ry="${st===0?4:3.6}" fill="${shade(c2,10)}" opacity=".45"/><circle cx="${hx+5}" cy="${hy-4}" r="1.4" fill="#fff"/>`;
  if(st>=1) g+=`<path d="M${hx-2} ${hy-7} L${hx+8} ${hy-5}" stroke="${OL3}" stroke-width="1.9" stroke-linecap="round"/>`;
  return d+g;
}
function monSVG(spId, lvl, cls){
  const sp = SPI[spId]; const st = stageOf(lvl);
  const custom = CUSTOM_ART[spId];
  if(custom){ const src = Array.isArray(custom)? (custom[st]||custom[custom.length-1]) : custom;
    return `<svg class="${cls||''}" viewBox="0 0 100 100"><image href="${src}" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMax meet"/></svg>`; }
  const shape = FAM[sp.fam].shape; const c1=mute(sp.col[0],22), c2=mute(sp.col[1],12), c3=mute(sp.col[2],10); const id='m'+(GID++);
  const sc = [0.8,0.92,1][st];
  const g = shape==='turtle'?turtleNew(c1,c2,c3,st,id): shape==='cat'?catNew(c1,c2,c3,st,id): shape==='hound'?houndNew(c1,c2,c3,st,id):
            shape==='dragon'?dragonNew(c1,c2,c3,st,id): shape==='bird'?birdNew(c1,c2,c3,st,id): shape==='bug'?bugNew(c1,c2,c3,st,id): drawDummy(c1,c2);
  return `<svg class="${cls||''}" viewBox="-4 0 108 100"><g transform="translate(50 92) scale(${sc}) translate(-50 -92)">${g}</g></svg>`;
}
