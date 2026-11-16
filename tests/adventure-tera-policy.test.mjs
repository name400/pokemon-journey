import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {adventureCombatView,adventurePlayCpu,adventureTeraSafeView,adventureValidateCombatCommand} from '../lib/adventure-tera-policy.mjs';
import {createMission10DoubleSnapshot,mission10MultiView,playMission10MultiTurn} from '../lib/cloud-adventure/adventure-mission10-double.mjs';
import {Battle} from '@pkmn/sim';
const mon=(id,boxId,type)=>({...makeMon(id,40),boxId,teraType:type,moves:['방어'],pp:{}});
test('adventure blocks new tera on both sides without changing shared battle or saved types',()=>{
 const battle=createCombat([mon(152,'player','Grass')],[mon(25,'foe','Water')]),before=structuredClone(battle);
 assert.ok(battle.requests[0].specials.some(x=>x.key==='terastallize'));
 assert.ok(!adventureCombatView(battle).requests[0].specials.some(x=>x.key==='terastallize'));assert.deepEqual(battle,before);
 assert.throws(()=>adventureValidateCombatCommand(battle,0,{type:'move',move:'방어',special:'terastallize'}),/메가진화만/);
 assert.throws(()=>adventurePlayCpu(battle,{type:'move',move:'방어',special:'terastallize'}),/메가진화만/);assert.deepEqual(battle,before);
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
 assert.throws(()=>playMission10MultiTurn(battle,{type:'move',move:'protect',special:'terastallize'}),/메가진화만/);
 const generic={requests:[{specials:[{key:'mega'},{key:'terastallize'}],actors:[{specials:[{key:'mega'},{key:'terastallize'}]}]}]};const filtered=adventureTeraSafeView(generic);assert.deepEqual(filtered.requests[0].specials,[{key:'mega'}]);assert.deepEqual(filtered.requests[0].actors[0].specials,[{key:'mega'}]);assert.equal(generic.requests[0].specials.length,2);
});
test('legacy generation snapshots reject new Dynamax and Z moves but continue an existing Dynamax',()=>{
 const base=createCombat([mon(25,'player','Electric')],[mon(133,'foe','Normal')]);
 for(const [format,item,special,move] of [['gen8customgame','','dynamax','protect'],['gen7customgame','electriumz','zmove','thunderbolt']]){
  const b=new Battle({formatid:format+'@@@!Team Preview',p1:{name:'플레이어',team:[{species:'Pikachu',ability:'Static',moves:['protect','thunderbolt'],item,trainerToken:'player'}]},p2:{name:'상대',team:[{species:'Eevee',ability:'Run Away',moves:['protect'],trainerToken:'foe'}]}});
  const saved=JSON.parse(JSON.stringify({...base,snapshot:b.toJSON()})),before=structuredClone(saved),command={type:'move',move,special};
  assert.throws(()=>adventurePlayCpu(saved,command),/메가진화만/);assert.deepEqual(saved,before);
  const legacy=playCpu(saved,command),restored=JSON.parse(JSON.stringify(legacy));
  if(special==='dynamax')assert.equal(restored.teams[0][0].dynamaxed,true);
  const next=adventurePlayCpu(restored,{type:'move',move:'protect'});assert.equal(next.teams[0][0].teraType,'Electric');if(special==='dynamax')assert.equal(next.teams[0][0].dynamaxed,true);
 }
 const view=adventureTeraSafeView({requests:[{specials:['mega','megax','megay','dynamax','zmove','ultra','terastallize'].map(key=>({key}))}]});
 assert.deepEqual(view.requests[0].specials.map(s=>s.key),['mega','megax','megay']);
 for(const special of ['dynamax','zmove','ultra','terastallize'])assert.throws(()=>playMission10MultiTurn(createMission10DoubleSnapshot([mon(152,'p','Grass')],[mon(4,'a','Fire')],[mon(25,'f','Water'),mon(133,'g','Normal')]),{type:'move',move:'protect',special}),/메가진화만/);
});
