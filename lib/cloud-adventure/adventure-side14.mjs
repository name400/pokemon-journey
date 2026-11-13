import {side10Available} from './adventure-side10.mjs';
// Original: Bleu Sector 5 market stalls; the two 2D positions and fixed
// species are approximations of variable overworld spawns.
// https://www.powerpyx.com/pokemon-legends-z-a-spritzee-location/
// https://www.powerpyx.com/pokemon-legends-z-a-swirlix-location/
export const BLEU5_MARKET_POKEMON=Object.freeze([
 Object.freeze({x:3,y:3,species:682,name:'슈쁘'}),
 Object.freeze({x:6,y:3,species:684,name:'나룸퍼프'}),
]);
export function bleu5MarketPokemon(s,spot){return !s?.interior&&s?.district==='lumiose-bleu-sector5'&&spot?.tile==='^'?BLEU5_MARKET_POKEMON.find(p=>p.x===spot.x&&p.y===spot.y)||null:null;}
// Two café fronts are represented on the compressed southern street map.
// https://www.thonky.com/pokemon-legends-z-a/side-mission-014-slurpuffs-cafe-visit
export function side14Available(s){return side10Available(s);}
export function side14Spot(s,spot){
 if(s?.interior||s?.zaVert7RoofUpper||s?.district!=='lumiose-south-boulevard'||spot?.tile!=='^'||spot.y!==5)return null;
 return spot.x===12?'meuse':spot.x===17?'soleil':null;
}
