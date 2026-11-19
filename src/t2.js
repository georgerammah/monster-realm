const E=require('./engine.js');
let wins=[0,0], rounds=0, N=600, famW={};
for(let n=0;n<N;n++){
  const L=1+(Math.random()*29|0);
  const pick=()=>({name:'x',mons:[0,1,2].map(()=>({sp:E.SP[Math.random()*24|0].id,lvl:L}))});
  const A=pick(), B=pick();
  const b=E.newBattle(A,B,{});
  let g=0; while(!b.over&&g++<3000){ E.act(b,E.aiChoose(b)); }
  if(!b.over){console.log('stuck', b.round); break}
  wins[b.winner]++; rounds+=b.round;
  b.sides[b.winner].mons.forEach(m=>famW[E.SPI[m.sp].fam]=(famW[E.SPI[m.sp].fam]||0)+1);
}
console.log(wins,'avg rounds',(rounds/N).toFixed(1),famW);
// 1v1 starter vs dummy
const b=E.newBattle({name:'a',mons:[{sp:'gravelpup',lvl:1}]},{name:'d',mons:[{sp:'strawdum',lvl:1,hpMul:.8}]},{});
let g=0; while(!b.over&&g++<99) E.act(b,E.aiChoose(b)); console.log('dummy',b.winner,b.round,b.log.slice(0,6));
console.log(E.skillDesc('bubble',1), '|', E.skillDesc('cripple',3), E.skCost('bubble',2));
