// https://www.serebii.net/legendsz-a/sidemissions/arematchwithhawlucha.shtml
export function side59Available(s={}){return [1,2,3].includes(s.zaSide59Stage)||s.zaMission20Started===true||s.zaMission20Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['C','B','A','S'].includes(s.zaRoyaleRank);}
export function side59Spot(s,p){return s?.district==='lumiose-magenta-sector3-roof'&&!s.interior&&p?.tile==='#'&&p.x===18&&p.y===2;}
