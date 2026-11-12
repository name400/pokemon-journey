// One game hour is 50 seconds in the existing adventure clock.
const MAX_OFFSET_HOURS=10000000;
export function adventureClockOffset(s){const n=s?.zaClockOffsetHours;return Number.isSafeInteger(n)&&n>=0&&n<=MAX_OFFSET_HOURS?n:0;}
export function restUntilHour(s,currentHour,targetHour){
 if(!Number.isInteger(currentHour)||currentHour<0||currentHour>23||![8,20].includes(targetHour))throw Error('휴식 시간을 확인하세요.');
 const offset=adventureClockOffset(s),hours=(targetHour-currentHour+24)%24;
 if(offset+hours>MAX_OFFSET_HOURS)throw Error('모험 시간을 확인하세요.');
 s.zaClockOffsetHours=offset+hours;
}

// Z-A's day runs from 04:00 to 20:00. Keep the existing 50-second
// hour and saved offset unit for compatibility; their real-time duration
// and pause rules remain an approximation.
export function adventureGameTime(now=Date.now(),offsetHours=0){
 const shifted=now+offsetHours*50000,day=Math.floor(shifted/1200000),within=((shifted%1200000)+1200000)%1200000,hour=Math.floor(within/50000);
 return {hour,period:hour>=4&&hour<20?'day':'night',dusk:hour>=16&&hour<20,fullMoon:day%28===14};
}
// Two distinct period identifiers per day, with boundaries at 04:00/20:00.
export function adventureSpawnInterval(now=Date.now(),offsetHours=0){
 const shifted=now+offsetHours*50000,day=Math.floor((shifted-4*50000)/1200000),within=shifted-4*50000-day*1200000;
 return day*2+(within>=16*50000?1:0);
}

// Old cycle indices used 06:00/18:00 and cannot be compared to the new
// boundaries. Rebase once without treating the upgrade as a respawn.
export function migrateAdventureWildClock(s,period,interval){
 if(!s||s.zaWildClockV2===true||s.combat||s.encounter||s.adventureCatchWindow||!['day','night'].includes(period)||!Number.isSafeInteger(interval))return false;
 if(s.zaWildSpawnCycles&&typeof s.zaWildSpawnCycles==='object'&&!Array.isArray(s.zaWildSpawnCycles)){
  const next={...s.zaWildSpawnCycles};for(const [key,value] of Object.entries(next))if(value&&typeof value==='object'&&!Array.isArray(value))next[key]={...value,period,interval};s.zaWildSpawnCycles=next;
 }
 if(s.zaZone19SpawnCycle&&typeof s.zaZone19SpawnCycle==='object'&&!Array.isArray(s.zaZone19SpawnCycle))s.zaZone19SpawnCycle={...s.zaZone19SpawnCycle,period,interval};
 s.zaWildClockV2=true;return true;
}
