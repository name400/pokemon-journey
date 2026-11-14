// https://www.serebii.net/legendsz-a/sidemissions/theworld%27sgreatestpikachu.shtml
// The Rouge Sector 1 court coordinate is a 2D approximation.
export function side107Available(s={}){return [1,2,3].includes(s.zaSide107Stage)||s.zaMission37Complete===true||s.zaMission38Started===true||s.zaMission38Complete===true||s.zaMission39Started===true;}
export function side107Spot(s,p){return s?.district==='lumiose-rouge-sector1'&&!s.interior&&p?.tile===';'&&p.x===17&&p.y===5;}
