import {adventureClockOffset} from './adventure-clock.mjs';

// The adventure clock advances one hour per 50 real seconds. Source reports
// approximately ten in-game minutes; the current clock rate is an approximation.
export const OBSTACLE_RESPAWN_GAME_MS=Math.ceil(50000/6);
export function obstacleClock(s,now=Date.now()){return Math.floor(now+adventureClockOffset(s,now)*50000);}
export function canRefreshTimedObstacle(s,district,clearedAt,now=Date.now()){
 return !!s&&s.district!==district&&!s.interior&&!s.combat&&!s.encounter&&!s.adventureCatchWindow&&Number.isSafeInteger(now)&&now>=0&&Number.isSafeInteger(clearedAt)&&clearedAt>=0&&obstacleClock(s,now)-clearedAt>=OBSTACLE_RESPAWN_GAME_MS;
}
