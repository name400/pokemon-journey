// NaturePowerAttr.getMoveId facts from the pinned PokéRogue source
// 7c0881255af5cd51992e513ff93c2f71adbe40e0, src/data/moves/move.ts.
// Upstream notices: AGPL-3.0-only, Pagefault Games and contributors.
import {rogueReferenceData} from './rogue-reference.mjs';

const sourceMoves={
 TOWN:'round',METROPOLIS:'triattack',SLUM:'sludgebomb',PLAINS:'silverwind',
 GRASS:'grassknot',TALL_GRASS:'pollenpuff',MEADOW:'gigadrain',FOREST:'bugbuzz',JUNGLE:'leafstorm',
 SEA:'hydropump',SWAMP:'mudbomb',BEACH:'scald',LAKE:'bubblebeam',SEABED:'brine',ISLAND:'leaftornado',
 MOUNTAIN:'airslash',BADLANDS:'earthpower',DESERT:'scorchingsands',WASTELAND:'dragonpulse',
 CONSTRUCTION_SITE:'steelbeam',CAVE:'powergem',ICE_CAVE:'icebeam',SNOWY_FOREST:'frostbreath',
 VOLCANO:'lavaplume',GRAVEYARD:'shadowball',RUINS:'ancientpower',TEMPLE:'extrasensory',DOJO:'focusblast',
 FAIRY_CAVE:'alluringvoice',ABYSS:'ominouswind',SPACE:'dracometeor',FACTORY:'flashcannon',
 LABORATORY:'zapcannon',POWER_PLANT:'chargebeam',END:'eternabeam',
};
export const classicNaturePowerMoves=Object.freeze(Object.fromEntries(Object.entries(sourceMoves).map(([name,move])=>[rogueReferenceData.enums.BiomeId[name],move])));
const terrainMoves=Object.freeze({electricterrain:'thunderbolt',grassyterrain:'energyball',psychicterrain:'psychic',mistyterrain:'moonblast'});
export function classicNaturePowerMove(biomeId,terrain=''){
 return terrainMoves[terrain]||(Number.isInteger(biomeId)?classicNaturePowerMoves[biomeId]:null)||null;
}
const installed=new WeakSet();
export function installClassicNaturePower(b,combat){
 if(combat?.naturePowerRule!=='source-biome-v1'||!classicNaturePowerMove(combat.biomeId)||installed.has(b))return;
 installed.add(b);
 const nativeDex=b.dex,localDex=Object.create(nativeDex),nativeMove=nativeDex.moves.get('naturepower');
 const called=new nativeDex.Move({...nativeMove,onTryHit(target,pokemon){
  const terrain=Object.keys(terrainMoves).find(type=>this.field.isTerrain(type))||'';
  const move=classicNaturePowerMove(combat.biomeId,terrain);
  if(!move)return nativeMove.onTryHit.call(this,target,pokemon);
  // actions.dex is captured by the native constructor. Pass the battle-local
  // move object so source numeric/flag overrides also reach the called move.
  this.actions.useMove(this.dex.moves.get(move),pokemon,{target});return null;
 }});
 Object.defineProperty(localDex,'moves',{value:new Proxy(nativeDex.moves,{get(target,key){
  if(key==='get'||key==='getByID')return function(name){const move=target[key](name);return move.id==='naturepower'?called:move;};
  const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
 }})});
 b.dex=localDex;
}
