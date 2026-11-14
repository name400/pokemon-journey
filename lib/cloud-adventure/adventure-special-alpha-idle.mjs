import {knownVisibleWildLedger} from './adventure-visible-wild.mjs';
import {zone1RoofAlphaReady,zone2IslandAlphaReady} from './adventure-world.mjs';
import {earlyAlphaUnlocked} from './adventure-early-alpha.mjs';
import {adventureGameTime,adventureClockOffset} from './adventure-clock.mjs';
import {zone5PlayerThreat,zone5PlayerNear,zone5PlayerAlertKnown} from './adventure-zone5.mjs';
import {zone6PlayerThreat,zone6PlayerNear,zone6PlayerAlertKnown} from './adventure-zone6.mjs';
import {zone8PlayerThreat,zone8PlayerNear,zone8PlayerAlertKnown} from './adventure-zone8.mjs';
import {zone9PlayerThreat,zone9PlayerNear,zone9PlayerAlertKnown} from './adventure-zone9.mjs';
import {zone10PlayerThreat,zone10PlayerNear,zone10PlayerAlertKnown} from './adventure-zone10.mjs';

// Reuse existing alert, layer and distance rules; do not infer unknown ledgers.
const configs={
 'lumiose-zone5': ['zaZone5AlphaRoarAlertV1','zaZone5Spent',zone5PlayerThreat,zone5PlayerNear,zone5PlayerAlertKnown],
 'lumiose-zone5-drain': ['zaZone5AlphaRoarAlertV1','zaZone5Spent',zone5PlayerThreat,zone5PlayerNear,zone5PlayerAlertKnown],
 'lumiose-zone6': ['zaZone6AlphaRoarAlertV1','zaZone6Spent',zone6PlayerThreat,zone6PlayerNear,zone6PlayerAlertKnown],
 'lumiose-zone8': ['zaZone8AlphaRoarAlertV1','zaZone8Spent',zone8PlayerThreat,zone8PlayerNear,zone8PlayerAlertKnown],
 'lumiose-zone9': ['zaZone9AlphaRoarAlertV1','zaZone9Spent',zone9PlayerThreat,zone9PlayerNear,zone9PlayerAlertKnown],
 'lumiose-zone10':['zaZone10AlphaRoarAlertV1','zaZone10Spent',zone10PlayerThreat,zone10PlayerNear,zone10PlayerAlertKnown],
};
export function specialAlphaIdleThreat(s){
 if(s?.area===3&&!s.interior&&Number.isInteger(s.x)&&Number.isInteger(s.y)){
  const nearby=(x,y)=>Math.abs(s.x-x)+Math.abs(s.y-y)<=1&&(s.zaFieldCrouched!==true||s.x===x&&s.y===y);
  if(s.district==='lumiose-zone1-roof'&&s.zaZone1RoofRoarAlert===true&&(s.zaZone1RoofAlphaSpent===undefined||typeof s.zaZone1RoofAlphaSpent==='boolean')&&zone1RoofAlphaReady(s)&&nearby(18,5))return {id:'zone1-roof-pidgey',name:'구구',alertField:'zaZone1RoofRoarAlert',alertKey:'zone1-roof-pidgey',damage:30};
  if(s.district==='lumiose-zone2'&&s.zaZone2RockCleared===true&&(s.zaZone2AlphaSpent===undefined||typeof s.zaZone2AlphaSpent==='boolean')&&zone2IslandAlphaReady(s)&&nearby(20,11)){
   const species=adventureGameTime(undefined,adventureClockOffset(s)).period==='night'?'staryu':'magikarp';
   if(s.zaZone2IslandRoarAlert===species)return {id:species,name:species==='magikarp'?'잉어킹':'별가사리',alertField:'zaZone2IslandRoarAlert',alertKey:`zone2-island:${species}`,damage:species==='magikarp'?52:67};
  }
  if(s.district==='lumiose-rouge-tower-interior'&&s.zaZone3LitleoAwakeV1===true&&s.zaZone3LitleoRoarAlertV1===true&&(s.zaZone3LitleoSpent===undefined||typeof s.zaZone3LitleoSpent==='boolean')&&s.zaZone3LitleoSpent!==true&&earlyAlphaUnlocked(s)&&nearby(9,8))return {id:'tower-litleo',name:'레오꼬',alertField:'zaZone3LitleoRoarAlertV1',alertKey:'zone3-tower-litleo',damage:30};
 }
 const c=configs[s?.district];if(!c||typeof s[c[0]]!=='string'||!knownVisibleWildLedger(s[c[1]])||!c[4](s))return null;
 if(s.district.startsWith('lumiose-zone5')&&['zaZone5Upper','zaZone5DrainLanding'].some(k=>s[k]!==undefined&&typeof s[k]!=='boolean'))return null;
 const p=c[2](s);if(!p||s[c[0]]!==p.id||!c[3](s,p))return null;
 return {...p,alertField:c[0],alertKey:JSON.stringify([s.district,p.id])};
}
