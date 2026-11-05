import {classicRandomizedAbility,classicRandomizerInitialMoves} from './rogue-challenge-randomizers.mjs';
import {classicChallengeValue} from './rogue-challenge-rules.mjs';
import {sourceSpeciesFor,sourceAbility} from './rogue-reference.mjs';
import {calculateStats} from './pokemon-config.mjs';
export function applyClassicPokemonChallenges(mon,run,{enemy=false,trainer=false,starter=false}={}){
 let next=mon;const flip=classicChallengeValue(run,6),passives=classicChallengeValue(run,10),final=enemy&&(run.encounter?.kind==='final'||run.finalBoss);
 if(flip&&!next.rogueFlipStats)next={...next,rogueFlipStats:true};
 if(passives&&(passives===2||enemy&&trainer||final)){const source=sourceSpeciesFor(next),form=source?.formList.find(f=>f.formIndex===(next.rogueFormIndex||0)),passive=sourceAbility(form?.passiveAbilityId??source?.passiveAbilityId);if(passive&&next.roguePassiveAbility!==passive)next={...next,roguePassiveAbility:passive};}
 const source=sourceSpeciesFor(next),form=source?.formList.find(f=>f.formIndex===(next.rogueFormIndex||0)),randomAbility=classicChallengeValue(run,12),randomMoves=classicChallengeValue(run,11),seed=String(run.seed||next.rogueRandomizerSeed||'classic');
 if(randomAbility){const available=form?.abilities||source?.abilities||[],base=available.find(a=>a.slot===(next.rogueAbilitySlot||'primary'))||available[0];if(base&&!next.rogueAbilityOverride){const ability=classicRandomizedAbility(source.sourceId,base.key,seed,randomAbility,{sourceId:base.sourceId});next={...next,...(next.fusionSpecies?{rogueFusion:{...next.rogueFusion,primaryAbility:ability}}:{ability}),rogueRandomizerSeed:seed,rogueAbilityRandomizer:randomAbility};}if(next.roguePassiveAbility){const id=form?.passiveAbilityId??source?.passiveAbilityId;next={...next,roguePassiveAbility:classicRandomizedAbility(source.sourceId,sourceAbility(id),seed,randomAbility,{sourceId:id,passive:true})};}}
 if(randomMoves&&!next.rogueMovesetSeed){next={...next,rogueMovesetSeed:seed,rogueMovesetRandomizer:randomMoves,rogueNoEggRelearn:true};const mystery=enemy&&['absolute-avarice','clowning-around','mysterious-chest','expert-breeder','the-strong-stuff','winstrate','trash-to-treasure'].includes(run.mystery?.type);next.moves=classicRandomizerInitialMoves(next,{starter,mystery,final:final&&source?.sourceId===890});next.pp={};delete next.rogueSketchRule;delete next.rogueTrainerSketch;delete next.rogueSketchPP;}
 if(randomMoves&&final&&source?.sourceId===890){next={...next,moves:classicRandomizerInitialMoves(next,{final:true}),rogueMovesetSeed:seed,rogueMovesetRandomizer:randomMoves,rogueNoEggRelearn:true};}
 if(next!==mon){const stats=calculateStats(next);next={...next,stats,maxHp:stats.hp,hp:mon.hp>0?Math.max(1,Math.min(stats.hp,Math.round(mon.hp/mon.maxHp*stats.hp))):0};}
 return next;
}
