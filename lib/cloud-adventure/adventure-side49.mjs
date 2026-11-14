// Piresse demonstrates draining attacks near Centrico / Hibernal Avenue.
// https://www.serebii.net/legendsz-a/sidemissions/hitandheal.shtml
export function side49Available(s={}){return [1,2,3].includes(s.zaSide49Stage)||Number(s.zaMission19Stage)>=1||s.zaMission19Complete===true||s.zaMission20Started===true||s.zaMission20Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side49Spot(s,p){return s?.district==='lumiose-centrico-route'&&!s.interior&&p?.tile==='^'&&p.x===8&&p.y===0;}
