import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,fieldMap,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('both Aymlis north gates connect to Bleu Sector 3 and preserve save positions',()=>{
 const city={area:3,district:'lumiose-bleu-sector3',interior:null,x:6,y:15,facing:'down',zaRoyaleRank:'F',teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(city),city,{x:16,y:15}).length);
 assert.equal(stepField(city,'down').blocked,true);
 for(const x of [6,16]){
  const state={...city,x,zaRoyaleRank:'E'};const park=stepField(state,'down');
  assert.deepEqual([park.district,park.x,park.y],['lumiose-zone12',x,1]);
  const back=stepField({...state,...park},'up');
  assert.deepEqual([back.district,back.x,back.y],['lumiose-bleu-sector3',x,15]);
 }
 const restored=restoreAdventurePosition(storeAdventurePosition(city,4),4);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],['lumiose-bleu-sector3',6,15,['kept']]);
 const old={...city,district:'lumiose-zone12',x:1,y:10};
 assert.equal(stepField(old,'left').district,'lumiose-centrico-route');
 assert.deepEqual([restoreAdventurePosition(storeAdventurePosition(old,4),4).x,restoreAdventurePosition(storeAdventurePosition(old,4),4).y],[1,10]);
});
test('Bleu sewer approach preserves the barrier, unlock and return after restore',()=>{
 const city={area:3,district:'lumiose-bleu-sector3',interior:null,x:21,y:3,facing:'right',zaMission19Complete:true,teamIds:['kept']};
 const tunnel=stepField(city,'right');assert.equal(tunnel.district,'lumiose-bleu3-sewer-approach');
 assert.equal(stepField({...city,...tunnel,x:8,y:8},'right').blocked,true);
 const gate={...city,...tunnel,x:17,y:1};assert.equal(stepField(gate,'up').blocked,true);
 const sewer=stepField({...gate,zaBleuSewerOpened:true},'up');
 assert.deepEqual([sewer.district,sewer.x,sewer.y,sewer.zaSewerReturn],['lumiose-sewer',11,15,'bleu3']);
 const saved=restoreAdventurePosition(storeAdventurePosition({...gate,...sewer,zaBleuSewerOpened:true},7),7);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y,back.zaSewerReturn],['lumiose-bleu3-sewer-approach',17,1,null]);
 assert.equal(stepField({...saved,zaSewerReturn:null},'down').district,'lumiose-vernal');
 const old={...city,...tunnel,x:21,y:8,zaBleuSewerOpened:true,zaMission57Won:true};
 const restored=restoreAdventurePosition(storeAdventurePosition(old,7),7);
 assert.deepEqual([restored.x,restored.y,restored.zaBleuSewerOpened,restored.zaMission57Won,restored.teamIds],[21,8,true,true,['kept']]);
 assert.equal(stepField(restored,'right').district,'lumiose-zone5-drain');
 assert.equal(fieldDialogue({...city,...tunnel,x:17,y:3,facing:'up',zaMission19Complete:true}).action,'openBleuSewer');
});

test('Bleu Sector 3 and Vernal Avenue connect without entering locked Zone 12',()=>{
 const city={area:3,district:'lumiose-bleu-sector3',interior:null,x:21,y:8,zaRoyaleRank:'F',teamIds:['kept']};
 assert.equal(stepField({...city,x:6,y:15},'down').blocked,true);
 const avenue=stepField(city,'right');assert.deepEqual([avenue.district,avenue.x,avenue.y],['lumiose-vernal',1,5]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...city,...avenue},49),49);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-vernal',1,5,['kept']]);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-bleu-sector3',21,8]);
});

test('the provisional stairs connect the avenue to the sewer approach and keep saved positions',()=>{
 let s={area:3,district:'lumiose-vernal',interior:null,x:1,y:5,teamIds:['kept'],steps:42};
 s={...s,...stepField(s,'left')};
 for(const direction of ['up','up','up','up','up']){const next=stepField(s,direction);assert.equal(next.blocked,undefined);s={...s,...next};}
 assert.deepEqual([s.x,s.y], [21,3]);
 const stairs={...s,y:5};assert.equal(fieldMap(stairs)[5][21],':');
 const restored=restoreAdventurePosition(storeAdventurePosition(stairs,51),51);
 assert.deepEqual([restored.district,restored.x,restored.y,restored.steps,restored.teamIds],['lumiose-bleu-sector3',21,5,42,['kept']]);
 const tunnel=stepField(s,'right');assert.equal(tunnel.district,'lumiose-bleu3-sewer-approach');
 assert.equal(stepField({...s,...tunnel},'left').district,'lumiose-bleu-sector3');
});
