// https://advent.serebii.net/legendsz-a/sidemissions/we%27lljustmuscleourwaythrough.shtml
export function side56Available(s={}){return [1,2,3,4].includes(s.zaSide56Stage)||s.zaMission20Started===true||s.zaMission20Complete===true||s.zaMission30Started===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['C','B','A','S'].includes(s.zaRoyaleRank);}
export function side56Spot(s,p){return s?.district==='lumiose-jaune-sector6'&&!s.interior&&p?.tile==='j'&&p.x===15&&p.y===12;}
