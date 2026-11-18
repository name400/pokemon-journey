import test from 'node:test';
import assert from 'node:assert/strict';
import {createPresentationBatch,acknowledgePresentationEvents,classicPresentationBefore,finalizeClassicPresentation,classicPresentationBatchView} from '../lib/rogue-presentation-ledger.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const batchId='11111111-1111-4111-8111-111111111111',otherBatchId='22222222-2222-4222-8222-222222222222',viewer='33333333-3333-4333-8333-333333333333',otherViewer='44444444-4444-4444-8444-444444444444';
test('finalized batches give identical events distinct IDs and preserve data through serialization',async()=>{
 const events=[{kind:'switch',boxId:'a'},{kind:'switch',boxId:'a'}],original=structuredClone(events),batch=createPresentationBatch(events,()=>batchId);
 assert.notEqual(batch.events[0].id,batch.events[1].id);assert.deepEqual(events,original);
 events[0].boxId='changed';assert.equal(batch.events[0].event.boxId,'a');
 const decoded=await decodeGameData(await encodeGameData({batch,other:{keep:true}}));assert.deepEqual(decoded.batch,batch);assert.deepEqual(decoded.other,{keep:true});
 assert.notEqual(createPresentationBatch(original,()=>otherBatchId).events[0].id,batch.events[0].id);
});
test('explicit acknowledgments are independent, idempotent and never imply other events were viewed',()=>{
 const batch=createPresentationBatch([{kind:'entry'},{kind:'attack'}],()=>batchId),id=batch.events[0].id;
 const first=acknowledgePresentationEvents(null,batch,{viewerId:viewer,eventIds:[id],confirmed:true}),before=structuredClone(first);
 assert.deepEqual(acknowledgePresentationEvents(first,batch,{viewerId:viewer,eventIds:[id],confirmed:true}),first);
 const second=acknowledgePresentationEvents(first,batch,{viewerId:otherViewer,eventIds:[id],confirmed:true});
 assert.deepEqual(first,before);assert.deepEqual(second.entries,[{viewerId:viewer,eventId:id},{viewerId:otherViewer,eventId:id}]);
 assert.ok(!second.entries.some(entry=>entry.eventId===batch.events[1].id));
});
test('missing confirmation, invalid legacy data and stale event IDs are rejected without changing the ledger',()=>{
 const batch=createPresentationBatch([{kind:'entry'}],()=>batchId),other=createPresentationBatch([{kind:'entry'}],()=>otherBatchId),ledger={version:1,entries:[]},before=structuredClone(ledger);
 for(const [data,options] of [[batch,{viewerId:viewer,eventIds:[batch.events[0].id]}],[batch,{viewerId:'cloned-session',eventIds:[batch.events[0].id],confirmed:true}],[batch,{viewerId:viewer,eventIds:[other.events[0].id],confirmed:true}],[null,{viewerId:viewer,eventIds:[batch.events[0].id],confirmed:true}]])assert.throws(()=>acknowledgePresentationEvents(ledger,data,options));
 const changed=structuredClone(batch);changed.events[0].id=other.events[0].id;assert.throws(()=>acknowledgePresentationEvents(ledger,changed,{viewerId:viewer,eventIds:[batch.events[0].id],confirmed:true}));assert.deepEqual(ledger,before);
});
test('only a newly produced final combat batch is assigned, and old saved selections remain unchanged',()=>{
 const doc={classic:{activeSlot:0,slots:[{combat:{events:[{kind:'old'}]}},{combat:{events:[{kind:'other'}]}}]}},before=classicPresentationBefore(doc);
 assert.equal(finalizeClassicPresentation(doc,before,'selectSlot',()=>batchId),null);assert.equal(doc.classic.slots[0].combat.presentationBatch,undefined);
 const oldCombat=doc.classic.slots[0].combat;doc.classic.slots[0].combat={...oldCombat,events:[{kind:'capture'},{kind:'old'}]};
 const batch=finalizeClassicPresentation(doc,before,'capture',()=>batchId);assert.equal(batch.events[0].event.kind,'capture');assert.deepEqual(batch.events.map(e=>e.event),doc.classic.slots[0].combat.events);
 const stable=classicPresentationBefore(doc);assert.equal(finalizeClassicPresentation(doc,stable,'npcDialogueNext',()=>otherBatchId),null);assert.equal(doc.classic.slots[0].combat.presentationBatch.batchId,batchId);
 doc.classic.slots[0].combat={...doc.classic.slots[0].combat,events:structuredClone(doc.classic.slots[0].combat.events)};assert.equal(finalizeClassicPresentation(doc,stable,'repairMoveAliases',()=>otherBatchId),null);assert.equal(doc.classic.slots[0].combat.presentationBatch.batchId,batchId);assert.equal(finalizeClassicPresentation(doc,stable,'turn',()=>otherBatchId).batchId,otherBatchId);
 const malformed=structuredClone(doc.classic.slots[0].combat);malformed.presentationBatch.events[0]=null;assert.equal(classicPresentationBatchView(malformed),null);
 assert.deepEqual(doc.classic.slots[1],{combat:{events:[{kind:'other'}]}});
});
