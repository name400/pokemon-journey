import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,playClassicCombat,classicCombatView} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
await mkdir('.sites-runtime/tests',{recursive:true});await build({entryPoints:['hooks/use-battle-playback.ts'],outfile:'.sites-runtime/tests/dynamax-hp-playback.mjs',bundle:true,format:'esm',platform:'node',external:['react']});
const {battleDisplay,applyBattleEvent}=await import('../.sites-runtime/tests/dynamax-hp-playback.mjs');
const mon=(id,boxId,moves=['Splash'])=>makeReferenceMon(id,100,{boxId,moves});
function make(half=false){const hero=mon(6,'hero',['Splash','Recover']);if(half)hero.hp=Math.floor(hero.maxHp/2);const run={id:'dynamax-hp',wave:1,biome:0,rng:42,party:[hero],tools:{dynamaxBand:true},modifiers:[],encounter:{kind:'wild'}};run.combat=createClassicCombat(run,[mon(143,'foe')]);run.party=run.combat.teams[0];return run;}
test('Dynamax entry and expiration update visible HP without claiming a heal',async()=>{
 for(const half of [false,true]){let run=make(half);for(let turn=0;turn<3;turn++){run.party=run.combat.teams[0];run.combat=playClassicCombat(run,{type:'move',move:'splash',...(turn===0?{special:'dynamax'}:{})});if(turn===0||turn===2){const view=classicCombatView(run.combat),resize=view.events.find(e=>e.kind==='effect'&&e.boxId==='hero'&&Number.isFinite(e.hp));assert.ok(resize);assert.equal(resize.text,'');assert.equal(resize.silent,true);assert.equal(view.log.some(line=>line.includes('HP가 회복')),false);let display=battleDisplay(view,true,true);for(const event of view.events)display=applyBattleEvent(display,event);assert.equal(display.teams[0][0].hp,view.teams[0][0].hp);assert.equal(display.teams[0][0].maxHp,view.teams[0][0].maxHp);}const saved=await decodeGameData(await encodeGameData({run,other:{keep:true}}));assert.deepEqual(saved.other,{keep:true});run=saved.run;}}
});
test('a real healing move still emits and displays a heal',()=>{const run=make(true);run.combat=playClassicCombat(run,{type:'move',move:'recover'});const view=classicCombatView(run.combat),heal=view.events.find(e=>e.kind==='heal'&&e.boxId==='hero');assert.ok(heal);assert.ok(heal.amount>0);assert.match(heal.text,/회복/);assert.ok(view.log.some(line=>line.includes('HP가 회복')));});
