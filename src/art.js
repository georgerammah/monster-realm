// ===== ART =====
function eyes(x1,x2,y,r){
  const e=(x)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x+r*0.15}" cy="${y+r*0.12}" r="${r*0.62}" fill="#1c1c1e"/><circle cx="${x+r*0.38}" cy="${y-r*0.25}" r="${r*0.24}" fill="#fff"/>`;
  return e(x1)+e(x2);
}
function smile(x,y,w){ return `<path d="M${x-w} ${y} Q${x} ${y+w*0.9} ${x+w} ${y}" stroke="#1c1c1e" stroke-width="1.8" fill="none" stroke-linecap="round"/>`; }
function cheeks(x1,x2,y){ return `<ellipse cx="${x1}" cy="${y}" rx="3.4" ry="2" fill="#ff7a9a" opacity=".45"/><ellipse cx="${x2}" cy="${y}" rx="3.4" ry="2" fill="#ff7a9a" opacity=".45"/>`; }
function feet(c){ return `<ellipse cx="38" cy="84" rx="8" ry="4.5" fill="${c}"/><ellipse cx="62" cy="84" rx="8" ry="4.5" fill="${c}"/>`; }

function monSVG(spId, lvl, cls){
  const sp = SPI[spId]; const shape = FAM[sp.fam].shape; const [c1,c2,c3] = sp.col;
  const st = stageOf(lvl);
  const sc = [0.8,0.92,1][st];
  let g='';
  const body = `<ellipse cx="50" cy="62" rx="25" ry="22" fill="${c1}"/><ellipse cx="50" cy="68" rx="14" ry="11" fill="${c3}"/>`;
  const face = eyes(41,59,56,5.2)+smile(50,64,3.4)+cheeks(35,65,63);
  if(shape==='turtle'){
    let spikes='';
    if(st>=2) for(let k=0;k<5;k++){ const x=26+k*12; spikes+=`<path d="M${x-4} ${36-(k%4?0:2)+Math.abs(k-2)*3} L${x} ${24+Math.abs(k-2)*4} L${x+4} ${36+Math.abs(k-2)*3} Z" fill="${c3}"/>`; }
    g += spikes + `<ellipse cx="50" cy="56" rx="34" ry="28" fill="${c2}"/>`;
    g += `<path d="M30 46 L40 40 L50 44 L60 40 L70 46 M40 40 L40 30 M60 40 L60 30" stroke="${c3}" stroke-width="2" fill="none" opacity=".5"/>`;
    if(st>=1) g+=`<path d="M18 62 Q8 58 12 70 Q18 70 22 66Z" fill="${c1}"/><path d="M82 62 Q92 58 88 70 Q82 70 78 66Z" fill="${c1}"/>`;
    g += feet(c1) + body + face;
  } else if(shape==='cat'){
    g += `<path d="M72 74 Q92 70 86 50 ${st>=1?'L92 46 L84 42 L88 34':''}" stroke="${c1}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    if(st>=2) for(let k=0;k<8;k++){ const a=Math.PI*(1.05+k*0.13); g+=`<path d="M${50+Math.cos(a)*22} ${58+Math.sin(a)*20} L${50+Math.cos(a+0.08)*34} ${58+Math.sin(a+0.08)*32} L${50+Math.cos(a+0.16)*22} ${58+Math.sin(a+0.16)*20}Z" fill="${c2}"/>`; }
    g += `<path d="M28 50 L30 ${st>=1?24:30} L44 42Z" fill="${c1}"/><path d="M72 50 L70 ${st>=1?24:30} L56 42Z" fill="${c1}"/><path d="M31 46 L32 34 L40 42Z" fill="${c3}"/><path d="M69 46 L68 34 L60 42Z" fill="${c3}"/>`;
    g += feet(c1) + body;
    g += `<path d="M50 41 L46 48 L50 48 L47 54" stroke="${c2}" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`;
    g += face + `<path d="M28 62 L18 60 M28 65 L18 66 M72 62 L82 60 M72 65 L82 66" stroke="#1c1c1e" stroke-width="1" opacity=".5"/>`;
  } else if(shape==='hound'){
    g += `<ellipse cx="50" cy="70" rx="26" ry="16" fill="${c1}"/><ellipse cx="50" cy="74" rx="14" ry="8" fill="${c3}"/>` + feet(c2);
    g += `<circle cx="40" cy="72" r="3" fill="${c2}" opacity=".5"/><circle cx="62" cy="68" r="2.4" fill="${c2}" opacity=".5"/>`;
    const heads = st===0?[[50,50,1]]: st===1?[[38,50,.82],[62,50,.82]] : [[28,54,.7],[72,54,.7],[50,44,.85]];
    heads.forEach(([x,y,s])=>{
      g += `<g transform="translate(${x} ${y}) scale(${s}) translate(-50 -50)">
        <path d="M30 40 L26 22 L42 34Z" fill="${c2}"/><path d="M70 40 L74 22 L58 34Z" fill="${c2}"/>
        <ellipse cx="50" cy="50" rx="21" ry="18" fill="${c1}"/><ellipse cx="50" cy="58" rx="10" ry="7" fill="${c3}"/>
        <ellipse cx="50" cy="54" rx="3.5" ry="2.6" fill="#1c1c1e"/>${eyes(42,58,46,4.6)}${smile(50,60,3)}</g>`;
    });
  } else if(shape==='dragon'){
    if(st>=1){ const w=st>=2?1.25:1; g+=`<path d="M30 56 Q${30-24*w} ${30-10*w} ${12-6*w} ${46} Q20 50 18 60 Q24 56 30 64Z" fill="${c2}"/><path d="M70 56 Q${70+24*w} ${30-10*w} ${88+6*w} 46 Q80 50 82 60 Q76 56 70 64Z" fill="${c2}"/>`; }
    g += `<path d="M70 76 Q90 80 88 64" stroke="${c1}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M88 64 Q84 54 90 50 Q96 58 88 64Z" fill="#ffb000"/>`;
    g += `<path d="M36 44 Q30 ${st>=2?22:32} ${st>=2?22:28} ${st>=2?24:34} Q32 36 40 42Z" fill="${c3}"/><path d="M64 44 Q70 ${st>=2?22:32} ${st>=2?78:72} ${st>=2?24:34} Q68 36 60 42Z" fill="${c3}"/>`;
    g += feet(c1) + body + `<path d="M42 64 H58 M43 69 H57 M45 74 H55" stroke="${c2}" stroke-width="1.4" opacity=".45"/>` + face;
    if(st>=2) g+=`<path d="M46 38 L50 30 L54 38Z" fill="${c2}"/>`;
  } else if(shape==='bird'){
    const n=st+1; for(let k=0;k<n;k++){ const x=50+(k-(n-1)/2)*7; g+=`<path d="M${x} 42 Q${x-6+k*3} ${26-st*3} ${x+4} ${24-st*3} Q${x+3} 34 ${x+2} 42Z" fill="${c2}"/>`; }
    const w = st>=1?1.3:1;
    g += `<ellipse cx="${26-4*w}" cy="62" rx="${8*w}" ry="${15*w}" fill="${c2}" transform="rotate(20 ${26-4*w} 62)"/><ellipse cx="${74+4*w}" cy="62" rx="${8*w}" ry="${15*w}" fill="${c2}" transform="rotate(-20 ${74+4*w} 62)"/>`;
    g += `<path d="M40 84 L44 90 L48 84 M52 84 L56 90 L60 84" stroke="#ffb000" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    g += body + eyes(41,59,55,5.2) + `<path d="M45 61 L55 61 L50 68Z" fill="#ffb000"/>` + cheeks(35,65,63);
  } else if(shape==='bug'){
    if(st>=1){ g+=`<ellipse cx="28" cy="48" rx="${st>=2?18:13}" ry="${st>=2?12:9}" fill="${c3}" opacity=".75" transform="rotate(-25 28 48)" stroke="${c2}" stroke-width="1"/><ellipse cx="72" cy="48" rx="${st>=2?18:13}" ry="${st>=2?12:9}" fill="${c3}" opacity=".75" transform="rotate(25 72 48)" stroke="${c2}" stroke-width="1"/>`;
      if(st>=2) g+=`<ellipse cx="26" cy="66" rx="12" ry="7" fill="${c3}" opacity=".6" transform="rotate(20 26 66)"/><ellipse cx="74" cy="66" rx="12" ry="7" fill="${c3}" opacity=".6" transform="rotate(-20 74 66)"/>`; }
    g += `<path d="M42 42 Q38 30 32 ${st>=2?20:26}" stroke="${c2}" stroke-width="2" fill="none"/><path d="M58 42 Q62 30 68 ${st>=2?20:26}" stroke="${c2}" stroke-width="2" fill="none"/><circle cx="32" cy="${st>=2?20:26}" r="3" fill="${c2}"/><circle cx="68" cy="${st>=2?20:26}" r="3" fill="${c2}"/>`;
    g += feet(c2) + body + `<path d="M30 72 Q50 78 70 72 M28 78 Q50 86 72 78" stroke="${c2}" stroke-width="2.4" fill="none" opacity=".55"/>` + face;
  }
  if(shape==='dummy'){
    g = `<rect x="47" y="70" width="6" height="22" fill="#8a5a2b"/><rect x="24" y="44" width="52" height="6" rx="3" fill="#8a5a2b"/>
      <ellipse cx="50" cy="58" rx="20" ry="22" fill="${c1}"/><path d="M34 46 L30 40 M66 46 L70 40 M32 62 L26 64 M68 62 L74 64 M40 78 L36 84 M60 78 L64 84" stroke="${c2}" stroke-width="2" stroke-linecap="round"/>
      <rect x="54" y="60" width="9" height="8" rx="1.5" fill="#c9745a" transform="rotate(12 58 64)"/><path d="M55 61 L62 67 M62 61 L55 67" stroke="#7a3a2a" stroke-width="1"/>
      <circle cx="43" cy="52" r="3.6" fill="#3a2a1a"/><circle cx="57" cy="52" r="3.6" fill="#3a2a1a"/><circle cx="44" cy="51" r="1" fill="#fff"/><circle cx="58" cy="51" r="1" fill="#fff"/>
      <path d="M42 62 L45 60 L48 62 L51 60 L54 62 L57 60" stroke="#3a2a1a" stroke-width="1.6" fill="none"/>
      <path d="M38 38 Q50 30 62 38 L60 42 Q50 37 40 42Z" fill="${c2}"/>`;
  }
  return `<svg class="${cls||''}" viewBox="0 0 100 100"><g transform="translate(50 92) scale(${sc}) translate(-50 -92)">${g}</g></svg>`;
}
