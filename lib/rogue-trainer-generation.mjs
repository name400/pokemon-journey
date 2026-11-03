import variants from '../data/rogue-variant-keys.json' with {type:'json'};

const variantKeys=new Set(variants.keys);
// Source beta 7c088125 uses 64/65536, without the player's Shiny Charm.
// This game's persisted RNG supplies equivalent probabilities, not its ID XOR.
export function classicTrainerShiny(sourceId,random) {
 if(Math.floor(random()*1024)!==0)return {shiny:false,variant:0};
 if(!variantKeys.has(String(sourceId)))return {shiny:true,variant:0};
 const roll=Math.floor(random()*10);
 return {shiny:true,variant:roll>=4?0:roll>=1?1:2};
}
