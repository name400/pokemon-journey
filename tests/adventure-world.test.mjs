import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureMap,fieldMap,fieldDialogue,normalizeField,fieldPath,stepField,walkable,findTile,validateAdventurePath,interactionAt,leagueIndex} from '../lib/adventure-world.mjs';

import {TRAINERS} from '../lib/campaign.mjs';
import {cityMap} from '../lib/adventure-city.mjs';
import {stepField as clientStep,personTile} from '../lib/adventure-field-core.mjs';

test('hotel practice offers a rematch only after the first report',()=>{
 const world={area:0,cityVisit:true,interior:'hotel',citySurvey:11,x:4,y:7,facing:'up'};
 assert.equal(fieldDialogue(world).action,'mzLidaBattle');
 assert.equal(fieldDialogue({...world,pcMZLida:1}).action,'mzLidaReport');
 assert.equal(fieldDialogue({...world,pcMZLida:2}).action,'mzLidaRematch');
});

test('all ten fields have reachable services, trainers, pickups and gated exits',()=>{
 for(let area=0;area<10;area++){
  const map=adventureMap(area),start={x:3,y:8};assert.equal(map.length,17);assert.ok(map.every(row=>row.length===23));
  for(const tile of ['H','M','N','Q','S','I',area===0?'P':area===9?'L':'G']){
   const target=findTile(map,tile);assert.ok(target,`${area} ${tile}`);const path=fieldPath(map,start,target);assert.ok(path.length,`${area}: reachable ${tile}`);
   let s={...start,area,badges:[],league:0};const person=personTile(map[target.y][target.x],map),face=person?path.pop():null;for(const d of path){const p=stepField(s,d);assert.ok(!p.blocked);s={...s,...p};}if(person){s.facing=face;assert.deepEqual([interactionAt(s)?.x,interactionAt(s)?.y],[target.x,target.y]);}else{assert.equal(s.x,target.x);assert.equal(s.y,target.y);}
  }
  if(area>0&&area<9){assert.equal(stepField({area,x:21,y:8,badges:[]},'right').blocked,true);assert.equal(stepField({area,x:21,y:8,badges:[TRAINERS[area-1].id]},'right').area,area+1);}
 }
});
test('legacy migration preserves progress and identities, is idempotent and recovers valid landmarks',()=>{
 const s={area:4,x:2,y:2,badges:['brock','misty'],league:0,activeId:'owned',teamIds:['owned'],steps:280,championWins:2,custom:{keep:1}};
 normalizeField(s);assert.deepEqual([s.x,s.y],[3,5]);assert.deepEqual(s.teamIds,['owned']);assert.equal(s.steps,280);assert.deepEqual(s.custom,{keep:1});const before=JSON.stringify(s);normalizeField(s);assert.equal(JSON.stringify(s),before);
 for(let area=0;area<10;area++)for(let x=0;x<15;x++)for(let y=0;y<11;y++){const old={area,x,y};normalizeField(old);assert.ok(walkable(adventureMap(area)[old.y]?.[old.x]));}
 const league={area:9,x:10,y:2};normalizeField(league);assert.deepEqual([league.x,league.y],[17,4]);assert.equal(leagueIndex(league),3);
});
test('water and structures block movement; paths stop at exits and batches are bounded',()=>{
 assert.equal(stepField({area:2,x:7,y:3,badges:[]},'right').blocked,true);
 assert.equal(stepField({area:0,x:3,y:5,badges:[]},'up').blocked,true);
 assert.equal(stepField({area:0,x:1,y:8,badges:[]},'left').blocked,true);
 assert.equal(stepField({area:2,x:1,y:8,badges:[],expedition:{id:1}},'left').area,9);
 assert.equal(interactionAt({area:1,x:18,y:5,facing:'up'}).tile,'G');
 for(const path of [[],['constructor'],['__proto__'],Array(9).fill('up'),[null]])assert.throws(()=>validateAdventurePath(path));
 assert.deepEqual(validateAdventurePath(['up','down']),['up','down']);
});
test('people block movement but legacy positions on people can still interact and leave',()=>{
 const facing={area:0,x:5,y:8,facing:'down',badges:[]};assert.equal(stepField(facing,'down').blocked,true);assert.equal(interactionAt(facing).tile,'Q');
 const legacy={...facing,x:5,y:9};assert.equal(interactionAt(legacy).tile,'Q');assert.ok(!stepField(legacy,'up').blocked);
});
test('city landmarks are reachable and the exit restores the saved field position',()=>{
 const map=cityMap(),start={x:3,y:8};for(const tile of ['J','R','B','M','W'])assert.ok(fieldPath(map,start,findTile(map,tile)).length,tile);
 assert.equal(fieldDialogue({cityVisit:true,area:0,x:6,y:8,facing:'up'}).name,'미르시티 안내판');
 const old={area:0,x:5,y:9,regionId:1,locationId:0};const exit=stepField({x:1,y:8,area:0,badges:[],cityVisit:true,cityReturn:old},'left');assert.deepEqual({x:exit.x,y:exit.y,area:exit.area,regionId:exit.regionId,locationId:exit.locationId},old);assert.equal(exit.cityVisit,false);
});
test('city companion choice preserves the previous default for existing saves',()=>{
 const s={cityVisit:true,area:0,x:10,y:10,facing:'up',citySurvey:8};
 assert.equal(fieldDialogue(s).name,'가이');
 assert.equal(fieldDialogue({...s,pcMZRival:'tani'}).name,'타니');
});
test('city garden and arena entrances and returns remain reachable',()=>{
 const city=cityMap();for(const tile of ['6','7'])assert.ok(fieldPath(city,{x:3,y:8},findTile(city,tile)).length);
 for(const [interior,start,entrance,landmark] of [['citywild',{x:11,y:15},{x:20,y:13},'S'],['cityarena',{x:7,y:8},{x:20,y:6},'B']]){
  const state={area:0,cityVisit:true,interior,...start,cityZoneReturn:entrance,badges:[]},map=fieldMap(state);
  const target=findTile(map,landmark);assert.ok(target);assert.ok(fieldPath(map,start,target).length||start.x===target.x&&start.y===target.y);
  const exit=findTile(map,'D'),path=fieldPath(map,start,exit);assert.ok(path.length);
  let current=state;for(const direction of path)current={...current,...stepField(current,direction)};
  assert.equal(current.interior,null);assert.deepEqual([current.x,current.y],[entrance.x,entrance.y]);assert.equal(current.cityVisit,true);
 }
});
test('garden special encounter is offered only before it is resolved',()=>{
 const s={area:0,cityVisit:true,interior:'citywild',x:17,y:5,facing:'up'};
 assert.equal(fieldDialogue(s).action,'gardenEncounter');
 assert.equal(fieldDialogue({...s,pcGardenRare:true}).action,undefined);
});
test('visible garden Pokémon occupy tiles until their encounter is resolved',()=>{
 const s={area:0,cityVisit:true,interior:'citywild',x:6,y:5,facing:'left',badges:[]};
 assert.equal(interactionAt(s).tile,'a');assert.deepEqual(fieldDialogue(s).choices.map(c=>c.action),['gardenVisibleCatch','gardenVisibleBattle']);assert.equal(stepField(s,'left').blocked,true);
 const cleared={...s,pcGardenWild:['a']};assert.equal(fieldMap(cleared)[5][5],'g');assert.ok(!stepField(cleared,'left').blocked);
 const alpha={...s,x:15,y:3,facing:'right'};assert.equal(interactionAt(alpha).tile,'e');assert.match(fieldDialogue(alpha).text,/강하고 잡기 어렵다/);assert.equal(stepField(alpha,'right').blocked,true);assert.equal(fieldMap({...alpha,pcGardenWild:['e']})[3][16],'g');
});
test('a pre-landmark city save relocates only an obstructed position and keeps progress',()=>{
 const saved={mapVersion:2,cityVisit:true,area:0,x:11,y:3,pcCityArena:{rank:4,points:1,wins:13},pcCityIncident:6,activeId:'owned',custom:{keep:true}};
 normalizeField(saved);assert.ok(walkable(fieldMap(saved)[saved.y]?.[saved.x]));assert.deepEqual(saved.pcCityArena,{rank:4,points:1,wins:13});assert.equal(saved.pcCityIncident,6);assert.equal(saved.activeId,'owned');assert.deepEqual(saved.custom,{keep:true});
 const once=JSON.stringify(saved);normalizeField(saved);assert.equal(JSON.stringify(saved),once);
 const safe={mapVersion:2,cityVisit:true,area:0,x:5,y:9};normalizeField(safe);assert.deepEqual([safe.x,safe.y],[5,9]);
});
test('client prediction and authoritative movement agree on all field, city and interior cells',()=>{
 const states=[...Array.from({length:10},(_,area)=>({area})),{area:0,cityVisit:true},{area:0,cityVisit:true,interior:'hotel'},{area:0,cityVisit:true,interior:'shop'},{area:0,cityVisit:true,interior:'citywild'},{area:0,cityVisit:true,interior:'cityarena'},{area:1,interior:'center'},{area:1,interior:'gym'},{area:9,expedition:{id:1}}];
 for(const base of states){const map=fieldMap(base);for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++)for(const direction of ['up','down','left','right']){
  const world={...base,x,y,map,badges:TRAINERS.slice(0,8).map(t=>t.id),league:0};assert.deepEqual(clientStep(world,direction),stepField(world,direction),`${JSON.stringify(base)} ${x},${y} ${direction}`);
 }}
});
