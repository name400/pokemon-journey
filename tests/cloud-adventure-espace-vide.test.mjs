import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {espaceVideMap} from '../lib/cloud-adventure/adventure-espace-vide.mjs';
test('Zone 10 eastern exit and Espace Vide retain west exit and saves',()=>{
 const start={area:3,district:'lumiose-zone10',interior:null,x:21,y:6,facing:'right',zaRoyaleRank:'F',zaZone10Upper:false};
 const lane=stepField(start,'right');assert.equal(lane.district,'lumiose-espace-vide');assert.ok(fieldPath(espaceVideMap(),lane,{x:11,y:2}).length);assert.ok(fieldPath(espaceVideMap(),lane,{x:11,y:14}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...start,...lane,teamIds:['kept']},4),4);assert.equal(saved.district,'lumiose-espace-vide');assert.deepEqual(saved.teamIds,['kept']);
 assert.equal(stepField({...start,...lane},'left').district,'lumiose-zone10');assert.equal(stepField({...start,x:1,y:6},'left').district,'lumiose-centrico-route');
 assert.equal(stepField({...start,...lane,zaRoyaleRank:'E'},'left').district,'lumiose-zone10');assert.equal(stepField({...start,...lane,zaRoyaleRank:'G'},'left').blocked,true);
});
