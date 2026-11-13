import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,fieldDialogue,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Rouge Sector 3 connects Autumnal Avenue to North Boulevard and restores saves',()=>{
 const road={area:3,district:'lumiose-autumnal-approach',interior:null,x:21,y:8,teamIds:['kept']};
 const sector=stepField(road,'right');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-rouge-sector3',1,8]);
 const s={...road,...sector};assert.ok(fieldPath(fieldMap(s),s,{x:11,y:1}).length);
 assert.equal(stepField(s,'left').district,'lumiose-autumnal-approach');
 const north=stepField({...s,x:11,y:1},'up');assert.equal(north.district,'lumiose-north-boulevard');
 const back=stepField({...s,...north},'up');assert.equal(back.district,'lumiose-rouge-sector3');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:11,y:1},55),55);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-rouge-sector3',11,1,['kept']]);
});

test('Rouge Sector 3 landmarks can be reached without changing stored state',()=>{
 const s={area:3,district:'lumiose-rouge-sector3',interior:null,x:1,y:8,teamIds:['kept']};
 for(const [x,y,name] of [[5,5,'레스토랑 르 예'],[16,14,'볼 부티크']]){
  assert.ok(fieldPath(fieldMap(s),s,{x,y}).length);const spot={...s,x,y,facing:'down'};
  assert.ok(fieldDialogue(spot).name.startsWith(name));const saved=restoreAdventurePosition(storeAdventurePosition(spot,56),56);
  assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-rouge-sector3',x,y,['kept']]);
 }
});

test('Rouge Sector 3 and the west of Rouge Plaza connect and restore saves',()=>{
 const s={area:3,district:'lumiose-rouge-sector3',interior:null,x:21,y:8,teamIds:['kept']};
 assert.ok(fieldPath(fieldMap(s),{x:1,y:8},s).length);
 const plaza=stepField(s,'right');assert.deepEqual([plaza.district,plaza.x,plaza.y,plaza.zaZone3TowerUpper],['lumiose-zone3',1,8,false]);
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,...plaza},58),58);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-zone3',1,8,['kept']]);
 const back=stepField(saved,'left');assert.deepEqual([back.district,back.x,back.y],['lumiose-rouge-sector3',21,8]);
 assert.equal(stepField({...saved,x:7,y:5,zaRoyaleRank:'Y',zaJoseeRequired:true},'down').blocked,true);
});

test('ball boutique offers supported original prices without altering the city path',()=>{
 const s={area:3,district:'lumiose-rouge-sector3',interior:null,x:16,y:14,facing:'down',teamIds:['kept']},d=fieldDialogue(s);
 assert.equal(d.ballBoutique,true);assert.deepEqual(Object.fromEntries(d.actions.map(a=>[a.ballId,a.price])),{quickball:1000,timerball:1000,netball:1000,duskball:1000,healball:300,luxuryball:3000});
 assert.ok(!d.actions.some(a=>['pokeball','greatball','masterball'].includes(a.ballId)));assert.equal(fieldMap(s)[14][16],'m');assert.deepEqual(restoreAdventurePosition(storeAdventurePosition(s,77),77).teamIds,['kept']);
});
