import {fixture} from './dna-persistent.mjs';
import {makeReferenceMon} from '../../lib/rogue-reference.mjs';
import {applyClassicPokemonChallenges} from '../../lib/rogue-challenge-pokemon.mjs';
export function randomizedAliasFixture({value=1,boxId='one'}={}){
 const {doc,run}=fixture([]);run.seed='audit-0';run.challenges=[{id:11,value}];run.challengeEligibilityRule='source-subset-v1';
 const mon=applyClassicPokemonChallenges(makeReferenceMon(1,50,{boxId}),run),ally=applyClassicPokemonChallenges(makeReferenceMon(7,50,{boxId:'ally'}),run);
 if(mon.moves[0]!=='비밀이야기')throw Error('randomizer fixture changed');mon.moves=[mon.moves[0],'Confide',mon.moves[1]];mon.pp={confide:3};mon.roguePPUps={confide:2};mon.rogueMoveHistory=['Splash'];mon.rogueUsedTMs=['Thunderbolt'];run.party=[mon,ally];return doc;
}
