import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Magenta Sector 6 draft ladder and scaffold reach the shared Mission 21 encounter',()=>{
 const street={area:3,district:'lumiose-magenta-sector6',interior:null,x:2,y:6,facing:'up',zaMission20Stage:5,teamIds:['kept']};
 assert.equal(fieldDialogue(street).action,'magenta6Ladder');
 const roof={...street,district:'lumiose-magenta-sector6-roof',x:2,y:13,facing:'down'};assert.equal(fieldDialogue(roof).action,'magenta6Ladder');
 assert.equal(fieldMap(roof)[7][10],',');assert.ok(fieldPath(fieldMap(roof),roof,{x:18,y:6}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...roof,x:18,y:6,facing:'up'},90),90);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-sector6-roof',18,6,['kept']]);
 assert.equal(fieldDialogue(saved).action,'mission20CaseBattle');assert.equal(fieldDialogue({...saved,zaMission21Complete:true,zaMission21RewardPending:true}).action,'mission20ClaimStone');
 assert.notEqual(fieldMap({...saved,zaMission21Complete:true})[5][18],'m');
});

test('Magenta 6 scaffold links the street and roof while retaining legacy ladder access',()=>{
 const street={area:3,district:'lumiose-magenta-sector6',interior:null,x:2,y:6,facing:'up',zaMission20Stage:5,teamIds:['kept']};
 assert.deepEqual(fieldDialogue(street).actions.map(x=>x.action),['magenta6Scaffold','magenta6Ladder']);
 const scaffold={...street,district:'lumiose-magenta6-scaffold',x:2,y:12,facing:'down'},map=fieldMap(scaffold);
 assert.equal(fieldDialogue(scaffold).action,'magenta6Scaffold');assert.equal(map[3][18],'j');assert.ok(fieldPath(map,scaffold,{x:18,y:4}).length);
 assert.equal(fieldDialogue({...scaffold,x:18,y:4,facing:'up'}).action,'magenta6Scaffold');
 for(const value of [scaffold,{...scaffold,x:18,y:4}]){const restored=restoreAdventurePosition(storeAdventurePosition(value,138),138);assert.deepEqual([restored.district,restored.x,restored.y,restored.zaMission20Stage,restored.teamIds],[value.district,value.x,value.y,5,['kept']]);}
 const roof={...street,district:'lumiose-magenta-sector6-roof',x:2,y:13,facing:'down'};assert.deepEqual(fieldDialogue(roof).actions.map(x=>x.action),['magenta6Scaffold','magenta6Ladder']);assert.ok(fieldPath(fieldMap(roof),roof,{x:18,y:6}).length);
});

 test('Magenta court is walkable from the alley and retains stored positions',()=>{
 const alley={area:3,district:'lumiose-magenta6-court-alley',interior:null,x:19,y:7,facing:'right',teamIds:['kept']},map=fieldMap(alley);
 assert.equal(map[12][13],';');assert.ok(fieldPath(map,alley,{x:13,y:12}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...alley,x:13,y:12},139),139);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[alley.district,13,12,['kept']]);
 const street={...alley,district:'lumiose-magenta-sector6',x:4,y:7};assert.equal(fieldDialogue(street).action,'magenta6CourtEnter');
 });
