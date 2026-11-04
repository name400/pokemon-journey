// Pokémon Salesman normal offers, based on PokéRogue beta 7c088125.
import {Dex} from '@pkmn/sim';
import {classicRandom} from './rogue-classic-state.mjs';
import {classicWaveMoney} from './rogue-classic-rules.mjs';
import {classicWildShiny,rollShinyVariant,supportsShinyVariants} from './rogue-wild-variants.mjs';
import {rogueSpecies,rogueReferenceData,makeReferenceMon} from './rogue-reference.mjs';

const paradox=new Set(['GREAT_TUSK','SCREAM_TAIL','BRUTE_BONNET','FLUTTER_MANE','SLITHER_WING','SANDY_SHOCKS','ROARING_MOON','WALKING_WAKE','GOUGING_FIRE','RAGING_BOLT','IRON_TREADS','IRON_BUNDLE','IRON_HANDS','IRON_JUGULIS','IRON_MOTH','IRON_THORNS','IRON_VALIANT','IRON_LEAVES','IRON_BOULDER','IRON_CROWN'].map(k=>rogueReferenceData.enums.SpeciesId[k]).filter(Number.isInteger));
const pool=[...rogueSpecies.values()].filter(s=>s.isStarter&&Number.isFinite(s.starterCost)&&s.starterCost<=5&&!s.legendary&&!s.subLegendary&&!s.mythical&&!paradox.has(s.sourceId));
const roll=(run,n)=>Math.floor(classicRandom(run)*n);
export const classicSalesmanRequiredMoney=run=>classicWaveMoney(run.wave,4);
export function classicSalesmanOffer(run){
 if(!pool.length)throw Error('판매할 포켓몬 후보가 없습니다.');let record;
 for(let i=0;i<6;i++){record=pool[roll(run,pool.length)];if(record.abilities.some(a=>a.slot==='hidden'))break;}
 const rare=roll(run,100)===0||!record.abilities.some(a=>a.slot==='hidden');
 if(rare)record=rogueSpecies.get(129);
 const random=()=>classicRandom(run),shiny=rare?{shiny:true,variant:supportsShinyVariants(record.sourceId)?rollShinyVariant(random):0}:classicWildShiny(record.sourceId,0,random),ability=record.abilities.find(a=>a.slot===(shiny.shiny?'primary':'hidden'))||record.abilities[0];
 if(!ability)throw Error('판매 포켓몬의 특성을 확인할 수 없습니다.');
 const ivs=Object.fromEntries(['hp','atk','def','spa','spd','spe'].map(k=>[k,roll(run,32)])),nature=Dex.natures.all()[roll(run,Dex.natures.all().length)].id,gender=record.malePercent==null?'N':roll(run,100)<record.malePercent?'M':'F';
 const pokemon=makeReferenceMon(record.sourceId,5,{boxId:crypto.randomUUID(),origin:'purchase',originBall:'pokeball',rogueMetBiome:Number(run.biome)||0,ability:ability.key,rogueAbilitySlot:ability.slot,ivs,nature,gender,...shiny});
 const multiplier=shiny.shiny?4:4*Math.max(record.starterCost,2.5)/5;
 return {pokemon,price:classicWaveMoney(run.wave,multiplier)};
}
