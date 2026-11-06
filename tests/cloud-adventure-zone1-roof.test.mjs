import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Zone 1 rock and rooftop ladder preserve the old ground route and saved roof state',()=>{
 const ground={area:3,district:'lumiose-zone1',interior:null,x:1,y:3,facing:'left',teamIds:['kept']};
 assert.equal(fieldDialogue(ground).action,'zone1RoofRock');
 assert.equal(stepField(ground,'left').blocked,true);
 assert.equal(fieldDialogue({...ground,zaZone1RoofRockCleared:true}).action,'zone1RoofLadder');
 const roof={...ground,district:'lumiose-zone1-roof',x:2,y:9,facing:'down',zaZone1RoofRockCleared:true};
 assert.equal(fieldDialogue(roof).action,'zone1RoofLadder');
 assert.ok(fieldPath(fieldMap(roof),roof,{x:20,y:6}).length);
 assert.equal(fieldDialogue({...roof,x:20,y:6,facing:'up'}).action,'zone1RoofPearl');
 const loaded=restoreAdventurePosition(storeAdventurePosition({...roof,x:20,y:6,zaZone1RoofPearl:true},52),52);
 assert.deepEqual([loaded.district,loaded.x,loaded.y,loaded.teamIds,loaded.zaZone1RoofPearl],['lumiose-zone1-roof',20,6,['kept'],true]);
 assert.notEqual(fieldMap(loaded)[5][20],'k');
 const old=restoreAdventurePosition(storeAdventurePosition({...ground,x:1,y:3},53),53);
 assert.deepEqual([old.district,old.x,old.y,old.teamIds],['lumiose-zone1',1,3,['kept']]);
});
