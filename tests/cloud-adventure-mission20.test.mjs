import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {mission20GhostsCaught,mission20Complete} from '../lib/cloud-adventure/adventure-mission20.mjs';
import {lumioseGhostHouseMap,lumioseRustMap,fieldPath,findTile,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

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
