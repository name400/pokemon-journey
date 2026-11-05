import {classicChallengeValue} from './rogue-challenge-rules.mjs';
import {sourceSpeciesFor,sourceAbility} from './rogue-reference.mjs';
import {calculateStats} from './pokemon-config.mjs';
export function applyClassicPokemonChallenges(mon,run,{enemy=false,trainer=false}={}){
 let next=mon;const flip=classicChallengeValue(run,6),passives=classicChallengeValue(run,10),final=enemy&&(run.encounter?.kind==='final'||run.finalBoss);
 if(flip&&!next.rogueFlipStats)next={...next,rogueFlipStats:true};
 if(passives&&(passives===2||enemy&&trainer||final)){const source=sourceSpeciesFor(next),form=source?.formList.find(f=>f.formIndex===(next.rogueFormIndex||0)),passive=sourceAbility(form?.passiveAbilityId??source?.passiveAbilityId);if(passive&&next.roguePassiveAbility!==passive)next={...next,roguePassiveAbility:passive};}
 if(next!==mon){const stats=calculateStats(next);next={...next,stats,maxHp:stats.hp,hp:mon.hp>0?Math.max(1,Math.min(stats.hp,Math.round(mon.hp/mon.maxHp*stats.hp))):0};}
 return next;
}
