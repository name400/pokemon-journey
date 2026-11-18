import test from 'node:test';
import assert from 'node:assert/strict';
import {classicBattlePresentationKey,classicDialoguePresentation} from '../lib/rogue-presentation.mjs';
import {classicPresentationBefore,finalizeClassicPresentation,classicPresentationBatchView} from '../lib/rogue-presentation-ledger.mjs';

const one='11111111-1111-4111-8111-111111111111',two='22222222-2222-4222-8222-222222222222';
test('distinct finalized batches of identical events remain distinct through the playback key',()=>{
 const events=[{kind:'switch',text:'나와!',boxId:'hero'}];
 const run={id:'fixture',wave:2,combat:{turn:4,events:structuredClone(events)}};
 const doc={classic:{activeSlot:0,slots:[run,{keep:'other-slot'}]},other:{keep:true}};
 let before=classicPresentationBefore(doc);run.combat.events=structuredClone(events);
 finalizeClassicPresentation(doc,before,'turn',()=>one);
 const view=()=>({...run.combat,presentationBatch:classicPresentationBatchView(run.combat)});
 const first=view(),firstKey=classicBattlePresentationKey(run,first),saved=JSON.parse(JSON.stringify(doc));
 assert.equal(classicBattlePresentationKey(saved.classic.slots[0],{...saved.classic.slots[0].combat,presentationBatch:classicPresentationBatchView(saved.classic.slots[0].combat)}),firstKey);
 before=classicPresentationBefore(doc);run.combat.events=structuredClone(events);
 finalizeClassicPresentation(doc,before,'turn',()=>two);
 const second=view(),secondKey=classicBattlePresentationKey(run,second);
 assert.notEqual(firstKey,secondKey,'a new finalized batch must not be mistaken for an already played batch');
 assert.equal(classicDialoguePresentation({phase:'outro'},second,secondKey,firstKey).visible,false);
 assert.deepEqual(doc.classic.slots[1],{keep:'other-slot'});assert.deepEqual(doc.other,{keep:true});
});
test('legacy or malformed batch metadata does not change the legacy event key',()=>{
 const run={id:'legacy',wave:3},battle={turn:1,events:[{kind:'entry'}]};
 const key=classicBattlePresentationKey(run,battle);
 assert.equal(classicBattlePresentationKey(run,{...battle,presentationBatch:null}),key);
 assert.equal(classicBattlePresentationKey(run,{...battle,presentationBatch:{version:1,batchId:'bad',eventIds:['bad:0']}}),key);
});
