import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 2 connects Centrico and Sector 6 while retaining dojo and canal',()=>{
 const s={area:3,district:'lumiose-jaune-sector2',interior:null,x:1,y:10,teamIds:['kept'],steps:42,zaRoyaleRank:'W'};
 const west=stepField(s,'left');assert.deepEqual([west.district,west.x,west.y],['lumiose-centrico-route',21,6]);assert.equal(stepField({...s,...west},'right').district,s.district);
 assert.ok(fieldPath(fieldMap(s),s,{x:21,y:8}).length);
 const east=stepField({...s,x:21,y:8},'right');assert.deepEqual([east.district,east.x,east.y],['lumiose-jaune-sector6',1,8]);assert.equal(stepField({...s,...east},'left').district,s.district);
 assert.equal(fieldDialogue({...s,x:5,y:11,facing:'up'})?.action,'enterJusticeDojo');
 assert.equal(stepField({...s,x:11,y:15},'down').district,'lumiose-saison-canalside');
 assert.equal(stepField({...s,...east,x:21,y:8},'right').district,'lumiose-jaune-sector10');
 for(const world of [s,{...s,...west},{...s,...east}]){const r=restoreAdventurePosition(storeAdventurePosition(world,58),58);assert.deepEqual([r.district,r.x,r.y,r.teamIds,r.steps],[world.district,world.x,world.y,['kept'],42]);}
});
