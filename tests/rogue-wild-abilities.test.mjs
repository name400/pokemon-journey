import test from 'node:test';
import assert from 'node:assert/strict';
import {classicWildAbility} from '../lib/rogue-wild-abilities.mjs';
import {classicTrainerAbility} from '../lib/rogue-trainer-traits.mjs';
import {classicEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_REWARD_REGISTRY,generateClassicRewardsWithTiers,addClassicModifier} from '../lib/rogue-classic-rewards.mjs';
const abilities=[{slot:'primary',key:'first'},{slot:'secondary',key:'second'},{slot:'hidden',key:'hidden'}];
test('Ability Charms use the source denominators and keep independent regular/hidden RNG draws',()=>{
 for(const [count,denominator] of [[0,256],[1,64],[2,32],[3,16],[4,8]]){
  for(const [roll,expected] of [[0,'hidden'],[1/denominator,'second']]){
   const values=[.75,roll];assert.equal(classicWildAbility(abilities,count,()=>{assert.ok(values.length);return values.shift();}).key,expected);assert.equal(values.length,0);
  }
 }
 assert.equal(classicWildAbility([abilities[0]],4,()=>{throw Error('Single normal ability must not consume RNG');}).key,'first');
});
test('Spewpa’s duplicated Shed Skin slot does not consume an extra roll or select a fake secondary',()=>{
 const entries=[{slot:'primary',key:'shedskin'},{slot:'secondary',key:'shedskin'},{slot:'hidden',key:'friendguard'}];
 for(const roll of [0,.9])for(const kind of ['wild','trainer']){
  let calls=0;const random=()=>{calls++;return roll;};const chosen=kind==='wild'?classicWildAbility(entries,0,random):classicTrainerAbility(entries,random);
  assert.equal(chosen.slot,roll===0?'hidden':'primary');assert.equal(calls,1);
 }
});
function fixture(seed=42){return {id:'ability-wild',wave:1,biome:0,biomeStep:1,rng:seed,wildAbilityRule:'source-v1',party:[makeReferenceMon(151,30,{boxId:'hero',moves:['Splash']})],modifiers:[],tools:{},balls:{},money:1000};}
test('actual wild generation changes abilities without changing species, IVs, nature, shiny or RNG cursor',()=>{
 let improvements=0;
 for(let seed=1;seed<=200;seed++){
  const plain=fixture(seed),boosted=structuredClone(plain);boosted.modifiers=[{id:'abilitycharm',count:4,boxId:null}];
  const a=classicEncounter(plain),b=classicEncounter(boosted);assert.equal(a.kind,'wild');assert.equal(a.doubles,b.doubles);assert.equal(plain.rng,boosted.rng);
  for(let i=0;i<a.team.length;i++){
   for(const key of ['id','ivs','nature','shiny','moves'])assert.deepEqual(a.team[i][key],b.team[i][key]);
   if(a.team[i].rogueAbilitySlot!=='hidden'&&b.team[i].rogueAbilitySlot==='hidden')improvements++;
  }
 }
 assert.ok(improvements>0);
});
test('charm is an actual capped Rogue-tier reward, omitted after wave189 and from legacy runs',()=>{
 const def=CLASSIC_REWARD_REGISTRY.find(d=>d.id==='abilitycharm');assert.equal(def.tier,3);assert.equal(def.max,4);
 let offered=false;const run=fixture();run.wave=100;
 for(let i=0;i<100;i++)if(generateClassicRewardsWithTiers(run,[3]).some(r=>r.id==='abilitycharm'))offered=true;assert.ok(offered);
 addClassicModifier(run,'abilitycharm',{count:4});assert.throws(()=>addClassicModifier(run,'abilitycharm'),/한도/);
 for(const mode of ['capped','late','legacy']){
  const candidate=fixture();candidate.wave=mode==='late'?190:100;if(mode==='capped')candidate.modifiers=[{id:'abilitycharm',count:4,boxId:null}];if(mode==='legacy')delete candidate.wildAbilityRule;
  for(let i=0;i<100;i++)assert.ok(generateClassicRewardsWithTiers(candidate,[3]).every(r=>r.id!=='abilitycharm'),mode);
 }
});
