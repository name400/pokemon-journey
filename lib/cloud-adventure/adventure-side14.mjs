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
 if(!s?.interior&&s?.district==='lumiose-bleu-sector10-street'&&spot?.tile==='^'&&spot.x===11&&spot.y===5)return 'meuse';
 if(s?.interior||s?.zaVert7RoofUpper||s?.district!=='lumiose-south-boulevard'||spot?.tile!=='^'||spot.y!==5)return null;
 return spot.x===12?'meuse':spot.x===17?'soleil':null;
}

// Slurpuff leads toward Café Soleil. These visual-only waypoints approximate
// its route in the compressed maps and never change walkability or saves.
// https://www.thonky.com/pokemon-legends-z-a/side-mission-014-slurpuffs-cafe-visit
export function side14GuideVisual(s){
 if(!s||s.interior||s.zaSide14Started!==true||![undefined,false].includes(s.zaSide14Complete)||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 let x,y;
 if(s.district==='lumiose-bleu-sector10-street'){
  x=s.x>=10?8:s.x>=5?3:1;y=8;
 }else if(s.district==='lumiose-south-boulevard'&&(s.zaVert7RoofUpper===undefined||s.zaVert7RoofUpper===false)){
  if(s.x<=10){x=11;y=8;}else if(s.x<=14){x=16;y=8;}else{x=17;y=6;}
 }else return null;
 const tile=s.map?.[y]?.[x];if(!['.',','].includes(tile)||(s.x===x&&s.y===y))return null;
 return {x,y,tile,kind:'pokemon',species:685};
}
