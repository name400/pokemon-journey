import test from 'node:test';
import assert from 'node:assert/strict';
import {FAST_TRAVEL_CENTERS,centerAt,recordCenter,registeredCenters} from '../lib/cloud-adventure/adventure-fast-travel.mjs';
import {fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('registered centers are limited to real center tiles and survive save restoration',()=>{
 for(const c of FAST_TRAVEL_CENTERS){const s={area:3,district:c.district,interior:null,zaRougeStreetSouth:c.zaRougeStreetSouth,x:c.x,y:c.y,facing:'down'};assert.equal(fieldMap(s)[c.y][c.x],'H');assert.equal(centerAt(s,{...c,tile:'H'}).id,c.id);}
 const s={area:3,district:'lumiose',interior:null,x:3,y:5,facing:'down',zaMission06Started:true,teamIds:['kept']};assert.equal(recordCenter(s,{x:3,y:5,tile:'H'}),true);assert.equal(recordCenter(s,{x:3,y:5,tile:'H'}),false);assert.equal(recordCenter(s,{x:1,y:5,tile:'H'}),false);
 s.zaFastTravelCenters.push('untrusted','bleu');const restored=restoreAdventurePosition(storeAdventurePosition(s,88),88);assert.deepEqual(registeredCenters(restored).map(c=>c.id),['hotel','bleu']);assert.deepEqual(restored.teamIds,['kept']);assert.ok(fieldDialogue(restored).actions.some(a=>a.action==='fastTravel-bleu'));
});
