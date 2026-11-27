// Realtime relay for live battles: one Durable Object per match room, messages go straight to the other phone over a WebSocket.
export class Room {
  constructor(state){ this.state = state; }
  async fetch(req){
    const pair = new WebSocketPair(); const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server);
    return new Response(null, {status: 101, webSocket: client});
  }
  webSocketMessage(ws, msg){
    if (typeof msg !== 'string' || msg.length > 200000) return;
    for (const other of this.state.getWebSockets()) if (other !== ws) { try { other.send(msg); } catch (_) {} }
  }
  webSocketClose(ws, code){ try { ws.close(code, 'bye'); } catch (_) {} }
  webSocketError(ws){ try { ws.close(1011, 'error'); } catch (_) {} }
}
export default {
  async fetch(req, env){
    const u = new URL(req.url);
    const m = u.pathname.match(/^\/rt\/([A-Za-z0-9_-]{1,80})$/);
    if (m) {
      if (req.headers.get('Upgrade') !== 'websocket') return new Response('websocket only', {status: 426});
      return env.ROOMS.get(env.ROOMS.idFromName(m[1])).fetch(req);
    }
    return env.ASSETS.fetch(req);
  }
};
