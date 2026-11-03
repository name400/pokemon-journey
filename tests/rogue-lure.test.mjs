import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_REWARD_REGISTRY} from '../lib/rogue-classic-rewards.mjs';
import {classicLureWeight,grantClassicLure,lapseClassicLures,classicWildDoubleDivisor} from '../lib/rogue-lure.mjs';
import {classicEncounter} from '../lib/rogue-classic-world.mjs';
import {createClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';

const doc={coins:13,collection:[{id:'keep'}]},state=ensureClassicState(doc),hero=makeReferenceMon(151,30,{boxId:'hero',ability:'runaway',moves:['Seismic Toss']}),ally=makeReferenceMon(7,30,{boxId:'ally',moves:['Splash']});
const run={id:'lure',encounterDoubleRule:'source-v1',wave:6,biome:1,rng:42,party:[hero,ally],modifiers:[],tools:{},teraCharged:false,encounter:{kind:'wild'},screen:'reward',money:1000,balls:{pokeball:5},participants:[],awardedFoes:[],pendingMoves:[],rerolls:0};state.slots[0]=run;
const lure=CLASSIC_REWARD_REGISTRY.find(r=>r.id==='lure');run.rewards=[{...lure,rewardId:'lure-choice'}];applyClassicAction(doc,{action:'reward',rewardId:'lure-choice'});assert.equal(run.modifiers[0].remaining,10);assert.equal(classicWildDoubleDivisor(run),2);assert.match(classicGameView(doc).run.globalModifiers[0].description,/10회/);assert.equal(classicLureWeight(run,'lure',2),0);
const saved=JSON.parse(JSON.stringify(doc));assert.equal(ensureClassicState(saved).slots[0].modifiers[0].remaining,10);
// At least one fixed seed creates a real 2v2 encounter with the lure in force.
let seed=1;for(;seed<50;seed++){const candidate=structuredClone(run);candidate.wave=7;candidate.rng=seed;if(classicEncounter(candidate).doubles)break;}assert.ok(seed<50);run.rng=seed;applyClassicAction(doc,{action:'next'});assert.equal(run.wave,7);assert.equal(run.encounter.doubles,true);assert.equal(run.combat.teams[1].length,2);assert.equal(run.modifiers[0].remaining,10);
// Successful escape ends one battle and lapses once even across JSON restore.
applyClassicAction(doc,{action:'flee'});assert.equal(run.screen,'escaped');assert.equal(run.modifiers[0].remaining,9);const restored=ensureClassicState(JSON.parse(JSON.stringify(doc))).slots[0];lapseClassicLures(restored);assert.equal(restored.modifiers[0].remaining,9);
// Defeating a trainer or wild Pokémon also lapses; applying it after the
// preceding battle's end does not consume a turn immediately.
run.wave=8;run.screen='battle';run.encounter={kind:'wild'};const foe=makeReferenceMon(19,1,{boxId:'foe',moves:['Splash']});foe.hp=1;run.combat=createClassicCombat(run,[foe]);applyClassicAction(doc,{action:'turn',command:{type:'move',move:'seismictoss'}});assert.equal(run.modifiers[0].remaining,8);
run.wave=9;run.screen='battle';run.encounter={kind:'wild'};run.balls.masterball=1;run.combat=createClassicCombat(run,[makeReferenceMon(10,1,{boxId:'catch-foe',moves:['Splash']})]);applyClassicAction(doc,{action:'capture',ballId:'masterball'});assert.equal(run.modifiers[0].remaining,7);
run.modifiers[0].remaining=6;assert.equal(classicLureWeight(run,'lure',2),0);run.modifiers[0].remaining=5;assert.equal(classicLureWeight(run,'lure',2),2);grantClassicLure(run,'lure');assert.equal(run.modifiers[0].remaining,10);grantClassicLure(run,'superlure');assert.equal(classicWildDoubleDivisor(run),1);assert.equal(run.modifiers.find(m=>m.id==='superlure').remaining,15);run.wave=199;assert.equal(classicLureWeight(run,'maxlure',4),0);
for(let wave=200;wave<210;wave++){run.wave=wave;lapseClassicLures(run);}assert.ok(!run.modifiers.some(m=>m.id==='lure'));assert.equal(run.modifiers.find(m=>m.id==='superlure').remaining,5);
const legacy={modifiers:[]};assert.equal(classicWildDoubleDivisor(legacy),32);grantClassicLure(legacy,'maxlure');assert.equal(classicWildDoubleDivisor(legacy),2);assert.equal(doc.coins>=13,true);assert.deepEqual(doc.collection,[{id:'keep'}]);
console.log('Lure acquisition, source chance, refresh, stacking, save, escape and victory lapse passed.');
