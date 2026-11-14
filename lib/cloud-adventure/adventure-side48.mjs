// Rouge Sector 5 rescue; exact 2D position is provisional.
// https://www.serebii.net/legendsz-a/sidemissions/alltiedup.shtml
export function side48Available(s={}){return [1,2,3].includes(s.zaSide48Stage)||Number(s.zaMission19Stage)>=1||s.zaMission19Complete===true||s.zaMission20Started===true||s.zaMission20Complete===true||s.zaMission24Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side48Spot(s,p){return s?.district==='lumiose-rouge-sector5'&&!s.interior&&p?.tile==='^'&&p.x===15&&p.y===10;}
