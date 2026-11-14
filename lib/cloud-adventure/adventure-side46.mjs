// Colis waits on Saison Canalside after Mission 19 begins.
// https://www.serebii.net/legendsz-a/sidemissions/pidgeotsoaringhigh.shtml
export function side46Available(s={}){return [1,2,3].includes(s.zaSide46Stage)||Number(s.zaMission19Stage)>=1||s.zaMission19Complete===true||s.zaMission20Started===true||s.zaMission20Complete===true||s.zaMission24Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side46Spot(s,p){return s?.district==='lumiose-saison-canalside'&&!s.interior&&p?.tile==='^'&&p.x===13&&p.y===11;}
