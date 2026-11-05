import test from 'node:test';
import assert from 'node:assert/strict';
import {Dex} from '@pkmn/sim';
import {configure,calculateStats} from '../lib/pokemon-config.mjs';
import {makeReferenceMon,sourceSpeciesFor} from '../lib/rogue-reference.mjs';
import {classicNativeForm} from '../lib/rogue-native-form.mjs';
import {classicFormOptions,applyClassicForm} from '../lib/rogue-transformations.mjs';
import {validatedClassicDnaFusion} from '../lib/rogue-dna-fusion.mjs';
import {stageClassicDnaFusion} from '../lib/rogue-dna-fusion-stage.mjs';
import {classicChallengeBattleEligibility} from '../lib/rogue-challenge-eligibility.mjs';
import {CLASSIC_REWARD_REGISTRY} from '../lib/rogue-classic-rewards.mjs';
import {applyClassicAction,classicGameView} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {createClassicCombat,playClassicCombat,restoreClassicNativeBattle} from '../lib/rogue-battle-engine.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';
import {fixture} from './fixtures/dna-persistent.mjs';

// Eight source forms; Meowstic has two native appearances and reverse targets.
const cases=[
 [359,'','mega-z','absolmegaz','absolitez'],
 [445,'','mega-z','garchompmegaz','garchompitez'],
 [448,'','mega-z','lucariomegaz','lucarionitez'],
 [678,'male','mega','meowsticmmega','meowsticite','M'],
 [678,'female','mega','meowsticfmega','meowsticite','F'],
 [801,'original','mega-original','magearnaoriginalmega','magearnite'],
 [978,'curly','mega-curly','tatsugiricurlymega','tatsugirinite'],
 [978,'droopy','mega-droopy','tatsugiridroopymega','tatsugirinite'],
 [978,'stretchy','mega-stretchy','tatsugiristretchymega','tatsugirinite'],
];
const typeNames=['노말','격투','비행','독','땅','바위','벌레','고스트','강철','불꽃','물','풀','전기','에스퍼','얼음','드래곤','악','페어리'];
function original(row,boxId){
 const [id,pre,,,,gender]=row,s=sourceSpeciesFor({rogueSourceId:id}),f=s.formList.find(f=>f.formKey===pre);
 const mon=makeReferenceMon(id,50,{boxId,moves:['Splash'],...(gender?{gender}:{})}),native=classicNativeForm(s,f,mon);
 return configure({...mon,id:f.pokemonId||s.pokemonId,rogueFormIndex:f.formIndex,rogueFormKey:f.formKey,rogueBattleSpecies:native.id,rogueBaseStats:{...f.baseStats},rogueTypes:[...f.types],types:[...f.types],type:f.types[0],ability:f.abilities.find(a=>a.slot==='hidden')?.key||f.abilities[0].key,rogueAbilitySlot:f.abilities.some(a=>a.slot==='hidden')?'hidden':'primary'});
}
function prepared(row,role='primary'){
 const mon=original(row,role),other=makeReferenceMon(151,50,{boxId:role==='primary'?'donor':'primary',moves:['Splash']}),out=fixture(role==='primary'?[mon,other]:[other,mon]);
 out.run.tools={megaBracelet:true,dynamaxBand:true,teraOrb:true,zRing:true};out.run.teraCharged=true;out.run.formItems[role]=[row[4]];
 return out;
}
test('eight source Mega forms and both Meowstic sexes keep rewards, codec, battle, reverse and consumed donor rules',async()=>{
 for(const row of cases)for(const role of ['primary','donor']){try{
  let {doc,state,run}=prepared(row,role),index=role==='primary'?0:1;const pre=structuredClone(run.party[index]),raw=Dex.species.get(row[3]);assert.equal(!!raw.isMega,false);
  assert.ok(classicGameView(doc).run.party[index].forms.some(f=>f.key===row[4]));
  applyClassicAction(doc,{action:'form',boxId:role,item:row[4]});const changed=run.party[index];assert.equal(changed.rogueFormKey,row[2]);assert.equal(changed.rogueBattleSpecies,row[3]);assert.equal(changed.mega,true);
  const source=sourceSpeciesFor(changed),form=source.formList.find(f=>f.formKey===row[2]);assert.deepEqual(changed.rogueBaseStats,form.baseStats);assert.ok(form.abilities.some(a=>a.key===changed.ability));
  assert.equal(classicChallengeBattleEligibility(changed,[{id:1,value:typeNames.indexOf(form.types[0])+1}]),true);
  run.rewards=[{...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='dnasplicers'),rewardId:'dna'}];assert.ok(classicGameView(doc).run.rewards[0].fusionPairs.some(p=>p.primaryBoxId==='primary'&&p.donorBoxId==='donor'));
  const originalPrimary=structuredClone(run.party[0]),donor=structuredClone(run.party[1]);applyClassicAction(doc,{action:'reward',rewardId:'dna',boxId:'primary',donorBoxId:'donor',confirmFusion:true});assert.equal(run.party.length,1);assert.deepEqual(run.party[0].rogueFusion.donor,donor);assert.ok(validatedClassicDnaFusion(run.party[0]));
  doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];assert.deepEqual(run.formItems.primary,[row[4]]);assert.equal(run.formItems.donor,undefined);
  run.combat=createClassicCombat(run,[makeReferenceMon(143,50,{boxId:'foe',moves:['Splash']})]);let b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[0].maxhp,calculateStats(run.party[0]).hp);assert.equal(b.p1.active[0].baseAbility,donor.ability);
  if(role==='primary'){assert.equal(b.p1.active[0].species.isMega,true);assert.equal(b.p1.active[0].species.id,row[3]);assert.deepEqual(run.combat.requests[0].actors[0].specials,[]);}
  run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];assert.ok(validatedClassicDnaFusion(run.party[0]));assert.equal(!!run.party[0].mega,role==='primary');
  doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];b=restoreClassicNativeBattle(run.combat,run);assert.equal(!!b.p1.active[0].species.isMega,role==='primary');
  run.screen='reward';applyClassicAction(doc,{action:'unsplice',boxId:'primary',confirm:true});assert.equal(run.party.length,1);assert.equal(run.party[0].ability,originalPrimary.ability);assert.equal(run.party[0].fusionSpecies,undefined);
  if(role==='primary'){const reverses=classicFormOptions(run.party[0],run).filter(o=>o.reverse);assert.equal(reverses.length,1);assert.equal(reverses[0].formKey,row[1]);applyClassicAction(doc,{action:'form',boxId:'primary',item:reverses[0].key});assert.equal(run.party[0].rogueFormKey,row[1]);assert.equal(run.party[0].ability,pre.ability);assert.equal(run.party[0].mega,false);assert.equal(run.party[0].gender,pre.gender);}
  assert.equal(!!raw.isMega,false,'shared native Dex must remain unchanged');assert.deepEqual(state.slots[1],{id:'other'});assert.deepEqual(doc.adventure,{safe:true});assert.equal(doc.coins,37);
 }catch(cause){throw new Error(`${row[3]}:${role}`,{cause});}}
});

