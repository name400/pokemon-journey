// One game hour is 50 seconds in the existing adventure clock.
const MAX_OFFSET_HOURS=10000000;
export function adventureClockOffset(s){const n=s?.zaClockOffsetHours;return Number.isSafeInteger(n)&&n>=0&&n<=MAX_OFFSET_HOURS?n:0;}
export function restUntilHour(s,currentHour,targetHour){
 if(!Number.isInteger(currentHour)||currentHour<0||currentHour>23||![8,20].includes(targetHour))throw Error('휴식 시간을 확인하세요.');
 const offset=adventureClockOffset(s),hours=(targetHour-currentHour+24)%24;
 if(offset+hours>MAX_OFFSET_HOURS)throw Error('모험 시간을 확인하세요.');
 s.zaClockOffsetHours=offset+hours;
}
