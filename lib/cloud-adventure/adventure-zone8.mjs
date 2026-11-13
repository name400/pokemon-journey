// Jaune Plaza: central dirt and a surrounding sand ring. Grid dimensions,
// entrances and fixed field positions are draft representations.
export const ZONE8_VISIBLE=[{id:'numel',tile:'a',species:322,level:23,name:'둔타',x:6,y:12},{id:'machop',tile:'b',species:66,level:24,name:'알통몬',x:10,y:7},{id:'gible',tile:'c',species:443,level:24,name:'딥상어동',x:14,y:8,burrow:true},{id:'drilbur',tile:'f',species:529,level:23,name:'두더류',x:11,y:9,burrow:true},{id:'camerupt-alpha',tile:'d',species:323,level:40,name:'폭타',x:8,y:10,alpha:true},{id:'krokorok-alpha',tile:'e',species:552,level:38,name:'악비르',x:18,y:8,alpha:true}];
// Sources agree that Gible is rare in the same burrows as Drilbur; the
// precise probability is unknown. Three percent is a provisional game value.
export const ZONE8_GIBLE_CHANCE=0.03;
export function zone8BurrowSpecies(s,id){const saved=s?.zaZone8Burrows?.[id];if(saved===443||saved===529)return saved;return id==='gible'?443:529;}
export function initializeZone8Burrows(s,rng=Math.random){
 if(s?.district!=='lumiose-zone8'||s.interior||s.combat||s.encounter||s.adventureCatchWindow)return false;
 const prev=s.zaZone8Burrows&&typeof s.zaZone8Burrows==='object'&&!Array.isArray(s.zaZone8Burrows)?s.zaZone8Burrows:{},next={...prev};let changed=false;
 for(const id of ['gible','drilbur']){if(next[id]===443||next[id]===529)continue;const old=id==='gible'?443:529;const roll=s.zaWildShinyRolls?.[`zone8:${id}:${old}`];next[id]=typeof roll==='boolean'||s.zaZone8Spent?.[id]===true?old:rng()<ZONE8_GIBLE_CHANCE?443:529;changed=true;}
 if(changed)s.zaZone8Burrows=next;return changed;
}
// Keep a previously generated shiny mound when leaving or refreshing a zone.
export function resetZone8Burrows(s){
 const current=s?.zaZone8Burrows;if(!current||typeof current!=='object'||Array.isArray(current))return;
 const next={...current},rolls=s.zaWildShinyRolls&&typeof s.zaWildShinyRolls==='object'&&!Array.isArray(s.zaWildShinyRolls)?{...s.zaWildShinyRolls}:null;
 const alphas=s.zaWildVisibleAlphaLevels&&typeof s.zaWildVisibleAlphaLevels==='object'&&!Array.isArray(s.zaWildVisibleAlphaLevels)?{...s.zaWildVisibleAlphaLevels}:null;
 for(const id of ['gible','drilbur']){const species=current[id],key=`zone8:${id}:${species}`;if((species===443||species===529)&&rolls?.[key]===true&&s.zaZone8Spent?.[id]!==true)continue;delete next[id];if(rolls){delete rolls[`zone8:${id}:443`];delete rolls[`zone8:${id}:529`];}if(alphas){delete alphas[`zone8:${id}:443`];delete alphas[`zone8:${id}:529`];}}
 s.zaZone8Burrows=next;if(rolls)s.zaWildShinyRolls=rolls;if(alphas)s.zaWildVisibleAlphaLevels=alphas;
}
export function zone8Visible(s,tile){const p=ZONE8_VISIBLE.find(p=>p.tile===tile&&!s.zaZone8Spent?.[p.id]);if(!p||!p.burrow)return p||null;const species=zone8BurrowSpecies(s,p.id);return {...p,species,name:species===443?'딥상어동':'두더류',level:species===443?24:23};}
export const ZONE8_ITEMS=[{id:'north-great',tile:'i',x:11,y:3,name:'슈퍼볼',kind:'greatball'},{id:'east-great',tile:'j',x:19,y:7,name:'슈퍼볼',kind:'greatball'},{id:'center-hyper',tile:'k',x:12,y:6,name:'고급상처약',kind:'hyper_potions'},{id:'center-heal',tile:'l',x:12,y:10,name:'힐볼',kind:'healball'}];
export function zone8Item(s,tile){return ZONE8_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone8Items)&&s.zaZone8Items.includes(p.id)))||null;}
// Stalls on the east and south sides are documented; tile positions are draft.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_8
// The plaza's central market is documented; stall tiles and duplicated legacy
// edge counters are approximations for this 2D map.
// https://bulbapedia.bulbagarden.net/wiki/Jaune_Plaza
export const ZONE8_CENTRAL_STALLS=[[7,5],[15,11]];
export const ZONE8_STALLS=[[21,8],[15,15],...ZONE8_CENTRAL_STALLS];
// Trim only empty corner cells to approximate the separately observed round
// plaza. Exact original collision is unknown; all historical gate paths remain.
export const ZONE8_ROUNDED_CORNERS=[
 [1,1],[2,1],[3,1],[4,1],[5,1],[1,2],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],
 [21,1],[21,2],[21,3],
 [1,13],[2,13],[3,13],[1,14],[2,14],[3,14],[4,14],[1,15],[2,15],[3,15],[4,15],[5,15],
 [21,13],[20,13],[21,14],[20,14],[19,14],[21,15],[20,15],[19,15],[18,15]
];
export function zone8Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=2;y<=14;y++)for(let x=2;x<=20;x++){const r=((x-11)/9)**2+((y-8)/6)**2;if(r<=1)g[y][x]=r>.45?'g':',';}
 for(let y=6;y<=10;y++)for(let x=8;x<=14;x++)g[y][x]='g';
 // Approaches use only former plain floor: the central and perimeter sand
 // remain encounter terrain. Exact paving widths and screen edges are draft.
 for(const x of [9,10,11])for(let y=13;y<=15;y++)if(g[y][x]==='.')g[y][x]=',';
 for(const x of [18,19,20])for(let y=1;y<=4;y++)if(g[y][x]==='.')g[y][x]=',';
 for(let x=18;x<=21;x++)for(const y of [9,10,11])if(g[y][x]==='.')g[y][x]=',';
 for(let y=1;y<=3;y++)for(const x of [10,11,12])if(g[y][x]==='.')g[y][x]=',';
 for(const [x,y] of ZONE8_ROUNDED_CORNERS)if(g[y][x]==='.')g[y][x]='#';
 for(const [x,y] of ZONE8_STALLS)g[y][x]='^';
 g[16][9]='X';g[16][11]='X';g[0][19]='X';g[0][11]='X';g[10][22]='X';
 // The documented opposing Jaune Street gates; all legacy gates remain.
 // Exact tile coordinates are an approximation of the source map.
 g[11][0]='X';g[5][22]='X';for(const p of ZONE8_VISIBLE)if(!s.zaZone8Spent?.[p.id])g[p.y][p.x]=p.tile;for(const p of ZONE8_ITEMS)if(zone8Item(s,p.tile))g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
// Species and approximate levels follow source lists; weights are provisional.
export function zone8Encounter(s,rng=Math.random){const central=s.x>=7&&s.x<=15&&s.y>=5&&s.y<=11,pool=central?[[66,24,26]]:[[322,23,24],[551,23,24],[552,29,30]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}

// Original stock; east/south assignment is an approximate mapping to this 2D draft.
export const ZONE8_BERRY_STOCK=Object.freeze([
 Object.freeze(['pomegberry','kelpsyberry','qualotberry','hondewberry','grepaberry','tamatoberry']),
 Object.freeze(['occaberry','passhoberry','wacanberry','rindoberry','yacheberry','chopleberry']),
]);
export function zone8BerryStock(s,spot){if(s?.district!=='lumiose-zone8'||s.interior||spot?.tile!=='^')return null;const index=ZONE8_STALLS.findIndex(([x,y])=>spot.x===x&&spot.y===y);return index<0?null:ZONE8_BERRY_STOCK[index%2];}
