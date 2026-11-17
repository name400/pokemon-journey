import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,classicCombatView,restoreClassicNativeBattle,snapshotClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

const mon=(id,boxId,moves=['Splash'])=>makeReferenceMon(id,100,{boxId,moves});
for(const doubles of [false,true]) test(`Haze playback targets current combatants after a ${doubles?'double':'single'} switch and survives restore`,async()=>{
 const party=[mon(151,'outgoing'),...(doubles?[mon(1,'ally')]:[]),mon(7,'incoming')],foes=[mon(143,'foe',['Haze']),...(doubles?[mon(242,'foe2')]:[])];
 const run={id:'haze-switch',wave:1,biome:0,rng:42,party,tools:{},modifiers:[],encounter:{kind:'wild'}};
 run.combat=createClassicCombat(run,foes,{doubles});run.party=run.combat.teams[0];
 const battle=restoreClassicNativeBattle(run.combat,run);battle.p1.active[0].boosts.atk=3;battle.p2.active[0].boosts.def=2;if(doubles)battle.p1.active[1].boosts.spe=1;
 run.combat.snapshot=snapshotClassicNativeBattle(battle);for(let side=0;side<2;side++)for(const p of battle.sides[side].active)run.combat.teams[side].find(m=>m.boxId===p.set.trainerToken).boosts={...p.boosts};
 const cmd=doubles?{type:'turn',actions:[{actor:0,type:'switch',slot:3},{actor:1,type:'move',move:'splash'}]}:{type:'switch',slot:2};
 run.combat=playClassicCombat(run,cmd);const view=classicCombatView(run.combat),effects=view.events.filter(e=>e.kind==='effect'&&e.pokemon?.boosts),ids=effects.map(e=>e.boxId);
 assert.ok(view.events.some(e=>e.kind==='move'&&e.moveId==='haze'));assert.ok(!ids.includes('outgoing'),'A benched Pokémon must not receive a Haze event');assert.ok(ids.includes('foe'));if(doubles)assert.ok(ids.includes('ally'));
 for(const event of effects)assert.ok(Object.values(event.pokemon.boosts).every(n=>n===0));
 const restored=await decodeGameData(await encodeGameData({run,other:{keep:true}}));assert.deepEqual(restored.other,{keep:true});assert.deepEqual(restored.run.combat.events,JSON.parse(JSON.stringify(run.combat.events)));assert.deepEqual(restored.run.combat.teams,JSON.parse(JSON.stringify(run.combat.teams)));
});

test('legacy combat without activeBySide still displays Haze for its active Pokémon',()=>{
 const run={id:'haze-legacy',wave:1,biome:0,rng:42,party:[mon(151,'hero')],tools:{},modifiers:[],encounter:{kind:'wild'}};
 run.combat=createClassicCombat(run,[mon(143,'foe',['Haze'])]);run.party=run.combat.teams[0];const battle=restoreClassicNativeBattle(run.combat,run);battle.p1.active[0].boosts.atk=2;run.combat.snapshot=snapshotClassicNativeBattle(battle);run.combat.teams[0][0].boosts={...battle.p1.active[0].boosts};delete run.combat.activeBySide;
 run.combat=playClassicCombat(run,{type:'move',move:'splash'});const effect=classicCombatView(run.combat).events.find(e=>e.kind==='effect'&&e.boxId==='hero'&&e.pokemon?.boosts);assert.ok(effect);assert.equal(effect.pokemon.boosts.atk,0);
});
