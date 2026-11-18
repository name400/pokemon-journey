import {decodeGameData} from './game-storage.mjs';
import {acknowledgePresentationEvents} from './rogue-presentation-ledger.mjs';

const initializers=new WeakMap();
async function ensureTable(db){
 let ready=initializers.get(db);
 if(!ready){ready=db.prepare('CREATE TABLE IF NOT EXISTS rogue_presentation_ack (user_id TEXT NOT NULL, viewer_id TEXT NOT NULL, event_id TEXT NOT NULL, PRIMARY KEY (user_id,viewer_id,event_id))').run();initializers.set(db,ready);ready.catch(()=>initializers.delete(db));}
 await ready;
}

// The client never supplies a trusted batch: it must already be part of the
// authenticated user's saved combat and match the final stored events exactly.
export async function acknowledgeStoredPresentation(db,userId,payload){
 if(!payload||typeof payload!=='object'||!Number.isSafeInteger(payload.revision)||payload.revision<0||typeof payload.batchId!=='string'||!Array.isArray(payload.eventIds)||payload.eventIds.length>64)throw Error('연출 확인 정보를 확인하세요.');
 const row=await db.prepare('SELECT data,revision FROM saves WHERE user_id=?').bind(userId).first();
 if(!row||row.revision!==payload.revision)throw Error('저장된 전투가 변경되었습니다. 다시 확인하세요.');
 const document=await decodeGameData(row.data),state=document.classic,combat=state?.slots?.[state.activeSlot]?.combat,batch=combat?.presentationBatch;
 if(!batch||batch.batchId!==payload.batchId||!Array.isArray(combat.events)||JSON.stringify(batch.events?.map(entry=>entry.event))!==JSON.stringify(combat.events))throw Error('저장된 연출을 확인할 수 없습니다.');
 const checked=acknowledgePresentationEvents(null,batch,{viewerId:payload.viewerId,eventIds:payload.eventIds,confirmed:payload.confirmed});
 await ensureTable(db);
 const ids=checked.entries.map(entry=>entry.eventId),values=ids.map(()=>'(?)').join(',');
 // One atomic statement checks the revision and capacity, including concurrent
 // retries, and writes only previously absent viewer/event pairs.
 const sql=`WITH requested(event_id) AS (VALUES ${values}) INSERT OR IGNORE INTO rogue_presentation_ack(user_id,viewer_id,event_id) SELECT ?,?,event_id FROM requested WHERE EXISTS (SELECT 1 FROM saves WHERE user_id=? AND revision=?) AND (SELECT COUNT(*) FROM rogue_presentation_ack WHERE user_id=?)+(SELECT COUNT(*) FROM requested r WHERE NOT EXISTS (SELECT 1 FROM rogue_presentation_ack a WHERE a.user_id=? AND a.viewer_id=? AND a.event_id=r.event_id))<=2048`;
 await db.prepare(sql).bind(...ids,userId,payload.viewerId,userId,payload.revision,userId,userId,payload.viewerId).run();
 const check=await db.prepare(`SELECT COUNT(*) AS count FROM rogue_presentation_ack WHERE user_id=? AND viewer_id=? AND event_id IN (${ids.map(()=>'?').join(',')})`).bind(userId,payload.viewerId,...ids).first();
 if(Number(check?.count)!==ids.length)throw Error('연출 확인을 저장하지 못했습니다. 다시 확인하세요.');
 return {confirmed:ids.length};
}
