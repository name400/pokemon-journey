import assert from 'node:assert/strict';
import {applyClassicTrainerFixedItems} from '../lib/rogue-trainer-items.mjs';
import {classicEncounter,classicTrainerEncounter} from '../lib/rogue-classic-world.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {createClassicCombat,restoreClassicNativeBattle,playClassicCombat} from '../lib/rogue-battle-engine.mjs';

const mon=(id,ability='')=>({rogueSourceId:id,ability,item:''});
for(const [trainer,slot,id,ability,item] of [['RED',0,25,'','lightball'],['WALLACE',5,350,'marvelscale','toxicorb'],['KIERAN',2,472,'poisonheal','toxicorb'],['GUZMA_2',4,472,'poisonheal','toxicorb'],['RIVAL_5',1,277,'guts','flameorb'],['RIVAL_6',1,277,'guts','flameorb']]){
 const team=Array.from({length:6},()=>mon(1));team[slot]=mon(id,ability);
 assert.equal(applyClassicTrainerFixedItems(team,trainer)[slot].item,item);
 if(ability){team[slot]=mon(id,'other');assert.equal(applyClassicTrainerFixedItems(team,trainer)[slot].item,'');}
 team[slot]=mon(1,ability);assert.equal(applyClassicTrainerFixedItems(team,trainer)[slot].item,'');
}
function fixture(id){const run={id:'fixed-items',wave:199,biome:0,rng:42,party:[makeReferenceMon(151,100,{boxId:'player',moves:['Protect']})],modifiers:[],tools:{},seed:'fixture',trainerTraitsRule:'source-v1',trainerItemsRule:'source-v1'};const encounter=classicTrainerEncounter(run,id,{kind:'champion'});run.encounter=encounter;return {run,encounter};}
const red=fixture(351);assert.equal(red.encounter.team[0].rogueSourceId,25);assert.equal(red.encounter.team[0].item,'lightball');
const redBattle=restoreClassicNativeBattle(createClassicCombat(red.run,red.encounter.team,{trainer:true}),red.run),pikachu=redBattle.p2.pokemon[0];
assert.equal(pikachu.item,'lightball');const boosted=redBattle.runEvent('ModifyAtk',pikachu,null,null,100);pikachu.item='';const unboosted=redBattle.runEvent('ModifyAtk',pikachu,null,null,100);assert.equal(boosted,2*unboosted);
const wallace=fixture(354),milotic=wallace.encounter.team[5];assert.equal(milotic.ability,'marvelscale');assert.equal(milotic.item,'toxicorb');
wallace.run.combat=createClassicCombat(wallace.run,[milotic],{trainer:true});wallace.run.combat=playClassicCombat(wallace.run,{type:'move',move:'protect'});assert.equal(wallace.run.combat.teams[1][0].status,'맹독');
const restored=restoreClassicNativeBattle(JSON.parse(JSON.stringify(wallace.run.combat)),wallace.run);assert.equal(restored.p2.active[0].status,'tox');assert.equal(restored.p2.active[0].item,'toxicorb');
for(const wave of [145,195]){
 const run={id:'rival-orb',wave,biome:0,rng:42,gymStart:20,party:[makeReferenceMon(151,100,{boxId:'player',moves:['Protect']})],modifiers:[],tools:{},seed:'fixture',trainerItemsRule:'source-v1',rivalChoices:{slot1:{index:2,subIndex:0}}};
 const encounter=classicEncounter(run),bird=encounter.team[1];assert.equal(bird.rogueSourceId,277);assert.equal(bird.ability,'guts');assert.equal(bird.item,'flameorb');run.encounter=encounter;
 run.combat=createClassicCombat(run,[bird],{trainer:true});run.combat=playClassicCombat(run,{type:'move',move:'protect'});assert.equal(run.combat.teams[1][0].status,'화상');
}
const legacy=fixture(354);delete legacy.run.trainerItemsRule;const old=classicTrainerEncounter(legacy.run,354,{kind:'champion'});assert.equal(old.team[5].item,'');
console.log('Fixed trainer items: source conditions, actual Light Ball, Toxic Orb, restore and legacy rules passed.');
