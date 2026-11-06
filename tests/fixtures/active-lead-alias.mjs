import {fixture} from './dna-persistent.mjs';
import {randomizedAliasFixture} from './randomized-alias.mjs';
import {makeReferenceMon} from '../../lib/rogue-reference.mjs';
import {createClassicCombat} from '../../lib/rogue-battle-engine.mjs';
export function activeLeadAliasFixture({randomized=false,boxId='one'}={}){
 if(randomized)return randomizedAliasFixture({boxId,active:true,leadActive:true});
 const mon=makeReferenceMon(1,50,{boxId,moves:['Tackle','몸통박치기','Growl'],pp:{tackle:3,growl:5},roguePPUps:{tackle:2}}),ally=makeReferenceMon(7,50,{boxId:'ally',moves:['Splash']}),{doc,run}=fixture([mon,ally]);run.screen='battle';run.encounter={kind:'wild'};run.combat=createClassicCombat(run,[makeReferenceMon(143,30,{boxId:'foe',moves:['Splash']})]);run.party=run.combat.teams[0];return doc;
}
