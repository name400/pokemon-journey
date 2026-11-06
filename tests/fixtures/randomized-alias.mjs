import {createClassicCombat,playClassicCombat} from '../../lib/rogue-battle-engine.mjs';
import {fixture} from './dna-persistent.mjs';
import {makeReferenceMon} from '../../lib/rogue-reference.mjs';
import {applyClassicPokemonChallenges} from '../../lib/rogue-challenge-pokemon.mjs';
export function randomizedAliasFixture({value=1,boxId='one',ended=false,active=false,trainer=false,sketch=false}={}){
 const {doc,run}=fixture([]);run.seed='audit-0';run.challenges=[{id:11,value}];run.challengeEligibilityRule='source-subset-v1';
 const mon=applyClassicPokemonChallenges(makeReferenceMon(1,50,{boxId}),run),ally=applyClassicPokemonChallenges(makeReferenceMon(7,50,{boxId:'ally'}),run);
 if(mon.moves[0]!=='비밀이야기')throw Error('randomizer fixture changed');mon.moves=sketch?[mon.moves[0],'Sketch','Confide']:[mon.moves[0],'Confide',mon.moves[1]];if(sketch){mon.rogueSketchRule='source-v1';mon.rogueSketchPP=[2,1,17];}mon.pp={confide:3};mon.roguePPUps={confide:2};mon.rogueMoveHistory=['Splash'];mon.rogueUsedTMs=['Thunderbolt'];run.party=[mon,ally];if(ended||active){const lead=applyClassicPokemonChallenges(makeReferenceMon(151,80,{boxId:'lead'}),run),foe=makeReferenceMon(143,5,{boxId:'foe',moves:['Splash']});lead.moves=['Tackle'];lead.pp={};if(ended)foe.hp=1;run.party=[lead,mon];run.screen='battle';run.encounter=trainer?{kind:'trainer',trainer:{id:1,name:'Trainer'}}:{kind:'wild'};run.combat=createClassicCombat(run,[foe],{trainer});if(ended)run.combat=playClassicCombat(run,{type:'move',move:'tackle'});run.party=run.combat.teams[0];if(ended)run.screen='reward';}return doc;
}
