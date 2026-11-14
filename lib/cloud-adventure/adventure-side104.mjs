// https://www.serebii.net/legendsz-a/sidemissions/abuzzaboutbugtypes.shtml
// The Rouge Sector 7 court tile is a provisional 2D placement.
export function side104Available(s={}){return [1,2,3].includes(s.zaSide104Stage)||Number(s.zaMission35Stage)>=7||s.zaMission35Complete===true||s.zaMission37Complete===true||s.zaMission38Complete===true||['A','S'].includes(s.zaRoyaleRank);}
export function side104Spot(s,p){return s?.district==='lumiose-rouge-sector7'&&!s.interior&&p?.tile===';'&&p.x===19&&p.y===7;}
