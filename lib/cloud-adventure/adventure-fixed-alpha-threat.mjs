import {ZONE11_VISIBLE,zone11Visible} from './adventure-zone11.mjs';
import {ZONE12_VISIBLE,zone12Visible} from './adventure-zone12.mjs';
import {ZONE13_VISIBLE,zone13Visible} from './adventure-zone13.mjs';
import {ZONE14_VISIBLE,zone14Visible} from './adventure-zone14.mjs';
import {ZONE17_VISIBLE,zone17Visible} from './adventure-zone17.mjs';

// Only explicitly reviewed fixed alphas are eligible. Unknown ledgers and
// future alert formats remain untouched; old saves need no migration.
const zones={
 'lumiose-zone11':{key:'zaZone11Spent',visible:ZONE11_VISIBLE,lookup:zone11Visible,ids:['slowbro-alpha','clawitzer-alpha'],valid:s=>s.zaZone11Upper===undefined||typeof s.zaZone11Upper==='boolean'},
 'lumiose-zone12':{key:'zaZone12Spent',visible:ZONE12_VISIBLE,lookup:zone12Visible,ids:['abomasnow-alpha','avalugg-alpha'],valid:s=>s.zaZone12PondLower===undefined||typeof s.zaZone12PondLower==='boolean',match:(s,p)=>s.zaZone12PondLower!==true||p.water===true},
 'lumiose-zone13':{key:'zaZone13Spent',visible:ZONE13_VISIBLE,lookup:zone13Visible,ids:['trevenant-alpha','weepinbell-alpha'],valid:s=>s.zaZone13Period===undefined||['day','night'].includes(s.zaZone13Period)},
 'lumiose-zone14':{key:'zaZone14Spent',visible:ZONE14_VISIBLE,lookup:zone14Visible,ids:['excadrill-alpha'],valid:()=>true},
 'lumiose-zone17':{key:'zaZone17Spent',visible:ZONE17_VISIBLE,lookup:zone17Visible,ids:['pyroar-alpha','mawile-alpha'],valid:s=>(s.zaZone17Upper===undefined||typeof s.zaZone17Upper==='boolean')&&(s.zaZone17Promenade===undefined||typeof s.zaZone17Promenade==='boolean')},
};
const ids=new Set(Object.entries(zones).flatMap(([district,z])=>z.ids.map(id=>`${district}:${id}`)));
const validLedger=(s,z)=>{const ledger=s?.[z.key];return ledger===undefined||!!ledger&&typeof ledger==='object'&&!Array.isArray(ledger)&&!Object.hasOwn(ledger,'version')&&z.ids.every(id=>ledger[id]===undefined||typeof ledger[id]==='boolean');};
export function fixedAlphaAlertKnown(s){const alert=s?.zaFixedAlphaAlertV1,z=zones[s?.district];return (alert===undefined||typeof alert==='string'&&ids.has(alert))&&(!z||validLedger(s,z)&&z.valid(s));}
export function fixedAlphaPlayerThreat(s){
 const z=zones[s?.district];if(!z||s.area!==3||s.interior||!fixedAlphaAlertKnown(s)||!z.valid(s)||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const ledger=s[z.key];
 return z.visible.filter(p=>z.ids.includes(p.id)&&p.alpha===true&&ledger?.[p.id]!==true&&!(s.x===p.x&&s.y===p.y)&&(!z.match||z.match(s,p))&&z.lookup(s,p.tile)===p).map(p=>({...p,alertKey:`${s.district}:${p.id}`})).sort((a,b)=>Math.abs(s.x-a.x)+Math.abs(s.y-a.y)-Math.abs(s.x-b.x)-Math.abs(s.y-b.y))[0]||null;
}
export function fixedAlphaPlayerNear(s,p=fixedAlphaPlayerThreat(s)){return !!p&&s.zaFieldCrouched!==true&&Math.abs(s.x-p.x)+Math.abs(s.y-p.y)<=2;}
