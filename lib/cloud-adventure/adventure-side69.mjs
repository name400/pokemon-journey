import {Dex} from '@pkmn/sim';
import {rules} from '../pokemon-config.mjs';
// https://www.serebii.net/legendsz-a/sidemissions/askybattle,foroldtimes'sake.shtml
export function side69Available(s={}){return [1,2,3].includes(s.zaSide69Stage)||Number(s.zaMission20Stage)>=6||s.zaMission20Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['C','B','A','S'].includes(s.zaRoyaleRank);}
export function side69Spot(s,p){return s?.district==='lumiose-screw-magenta8'&&!s.interior&&p?.tile==='#'&&p.x===19&&p.y===3;}
export function side69FlyingTeam(ids,mons){return Array.isArray(ids)&&ids.length>0&&ids.every(id=>{const mon=mons.get(id),key=rules.species[mon?.id]?.key,p=key&&Dex.species.get(key);return !!p?.exists&&p.types.includes('Flying');});}
