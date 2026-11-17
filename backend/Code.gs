// Monster Realm backend — saves + live battle relay.
// Deploy: Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
const CACHE = CacheService.getScriptCache();

function doGet(e){ return handle((e && e.parameter) || {}); }
function doPost(e){ let p = {}; try { p = JSON.parse(e.postData.contents); } catch (_) {} return handle(p); }
function out(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function handle(p){
  try {
    const bu = banTarget(p); if (bu && isBanned(bu)) return out({ok:0, err:'banned'});
    switch (p.a) {
      case 'ping': return out({ok:1});
      case 'get': return out({ok:1, v:getSave(p.k)});
      case 'set':
        if (/^(name|uname)\//.test(String(p.k||''))) return out({ok:0, err:'forbidden'});
        if (String(p.k||'').indexOf('config/') === 0 && !isAdminUid(p.uid)) return out({ok:0, err:'admin'});
        { const m = /^data\/users\/([A-Za-z0-9_-]+)\/save$/.exec(String(p.k||'')); if (m && p.uid && p.uid !== m[1]) return out({ok:0, err:'forbidden'}); }
        setSave(p.k, p.v); return out({ok:1});
      case 'emit': return out(emit(p));
      case 'poll': return out(poll(p));
      case 'presence': return out(presence(p));
      case 'claim': return out(claim(p));
      case 'whoami': return out(whoami(p));
      case 'adm': return out(adm(p));
    }
    return out({ok:0, err:'unknown action'});
  } catch (err) { return out({ok:0, err:String(err)}); }
}

// ---- saves (one row per player in a spreadsheet) ----
function sheet(){
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SHEET_ID'), ss;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (_) { ss = null; } }
  if (!ss) { ss = SpreadsheetApp.create('Monster Realm Saves'); props.setProperty('SHEET_ID', ss.getId()); ss.getSheets()[0].appendRow(['key','updated','save']); }
  return ss.getSheets()[0];
}
function validKey(k){ return typeof k === 'string' && (/^data\/users\/[A-Za-z0-9_-]{6,64}\/save$/.test(k) || /^config\/[a-z]{2,20}$/.test(k)); }
function getSave(k){
  if (!validKey(k)) throw 'bad key';
  return rawGet(k);
}
function rawGet(k){
  const sh = sheet(); const f = sh.getRange('A:A').createTextFinder(k).matchEntireCell(true).findNext();
  return f ? sh.getRange(f.getRow(), 3).getValue() : null;
}
function setSave(k, v){
  if (!validKey(k)) throw 'bad key';
  return rawSet(k, v);
}
function rawSet(k, v){
  if (typeof v !== 'string' || v.length > 45000) throw 'bad save';
  const lock = LockService.getScriptLock(); lock.waitLock(8000);
  try {
    const sh = sheet(); const f = sh.getRange('A:A').createTextFinder(k).matchEntireCell(true).findNext();
    if (f) sh.getRange(f.getRow(), 2, 1, 2).setValues([[new Date(), v]]);
    else sh.appendRow([k, new Date(), v]);
  } finally { lock.releaseLock(); }
}

// ---- live rooms (short-lived, in cache) ----
function room(r){ if (typeof r !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(r)) throw 'bad room'; return 'r:' + r; }
function emit(p){
  const R = room(p.r); const lock = LockService.getScriptLock(); lock.waitLock(5000);
  try {
    const n = (+CACHE.get(R + ':n') || 0) + 1;
    let log = JSON.parse(CACHE.get(R + ':log') || '[]');
    log.push({n:n, f:String(p.from || ''), t:String(p.topic || ''), d:p.data});
    log = log.slice(-25);
    let s = JSON.stringify(log); while (s.length > 90000 && log.length > 1) { log.shift(); s = JSON.stringify(log); }
    CACHE.put(R + ':log', s, 900); CACHE.put(R + ':n', String(n), 21600);
    return {ok:1, n:n};
  } finally { lock.releaseLock(); }
}
function poll(p){
  const R = room(p.r); const n = +CACHE.get(R + ':n') || 0; const since = +p.since;
  const res = {ok:1, n:n, msgs:[]};
  if (since >= 0 && n > since) res.msgs = JSON.parse(CACHE.get(R + ':log') || '[]').filter(function(m){ return m.n > since && m.f !== String(p.from); });
  if (p.peers) res.peers = peers(R, p.from);
  return res;
}
function presence(p){
  const R = room(p.r); const cid = String(p.cid || '').slice(0, 40); if (!cid) throw 'no cid';
  const lock = LockService.getScriptLock(); lock.waitLock(5000);
  try {
    let idx = JSON.parse(CACHE.get(R + ':pidx') || '[]');
    if (p.p) { CACHE.put(R + ':p:' + cid, JSON.stringify(p.p), 25); if (idx.indexOf(cid) < 0) idx.push(cid); }
    else { CACHE.remove(R + ':p:' + cid); idx = idx.filter(function(c){ return c !== cid; }); }
    CACHE.put(R + ':pidx', JSON.stringify(idx.slice(-60)), 21600);
  } finally { lock.releaseLock(); }
  return {ok:1, peers:peers(R, cid)};
}
function peers(R, me){
  const idx = JSON.parse(CACHE.get(R + ':pidx') || '[]'); if (!idx.length) return [];
  const vals = CACHE.getAll(idx.map(function(c){ return R + ':p:' + c; }));
  const list = [];
  idx.forEach(function(c){ const v = vals[R + ':p:' + c]; if (v) list.push({presence:JSON.parse(v), you: c === String(me)}); });
  return list;
}


// ---- unique usernames + admins ----
// Admin usernames come from Script Property ADMIN_NAMES (comma separated); defaults to "george".
function normName(n){ return String(n||'').trim().toLowerCase().replace(/\s+/g,' '); }
function adminNames(){ const v = PropertiesService.getScriptProperties().getProperty('ADMIN_NAMES') || 'george'; return v.split(',').map(normName).filter(String); }
function isAdminUid(uid){ if(!uid) return false; const n = rawGet('uname/'+uid); return !!n && adminNames().indexOf(n) >= 0; }
function claim(p){
  const name = String(p.name||'').trim(), key = normName(name);
  if (!p.uid) return {ok:0, err:'no id'};
  if (key.length < 2 || key.length > 16 || !/^[a-z0-9 _.-]+$/.test(key)) return {ok:0, err:'invalid'};
  {
    const owner = rawGet('name/'+key);
    if (owner && owner !== p.uid) return {ok:0, err:'taken'};
    const prev = rawGet('uname/'+p.uid);
    if (prev && prev !== key) rawSet('name/'+prev, '');
    rawSet('name/'+key, p.uid); rawSet('uname/'+p.uid, key);
    if (rawGet('flag/'+p.uid)) rawSet('flag/'+p.uid, '');
    return {ok:1, name:key, admin: adminNames().indexOf(key) >= 0};
  }
}
function whoami(p){ const n = p.uid ? rawGet('uname/'+p.uid) : null;
  return {ok:1, name:n||null, admin: !!n && adminNames().indexOf(n) >= 0, banned: p.uid ? isBanned(p.uid) : false, rename: p.uid ? rawGet('flag/'+p.uid) === 'rename' : false}; }

// ---- bans + admin tools ----
function okUid(u){ return typeof u === 'string' && /^[A-Za-z0-9_-]{6,64}$/.test(u); }
function banTarget(p){
  if (p.a === 'set') { const m = /^data\/users\/([A-Za-z0-9_-]+)\/save$/.exec(String(p.k||'')); return m ? m[1] : null; }
  if (p.a === 'claim' || p.a === 'emit' || p.a === 'presence') return okUid(p.uid) ? p.uid : null;
  return null;
}
function isBanned(uid){
  const c = CACHE.get('ban:'+uid); if (c !== null) return c === '1';
  const b = rawGet('ban/'+uid) === '1'; CACHE.put('ban:'+uid, b ? '1' : '0', 120); return b;
}
function logAdmin(by, op, t, extra){ try { sheet().appendRow(['log/'+Date.now(), new Date(), JSON.stringify({by:rawGet('uname/'+by), op:op, target:t, info:extra||''})]); } catch (_) {} }
function adm(p){
  if (!isAdminUid(p.uid)) return {ok:0, err:'admin'};
  const t = p.t;
  if (p.op === 'list') {
    const rows = sheet().getDataRange().getValues(), P = {};
    const get = u => P[u] = P[u] || {uid:u, name:null, lv:0, mons:0, seen:0, banned:false};
    rows.forEach(r => { const k = String(r[0]), v = r[2];
      if (k.indexOf('uname/') === 0 && v) get(k.slice(6)).name = String(v);
      else if (k.indexOf('ban/') === 0) { if (v === '1' || v === 1) get(k.slice(4)).banned = true; }
      else { const m = /^data\/users\/([A-Za-z0-9_-]+)\/save$/.exec(k); if (m) { const x = get(m[1]); x.seen = r[1] ? new Date(r[1]).getTime() : 0;
        try { const s = JSON.parse(v); const ms = s.mons || []; x.mons = ms.length; x.lv = ms.reduce((a,b) => Math.max(a, +b.lv||0), 0); if (!x.name && s.name) x.name = '(' + s.name + ')'; } catch (_) {} } } });
    const q = normName(p.q||''); let list = Object.keys(P).map(u => P[u]);
    if (q) list = list.filter(x => (x.name||'').toLowerCase().indexOf(q) >= 0 || x.uid.toLowerCase().indexOf(q) >= 0);
    list.sort((a,b) => b.seen - a.seen);
    return {ok:1, total:list.length, players:list.slice(0, 200), me:p.uid};
  }
  if (!okUid(t)) return {ok:0, err:'bad target'};
  if (t === p.uid && p.op !== 'unban') return {ok:0, err:'self'};
  if (p.op === 'ban' || p.op === 'unban') {
    rawSet('ban/'+t, p.op === 'ban' ? '1' : ''); CACHE.put('ban:'+t, p.op === 'ban' ? '1' : '0', 120);
    logAdmin(p.uid, p.op, t); return {ok:1};
  }
  if (p.op === 'rename') {
    const n = rawGet('uname/'+t); if (n) rawSet('name/'+n, ''); rawSet('uname/'+t, ''); rawSet('flag/'+t, 'rename');
    logAdmin(p.uid, 'rename', t, n||''); return {ok:1};
  }
  if (p.op === 'delete') {
    const lock = LockService.getScriptLock(); lock.waitLock(8000);
    let n;
    try {
      const sh = sheet(); n = rawGet('uname/'+t);
      const keys = ['uname/'+t, 'data/users/'+t+'/save', 'ban/'+t, 'flag/'+t]; if (n) keys.push('name/'+n);
      const vals = sh.getRange('A:A').getValues(), del = [];
      vals.forEach((r,i) => { if (keys.indexOf(String(r[0])) >= 0) del.push(i+1); });
      del.reverse().forEach(row => sh.deleteRow(row));
    } finally { lock.releaseLock(); }
    CACHE.remove('ban:'+t); logAdmin(p.uid, 'delete', t, n||''); return {ok:1};
  }
  return {ok:0, err:'unknown op'};
}
