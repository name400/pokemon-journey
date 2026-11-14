// https://www.thonky.com/pokemon-legends-z-a/side-mission-071-the-burning-gaze-of-watchog
export function side71Available(s={}){return [1,2,3].includes(s.zaSide71Stage)||s.zaMission20Complete===true||s.zaMission24Started===true||s.zaMission24Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['C','B','A','S'].includes(s.zaRoyaleRank);}
export function side71Spot(s,p){return s?.district==='lumiose-magenta-sector2'&&!s.interior&&p?.tile==='#'&&p.x===16&&p.y===11;}
export function recordSide71Victory(s,foe){if(s.zaSide71Stage!==1||foe?.adventureMissionId!=='side71-watchog')return false;s.zaSide71Stage=2;return true;}
