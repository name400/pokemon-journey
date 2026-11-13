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
 const shifted=time+adventureClockOffset(s,time)*50000,phase=((shifted%1200000)+1200000)%1200000;
 // During daytime show the upcoming night, at midnight retain the current one.
 return Math.floor((shifted-20*50000)/1200000)+(phase>=4*50000&&phase<20*50000?1:0);
}
export function activeRoyaleZones(s,now=Date.now()){
 const i=((royaleNightIndex(s,now)%ROYALE_ZONES.length)+ROYALE_ZONES.length)%ROYALE_ZONES.length;
 const count=s?.zaRoyaleRank==='A'&&s?.zaMission39Started===true?3:1;
 return Array.from({length:count},(_,n)=>ROYALE_ZONES[(i+n)%ROYALE_ZONES.length]);
}

// One provisional ground-level entrance per documented battle-zone region.
// These coordinates are project-map approximations, not original gate positions.
export const ROYALE_FIELD_ENTRIES=[
 {zone:'vert12',district:'lumiose-vert-sector1'},
 {zone:'vert58',district:'lumiose-vert-sector8'},
 {zone:'vert6',district:'lumiose-vert-sector6'},
 {zone:'bleu57',district:'lumiose-bleu-sector5'},
 {zone:'bleu4-magenta3',district:'lumiose-bleu-sector4'},
 {zone:'magenta47',district:'lumiose-magenta-sector4'},
 {zone:'rouge34',district:'lumiose-rouge-sector3'},
 {zone:'rouge68',district:'lumiose-rouge-sector8'},
 {zone:'jaune345',district:'lumiose-mission12-jaune3'},
 {zone:'jaune911',district:'lumiose-jaune-sector9'},
].map(e=>({...e,x:2,y:2,returnX:2,returnY:3}));
export function royaleFieldEntry(s){
 if(!s?.zaRoyaleRank||s.interior)return null;
 if(s.district==='lumiose-mission12-jaune3'&&(s.zaMission12Layer||'ground')!=='ground')return null;
 return ROYALE_FIELD_ENTRIES.find(e=>e.district===s.district)||null;
}
export function royaleFieldEntryAt(s,spot){
 const e=royaleFieldEntry(s);
 return e&&spot?.tile==='T'&&spot.x===e.x&&spot.y===e.y?e:null;
}
export function royaleReturnDestination(s){
 if(s?.zaRoyaleReturn==='magenta6')return {district:'lumiose-magenta6-court-alley',x:13,y:11};
 const e=ROYALE_FIELD_ENTRIES.find(e=>e.zone===s?.zaRoyaleReturn);
 return e?{district:e.district,x:e.returnX,y:e.returnY}:null;
}
