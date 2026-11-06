import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Zone 3 west entrance reaches Sommi and preserves previous connections',()=>{
 const zone={area:3,district:'lumiose-zone3',interior:null,x:1,y:6,facing:'left',zaRoyaleRank:'X',teamIds:['kept']};
 const road=stepField(zone,'left');assert.deepEqual([road.district,road.x,road.y],['lumiose-rouge-sector1',21,8]);
 const sector={...zone,...road};assert.ok(fieldPath(fieldMap(sector),sector,{x:9,y:6}).length);
 assert.equal(fieldDialogue({...sector,x:9,y:6,facing:'up'}).action,'side04Battle');
 assert.equal(fieldDialogue({...sector,x:9,y:6,facing:'up',zaRoyaleRank:'Y'}).action,undefined);
 assert.equal(stepField(sector,'right').district,'lumiose-zone3');
 assert.equal(stepField({...zone,x:1,y:8},'left').district,'lumiose-rouge-sector3');
 const saved=restoreAdventurePosition(storeAdventurePosition({...sector,x:9,y:6},59),59);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-rouge-sector1',9,6,['kept']]);
 const roof={...sector,district:'lumiose-rouge-sector1-roof',x:3,y:12,facing:'down',zaSide04Won:true};
 assert.equal(fieldDialogue(roof).action,'side04Holovator');assert.ok(fieldPath(fieldMap(roof),roof,{x:12,y:6}).length);
 const loaded=restoreAdventurePosition(storeAdventurePosition(roof,60),60);assert.deepEqual([loaded.district,loaded.x,loaded.y,loaded.zaSide04Won],['lumiose-rouge-sector1-roof',3,12,true]);
});
