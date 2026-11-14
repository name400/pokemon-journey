import {findVisibleWild} from './adventure-visible-wild.mjs';
import {obstacleClock,canRefreshTimedObstacle} from './adventure-obstacle-clock.mjs';

// Electrical substation yard: north access, buildings, sandy areas and central
// equipment are sourced; exact coordinates and the city connector are draft.
import {afterMission19} from './adventure-zone-milestones.mjs';
export function zone14Unlocked(s){return afterMission19(s)||['D','C','B','A'].includes(s?.zaRoyaleRank)||Number(s?.zaMission19Stage)>=16;}
export const ZONE14_VISIBLE=[
 {id:'aron',tile:'a',species:304,level:30,name:'가보리',x:11,y:3},
 {id:'lairon',tile:'b',species:305,level:39,name:'갱도라',x:4,y:4},
 {id:'emolga',tile:'c',species:587,level:37,name:'에몽가',x:6,y:4},
 {id:'drilbur',tile:'d',species:529,level:30,name:'두더류',x:10,y:9},
 {id:'excadrill',tile:'e',species:530,level:39,name:'몰드류',x:12,y:9},
 {id:'onix',tile:'f',species:95,level:38,name:'롱스톤',x:14,y:12},
 {id:'excadrill-alpha',tile:'h',species:530,level:48,name:'몰드류',x:11,y:7,alpha:true},
 {id:'helioptile',tile:'v',species:694,level:37,name:'목도리키텔',x:14,y:3,sunnyDay:true},
];
export function zone14Visible(s,tile){
 const p=findVisibleWild(s,ZONE14_VISIBLE,p=>p.tile===tile&&(!p.sunnyDay||zone14SunnyDay(s))&&!s.zaZone14Spent?.[p.id]);if(!p)return null;
 const level=s.zaWildVisibleAlphaLevels?.[`zone14:${p.id}:${p.species}`];
 return !p.alpha&&Number.isInteger(level)&&level>=1&&level<=100?{...p,alpha:true,level}:p;
}
// Empty weather is the current adventure engine's clear-weather value.
export function zone14SunnyDay(s){return s.zaZone14Period==='day'&&s.weather==='';}
export const ZONE14_ITEMS=[{id:'south-ultra',tile:'i',x:14,y:14,name:'하이퍼볼',kind:'ultraball'},{id:'south-luxury',tile:'j',x:10,y:14,name:'럭셔리볼',kind:'luxuryball'},{id:'rock-mastery',tile:'k',x:18,y:10,name:'숙달의씨',kind:'seedofmasteryza'},{id:'rock-tm039',tile:'l',x:18,y:11,name:'기술머신 039 방전',kind:'za-tm039'},{id:'northeast-calcium',tile:'m',x:18,y:1,name:'리보플라빈',kind:'calcium'},{id:'northeast-nugget',tile:'n',x:19,y:1,name:'금구슬',kind:'nugget'}];
export function zone14Item(s,tile){return ZONE14_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone14Items)&&s.zaZone14Items.includes(p.id)))||null;}
// Breakable rocks guard both areas; their exact tile arrangement is draft.
// https://pokemongohub.net/post/guide/all-tm-locations-in-pokemon-legends-z-a/
export const ZONE14_NORTHEAST_ROCKS=[{x:16,y:1},{x:16,y:2},{x:16,y:3},{x:20,y:4},{x:21,y:4}];
export const ZONE14_ROCKS=[{x:16,y:9},{x:16,y:10},{x:16,y:11},...ZONE14_NORTHEAST_ROCKS];
export function zone14RockCleared(s,rock){return Array.isArray(s.zaZone14RocksCleared)?s.zaZone14RocksCleared.includes(`${rock.x},${rock.y}`):s.zaZone14RockCleared===true;}

