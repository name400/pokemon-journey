import {fixture} from './dna-persistent.mjs';
import {randomizedAliasFixture} from './randomized-alias.mjs';
import {makeReferenceMon} from '../../lib/rogue-reference.mjs';
import {createClassicCombat} from '../../lib/rogue-battle-engine.mjs';
export function activeLeadAliasFixture({randomized=false,boxId='one',kind='wild'}={}){
 if(randomized){const doc=randomizedAliasFixture({boxId,active:true,leadActive:true,trainer:kind!=='wild'});doc.classic.slots[0].encounter.kind=kind;return doc;}
 const mon=makeReferenceMon(1,50,{boxId,moves:['Tackle','몸통박치기','Growl'],pp:{tackle:3,growl:5},roguePPUps:{tackle:2}}),ally=makeReferenceMon(7,50,{boxId:'ally',moves:['Splash']}),{doc,run}=fixture([mon,ally]);run.screen='battle';run.encounter=kind==='wild'?{kind}:{kind,trainer:{id:1,name:'Trainer'}};run.combat=createClassicCombat(run,[makeReferenceMon(143,30,{boxId:'foe',moves:['Splash']})],{trainer:kind!=='wild'});run.party=run.combat.teams[0];return doc;
}
