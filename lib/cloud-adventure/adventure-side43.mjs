import {adventureGameTime,adventureClockOffset} from './adventure-clock.mjs';
// https://www.serebii.net/legendsz-a/sidemissions/abigweedleproblem.shtml
// The two blocked-wall positions are provisional placements in the existing map.
export function side43Available(s={}){return [1,2,3].includes(s.zaSide43Stage)||(s.zaSide43Stage===undefined&&(Number(s.zaMission15Stage)>=2||s.zaMission15Complete===true||s.zaMission19Complete===true||s.zaMission20Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['D','C','B','A','S'].includes(s.zaRoyaleRank)));}
export function side43Spot(s,p,period){if(!s||s.interior||s.district!=='lumiose-magenta-sector3'||p?.tile!=='#'||!side43Available(s))return null;if(p.x===8&&p.y===3&&[undefined,1,2,3].includes(s.zaSide43Stage))return 'grandt';if(p.x===17&&p.y===6&&s.zaSide43Stage===1&&(period||adventureGameTime(undefined,adventureClockOffset(s)).period)==='day')return 'weedle';return null;}
