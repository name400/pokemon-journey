import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {mission20GhostsCaught,mission20Complete} from '../lib/cloud-adventure/adventure-mission20.mjs';
import {lumioseGhostHouseMap,lumioseRustMap,fieldPath,findTile,storeAdventurePosition,restoreAdventurePosition,walkable,stepField,fieldDialogue} from '../lib/cloud-adventure/adventure-world.mjs';

test('Rust office courtyard preserves access and restores older positions on new walls',()=>{
 const map=lumioseRustMap(),base={area:3,district:'lumiose-rust',interior:null,regionId:6,districtReturnRegion:1,teamIds:['kept'],zaMission20Stage:1};
 assert.equal(map[2][11],'#');assert.equal(map[8][6],'|');assert.equal(map[10][11],',');assert.equal(map[6][11],'d');
 for(const start of [{x:1,y:8},{x:21,y:8},{x:11,y:15}])assert.ok(fieldPath(map,start,{x:11,y:6}).length);
 assert.equal(fieldDialogue({...base,x:11,y:7,facing:'up'}).action,'mission20Guard');
 assert.equal(stepField({...base,x:1,y:8},'left').district,'lumiose-bleu-plaza-route');
 assert.equal(stepField({...base,x:21,y:8},'right').district,'lumiose-bleu-sector4');
 for(const [x,y] of [[11,2],[6,8],[9,10]]){
  const old=storeAdventurePosition({...base,x,y},110);delete old.districtPosition.rustLayout;
  const restored=restoreAdventurePosition(structuredClone(old),110);
  assert.equal(restored.district,base.district);assert.ok(walkable(map[restored.y][restored.x]));assert.deepEqual([restored.zaMission20Stage,restored.teamIds],[1,['kept']]);
  assert.equal(restoreAdventurePosition(structuredClone(old),111).district,null);
 }
 assert.equal(storeAdventurePosition({...base,x:11,y:7},112).districtPosition.rustLayout,1);
});

test('temporary meeting areas restore positions and house encounters stay reachable',()=>{
 for(const [district,map,markers] of [['lumiose-rust',lumioseRustMap(),['d']],['lumiose-ghost-house',lumioseGhostHouseMap(),['q','a','b','n']]]){
  for(const marker of markers)assert.ok(fieldPath(map,{x:11,y:14},findTile(map,marker)).length,marker);
  const saved={area:3,district,interior:null,x:11,y:14,facing:'up',regionId:6,districtReturnRegion:1,zaMission20Stage:7,activeId:'owned',teamIds:['owned']};const restored=restoreAdventurePosition(storeAdventurePosition(saved,17),17);assert.equal(restored.district,district);assert.equal(restored.zaMission20Stage,7);assert.deepEqual(restored.teamIds,['owned']);
 }
 assert.deepEqual(mission20GhostsCaught({zaMission20GhostCaught:[92,92,93,0]}),[92,93]);assert.equal(mission20Complete({zaMission21Complete:true,zaMission22Complete:true}),false);
});
test('Philippe and Gwynn can mega evolve, and the three rogue forms start mega evolved',()=>{
 for(const [id,item,form] of [[227,'skarmorite','skarmorymega'],[609,'chandelurite','chandeluremega']]){let b=createCombat([makeMon(150,40)],[{...makeMon(id,47),item}],{strategy:'balanced'});b=playCpu(b,{type:'move',move:b.requests[0].moves[0].id});assert.equal(b.teams[1][0].battleAppearance,form);assert.equal(b.teams[1][0].mega,true);}
 for(const [id,form] of [[10052,'mawilemega'],[10298,'barbaraclemega'],[10045,'ampharosmega']]){const b=createCombat([makeMon(150,40)],[makeMon(id,49)]);assert.equal(b.teams[1][0].battleAppearance,form);assert.equal(b.teams[1][0].mega,true);}
});