// Ten game minutes, expressed in the existing adventure clock's 50-second hour.
// Only timed clears made by this version are restored; legacy openings stay open.
export const zone14RockClock=obstacleClock;
export function refreshZone14Rocks(s,now=Date.now()){
 if(!s||s.district==='lumiose-zone14'||s.interior||s.combat||s.encounter||s.adventureCatchWindow||!Number.isSafeInteger(now)||now<0||!Array.isArray(s.zaZone14RocksCleared))return false;
 const times=s.zaZone14RockClearedAt;if(!times||typeof times!=='object'||Array.isArray(times))return false;
 const expired=new Set();
 for(const rock of ZONE14_ROCKS){const key=`${rock.x},${rock.y}`,cleared=times[key];if(s.zaZone14RocksCleared.includes(key)&&canRefreshTimedObstacle(s,'lumiose-zone14',cleared,now))expired.add(key);}
 if(!expired.size)return false;
 s.zaZone14RocksCleared=s.zaZone14RocksCleared.filter(key=>!expired.has(key));const next={...times};for(const key of expired)delete next[key];s.zaZone14RockClearedAt=next;return true;
}

// Equipment is confirmed; footprints and positions are provisional.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_14
export const ZONE14_EQUIPMENT=[[3,10],[4,10],[5,10],[3,11],[4,11],[5,11],[19,2],[20,2]];
// Central converters are confirmed; their footprints are a 2D approximation.
export const ZONE14_CENTRAL_CONVERTERS=[[9,6],[10,6],[12,6],[13,6]];
export function zone14Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=6;y<=7;y++)for(let x=3;x<=6;x++)g[y][x]='#';
 for(let y=4;y<=6;y++)for(let x=16;x<=19;x++)g[y][x]='#';
 for(let y=8;y<=11;y++)for(let x=8;x<=14;x++)g[y][x]='g';
 for(let y=10;y<=12;y++)for(let x=15;x<=19;x++)g[y][x]='g';
 for(let x=9;x<=13;x++)g[6][x]=','; // equipment pad
 // Northern entrance faces Rose Avenue; pavement geometry is provisional.
 // Keep the existing encounters and blocked equipment unchanged.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_14
 for(let y=1;y<=5;y++)for(let x=10;x<=12;x++)if(g[y][x]==='.')g[y][x]=',';
 // Service walks connect the existing gates and building approaches; exact geometry is draft.
 const pave=(x,y)=>{if(g[y][x]==='.')g[y][x]=',';};
 // The broad paved yard narrows southward around the existing sandy habitat.
 // Only equivalent walkable ground is changed; legacy exits and every saved
 // obstacle/encounter remain in their previous coordinates.
 for(let y=1;y<=7;y++)for(let x=7;x<=15;x++)pave(x,y);
 for(let y=8;y<=14;y++)for(let x=6;x<=7;x++)pave(x,y);
 for(let y=8;y<=14;y++)for(let x=15;x<=16;x++)pave(x,y);
 for(let y=13;y<=15;y++)for(let x=7;x<=15;x++)pave(x,y);
 for(let x=1;x<=8;x++)pave(x,8);
 for(let y=8;y<=15;y++)pave(7,y);
 for(let x=7;x<=17;x++)pave(x,15);
 for(let y=7;y<=15;y++)pave(15,y);
 for(let x=7;x<=15;x++)pave(x,5);
 // A provisional enclosed route behind the southern building.
 for(let y=7;y<=13;y++)for(let x=16;x<=20;x++)if(y===7||y===13||x===16||x===20)g[y][x]='#';
 for(const [x,y] of [...ZONE14_EQUIPMENT,...ZONE14_CENTRAL_CONVERTERS])g[y][x]='^';
 for(const rock of ZONE14_ROCKS)g[rock.y][rock.x]=zone14RockCleared(s,rock)?'.':'r';
 g[0][11]='X';g[8][0]='X';g[16][11]='X';g[16][17]='X';for(const p of ZONE14_VISIBLE)if(zone14Visible(s,p.tile))g[p.y][p.x]=p.tile;for(const p of ZONE14_ITEMS)if(zone14Item(s,p.tile))g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
// Helioptile's sunny-day condition is not approximated as an unconditional spawn.
export function zone14Encounter(s,rng=Math.random){const pool=[[304,28,30],[305,38,39],[529,28,30],[95,37,39],[587,36,37]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}
