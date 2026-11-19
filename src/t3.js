const E=require('./engine.js');
let w=[0,0];
for(let n=0;n<400;n++){
 const T=()=>({name:'x',mons:[0,1,2].map(()=>({sp:E.SP[Math.random()*24|0].id,lvl:10}))});
 const b=E.newBattle(T(),T(),{single:true}); let g=0;
 while(!b.over&&g++<3000){ if(b.phase==='pick') E.pick(b,b.pickSide,E.aiPick(b,b.pickSide)); else { if(Math.random()<.1&&E.benchOf(b,E.actor(b).s).length) E.act(b,{swap:E.benchOf(b,E.actor(b).s)[0]}); E.act(b,E.aiChoose(b)); } }
 if(!b.over){console.log('stuck',b.phase,b.log.slice(-5));break} w[b.winner]++;
}
console.log(w);
