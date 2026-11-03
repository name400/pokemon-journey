// A recent authenticated heartbeat is evidence of recent activity, not a
// guarantee that a browser is still open. Missing/stale data is unknown.
export const PRESENCE_WINDOW_MS=120000;
export function recentPresence(lastSeen,now=Date.now()){
 if(!Number.isSafeInteger(lastSeen)||lastSeen<=0||lastSeen>now)return 'unknown';
 return now-lastSeen<=PRESENCE_WINDOW_MS?'recent':'unknown';
}
