import assert from 'node:assert/strict';
import {classicTrashBoss} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
let orbs=0,noOrbs=0;for(let seed=1;seed<=100;seed++){
 const run={id:'trash',wave:101,biome:1,rng:Math.imul(seed,0x9e3779b9)>>>0,party:[makeReferenceMon(150,100,{boxId:'ally',moves:['Splash']})],modifiers:[],tools:{},balls:{},encounter:{kind:'mystery'}};const mon=classicTrashBoss(run);
 assert.equal(mon.rogueSourceId,569);assert.equal(mon.rogueFormKey,'gigantamax');assert.equal(mon.rogueBattleSpecies,'garbodorgmax');assert.equal(mon.ability,'toxicdebris');assert.deepEqual(mon.types,['독','강철']);assert.equal(mon.shiny,false);assert.deepEqual(mon.moves,['Gunk Shot','Stomping Tantrum','Hammer Arm','Payback']);assert.ok(mon.rogueBossSegments>=3);assert.ok(mon.level<=100);
 const stats=mon.rogueFixedModifiers.filter(m=>m.id==='basestatbooster');assert.ok(stats.reduce((n,m)=>n+m.count,0)<=2);assert.ok(stats.every(m=>m.transferable===false&&m.count<=mon.ivs[m.stat]));const berries=mon.rogueFixedModifiers.filter(m=>m.id.startsWith('berry'));assert.ok(berries.reduce((n,m)=>n+m.count,0)>=1&&berries.reduce((n,m)=>n+m.count,0)<=4);assert.ok(mon.rogueFixedModifiers.find(m=>m.id==='soothebell').count<=2);assert.ok(mon.rogueFixedModifiers.find(m=>m.id==='luckyegg').count<=3);if(mon.item==='toxicorb')orbs++;else noOrbs++;
 if(seed===1){const combat=createClassicCombat(run,[mon]);const b=restoreClassicNativeBattle(JSON.parse(JSON.stringify(combat)),run);assert.equal(b.p2.pokemon[0].species.id,'garbodorgmax');assert.equal(b.p2.pokemon[0].ability,'toxicdebris');}
}assert.ok(orbs>0&&noOrbs>0);assert.throws(()=>classicTrashBoss({wave:99}));assert.throws(()=>classicTrashBoss({wave:181}));
console.log('Trash to Treasure: Gigantamax boss, fixed moves, generated items and battle restore passed');
