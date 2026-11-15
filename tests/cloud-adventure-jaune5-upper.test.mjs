import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 5 upper courtyard route preserves ground exits and the saved party',()=>{
 const ground={area:3,district:'lumiose-jaune-sector5',interior:null,x:12,y:4,teamIds:['kept'],steps:42,zaJaune5CourtItems:['future']};
 const up=stepField(ground,'up');assert.deepEqual([up.district,up.x,up.y],['lumiose-jaune5-upper',11,15]);
 const high={...ground,...up};assert.ok(fieldPath(fieldMap(high),high,{x:11,y:4}).length);
 assert.equal(fieldDialogue({...high,x:11,y:4,facing:'up'}).action,'jaune5CourtItem-roof-northern-rare-candy');
 assert.notEqual(fieldDialogue({...high,x:11,y:4,facing:'up',zaJaune5CourtItems:['roof-northern-rare-candy']})?.action,'jaune5CourtItem-roof-northern-rare-candy');
 const restored=restoreAdventurePosition(storeAdventurePosition({...high,x:11,y:4},91),91);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.zaJaune5CourtItems],[high.district,11,4,['kept'],['future']]);
 assert.equal(stepField({...high,x:11,y:15},'down').district,ground.district);
 assert.equal(stepField({...ground,x:1,y:8},'left').district,'lumiose-jaune-sector4');
});
