// This protocol is deliberately independent of gameplay saves and playback.
// A caller must persist the finalized batch before it can acknowledge anything.
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createPresentationBatch(events,randomId=()=>crypto.randomUUID()){
 if(!Array.isArray(events)||!events.length||events.some(event=>!event||typeof event!=='object'||Array.isArray(event)))throw Error('연출 이벤트를 확인하세요.');
 const batchId=randomId();
 if(typeof batchId!=='string'||!uuid.test(batchId))throw Error('연출 식별자를 확인하세요.');
 return {version:1,batchId,events:events.map((event,index)=>({id:`${batchId}:${index}`,event:structuredClone(event)}))};
}

// Capture the previous reference before the action: a new combat object or
// event array marks a new final presentation, even when its text repeats.
export function classicPresentationBefore(document){
 const state=document?.classic,run=state?.slots?.[state.activeSlot],combat=run?.combat;
 return {slot:state?.activeSlot,run,combat,events:combat?.events,serializedEvents:JSON.stringify(combat?.events)};
}
export function finalizeClassicPresentation(document,before,action,randomId){
 const state=document?.classic,run=state?.slots?.[state.activeSlot],combat=run?.combat;
 if(!combat||action==='selectSlot'||(state.activeSlot!==before.slot&&action!=='start'))return null;
 const sameEvents=JSON.stringify(combat.events)===before.serializedEvents;
 const eventActions=new Set(['turn','capture','escape','initialSwitch','next','start','mysteryConfirm','mysteryContinue','winstrateContinue','route','safariAction','recoverBattle','resolveEvolution','learn','acceptCapture','reward','skipReward']);
 const changed=run!==before.run||!sameEvents||eventActions.has(action)&&(combat!==before.combat||combat.events!==before.events);
 if(!changed)return null;
 if(!Array.isArray(combat.events)||!combat.events.length){delete combat.presentationBatch;return null;}
 combat.presentationBatch=createPresentationBatch(combat.events,randomId);
 return combat.presentationBatch;
}
export function classicPresentationBatchView(combat){
 const batch=combat?.presentationBatch;
 if(batch?.version!==1||!uuid.test(batch.batchId||'')||!Array.isArray(batch.events)||!batch.events.length||batch.events.some((entry,index)=>!entry||entry.id!==`${batch.batchId}:${index}`||!entry.event||typeof entry.event!=='object'||Array.isArray(entry.event))||JSON.stringify(batch.events.map(entry=>entry.event))!==JSON.stringify(combat.events))return null;
 return {version:1,batchId:batch.batchId,eventIds:batch.events.map(entry=>entry.id)};
}

// Only an explicit user acknowledgment is represented. A paint callback,
// timeout, cancellation, missing batch, or old receipt cannot be used here.
export function acknowledgePresentationEvents(ledger,batch,{viewerId,eventIds,confirmed}={}){
 if(confirmed!==true||!uuid.test(viewerId||'')||batch?.version!==1||!uuid.test(batch.batchId||'')||!Array.isArray(batch.events)||!batch.events.length||!Array.isArray(eventIds)||!eventIds.length)throw Error('연출 확인 정보를 확인하세요.');
 const allowed=new Set();
 for(const [index,entry] of batch.events.entries()){
  if(!entry||entry.id!==`${batch.batchId}:${index}`||!entry.event||typeof entry.event!=='object'||Array.isArray(entry.event))throw Error('저장된 연출 정보가 변경되었습니다.');
  allowed.add(entry.id);
 }
 if(new Set(eventIds).size!==eventIds.length||eventIds.some(id=>!allowed.has(id)))throw Error('확인할 연출이 변경되었습니다.');
 if(ledger!=null&&(ledger.version!==1||!Array.isArray(ledger.entries)))throw Error('연출 확인 기록을 확인하세요.');
 const entries=(ledger?.entries||[]).map(entry=>({...entry}));
 if(entries.some(entry=>!entry||!uuid.test(entry.viewerId||'')||typeof entry.eventId!=='string'))throw Error('연출 확인 기록을 확인하세요.');
 for(const eventId of eventIds)if(!entries.some(entry=>entry.viewerId===viewerId&&entry.eventId===eventId))entries.push({viewerId,eventId});
 return {version:1,entries};
}
