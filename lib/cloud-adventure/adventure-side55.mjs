// https://www.serebii.net/legendsz-a/sidemissions/carvanha%2Cmenaceofthedeep.shtml
export function side55Available(s={}){return [1,2,3].includes(s.zaSide55Stage)||Number(s.zaMission19Stage)>=7||s.zaMission19Complete===true||s.zaMission20Started===true||s.zaMission20Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side55Spot(s,p){return s?.district==='lumiose-saison-canalside'&&!s.interior&&p?.tile==='^'&&p.x===13&&p.y===12;}
