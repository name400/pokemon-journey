import test from 'node:test';
import assert from 'node:assert/strict';
import world from '../data/rogue-world-reference.json' with {type:'json'};
import names from '../data/rogue-trainers-common-ko-pinned.json' with {type:'json'};
import {classicTrainerPersonalIdentity} from '../lib/rogue-trainer-personal-names.mjs';
import {classicTrainerEncounter} from '../lib/rogue-classic-world.mjs';
import {classicTrainerDialogue} from '../lib/rogue-trainer-dialogue.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {classicGameView} from '../lib/rogue-classic-game.mjs';
const rule={trainerIdentityRule:'source-v1'};
test('ordinary trainer names are exact gender-specific source entries with stable locale keys',()=>{
 for(const [variant,gender]of [[0,'male'],[1,'female']]){
  let calls=0;const result=classicTrainerPersonalIdentity(rule,world.trainerConfigs[1],variant,false,()=>{calls++;return 0;});
  assert.equal(result.name,names.aceTrainer[gender]['1']);assert.equal(result.nameKey,`trainersCommon:aceTrainer.${gender}.1`);assert.equal(calls,1);
 }
});
test('ordinary duos draw each partner once; double-only pairs split one original pair entry',()=>{
 let calls=0;const rng=()=>{calls++;return 0;};
 const duo=classicTrainerPersonalIdentity(rule,world.trainerConfigs[1],2,true,rng);
 assert.equal(duo.name,`${names.aceTrainer.male['1']} & ${names.aceTrainer.female['1']}`);assert.equal(duo.partnerNameKey,'trainersCommon:aceTrainer.female.1');assert.equal(calls,2);
 calls=0;const pair=classicTrainerPersonalIdentity(rule,world.trainerConfigs[4],2,true,rng);
 assert.equal(pair.name,names.backers.male['1']);assert.equal(pair.partnerName,names.backers.male['1'].split(' & ')[1]);assert.equal(calls,1);
});
test('named leaders and legacy rules do not invent personal names or consume an extra roll',()=>{
 const unexpected=()=>{throw Error('Unexpected identity RNG');};
 assert.equal(classicTrainerPersonalIdentity(rule,world.trainerConfigs[200],0,false,unexpected),null);
 assert.equal(classicTrainerPersonalIdentity({},world.trainerConfigs[1],0,false,unexpected),null);
});
function fixture(seed){return {id:'personal-names',seed:'names',rng:seed,wave:42,biome:1,screen:'battle',trainerVariantRule:'source-v1',trainerIdentityRule:'source-v1',npcDialogueRule:'source-v1',party:[makeReferenceMon(151,50,{boxId:'hero'})],modifiers:[],tools:{},balls:{pokeball:5},money:1000};}
test('real female trainer identity reaches dialogue and survives JSON/game view without rerolling',()=>{
 let found=false;
 for(let seed=1;seed<=100&&!found;seed++){
  const run=fixture(seed*9973),encounter=classicTrainerEncounter(run,1,{kind:'trainer'});if(encounter.trainer.variant!==1)continue;found=true;
  assert.match(encounter.trainer.nameKey,/^trainersCommon:aceTrainer\.female\./);assert.equal(encounter.trainer.name,encounter.trainer.className+' '+encounter.trainer.personalName);
  const line=classicTrainerDialogue(encounter,'intro',{seed:run.seed,wave:run.wave});assert.equal(line.speaker,encounter.trainer.name);
  run.encounter=encounter;run.combat=createClassicCombat(run,encounter.team,{trainer:true,doubles:encounter.doubles});run.party=run.combat.teams[0];const doc={},state=ensureClassicState(doc);state.slots[0]=run;
  const before=run.rng,copy=JSON.parse(JSON.stringify(doc)),view=classicGameView(copy);assert.equal(copy.classic.slots[0].rng,before);assert.equal(view.run.encounter.trainer.personalName,encounter.trainer.personalName);assert.equal(view.run.encounter.trainer.nameKey,encounter.trainer.nameKey);
 }
 assert.ok(found);
});
test('the fixed first trainer gets a source male name, while legacy fixed encounters remain unchanged',()=>{
 const run=fixture(42),fresh=classicTrainerEncounter(run,63,{kind:'youngster'});assert.match(fresh.trainer.nameKey,/^trainersCommon:youngster\.male\./);assert.equal(fresh.trainer.variant,undefined);
 const legacy=fixture(42);delete legacy.trainerIdentityRule;assert.equal(classicTrainerEncounter(legacy,63,{kind:'youngster'}).trainer.name,'반바지 꼬마');
});
