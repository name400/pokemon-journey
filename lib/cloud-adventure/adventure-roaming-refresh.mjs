import {zone2BudewPosition,zone2FieldMonsters,zone3FieldMonsters} from './adventure-world.mjs';

// Field individuals which have disappeared can return at the next time interval.
// Unspent shinies keep identity across time changes; normal individuals can
// reroll. The first observation of an older save never replaces its individuals.
export function refreshRoamingWildSpawns(s,period,interval){
 if(!s||s.interior||s.combat||s.encounter||s.adventureCatchWindow||!['day','night'].includes(period)||!Number.isSafeInteger(interval))return false;
 const zone=s.district==='lumiose-zone2'?2:s.district==='lumiose-zone3'?3:0;
 if(!zone||(zone===3&&s.zaZone3TowerUpper))return false;
 const cycles=s.zaWildSpawnCycles&&typeof s.zaWildSpawnCycles==='object'&&!Array.isArray(s.zaWildSpawnCycles)?s.zaWildSpawnCycles:{};
 const old=cycles[zone],valid=old&&['day','night'].includes(old.period)&&Number.isSafeInteger(old.interval);
 if(valid&&old.period===period&&old.interval===interval)return false;
 if(valid){
  const spent=s[`zaZone${zone}FieldSpent`]||{},positions=s[`zaZone${zone}FieldPositions`]||{};
  const candidate={...s,[`zaZone${zone}FieldSpent`]:{},[`zaZone${zone}FieldPositions`]:{}};
  const monsters=zone===2?zone2FieldMonsters(candidate,period):zone3FieldMonsters(candidate,period);
  if(zone===3&&!monsters.length)return false;
  const respawning=monsters.filter(p=>spent[p.id]===true);
  const present=zone===2?zone2FieldMonsters(s,period):zone3FieldMonsters(s,period);
  if(respawning.some(p=>(p.x===s.x&&p.y===s.y)||present.some(q=>q.x===p.x&&q.y===p.y)))return false;
  if(zone===2&&s.zaZone2Budew?.escaped===true){const p=zone2BudewPosition({...s,zaZone2Budew:undefined});if(p&&((p.x===s.x&&p.y===s.y)||present.some(q=>q.x===p.x&&q.y===p.y)))return false;}
  const nextSpent={...spent},nextPositions={...positions},rolls=s.zaWildShinyRolls&&typeof s.zaWildShinyRolls==='object'&&!Array.isArray(s.zaWildShinyRolls)?{...s.zaWildShinyRolls}:{};
  const alphas=s.zaWildVisibleAlphaLevels&&typeof s.zaWildVisibleAlphaLevels==='object'&&!Array.isArray(s.zaWildVisibleAlphaLevels)?{...s.zaWildVisibleAlphaLevels}:null;
  // Only a real cycle transition rerolls non-shiny roaming individuals.
  // Preserve even temporarily hidden shinies and their alpha identity.
  for(const key of Object.keys(rolls))if(key.startsWith(`field${zone}:`)&&rolls[key]===false){
   delete rolls[key];if(alphas)delete alphas[key];
   if(key==='field2:budew:406'&&s.zaZone2Budew&&s.zaZone2Budew.escaped!==true)s.zaZone2Budew={...s.zaZone2Budew,alert:0};
   if(key==='field3:espurr:677'&&nextPositions.espurr)nextPositions.espurr={...nextPositions.espurr,alert:0};
  }
  for(const p of respawning){delete nextSpent[p.id];delete nextPositions[p.id];delete rolls[`field${zone}:${p.id}:${p.speciesId}`];if(alphas)delete alphas[`field${zone}:${p.id}:${p.speciesId}`];}
  s[`zaZone${zone}FieldSpent`]=nextSpent;s[`zaZone${zone}FieldPositions`]=nextPositions;
  if(zone===2){
   if(s.zaZone2Budew?.escaped===true){delete s.zaZone2Budew;delete rolls['field2:budew:406'];if(alphas)delete alphas['field2:budew:406'];}
   if(s.zaZone2KakunaSpent){delete s.zaZone2KakunaSpent;delete rolls['field2:kakuna:14'];if(alphas)delete alphas['field2:kakuna:14'];}
  }
  s.zaWildShinyRolls=rolls;if(alphas)s.zaWildVisibleAlphaLevels=alphas;
 }
 s.zaWildSpawnCycles={...cycles,[zone]:{period,interval}};return true;
}

// Only the ground-level population belongs to these areas. Other floors and
// interiors are separate so their departure can be detected without map scans.
export function roamingWildArea(s){
 if(!s||s.interior)return 0;
 if(s.district==='lumiose-zone2')return 2;
 if(s.district==='lumiose-zone3'&&s.zaZone3TowerUpper!==true)return 3;
 return 0;
}

// Keep unspent shinies (including temporarily absent species) and all spent
// timers. Reset only known non-shinies after a successful departure.
export function refreshRoamingWildOnExit(s,oldZone){
 if(!s||![2,3].includes(oldZone)||roamingWildArea(s)===oldZone||s.combat||s.encounter||s.adventureCatchWindow)return false;
 const rolls=s.zaWildShinyRolls;if(!rolls||typeof rolls!=='object'||Array.isArray(rolls))return false;
 const keys=Object.keys(rolls).filter(key=>key.startsWith(`field${oldZone}:`)&&rolls[key]===false);if(!keys.length)return false;
 const next={...rolls},alphas=s.zaWildVisibleAlphaLevels&&typeof s.zaWildVisibleAlphaLevels==='object'&&!Array.isArray(s.zaWildVisibleAlphaLevels)?{...s.zaWildVisibleAlphaLevels}:null;
 for(const key of keys){delete next[key];if(alphas)delete alphas[key];}
 s.zaWildShinyRolls=next;if(alphas)s.zaWildVisibleAlphaLevels=alphas;
 if(keys.includes('field2:budew:406')&&s.zaZone2Budew&&s.zaZone2Budew.escaped!==true)s.zaZone2Budew={...s.zaZone2Budew,alert:0};
 if(keys.includes('field3:espurr:677')&&s.zaZone3FieldPositions?.espurr)s.zaZone3FieldPositions={...s.zaZone3FieldPositions,espurr:{...s.zaZone3FieldPositions.espurr,alert:0}};
 return true;
}
