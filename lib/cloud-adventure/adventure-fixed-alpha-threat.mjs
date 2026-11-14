import {knownVisibleWildLedger} from './adventure-visible-wild.mjs';
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
const zones={
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
const validLedger=(s,z)=>knownVisibleWildLedger(s?.[z.key]);
export function fixedAlphaAlertKnown(s){const alert=s?.zaFixedAlphaAlertV1,z=zones[s?.district];return (alert===undefined||typeof alert==='string'&&ids.has(alert))&&(!z||validLedger(s,z)&&z.valid(s));}
export function fixedAlphaPlayerThreat(s){
 const z=zones[s?.district];if(!z||s.area!==3||s.interior||!fixedAlphaAlertKnown(s)||!z.valid(s)||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const ledger=s[z.key];
 const visible=typeof z.visible==='function'?z.visible(s):z.visible;
 return visible.filter(p=>z.ids.includes(p.id)&&p.alpha===true&&ledger?.[p.id]!==true&&!(s.x===p.x&&s.y===p.y)&&(!z.match||z.match(s,p))&&(z.dynamic||z.lookup(s,p.tile)===p)).map(p=>({...p,alertKey:`${s.district}:${p.id}${z.dynamic?`:${p.species}`:''}`})).sort((a,b)=>Math.abs(s.x-a.x)+Math.abs(s.y-a.y)-Math.abs(s.x-b.x)-Math.abs(s.y-b.y))[0]||null;
}
export function fixedAlphaPlayerNear(s,p=fixedAlphaPlayerThreat(s)){return !!p&&s.zaFieldCrouched!==true&&Math.abs(s.x-p.x)+Math.abs(s.y-p.y)<=2;}
// A legacy visit can materialize its second slot on the next server action.
// Do not predict through that unconfirmed slot before the server chooses it.
export function unknownZone20AlphaNear(s){return !!s&&s.area===3&&s.district==='lumiose-zone20'&&!s.interior&&s.zaMission42Underground!==true&&(s.zaMission42Underground===undefined||s.zaMission42Underground===false)&&s.zaZone20AlphaSpecies2==null&&knownVisibleWildLedger(s.zaZone20Spent)&&s.zaZone20Spent?.alpha2!==true&&Number.isInteger(s.x)&&Number.isInteger(s.y)&&!(s.x===9&&s.y===7)&&Math.abs(s.x-9)+Math.abs(s.y-7)<=3;}
