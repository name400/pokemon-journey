import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Palais arcade connects both roads and preserves saved position',()=>{
 const street={area:3,district:'lumiose-rouge-north',interior:null,x:1,y:10,teamIds:['kept']};
 const entered=stepField(street,'left');assert.deepEqual([entered.district,entered.x,entered.y],['lumiose-passage-palais',11,15]);
 const s={...street,...entered};assert.ok(fieldPath(fieldMap(s),s,{x:11,y:1}).length);
 assert.equal(stepField(s,'down').district,'lumiose-rouge-north');
 const north=stepField({...s,x:11,y:1},'up');assert.equal(north.district,'lumiose-north-boulevard');
 assert.equal(stepField({...s,...north},'up').district,'lumiose-passage-palais');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:8},63),63);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-passage-palais',11,8,['kept']]);
 assert.equal(fieldDialogue({...s,x:15,y:10,facing:'right'}).name,'The Usual');
 assert.equal(fieldDialogue({...s,x:7,y:13,facing:'left'}).name,'Marquage');
});
