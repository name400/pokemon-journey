// These are draft 2D spawn positions; a time interval is a conservative
// approximation of the original game's wild population refresh.
const ALPHAS={
 'lumiose-zone1-roof':{spent:'zaZone1RoofAlphaSpent',x:18,y:5,keys:['alpha:zone1-roof-pidgey:16']},
 'lumiose-zone2':{spent:'zaZone2AlphaSpent',x:20,y:11,keys:['alpha:zone2-island:129','alpha:zone2-island:120']},
 'lumiose-zone4':{spent:'zaZone4AlphaSpent',x:4,y:10,keys:['alpha:zone4-spinarak:167']},
 'lumiose-zone7':{spent:'zaZone7AlphaSpent',x:11,y:8,keys:['alpha:zone7-fletchinder:662']},
};

export function refreshEarlyAlpha(s,period,interval){
 if(!s||s.interior||s.combat||s.encounter||s.adventureCatchWindow||!['day','night'].includes(period)||!Number.isSafeInteger(interval))return false;
 const alpha=ALPHAS[s.district];if(!alpha)return false;
 const cycles=s.zaEarlyAlphaCycles&&typeof s.zaEarlyAlphaCycles==='object'&&!Array.isArray(s.zaEarlyAlphaCycles)?s.zaEarlyAlphaCycles:{};
 const old=cycles[s.district],valid=old&&['day','night'].includes(old.period)&&Number.isSafeInteger(old.interval);
 if(valid&&old.period===period&&old.interval===interval)return false;
 if(valid&&s[alpha.spent]===true){
  if(s.x===alpha.x&&s.y===alpha.y)return false;
  delete s[alpha.spent];
  if(s.zaWildShinyRolls&&typeof s.zaWildShinyRolls==='object'&&!Array.isArray(s.zaWildShinyRolls)){
   // A different time-exclusive individual may have an unspent shiny roll.
   // Capture and victory clear the consumed individual's roll separately.
   const rolls={...s.zaWildShinyRolls};for(const key of alpha.keys)if(rolls[key]!==true)delete rolls[key];s.zaWildShinyRolls=rolls;
  }
 }
 s.zaEarlyAlphaCycles={...cycles,[s.district]:{period,interval}};return true;
}
