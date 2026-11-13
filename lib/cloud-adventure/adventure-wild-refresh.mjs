import {resetZone8Burrows} from './adventure-zone8.mjs';
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
