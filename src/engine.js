// ===== DATA =====
const EL = {
  water:{n:'Water',c:'#22a6e3'}, fire:{n:'Fire',c:'#e3262d'}, bolt:{n:'Lightning',c:'#f7b500'},
  nature:{n:'Nature',c:'#1fa03a'}, earth:{n:'Earth',c:'#a2845e'}, wind:{n:'Wind',c:'#4fc3e8'}, neutral:{n:'Physical',c:'#f05a22'}
};
const STRONG = {water:['fire'], fire:['nature','wind'], nature:['water','earth'], bolt:['water','wind'], earth:['bolt','fire'], wind:['nature']};
function elemMult(a, d){
  return 1; // monsters have no types
  if(!STRONG[a]) return 1;
  if(STRONG[a].includes(d)) return 1.35;
  if(STRONG[d] && STRONG[d].includes(a)) return 0.75;
  return 1;
}

const FAM = {
  shell:{n:'Turtle', el:'water', shape:'turtle', base:{hp:79,atk:15,mp:45,spd:8}},
  volt:{n:'Feline', el:'bolt', shape:'cat', base:{hp:71,atk:17,mp:45,spd:14}},
  hound:{n:'Cerberus', el:'fire', shape:'hound', base:{hp:80,atk:15,mp:44,spd:11}},
  drake:{n:'Dragon', el:'fire', shape:'dragon', base:{hp:76,atk:16,mp:44,spd:10}},
  wing:{n:'Avian', el:'wind', shape:'bird', base:{hp:72,atk:16,mp:46,spd:15}},
  bug:{n:'Insect', el:'nature', shape:'bug', base:{hp:74,atk:15,mp:48,spd:12}},
  dummy:{n:'Training Dummy', el:'neutral', shape:'dummy', base:{hp:50,atk:5,mp:10,spd:4}}
};

