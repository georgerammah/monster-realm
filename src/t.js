const E=require('./engine.js');
let wins=[0,0], rounds=0, N=500;
for(let n=0;n<N;n++){
  const pick=()=>({name:'x',mons:[0,1,2].map(()=>({sp:E.SP[Math.random()*24|0].id,lvl:1+(Math.random()*29|0)}))});
  const A=pick(); const B={name:'y',mons:A.mons.map(m=>({sp:E.SP[Math.random()*24|0].id,lvl:m.lvl}))};
  const b=E.newBattle(A,B,{});
  let g=0; while(!b.over&&g++<2000){ E.act(b,E.aiChoose(b)); }
  if(!b.over) {console.log('stuck');break}
  wins[b.winner]++; rounds+=b.round;
}
console.log(wins, 'avg rounds', rounds/N);
// json roundtrip
const b=E.newBattle({name:'a',mons:[{sp:'tidepip',lvl:5}]},{name:'b',mons:[{sp:'emberling',lvl:5}]},{});
const c=JSON.parse(JSON.stringify(b)); E.act(c,E.aiChoose(c)); console.log(c.log);
