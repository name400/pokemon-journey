// Curated from the Z-A Pokédex at Dittobase, not the project's modern learnsets.
// Species without verified entries never gain inferred level-based mastery.
const bulbasaur={synthesis:38,tackle:10,vinewhip:6,razorleaf:15,takedown:28,magicalleaf:33,sludgewave:45,doubleedge:48,solarbeam:58};
const charmander={tackle:10,ember:7,dragonbreath:15,firefang:20,firespin:23,slash:27,flamethrower:33,dragonrush:45,flareblitz:57};
const squirtle={tackle:10,watergun:6,bite:15,bubblebeam:18,icywind:23,aquajet:38,liquidation:48};
const grass={synthesis:43,tackle:10,leafage:9,disarmingvoice:12,razorleaf:15,bodyslam:25,solarbeam:48,leafstorm:59};
const fire={tackle:10,ember:9,rollout:13,flamewheel:18,firespin:23,flamethrower:32,takedown:35,flareblitz:53,headsmash:59};
const water={tackle:10,watergun:9,bite:13,bubblebeam:18,aquajet:24,breakingswipe:29,liquidation:43,hydropump:53,outrage:59};
// Early-story encounters, reviewed per species and evolution-only move.
const fletchling={peck:10,quickattack:11,ember:15,flamewheel:28,steelwing:33,airslash:38,flareblitz:48};
const bunnelby={tackle:10,mudshot:10,quickattack:17,brutalswing:27,dig:31,bounce:35,takedown:39,earthquake:47};
// Individually reviewed moves; do not infer mastery for the rest of the family.
const raltsCore={confusion:9,psybeam:21,psychic:41};
const levels={661:fletchling,662:{...fletchling,wingattack:20},663:{...fletchling,wingattack:10,bravebird:38},659:bunnelby,660:{...bunnelby,bulldoze:23},137:{conversion:10},233:{conversion:10},474:{conversion:10},352:{conversion:10},280:raltsCore,281:raltsCore,282:{...raltsCore,wish:35,dazzlinggleam:33,moonblast:52},475:{confusion:9,psybeam:10,psychocut:45,leafblade:53},1:bulbasaur,2:bulbasaur,3:{...bulbasaur,powerwhip:35},4:charmander,5:charmander,6:{...charmander,airslash:39,fireblast:39,dragonclaw:10},7:squirtle,8:squirtle,9:{...squirtle,flashcannon:39,hydropump:39},152:grass,153:{...grass,gigadrain:19},154:{...grass,gigadrain:19,leafblade:35},498:fire,499:{...fire,poweruppunch:20},500:{...fire,poweruppunch:20,closecombat:48},158:water,159:{...water,slash:21},160:{...water,slash:10,crunch:33}};
export function adventureMoveMastered(mon,id){return !!mon&&(Array.isArray(mon.adventurePlusMastered)&&mon.adventurePlusMastered.includes(id)||Number.isInteger(mon.level)&&Number.isInteger(levels[mon.speciesId]?.[id])&&mon.level>=levels[mon.speciesId][id]);}
