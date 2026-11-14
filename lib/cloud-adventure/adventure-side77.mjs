// https://www.serebii.net/legendsz-a/sidemissions/catchmawileifyoucan.shtml
// Sector 3 and scaffold positions use existing blocked edges; exact coordinates are drafts.
export function side77Available(s={}){return [1,2,3].includes(s.zaSide77Stage)||(s.zaSide77Stage===undefined&&(s.zaMission25Complete===true||Number(s.zaMission26Stage)>=1||s.zaMission26Complete===true||s.zaMission30Started===true||s.zaMission37Complete===true||['B','A','S'].includes(s.zaRoyaleRank)));}
export function side77Spot(s,p){if(s?.interior||!p||p.tile!=='#')return null;if(s.district==='lumiose-magenta-sector3'&&p.x===9&&p.y===6&&s.zaSide77Stage===undefined&&side77Available(s))return 'reu';if(s.district==='lumiose-zone9-nw-scaffold'&&p.x===12&&p.y===2&&[1,2].includes(s.zaSide77Stage))return s.zaSide77Stage===1?'mawile':'reward';return null;}
export function recordSide77Capture(s,foe){if(s.zaSide77Stage!==1||foe?.adventureMissionId!=='side77-mawile')return false;s.zaSide77Stage=2;return true;}
