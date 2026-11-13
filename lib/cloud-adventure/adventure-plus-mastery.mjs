// Curated from the Z-A Pokédex at Dittobase, not the project's modern learnsets.
// Species without verified entries never gain inferred level-based mastery.
const bulbasaur={synthesis:38,tackle:10,vinewhip:6,razorleaf:15,takedown:28,magicalleaf:33,sludgewave:45,doubleedge:48,solarbeam:58};
const grass={synthesis:43,tackle:10,leafage:9,disarmingvoice:12,razorleaf:15,bodyslam:25,solarbeam:48,leafstorm:59};
const fire={tackle:10,ember:9,rollout:13,flamewheel:18,firespin:23,flamethrower:32,takedown:35,flareblitz:53,headsmash:59};
const water={tackle:10,watergun:9,bite:13,bubblebeam:18,aquajet:24,breakingswipe:29,liquidation:43,hydropump:53,outrage:59};
const levels={137:{conversion:10},233:{conversion:10},474:{conversion:10},352:{conversion:10},1:bulbasaur,2:bulbasaur,3:{...bulbasaur,powerwhip:35},152:grass,153:{...grass,gigadrain:19},154:{...grass,gigadrain:19,leafblade:35},498:fire,499:{...fire,poweruppunch:20},500:{...fire,poweruppunch:20,closecombat:48},158:water,159:{...water,slash:21},160:{...water,slash:10,crunch:33}};
export function adventureMoveMastered(mon,id){return !!mon&&(Array.isArray(mon.adventurePlusMastered)&&mon.adventurePlusMastered.includes(id)||Number.isInteger(mon.level)&&Number.isInteger(levels[mon.speciesId]?.[id])&&mon.level>=levels[mon.speciesId][id]);}
