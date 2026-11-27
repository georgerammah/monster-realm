// Standalone adapter: gives the game the same save + live-battle tools it uses on Claude, backed by your Apps Script.
(function(){
  if (window.claude) return;
  const URL = window.MR_BACKEND || '';
  const get = k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
  const put = (k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
  let uid = get('mr-uid'); if(!uid){ uid='u'+Math.random().toString(36).slice(2,12)+Date.now().toString(36); put('mr-uid',uid); }
  window.MR_UID = uid;
  // secret account key: proves to the server that saves come from this player's own devices
  let key = get('mr-key'); if(!key){ const a=new Uint8Array(18); (crypto.getRandomValues?crypto.getRandomValues(a):a.forEach((_,i)=>a[i]=Math.random()*256)); key='k'+Array.from(a,b=>(b%36).toString(36)).join(''); put('mr-key',key); }
  window.MR_KEY = key;
  const cid = 'c'+Math.random().toString(36).slice(2,12);
  const call = o => fetch(URL,{method:'POST', body:JSON.stringify(Object.assign({key}, o))}).then(r=>r.json()).then(r=>{ if(r&&r.err==='banned') window.dispatchEvent(new Event('mr-banned')); return r; });
  function mkRoom(name){
    const hs={}; let since=-1, peersFn=null, pres=null, stopped=false, hb=null, timer=null; const lobby=name==='lobby';
    async function loop(){
      if(stopped) return;
      try{ const r=await call({a:'poll', r:name, since, from:cid, peers:lobby&&!!peersFn});
        if(r.ok){ if(since>=0) (r.msgs||[]).forEach(m=>(hs[m.t]||[]).forEach(f=>{ try{ f(m.d); }catch(e){} })); since=r.n; if(r.peers&&peersFn) peersFn(r.peers); } }catch(e){}
      // background: barely check in; lobby: every few seconds; live battle: fast unless the direct connection is carrying it
      if(!stopped) timer=setTimeout(loop, window.MR_HIDDEN?15000:lobby?(window.MR_ARENA_OPEN?2500:6000):(ws&&ws.readyState===1?3000:900));
    }
    // live battles also get a direct WebSocket through our Cloudflare relay (messages arrive in a blink); the Apps Script relay stays as backup
    let ws=null, wsTries=0;
    function openWs(){ if(lobby||stopped||!window.WebSocket||wsTries>4) return; wsTries++;
      try{ ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/rt/'+encodeURIComponent(name.replace(/[^A-Za-z0-9_-]/g,'_')));
        ws.onmessage=e=>{ try{ const m=JSON.parse(e.data); (hs[m.t]||[]).forEach(f=>{ try{ f(m.d); }catch(_){} }); }catch(_){} };
        ws.onopen=()=>{ wsTries=0; };
        ws.onclose=()=>{ ws=null; if(!stopped) setTimeout(openWs,1500); };
        ws.onerror=()=>{ try{ ws&&ws.close(); }catch(_){} };
      }catch(_){ ws=null; } }
    openWs();
    loop();
    return {
      emit:(t,d)=>{ if(ws&&ws.readyState===1){ try{ ws.send(JSON.stringify({t,d})); }catch(_){} } return call({a:'emit', r:name, from:cid, uid, topic:t, data:d}).catch(()=>{}); },
      on:(t,f)=>{ (hs[t]=hs[t]||[]).push(f); },
      presence:p=>{ pres=Object.assign({},p); const send=()=>window.MR_HIDDEN?Promise.resolve():call({a:'presence', r:name, cid, uid, p:pres}).then(r=>{ if(r.ok&&r.peers&&peersFn) peersFn(r.peers); }).catch(()=>{}); send(); clearInterval(hb); hb=setInterval(send,9000); },
      onPeers:f=>{ peersFn=f; },
      join:n=>mkRoom(n),
      leave:()=>{ stopped=true; clearTimeout(timer); clearInterval(hb); try{ ws&&ws.close(); }catch(_){} if(pres) call({a:'presence', r:name, cid, p:null}).catch(()=>{}); }
    };
  }
  let lobbyRoom=null;
  const db={ collection:path=>({ doc:k=>({
    get:()=>call({a:'get', k:path+'/'+k}).then(r=>r.ok&&r.v?JSON.parse(r.v):null),
    set:v=>call({a:'set', k:path+'/'+k, v:JSON.stringify(v), uid}).then(r=>{ if(r&&r.fix) window.dispatchEvent(new CustomEvent('mr-fix',{detail:r.fix})); if(r&&r.err==='forbidden') window.dispatchEvent(new Event('mr-forbidden')); return r; })
  }) }) };
  const user={ id:async()=>uid, me:async()=>({id:uid}), isOwner:()=>true, canEdit:()=>true, can:()=>true };
  window.MR_ACCT={ claim:name=>call({a:'claim', name, uid}), whoami:()=>call({a:'whoami', uid}), adm:(op,o)=>call(Object.assign({a:'adm', op, uid}, o||{})), top:()=>call({a:'top'}) };
  window.claude={ use: async n => !URL ? null : n==='db'?db : n==='user'?user : n==='room'?(lobbyRoom=lobbyRoom||mkRoom('lobby')) : null };
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden' && lobbyRoom){} });
})();
if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('sw.js').catch(()=>{});
