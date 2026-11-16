import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {adventureCombatView,adventurePlayCpu,adventureTeraSafeView,adventureValidateCombatCommand} from '../lib/adventure-tera-policy.mjs';
import {createMission10DoubleSnapshot,mission10MultiView,playMission10MultiTurn} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
const mon=(id,boxId,type)=>({...makeMon(id,40),boxId,teraType:type,moves:['방어'],pp:{}});
test('adventure blocks new tera on both sides without changing shared battle or saved types',()=>{
 const battle=createCombat([mon(152,'player','Grass')],[mon(25,'foe','Water')]),before=structuredClone(battle);
 assert.ok(battle.requests[0].specials.some(x=>x.key==='terastallize'));
 assert.ok(!adventureCombatView(battle).requests[0].specials.some(x=>x.key==='terastallize'));assert.deepEqual(battle,before);
 assert.throws(()=>adventureValidateCombatCommand(battle,0,{type:'move',move:'방어',special:'terastallize'}),/테라스탈/);
 assert.throws(()=>adventurePlayCpu(battle,{type:'move',move:'방어',special:'terastallize'}),/테라스탈/);assert.deepEqual(battle,before);
 const next=adventurePlayCpu(battle,{type:'move',move:'방어'});assert.equal(next.teams[1][0].terastallized,null);assert.equal(next.teams[0][0].teraType,'Grass');assert.equal(next.teams[1][0].teraType,'Water');
 const shared=playCpu(battle,{type:'move',move:'방어',special:'terastallize'});assert.equal(shared.teams[0][0].terastallized,'Grass');assert.equal(shared.teams[1][0].terastallized,'Water');
});
test('old already-terastallized battles restore and continue without new transformations',()=>{
 const old=playCpu(createCombat([mon(152,'player','Grass')],[mon(25,'foe','Water')]),{type:'move',move:'방어',special:'terastallize'}),saved=JSON.parse(JSON.stringify(old));
 const original=structuredClone(saved),view=adventureCombatView(saved);assert.equal(view.teams[0][0].terastallized,'Grass');assert.equal(view.teams[1][0].terastallized,'Water');assert.deepEqual(saved,original);
 const next=adventurePlayCpu(saved,{type:'move',move:'방어'});assert.equal(next.teams[0][0].terastallized,'Grass');assert.equal(next.teams[1][0].terastallized,'Water');assert.equal(next.teams[0][0].teraType,'Grass');
});
test('adventure multi view and action reject tera while retaining mega',()=>{
 const battle=createMission10DoubleSnapshot([mon(152,'player','Grass')],[mon(4,'ally','Fire')],[mon(25,'foe1','Water'),mon(133,'foe2','Normal')]);
 const view=mission10MultiView(battle),actor=view.requests[0].actors[0];assert.ok(!actor.specials.some(x=>x.key==='terastallize'));
 assert.throws(()=>playMission10MultiTurn(battle,{type:'move',move:'protect',special:'terastallize'}),/테라스탈/);
 const generic={requests:[{specials:[{key:'mega'},{key:'terastallize'}],actors:[{specials:[{key:'mega'},{key:'terastallize'}]}]}]};const filtered=adventureTeraSafeView(generic);assert.deepEqual(filtered.requests[0].specials,[{key:'mega'}]);assert.deepEqual(filtered.requests[0].actors[0].specials,[{key:'mega'}]);assert.equal(generic.requests[0].specials.length,2);
});
