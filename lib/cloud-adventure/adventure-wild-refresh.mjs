// Only zones whose ordinary visible encounters already reset on exit are
// included. Story encounters, moving populations and zone 20 use other rules.
const ORDINARY_ZONES = new Set([5,6,8,9,10,11,12,13,14,15,16,17,18]);

export function refreshOrdinaryWildSpawns(s,period,interval){
 if(!s||s.interior||s.combat||s.encounter||s.adventureCatchWindow||!['day','night'].includes(period)||!Number.isSafeInteger(interval))return false;
 const match=/^lumiose-zone(\d+)(?:-garden|-drain|-sw-top|-sw-middle)?$/.exec(s.district||'');
 const zone=Number(match?.[1]);if(!ORDINARY_ZONES.has(zone))return false;
 const cycles=s.zaWildSpawnCycles&&typeof s.zaWildSpawnCycles==='object'&&!Array.isArray(s.zaWildSpawnCycles)?s.zaWildSpawnCycles:{};
 const old=cycles[zone],valid=old&&['day','night'].includes(old.period)&&Number.isSafeInteger(old.interval);
 if(valid&&old.period===period&&old.interval===interval)return false;
 if(valid){
  delete s[`zaZone${zone}Spent`];
  if(s.zaWildShinyRolls&&typeof s.zaWildShinyRolls==='object'&&!Array.isArray(s.zaWildShinyRolls)){
   const next={...s.zaWildShinyRolls};for(const key of Object.keys(next))if(key.startsWith(`zone${zone}:`))delete next[key];s.zaWildShinyRolls=next;
  }
 }
 s.zaWildSpawnCycles={...cycles,[zone]:{period,interval}};return true;
}
