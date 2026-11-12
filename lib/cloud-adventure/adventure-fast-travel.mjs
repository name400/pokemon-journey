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

// The original map also lists visited wild zones. These are screen-entry
// coordinates from this game's 2D drafts, not the original 3D coordinates.
import {zone7Unlocked} from './adventure-zone7.mjs';
import {zone11Unlocked} from './adventure-zone11.mjs';
import {zone14Unlocked} from './adventure-zone14.mjs';
import {zone16Unlocked} from './adventure-zone16.mjs';
import {zone17Unlocked} from './adventure-zone17.mjs';
import {zone18Unlocked} from './adventure-zone18.mjs';
import {zone19Unlocked} from './adventure-zone19.mjs';
export function fastTravelEnabled(s){return s?.zaMission04Complete===true||Number(s?.zaMission05Stage)>=1||s?.zaMission05Complete===true||s?.zaMission06Started===true||/^[A-Y]$/.test(s?.zaRoyaleRank||'');}
export function zoneTravelUnlocked(s,n){if(n>=1&&n<=6)return true;if(n<=10)return zone7Unlocked(s);if(n<=13)return zone11Unlocked(s);if(n<=15)return zone14Unlocked(s);if(n===16)return zone16Unlocked(s);if(n===17)return zone17Unlocked(s);if(n===18)return zone18Unlocked(s);if(n===19)return zone19Unlocked(s);if(n===20)return s?.zaMission42Complete===true;return false;}
export function recordZoneEntry(s,previousDistrict,tile){
 const m=/^lumiose-zone([1-9]|1[0-9]|20)$/.exec(s?.district||'');if(!m||s.district===previousDistrict||s.interior||s.area!==3||!['.',',',';','g'].includes(tile))return false;
 const n=Number(m[1]);if(!zoneTravelUnlocked(s,n)||(n===3&&s.zaZone3TowerUpper)||(n===5&&s.zaZone5Upper)||(n===6&&s.zaZone6Layer&&s.zaZone6Layer!=='ground')||(n===9&&s.zaZone9Upper)||(n===10&&s.zaZone10Upper)||(n===12&&s.zaZone12PondLower)||(n===15&&s.zaZone15Upper)||(n===16&&s.zaZone16Upper)||(n===17&&(s.zaZone17Upper||s.zaZone17Promenade))||(n===18&&(s.zaZone18Upper||s.zaZone18Construction)))return false;
 if(!Number.isInteger(s.x)||!Number.isInteger(s.y)||s.x<1||s.x>21||s.y<1||s.y>15)return false;
 const saved=s.zaFastTravelZones&&typeof s.zaFastTravelZones==='object'&&!Array.isArray(s.zaFastTravelZones)?s.zaFastTravelZones:{};if(saved[n])return false;s.zaFastTravelZones={...saved,[n]:{x:s.x,y:s.y}};return true;
}
export function mapTravelDestinations(s){
 const centers=registeredCenters(s).map(c=>({id:c.id,name:`${c.name} 포켓몬센터`,kind:'center'}));
 const zones=s?.zaFastTravelZones&&typeof s.zaFastTravelZones==='object'&&!Array.isArray(s.zaFastTravelZones)?s.zaFastTravelZones:{};
 for(let n=1;n<=20;n++){const p=zones[n];if(p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<=21&&p.y>=1&&p.y<=15&&zoneTravelUnlocked(s,n))centers.push({id:`zone${n}`,name:`야생 구역 ${n}`,kind:'zone'});}
 return centers;
}
export function canMapTravel(s){
 if(!fastTravelEnabled(s)||s.area!==3||s.interior||s.expedition||s.unionHost||s.combat||s.adventureCatchWindow||s.zaSushiRun||s.zaLeWowRun||s.zaWildAlphaAlert===true||(Array.isArray(s.adventurePendingMoves)&&s.adventurePendingMoves.length))return false;
 const currentZone=Number((/^lumiose-zone(\d+)$/.exec(s.district||'')||[])[1]);
 if((currentZone===3&&s.zaZone3TowerUpper)||(currentZone===5&&s.zaZone5Upper)||(currentZone===6&&s.zaZone6Layer&&s.zaZone6Layer!=='ground')||(currentZone===9&&s.zaZone9Upper)||(currentZone===10&&s.zaZone10Upper)||(currentZone===12&&s.zaZone12PondLower)||(currentZone===15&&s.zaZone15Upper)||(currentZone===16&&s.zaZone16Upper)||(currentZone===17&&(s.zaZone17Upper||s.zaZone17Promenade))||(currentZone===18&&(s.zaZone18Upper||s.zaZone18Construction)))return false;
 if(!s.district?.startsWith('lumiose')||s.district==='lumiose-royale'||(s.district==='lumiose-zone20'&&s.zaMission42Complete!==true)||s.district==='lumiose-sewer'||s.district==='lumiose-crystal-sewer'||s.district==='lumiose-lysandre-lab'||s.district.includes('mission')||s.district.includes('roof')||s.district.includes('scaffold')||s.district.endsWith('-drain')||s.district.includes('-sw-')||s.district==='lumiose-research-zone'||s.district==='lumiose-protect'||(s.district==='lumiose-rooftop'&&s.zaRooftopIntroduced&&!s.zaRooftopTraversed)||[1,2,3].includes(s.zaMission09Chase))return false;
 return true;
}
export const TAXI_CENTER_IDS=['hotel','centrico','jaune','rose-plaza','rose','bleu','vert'];
export function taxiAvailable(s,spot){return fastTravelEnabled(s)&&s?.area===3&&!s.interior&&!s.expedition&&!s.unionHost&&!s.combat&&!s.zaVert7RoofUpper&&s.district==='lumiose-south-boulevard'&&spot?.tile==='n'&&spot.x===14&&spot.y===6;}
// Match ordinary zone exit's temporary-encounter cleanup; persistent rewards remain.
export function clearMapTravelTransient(s){
 const n=Number((/^lumiose-zone(\d+)$/.exec(s.district||'')||[])[1]);
 const keys={2:['zaZone2Budew','zaZone2KakunaSpent','zaZone2FieldSpent','zaZone2FieldPositions','zaZone2AlphaSpent'],3:['zaZone3FieldPositions','zaZone3FieldSpent'],5:['zaZone5Spent'],6:['zaZone6Spent','zaZone6Layer'],8:['zaZone8Spent'],9:['zaZone9Spent','zaZone9Upper'],10:['zaZone10Spent','zaZone10Upper'],11:['zaZone11Spent'],12:['zaZone12Spent','zaZone12PondLower'],13:['zaZone13Spent','zaZone13Period'],14:['zaZone14Spent','zaZone14Period'],15:['zaZone15Spent','zaZone15Period','zaZone15Upper','zaZone15LiftReturn'],16:['zaZone16Spent','zaZone16Upper'],17:['zaZone17Spent','zaZone17Upper','zaZone17Promenade'],18:['zaZone18Spent','zaZone18Period','zaZone18Upper','zaZone18LadderReturn','zaZone18Construction'],19:['zaZone19Spent','zaZone19Period'],20:['zaZone20Spent','zaZone20AlphaSpecies','zaZone20AlphaSpecies2']};for(const key of keys[n]||[])delete s[key];if(n===4)s.zaZone4AlphaSpent=false;if(n===7)s.zaZone7AlphaSpent=false;
}
