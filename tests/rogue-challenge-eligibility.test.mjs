import assert from 'node:assert/strict';
import {makeReferenceMon,sourceSpeciesFor} from '../lib/rogue-reference.mjs';
import {applyClassicEggForm} from '../lib/rogue-egg-forms.mjs';
import {classicChallengeBattleEligibility as eligible,classicChallengeStarterEligibility as starterEligible,classicChallengeStarterGenderEligibility as genderEligible} from '../lib/rogue-challenge-eligibility.mjs';
import {ensureStarterSystem,starterCatalog,buildStarterParty} from '../lib/rogue-starter-system.mjs';
const mon=id=>makeReferenceMon(id,50);
const gen=value=>({id:0,value}),type=value=>({id:1,value});
assert.equal(eligible(mon(25),[]),true);
assert.equal(eligible({...mon(25),hp:0},[]),false);
assert.equal(eligible({...mon(25),hp:undefined},[]),null);
assert.equal(eligible(mon(25),[gen(1),type(13)]),true);
assert.equal(eligible(mon(25),[gen(2)]),false);
assert.equal(eligible(mon(25),[type(10)]),false);
assert.equal(eligible(mon(25),[gen(0),type(0)]),true);
assert.equal(eligible(mon(25),[{id:99,value:1}]),null);
assert.equal(eligible(mon(25),[{id:99,value:1},gen(2)]),false);
assert.equal(eligible({...mon(25),fusionSpecies:4},[gen(1)]),null);
assert.equal(eligible({...mon(25),mega:true},[type(13)]),null);
assert.equal(eligible({...mon(25),rogueFormIndex:99},[type(13)]),null);
const rotom=mon(479),frost=applyClassicEggForm(rotom,sourceSpeciesFor(rotom),()=>.6);
assert.equal(frost.rogueFormKey,'frost');
assert.equal(eligible(frost,[type(15)]),true);
assert.equal(eligible(frost,[type(10)]),false);
assert.equal(eligible({...frost,teraType:'Fire'},[type(10)]),false);
const castform=mon(351),record=sourceSpeciesFor(castform),rain=record.formList.find(f=>f.formKey==='rainy');
assert.ok(rain);
assert.equal(eligible({...castform,rogueFormIndex:rain.formIndex,rogueFormKey:rain.formKey},[type(1)]),true);
assert.equal(eligible({...castform,rogueFormIndex:rain.formIndex,rogueFormKey:rain.formKey},[type(11)]),true);
assert.equal(starterEligible({...castform,rogueFormIndex:rain.formIndex,rogueFormKey:rain.formKey},[type(1)]),false);
assert.equal(starterEligible({...castform,rogueFormIndex:rain.formIndex,rogueFormKey:rain.formKey},[type(11)]),true);
const system={initialStarterId:1};ensureStarterSystem(system);const entry=starterCatalog(system).find(x=>x.id===1);const choice={id:entry.id,ability:entry.abilities[0].key,nature:entry.natures[0].key,gender:entry.genders[0],shiny:false,moves:entry.defaultMoves};
assert.equal(buildStarterParty(system,[choice],{challenges:[gen(1),type(12)]}).party.length,1);
assert.throws(()=>buildStarterParty(system,[choice],{challenges:[gen(2)]}),/챌린지 조건/);
assert.throws(()=>buildStarterParty(system,[choice],{challenges:[type(10)]}),/챌린지 조건/);
assert.throws(()=>buildStarterParty(system,[choice],{challenges:[{id:99,value:1}]}),/지원하지/);
assert.equal(buildStarterParty(system,[choice]).party.length,1);
assert.equal(eligible(mon(25),[type(19)]),null);
console.log('Challenge eligibility: generation, intrinsic type, forms, Castform and conservative unknowns passed');