// ===== ABILITIES =====
// k: hit | dot | shield | buff | debuff | heal | drain | passive
// t: enemy | self | ally | allE | allA | passive.  mp:[base, per level]
const SK = {
  basic:{n:'Attack', el:'neutral', t:'enemy', k:'hit', mp:[0,0], m:[1,0]},
  devour:{n:'Devour', el:'neutral', t:'enemy', k:'hit', mp:[5,5], m:[1,0], leech:.5, leechL:[.5,.05]},
  souleater:{n:'Soul Eater', el:'neutral', t:'enemy', k:'hit', mp:[8,4], m:[.8,.02], mpAtk:[.4,.01]},
  blast:{n:'Blast', el:'fire', t:'enemy', k:'hit', mp:[16,8], dmg:[22,13], pierce:1},
  furyfist:{n:'Fury Fist', el:'neutral', t:'passive', k:'passive', p:'fury', v:[.12,.03]},
  emberspit:{n:'Ember Spit', el:'fire', t:'enemy', k:'hit', mp:[12,6], dmg:[16,9], burn:[.4,.03], btick:[5,3]},
  double:{n:'Double Attack', el:'neutral', t:'enemy', k:'hit', mp:[14,7], dmg:[11,7], hits:2},
  pounce:{n:'Pounce', el:'neutral', t:'passive', k:'passive', p:'pounce', v:[.05,.01]},
  shock:{n:'Shock', el:'bolt', t:'enemy', k:'hit', mp:[14,7], dmg:[18,10], stun:[.2,.02]},
  bolt:{n:'Bolt', el:'bolt', t:'enemy', k:'hit', mp:[20,12], dmg:[26,13], dbl:.5},
  staticd:{n:'Static Discharge', el:'bolt', t:'enemy', k:'hit', mp:[20,9], dmg:[20,12], stormTick:[14,12], stormTurns:2},
  spark:{n:'Spark', el:'bolt', t:'self', k:'buff', mp:[10,6], buff:'crit', v:[.40,.04], turns:4},
  stormcloud:{n:'Storm Cloud', el:'bolt', t:'enemy', k:'dot', mp:[16,8], dot:'storm', tick:[8,5], turns:3},
  splash:{n:'Splash', el:'water', t:'enemy', k:'hit', mp:[15,8], dmg:[25,13], bubble:1},
  wave:{n:'Wave', el:'water', t:'enemy', k:'hit', mp:[18,8], dmg:[16,9], weaken:[.15,.02]},
  blizzard:{n:'Blizzard', el:'water', t:'enemy', k:'hit', mp:[18,9], dmg:[17,10], stun:[.25,.02]},
  moltencore:{n:'Molten Core', el:'fire', t:'enemy', k:'hit', mp:[24,13], dmg:[32,20], recoil:.3},
  flame:{n:'Flame', el:'fire', t:'enemy', k:'hit', mp:[15,8], dmg:[17,10], burnBonus:.7},
  firewall:{n:'Fire Wall', el:'fire', t:'enemy', k:'hit', mp:[20,9], dmg:[14,8], selfShield:[20,12]},
  burn:{n:'Burn', el:'fire', t:'enemy', k:'dot', mp:[20,9], dot:'burn', tick:[10,6], turns:3},
  poison:{n:'Poison', el:'nature', t:'enemy', k:'dot', mp:[16,8], dot:'poison', tick:[7,4], turns:4},
  leech:{n:'Leech', el:'nature', t:'enemy', k:'hit', mp:[14,7], dmg:[16,9], leech:.5},
  absorb:{n:'Absorb', el:'water', t:'self', k:'buff', mp:[11,6], buff:'absorb', v:[.26,.03], turns:4},
  feedback:{n:'Feedback', el:'neutral', t:'enemy', k:'hit', mp:[12,6], dmg:[13,7], burnmp:[12,6]},
  feed:{n:'Feed', el:'nature', t:'enemy', k:'drain', mp:[14,8], stealHp:[18,11]},
  naturespower:{n:"Nature's Power", el:'nature', t:'enemy', k:'hit', mp:[20,10], dmg:[16,9], missingBonus:1.4},
  aircurrent:{n:'Air Current', el:'wind', t:'enemy', k:'hit', mp:[14,7], dmg:[16,9], selfevade:[.2,.02]},
  bubble:{n:'Bubble Shield', el:'water', t:'self', k:'shield', mp:[14,7], sh:'bubble', amt:[35,22.5], turns:3},
  lshield:{n:'Lightning Shield', el:'bolt', t:'self', k:'shield', mp:[12,6], sh:'lsh', amt:[22,14], turns:3},
  fshield:{n:'Fire Shield', el:'fire', t:'self', k:'shield', mp:[12,6], sh:'fsh', amt:[45,25], turns:3},
  nshield:{n:'Nature Shield', el:'nature', t:'self', k:'shield', mp:[14,6], sh:'nsh', amt:[28,16], turns:3},
  mshield:{n:'Mana Shield', el:'neutral', t:'self', k:'buff', mp:[10,5], buff:'mshield', v:[.13,.06], turns:4},
  firefocus:{n:'Fire Focus', el:'fire', t:'self', k:'buff', mp:[12,6], buff:'focus', v:[.2,.06], turns:3},
  charge:{n:'Charge', el:'neutral', t:'self', k:'buff', mp:[10,5], buff:'charge', v:[.19,.149], turns:3},
  flicker:{n:'Flicker', el:'neutral', t:'self', k:'buff', mp:[14,6], buff:'evade', v:[.25,.03], turns:3},
  cripple:{n:'Cripple', el:'neutral', t:'enemy', k:'debuff', mp:[24,7], buff:'cripple', v:[.16,.059], turns:3},
  hydrate:{n:'Hydrate', el:'water', t:'self', k:'heal', mp:[14,7], heal:[.2,.03]},
  roots:{n:'Roots', el:'nature', t:'passive', k:'passive', p:'roots', v:[.03,.005]},
  purge:{n:'Purge', el:'water', t:'self', k:'heal', mp:[12,6], heal:[.1,.02], cleanse:1},
  perseverance:{n:'Perseverance', el:'neutral', t:'self', k:'buff', mp:[12,6], buff:'pers', v:[.15,.04], turns:3},
  grounded:{n:'Grounded', el:'earth', t:'passive', k:'passive', p:'grounded', v:[.3,.03]},
  sweaty:{n:'Sweaty', el:'water', t:'passive', k:'passive', p:'sweaty', v:[.25,.03]},
  thickskin:{n:'Thick Skin', el:'neutral', t:'passive', k:'passive', p:'thick', v:[.08,.015]},
  hardened:{n:'Hardened', el:'earth', t:'passive', k:'passive', p:'hard', v:[.15,.02]},
  zap:{n:'Zap', el:'bolt', t:'enemy', k:'hit', mp:[8,5], dmg:[14,8]},
  thunder:{n:'Thunder', el:'bolt', t:'enemy', k:'hit', mp:[24,12], dmg:[30,16], stun:[.15,.02]},
  arclightning:{n:'Arc Lightning', el:'bolt', t:'enemy', k:'hit', mp:[18,9], dmg:[12,7], hits:2},
  regrowth:{n:'Regrowth', el:'nature', t:'self', k:'heal', mp:[14,7], hot:[.06,.01], turns:4},
  manaheal:{n:'Mana Heal', el:'water', t:'self', k:'heal', mp:[20,10], heal:[.25,.03]},
  natureswill:{n:"Nature's Will", el:'nature', t:'self', k:'buff', mp:[12,6], buff:'charge', v:[.15,.03], turns:3},
  invuln:{n:'Invulnerability', el:'neutral', t:'self', k:'shield', mp:[30,10], sh:'ash', amt:[999,0], turns:1},
  manashards:{n:'Mana Shards', el:'water', t:'enemy', k:'hit', mp:[16,8], dmg:[18,10], burnmp:[10,5]},
  toxicfumes:{n:'Toxic Fumes', el:'nature', t:'enemy', k:'dot', mp:[18,9], dot:'poison', tick:[9,5], turns:3},
  berserk:{n:'Berserk', el:'neutral', t:'self', k:'buff', mp:[16,8], buff:'charge', v:[.3,.04], turns:3},
  trample:{n:'Trample', el:'neutral', t:'enemy', k:'hit', mp:[12,6], m:[1.1,.05], stun:[.15,.02]},
  camelback:{n:'Camel Back', el:'water', t:'passive', k:'passive', p:'camel', v:[3,1]}
};
const BUFF_N = {pers:'Perseverance', bubble:'Bubble', lsh:'Spark shield', fsh:'Fire shield', nsh:'Leaf shield', mshield:'Mana Shield', absorb:'Absorb', crit:'Spark', focus:'Focus', charge:'Charged', evade:'Evasive', cripple:'Crippled', roots:'Roots', heal:'Heal'};
const lv = (arr,L)=> arr[0]+arr[1]*(L-1);
function skDmg(id,L,m){ const s=SK[id]; return s.dmg? Math.round(lv(s.dmg,L)) : Math.round(m.atk*(s.m?lv(s.m,L):1)); }
function skCost(id,L){ const s=SK[id]; if(!s||!s.mp) return 0; return Math.round(lv(s.mp,L||1)); }
const pct = x=>Math.round(x*100)+'%';
function skillDesc(id, L){
  L=L||1; const s=SK[id];
  const tg={enemy:'one foe', allE:'all foes', self:'itself'}[s.t]||'';
  switch(s.k){
    case 'hit': { let t= s.dmg?`Deals ${Math.round(lv(s.dmg,L))} damage to ${tg}${s.hits?` ×${s.hits}`:''}`:'A basic attack using your monster\'s attack stat';
      if(s.burn) t+=`, ${pct(lv(s.burn,L))} chance to burn`; if(s.stun) t+=`, ${pct(lv(s.stun,L))} chance to stun`;
      if(s.leech) t+=', heals for half the damage'; if(s.mpgain) t+=', restores mana equal to half the damage'; if(s.burnmp) t+=`, burns ${Math.round(lv(s.burnmp,L))} enemy mana`;
      if(s.selfevade) t+=`, then ${pct(lv(s.selfevade,L))} dodge for 2 turns`;
      if(s.pierce) t+=', ignores shields'; if(s.fullBonus) t+=`; +${pct(s.fullBonus)} damage if the foe is at full life`;
      if(s.drainFrac) t+=`, drains foe mana equal to ${pct(s.drainFrac)} of the damage`; if(s.selfCleanse) t+=', and washes off your burn and poison';
      if(s.weaken) t+=`; the foe deals ${pct(lv(s.weaken,L))} less damage for 2 turns`; if(s.recoil) t+=`, but your monster takes ${pct(s.recoil)} of the damage back`;
      if(s.burnBonus) t+=`; +${pct(s.burnBonus)} damage if the foe is burning`; if(s.selfShield) t+=`, then raises a ${Math.round(lv(s.selfShield,L))} fire shield on yourself`;
      if(s.missingBonus) t+='; hits harder the more life your monster is missing';
      return t+'.'; }
    case 'dot': return `${s.dot==='burn'?'Sets a foe on fire':s.dot==='poison'?'Poisons a foe':'Summons a storm over a foe'}: ${Math.round(lv(s.tick,L))} damage each turn for ${s.turns} turns.`;
    case 'shield': return `Absorbs up to ${Math.round(lv(s.amt,L))} damage${s.sh==='bubble'?' from physical, fire and lightning attacks':s.sh==='fsh'?' from fire and physical attacks, and may burn attackers':s.sh==='lsh'?' and zaps attackers':' and heals a little each turn'} for ${s.turns} turns.`;
    case 'buff': return s.buff==='absorb'?`Your mana heals by ${pct(lv(s.v,L))} of any damage taken for the next ${s.turns} turns.` : s.buff==='mshield'?`Mana absorbs ${pct(lv(s.v,L))} of incoming damage for ${s.turns} turns (1 mana per 2 damage).`
      : s.buff==='pers'?`Deals ${pct(lv(s.v,L))} more damage for ${s.turns} turns, doubled while below 40% life.` : s.buff==='charge'?`The next attack deals ${pct(lv(s.v,L))} more damage.` : s.buff==='focus'?`Deals ${pct(lv(s.v,L))} more damage for ${s.turns} turns.` : `${pct(lv(s.v,L))} chance to dodge attacks for ${s.turns} turns.`;
    case 'debuff': return `The foe deals ${pct(lv(s.v,L))} less damage for ${s.turns} turns.`;
    case 'heal': return s.hot?`Regrows ${pct(lv(s.hot,L))} of max life each turn for ${s.turns} turns.`:`Heals ${pct(lv(s.heal,L))} of max life${s.cleanse?' and removes burn, poison, storm and cripple':''}.`;
    case 'drain': return s.stealHp?`Steals ${Math.round(lv(s.stealHp,L))} life from the foe and heals your monster by that much.`:`Steals ${Math.round(lv(s.steal,L))} mana from a foe.`;
    case 'passive': return ({pers:`Always on: deals ${pct(lv(s.v,L))} more damage while below 40% life.`, grounded:`Always on: takes ${pct(lv(s.v,L))} less lightning damage.`,
      sweaty:`Always on: takes ${pct(lv(s.v,L))} less fire and water damage and often shrugs off burns.`, thick:`Always on: takes ${pct(lv(s.v,L))} less damage from everything.`,
      hard:`Always on: takes ${pct(lv(s.v,L))} less physical damage.`, fury:`Always on: physical attacks deal ${pct(lv(s.v,L))} more damage.`, roots:`Always on: recovers ${pct(lv(s.v,L))} of max life after each of its turns.`, camel:`Always on: regains ${Math.round(lv(s.v,L))} extra mana every turn.`})[s.p];
  }
  return '';
}
const skillDescBase=skillDesc;

