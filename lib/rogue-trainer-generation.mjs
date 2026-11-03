import variants from '../data/rogue-variant-keys.json' with {type:'json'};

const variantKeys=new Set(variants.keys);
function shinyVariant(sourceId,random){if(!variantKeys.has(String(sourceId)))return 0;const roll=Math.floor(random()*10);return roll>=4?0:roll>=1?1:2;}
// Source beta 7c088125 uses 64/65536, without the player's Shiny Charm.
// This game's persisted RNG supplies equivalent probabilities, not its ID XOR.
export function classicTrainerShiny(sourceId,random) {
 if(Math.floor(random()*1024)!==0)return {shiny:false,variant:0};
 return {shiny:true,variant:shinyVariant(sourceId,random)};
}
// The source Shiny Charm multiplies the base threshold by 2^(1+stacks).
export function classicWildShiny(sourceId,charms,random){
 const stacks=Math.min(4,Math.max(0,Math.floor(charms))),threshold=stacks?2**(1+stacks):1;
 if(Math.floor(random()*1024)>=threshold)return {shiny:false,variant:0};
 return {shiny:true,variant:shinyVariant(sourceId,random)};
}
