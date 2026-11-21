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
        { const m = /^data\/users\/([A-Za-z0-9_-]+)\/save$/.exec(String(p.k||''));
          if (m) { if (p.uid !== m[1] || !authed(p)) return out({ok:0, err:'forbidden'});
            const r = checkSave(m[1], p.v); setSave(p.k, r.v); return out(r.fix ? {ok:1, fix:r.fix} : {ok:1}); } }
        setSave(p.k, p.v); return out({ok:1});
      case 'emit': return out(emit(p));
      case 'poll': return out(poll(p));
      case 'presence': return out(presence(p));
      case 'claim': if (!authed(p)) return out({ok:0, err:'forbidden'}); return out(claim(p));
      case 'whoami': return out(whoami(p));
      case 'adm': if (!authed(p)) return out({ok:0, err:'forbidden'}); return out(adm(p));
      case 'top': return out(top());
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
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try { rawSetNL(k, v); } finally { lock.releaseLock(); }
}
// same, for callers that already hold the lock
function rawSetNL(k, v){
  if (typeof v !== 'string' || v.length > 45000) throw 'bad save';
  const sh = sheet(); const f = sh.getRange('A:A').createTextFinder(k).matchEntireCell(true).findNext();
  if (f) sh.getRange(f.getRow(), 2, 1, 2).setValues([[new Date(), v]]);
  else sh.appendRow([k, new Date(), v]);
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
// Admin usernames come from Script Property ADMIN_NAMES (comma separated); defaults to "george,br6pack".
function normName(n){ return String(n||'').trim().toLowerCase().replace(/\s+/g,' '); }
function adminNames(){ const v = PropertiesService.getScriptProperties().getProperty('ADMIN_NAMES') || 'george,br6pack'; return v.split(',').map(normName).filter(String); }
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
  if (p.op === 'gift') {
    if (!okUid(t)) return {ok:0, err:'bad target'};
    const n = Math.floor(+p.n || 0); if (n < 1 || n > 100000) return {ok:0, err:'bad amount'};
    const lock = LockService.getScriptLock(); lock.waitLock(8000);
    try { rawSetNL('credit/'+t, String((+rawGet('credit/'+t) || 0) + n)); } finally { lock.releaseLock(); }
    logAdmin(p.uid, 'gift', t, n); return {ok:1};
  }
  if (p.op === 'list') {
    const rows = sheet().getDataRange().getValues(), P = {};
    const get = u => P[u] = P[u] || {uid:u, name:null, lv:0, mons:0, seen:0, banned:false};
    rows.forEach(r => { const k = String(r[0]), v = r[2];
      if (k.indexOf('uname/') === 0 && v) get(k.slice(6)).name = String(v);
      else if (k.indexOf('ban/') === 0) { if (v === '1' || v === 1) get(k.slice(4)).banned = true; }
      else { const m = /^data\/users\/([A-Za-z0-9_-]+)\/save$/.exec(k); if (m) { const x = get(m[1]); x.seen = r[1] ? new Date(r[1]).getTime() : 0;
        try { let s = JSON.parse(v); if (s && typeof s.save === 'string') s = JSON.parse(s.save); const ms = s.mons || []; x.mons = ms.length; x.lv = ms.reduce((a,b) => Math.max(a, +b.lvl||0), 0); if (!x.name && s.name) x.name = '(' + s.name + ')'; } catch (_) {} } } });
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
      const keys = ['uname/'+t, 'data/users/'+t+'/save', 'ban/'+t, 'flag/'+t, 'key/'+t, 'eco/'+t, 'credit/'+t]; if (n) keys.push('name/'+n);
      const vals = sh.getRange('A:A').getValues(), del = [];
      vals.forEach((r,i) => { if (keys.indexOf(String(r[0])) >= 0) del.push(i+1); });
      del.reverse().forEach(row => sh.deleteRow(row));
    } finally { lock.releaseLock(); }
    CACHE.remove('ban:'+t); CACHE.remove('key:'+t); logAdmin(p.uid, 'delete', t, n||''); return {ok:1};
  }
  return {ok:0, err:'unknown op'};
}


