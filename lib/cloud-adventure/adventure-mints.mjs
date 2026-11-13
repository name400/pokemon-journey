import {configure,rules} from '../pokemon-config.mjs';
// Rouge Sector 6 attack and special-attack mint stalls; coordinates are draft.
// https://allthings.how/modest-mint-locations-in-pokemon-legends-z-a/
export const ADVENTURE_MINT_STOCK=Object.freeze([
 Object.freeze(['lonelymint','adamantmint','naughtymint','bravemint','seriousmint']),
 Object.freeze(['modestmint','mildmint','rashmint','quietmint','seriousmint']),
]);
export const ADVENTURE_MINTS=Object.freeze([...new Set(ADVENTURE_MINT_STOCK.flat())]);
export function adventureMintStock(s,spot){
 if(s?.district!=='lumiose-rouge-sector6'||s.interior||s.zaAcademyCourtyard===true||spot?.tile!=='^'||spot.y!==5)return null;
 return spot.x===3?ADVENTURE_MINT_STOCK[0]:spot.x===7?ADVENTURE_MINT_STOCK[1]:null;
}
export function useAdventureMint(mon,item){
 if(!mon||!ADVENTURE_MINTS.includes(item))throw Error('민트와 포켓몬을 확인하세요.');
 const nature=item.slice(0,-4);if(!Object.hasOwn(rules.natures,nature))throw Error('민트 성격을 확인하세요.');
 return configure({...mon,rogueNatureOverride:nature},{hp:mon.hp});
}
