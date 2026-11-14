import {knownVisibleWildLedger} from './adventure-visible-wild.mjs';
import {earlyAlphaUnlocked} from './adventure-early-alpha.mjs';
import {ZONE11_VISIBLE,zone11Visible} from './adventure-zone11.mjs';
import {ZONE12_VISIBLE,zone12Visible} from './adventure-zone12.mjs';
import {ZONE13_VISIBLE,zone13Visible} from './adventure-zone13.mjs';
import {ZONE14_VISIBLE,zone14Visible} from './adventure-zone14.mjs';
import {ZONE15_VISIBLE,zone15Visible} from './adventure-zone15.mjs';
import {ZONE16_VISIBLE,zone16Visible} from './adventure-zone16.mjs';
import {ZONE17_VISIBLE,zone17Visible} from './adventure-zone17.mjs';
import {ZONE18_VISIBLE,zone18Visible} from './adventure-zone18.mjs';
import {ZONE19_VISIBLE,zone19Visible} from './adventure-zone19.mjs';
import {ZONE20_ALPHA,zone20Visible} from './adventure-mission42.mjs';

// Only explicitly reviewed fixed alphas are eligible. Unknown ledgers and
// future alert formats remain untouched; old saves need no migration.
const zone4Spinarak={id:'spinarak-alpha',tile:'p',species:167,level:20,name:'페이검',x:4,y:10,alpha:true};
const zone7Fletchinder={id:'fletchinder-alpha',tile:'a',species:662,level:33,name:'불화살빈',x:11,y:8,alpha:true};
const flagKnown=value=>value===undefined||typeof value==='boolean';
const zones={
 'lumiose-zone4':{key:null,visible:[zone4Spinarak],lookup:(s,t)=>t==='p'&&earlyAlphaUnlocked(s)&&s.zaZone4AlphaSpent!==true?zone4Spinarak:null,ids:['spinarak-alpha'],valid:s=>flagKnown(s.zaZone4AlphaSpent)},
 'lumiose-zone7':{key:'zaZone7Spent',visible:[zone7Fletchinder],lookup:(s,t)=>t==='a'&&s.zaZone7AlphaSpent!==true?zone7Fletchinder:null,ids:['fletchinder-alpha'],valid:s=>flagKnown(s.zaZone7AlphaSpent)},
 'lumiose-zone11':{key:'zaZone11Spent',visible:ZONE11_VISIBLE,lookup:zone11Visible,ids:['slowbro-alpha','clawitzer-alpha'],valid:s=>s.zaZone11Upper===undefined||typeof s.zaZone11Upper==='boolean'},
 'lumiose-zone12':{key:'zaZone12Spent',visible:ZONE12_VISIBLE,lookup:zone12Visible,ids:['abomasnow-alpha','avalugg-alpha'],valid:s=>s.zaZone12PondLower===undefined||typeof s.zaZone12PondLower==='boolean',match:(s,p)=>s.zaZone12PondLower!==true||p.water===true},
 'lumiose-zone13':{key:'zaZone13Spent',visible:ZONE13_VISIBLE,lookup:zone13Visible,ids:['trevenant-alpha','weepinbell-alpha'],valid:s=>s.zaZone13Period===undefined||['day','night'].includes(s.zaZone13Period)},
 'lumiose-zone14':{key:'zaZone14Spent',visible:ZONE14_VISIBLE,lookup:zone14Visible,ids:['excadrill-alpha'],valid:()=>true},
 'lumiose-zone15':{key:'zaZone15Spent',visible:ZONE15_VISIBLE,lookup:zone15Visible,ids:['gourgeist-alpha','beedrill-alpha','banette-alpha'],valid:s=>(s.zaZone15Upper===undefined||typeof s.zaZone15Upper==='boolean')&&(s.zaZone15Period===undefined||['day','night'].includes(s.zaZone15Period))},
 'lumiose-zone16':{key:'zaZone16Spent',visible:ZONE16_VISIBLE,lookup:zone16Visible,ids:['ampharos-alpha'],valid:s=>s.zaZone16Upper===undefined||typeof s.zaZone16Upper==='boolean',match:s=>s.zaZone16Upper!==true},
 'lumiose-zone16-garden':{key:'zaZone16Spent',visible:ZONE16_VISIBLE,lookup:zone16Visible,ids:['ampharos-alpha'],valid:s=>s.zaZone16Upper===undefined||typeof s.zaZone16Upper==='boolean',match:s=>s.zaZone16Upper!==true},
 'lumiose-zone17':{key:'zaZone17Spent',visible:ZONE17_VISIBLE,lookup:zone17Visible,ids:['pyroar-alpha','mawile-alpha'],valid:s=>(s.zaZone17Upper===undefined||typeof s.zaZone17Upper==='boolean')&&(s.zaZone17Promenade===undefined||typeof s.zaZone17Promenade==='boolean')},
 'lumiose-zone18':{key:'zaZone18Spent',visible:ZONE18_VISIBLE,lookup:zone18Visible,ids:['lopunny-alpha','salamence-alpha'],valid:s=>['zaZone18Upper','zaZone18Construction','zaZone18Scaffold'].every(k=>s[k]===undefined||typeof s[k]==='boolean')},
 // Furfrou is documented sleeping; omit it until wake-up state is implemented.
 'lumiose-zone19':{key:'zaZone19Spent',visible:ZONE19_VISIBLE,lookup:zone19Visible,ids:['clefairy-alpha'],valid:s=>s.zaZone19Period===undefined||['day','night'].includes(s.zaZone19Period)},
 'lumiose-zone20':{key:'zaZone20Spent',visible:s=>['d','e'].map(tile=>zone20Visible(s,tile)).filter(Boolean),ids:['alpha','alpha2'],valid:s=>(s.zaMission42Underground===undefined||typeof s.zaMission42Underground==='boolean')&&s.zaMission42Underground!==true,dynamic:true},
};
const ids=new Set(Object.entries(zones).flatMap(([district,z])=>z.dynamic?z.ids.flatMap(id=>ZONE20_ALPHA.map(p=>`${district}:${id}:${p.species}`)):z.ids.map(id=>`${district}:${id}`)));
const validLedger=(s,z)=>!z.key||knownVisibleWildLedger(s?.[z.key]);
export function fixedAlphaAlertKnown(s){const alert=s?.zaFixedAlphaAlertV1,z=zones[s?.district];return (alert===undefined||typeof alert==='string'&&ids.has(alert))&&(!z||validLedger(s,z)&&z.valid(s));}
export function fixedAlphaPlayerThreat(s){
 const z=zones[s?.district];if(!z||s.area!==3||s.interior||!fixedAlphaAlertKnown(s)||!z.valid(s)||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const ledger=z.key?s[z.key]:undefined;
 const visible=typeof z.visible==='function'?z.visible(s):z.visible;
 return visible.filter(p=>z.ids.includes(p.id)&&p.alpha===true&&ledger?.[p.id]!==true&&!(s.x===p.x&&s.y===p.y)&&(!z.match||z.match(s,p))&&(z.dynamic||z.lookup(s,p.tile)===p)).map(p=>({...p,alertKey:`${s.district}:${p.id}${z.dynamic?`:${p.species}`:''}`})).sort((a,b)=>Math.abs(s.x-a.x)+Math.abs(s.y-a.y)-Math.abs(s.x-b.x)-Math.abs(s.y-b.y))[0]||null;
}
export function fixedAlphaPlayerNear(s,p=fixedAlphaPlayerThreat(s)){return !!p&&s.zaFieldCrouched!==true&&Math.abs(s.x-p.x)+Math.abs(s.y-p.y)<=2;}
// A legacy visit can materialize its second slot on the next server action.
// Do not predict through that unconfirmed slot before the server chooses it.
export function unknownZone20AlphaNear(s){return !!s&&s.area===3&&s.district==='lumiose-zone20'&&!s.interior&&s.zaMission42Underground!==true&&(s.zaMission42Underground===undefined||s.zaMission42Underground===false)&&s.zaZone20AlphaSpecies2==null&&knownVisibleWildLedger(s.zaZone20Spent)&&s.zaZone20Spent?.alpha2!==true&&Number.isInteger(s.x)&&Number.isInteger(s.y)&&!(s.x===9&&s.y===7)&&Math.abs(s.x-9)+Math.abs(s.y-7)<=3;}

// Random visible alphas reuse the current population's persisted identity.
// No new spawn, level or colour is ever rolled here.
const randomZones=new Set(['lumiose-zone11','lumiose-zone12','lumiose-zone13','lumiose-zone14','lumiose-zone15','lumiose-zone16','lumiose-zone16-garden','lumiose-zone17','lumiose-zone18','lumiose-zone19']);
const validRecord=x=>x===undefined||!!x&&typeof x==='object'&&!Array.isArray(x)&&!Object.hasOwn(x,'version');
function randomZoneNumber(district){return Number(/^lumiose-zone(\d+)(?:-garden)?$/.exec(district||'')?.[1]);}
function randomCycle(s,zone,shiny){
 const all=s.zaWildSpawnCycles;if(!validRecord(all))return null;
 const cycle=zone===19?s.zaZone19SpawnCycle:all?.[zone];
 if(cycle!==undefined&&(!cycle||typeof cycle!=='object'||Array.isArray(cycle)||Object.hasOwn(cycle,'version')||!['day','night'].includes(cycle.period)||!Number.isSafeInteger(cycle.interval)||cycle.interval<0))return null;
 if(shiny)return 'shiny';
 return cycle?`${cycle.period}:${cycle.interval}`:'legacy';
}
export function randomAlphaAlertKnown(s){
 const a=s?.zaRandomAlphaAlertV1;if(a===undefined)return true;
 if(!a||typeof a!=='object'||Array.isArray(a)||a.version!==1||Object.keys(a).sort().join(',')!=='cycle,district,id,level,species,version'||!randomZones.has(a.district)||typeof a.id!=='string'||!Number.isInteger(a.species)||!Number.isInteger(a.level)||a.level<1||a.level>100||typeof a.cycle!=='string'||!(/^(?:legacy|shiny|(?:day|night):\d+)$/.test(a.cycle)))return false;
 const z=zones[a.district];if(!z||a.district==='lumiose-zone19'&&a.species===676||!Array.isArray(z.visible)||!z.visible.some(p=>p.id===a.id&&p.species===a.species&&!p.alpha&&!p.burrow))return false;
 return validRecord(s.zaWildVisibleAlphaLevels)&&validRecord(s.zaWildShinyRolls)&&validRecord(s.zaWildSpawnCycles)&&validLedger(s,z)&&z.valid(s)&&randomCycle(s,randomZoneNumber(a.district),a.cycle==='shiny')!==null;
}
export function randomAlphaPlayerThreat(s){
 const z=zones[s?.district],zone=randomZoneNumber(s?.district);
 if(!z||!randomZones.has(s.district)||s.area!==3||s.interior||!randomAlphaAlertKnown(s)||!validLedger(s,z)||!z.valid(s)||!validRecord(s.zaWildVisibleAlphaLevels)||!validRecord(s.zaWildShinyRolls)||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const candidates=[];
 for(const p of z.visible){
  if(p.alpha||p.burrow||s[z.key]?.[p.id]===true||s.x===p.x&&s.y===p.y||z.match&&!z.match(s,p))continue;
  // The fixed Alpha Furfrou in this park is documented asleep. Preserve this
  // species until its sleep and wake behaviour is modelled.
  if(zone===19&&p.species===676)continue;
  const displayed=z.lookup(s,p.tile);if(!displayed||displayed.id!==p.id||displayed.species!==p.species||displayed.x!==p.x||displayed.y!==p.y)continue;
  const key=`zone${zone}:${p.id}:${p.species}`,level=s.zaWildVisibleAlphaLevels?.[key],shiny=s.zaWildShinyRolls?.[key];
  if(!Number.isInteger(level)||level<1||level>100||typeof shiny!=='boolean')continue;
  const cycle=randomCycle(s,zone,shiny);if(cycle===null)continue;
  const alert={version:1,district:s.district,id:p.id,species:p.species,level,cycle};
  candidates.push({...p,alert});
 }
 return candidates.sort((a,b)=>Math.abs(s.x-a.x)+Math.abs(s.y-a.y)-Math.abs(s.x-b.x)-Math.abs(s.y-b.y))[0]||null;
}
export function randomAlphaPlayerNear(s,p=randomAlphaPlayerThreat(s)){return !!p&&s.zaFieldCrouched!==true&&Math.abs(s.x-p.x)+Math.abs(s.y-p.y)<=2;}
export function randomAlphaAlertMatches(s,p){const a=s?.zaRandomAlphaAlertV1,b=p?.alert;return !!a&&!!b&&randomAlphaAlertKnown(s)&&['version','district','id','species','level','cycle'].every(k=>a[k]===b[k]);}
