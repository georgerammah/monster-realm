// Standalone adapter: gives the game the same save + live-battle tools it uses on Claude, backed by your Apps Script.
(function(){
  if (window.claude) return;
  const URL = window.MR_BACKEND || '';
  const get = k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
  const put = (k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
  let uid = get('mr-uid'); if(!uid){ uid='u'+Math.random().toString(36).slice(2,12)+Date.now().toString(36); put('mr-uid',uid); }
  window.MR_UID = uid;
  const cid = 'c'+Math.random().toString(36).slice(2,12);
  const call = o => fetch(URL,{method:'POST', body:JSON.stringify(o)}).then(r=>r.json());
  function mkRoom(name){
    const hs={}; let since=-1, peersFn=null, pres=null, stopped=false, hb=null, timer=null; const lobby=name==='lobby';
    async function loop(){
      if(stopped) return;
      try{ const r=await call({a:'poll', r:name, since, from:cid, peers:lobby&&!!peersFn});
        if(r.ok){ if(since>=0) (r.msgs||[]).forEach(m=>(hs[m.t]||[]).forEach(f=>{ try{ f(m.d); }catch(e){} })); since=r.n; if(r.peers&&peersFn) peersFn(r.peers); } }catch(e){}
      if(!stopped) timer=setTimeout(loop, lobby?2500:900);
    }
    loop();
    return {
      emit:(t,d)=>call({a:'emit', r:name, from:cid, topic:t, data:d}).catch(()=>{}),
      on:(t,f)=>{ (hs[t]=hs[t]||[]).push(f); },
      presence:p=>{ pres=Object.assign({},p); const send=()=>call({a:'presence', r:name, cid, p:pres}).then(r=>{ if(r.ok&&r.peers&&peersFn) peersFn(r.peers); }).catch(()=>{}); send(); clearInterval(hb); hb=setInterval(send,9000); },
      onPeers:f=>{ peersFn=f; },
      join:n=>mkRoom(n),
      leave:()=>{ stopped=true; clearTimeout(timer); clearInterval(hb); if(pres) call({a:'presence', r:name, cid, p:null}).catch(()=>{}); }
    };
  }
  let lobbyRoom=null;
  const db={ collection:path=>({ doc:k=>({
    get:()=>call({a:'get', k:path+'/'+k}).then(r=>r.ok&&r.v?JSON.parse(r.v):null),
    set:v=>call({a:'set', k:path+'/'+k, v:JSON.stringify(v), admin:(path==='config'?(get('mr-admin-key')||''):undefined)})
  }) }) };
  const user={ id:async()=>uid, me:async()=>({id:uid}), isOwner:()=>true, canEdit:()=>true, can:()=>true };
  window.claude={ use: async n => !URL ? null : n==='db'?db : n==='user'?user : n==='room'?(lobbyRoom=lobbyRoom||mkRoom('lobby')) : null };
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden' && lobbyRoom){} });
})();
if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('sw.js').catch(()=>{});