// Original starter selection gender restrictions (independent of type/generation eligibility).
for(const [id,challenge,accepted] of [[280,gen(4),'M'],[361,gen(4),'F'],[280,type(2),'M'],[361,type(8),'F'],[412,type(3),'M'],[412,type(5),'F'],[412,type(9),'F'],[412,type(12),'F']]){assert.equal(genderEligible(id,accepted,[challenge]),true);assert.equal(genderEligible(id,accepted==='M'?'F':'M',[challenge]),false);assert.equal(genderEligible(id,null,[challenge]),null);}
assert.equal(genderEligible(412,'M',[type(3),type(12)]),false);
assert.equal(genderEligible(25,'F',[gen(4)]),true);
// Verified permanent forms use their intrinsic source type, including custom second types.
{const {applyClassicForm}=await import('../lib/rogue-transformations.mjs');const base=makeReferenceMon(6,50,{boxId:'charizard',moves:['Tackle']}),run={formItems:{charizard:['charizarditex','maxmushrooms']},tools:{megaBracelet:true,dynamaxBand:true}},mega=applyClassicForm(base,run,'charizarditex'),gmax=applyClassicForm(base,run,'maxmushrooms');assert.equal(eligible(mega,[type(16)]),true);assert.equal(eligible(mega,[type(3)]),false);assert.equal(eligible(gmax,[type(3)]),true);assert.equal(eligible(gmax,[type(16)]),false);assert.equal(eligible({...mon(25),dynamaxed:true},[type(13)]),true);assert.equal(eligible({...mega,dynamaxed:true},[type(16)]),null);assert.equal(eligible({...mega,rogueBattleSpecies:'venusaurmega'},[type(16)]),null);const custom={...mon(25),rogueCustomSecondType:'물'};assert.equal(eligible(custom,[type(11)]),true);assert.equal(eligible(custom,[type(13)]),true);assert.equal(starterEligible(custom,[type(11)]),false);assert.equal(eligible({...custom,rogueCustomSecondType:'invalid'},[type(11)]),null);}
// The verified Mega and Gigantamax records enter and restore actual challenge battles.
{const {applyClassicForm}=await import('../lib/rogue-transformations.mjs');const {createClassicCombat,restoreClassicNativeBattle}=await import('../lib/rogue-battle-engine.mjs');for(const [item,challenge,native] of [['charizarditex',type(16),'charizardmegax'],['maxmushrooms',type(3),'charizardgmax']]){const base=makeReferenceMon(6,50,{boxId:'hero',moves:['Tackle']}),run={id:'form-challenge',seed:'form',rng:42,wave:70,screen:'battle',party:[base],formItems:{hero:[item]},modifiers:[],tools:{megaBracelet:true,dynamaxBand:true},balls:{},participants:[],awardedFoes:[],expNotices:[],challengeEligibilityRule:'source-subset-v1',challenges:[challenge],encounter:{kind:'wild'}};run.party[0]=applyClassicForm(base,run,item);run.combat=createClassicCombat(run,[makeReferenceMon(19,50,{boxId:'foe',moves:['Splash']})]);const saved=JSON.parse(JSON.stringify(run)),battle=restoreClassicNativeBattle(saved.combat,saved);assert.equal(battle.p1.active[0].species.id,native);assert.equal(saved.party[0].rogueFormIndex,run.party[0].rogueFormIndex);}}
// Primal forms use verified source form types; Ultra remains guarded with fusion.
{const {applyClassicForm}=await import('../lib/rogue-transformations.mjs');const {createClassicCombat,restoreClassicNativeBattle}=await import('../lib/rogue-battle-engine.mjs');const base=makeReferenceMon(383,50,{boxId:'groudon',moves:['Tackle']}),run={id:'primal-challenge',seed:'primal',rng:42,wave:70,screen:'battle',party:[base],formItems:{groudon:['redorb']},modifiers:[],tools:{},balls:{},participants:[],awardedFoes:[],expNotices:[],challengeEligibilityRule:'source-subset-v1',challenges:[type(10)],encounter:{kind:'wild'}};run.party[0]=applyClassicForm(base,run,'redorb');assert.equal(eligible(run.party[0],[type(10)]),true);assert.equal(eligible(run.party[0],[type(11)]),false);run.combat=createClassicCombat(run,[makeReferenceMon(19,50,{boxId:'foe',moves:['Splash']})]);const saved=JSON.parse(JSON.stringify(run)),battle=restoreClassicNativeBattle(saved.combat,saved);assert.equal(battle.p1.active[0].species.id,'groudonprimal');const ultra={...makeReferenceMon(800,50),rogueFormIndex:3,rogueFormKey:'ultra',rogueBattleSpecies:'necrozmaultra',ultra:true};assert.equal(eligible(ultra,[type(16)]),null);}
// Temporary Dynamax keeps the verified monotype and restores without changing the stored party species.
{const {createClassicCombat,playClassicCombat,restoreClassicNativeBattle}=await import('../lib/rogue-battle-engine.mjs');const hero=makeReferenceMon(25,50,{boxId:'hero',moves:['Tackle']}),run={id:'dynamic-challenge',seed:'dynamic',rng:42,wave:70,screen:'battle',party:[hero],modifiers:[],tools:{dynamaxBand:true},balls:{},participants:[],awardedFoes:[],expNotices:[],challengeEligibilityRule:'source-subset-v1',challenges:[type(13)],encounter:{kind:'wild'}};run.combat=createClassicCombat(run,[makeReferenceMon(143,100,{boxId:'foe',moves:['Splash']})]);run.combat=playClassicCombat(run,{type:'move',move:'tackle',special:'dynamax'});run.party=run.combat.teams[0];const saved=JSON.parse(JSON.stringify(run)),battle=restoreClassicNativeBattle(saved.combat,saved);assert.ok(battle.p1.active[0].volatiles.dynamax);assert.deepEqual(battle.p1.active[0].getTypes(),['Electric']);assert.equal(eligible(saved.party[0],[type(13)]),true);assert.equal(saved.party[0].rogueSourceId,25);}
