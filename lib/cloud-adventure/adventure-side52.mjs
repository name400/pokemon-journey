// Gelli asks for help thawing Numel in Wild Zone 12.
// https://www.serebii.net/legendsz-a/sidemissions/numelfrozensolid.shtml
export function side52Available(s={}){return [1,2,3].includes(s.zaSide52Stage)||Number(s.zaMission19Stage)>=7||s.zaMission19Complete===true||s.zaMission20Started===true||s.zaMission20Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side52Spot(s,p){return s?.district==='lumiose-zone12'&&!s.interior&&s.zaZone12PondLower!==true&&p?.tile==='^'&&p.x===16&&p.y===14;}
