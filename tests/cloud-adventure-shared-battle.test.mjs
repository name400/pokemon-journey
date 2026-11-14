import test from 'node:test';
import assert from 'node:assert/strict';
import {makeSharedBattleGuard,sharedBattleConflicts,validSharedBattleGuard} from '../lib/cloud-adventure/adventure-shared-battle.mjs';

test('battle guard fingerprints only owned participants and keeps unknown formats untouched',async()=>{
 const snapshots=new Map([['p',{data:'{"id":152}',origin:'starter'}]]),combat={teams:[[{boxId:'p'},{boxId:'ally'}],[]]},guard=await makeSharedBattleGuard(combat,['p'],snapshots,new Map());
 assert.equal(validSharedBattleGuard(guard),true);assert.deepEqual(guard.entries.map(e=>e.id),['p']);assert.equal(await sharedBattleConflicts(guard,snapshots),false);
 assert.equal(await sharedBattleConflicts(guard,new Map([['p',{data:'{"id":152,"other":true}',origin:'starter'}]])),true);
 assert.equal(await sharedBattleConflicts(guard,new Map()),true);assert.equal(await sharedBattleConflicts(guard,new Map([['p',{data:'{"id":152}',origin:'capture'}]])),true);
 assert.equal(validSharedBattleGuard({...guard,version:2}),false);assert.equal(validSharedBattleGuard({...guard,future:true}),false);assert.equal(validSharedBattleGuard({...guard,entries:[{...guard.entries[0],future:true}]}),false);
 const next=await makeSharedBattleGuard(combat,['p'],snapshots,new Map([['p',{boxId:'p',origin:'starter',id:152,hp:3}]]));assert.equal(await sharedBattleConflicts(next,new Map([['p',{data:'{"id":152,"hp":3}',origin:'starter'}]])),false);
});
