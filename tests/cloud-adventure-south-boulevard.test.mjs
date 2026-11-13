import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,fieldDialogue,storeAdventurePosition,restoreAdventurePosition,FLORAL_STREET_BLOCKS} from '../lib/cloud-adventure/adventure-world.mjs';
test('Vert Sector 7 roof bridge and lift preserve old and upper positions',()=>{
 const lower={area:3,district:'lumiose-south-boulevard',interior:null,x:5,y:10,facing:'down',zaSide40Lift:true,teamIds:['kept']};
 assert.deepEqual(fieldDialogue(lower).actions.map(a=>a.action),['vert7Holovator','side40Reward']);assert.equal(fieldDialogue({...lower,zaSide40RewardClaimed:true}).action,'vert7Holovator');
 const upper={...lower,zaVert7RoofUpper:true};
 assert.ok(fieldPath(fieldMap(upper),upper,{x:18,y:8}).length);
 assert.equal(fieldDialogue(upper).action,'vert7Holovator');
 const saved=restoreAdventurePosition(storeAdventurePosition(upper,90),90);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaVert7RoofUpper,saved.teamIds],['lumiose-south-boulevard',5,10,true,['kept']]);
 const old=restoreAdventurePosition(storeAdventurePosition({...lower,x:11,y:8},91),91);
 assert.deepEqual([old.district,old.x,old.y],['lumiose-south-boulevard',11,8]);
});
test('South Boulevard connects Bleu Sector 7 and the existing research lab approach',()=>{
 const city={area:3,district:'lumiose-bleu-sector7',interior:null,x:11,y:15,zaRoyaleRank:'E',teamIds:['kept']};
 const street=stepField(city,'down');assert.deepEqual([street.district,street.x,street.y],['lumiose-south-boulevard',8,1]);
 assert.equal(stepField({...city,...street},'up').district,'lumiose-bleu-sector7');
 assert.ok(fieldPath(fieldMap({...city,...street}),street,{x:21,y:8}).length);
 const lab=stepField({...city,...street,x:21,y:8},'right');assert.equal(lab.district,'lumiose-floral');
 assert.equal(stepField({...city,...lab},'left').district,'lumiose-south-boulevard');
 const saved=restoreAdventurePosition(storeAdventurePosition({...city,...street,x:11,y:8},8),8);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-south-boulevard',11,8,['kept']]);
 const old={...city,district:'lumiose-floral',x:21,y:8};assert.equal(stepField(old,'right').district,'lumiose-zone1');
});

test('Bleu center is reachable from South Boulevard and keeps the existing heal action',()=>{
 const south={area:3,district:'lumiose-south-boulevard',interior:null,x:8,y:1,teamIds:['kept']};
 const sector=stepField(south,'up');assert.equal(sector.district,'lumiose-bleu-sector7');
 const state={...south,...sector};assert.ok(fieldPath(fieldMap(state),state,{x:11,y:13}).length);
 const center={...state,x:11,y:13,facing:'up'};assert.equal(fieldDialogue(center).action,'heal');
 const saved=restoreAdventurePosition(storeAdventurePosition(center,9),9);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-bleu-sector7',11,13,['kept']]);assert.equal(fieldDialogue(saved).action,'heal');
});


test('research lab streets keep three entrances, lab service and legacy saves',()=>{
 const base={area:3,district:'lumiose-floral',interior:null,teamIds:['kept'],money:731,zaMission03Stage:8,zaResearchRewards:[2]},map=fieldMap(base);
 for(const [x,y] of FLORAL_STREET_BLOCKS){
  assert.equal(map[y][x],'%');const old=storeAdventurePosition({...base,x,y},151);delete old.districtPosition.floralStreetsLayout;const restored=restoreAdventurePosition(old,151);
  assert.notDeepEqual([restored.x,restored.y],[x,y]);assert.deepEqual([restored.district,restored.teamIds,restored.money,restored.zaMission03Stage,restored.zaResearchRewards],['lumiose-floral',['kept'],731,8,[2]]);
  assert.ok(fieldPath(map,restored,{x:5,y:6}).length);assert.equal(restoreAdventurePosition(old,152).district,null);
 }
 for(const start of [{x:1,y:8},{x:21,y:8},{x:11,y:1}])for(const target of [{x:5,y:6},{x:11,y:1},{x:21,y:8}])if(start.x!==target.x||start.y!==target.y)assert.ok(fieldPath(map,start,target).length);
 assert.equal(fieldDialogue({...base,x:5,y:6,facing:'up'}).action,'enterLumioseLab');
 const inside={...base,interior:'lumioseLab',x:16,y:13};const restored=restoreAdventurePosition(storeAdventurePosition(inside,153),153);assert.deepEqual([restored.interior,restored.x,restored.y],['lumioseLab',16,13]);
});
