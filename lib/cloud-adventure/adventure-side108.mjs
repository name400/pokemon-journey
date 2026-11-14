// https://www.serebii.net/legendsz-a/sidemissions/alola,raichu.shtml
// The Quasartico building-front tile is a provisional 2D placement.
export function side108Available(s={}){return [1,2,3,4].includes(s.zaSide108Stage)||s.zaMission37Complete===true||s.zaMission38Started===true||s.zaMission38Complete===true||s.zaMission39Started===true;}
export function side108Spot(s,p){return s?.district==='lumiose-quasartico'&&!s.interior&&p?.tile==='.'&&p.x===16&&p.y===6;}
export function side108Eligible(mon){return mon?.id===26&&mon?.speciesId===26&&(mon.formId==null||mon.formId===26);}
