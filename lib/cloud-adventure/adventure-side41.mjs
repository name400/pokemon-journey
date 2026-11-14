// https://www.serebii.net/legendsz-a/sidemissions/watchoutfortraps.shtml
export function side41Available(s={}){return [1,2,3].includes(s.zaSide41Stage)||Number(s.zaMission15Stage)>=1||s.zaMission15Complete===true||s.zaMission19Complete===true||s.zaMission20Complete===true||s.zaMission37Complete===true||['E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side41Spot(s,p){return s?.district==='lumiose-vert-sector9'&&!s.interior&&p?.tile==='#'&&p.x===19&&p.y===5;}
