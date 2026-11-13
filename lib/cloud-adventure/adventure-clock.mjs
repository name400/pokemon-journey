// One game hour is 50 seconds in the existing adventure clock.
const MAX_OFFSET_HOURS=10000000;
function baseClockOffset(s){const n=s?.zaClockOffsetHours;return Number.isSafeInteger(n)&&n>=0&&n<=MAX_OFFSET_HOURS?n:0;}
// Separate millisecond accounting preserves the legacy whole-hour rest offset.
// A persisted start keeps the clock frozen across reloads and offline time.
export function adventureClockOffset(s,now=Date.now()){
 const saved=Number.isSafeInteger(s?.zaClockPausedMs)&&s.zaClockPausedMs>=0?s.zaClockPausedMs:0;
 const started=s?.zaClockPauseStartedAt,active=Number.isSafeInteger(started)&&started>=0&&Number.isFinite(now)?Math.max(0,Math.floor(now)-started):0;
 return baseClockOffset(s)-(saved+active)/50000;
}
export function syncAdventureCombatClock(s,now=Date.now()){
 if(!s||!Number.isSafeInteger(now)||now<0)return;
 const started=s.zaClockPauseStartedAt,valid=Number.isSafeInteger(started)&&started>=0;
 if(s.combat){if(!valid)s.zaClockPauseStartedAt=now;return;}
 if(valid){const saved=Number.isSafeInteger(s.zaClockPausedMs)&&s.zaClockPausedMs>=0?s.zaClockPausedMs:0;s.zaClockPausedMs=Math.min(Number.MAX_SAFE_INTEGER,saved+Math.max(0,now-started));delete s.zaClockPauseStartedAt;}
}

export function restUntilHour(s,currentHour,targetHour){
 if(!Number.isInteger(currentHour)||currentHour<0||currentHour>23||![8,20].includes(targetHour))throw Error('휴식 시간을 확인하세요.');
 const offset=baseClockOffset(s),hours=(targetHour-currentHour+24)%24;
 if(offset+hours>MAX_OFFSET_HOURS)throw Error('모험 시간을 확인하세요.');
 s.zaClockOffsetHours=offset+hours;
}

// Z-A's day runs from 04:00 to 20:00. Keep the existing 50-second
// hour and saved offset unit for compatibility; their real-time duration
// and pause rules remain an approximation.
export function adventureGameTime(now=Date.now(),offsetHours=0){
 const shifted=now+offsetHours*50000,day=Math.floor(shifted/1200000),within=((shifted%1200000)+1200000)%1200000,hour=Math.floor(within/50000);
 return {absoluteHour:Math.floor(shifted/50000),hour,period:hour>=4&&hour<20?'day':'night',dusk:hour>=16&&hour<20,fullMoon:day%28===14};
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

// An approximate hourly city forecast. The game can change weather on time
// changes, but its probabilities and exact transition rules are unknown. A
// deterministic hash keeps concurrent reads/reconnections consistent without
// adding a save field or rerolling weather on every request.
export function adventureFieldWeather(s,time,biome){
 const city=s?.area===3&&typeof s.district==='string'&&s.district.startsWith('lumiose');
 if(city){
  if(s.interior||/sewer|tunnel|drain/.test(s.district))return '';
  const hour=Number.isSafeInteger(time.absoluteHour)?time.absoluteHour:time.hour;
  let hash=(hour^0x4a39b70d)>>>0;hash=Math.imul(hash^(hash>>>16),0x45d9f3b);hash=Math.imul(hash^(hash>>>16),0x45d9f3b);hash=(hash^(hash>>>16))>>>0;
  return hash%4===0?'rain':'';
 }
 return ['water','poison'].includes(biome)&&time.hour%2===0?'rain':'';
}