test('all new aliases also transform and reverse while already fused, preserving donor ability and source stats',async()=>{
 for(const row of cases){let {doc,state,run}=prepared(row);const ability=run.party[1].ability;run=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;state.slots[0]=run;
  applyClassicAction(doc,{action:'form',boxId:'primary',item:row[4]});assert.ok(validatedClassicDnaFusion(run.party[0]));assert.equal(run.party[0].rogueBattleSpecies,row[3]);assert.equal(run.party[0].ability,ability);
  doc=await decodeGameData(await encodeGameData(doc));run=ensureClassicState(doc).slots[0];const option=classicFormOptions(run.party[0],run).find(o=>o.reverse);assert.equal(option.formKey,row[1]);applyClassicAction(doc,{action:'form',boxId:'primary',item:option.key});assert.ok(validatedClassicDnaFusion(run.party[0]));assert.equal(run.party[0].rogueFormKey,row[1]);assert.equal(run.party[0].ability,ability);assert.deepEqual(run.formItems.primary,[row[4]]);
 }
});

test('missing or contradictory Meowstic gender, wrong native identity and mismatched source metadata stay rejected',()=>{
 for(const gender of ['N',undefined]){const {run}=prepared(cases[4]);run.party[0].gender=gender;assert.deepEqual(classicFormOptions(run.party[0],run),[]);const s=sourceSpeciesFor(run.party[0]);assert.equal(classicNativeForm(s,s.formList.find(f=>f.formKey==='mega'),run.party[0]),null);}
 for(const mutate of [p=>p.gender='M',p=>p.rogueBattleSpecies='meowsticmmega',p=>p.rogueBaseStats.spa++,p=>p.mega=false]){const {run}=prepared(cases[4]);run.party[0]=applyClassicForm(run.party[0],run,'meowsticite');mutate(run.party[0]);const before=structuredClone(run);assert.throws(()=>stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}));assert.deepEqual(run,before);}
 const source=sourceSpeciesFor({rogueSourceId:359}),form=source.formList.find(f=>f.formKey==='mega-z');assert.equal(classicNativeForm(source,{...form,baseStats:{...form.baseStats,atk:1}}),null);
 // Older standalone Mega-Z saves could lack the simulator-derived Mega flag;
 // a female Meowstic could also carry the old male native alias. Preserve that
 // save until the player explicitly reverses and reapplies the owned item.
 for(const row of [cases[0],cases[1],cases[2],cases[4]]){const {run}=prepared(row);run.party[0]=applyClassicForm(run.party[0],run,row[4]);run.party[0].mega=false;if(row[0]===678)run.party[0].rogueBattleSpecies='meowsticmmega';const before=structuredClone(run);assert.throws(()=>stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}));assert.deepEqual(run,before);if(row[0]===678){run.challenges=[{id:1,value:14}];run.challengeEligibilityRule='source-subset-v1';run.combat=createClassicCombat(run,[makeReferenceMon(143,50,{boxId:'legacy-foe',moves:['Splash']})]);for(let turn=0;turn<2;turn++){run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];assert.equal(run.party[0].mega,false);assert.equal(classicChallengeBattleEligibility(run.party[0],run.challenges),true);}}const reverse=classicFormOptions(run.party[0],run).find(o=>o.reverse);assert.equal(reverse.formKey,row[1]);run.party[0]=applyClassicForm(run.party[0],run,reverse.key);run.party[0]=applyClassicForm(run.party[0],run,row[4]);assert.equal(run.party[0].rogueBattleSpecies,row[3]);assert.equal(run.party[0].mega,true);assert.equal(run.party[0].gender,before.party[0].gender);assert.ok(stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run.party[0].rogueFusion);}
});

