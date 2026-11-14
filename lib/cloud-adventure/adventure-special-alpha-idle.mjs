import {knownVisibleWildLedger} from './adventure-visible-wild.mjs';
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
 const c=configs[s?.district];if(!c||typeof s[c[0]]!=='string'||!knownVisibleWildLedger(s[c[1]])||!c[4](s))return null;
 if(s.district.startsWith('lumiose-zone5')&&['zaZone5Upper','zaZone5DrainLanding'].some(k=>s[k]!==undefined&&typeof s[k]!=='boolean'))return null;
 const p=c[2](s);if(!p||s[c[0]]!==p.id||!c[3](s,p))return null;
 return {...p,alertField:c[0],alertKey:JSON.stringify([s.district,p.id])};
}
