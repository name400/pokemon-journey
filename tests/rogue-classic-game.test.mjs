import assert from 'node:assert/strict';
import {applyClassicAction,classicGameView,activeClassicRun} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {starterCatalog,registerStarterCaught,starterProgress} from '../lib/rogue-starter-system.mjs';
import {createClassicCombat} from '../lib/rogue-battle-engine.mjs';
import {makeReferenceMon,rogueSpecies} from '../lib/rogue-reference.mjs';
import {classicCaptureOdds,attemptClassicCapture} from '../lib/rogue-classic-capture.mjs';
import {generateClassicRewards,classicRewardView,chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';

const old={coins:55555,run:{wave:190,party:[]},inventory:{masterball:99},collection:[]},document=structuredClone(old);
const initialState=ensureClassicState(document,{initialStarterId:1});let view=classicGameView(document,{includeStarters:true});assert.equal(view.starters.filter(p=>p.unlocked).length,1);
assert.equal(view.starters.find(p=>p.id===1).natures[0].key,'docile');
for(const id of [4,7])registerStarterCaught(initialState.system,makeReferenceMon(id,5),{kind:'admin',increment:false});view=classicGameView(document,{includeStarters:true});
const team=[1,4,7].map(id=>{const p=view.starters.find(s=>s.id===id);return {id,ability:p.abilities[0].key,nature:p.natures[0].key,gender:p.genders[0],shiny:false,moves:p.defaultMoves};});
assert.throws(()=>applyClassicAction(document,{action:'start',selection:[...team,team[0]]}),/중복/);
applyClassicAction(document,{action:'start',selection:team});const run=activeClassicRun(document);assert.equal(run.screen,'battle');assert.equal(run.party.length,3);assert.equal(run.money,1000);assert.equal(run.combat.requests[0].moves.find(m=>m.id==='tackle').pp,35);
const snapshot=JSON.stringify(document);const loaded=JSON.parse(snapshot);assert.equal(classicGameView(loaded).battle.teams[0][0].level,5);
const command=run.combat.requests[0].moves.find(m=>m.id==='tackle'),actors=run.combat.requests[0].actors.filter(actor=>actor.kind==='move'),actions=actors.map((actor,index)=>{const move=index===0?command:actor.moves.find(m=>m.pp>0&&!m.disabled),target=move.targets?.[0]?.target;return {actor:actor.slot,type:'move',move:move.id,...(target===undefined?{}:{target})};});applyClassicAction(document,{action:'turn',command:actions.length===1?actions[0]:{type:'turn',actions}});assert.equal(run.party[0].pp.tackle,34);
assert.equal(document.coins,old.coins);assert.deepEqual(document.inventory,old.inventory);assert.deepEqual(document.run,old.run);
// Capture and permanent starter unlock never add the caught high-level party
// member to the next run, and never consume cartridge/adventure inventory.
run.combat=createClassicCombat(run,[makeReferenceMon(10,2,{boxId:'capture-target',moves:['たいあたり']})]);run.encounter={kind:'wild',trainer:null};run.balls.masterball=1;run.screen='battle';
applyClassicAction(document,{action:'capture',ballId:'masterball'});assert.equal(run.balls.masterball,0);assert.ok(ensureClassicState(document).system.dex[10].caught);assert.equal(run.party.length,4);assert.ok(['learn','reward'].includes(run.screen));
for(const payload of [...(run.pendingMoves||[])])applyClassicAction(document,{action:'learn',...payload,slot:null});
assert.equal(run.screen,'reward');assert.equal(classicGameView(document).run.services[0].price,36);assert.equal(run.rewards.length,3);
const reward=classicRewardView(run,ensureClassicState(document).system).find(r=>!r.requiresTarget)||classicRewardView(run,ensureClassicState(document).system)[0];
if(!reward.requiresTarget)applyClassicAction(document,{action:'reward',rewardId:reward.id});
else applyClassicAction(document,{action:'skipReward'});
assert.equal(run.screen,'advance');run.seed='fixed-115';run.party.forEach((p,i)=>p.pokerus=i===1);applyClassicAction(document,{action:'next'});assert.equal(run.wave,2);assert.deepEqual(run.party.map(p=>!!p.pokerus),[true,true,true,false]);assert.ok(['battle','wildswitch'].includes(run.screen));
// All five slots hold separate party objects and run currency.
applyClassicAction(document,{action:'prepare',slot:1});applyClassicAction(document,{action:'start',slot:1,selection:team});assert.equal(activeClassicRun(document).money,1000);assert.notEqual(activeClassicRun(document).id,run.id);
applyClassicAction(document,{action:'selectSlot',slot:0});assert.equal(activeClassicRun(document).wave,2);
// Boss captures award boss candy without keeping enemy-only boss status on the owned Pokémon.
const bossDoc=structuredClone(document),bossRun=activeClassicRun(bossDoc),bossState=ensureClassicState(bossDoc),family=rogueSpecies.get(10).starterId;
const candyBefore=starterProgress(bossState.system,family).candies;
bossRun.combat=createClassicCombat(bossRun,[makeReferenceMon(10,2,{boxId:'boss-candy-target',moves:['Splash'],rogueBoss:true,rogueBossSegments:4})]);bossRun.encounter={kind:'wild',trainer:null};bossRun.balls.masterball=1;bossRun.screen='battle';
applyClassicAction(bossDoc,{action:'capture',ballId:'masterball'});assert.equal(starterProgress(bossState.system,family).candies-candyBefore,2);assert.equal(bossRun.party.at(-1).rogueBoss,false);assert.equal(bossRun.party.at(-1).rogueBossSegments,0);
const target={hp:20,maxHp:20,captureRate:255,status:null,shiny:false};assert.equal(classicCaptureOdds(target,'rogueball').value,255);assert.equal(attemptClassicCapture(target,'rogueball',{},()=>.99).caught,true);
const sleeping={...target,hp:1,captureRate:45,status:'잠듦'};assert.ok(classicCaptureOdds(sleeping,'pokeball').value>classicCaptureOdds({...sleeping,status:null},'pokeball').value);
assert.equal(classicCaptureOdds(target,'pokeball',{caughtSpecies:101}).criticalChance,Math.floor(.5*85/6));
console.log('Classic connected flow: one random default starter → 10-point party → real attack → save/reload → capture/meta unlock → random reward/services → continuous wave 2, five slots and legacy isolation passed');
