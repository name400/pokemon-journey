import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
test('Magenta Sector 4 links Autumnal Avenue and gated Zone 7 with safe saves',()=>{
 const avenue={area:3,district:'lumiose-autumnal-approach',interior:null,x:1,y:14,zaRoyaleRank:'V',teamIds:['kept']};
 const sector=stepField(avenue,'left');assert.deepEqual([sector.district,sector.x,sector.y],['lumiose-magenta-sector4',21,8]);
 const s={...avenue,...sector};assert.ok(fieldPath(fieldMap(s),s,{x:11,y:15}).length);
 assert.equal(stepField(s,'right').district,'lumiose-autumnal-approach');assert.equal(stepField({...s,x:11,y:15},'down').blocked,true);
 const zone=stepField({...s,x:11,y:15,zaRoyaleRank:'F'},'down');assert.deepEqual([zone.district,zone.x,zone.y],['lumiose-zone7',5,1]);
 assert.equal(stepField({...s,...zone,zaRoyaleRank:'F'},'up').district,'lumiose-magenta-sector4');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,x:5,y:6},72),72);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-sector4',5,6,['kept']]);
 assert.equal(fieldDialogue({...saved,facing:'up'}).name,'카페 포켓몬아미 (위치 초안)');
});
test('mission 28 marker follows battle and reward state without changing saved position',()=>{
 const s={area:3,district:'lumiose-magenta-sector4',interior:null,x:14,y:9,facing:'up',zaMission26Stage:3,teamIds:['kept']};
 assert.equal(fieldMap(s)[8][14],'8');
 assert.equal(fieldDialogue(s).action,'mission26CaseBattle');
 const pending={...s,zaMission28Complete:true,zaMission28RewardPending:true};
 assert.equal(fieldDialogue(pending).action,'mission26ClaimStone');
 const saved=restoreAdventurePosition(storeAdventurePosition(pending,73),73);
 assert.deepEqual([saved.x,saved.y,saved.teamIds],[14,9,['kept']]);
 assert.notEqual(fieldMap({...pending,zaMission28RewardPending:false})[8][14],'8');
});
test('draft holovator connects the street to a saved rooftop route and back',()=>{
 const s={area:3,district:'lumiose-magenta-sector4',interior:null,x:10,y:8,facing:'left',zaMission26Stage:3,teamIds:['kept']};
 assert.equal(fieldDialogue(s).action,'magenta4Holovator');
 const step=stepField(s,'left');assert.notEqual(step.district,'lumiose-magenta-sector4-roof');
 const upper={...s,district:'lumiose-magenta-sector4-roof',x:1,y:13,facing:'down'};assert.equal(fieldDialogue(upper).action,'magenta4Holovator');assert.ok(fieldPath(fieldMap(upper),upper,{x:19,y:5}).length);
 const saved=restoreAdventurePosition(storeAdventurePosition({...upper,x:19,y:5,facing:'up'},74),74);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],['lumiose-magenta-sector4-roof',19,5,['kept']]);
 assert.equal(fieldDialogue(saved).action,'mission26CaseBattle');
 const back=stepField(upper,'down');assert.notEqual(back.district,'lumiose-magenta-sector4');
});
test('draft rooftop circuit and scaffolding retain earlier rooftop saves',()=>{
 const s={area:3,district:'lumiose-magenta-sector4-roof',interior:null,x:1,y:13,teamIds:['kept'],zaMission26Stage:3};
 const map=fieldMap(s);assert.ok(fieldPath(map,s,{x:13,y:12}).length);assert.ok(fieldPath(map,{x:13,y:12},{x:19,y:5}).length);
 assert.equal(map[4][15],',');assert.equal(map[4][16],',');
 for(const [x,y] of [[1,13],[3,8],[10,4],[15,4],[19,5]]){
  const restored=restoreAdventurePosition(storeAdventurePosition({...s,x,y},75),75);
  assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],[s.district,x,y,['kept']]);
 }
});
