// https://www.serebii.net/legendsz-a/sidemissions/panchamthecourier.shtml
export function side81Available(s={}){return [1,2,3].includes(s.zaSide81Stage)||Number(s.zaMission26Stage)>=3||s.zaMission26Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['B','A','S'].includes(s.zaRoyaleRank);}
export function side81Spot(s,p){return s?.district==='lumiose-south-boulevard'&&!s.interior&&p?.tile==='#'&&p.x===15&&p.y===11;}