// species: id, name, fam, colors [main, accent, light], abilities [start, start, Lv10, Lv20]
const SP = [
  ['tidepip','Tidepip','shell',['#5fb8ff','#2c6fd1','#dff1ff'],['bubble','lshield','wave','roots']],
  ['shellby','Shellby','shell',['#7fd6c2','#2f8f7a','#e6fbf5'],['hydrate','perseverance','blizzard','grounded']],
  ['coraldon','Coraldon','shell',['#ff9fb0','#3f86d8','#fff0f3'],['mshield','firefocus','camelback','pounce']],
  ['brinemaw','Brinemaw','shell',['#6d7fe0','#2a356f','#e6e9ff'],['absorb','splash','purge','sweaty']],
  ['voltkit','Voltkit','volt',['#ffd84d','#3a3a3c','#fff8d6'],['shock','staticd','charge','pounce']],
  ['sparkpaw','Sparkpaw','volt',['#f7a84a','#5b3a8c','#fff1de'],['shock','firefocus','lshield','roots']],
  ['thundra','Thundra','volt',['#b9a7ff','#f5c400','#f3efff'],['stormcloud','purge','cripple','thickskin']],
  ['ampurr','Ampurr','volt',['#9ad7ff','#f7b500','#eef8ff'],['bolt','nshield','spark','sweaty']],
  ['gravelpup','Gravelpup','hound',['#c3a27a','#6e5435','#f5ebdd'],['burn','cripple','fshield','grounded']],
  ['cragmaw','Cragmaw','hound',['#9a9aa3','#4a4a52','#ececf0'],['flicker','poison','burn','thickskin']],
  ['ashfang','Ashfang','hound',['#8f6f5c','#e3262d','#f1e3da'],['blast','furyfist','emberspit','double']],
  ['rubblejaw','Rubblejaw','hound',['#b5c27a','#5d6b2e','#f3f6df'],['moltencore','feed','flame','roots']],
  ['emberling','Emberling','drake',['#ff8a5c','#c23b22','#ffe8dc'],['blast','charge','burn','double']],
  ['scorchet','Scorchet','drake',['#ffb347','#8c2f1c','#fff1dc'],['furyfist','firefocus','emberspit','pounce']],
  ['pyrodrake','Pyrodrake','drake',['#e0475b','#5a1a2a','#ffe3e7'],['firewall','flicker','moltencore','grounded']],
  ['magmaw','Magmaw','drake',['#5c5470','#e3262d','#ecebf2'],['flame','hardened','fshield','thickskin']],
  ['gustling','Gustling','wing',['#8fd3ff','#2a7fb8','#effaff'],['emberspit','leech','blast','double']],
  ['featherby','Featherby','wing',['#ffd1e8','#c2588f','#fff5fa'],['furyfist','bubble','moltencore','roots']],
  ['squallix','Squallix','wing',['#6f8bff','#ffd84d','#eef1ff'],['firewall','flame','fshield','thickskin']],
  ['zephyra','Zephyra','wing',['#e9f2f7','#4fc3e8','#ffffff'],['aircurrent','flicker','charge','pounce']],
  ['mossbug','Mossbug','bug',['#8ed46a','#3d7f2a','#f0fbe8'],['feedback','leech','feed','roots']],
  ['buzzlet','Buzzlet','bug',['#ffd34d','#3a3a3c','#fff8d9'],['double','bubble','pounce','lshield']],
  ['thornet','Thornet','bug',['#b07cd8','#4a2a6a','#f6eefc'],['nshield','poison','naturespower','feedback']],
  ['leafwing','Leafwing','bug',['#5fd3a0','#ff8a5c','#eafff5'],['moltencore','burn','firefocus','thickskin']]
].map(([id,n,fam,col,sk])=>({id,n,fam,col,tw:{},sk}));
const SPI = Object.fromEntries(SP.map(s=>[s.id,s]));
SPI.strawdum={id:'strawdum',n:'Straw Dummy',fam:'dummy',col:['#e2c27a','#8a6a3a','#f6e8c4'],tw:{},sk:['thickskin']};

