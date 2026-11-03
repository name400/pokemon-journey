import assert from 'node:assert/strict';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {classicEncounter,classicTrainerEncounter,classicRandomTrainerEligible,classicWorldReference} from '../lib/rogue-classic-world.mjs';
import {classicStoryEvent} from '../lib/rogue-classic-rules.mjs';
import {createClassicCombat,playClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {applyClassicAction} from '../lib/rogue-classic-game.mjs';
const base={id:'random-trainers',randomTrainerRule:'source-v1',trainerDoubleRule:'source-v1',encounterDoubleRule:'source-v2',capturePolicy:'source-v1',wave:42,biome:1,rng:42,seed:'trainer-seed',gymStart:20,party:[makeReferenceMon(151,100,{boxId:'hero',moves:['Surf']})],modifiers:[],tools:{},participants:[],awardedFoes:[],pendingMoves:[],screen:'battle',money:1000,balls:{masterball:1},rerolls:0};
let seeded;for(let i=0;i<2000;i++){const candidate={...base,seed:'trainer-'+i};if(classicRandomTrainerEligible(candidate)){seeded=candidate.seed;break;}}assert.ok(seeded);
// Source eligibility is deterministic and checks fixed trainers/gyms within
// two floors, prior candidate rolls, X0/X1, and a biome with no trainers.
for(const wave of [1,10,11,20,23,24,25,26,27,33,34,35,36,37,53,54,55,56,57,200]){const run={...base,seed:seeded,wave};assert.equal(classicRandomTrainerEligible(run),false,`wave ${wave}`);}
assert.equal(classicRandomTrainerEligible({...base,seed:seeded,biome:0}),false);assert.equal(classicRandomTrainerEligible({...base,seed:seeded,randomTrainerRule:undefined}),false);
for(let wave=12;wave<180;wave++){const run={...base,seed:seeded,wave};if(!classicRandomTrainerEligible(run))continue;assert.equal(classicStoryEvent(run).kind,'wild');assert.ok(wave%10>1);for(let w=Math.max(wave-2,Math.floor(wave/10)*10+2);w<=Math.min(wave+2,Math.floor(wave/10)*10+10);w++){if(w!==wave)assert.equal(classicStoryEvent(run,w).kind,'wild');}}
// Generate encounters across all biomes with a normal trainer pool. The
// selected type must belong to the biome's normal tier pools (or breeder).
for(const biome of Object.values(classicWorldReference.biomes)){if(!biome.trainerChance)continue;let seed;for(let i=0;i<2000;i++){const candidate={...base,biome:biome.biomeId,seed:'biome-'+i};if(classicRandomTrainerEligible(candidate)){seed=candidate.seed;break;}}assert.ok(seed,biome.enumName);const run={...base,biome:biome.biomeId,seed,rng:0x9e3779b9};const battle=classicEncounter(run);assert.equal(battle.kind,'trainer',biome.enumName);const ids=Object.entries(biome.trainerPool).filter(([tier])=>Number(tier)<=4).flatMap(([,pool])=>pool.flat(Infinity));assert.ok(ids.includes(battle.trainer.id)||battle.trainer.id===classicWorldReference.enums.TrainerType.BREEDER);assert.ok(battle.team.length>=(battle.doubles?2:1));}

// Search deterministic run RNG states until both ordinary doubles and the
// always-double Twins class appear; play a real 1v2 trainer turn afterwards.
let twins,ordinary;for(let i=1;i<1500&&(!twins||!ordinary);i++){const run={...structuredClone(base),seed:seeded,rng:Math.imul(i,0x9e3779b1)>>>0};const battle=classicEncounter(run);if(battle.doubles&&battle.trainer.id===58)twins={run,battle};if(battle.doubles&&battle.trainer.id!==58)ordinary={run,battle};}assert.ok(twins,'Twins is always double');assert.ok(ordinary,'eligible standard class can be double');
const oneTemplate={...structuredClone(base),trainerTemplates:{'42:5':'ONE_STRONG'}};assert.equal(classicTrainerEncounter(oneTemplate,5,{kind:'trainer'},{doubles:true}).team.length,2,'a one-member template is expanded for doubles');
for(const {run,battle} of [twins,ordinary]){run.encounter=battle;run.combat=createClassicCombat(run,battle.team,{trainer:true,doubles:true});assert.equal(run.combat.requests[0].actors.filter(a=>a.kind==='move').length,1);assert.equal(run.combat.requests[1].actors.filter(a=>a.kind==='move').length,2);const saved=JSON.parse(JSON.stringify(run));saved.combat=playClassicCombat(saved,{type:'turn',actions:[{actor:0,type:'move',move:'surf'}]});assert.ok(saved.combat.turn>=1);}
// The real game action connects the generated trainer to battle and prevents
// capturing or fleeing; a pre-existing run remains on the prior wave rules.
const doc={coins:12,collection:[{id:'keep'}]},state=ensureClassicState(doc),run=structuredClone(ordinary.run);run.wave=41;run.screen='advance';run.encounter={kind:'rival',trainer:{id:1}};run.combat=null;state.slots[0]=run;applyClassicAction(doc,{action:'next'});assert.equal(run.wave,42);assert.equal(run.encounter.kind,'trainer');assert.equal(run.screen,'battle');assert.throws(()=>applyClassicAction(doc,{action:'flee'}),/도망/);assert.throws(()=>applyClassicAction(doc,{action:'capture',ballId:'masterball'}),/트레이너/);assert.equal(run.balls.masterball,1);assert.deepEqual(doc.collection,[{id:'keep'}]);
console.log('Seeded normal trainer eligibility, biome pools, double-only and optional doubles passed.');
