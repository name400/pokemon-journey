// Battle snapshots outlive a request. These fingerprints protect only newly
// marked battles; unknown versions and old in-progress saves are not migrated.
const digestPattern=/^[a-f0-9]{64}$/;
export function validSharedBattleGuard(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join(',')==='entries,version'&&value.version===1&&Array.isArray(value.entries)&&value.entries.length>0&&value.entries.length<=6&&value.entries.every(e=>e&&typeof e==='object'&&!Array.isArray(e)&&Object.keys(e).sort().join(',')==='digest,id'&&typeof e.id==='string'&&e.id.length>0&&typeof e.digest==='string'&&digestPattern.test(e.digest))&&new Set(value.entries.map(e=>e.id)).size===value.entries.length;}
async function fingerprint(data,origin){const input=new TextEncoder().encode(JSON.stringify([data,origin]));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',input))].map(b=>b.toString(16).padStart(2,'0')).join('');}
export async function sharedBattleConflicts(guard,snapshots){if(!validSharedBattleGuard(guard))return false;for(const entry of guard.entries){const snapshot=snapshots.get(entry.id);if(!snapshot||await fingerprint(snapshot.data,snapshot.origin)!==entry.digest)return true;}return false;}
export async function makeSharedBattleGuard(combat,teamIds,snapshots,changed){
 if(!Array.isArray(combat?.teams?.[0])||!Array.isArray(teamIds))return null;
 const team=new Set(teamIds),ids=[...new Set(combat.teams[0].map(mon=>mon?.boxId).filter(id=>typeof id==='string'&&team.has(id)&&snapshots.has(id)))];
 if(!ids.length||ids.length>6)return null;
 const entries=await Promise.all(ids.map(async id=>{const old=snapshots.get(id),mon=changed.get(id);let data=old.data;if(mon){const {boxId,origin,...stored}=mon;data=JSON.stringify(stored);}return {id,digest:await fingerprint(data,old.origin)};}));
 return {version:1,entries};
}
