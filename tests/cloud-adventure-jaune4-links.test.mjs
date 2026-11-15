import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {centerAt,recordNearbyCenter,registeredCenters} from '../lib/cloud-adventure/adventure-fast-travel.mjs';

test('Jaune 4 center shares Hibernal registration and preserves saves',()=>{
 const s={area:3,district:'lumiose-jaune-sector4',interior:null,x:14,y:6,facing:'right',teamIds:['kept'],money:731};
 assert.ok(fieldPath(fieldMap(s),{x:11,y:15},s).length);
 assert.equal(fieldDialogue(s).action,'heal');assert.equal(centerAt(s,{tile:'H',x:15,y:6}).id,'hibernal');
 assert.equal(recordNearbyCenter(s,()=>fieldMap(s)),true);assert.deepEqual(s.zaFastTravelCenters,['hibernal']);
 assert.equal(recordNearbyCenter(s,()=>fieldMap(s)),false);assert.equal(registeredCenters(s).filter(c=>c.id==='hibernal').length,1);
 const restored=restoreAdventurePosition(storeAdventurePosition(s,170),170);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.money,restored.zaFastTravelCenters],['lumiose-jaune-sector4',14,6,['kept'],731,['hibernal']]);
 assert.equal(fieldDialogue(restored).action,'heal');
});

test('Jaune 4 links the ground construction site and Hibernal, preserving saves and old exits',()=>{
 const before={area:3,district:'lumiose-mission12-jaune3',zaMission12Layer:'ground',interior:null,x:11,y:1,teamIds:['kept'],steps:42};
 const entry=stepField(before,'up');assert.equal(entry.district,'lumiose-jaune-sector4');
 const state={...before,...entry};assert.equal(stepField(state,'down').district,before.district);
 assert.ok(fieldPath(fieldMap(state),state,{x:1,y:6}).length);
 const avenue=stepField({...state,x:1,y:6},'left');assert.deepEqual([avenue.district,avenue.x,avenue.y],['lumiose-hibernal-approach',21,6]);
 assert.equal(stepField({...state,...avenue},'right').district,state.district);
 const north=stepField({...state,x:11,y:1},'up');assert.deepEqual([north.district,north.x,north.y],['lumiose-jaune-sector7',11,15]);
 const sector7={...state,...north};assert.equal(stepField(sector7,'down').district,state.district);
 assert.ok(fieldPath(fieldMap(sector7),sector7,{x:1,y:8}).length);
 assert.equal(stepField({...sector7,x:11,y:1,zaRoyaleRank:'W'},'up').blocked,true);
 assert.equal(stepField({...sector7,x:1,y:8},'left').district,'lumiose-jaune-street');
 const saved=storeAdventurePosition({...state,x:9,y:6},77),restored=restoreAdventurePosition(saved,77);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds,restored.steps],[state.district,9,6,['kept'],42]);
 assert.equal(stepField({...before,x:11,y:15},'down').district,'lumiose-centrico-route');
 assert.equal(stepField({...before,zaMission12Layer:'roof',x:11,y:1},'up').transitioned,undefined);
});
