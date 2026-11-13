import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {recordLandmarks,mapTravelDestinations} from '../lib/cloud-adventure/adventure-fast-travel.mjs';

test('museum frontage and both exhibition floors connect without replacing boulevard routes',()=>{
 const road={area:3,district:'lumiose-north-boulevard',interior:null,x:15,y:1,facing:'up',teamIds:['kept']};const entry=stepField(road,'up');assert.equal(entry.district,'lumiose-museum-front');const front={...road,...entry};assert.ok(fieldPath(fieldMap(front),front,{x:11,y:7}).length);assert.equal(stepField(front,'down').district,road.district);
 const door={...front,x:11,y:7,facing:'up'};assert.equal(fieldDialogue(door).action,'enterMuseum');assert.equal(recordLandmarks(door),true);assert.ok(mapTravelDestinations(door).some(p=>p.id==='museum'));
 for(const interior of ['museum1','museum2']){const s={...front,interior,x:18,y:6,facing:'up'};assert.equal(fieldDialogue(s).action,'museumStairs');assert.ok(fieldPath(fieldMap(s),s,{x:5,y:5}).length);const display=fieldDialogue({...s,x:5,y:5,facing:'up'});assert.match(display.name,interior==='museum2'?/히스이/:/칼로스/);const restored=restoreAdventurePosition(storeAdventurePosition(s,81),81);assert.deepEqual([restored.district,restored.interior,restored.x,restored.y,restored.teamIds],[s.district,interior,18,6,['kept']]);}
 assert.equal(stepField({...front,interior:'museum1',x:11,y:15},'down').interior,null);assert.equal(fieldMap({...front,interior:'museum2'})[16][11],'#');
 const old=restoreAdventurePosition(storeAdventurePosition({...road,x:15,y:2},82),82);assert.deepEqual([old.district,old.x,old.y,old.teamIds],[road.district,15,2,['kept']]);
});

test('marine gift retains the marine evolution target', async()=>{
 const {makeMon}=await import('../lib/game.mjs');const {evolutionOptions}=await import('../lib/evolution.mjs');
 const spewpa=makeMon(30297,12);assert.equal(spewpa.formName,'marine');assert.ok(evolutionOptions(spewpa,{},[],{}).some(o=>o.id===30093&&o.ready));
});

test('Hisui exhibition cases keep old positions and Spewpa routes accessible',async()=>{
 const {MUSEUM_HISUI_EXHIBITS,MUSEUM_SPEWPA_SPOTS}=await import('../lib/cloud-adventure/adventure-museum.mjs');
 const world={area:3,district:'lumiose-museum-front',interior:'museum2',x:18,y:6,facing:'up',teamIds:['kept'],zaSide21Started:true,zaSide21Found:['museum1-0']},map=fieldMap(world);
 for(const exhibit of MUSEUM_HISUI_EXHIBITS){
  assert.equal(map[exhibit.y][exhibit.x],'v');
  const front={...world,x:exhibit.x,y:exhibit.y+1,facing:'up'};
  assert.ok(fieldPath(map,world,front).length);assert.match(fieldDialogue(front).name,new RegExp(exhibit.name));
  const old=restoreAdventurePosition(storeAdventurePosition({...world,x:exhibit.x,y:exhibit.y},44),44);
  assert.deepEqual([old.x,old.y,old.interior,old.teamIds,old.zaSide21Found],[exhibit.x,exhibit.y,'museum2',['kept'],['museum1-0']]);
 }
 for(const [x,y] of MUSEUM_SPEWPA_SPOTS.museum2){assert.equal(map[y][x],'t');assert.ok(fieldPath(map,world,{x,y}).length);}
});
