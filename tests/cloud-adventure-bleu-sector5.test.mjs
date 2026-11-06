import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldPath,fieldMap,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('both Aymlis west gates connect to Bleu Sector 5 without replacing legacy exits',()=>{
 const city={area:3,district:'lumiose-bleu-sector5',interior:null,x:21,y:5,facing:'right',zaRoyaleRank:'F',teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(city),city,{x:21,y:12}).length);
 assert.equal(stepField(city,'right').blocked,true);
 for(const y of [5,12]){
  const state={...city,y,zaRoyaleRank:'E'};const park=stepField(state,'right');
  assert.deepEqual([park.district,park.x,park.y],['lumiose-zone12',1,y]);
  const back=stepField({...state,...park},'left');
  assert.deepEqual([back.district,back.x,back.y],['lumiose-bleu-sector5',21,y]);
 }
 const saved=restoreAdventurePosition(storeAdventurePosition(city,4),4);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-bleu-sector5',21,5,['kept']]);
 const old={...city,district:'lumiose-zone12',x:1,y:10};
 assert.equal(stepField(old,'left').district,'lumiose-centrico-route');
 const restored=restoreAdventurePosition(storeAdventurePosition(old,4),4);
 assert.deepEqual([restored.district,restored.x,restored.y],['lumiose-zone12',1,10]);
});
