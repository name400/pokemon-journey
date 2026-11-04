import test from 'node:test';
import assert from 'node:assert/strict';
import world from '../data/rogue-world-reference.json' with {type:'json'};
import images from '../data/rogue-trainer-appearance.json' with {type:'json'};
import {classicTrainerVariant,classicTrainerPresentation} from '../lib/rogue-trainer-variants.mjs';
import {classicTrainerEncounter} from '../lib/rogue-classic-world.mjs';
import {classicTrainerDialogue} from '../lib/rogue-trainer-dialogue.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
test('source gender roll is independent of gender availability and is skipped for doubles, fixed and legacy battles',()=>{
 const run={trainerVariantRule:'source-v1'};let calls=0;const random=()=>{calls++;return .75;};
 assert.equal(classicTrainerVariant(run,false,'trainer',random),1);assert.equal(calls,1);
 assert.equal(classicTrainerVariant(run,true,'trainer',random),2);assert.equal(classicTrainerVariant(run,false,'youngster',random),undefined);assert.equal(classicTrainerVariant({},false,'trainer',random),undefined);assert.equal(calls,1);
 assert.equal(classicTrainerVariant(run,false,'trainer',()=>.1),0);
});
test('source female class identity, verified portrait and dialogue agree',()=>{
 const p=classicTrainerPresentation(world.trainerConfigs[63],{variant:1,defaultLabel:'반바지 꼬마',sourceKey:'youngster',appearance:images.byEnumName.YOUNGSTER});
 assert.equal(p.label,'짧은 치마');assert.equal(p.gender,'F');assert.equal(p.portrait.src,'/game/trainers/lass.png');
 const ace=classicTrainerPresentation(world.trainerConfigs[1],{variant:1,defaultLabel:'엘리트 트레이너',sourceKey:'aceTrainer',appearance:images.byEnumName.ACE_TRAINER});
 assert.equal(ace.portrait.src,'/game/trainers/acetrainerf.png');
 const missing=structuredClone(images.byEnumName.ACE_TRAINER);missing.variants.female=null;
 const fallback=classicTrainerPresentation(world.trainerConfigs[1],{variant:1,defaultLabel:'엘리트 트레이너',sourceKey:'aceTrainer',appearance:missing});
 assert.equal(fallback.portrait.src,'/game/trainers/fallback.svg');assert.equal(fallback.portraitVariantMissing,true);
});
function fixture(seed=42){return {id:'trainer-variant',seed:'gender',rng:seed,wave:12,biome:1,trainerVariantRule:'source-v1',party:[makeReferenceMon(151,30,{boxId:'hero'})],modifiers:[],tools:{}};}
test('real random trainer generation persists female identity and uses its source dialogue without rerolling',()=>{
 let found=false;
 for(let seed=1;seed<=100&&!found;seed++){
  const run=fixture(seed*9973),encounter=classicTrainerEncounter(run,63,{kind:'trainer'});if(encounter.trainer.variant!==1)continue;found=true;
  assert.equal(encounter.trainer.name,'짧은 치마');assert.equal(encounter.trainer.gender,'F');assert.equal(encounter.trainer.sprite,'/game/trainers/lass.png');
  const before=run.rng,saved=JSON.parse(JSON.stringify(encounter)),a=classicTrainerDialogue(encounter,'intro',{seed:run.seed,wave:run.wave}),b=classicTrainerDialogue(saved,'intro',{seed:run.seed,wave:run.wave});
  assert.ok(a.sourceKey.startsWith('lass.encounter'));assert.deepEqual(a,b);assert.equal(run.rng,before);
 }
 assert.ok(found);
});
test('legacy and fixed first-trainer encounters keep their default identity',()=>{
 const run=fixture();delete run.trainerVariantRule;
 const old=classicTrainerEncounter(run,63,{kind:'youngster'}),fixed=classicTrainerEncounter(fixture(),63,{kind:'youngster'});
 for(const encounter of [old,fixed]){assert.equal(encounter.trainer.variant,undefined);assert.equal(encounter.trainer.name,'반바지 꼬마');assert.equal(encounter.trainer.sprite,'/game/trainers/youngster.png');}
});
