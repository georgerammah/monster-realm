// ===== ART v2: side-profile cel-shaded cartoon monsters =====
// To use your own artwork later: add an entry like  CUSTOM_ART.tidepip = ['art/tidepip-1.png','art/tidepip-2.png','art/tidepip-3.png'];
// (one image per stage: baby, teen, adult — monster facing right, feet at the bottom)
const CUSTOM_ART = {};
const OL = '#2b201b';
function shade(hex, p){
  const n=parseInt(hex.slice(1),16); let r=n>>16, g=n>>8&255, b=n&255;
  const t=p<0?0:255, f=Math.abs(p)/100;
  r=Math.round(r+(t-r)*f); g=Math.round(g+(t-g)*f); b=Math.round(b+(t-b)*f);
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
const sw = 'stroke="'+OL+'" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"';
function eyeP(x,y,r,stage,mood){
  // profile eye looking right
  const ry=r*1.15;
  let s=`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${ry}" fill="#fff" ${sw} stroke-width="1.8"/>
    <circle cx="${x+r*0.32}" cy="${y+r*0.1}" r="${r*0.62}" fill="#1c1410"/><circle cx="${x+r*0.52}" cy="${y-r*0.28}" r="${r*0.24}" fill="#fff"/>`;
  if(stage>=1||mood==='fierce') s+=`<path d="M${x-r*1.1} ${y-ry*1.05} L${x+r*1.2} ${y-ry*0.55}" stroke="${OL}" stroke-width="${stage>=2?2.8:2.2}" stroke-linecap="round"/>`;
  return s;
}
function legs(c, xs, top, bot, w){ return xs.map(x=>`<path d="M${x-w/2} ${top} L${x-w/2} ${bot-3} Q${x-w/2} ${bot} ${x-w/2+3} ${bot} L${x+w/2+2} ${bot} Q${x+w/2+4} ${bot} ${x+w/2+3} ${bot-3} L${x+w/2} ${top}Z" fill="${c}" ${sw}/>`).join(''); }

function drawTurtle(c1,c2,c3,st){
  const dk=shade(c1,-28), c2d=shade(c2,-25), head=st===0?[76,52,15,13]:[80,54,13,11];
  let g='';
  g+=`<path d="M22 70 L9 75 L22 78Z" fill="${c1}" ${sw}/>`;
  g+=legs(dk,[36,64],70,86,9);
  g+=`<path d="M64 70 Q70 58 ${head[0]-6} ${head[1]+2} L${head[0]-2} ${head[1]+12} Q72 70 70 74Z" fill="${c1}" ${sw}/>`;
  g+=`<ellipse cx="${head[0]}" cy="${head[1]}" rx="${head[2]}" ry="${head[3]}" fill="${c1}" ${sw}/>`;
  g+=`<path d="M${head[0]-head[2]+3} ${head[1]+4} Q${head[0]} ${head[1]+head[3]+2} ${head[0]+head[2]-2} ${head[1]+4} Q${head[0]} ${head[1]+head[3]-2} ${head[0]-head[2]+3} ${head[1]+4}Z" fill="${dk}" opacity=".55"/>`;
  g+=eyeP(head[0]+4,head[1]-2,st===0?5:4.3,st);
  g+=`<path d="M${head[0]+6} ${head[1]+6} Q${head[0]+10} ${head[1]+8} ${head[0]+head[2]-1} ${head[1]+4}" fill="none" ${sw} stroke-width="1.8"/>`;
  if(st>=1) g+=`<path d="M${head[0]-head[2]+2} ${head[1]-4} L${head[0]-head[2]-6} ${head[1]-10} L${head[0]-head[2]+4} ${head[1]-10}Z" fill="${c2}" ${sw}/>`;
  g+=`<ellipse cx="46" cy="74" rx="27" ry="7" fill="${c3}" ${sw}/>`;
  if(st>=2) for(let k=0;k<5;k++){ const x=26+k*10, y=46-Math.sin((k+0.5)/5*Math.PI)*12; g+=`<path d="M${x-4} ${y+6} L${x+1} ${y-7} L${x+5} ${y+6}Z" fill="${c3}" ${sw}/>`; }
  const top=st===0?44:36;
  g+=`<path d="M17 72 Q18 ${top} 46 ${top} Q74 ${top} 75 72Z" fill="${c2}" ${sw}/>`;
  g+=`<path d="M19 66 Q46 74 73 66 L75 72 Q46 80 17 72Z" fill="${c2d}"/>`;
  g+=`<path d="M17 72 Q18 ${top} 46 ${top} Q74 ${top} 75 72" fill="none" ${sw}/>`;
  g+=`<path d="M30 ${top+16} L38 ${top+8} L54 ${top+8} L62 ${top+16} L56 ${top+28} L36 ${top+28}Z M38 ${top+8} L34 ${top+2} M54 ${top+8} L58 ${top+2} M30 ${top+16} L20 ${top+22} M62 ${top+16} L72 ${top+22} M36 ${top+28} L32 70 M56 ${top+28} L60 70" fill="${shade(c2,12)}" stroke="${c2d}" stroke-width="1.8"/>`;
  g+=`<ellipse cx="34" cy="${top+6}" rx="9" ry="3" fill="#fff" opacity=".35" transform="rotate(-18 34 ${top+6})"/>`;
  g+=`<path d="M15 72 Q46 82 77 72" fill="none" ${sw}/>`;
  g+=legs(c1,[30,58],74,89,10);
  return g;
}
function drawCat(c1,c2,c3,st){
  const dk=shade(c1,-28); const hr=st===0?16:14; const hx=st===0?70:72, hy=st===0?48:46;
  let g='';
  const tip = st>=1?`<path d="M14 ${30} l-6 -6 l7 -1 l-4 -8 l10 9 l-7 1 l4 6z" fill="${c2}" ${sw} stroke-width="1.8"/>`:'';
  g+=`<path d="M26 62 Q8 60 13 34" fill="none" stroke="${OL}" stroke-width="10" stroke-linecap="round"/><path d="M26 62 Q8 60 13 34" fill="none" stroke="${c1}" stroke-width="5.6" stroke-linecap="round"/>${tip}`;
  g+=legs(dk,[34,58],66,87,7);
  if(st>=2) for(let k=0;k<7;k++){ const a=1.75+k*0.4; g+=`<path d="M${hx+Math.cos(a)*10} ${hy+Math.sin(a)*10} L${hx+Math.cos(a+0.2)*25} ${hy+Math.sin(a+0.2)*25} L${hx+Math.cos(a+0.42)*10} ${hy+Math.sin(a+0.42)*10}Z" fill="${c2}" ${sw}/>`; }
  g+=`<ellipse cx="44" cy="63" rx="${st===0?20:23}" ry="13" fill="${c1}" ${sw}/>`;
  g+=`<path d="M24 66 Q44 78 66 66 Q60 76 44 76 Q30 76 24 66Z" fill="${dk}" opacity=".5"/>`;
  g+=`<ellipse cx="47" cy="69" rx="13" ry="5" fill="${c3}"/>`;
  if(st>=1) g+=`<path d="M36 52 l3 7 l-4 1 l3 6 M48 51 l3 7 l-4 1 l3 6" fill="none" stroke="${c2}" stroke-width="2.4"/>`;
  g+=legs(c1,[30,54],68,89,8);
  g+=`<path d="M${hx-10} ${hy-8} L${hx-12} ${hy-hr-10} L${hx-1} ${hy-12}Z" fill="${c1}" ${sw}/><path d="M${hx-9} ${hy-10} L${hx-10} ${hy-hr-5} L${hx-4} ${hy-12}Z" fill="${c3}"/>`;
  g+=`<circle cx="${hx}" cy="${hy}" r="${hr}" fill="${c1}" ${sw}/>`;
  g+=`<path d="M${hx+2} ${hy-10} L${hx+5} ${hy-hr-11} L${hx+12} ${hy-6}Z" fill="${c1}" ${sw}/><path d="M${hx+4} ${hy-10} L${hx+5.5} ${hy-hr-6} L${hx+9} ${hy-7}Z" fill="${c3}"/>`;
  g+=`<path d="M${hx-hr+2} ${hy+6} Q${hx} ${hy+hr+2} ${hx+hr-3} ${hy+8} Q${hx} ${hy+hr-3} ${hx-hr+2} ${hy+6}Z" fill="${dk}" opacity=".45"/>`;
  g+=`<ellipse cx="${hx+11}" cy="${hy+6}" rx="7" ry="5.5" fill="${c3}" ${sw} stroke-width="1.8"/><ellipse cx="${hx+17}" cy="${hy+3}" rx="2.2" ry="1.7" fill="#2b201b"/>`;
  g+=`<path d="M${hx+12} ${hy+9} q3 2 6 0" fill="none" ${sw} stroke-width="1.5"/><path d="M${hx+14} ${hy+7} L${hx+24} ${hy+5} M${hx+14} ${hy+9} L${hx+24} ${hy+10}" stroke="${OL}" stroke-width="1" opacity=".6"/>`;
  g+=`<path d="M${hx-2} ${hy-12} l-3 5 h3 l-2 5" fill="none" stroke="${c2}" stroke-width="2.4" stroke-linejoin="round"/>`;
  g+=eyeP(hx+5,hy-2,st===0?5.2:4.4,st);
  return g;
}
function houndHead(x,y,s,c1,c2,c3,st,dark){
  const C=dark?shade(c1,-22):c1;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-6 -8 Q-16 -4 -14 8 Q-8 6 -4 -2Z" fill="${c2}" ${sw}/>
    <ellipse cx="12" cy="4" rx="11" ry="7" fill="${C}" ${sw}/>
    <circle cx="0" cy="0" r="11" fill="${C}" ${sw}/>
    <path d="M2 2 Q12 6 22 3" fill="none" stroke="${C}" stroke-width="5"/>
    <ellipse cx="13" cy="7" rx="8" ry="3.5" fill="${c3}" opacity=".9"/>
    <ellipse cx="22" cy="1" rx="3" ry="2.4" fill="#2b201b"/>
    <path d="M8 9 Q15 12 21 7" fill="none" ${sw} stroke-width="1.6"/>
    ${st>=2?`<path d="M12 9 l1.5 3 l1.5 -3 M17 8.5 l1.5 3 l1.5 -3" fill="#fff" stroke="${OL}" stroke-width=".8"/>`:''}
    <path d="M-4 -9 L-1 -16 L4 -9Z" fill="${c2}" ${sw}/>
    ${eyeP(4,-2,dark?3.6:4.2,Math.max(1,st))}</g>`;
}
function drawHound(c1,c2,c3,st){
  const dk=shade(c1,-28);
  let g='';
  g+=`<path d="M24 58 Q14 50 16 42" fill="none" stroke="${OL}" stroke-width="10" stroke-linecap="round"/><path d="M24 58 Q14 50 16 42" fill="none" stroke="${c1}" stroke-width="5.6" stroke-linecap="round"/><path d="M12 44 l4 -8 l4 7z" fill="${c2}" ${sw} stroke-width="1.6"/>`;
  g+=legs(dk,[34,60],66,87,9);
  g+=`<ellipse cx="44" cy="63" rx="${st===0?21:25}" ry="${st===0?13:15}" fill="${c1}" ${sw}/>`;
  g+=`<path d="M21 66 Q44 80 68 66 Q62 78 44 78 Q28 78 21 66Z" fill="${dk}" opacity=".5"/>`;
  const n=3+st*2; for(let k=0;k<n;k++){ const x=28+k*(34/(n-1||1)); const y=50-Math.sin((k+0.5)/n*Math.PI)*(st===0?2:5); const h=5+st*2.5; g+=`<path d="M${x-4} ${y+4} L${x-1} ${y-h} L${x+4} ${y-h+3} L${x+5} ${y+4}Z" fill="${c2}" ${sw} stroke-width="1.8"/>`; }
  g+=`<circle cx="38" cy="66" r="3" fill="${c2}" opacity=".7"/><circle cx="50" cy="70" r="2.3" fill="${c2}" opacity=".7"/>`;
  g+=legs(c1,[29,56],68,89,10);
  if(st===0) g+=houndHead(70,48,1.05,c1,c2,c3,st,false);
  else if(st===1){ g+=houndHead(64,38,.85,c1,c2,c3,st,true); g+=houndHead(72,52,1,c1,c2,c3,st,false); }
  else { g+=houndHead(58,36,.78,c1,c2,c3,st,true); g+=houndHead(76,36,.8,c1,c2,c3,st,true); g+=houndHead(70,52,1,c1,c2,c3,st,false); }
  return g;
}
function drawDragon(c1,c2,c3,st){
  const dk=shade(c1,-28); const c2d=shade(c2,-22);
  let g='';
  if(st>=1){ const w=st>=2?1.25:1; g+=`<path d="M44 52 Q${36-10*w} ${30-22*w} ${16-8*w} ${26-10*w} Q${24} ${36} ${18-4*w} ${44} Q28 44 26 52 Q34 48 36 58Z" fill="${c2}" ${sw}/><path d="M42 52 L${16-8*w} ${26-10*w} M38 54 L${18-4*w} 44" stroke="${c2d}" stroke-width="1.6"/>`; }
  g+=`<path d="M26 72 Q8 74 6 60" fill="none" stroke="${OL}" stroke-width="10" stroke-linecap="round"/><path d="M26 72 Q8 74 6 60" fill="none" stroke="${c1}" stroke-width="5.6" stroke-linecap="round"/>`;
  g+=`<path d="M6 61 Q-1 52 6 44 Q7 50 11 52 Q12 58 6 61Z" fill="#ffb000" ${sw} stroke-width="1.8"/><path d="M6 58 Q3 53 6 49 Q8 54 6 58Z" fill="#fff3a0"/>`;
  g+=legs(dk,[36,58],68,87,9);
  g+=`<ellipse cx="45" cy="64" rx="${st===0?19:22}" ry="${st===0?14:16}" fill="${c1}" ${sw}/>`;
  g+=`<path d="M50 52 Q62 60 58 76 Q48 80 40 76 Q52 66 50 52Z" fill="${c3}" ${sw} stroke-width="1.8"/><path d="M50 60 h8 M50 66 h8 M48 72 h8" stroke="${shade(c3,-25)}" stroke-width="1.4"/>`;
  g+=`<path d="M26 68 Q40 80 60 72 Q54 80 42 80 Q30 79 26 68Z" fill="${dk}" opacity=".5"/>`;
  if(st>=1) for(let k=0;k<4;k++){ const x=32+k*7, y=49-k*0.6; g+=`<path d="M${x-3} ${y+3} L${x} ${y-5} L${x+3} ${y+3}Z" fill="${c2}" ${sw} stroke-width="1.6"/>`; }
  g+=legs(c1,[32,54],70,89,10);
  const hx=st===0?68:70, hy=st===0?42:38;
  g+=`<path d="M56 56 Q60 46 ${hx-4} ${hy+4} L${hx+4} ${hy+10} Q64 54 62 62Z" fill="${c1}" ${sw}/>`;
  const hl=st>=2?16:st===1?12:8;
  g+=`<path d="M${hx-6} ${hy-6} Q${hx-12} ${hy-6-hl/2} ${hx-14} ${hy-6-hl}" fill="none" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><path d="M${hx-6} ${hy-6} Q${hx-12} ${hy-6-hl/2} ${hx-14} ${hy-6-hl}" fill="none" stroke="${c3}" stroke-width="3.6" stroke-linecap="round"/>`;
  g+=`<ellipse cx="${hx+11}" cy="${hy+5}" rx="11" ry="7" fill="${c1}" ${sw}/><circle cx="${hx}" cy="${hy}" r="${st===0?13:11.5}" fill="${c1}" ${sw}/><path d="M${hx+2} ${hy+3} Q${hx+12} ${hy+7} ${hx+20} ${hy+4}" fill="none" stroke="${c1}" stroke-width="5"/>`;
  g+=`<path d="M${hx+6} ${hy+10} Q${hx+14} ${hy+13} ${hx+21} ${hy+8}" fill="none" ${sw} stroke-width="1.7"/><ellipse cx="${hx+19}" cy="${hy+1}" rx="1.6" ry="1.2" fill="#2b201b"/>`;
  g+=`<path d="M${hx+1} ${hy-8} Q${hx+5} ${hy-6-hl} ${hx+9} ${hy-6-hl}" fill="none" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><path d="M${hx+1} ${hy-8} Q${hx+5} ${hy-6-hl} ${hx+9} ${hy-6-hl}" fill="none" stroke="${c3}" stroke-width="3.6" stroke-linecap="round"/>`;
  g+=eyeP(hx+4,hy-1,st===0?5:4.2,st);
  if(st>=2) g+=`<circle cx="${hx+25}" cy="${hy+3}" r="2" fill="#ffb000" opacity=".9"/><circle cx="${hx+29}" cy="${hy}" r="1.4" fill="#ff6a3d" opacity=".8"/>`;
  return g;
}
function drawBird(c1,c2,c3,st){
  const dk=shade(c1,-26); const c2d=shade(c2,-22);
  let g='';
  const tl=st===0?8:st===1?12:15;
  for(let k=0;k<2+st;k++){ const a=k*7; g+=`<path d="M28 ${62-a/2} Q${20-tl} ${56-a-tl/2} ${14-tl} ${50-a-tl/2} Q${22-tl/2} ${62-a/2} 30 ${68-a/3}Z" fill="${k%2?c3:c2}" ${sw} stroke-width="1.8"/>`; }
  g+=`<path d="M44 76 L42 88 M42 88 l-5 2 M42 88 l4 2 M54 76 L55 88 M55 88 l-4 2 M55 88 l5 2" stroke="#e88a12" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  g+=`<path d="M44 76 L42 88 M54 76 L55 88" stroke="${OL}" stroke-width="5" stroke-linecap="round" opacity=".0"/>`;
  g+=`<ellipse cx="47" cy="60" rx="${st===0?19:22}" ry="${st===0?17:19}" fill="${c1}" ${sw}/>`;
  g+=`<path d="M52 56 Q68 62 60 76 Q50 80 44 76 Q58 70 52 56Z" fill="${c3}"/>`;
  g+=`<path d="M28 64 Q46 82 66 66 Q58 80 46 80 Q32 78 28 64Z" fill="${dk}" opacity=".45"/>`;
  const hx=st===0?64:67, hy=st===0?40:38, hr=st===0?13:11.5;
  for(let k=0;k<st+2;k++){ const x=hx-6+k*4.5; g+=`<path d="M${x} ${hy-hr+3} Q${x-6-k*2} ${hy-hr-10-st*3} ${x-1} ${hy-hr-13-st*4+k*2} Q${x+2} ${hy-hr-4} ${x+4} ${hy-hr+3}Z" fill="${c2}" ${sw} stroke-width="1.6"/>`; }
  g+=`<circle cx="${hx}" cy="${hy}" r="${hr}" fill="${c1}" ${sw}/>`;
  g+=`<path d="M${hx+hr-3} ${hy-2} L${hx+hr+11} ${hy+2} L${hx+hr-3} ${hy+6}Z" fill="#ffb000" ${sw} stroke-width="1.8"/><path d="M${hx+hr-3} ${hy+2} L${hx+hr+8} ${hy+2.5}" stroke="${OL}" stroke-width="1.2"/>`;
  g+=eyeP(hx+3,hy-2,st===0?4.8:4.2,st);
  const ww=st===0?1:st===1?1.15:1.3;
  g+=`<path d="M34 54 Q46 ${46-4*ww} ${58} 56 Q${54} ${70+4*ww} ${30-6*ww} ${74+3*ww} Q${30} ${64} 34 54Z" fill="${c2}" ${sw}/><path d="M38 62 Q46 66 52 62 M36 68 Q44 72 50 68" fill="none" stroke="${c2d}" stroke-width="1.6"/>`;
  g+=`<ellipse cx="44" cy="52" rx="6" ry="2.2" fill="#fff" opacity=".35" transform="rotate(-15 44 52)"/>`;
  return g;
}
function drawBug(c1,c2,c3,st){
  const dk=shade(c1,-30);
  let g='';
  if(st>=1){ const w=st>=2?1.3:1; g+=`<ellipse cx="${40}" cy="${40-4*w}" rx="${16*w}" ry="${8*w}" fill="${c3}" opacity=".7" ${sw} stroke-width="1.6" transform="rotate(-24 40 ${40-4*w})"/>`;
    if(st>=2) g+=`<ellipse cx="34" cy="44" rx="15" ry="7" fill="${c3}" opacity=".6" ${sw} stroke-width="1.4" transform="rotate(-8 34 44)"/>`; }
  g+=`<path d="M50 68 L44 86 M56 68 L56 88 M62 66 L68 86" stroke="${OL}" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M50 68 L44 86 M56 68 L56 88 M62 66 L68 86" stroke="${dk}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
  if(st>=2) g+=`<path d="M16 66 L6 70 L16 72Z" fill="${c2}" ${sw} stroke-width="1.6"/>`;
  g+=`<ellipse cx="34" cy="64" rx="${st===0?15:19}" ry="${st===0?12:14}" fill="${c1}" ${sw}/>`;
  g+=`<path d="M${st===0?26:22} 56 Q${st===0?24:20} 64 ${st===0?26:22} 72 M34 52 Q31 64 34 76 M42 53 Q40 64 42 75" fill="none" stroke="${c2}" stroke-width="3.2" stroke-linecap="round"/>`;
  g+=`<path d="M18 68 Q34 82 50 68 Q46 78 34 78 Q22 78 18 68Z" fill="${dk}" opacity=".45"/>`;
  g+=`<ellipse cx="54" cy="60" rx="10" ry="10" fill="${shade(c1,-12)}" ${sw}/>`;
  const hx=st===0?67:69, hy=st===0?52:50, hr=st===0?12:11;
  g+=`<path d="M${hx+2} ${hy-10} Q${hx+6} ${hy-24} ${hx+15} ${hy-26-st*3}" fill="none" stroke="${OL}" stroke-width="4.6" stroke-linecap="round"/><path d="M${hx+2} ${hy-10} Q${hx+6} ${hy-24} ${hx+15} ${hy-26-st*3}" fill="none" stroke="${c2}" stroke-width="2" stroke-linecap="round"/><circle cx="${hx+15}" cy="${hy-26-st*3}" r="3.4" fill="${c2}" ${sw} stroke-width="1.6"/>`;
  g+=`<path d="M${hx-4} ${hy-10} Q${hx-4} ${hy-24} ${hx+4} ${hy-28-st*3}" fill="none" stroke="${OL}" stroke-width="4.6" stroke-linecap="round"/><path d="M${hx-4} ${hy-10} Q${hx-4} ${hy-24} ${hx+4} ${hy-28-st*3}" fill="none" stroke="${c2}" stroke-width="2" stroke-linecap="round"/><circle cx="${hx+4}" cy="${hy-28-st*3}" r="3.4" fill="${c2}" ${sw} stroke-width="1.6"/>`;
  g+=`<circle cx="${hx}" cy="${hy}" r="${hr}" fill="${c1}" ${sw}/>`;
  g+=`<path d="M${hx+hr-3} ${hy+5} q5 1 6 5 q-4 0 -6 -2" fill="${c2}" ${sw} stroke-width="1.5"/>`;
  g+=`<ellipse cx="${hx+4}" cy="${hy-1}" rx="${st===0?5.6:5}" ry="${st===0?6.5:6}" fill="#1c1410"/><circle cx="${hx+5.5}" cy="${hy-3.5}" r="1.8" fill="#fff"/><circle cx="${hx+3}" cy="${hy+2}" r="1" fill="#fff" opacity=".7"/>`;
  if(st>=1) g+=`<path d="M${hx-3} ${hy-8} L${hx+9} ${hy-6}" stroke="${OL}" stroke-width="2.2" stroke-linecap="round"/>`;
  g+=`<ellipse cx="30" cy="58" rx="6" ry="2.4" fill="#fff" opacity=".35" transform="rotate(-20 30 58)"/>`;
  return g;
}
function drawDummy(c1,c2){
  return `<rect x="47" y="70" width="6" height="22" fill="#8a5a2b" ${sw}/><rect x="24" y="44" width="52" height="6" rx="3" fill="#8a5a2b" ${sw}/>
    <ellipse cx="50" cy="58" rx="20" ry="22" fill="${c1}" ${sw}/><path d="M34 66 Q50 82 66 66 Q60 78 50 79 Q40 78 34 66Z" fill="${shade(c1,-25)}" opacity=".6"/>
    <path d="M34 46 L30 40 M66 46 L70 40 M32 62 L26 64 M68 62 L74 64 M40 78 L36 84 M60 78 L64 84" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>
    <rect x="54" y="60" width="9" height="8" rx="1.5" fill="#c9745a" transform="rotate(12 58 64)" ${sw} stroke-width="1.2"/>
    <circle cx="43" cy="52" r="3.6" fill="#3a2a1a"/><circle cx="57" cy="52" r="3.6" fill="#3a2a1a"/><circle cx="44" cy="51" r="1" fill="#fff"/><circle cx="58" cy="51" r="1" fill="#fff"/>
    <path d="M42 62 L45 60 L48 62 L51 60 L54 62 L57 60" stroke="#3a2a1a" stroke-width="1.6" fill="none"/>
    <path d="M38 38 Q50 30 62 38 L60 42 Q50 37 40 42Z" fill="${c2}" ${sw} stroke-width="1.6"/>`;
}
function monSVG(spId, lvl, cls){
  const sp = SPI[spId]; const st = stageOf(lvl);
  const custom = CUSTOM_ART[spId];
  if(custom){ const src = Array.isArray(custom)? (custom[st]||custom[custom.length-1]) : custom;
    return `<svg class="${cls||''}" viewBox="0 0 100 100"><image href="${src}" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMax meet"/></svg>`; }
  const shape = FAM[sp.fam].shape; const [c1,c2,c3] = sp.col;
  const sc = [0.8,0.92,1][st];
  const g = shape==='turtle'?drawTurtle(c1,c2,c3,st): shape==='cat'?drawCat(c1,c2,c3,st): shape==='hound'?drawHound(c1,c2,c3,st):
            shape==='dragon'?drawDragon(c1,c2,c3,st): shape==='bird'?drawBird(c1,c2,c3,st): shape==='bug'?drawBug(c1,c2,c3,st): drawDummy(c1,c2);
  return `<svg class="${cls||''}" viewBox="-4 0 108 100"><g transform="translate(50 92) scale(${sc}) translate(-50 -92)">${g}</g></svg>`;
}
