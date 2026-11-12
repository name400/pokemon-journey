// Registered centers use the existing draft maps. Coordinates are not official.
// https://www.nintendo.com/us/whatsnew/12-tips-and-tricks-for-pokemon-legends-z-a/
export const FAST_TRAVEL_CENTERS=Object.freeze([
 {id:'hotel',name:'호텔 Z 앞',district:'lumiose',x:3,y:5},
 {id:'centrico',name:'센트리코',district:'lumiose-rouge-north',x:15,y:11,zaRougeStreetSouth:true},
 {id:'printemps',name:'프랭탕',district:'lumiose-aymlis-park',x:20,y:3},
 {id:'jaune',name:'존느',district:'lumiose-jaune-sector8',x:5,y:6},
 {id:'rose-plaza',name:'로즈 광장',district:'lumiose-magenta-sector1',x:4,y:5},
 {id:'rose',name:'로즈',district:'lumiose-magenta-sector8-route',x:12,y:14},
 {id:'bleu',name:'블르',district:'lumiose-bleu-sector7',x:11,y:13},
 {id:'vert',name:'베르',district:'lumiose-vert-street-route',x:10,y:13},
 {id:'rouge-plaza',name:'루주 광장',district:'lumiose-zone3',x:11,y:2},
]);
export function centerAt(s,spot){return s?.area===3&&!s.interior&&!s.expedition&&spot?.tile==='H'?FAST_TRAVEL_CENTERS.find(c=>c.district===s.district&&c.x===spot.x&&c.y===spot.y&&(!c.zaRougeStreetSouth||s.zaRougeStreetSouth===true))||null:null;}
export function registeredCenters(s){const seen=new Set(Array.isArray(s?.zaFastTravelCenters)?s.zaFastTravelCenters.filter(x=>typeof x==='string'):[]);return FAST_TRAVEL_CENTERS.filter(c=>seen.has(c.id));}
export function recordCenter(s,spot){const center=centerAt(s,spot);if(!center)return false;const ids=registeredCenters(s).map(c=>c.id);if(ids.includes(center.id))return false;s.zaFastTravelCenters=[...ids,center.id];return true;}
