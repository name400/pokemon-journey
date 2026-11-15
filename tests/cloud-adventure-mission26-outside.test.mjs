import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldDialogue,storeAdventurePosition,restoreAdventurePosition,walkable,stepField} from '../lib/cloud-adventure/adventure-world.mjs';

test('Mission 26 outside marker requires hotel departure and preserves occupied saves',()=>{
 const s={area:3,district:'lumiose',interior:null,x:11,y:7,facing:'up',teamIds:['kept'],zaMission26Stage:3,zaMission27Complete:true,zaMission28Complete:true,zaMission29Complete:true};
 assert.notEqual(fieldMap(s)[7][11],'v');assert.notEqual(fieldMap({...s,zaMission26OutdoorReady:{version:2}})[7][11],'v');
 const ready={...s,zaMission26OutdoorReady:true};assert.equal(fieldMap(ready)[7][11],'v');assert.equal(walkable(fieldMap(ready)[7][11]),true);assert.equal(fieldDialogue(ready).action,'mission26SBC');
 const restored=restoreAdventurePosition(storeAdventurePosition(ready,55),55);assert.deepEqual([restored.x,restored.y,restored.teamIds],[11,7,['kept']]);assert.equal(stepField(restored,'down').blocked,undefined);
 assert.notEqual(fieldMap({...ready,zaMission26Complete:true})[7][11],'v');assert.notEqual(fieldMap({...ready,zaMission26SBCStage:8})[7][11],'v');assert.notEqual(fieldMap({...ready,zaMission28Complete:false})[7][11],'v');
});
