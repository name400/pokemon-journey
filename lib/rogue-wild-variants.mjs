import variants from '../data/rogue-variant-keys.json' with {type:'json'};
const keys=new Set(variants.keys);
// Pinned PokéRogue beta 7c088125: 1/1024 base, then 6:3:1 variants.
export function classicWildShiny(sourceId,charms,random){
 const count=Math.min(4,Math.max(0,Math.floor(charms))),threshold=count?2**(1+count):1;
 if(Math.floor(random()*1024)>=threshold)return {shiny:false,variant:0};
 if(!keys.has(String(sourceId)))return {shiny:true,variant:0};
 const roll=Math.floor(random()*10);return {shiny:true,variant:roll>=4?0:roll>=1?1:2};
}
