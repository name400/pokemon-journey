import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {canLearnStoryTm} from '../lib/cloud-adventure/adventure-story-tm.mjs';

test('Mission 19 sewer branch ice bridge preserves both sides and existing save positions',()=>{
 const s={area:3,district:'lumiose-sewer',interior:null,zaMission19Stage:11,teamIds:['kept'],x:3,y:10,facing:'left'};
 assert.equal(fieldDialogue(s).action,'enterSewerIceBranch');
 const branch={...s,zaSewerIceBranch:true,x:21,y:8,facing:'left'},before=fieldMap(branch);
 assert.equal(before[8][13],'i');assert.equal(before[8][4],'o');assert.equal(fieldPath(before,branch,{x:4,y:8}).length,0);
 assert.equal(fieldDialogue({...branch,x:14,y:8}).action,'sewerIceBridge');
 const opened={...branch,zaSewerIceBridge:true},after=fieldMap(opened);assert.ok(fieldPath(after,opened,{x:4,y:8}).length);
 assert.equal(fieldDialogue({...opened,x:5,y:8}).action,'sewerCrunchTM');
 for(const state of [s,branch,opened]){const copy=restoreAdventurePosition(storeAdventurePosition(state,42),42);assert.deepEqual([copy.district,copy.x,copy.y,copy.teamIds],[state.district,state.x,state.y,['kept']]);assert.equal(!!copy.zaSewerIceBranch,!!state.zaSewerIceBranch);}
 const stale=restoreAdventurePosition(storeAdventurePosition(opened,42),43);assert.equal(stale.district,null);assert.equal(stale.zaSewerIceBranch,undefined);assert.equal(stale.zaSewerIceBridge,true);assert.deepEqual(stale.teamIds,['kept']);
 const back=stepField({...opened,x:21,y:8},'right');assert.deepEqual([back.district,back.x,back.y,back.zaSewerIceBranch],['lumiose-sewer',3,10,false]);
 assert.equal(canLearnStoryTm({'za-tm025':1},{id:130,speciesId:130,moves:[]},'za-tm025'),true);
 assert.equal(canLearnStoryTm({'za-tm025':1},{id:1,speciesId:1,moves:[]},'za-tm025'),false);
});