const MAXLVL = 30, MAXSKL = 10;
const UNLOCK = [1,1,10,20];
function stageOf(lvl){ return lvl>=20?2:lvl>=10?1:0; }
const STAGE_N = ['Baby','Teen','Adult'];
function slotsOf(lvl){ return lvl>=20?4:lvl>=10?3:2; }
function xpNeed(lvl){ return 40 + lvl*22; }
const PT = {atk:2, hp:8, mp:8};
function statsOf(spId, lvl){
  const b = FAM[SPI[spId].fam].base; const st=[1,1.06,1.12][stageOf(lvl)];
  return {hp:Math.round(b.hp*st), atk:Math.round(b.atk*st), mp:Math.round(b.mp*st), spd:Math.round((b.spd+lvl*0.3)*10)/10};
}
function autoBonus(lvl){ const p=(lvl-1)*5/3; return {atk:Math.round(p*PT.atk), hp:Math.round(p*PT.hp), mp:Math.round(p*PT.mp), spd:0}; }
function autoSkl(spId,lvl){ const o={}; SPI[spId].sk.forEach(id=>o[id]=Math.max(1,Math.min(MAXSKL,Math.floor((lvl+2)/3)))); return o; }
function power(spId,lvl){ const s=statsOf(spId,lvl), b=autoBonus(lvl); return Math.round((s.hp+b.hp)*0.4+(s.atk+b.atk)*3); }

// ===== RNG =====
function rnd(b){
  b.rng = (b.rng + 0x6D2B79F5)|0; let t = b.rng;
  t = Math.imul(t ^ (t>>>15), t|1); t ^= t + Math.imul(t ^ (t>>>7), t|61);
  return ((t ^ (t>>>14))>>>0)/4294967296;
}

