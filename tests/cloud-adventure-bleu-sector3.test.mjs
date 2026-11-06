import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,fieldMap,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
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
 const gate={...city,...tunnel,x:21,y:8};assert.equal(stepField(gate,'right').blocked,true);
 const sewer=stepField({...gate,zaBleuSewerOpened:true},'right');
 assert.deepEqual([sewer.district,sewer.x,sewer.y,sewer.zaSewerReturn],['lumiose-sewer',11,15,'bleu3']);
 const saved=restoreAdventurePosition(storeAdventurePosition({...gate,...sewer,zaBleuSewerOpened:true},7),7);
 const back=stepField(saved,'down');assert.deepEqual([back.district,back.x,back.y,back.zaSewerReturn],['lumiose-bleu3-sewer-approach',21,8,null]);
 assert.equal(stepField({...saved,zaSewerReturn:null},'down').district,'lumiose-vernal');
});
