import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {trackedAdventureLocalTarget} from '../lib/cloud-adventure/adventure-pending-quests.mjs';

test('Bleu Sector 1 connects its neighbors without replacing old Zone 5 exits',()=>{
 const area=3,interior=null,cases=[['lumiose-bleu-plaza-route',9,1,'up','lumiose-bleu-sector1',1,12],['lumiose-bleu-sector1',1,12,'left','lumiose-bleu-plaza-route',9,1],['lumiose-bleu-sector1',11,15,'down','lumiose-bleu-sector3',9,1],['lumiose-bleu-sector3',9,1,'up','lumiose-bleu-sector1',11,15],['lumiose-bleu-sector1',1,8,'left','lumiose-bleu-street',21,6],['lumiose-bleu-street',21,6,'right','lumiose-bleu-sector1',1,8],['lumiose-bleu-sector1',21,8,'right','lumiose-vernal',1,14],['lumiose-vernal',1,14,'left','lumiose-bleu-sector1',21,8],['lumiose-bleu-sector1',11,1,'up','lumiose-zone5',14,15],['lumiose-zone5',14,15,'down','lumiose-bleu-sector1',11,1],['lumiose-bleu-street',21,4,'right','lumiose-zone5',1,12],['lumiose-vernal',1,13,'left','lumiose-zone5',21,13],['lumiose-bleu-sector3',11,1,'up','lumiose-zone5',5,15],['lumiose-bleu-plaza-route',11,1,'up','lumiose-zone5',17,15]];
 for(const [district,x,y,direction,target,tx,ty] of cases){const s={area,interior,district,x,y},step=stepField(s,direction);assert.equal(step.district,target);assert.deepEqual([step.x,step.y],[tx,ty]);}
 for(const layer of ['zaVernalEastRoof','zaVernalSlowbroBank'])assert.equal(stepField({area,interior,district:'lumiose-vernal',x:1,y:14,[layer]:true},'left').blocked,true);
 const s={area,interior,district:'lumiose-bleu-sector1',x:1,y:12,facing:'right',zaMission20Complete:true,zaSide66Stage:1,zaTrackedQuestId:'66'},map=fieldMap(s);assert.ok(fieldPath(map,s,{x:3,y:6}).length);assert.ok(fieldPath(map,s,{x:21,y:8}).length);assert.ok(fieldPath(map,s,{x:1,y:8}).length);assert.deepEqual(trackedAdventureLocalTarget({...s,map}),{x:4,y:6});assert.equal(fieldDialogue({...s,x:3,y:6,facing:'right'},map).side66,true);
 const restored=restoreAdventurePosition(storeAdventurePosition(s,42),42);assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-bleu-sector1',1,12]);assert.equal(restored.zaSide66Stage,1);
});
