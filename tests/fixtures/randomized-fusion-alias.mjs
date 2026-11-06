import {Dex} from '@pkmn/sim';
import {moves} from '../../lib/game.mjs';
import {fixture} from './dna-persistent.mjs';
import {makeReferenceMon} from '../../lib/rogue-reference.mjs';
import {applyClassicPokemonChallenges} from '../../lib/rogue-challenge-pokemon.mjs';
import {previewClassicDnaFusion} from '../../lib/rogue-dna-fusion.mjs';
import {createClassicCombat,playClassicCombat} from '../../lib/rogue-battle-engine.mjs';
export function randomizedFusionAliasFixture({value=1,boxId='one',reverse=false,ended=false,active=false,abilityRandom=false,sketch=false,leadActive=false,extraMove=false}={}){
 const {doc,run}=fixture([]);run.seed='audit-0';run.challenges=[{id:11,value},...(abilityRandom?[{id:12,value:2}]:[])];run.challengeEligibilityRule='source-subset-v1';
 const primary=applyClassicPokemonChallenges(makeReferenceMon(reverse?7:1,50,{boxId}),run),donor=applyClassicPokemonChallenges(makeReferenceMon(reverse?1:7,50,{boxId:'donor'}),run),first=primary.moves[0],native=Dex.moves.get(moves[first]?.key||first),next=sketch?'Sketch':primary.moves[1];if(!native.exists||native.name===first||native.id==='sketch')throw Error('randomized fusion fixture changed');primary.moves=sketch?[first,next,native.name]:[first,native.name,next];if(sketch){primary.rogueSketchRule='source-v1';primary.rogueSketchPP=[2,1,7];}if(extraMove){primary.moves.push('Splash');if(sketch)primary.rogueSketchPP.push(20);}primary.pp={[native.id]:3};primary.roguePPUps={[native.id]:2};primary.rogueMoveHistory=['Splash'];const mon=previewClassicDnaFusion(primary,donor,{random:()=>0}).fused;
 if(ended||active){const lead=applyClassicPokemonChallenges(makeReferenceMon(151,80,{boxId:'lead'}),run),foe=makeReferenceMon(143,5,{boxId:'foe',moves:['Splash']});lead.moves=['Tackle'];lead.pp={};if(ended)foe.hp=1;run.party=leadActive?[mon,lead]:[lead,mon];run.screen='battle';run.encounter={kind:'wild'};run.combat=createClassicCombat(run,[foe]);if(ended)run.combat=playClassicCombat(run,{type:'move',move:'tackle'});run.party=run.combat.teams[0];if(ended)run.screen='reward';}else run.party=[mon];return {doc,first,next,key:native.id,nextKey:Dex.moves.get(moves[next]?.key||next).id};
}
