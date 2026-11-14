import {findVisibleWild,knownVisibleWildLedger} from './adventure-visible-wild.mjs';
import {canRefreshTimedObstacle} from './adventure-obstacle-clock.mjs';
import {adventureSpawnInterval} from './adventure-clock.mjs';
import {refreshZoneShinyRolls} from './adventure-wild-refresh.mjs';
// Jaune Sector 8: garden, hedges and central pavilion are documented.
// West entrance faces Jaune Street, east entrance faces Jaune Sector 8.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_19
// Tile geometry and the transitional Sector 8 road are provisional.
import {afterMission30} from './adventure-zone-milestones.mjs';
export function zone19Unlocked(s){return afterMission30(s)||['B','A'].includes(s?.zaRoyaleRank);}
export const ZONE19_VISIBLE=[
 {id:'furfrou',tile:'a',species:676,level:49,name:'트리미앙',x:5,y:7},
 {id:'kangaskhan',tile:'b',species:115,level:50,name:'캥카',x:18,y:4},
 {id:'furfrou-alpha',tile:'d',species:676,level:61,name:'트리미앙',x:11,y:8,alpha:true,period:'day'},
 {id:'clefairy-alpha',tile:'d',species:35,level:60,name:'삐삐',x:11,y:8,alpha:true,period:'night'},
 {id:'audino',tile:'c',species:531,level:50,name:'다부니',x:16,y:12},
 {id:'cleffa-night',tile:'e',species:173,level:49,name:'삐',x:9,y:9,period:'night'},
 {id:'clefairy-night',tile:'f',species:35,level:49,name:'삐삐',x:13,y:9,period:'night'},
];
export function zone19Visible(s,tile){return findVisibleWild(s,ZONE19_VISIBLE,p=>p.tile===tile&&(!p.period||p.period===(s.zaZone19Period||'day'))&&!s.zaZone19Spent?.[p.id])||null;}
export const ZONE19_ITEMS=[{id:'tree-luxury',tile:'i',x:19,y:10,name:'럭셔리볼',kind:'luxuryball'},{id:'south-quick',tile:'j',x:4,y:13,name:'퀵볼',kind:'quickball'}];
export function zone19Item(s,tile){return ZONE19_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone19Items)&&s.zaZone19Items.includes(p.id)))||null;}
// Approximate trellis rows on the documented vineyard slope; exact positions are draft.
export const ZONE19_TRELLIS=[[4,3],[5,3],[6,3],[16,3],[17,3],[18,3],[4,6],[5,6],[6,6],[16,6],[17,6],[18,6],[4,10],[5,10],[6,10],[16,10],[17,10],[18,10],[4,12],[5,12],[6,12],[17,12],[18,12],[19,12]];
export function zone19Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'g'));
 for(let y=2;y<=14;y++)g[y][11]=',';for(let x=2;x<=20;x++)g[8][x]=',';
 for(let x=8;x<=14;x++){g[5][x]='#';g[11][x]='#';}for(let y=6;y<=10;y++){g[y][8]='#';g[y][14]='#';}g[5][11]=',';g[11][11]=',';g[8][8]=',';g[8][14]=',';g[7][11]='#';
 for(let x=3;x<=7;x++)g[4][x]='#';for(let x=15;x<=19;x++)g[13][x]='#';
 for(const [x,y] of ZONE19_TRELLIS)if(g[y][x]==='g')g[y][x]='#';
 g[5][11]=s.zaZone19BramblesCleared?',':'r';g[0][11]='X';g[16][11]='X';g[8][0]='W';g[8][22]='E';g[9][22]='E';for(const p of ZONE19_ITEMS)if(zone19Item(s,p.tile))g[p.y][p.x]=p.tile;for(const p of ZONE19_VISIBLE)if(zone19Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
// The seven ordinary species are listed in the original zone; their exact
// encounter weights and positions are not known for this 2D adaptation.
// https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/wild-zones/
export const ZONE19_ENCOUNTERS=Object.freeze([[676,48,51],[531,50,51],[115,50,51],[133,48,49],[780,49,51],[173,48,50],[35,48,50]].map(Object.freeze));
// Drampa appears during the day; Cleffa and Clefairy appear at night. Exact
// rarity and the narrower morning-only claim differ among public guides.
// https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-19-guide-all-pokemon-and-alphas
export function zone19EncounterPool(period){return ZONE19_ENCOUNTERS.filter(([id])=>period==='night'?id!==780:id!==173&&id!==35);}
export function zone19Encounter(s,rng=Math.random,period=s?.zaZone19Period){const next=()=>Math.max(0,Math.min(.999999999999,rng())),pool=zone19EncounterPool(period),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}

// Refresh only after the server observes a different day/night interval. Old
// saves have no timestamp, so the first observation records a baseline without
// discarding any prior encounters. In-flight battles and catch windows remain
// authoritative; their refresh is deferred until they are resolved.
export function zone19SpawnInterval(now,offsetHours=0){return adventureSpawnInterval(now,offsetHours);}
export function refreshZone19Spawns(s,period,interval,canRefresh=(_state,_zone,_period)=>true){
 if(!s||s.district!=='lumiose-zone19'||s.interior||s.combat||s.encounter||s.adventureCatchWindow||!['day','night'].includes(period)||!Number.isSafeInteger(interval))return false;
 if(!knownVisibleWildLedger(s.zaZone19Spent))return false;
 const old=s.zaZone19SpawnCycle,valid=old&&['day','night'].includes(old.period)&&Number.isSafeInteger(old.interval);
 if(valid&&old.period===period&&old.interval===interval)return false;
 if(valid){
  if(!canRefresh(s,19,period))return false;
  refreshZoneShinyRolls(s,19);
  delete s.zaZone19Spent;
 }
 s.zaZone19SpawnCycle={period,interval};return true;
}

// Preserve legacy cleared saves and delay restoration until outside the zone.
export function refreshZone19Brambles(s,now=Date.now()){
 if(s?.zaZone19BramblesCleared!==true||!canRefreshTimedObstacle(s,'lumiose-zone19',s.zaZone19BramblesClearedAt,now))return false;
 s.zaZone19BramblesCleared=false;delete s.zaZone19BramblesClearedAt;return true;
}