// ---- account keys: every account has a secret only its own devices know ----
// The first device to show up with a key after this update claims the account; after that, writes need the same key.
function authed(p){
  if (!okUid(p.uid)) return false;
  const key = typeof p.key === 'string' && /^k[A-Za-z0-9]{16,64}$/.test(p.key) ? p.key : null;
  let stored = CACHE.get('key:'+p.uid);
  if (stored === null) { stored = rawGet('key/'+p.uid) || ''; CACHE.put('key:'+p.uid, stored, 21600); }
  if (!stored) { if (!key) return false; rawSet('key/'+p.uid, key); CACHE.put('key:'+p.uid, key, 21600); return true; }
  return key === stored;
}

// ---- save checks: no impossible monsters, and mushrooms/cash can only grow at a believable pace ----
const MAX_LV = 30, PTS_PER_LV = 5;
function checkSave(uid, v){
  let s; try { s = JSON.parse(v); } catch (_) { throw 'bad save'; }
  const save = s && s.save ? JSON.parse(s.save) : null; if (!save) return {v:v};
  const fix = {}; const now = Date.now();
  // monsters
  if (Array.isArray(save.mons)) {
    if (save.mons.length > 300) { save.mons = save.mons.slice(0, 300); fix.mons = 1; }
    save.mons.forEach(m => {
      const lv = Math.max(1, Math.min(MAX_LV, Math.floor(+m.lvl || 1))); if (lv !== m.lvl) { m.lvl = lv; fix.mons = 1; }
      const cap = (lv - 1) * PTS_PER_LV, p = m.pts || {}; const spent = (+p.atk||0) + (+p.hp||0) + (+p.mp||0);
      if (spent < 0 || spent > cap || [p.atk,p.hp,p.mp].some(x => x != null && (+x < 0 || +x !== Math.floor(+x)))) { m.pts = {atk:0,hp:0,mp:0}; m.free = cap; fix.mons = 1; }
      else if ((+m.free||0) + spent > cap || (+m.free||0) < 0) { m.free = cap - spent; fix.mons = 1; }
    });
  }
  // mushrooms and cash
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    let rec = null; try { rec = JSON.parse(rawGet('eco/'+uid) || 'null'); } catch (_) {}
    const credit = +rawGet('credit/'+uid) || 0;
    let mush = Math.max(0, Math.floor(+save.mush || 0)), cash = Math.max(0, Math.floor(+save.cash || 0));
    if (rec) {
      const hrs = Math.max(0, (now - (+rec.at || now)) / 3600000);
      const mOk = (+rec.mush || 0) + Math.min(150, 15 + Math.ceil(40 * hrs));
      const cOk = (+rec.cash || 0) + Math.min(60000, 3000 + Math.ceil(8000 * hrs));
      if (mush > mOk) mush = mOk;
      if (cash > cOk) cash = cOk;
    }
    if (credit) { mush += credit; rawSetNL('credit/'+uid, ''); }
    if (mush !== save.mush) { save.mush = mush; fix.mush = mush; }
    if (cash !== (save.cash|0)) { save.cash = cash; fix.cash = cash; }
    rawSetNL('eco/'+uid, JSON.stringify({mush:mush, cash:cash, at:now}));
  } finally { lock.releaseLock(); }
  if (fix.mons) fix.mons = save.mons;
  s.save = JSON.stringify(save);
  return {v: JSON.stringify(s), fix: Object.keys(fix).length ? fix : null};
}

// ---- rankings: every player, not just the ones online ----
function top(){
  const c = CACHE.get('top'); if (c) return JSON.parse(c);
  const rows = sheet().getDataRange().getValues(), names = {}, banned = {}, list = [];
  rows.forEach(r => { const k = String(r[0]);
    if (k.indexOf('uname/') === 0 && r[2]) names[k.slice(6)] = String(r[2]);
    else if (k.indexOf('ban/') === 0 && (r[2] === '1' || r[2] === 1)) banned[k.slice(4)] = 1; });
  rows.forEach(r => { const m = /^data\/users\/([A-Za-z0-9_-]+)\/save$/.exec(String(r[0])); if (!m || banned[m[1]]) return;
    try { const s = JSON.parse(JSON.parse(r[2]).save); const name = names[m[1]] || s.name; if (!name) return;
      list.push({id: m[1].slice(-6), name: String(name).slice(0, 16), rank: Math.max(0, Math.round(+(s.rank == null ? 200 : s.rank) || 0)), avatar: s.avatar || null}); } catch (_) {} });
  list.sort((a, b) => b.rank - a.rank);
  const res = {ok:1, players: list.slice(0, 100)}; CACHE.put('top', JSON.stringify(res), 60); return res;
}