// ===== BATTLE =====
function freshSt(){ return {burn:0,burnD:0,poison:0,poisonD:0,storm:0,stormD:0,stun:0,bubble:0,bubbleHp:0,lsh:0,lshHp:0,fsh:0,fshHp:0,nsh:0,nshHp:0,mshield:0,mshieldV:0,pers:0,persV:0,focus:0,focusV:0,charge:0,chargeV:0,evade:0,evadeV:0,cripple:0,crippleV:0,roots:0,rootsV:0}; }
function makeMon(spId, lvl, extra){
  lvl = Math.max(1, Math.min(MAXLVL, lvl|0));
  const sp = SPI[spId]; const s = statsOf(spId,lvl);
  const bo=(extra&&extra.bonus)||autoBonus(lvl);
  const hp=s.hp+(bo.hp|0), mp=s.mp+(bo.mp|0);
  const skl=Object.assign({}, (extra&&extra.skl&&Object.keys(extra.skl).length)?extra.skl:autoSkl(spId,lvl));
  const o=Object.assign({sp:spId, n:sp.n, lvl, el:FAM[sp.fam].el, maxhp:hp, hp, maxmp:mp, mp, atk:s.atk+(bo.atk|0), spd:s.spd+(+bo.spd||0),
    sk: sp.sk.slice(0, slotsOf(lvl)), st:freshSt()}, extra||{});
  o.fx={rmp:bo.rmp|0, rhp:bo.rhp|0, dflat:bo.dflat|0, tflat:bo.tflat|0};
  delete o.bonus; o.skl=skl;
  o.pas={}; o.sk.forEach(id=>{ const k=SK[id]; if(k&&k.k==='passive') o.pas[k.p]=lv(k.v, skl[id]||1); });
  return o;
}
function newBattle(teamA, teamB, opts){
  const mk=m=>{ const x=makeMon(m.sp,m.lvl,{uid:m.uid,bonus:m.bonus,skl:m.skl}); if(m.hpMul){ x.maxhp=x.hp=Math.round(x.hp*m.hpMul); x.atk=Math.max(1,Math.round(x.atk*m.hpMul)); } return x; };
  const b = {sides:[{name:teamA.name, mons:teamA.mons.map(mk)},{name:teamB.name, mons:teamB.mons.map(mk)}],
    order:[], turnIdx:0, round:0, rng:(opts&&opts.seed)|| (Math.random()*2**31|0), log:[], ev:[], over:false, winner:null, seq:0, mode:(opts&&opts.mode)||'campaign', single:!!(opts&&opts.single)};
  if(b.single){ b.sides.forEach(sd=>sd.active=null); const f=rnd(b)<.5?0:1; b.phase='pick'; b.pickQ=[f,1-f]; b.pickSide=f; b.first=f; return b; }
  startRound(b); beginTurn(b);
  return b;
}
function alive(b,s){ return b.sides[s].mons.filter(m=>m.hp>0); }
function startRound(b){
  b.round++;
  const arr=[];
  if(b.first==null) b.first=rnd(b)<.5?0:1;
  const f=b.first;
  if(b.single){ [f,1-f].forEach(s=>{ const sd=b.sides[s], m=sd.mons[sd.active]; if(m&&m.hp>0) arr.push([s,sd.active]); }); }
  else { const L=[f,1-f].map(s=>b.sides[s].mons.map((m,i)=>m.hp>0?[s,i]:null).filter(Boolean)); for(let k=0;k<Math.max(L[0].length,L[1].length);k++){ if(L[0][k]) arr.push(L[0][k]); if(L[1][k]) arr.push(L[1][k]); } }
  b.order = arr; b.turnIdx=0;
}
function actor(b){ if(b.single&&b.phase!=='fight') return null; const o=b.order[b.turnIdx]; if(!o) return null; const i=b.single?b.sides[o[0]].active:o[1]; return {s:o[0],i,m:b.sides[o[0]].mons[i]}; }
function log(b,t){ b.log.push(t); if(b.log.length>40) b.log.shift(); }
function checkOver(b){
  if(b.over) return true;
  const a0=alive(b,0).length, a1=alive(b,1).length;
  if(!a0||!a1){ b.over=true; b.winner = a0?0:1; log(b, `${b.sides[b.winner].name} wins!`); return true; }
  return false;
}
function beginTurn(b){
  let guard=0;
  while(!b.over && guard++<300){
    if(b.turnIdx>=b.order.length) startRound(b);
    const a = actor(b); const m=a.m;
    if(m.hp<=0){ b.turnIdx++; continue; }
    const st=m.st;
    ['bubble','lsh','fsh','nsh','mshield','absorb','crit','focus','evade','cripple','pers'].forEach(k=>{ if(st[k]>0){ st[k]--; if(!st[k]&&st[k+'Hp']!=null) st[k+'Hp']=0; } });
    m.mp = Math.min(m.maxmp, m.mp+3+Math.round(m.maxmp*0.03)+Math.round(m.pas.camel||0));
    for(const [k,el,nm] of [['burn','fire','its burn'],['poison','nature','poison'],['storm','bolt','the storm']]){
      if(st[k]>0 && m.hp>0){ const d=Math.max(1,Math.round(st[k+'D'])); m.hp=Math.max(0,m.hp-d); st[k]--; b.ev.push({k:'dot',s:a.s,i:a.i,v:d,el}); log(b,`${m.n} is hurt by ${nm}.`); }
    }
    if(st.roots>0 && m.hp>0){ const h=Math.max(1,Math.round(m.maxhp*st.rootsV)); m.hp=Math.min(m.maxhp,m.hp+h); st.roots--; b.ev.push({k:'heal',s:a.s,i:a.i,v:h}); }
    if(st.nsh>0 && m.hp>0){ const h=Math.max(1,Math.round(m.maxhp*0.04)); m.hp=Math.min(m.maxhp,m.hp+h); b.ev.push({k:'heal',s:a.s,i:a.i,v:h}); }
    if(m.hp<=0){ log(b,`${m.n} fainted.`); if(checkOver(b)) return; if(b.single){ needPicks(b); return; } b.turnIdx++; continue; }
    if(st.stun>0){ st.stun--; log(b,`${m.n} is stunned and can't move!`); b.ev.push({k:'stun',s:a.s,i:a.i}); b.turnIdx++; continue; }
    b.swapped=false;
    return;
  }
}
function needPicks(b){ const q=[]; b.sides.forEach((sd,s)=>{ const m=sd.mons[sd.active]; if(!m||m.hp<=0) q.push(s); }); if(q.length){ b.phase='pick'; b.pickQ=q; b.pickSide=q[0]; return true; } return false; }
function benchOf(b,s){ const sd=b.sides[s]; return sd.mons.map((m,i)=>i).filter(i=>i!==sd.active&&sd.mons[i].hp>0); }
function pick(b,s,idx){
  if(b.over||b.phase!=='pick'||b.pickSide!==s) return false;
  const sd=b.sides[s]; if(!sd.mons[idx]||sd.mons[idx].hp<=0||idx===sd.active) idx=benchOf(b,s)[0];
  if(idx==null) return false;
  sd.active=idx; b.ev=[{k:'enter',s,i:idx}]; log(b,`${sd.name} sent out ${sd.mons[idx].n}!`);
  b.pickQ.shift(); b.seq++;
  if(b.pickQ.length){ b.pickSide=b.pickQ[0]; return true; }
  b.phase='fight'; b.pickSide=null; startRound(b); beginTurn(b); return true;
}
function aiPick(b,s){ const foe=b.sides[1-s].mons[b.sides[1-s].active]; let best=null,bs=-1; benchOf(b,s).forEach(i=>{ const m=b.sides[s].mons[i]; let sc=m.hp/m.maxhp+ (foe?elemMult(m.el,foe.el)-elemMult(foe.el,m.el):0)+Math.random()*.3; if(sc>bs){bs=sc;best=i;} }); return best; }
function castable(m){ return ['basic'].concat(m.sk.filter(id=>SK[id].k!=='passive')); }
function usable(m){ return castable(m).filter(id=>m.mp>=skCost(id,m.skl[id]||1)); }
function validTargets(b, s, skId){
  const t = SK[skId].t;
  if(b.single){ const f=b.sides[1-s]; if(t==='enemy') return f.mons[f.active]&&f.mons[f.active].hp>0?[f.active]:[]; if(t==='ally') return [b.sides[s].active]; return []; }
  if(t==='enemy') return b.sides[1-s].mons.map((m,i)=>m.hp>0?i:-1).filter(i=>i>=0);
  if(t==='ally') return b.sides[s].mons.map((m,i)=>m.hp>0?i:-1).filter(i=>i>=0);
  return [];
}
const SHIELD_VS = {bubble:['neutral','fire','bolt'], lsh:null, fsh:['fire','neutral'], nsh:null, ash:null};
function dealHit(b, as, ds, di, mult, el, dmgMods, pierce){
  const a=as.m; const d = b.sides[ds].mons[di]; if(d.hp<=0) return 0;
  if(d.st.evade>0 && rnd(b)<d.st.evadeV){ b.ev.push({k:'miss',s:ds,i:di}); log(b,`${d.n} dodged!`); return 0; }
  let dmg = mult*elemMult(el, d.el)*(0.9+rnd(b)*0.2);
  dmg *= dmgMods;
  if(a.st.cripple>0) dmg*=1-a.st.crippleV;
  const crit = rnd(b)<(a.st.crit>0?a.st.critV:0.08); if(crit) dmg*=(a.st.crit>0?2:1.5);
  if(a.pas.pounce) dmg*=1+a.pas.pounce;
  if(d.pas.thick) dmg*=1-d.pas.thick;
  if(el==='bolt' && d.pas.grounded) dmg*=1-d.pas.grounded;
  if((el==='fire'||el==='water') && d.pas.sweaty) dmg*=1-d.pas.sweaty;
  if(el==='neutral' && a.pas.fury) dmg*=1+a.pas.fury;
  if(a.st.pers>0) dmg*=1+a.st.persV*(a.hp/a.maxhp<0.4?2:1);
  dmg += (a.fx&&a.fx.dflat||0) + (d.fx&&d.fx.tflat||0);
  if(el==='neutral' && d.pas.hard) dmg*=1-d.pas.hard;
  dmg = Math.max(1, Math.round(dmg));
  let blocked=0;
  for(const sh of (pierce?[]:['bubble','fsh','lsh','nsh','ash'])){
    if(dmg<=0) break;
    if(d.st[sh]>0 && d.st[sh+'Hp']>0 && (!SHIELD_VS[sh] || SHIELD_VS[sh].includes(el))){ const ab=Math.min(dmg, d.st[sh+'Hp']); d.st[sh+'Hp']-=ab; dmg-=ab; blocked+=ab; if(d.st[sh+'Hp']<=0){ d.st[sh]=0; log(b,`${d.n}'s shield broke!`); } }
  }
  if(d.st.mshield>0 && d.mp>0 && dmg>0){ const ab=Math.min(Math.round(dmg*d.st.mshieldV), d.mp*2); d.mp-=Math.ceil(ab/2); dmg-=ab; blocked+=ab; }
  dmg=Math.max(0,dmg);
  d.hp = Math.max(0, d.hp-dmg);
  if(d.st.absorb>0 && dmg>0 && d.hp>0){ const g=Math.min(d.maxmp-d.mp, Math.round(dmg*d.st.absorbV)); if(g>0){ d.mp+=g; } }
  b.ev.push({k:'hit',s:ds,i:di,v:dmg,crit,eff:elemMult(el,d.el)>1?'up':elemMult(el,d.el)<1?'down':'',el,blocked});
  if(d.st.lsh>0 && a.hp>0 && (dmg+blocked)>0){ const r=Math.max(1,Math.round((dmg+blocked)*0.25)); a.hp=Math.max(0,a.hp-r); b.ev.push({k:'hit',s:as.s,i:as.i,v:r,el:'bolt'}); }
  if(d.st.fsh>0 && a.hp>0 && rnd(b)<0.3 && !a.st.burn){ a.st.burn=2; a.st.burnD=6+d.lvl; log(b,`${a.n} got singed!`); }
  if(d.hp<=0) log(b,`${d.n} fainted.`);
  return dmg;
}
function act(b, action){
  if(b.over) return false;
  const a = actor(b); if(!a) return false;
  if(b.single && action && action.swap!=null){
    const i=action.swap; const sd=b.sides[a.s];
    if(!sd.mons[i] || sd.mons[i].hp<=0 || i===sd.active) return false;
    sd.active=i; b.swapped=true; b.order[b.turnIdx]=[a.s,i]; b.ev=[{k:'enter',s:a.s,i}]; log(b,`${sd.name} swapped in ${sd.mons[i].n}!`); b.seq++; return true;
  }
  let skId = action && action.skill;
  if(!skId || !SK[skId] || SK[skId].k==='passive' || !(skId==='basic'||a.m.sk.includes(skId))) skId='basic';
  let L=a.m.skl[skId]||1; let cost=skCost(skId,L);
  if(a.m.mp<cost){ skId='basic'; L=1; cost=0; }
  const sk = SK[skId];
  let tgt = action ? action.target : null;
  const vt = validTargets(b,a.s,skId);
  if(vt.length && !vt.includes(tgt)) tgt = vt[0];
  b.ev = [];
  a.m.mp -= cost;
  b.ev.push({k:'act',s:a.s,i:a.i,sk:skId});
  log(b, `${a.m.n} used ${sk.n}.`);
  const foe = 1-a.s, me=a.m;
  if(sk.k==='hit'){
    let mod=1; if(me.st.focus>0) mod*=1+me.st.focusV; if(me.st.charge>0){ mod*=1+me.st.chargeV; me.st.charge=0; }
    const targets = sk.t==='allE' ? (b.single?[b.sides[foe].active]:b.sides[foe].mons.map((m,i)=>i)).filter(i=>b.sides[foe].mons[i].hp>0) : [tgt];
    let tot=0;
    targets.forEach(ti=>{
      const d0=b.sides[foe].mons[ti]; let tm=mod;
      if(sk.fullBonus && d0.hp>=d0.maxhp) tm*=1+sk.fullBonus;
      if(sk.burnBonus && d0.st.burn>0) tm*=1+sk.burnBonus;
      if(sk.missingBonus) tm*=1+sk.missingBonus*(1-me.hp/me.maxhp);
      if(sk.dbl && rnd(b)<sk.dbl) tm*=2;
      for(let h=0;h<(sk.hits||1);h++) tot+=dealHit(b,a,foe,ti,skDmg(skId,L,me),sk.el,tm,sk.pierce);
      if(sk.stormTick && d0.hp>0){ d0.st.storm=sk.stormTurns; d0.st.stormD=lv(sk.stormTick,L); b.ev.push({k:'buff',s:foe,i:ti,b:'storm'}); }
      if(d0.hp>0 && sk.drainFrac){ const x=Math.min(d0.mp, Math.round(tot*sk.drainFrac)); d0.mp-=x; }
      if(d0.hp>0 && sk.weaken){ d0.st.cripple=2; d0.st.crippleV=Math.max(d0.st.crippleV||0, lv(sk.weaken,L)); b.ev.push({k:'buff',s:foe,i:ti,b:'cripple'}); }
      const d=b.sides[foe].mons[ti]; if(d.hp<=0) return;
      if(sk.burn && rnd(b)<lv(sk.burn,L) && !(d.pas.sweaty && rnd(b)<0.5)){ d.st.burn=3; d.st.burnD=sk.btick?lv(sk.btick,L):8; log(b,`${d.n} was burned!`); }
      if(sk.stun && rnd(b)<lv(sk.stun,L)){ d.st.stun=1; log(b,`${d.n} is stunned!`); }
      if(sk.burnmp){ const x=Math.min(d.mp, Math.round(lv(sk.burnmp,L))); d.mp-=x; }
    });
    if(sk.mpAtk && tot>0 && me.hp>0){ const d1=b.sides[foe].mons[targets[0]]; const x=Math.min(d1?d1.mp:0, Math.round(me.atk*lv(sk.mpAtk,L))); if(x>0){ d1.mp-=x; me.mp=Math.min(me.maxmp,me.mp+x); } }
    if(sk.leech && tot>0 && me.hp>0){ const hv=Math.round(tot*(sk.leechL?lv(sk.leechL,L):sk.leech)); me.hp=Math.min(me.maxhp,me.hp+hv); b.ev.push({k:'heal',s:a.s,i:a.i,v:hv}); }
    if(sk.mpgain && tot>0){ me.mp=Math.min(me.maxmp, me.mp+Math.round(tot*sk.mpgain)); }
    if(sk.recoil && tot>0 && me.hp>0){ const r=Math.max(1,Math.round(tot*sk.recoil)); me.hp=Math.max(0,me.hp-r); b.ev.push({k:'hit',s:a.s,i:a.i,v:r,el:'fire',recoil:1}); log(b,`${me.n} is hurt by the recoil!`); if(me.hp<=0) log(b,`${me.n} fainted.`); }
    if(sk.selfCleanse){ me.st.burn=0; me.st.poison=0; }
    if(sk.selfShield && me.hp>0){ me.st.fsh=3; me.st.fshHp=Math.round(lv(sk.selfShield,L)); b.ev.push({k:'buff',s:a.s,i:a.i,b:'fsh'}); }
    if(sk.selfevade){ me.st.evade=2; me.st.evadeV=lv(sk.selfevade,L); b.ev.push({k:'buff',s:a.s,i:a.i,b:'evade'}); }
  } else if(sk.k==='dot'){
    const d=b.sides[foe].mons[tgt];
    if(d.st.evade>0 && rnd(b)<d.st.evadeV){ b.ev.push({k:'miss',s:foe,i:tgt}); log(b,`${d.n} dodged!`); }
    else if(sk.dot==='burn' && d.pas.sweaty && rnd(b)<0.5){ log(b,`${d.n} shrugged off the burn!`); b.ev.push({k:'miss',s:foe,i:tgt}); }
    else { let mod=1; if(me.st.focus>0) mod*=1+me.st.focusV; d.st[sk.dot]=sk.turns; d.st[sk.dot+'D']=lv(sk.tick,L)*mod; b.ev.push({k:'buff',s:foe,i:tgt,b:sk.dot==='burn'?'burnt':sk.dot}); log(b,`${d.n} is ${sk.dot==='burn'?'burning':sk.dot==='poison'?'poisoned':'under a storm cloud'}!`); }
  } else if(sk.k==='shield'){
    me.st[sk.sh]=sk.turns; me.st[sk.sh+'Hp']=Math.round(lv(sk.amt,L)); b.ev.push({k:'buff',s:a.s,i:a.i,b:sk.sh});
  } else if(sk.k==='buff'){
    me.st[sk.buff]=sk.turns; me.st[sk.buff+'V']=lv(sk.v,L); b.ev.push({k:'buff',s:a.s,i:a.i,b:sk.buff});
  } else if(sk.k==='debuff'){
    const d=b.sides[foe].mons[tgt]; d.st[sk.buff]=sk.turns; d.st[sk.buff+'V']=Math.min(.75,lv(sk.v,L)); b.ev.push({k:'buff',s:foe,i:tgt,b:sk.buff}); log(b,`${d.n} is crippled!`);
  } else if(sk.k==='heal'){
    if(sk.hot){ me.st.roots=sk.turns; me.st.rootsV=lv(sk.hot,L); b.ev.push({k:'buff',s:a.s,i:a.i,b:'roots'}); }
    if(sk.heal){ const hv=Math.round(me.maxhp*lv(sk.heal,L)); me.hp=Math.min(me.maxhp,me.hp+hv); b.ev.push({k:'heal',s:a.s,i:a.i,v:hv}); }
    if(sk.cleanse){ ['burn','poison','storm','cripple','stun'].forEach(k=>me.st[k]=0); }
  } else if(sk.k==='drain' && sk.stealHp){
    const d=b.sides[foe].mons[tgt];
    if(d.st.evade>0 && rnd(b)<d.st.evadeV){ b.ev.push({k:'miss',s:foe,i:tgt}); log(b,`${d.n} dodged!`); }
    else { const x=Math.min(d.hp, Math.max(1,Math.round(lv(sk.stealHp,L)))); d.hp-=x; b.ev.push({k:'hit',s:foe,i:tgt,v:x,el:'nature'}); const hv=Math.min(me.maxhp-me.hp,x); me.hp+=hv; b.ev.push({k:'heal',s:a.s,i:a.i,v:hv}); log(b,`${me.n} fed on ${d.n}!`); if(d.hp<=0) log(b,`${d.n} fainted.`); }
  } else if(sk.k==='drain'){
    const d=b.sides[foe].mons[tgt]; const x=Math.min(d.mp, Math.round(lv(sk.steal,L))); d.mp-=x; me.mp=Math.min(me.maxmp,me.mp+x); log(b,`${me.n} stole ${x} mana!`);
  }
  if(me.hp>0 && !b.over){
    if(me.pas.roots!=null){ const h=Math.min(me.maxhp-me.hp, Math.round(me.maxhp*me.pas.roots)); me.hp+=h; b.ev.push({k:'heal',s:a.s,i:a.i,v:h,end:1}); }
    if(me.fx.rhp){ const h=Math.min(me.maxhp-me.hp, me.fx.rhp); me.hp+=h; b.ev.push({k:'heal',s:a.s,i:a.i,v:h,end:1}); }
    if(me.fx.rmp){ const g=Math.min(me.maxmp-me.mp, me.fx.rmp); me.mp+=g; b.ev.push({k:'mana',s:a.s,i:a.i,v:g,end:1}); }
  }
  b.seq++;
  if(checkOver(b)) return true;
  if(b.single && needPicks(b)) return true;
  b.turnIdx++;
  beginTurn(b);
  return true;
}
function aiChoose(b){
  const a = actor(b); const m=a.m; const foe=1-a.s;
  const foes=b.sides[foe].mons.map((d,i)=>[d,i]).filter(([d])=>d.hp>0);
  let best=null, bestScore=-1;
  const hpPct=m.hp/m.maxhp;
  for(const id of usable(m)){
    const sk=SK[id]; const L=m.skl[id]||1; let score=0, target=null;
    if(sk.k==='hit'){
      const mod=(m.st.focus>0?1+m.st.focusV:1)*(m.st.charge>0?1+m.st.chargeV:1);
      if(sk.t==='allE') score=foes.reduce((t,[d])=>t+skDmg(id,L,m),0)*mod*0.9;
      else for(const [d,i] of foes){ let est=skDmg(id,L,m)*(sk.hits||1)*mod; if(sk.fullBonus&&d.hp>=d.maxhp) est*=1+sk.fullBonus; if(sk.burnBonus&&d.st.burn>0) est*=1+sk.burnBonus; if(sk.missingBonus) est*=1+sk.missingBonus*(1-hpPct); const sc=est*(est>=d.hp?2:1)+(sk.stun?6:0)+(sk.burn?5:0)+(sk.leech&&hpPct<.6?est*.4:0); if(sc>score){score=sc;target=i;} }
      if(sk.recoil && m.hp/m.maxhp<0.35) score*=0.3;
      score -= skCost(id,L)*0.15;
    } else if(sk.k==='dot'){
      for(const [d,i] of foes){ if(d.st[sk.dot]>0) continue; const sc=lv(sk.tick,L)*sk.turns*0.75; if(sc>score){score=sc;target=i;} }
    } else if(sk.k==='shield'){ score = m.st[sk.sh]>0?0: m.atk*(hpPct<0.8?1.6:0.9); }
    else if(sk.k==='buff'){ score = m.st[sk.buff]>0?0: m.atk*(sk.buff==='charge'?1.2:sk.buff==='mshield'?(hpPct<0.6?1.5:0.6):1.1); }
    else if(sk.k==='debuff'){ for(const [d,i] of foes){ if(d.st.cripple>0) continue; const sc=d.atk*1.3; if(sc>score){score=sc;target=i;} } }
    else if(sk.k==='heal'){ score = (sk.hot&&m.st.roots>0)?0: hpPct<0.5? m.atk*2.2 : hpPct<0.75? m.atk*0.8 : (sk.cleanse&&(m.st.burn||m.st.poison||m.st.storm||m.st.cripple)?m.atk*1.2:0); }
    else if(sk.k==='drain' && sk.stealHp){ const d=foes[0][0]; score=lv(sk.stealHp,L)*(hpPct<.7?1.8:1.1); target=foes[0][1]; }
    else if(sk.k==='drain'){ score = m.mp<m.maxmp*0.3 && foes.some(([d])=>d.mp>5)? m.atk*1.2:0; target=foes.slice().sort((x,y)=>y[0].mp-x[0].mp)[0][1]; }
    score *= 0.85+rnd(b)*0.3;
    if(score>bestScore){bestScore=score;best={skill:id,target};}
  }
  return best||{skill:'basic',target:validTargets(b,a.s,'basic')[0]};
}

if(typeof module!=='undefined') module.exports={pick,aiPick,benchOf,EL,FAM,SK,SP,SPI,newBattle,act,aiChoose,actor,statsOf,makeMon,elemMult,skillDesc,power,skCost};
