import {adventureClockOffset} from './adventure-clock.mjs';

// Locations and number of nightly zones: https://bulbapedia.bulbagarden.net/wiki/Battle_zone_(Lumiose_City)
// Deterministic rotation and ordering are provisional. One game hour is 50 seconds.
export const ROYALE_ZONES=[
 {id:'vert12',name:'베르 1·2번지'},
 {id:'vert58',name:'베르 5·8번지'},
 {id:'vert6',name:'베르 6번지'},
 {id:'bleu57',name:'블루 5·7번지'},
 {id:'bleu4-magenta3',name:'블루 4번지·마젠타 3번지'},
 {id:'magenta47',name:'마젠타 4·7번지'},
 {id:'magenta6',name:'마젠타 6번지'},
 {id:'rouge34',name:'루주 3·4번지'},
 {id:'rouge68',name:'루주 6·8번지'},
 {id:'jaune345',name:'존 3·4·5번지'},
 {id:'jaune911',name:'존 9·11번지'},
];
export function royaleNightIndex(s,now=Date.now()){
 const time=Number.isFinite(now)?now:0;
 const shifted=time+adventureClockOffset(s)*50000,phase=((shifted%1200000)+1200000)%1200000;
 // During daytime show the upcoming night, at midnight retain the current one.
 return Math.floor((shifted-18*50000)/1200000)+(phase>=6*50000&&phase<18*50000?1:0);
}
export function activeRoyaleZones(s,now=Date.now()){
 const i=((royaleNightIndex(s,now)%ROYALE_ZONES.length)+ROYALE_ZONES.length)%ROYALE_ZONES.length;
 const count=s?.zaRoyaleRank==='A'&&s?.zaMission39Started===true?3:1;
 return Array.from({length:count},(_,n)=>ROYALE_ZONES[(i+n)%ROYALE_ZONES.length]);
}
