import {NOUVEAU_ARRIVAL,nouveauCafeUnlocked} from './adventure-nouveau-cafe.mjs';
import {resetZone8Burrows} from './adventure-zone8.mjs';
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
 {id:'hibernal',name:'이베르날',district:'lumiose-mission33-alley',x:5,y:3},
 {id:'rouge-plaza',name:'루주 광장',district:'lumiose-zone3',x:11,y:2},
]);
export function centerAt(s,spot){return s?.area===3&&!s.interior&&!s.expedition&&spot?.tile==='H'?FAST_TRAVEL_CENTERS.find(c=>c.district===s.district&&c.x===spot.x&&c.y===spot.y&&(!c.zaRougeStreetSouth||s.zaRougeStreetSouth===true))||null:null;}
export function registeredCenters(s){const seen=new Set(Array.isArray(s?.zaFastTravelCenters)?s.zaFastTravelCenters.filter(x=>typeof x==='string'):[]);return FAST_TRAVEL_CENTERS.filter(c=>seen.has(c.id));}
export function recordCenter(s,spot){const center=centerAt(s,spot);if(!center)return false;const ids=Array.isArray(s.zaFastTravelCenters)?s.zaFastTravelCenters:[];if(ids.includes(center.id))return false;s.zaFastTravelCenters=[...ids,center.id];return true;}
// The center entrance is represented by one tile in our draft maps. Reaching
// an adjacent tile counts as a visit too; verify the active layer's map first.
export function recordNearbyCenter(s,getMap){
 if(s?.area!==3||s.interior||s.expedition||!Number.isInteger(s.x)||!Number.isInteger(s.y))return false;
 const center=FAST_TRAVEL_CENTERS.find(c=>c.district===s.district&&Math.abs(c.x-s.x)+Math.abs(c.y-s.y)<=1&&centerAt(s,{...c,tile:'H'}));
 if(!center||registeredCenters(s).some(c=>c.id===center.id))return false;
 const map=getMap();return map?.[center.y]?.[center.x]==='H'&&recordCenter(s,{...center,tile:'H'});
}

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
export function recordZoneEntry(s,previousDistrict,tile,getMap){
 const m=/^lumiose-zone([1-9]|1[0-9]|20)$/.exec(s?.district||'');if(!m||s.district===previousDistrict||s.interior||s.area!==3||!['.',',',';','g'].includes(tile))return false;
 const n=Number(m[1]);if(!zoneTravelUnlocked(s,n)||(n===3&&s.zaZone3TowerUpper)||(n===5&&s.zaZone5Upper)||(n===6&&s.zaZone6Layer&&s.zaZone6Layer!=='ground')||(n===9&&s.zaZone9Upper)||(n===10&&(s.zaZone10Upper||s.zaZone10LowerBank))||(n===11&&s.zaZone11Upper)||(n===12&&s.zaZone12PondLower)||(n===15&&s.zaZone15Upper)||(n===16&&s.zaZone16Upper)||(n===17&&(s.zaZone17Upper||s.zaZone17Promenade))||(n===18&&(s.zaZone18Upper||s.zaZone18Construction))||(n===20&&s.zaMission42Underground))return false;
 if(!Number.isInteger(s.x)||!Number.isInteger(s.y)||s.x<1||s.x>21||s.y<1||s.y>15)return false;
 const saved=s.zaFastTravelZones&&typeof s.zaFastTravelZones==='object'&&!Array.isArray(s.zaFastTravelZones)?s.zaFastTravelZones:{};
 if(saved[n]){
  // Repair only on a genuine ground re-entry, and only for a definite wall or
  // water tile. An encounter or a temporary obstacle must not move the marker.
  if(!previousDistrict||typeof getMap!=='function')return false;
  const p=saved[n];if(!Number.isInteger(p?.x)||!Number.isInteger(p?.y))return false;
  const map=getMap(),oldTile=map?.[p.y]?.[p.x];if(oldTile!=='#'&&oldTile!=='~')return false;
 }
 s.zaFastTravelZones={...saved,[n]:{x:s.x,y:s.y}};return true;
}
export function mapTravelDestinations(s){
 const centers=registeredCenters(s).map(c=>({id:c.id,name:`${c.name} 포켓몬센터`,kind:'center'}));
 if(s?.zaBleuSewerOpened===true&&s?.zaBleuSewerVisited===true&&s?.zaMission19Complete===true)centers.push({id:'bleu-sewer',name:'블루 구역 하수도 입구',kind:'sewer'});
 for(const place of registeredLandmarks(s))centers.push({id:place.id,name:place.name,kind:'landmark'});
 const zones=s?.zaFastTravelZones&&typeof s.zaFastTravelZones==='object'&&!Array.isArray(s.zaFastTravelZones)?s.zaFastTravelZones:{};
 for(let n=1;n<=20;n++){const p=zones[n];if(p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<=21&&p.y>=1&&p.y<=15&&zoneTravelUnlocked(s,n))centers.push({id:`zone${n}`,name:`야생 구역 ${n}`,kind:'zone'});}
 return centers;
}
export function canMapTravel(s){
 if(!fastTravelEnabled(s)||s.area!==3||s.interior||s.expedition||s.unionHost||s.combat||s.adventureCatchWindow||s.zaSushiRun||s.zaLeWowRun||s.zaWildAlphaAlert===true||(Array.isArray(s.adventurePendingMoves)&&s.adventurePendingMoves.length))return false;
 const mission33Center=s.district==='lumiose-mission33-alley'&&s.x===5&&s.y===3;
 const sewerEntrance=s.district==='lumiose-sewer'&&s.zaBleuSewerVisited===true&&s.zaBleuSewerOpened===true&&s.zaMission19Complete===true&&s.zaSewerReturn==='bleu3'&&!s.zaMission19Inner&&!s.zaSewerIceBranch&&s.x===11&&s.y===15;
 const currentZone=Number((/^lumiose-zone(\d+)$/.exec(s.district||'')||[])[1]);
 if((currentZone===20&&s.zaMission42Underground)||(currentZone===3&&s.zaZone3TowerUpper)||(currentZone===5&&s.zaZone5Upper)||(currentZone===6&&s.zaZone6Layer&&s.zaZone6Layer!=='ground')||(currentZone===9&&s.zaZone9Upper)||(currentZone===10&&(s.zaZone10Upper||s.zaZone10LowerBank))||(currentZone===11&&s.zaZone11Upper)||(currentZone===12&&s.zaZone12PondLower)||(currentZone===15&&s.zaZone15Upper)||(currentZone===16&&s.zaZone16Upper)||(currentZone===17&&(s.zaZone17Upper||s.zaZone17Promenade))||(currentZone===18&&(s.zaZone18Upper||s.zaZone18Construction)))return false;
 if((s.district==='lumiose-bleu-sector7'&&s.zaBleu7Upper)||(s.district==='lumiose-coulant-route'&&s.zaCoulantLower)||(s.district==='lumiose-vernal'&&(s.zaVernalSlowbroBank||s.zaVernalEastRoof))||(s.district==='lumiose-vert2'&&s.zaVert2RoofUpper)||(s.district==='lumiose-aymlis-park'&&s.zaMission11ParkLower)||(s.district==='lumiose-vert-sector6'&&s.zaVertSaisonBank)||(s.district==='lumiose-magenta-sector9'&&s.zaMagenta9Upper)||(s.district==='lumiose-vert-sector4'&&['roof','courtyard'].includes(s.zaVert4Layer))||(s.district==='lumiose-espace-vide'&&s.zaEspaceLower))return false;
 if((s.district==='lumiose-south-boulevard'&&s.zaVert7RoofUpper)||!s.district?.startsWith('lumiose')||s.district==='lumiose-royale'||(s.district==='lumiose-zone20'&&s.zaMission42Complete!==true)||(s.district==='lumiose-sewer'&&!sewerEntrance)||s.district==='lumiose-crystal-sewer'||s.district==='lumiose-lysandre-lab'||(s.district.includes('mission')&&!mission33Center)||s.district.includes('roof')||s.district.includes('scaffold')||s.district.endsWith('-drain')||s.district.includes('-sw-')||s.district==='lumiose-research-zone'||s.district==='lumiose-protect'||(s.district==='lumiose-rooftop'&&s.zaRooftopIntroduced&&!s.zaRooftopTraversed)||[1,2,3].includes(s.zaMission09Chase))return false;
 return true;
}
export const TAXI_CENTER_IDS=['hotel','centrico','jaune','rose-plaza','rose','bleu','vert','hibernal'];
export function rougeTaxiUnlocked(s){return s?.zaMission30Started===true||s?.zaMission30Complete===true||['B','A'].includes(s?.zaRoyaleRank);}
export function taxiAvailable(s,spot){if(!fastTravelEnabled(s)||s?.area!==3||s.interior||s.expedition||s.unionHost||s.combat||(s.district==='lumiose-south-boulevard'&&s.zaVert7RoofUpper)||spot?.tile!=='n')return false;return (s.district==='lumiose-south-boulevard'&&spot.x===14&&spot.y===6)||(s.district==='lumiose-centrico-route'&&[0,22].includes(spot.x)&&[7,9].includes(spot.y))||(s.district==='lumiose-zone3'&&!s.zaZone3TowerUpper&&spot.x===0&&spot.y===5&&rougeTaxiUnlocked(s));}
// Match ordinary zone exit's temporary-encounter cleanup; persistent rewards remain.
export function clearMapTravelTransient(s){
 delete s.zaZone5DrainLanding;delete s.zaZone5RoofLadderRoute;
 const n=Number((/^lumiose-zone(\d+)$/.exec(s.district||'')||[])[1]);
 if(n===8)resetZone8Burrows(s);
 const keys={2:['zaZone2Budew','zaZone2KakunaSpent','zaZone2FieldSpent','zaZone2FieldPositions','zaZone2AlphaSpent'],3:['zaZone3FieldPositions','zaZone3FieldSpent'],5:['zaZone5Spent'],6:['zaZone6Spent','zaZone6Layer'],8:['zaZone8Spent'],9:['zaZone9Spent','zaZone9Upper'],10:['zaZone10Spent','zaZone10Upper','zaZone10LowerBank'],11:['zaZone11Spent','zaZone11Upper'],12:['zaZone12Spent','zaZone12PondLower'],13:['zaZone13Spent','zaZone13Period'],14:['zaZone14Spent','zaZone14Period'],15:['zaZone15Spent','zaZone15Period','zaZone15Upper','zaZone15LiftReturn'],16:['zaZone16Spent','zaZone16Upper'],17:['zaZone17Spent','zaZone17Upper','zaZone17Promenade'],18:['zaZone18Spent','zaZone18Period','zaZone18Upper','zaZone18LadderReturn','zaZone18Construction'],19:['zaZone19Spent','zaZone19Period'],20:['zaZone20Spent','zaZone20AlphaSpecies','zaZone20AlphaSpecies2']};for(const key of keys[n]||[])delete s[key];if(n===4)s.zaZone4AlphaSpent=false;if(n===7)s.zaZone7AlphaSpent=false;
}

