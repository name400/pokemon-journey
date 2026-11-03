import assert from 'node:assert/strict';
import {classicDynamaxCannonMultiplier,classicLevelCap} from '../lib/rogue-classic-rules.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
const wave=20,cap=classicLevelCap(wave);assert.equal(classicDynamaxCannonMultiplier(wave,cap),1);assert.ok(classicDynamaxCannonMultiplier(wave,cap+1)>1);assert.equal(classicDynamaxCannonMultiplier(wave,cap+10),2);assert.equal(classicDynamaxCannonMultiplier(200,100),1);
for(const [level,expected] of [[cap,100],[cap+10,200]]){
 const hero=makeReferenceMon(151,level,{boxId:'hero',moves:['Splash']}),foe=makeReferenceMon(890,50,{boxId:'foe',moves:['Dynamax Cannon']});
 const run={id:'cannon-test',wave,biome:0,rng:42,party:[hero],modifiers:[],tools:{},encounter:{kind:'wild'},teraCharged:false};run.combat=createClassicCombat(run,[foe]);
 const battle=restoreClassicNativeBattle(run.combat,run),move=battle.dex.moves.get('dynamaxcannon');
 assert.equal(battle.runEvent('BasePower',battle.p2.active[0],battle.p1.active[0],move,100),expected);
 const restored=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)));assert.equal(restored.runEvent('BasePower',restored.p2.active[0],restored.p1.active[0],restored.dex.moves.get('dynamaxcannon'),100),expected);
}
