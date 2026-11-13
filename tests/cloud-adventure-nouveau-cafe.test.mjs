import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
import {NOUVEAU_DRINKS,nouveauCafeUnlocked} from '../lib/cloud-adventure/adventure-nouveau-cafe.mjs';
import {recordLandmarks,registeredLandmarks,taxiDestinations} from '../lib/cloud-adventure/adventure-fast-travel.mjs';

test('Nouveau and Richissime are separate while the old cafe story point remains usable',()=>{
 const s={area:3,district:'lumiose-centrico-route',interior:null,x:7,y:7,facing:'up',zaMission05Stage:5,zaMission05CafePending:true,zaRoyaleRank:'Y',teamIds:['kept']},map=fieldMap(s),newDialogue=fieldDialogue(s,map);
 assert.equal(map[6][7],'q');assert.ok(walkable(map[6][7]));assert.equal(newDialogue.action,'mission05Cafe');assert.ok(!newDialogue.actions?.some(a=>a.action==='enterRichissime'));
 const legacy={...s,x:16,y:5,facing:'left'},old=fieldDialogue(legacy,fieldMap(legacy));assert.equal(old.action,'mission05Cafe');assert.ok(old.actions.some(a=>a.action==='enterRichissime'));
 assert.equal(nouveauCafeUnlocked(s),false);const ready={...s,zaMission05CafePending:false,zaMission05CafeSeen:true};assert.equal(nouveauCafeUnlocked(ready),true);const dialogue=fieldDialogue(ready,fieldMap(ready));assert.equal(dialogue.actions.length,7);assert.deepEqual(dialogue.actions.map(a=>a.action),NOUVEAU_DRINKS.map(d=>d.id));
 const saved=restoreAdventurePosition(storeAdventurePosition({...ready,x:7,y:6},3),3);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-centrico-route',7,6,['kept']]);assert.equal(recordLandmarks(ready),true);assert.ok(registeredLandmarks(ready).some(p=>p.id==='cafe-nouveau'));assert.ok(taxiDestinations(ready).some(p=>p.id==='cafe-nouveau'));
});