// Confirmed taxi destinations, represented at existing draft 2D entrances.
// https://bulbapedia.bulbagarden.net/wiki/Lumi_Cab
export const FAST_TRAVEL_LANDMARKS=Object.freeze([
 {id:'plaza-centrico',name:'센트리코 광장',district:'lumiose-centrico-route',x:11,y:8,facing:'down'},
 {id:'plaza-vert',name:'베르 광장',district:'lumiose-vert-plaza',x:11,y:8,facing:'down'},
 {id:'plaza-bleu',name:'블르 광장',district:'lumiose-bleu-plaza-route',x:11,y:8,facing:'down'},
 {id:'plaza-jaune',name:'존느 광장 부근',district:'lumiose-jaune-street',x:11,y:1,facing:'up'},
 {id:'plaza-magenta',name:'마젠타 광장 부근',district:'lumiose-magenta-sector4',x:11,y:15,facing:'down'},
 {id:'plaza-rouge',name:'루주 광장',district:'lumiose-zone3',x:11,y:1,facing:'down',requiresMission05:true},
 {id:'cafe-woof',name:'뚜뚜 카페',district:'lumiose-vernal',x:12,y:6,facing:'up'},
 {id:'cafe-gallant',name:'사나이 카페',district:'lumiose-magenta-sector1',x:17,y:7,facing:'up'},
 {id:'cafe-action',name:'리테이크 카페',district:'lumiose-jaune-sector8',x:18,y:7,facing:'up'},
 {id:'cafe-nouveau2',name:'누보 카페 2호',district:'lumiose-bleu-cafe2',x:4,y:11,facing:'down'},
 {id:'cafe-nouveau',name:'누보 카페',district:'lumiose-centrico-route',...NOUVEAU_ARRIVAL,requiresNouveau:true},
 {id:'cafe-bataille',name:'카페 바타유',district:'lumiose-zone6',x:19,y:3,facing:'left',requiresMission06:true},
 {id:'cafe-ultimo',name:'카페 울티모',district:'lumiose-zone15',x:1,y:6,facing:'left',requiresZone15:true},
 {id:'cafe-shutterbug',name:'셔터버그 카페',district:'lumiose-south-boulevard',x:12,y:6,facing:'up'},
 {id:'cafe-soleil',name:'카페 솔레이유',district:'lumiose-south-boulevard',x:17,y:6,facing:'up'},
 {id:'museum',name:'미르미술관',district:'lumiose-museum-front',x:11,y:7,facing:'up'},
 {id:'gare',name:'미르역',district:'lumiose-vert-street-route',x:8,y:6,facing:'up'},
 {id:'hotel-z',name:'호텔 Z',district:'lumiose',x:11,y:6,facing:'up'},
 {id:'research-lab',name:'포켓몬 연구소',district:'lumiose-floral',x:5,y:6,facing:'up'},
 {id:'richissime',name:'호텔 리시심',district:'lumiose-centrico-route',x:16,y:5,facing:'left'},
 {id:'le-wow',name:'레스토랑 르 와우',district:'lumiose-rouge-sector2',x:5,y:6,facing:'up'},
 {id:'le-nah',name:'레스토랑 르 나',district:'lumiose-vert-sector6',x:14,y:12,facing:'right'},
 {id:'sushi',name:'스시 하이 롤러',district:'lumiose-rouge-north',x:18,y:4,facing:'right'},
 {id:'quasartico',name:'콰자르티코',district:'lumiose-quasartico',x:11,y:7,facing:'up',requiresMission10:true},
]);
export function landmarkUnlocked(s,p){if(p.requiresNouveau&&!nouveauCafeUnlocked(s))return false;if(p.requiresMission05&&!(s?.zaMission05Complete||s?.zaMission06Started||/^[A-X]$/.test(s?.zaRoyaleRank||'')))return false;if(p.requiresMission06&&!(s?.zaMission06Started===true||/^[A-X]$/.test(s?.zaRoyaleRank||'')))return false;if(p.requiresZone15&&!zone14Unlocked(s))return false;return !p.requiresMission10||Number(s?.zaMission10Stage)>=6||s?.zaMission10Complete===true||['F','E','D','C','B','A'].includes(s?.zaRoyaleRank);}
export function registeredLandmarks(s){const ids=new Set(Array.isArray(s?.zaFastTravelLandmarks)?s.zaFastTravelLandmarks.filter(x=>typeof x==='string'):[]);return FAST_TRAVEL_LANDMARKS.filter(p=>ids.has(p.id)&&landmarkUnlocked(s,p));}
// Landmark coordinates refer to ground-level draft maps. Other layers can
// reuse the same x/y without ever reaching the landmark.
function landmarkGroundLayer(s){
 if(s.district==='lumiose-south-boulevard'&&s.zaVert7RoofUpper===true)return false;
 if(s.district==='lumiose-vernal'&&(s.zaVernalSlowbroBank===true||s.zaVernalEastRoof===true))return false;
 if(s.district==='lumiose-zone3'&&s.zaZone3TowerUpper===true)return false;
 if(s.district==='lumiose-zone6'&&s.zaZone6Layer&&s.zaZone6Layer!=='ground')return false;
 if(s.district==='lumiose-zone15'&&s.zaZone15Upper===true)return false;
 return true;
}
export function recordLandmarks(s){
 if(s?.area!==3||s.interior||s.expedition||!landmarkGroundLayer(s))return false;
 const nearby=FAST_TRAVEL_LANDMARKS.filter(p=>p.district===s.district&&landmarkUnlocked(s,p)&&(!('zaRougeStreetSouth' in s)||p.district!=='lumiose-rouge-north'||s.zaRougeStreetSouth!==true)&&(Math.abs(s.x-p.x)+Math.abs(s.y-p.y)<=1||(p.id==='cafe-ultimo'&&Math.abs(s.x-17)+Math.abs(s.y-7)<=1)));
 if(!nearby.length)return false;const ids=Array.isArray(s.zaFastTravelLandmarks)?s.zaFastTravelLandmarks.filter(x=>typeof x==='string'):[];let changed=false;for(const p of nearby)if(!ids.includes(p.id)){ids.push(p.id);changed=true;}if(changed)s.zaFastTravelLandmarks=ids;return changed;
}
export function taxiDestinations(s){return [...FAST_TRAVEL_CENTERS.filter(c=>TAXI_CENTER_IDS.includes(c.id)),...FAST_TRAVEL_LANDMARKS.filter(p=>landmarkUnlocked(s,p))];}

// Resolve destinations to the existing ground layer, not a stale layer flag.
export function groundDestinationFlags(district){
 return ({'lumiose-south-boulevard':{zaVert7RoofUpper:false},'lumiose-bleu-sector7':{zaBleu7Upper:false},'lumiose-vert-sector6':{zaVertSaisonBank:false},'lumiose-aymlis-park':{zaMission11ParkLower:false},'lumiose-zone3':{zaZone3TowerUpper:false},'lumiose-zone6':{zaZone6Layer:'ground'},'lumiose-zone10':{zaZone10Upper:false,zaZone10LowerBank:false},'lumiose-zone11':{zaZone11Upper:false},'lumiose-zone15':{zaZone15Upper:false},'lumiose-vernal':{zaVernalSlowbroBank:false,zaVernalEastRoof:false}})[district]||{};
}
