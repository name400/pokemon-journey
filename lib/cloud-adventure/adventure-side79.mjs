// https://www.serebii.net/legendsz-a/sidemissions/afatefulswingofametronome.shtml
// Hibernal Avenue's wall location is a provisional 2D placement.
export function side79Available(s={}){return [1,2,3].includes(s.zaSide79Stage)||(s.zaSide79Stage===undefined&&(Number(s.zaMission26Stage)>=1||s.zaMission26Complete===true||s.zaMission30Started===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['B','A','S'].includes(s.zaRoyaleRank)));}
export function side79Spot(s,p){return s?.district==='lumiose-hibernal-approach'&&!s.interior&&p?.tile==='#'&&p.x===4&&p.y===6;}
