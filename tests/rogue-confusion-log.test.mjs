import test from 'node:test';import assert from 'node:assert/strict';import {Battle} from '@pkmn/sim';
import {battleLines} from '../lib/full-battle.mjs';import {makeReferenceMon} from '../lib/rogue-reference.mjs';import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
test('confusion start, ongoing and end use volatile names while the Confusion move keeps its name',()=>{
 const b=new Battle({formatid:'gen9customgame',seed:[1,2,3,4],p1:{name:'one',team:[{species:'Pikachu',moves:['Confusion']}]},p2:{name:'two',team:[{species:'Zubat',moves:['Supersonic']}]}}),p=b.p1.pokemon[0],start=b.log.length;
 b.add('-start',p,'confusion');b.add('-activate',p,'confusion');b.add('-end',p,'confusion');b.add('move',p,'Confusion',b.p2.pokemon[0]);b.add('-start',p,'move: Confusion');
 for(const classicStyle of [true,false]){const lines=battleLines(b,start,{classicStyle});assert.match(lines[0],/혼란에 빠졌다/);assert.match(lines[1],/혼란에 빠져 있다/);assert.match(lines[2],/혼란이 풀렸다/);assert.match(lines[3],/염동력/);assert.match(lines[4],/염동력 효과/);assert.ok(!p.volatiles.confusion);}
});
test('actual Supersonic battle and saved confusion display the effect correctly',()=>{
 let found=false;
 for(let seed=1;seed<=12&&!found;seed++){const run={id:'confusion',seed:'confusion',rng:seed*97,wave:21,biome:1,party:[makeReferenceMon(143,50,{boxId:'hero',moves:['Splash'],ability:'pressure'})],modifiers:[],tools:{},encounter:{kind:'wild'}};run.combat=createClassicCombat(run,[makeReferenceMon(41,50,{boxId:'foe',moves:['Supersonic'],ability:'innerfocus'})]);run.combat=playClassicCombat(run,{type:'move',move:'splash'});if(!run.combat.log.some(l=>l.includes('혼란에 빠졌다')))continue;found=true;const b=restoreClassicNativeBattle(JSON.parse(JSON.stringify(run.combat)),run);assert.ok(b.p1.active[0].volatiles.confusion);run.combat=playClassicCombat(run,{type:'move',move:'splash'});assert.ok(run.combat.log.some(l=>/혼란에 빠져 있다|혼란이 풀렸다/.test(l)));assert.ok(!run.combat.log.some(l=>l.includes('염동력 효과')));}
 assert.ok(found,'a seeded Supersonic must connect');
});
