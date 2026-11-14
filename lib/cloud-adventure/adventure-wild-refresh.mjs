import {resetZone8Burrows} from './adventure-zone8.mjs';
import {knownVisibleWildLedger} from './adventure-visible-wild.mjs';
// Only zones whose ordinary visible encounters already reset on exit are
// included. Story encounters, moving populations and zone 20 use other rules.
const ORDINARY_ZONES = new Set([5,6,7,8,9,10,11,12,13,14,15,16,17,18]);

// Preserve unspent shiny individuals when ordinary encounters refresh.
// Stale rolls for already consumed slots and non-shiny individuals can reset.
export function refreshZoneShinyRolls(s,zone){
 const rolls=s.zaWildShinyRolls;if(!rolls||typeof rolls!=='object'||Array.isArray(rolls))return;
 const spent=s[`zaZone${zone}Spent`],prefix=`zone${zone}:`,next={...rolls};
 for(const key of Object.keys(next)){
  if(!key.startsWith(prefix))continue;
  const id=key.slice(prefix.length).split(':')[0];
  if(next[key]!==true||spent?.[id]===true){delete next[key];if(s.zaWildVisibleAlphaLevels)delete s.zaWildVisibleAlphaLevels[key];}
 }
 s.zaWildShinyRolls=next;
}

export function refreshOrdinaryWildSpawns(s,period,interval,canRefresh=(_state,_zone,_period)=>true){
 if(!s||s.interior||s.combat||s.encounter||s.adventureCatchWindow||!['day','night'].includes(period)||!Number.isSafeInteger(interval))return false;
 const match=/^lumiose-zone(\d+)(?:-garden|-drain|-sw-top|-sw-middle)?$/.exec(s.district||'');
 const zone=Number(match?.[1]);if(!ORDINARY_ZONES.has(zone))return false;
 // A future or malformed encounter ledger must not be cleared or used to
 // refresh visible individuals: its semantics are unknown to this version.
 if(!knownVisibleWildLedger(s[`zaZone${zone}Spent`]))return false;
 const cycles=s.zaWildSpawnCycles&&typeof s.zaWildSpawnCycles==='object'&&!Array.isArray(s.zaWildSpawnCycles)?s.zaWildSpawnCycles:{};
 const old=cycles[zone],valid=old&&['day','night'].includes(old.period)&&Number.isSafeInteger(old.interval);
 if(valid&&old.period===period&&old.interval===interval)return false;
 if(valid){
  if(!canRefresh(s,zone,period))return false;
  if(zone===8)resetZone8Burrows(s);
  refreshZoneShinyRolls(s,zone);
  delete s[`zaZone${zone}Spent`];
 }
 s.zaWildSpawnCycles={...cycles,[zone]:{period,interval}};return true;
}

// Same-zone fast travel reloads the current ground view. Call only with the
// already resolved visible population; fixed alphas and buried encounters
// keep their independent lifecycle.
export function refreshVisibleWildOnSameZoneTravel(s,zone,visible){
 if(!s||s.district!==`lumiose-zone${zone}`||s.interior||s.combat||s.encounter||s.adventureCatchWindow||![...ORDINARY_ZONES,19].includes(zone)||!Array.isArray(visible))return false;
 const rolls=s.zaWildShinyRolls;if(!rolls||typeof rolls!=='object'||Array.isArray(rolls))return false;
 const spent=s[`zaZone${zone}Spent`]||{},keys=[];
 for(const p of visible){if(!p||p.alpha||p.burrow||typeof p.id!=='string'||!Number.isInteger(p.species)||spent[p.id]===true)continue;const key=`zone${zone}:${p.id}:${p.species}`;if(rolls[key]===false)keys.push(key);}
 if(!keys.length)return false;
 const next={...rolls},alphas=s.zaWildVisibleAlphaLevels&&typeof s.zaWildVisibleAlphaLevels==='object'&&!Array.isArray(s.zaWildVisibleAlphaLevels)?{...s.zaWildVisibleAlphaLevels}:null;
 for(const key of keys){delete next[key];if(alphas)delete alphas[key];}s.zaWildShinyRolls=next;if(alphas)s.zaWildVisibleAlphaLevels=alphas;return true;
}