test('standalone alias Megas preserve classification and pinned ability through native turns and restore',async()=>{
 for(const row of cases){let {doc,state,run}=prepared(row);applyClassicAction(doc,{action:'form',boxId:'primary',item:row[4]});const ability=run.party[0].ability;
  run.combat=createClassicCombat(run,[makeReferenceMon(143,50,{boxId:'foe',moves:['Splash']})]);let b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[0].baseAbility,ability);assert.equal(b.p1.active[0].species.isMega,true);assert.deepEqual(run.combat.requests[0].actors[0].specials,[]);
  run.combat=playClassicCombat(run,{type:'move',move:'splash'});run.party=run.combat.teams[0];assert.equal(run.party[0].mega,true);doc=await decodeGameData(await encodeGameData(doc));state=ensureClassicState(doc);run=state.slots[0];b=restoreClassicNativeBattle(run.combat,run);assert.equal(b.p1.active[0].species.isMega,true);assert.equal(b.p1.active[0].baseAbility,ability);
 }
});

test('new source Mega abilities retain Levitate immunity, Aura Guard contact reduction and Sharpness damage',()=>{
 function battle(row,{ability,attack,enemyMove='Tackle'}={}){
  const {run}=prepared(row);run.party=[applyClassicForm(run.party[0],run,row[4])];if(ability)run.party[0].ability=ability;if(attack)run.party[0].moves=[attack];
  run.combat=createClassicCombat(run,[makeReferenceMon(151,50,{boxId:'foe',moves:[enemyMove]})]);const before=run.combat.teams.map(t=>t[0].hp);run.combat=playClassicCombat(run,{type:'move',move:attack?Dex.moves.get(attack).id:'splash'});return {taken:before[0]-run.combat.teams[0][0].hp,dealt:before[1]-run.combat.teams[1][0].hp};
 }
 assert.equal(battle(cases[1],{enemyMove:'Earthquake'}).taken,0);assert.ok(battle(cases[1],{ability:'pressure',enemyMove:'Earthquake'}).taken>0);
 const guarded=battle(cases[2]).taken,unguarded=battle(cases[2],{ability:'pressure'}).taken;assert.ok(guarded>0&&unguarded>guarded);assert.ok(Math.abs(unguarded-guarded*2)<=2);
 const sharp=battle(cases[0],{attack:'Slash'}).dealt,plain=battle(cases[0],{ability:'pressure',attack:'Slash'}).dealt;assert.ok(sharp>plain);assert.ok(sharp/plain>1.4);
});
