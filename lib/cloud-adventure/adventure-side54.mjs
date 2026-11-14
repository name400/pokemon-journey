// https://www.serebii.net/legendsz-a/sidemissions/getenergized.shtml
export function side54Available(s={}){return [1,2,3].includes(s.zaSide54Stage)||Number(s.zaMission19Stage)>=7||s.zaMission19Complete===true||s.zaMission20Started===true||s.zaMission20Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side54Spot(s,p){return s?.district==='lumiose-quasartico'&&!s.interior&&p?.tile==='^'&&p.x===8&&p.y===4;}
