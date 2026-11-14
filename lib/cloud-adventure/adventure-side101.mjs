// https://www.serebii.net/legendsz-a/sidemissions/steadfastassteel.shtml
// The specific Bleu Sector 6 tile is a provisional 2D placement.
export function side101Available(s={}){return [1,2,3].includes(s.zaSide101Stage)||Number(s.zaMission35Stage)>=2||s.zaMission35Complete===true||s.zaMission37Complete===true||s.zaMission38Complete===true||['A','S'].includes(s.zaRoyaleRank);}
export function side101Spot(s,p){return s?.district==='lumiose-bleu6-approach'&&!s.interior&&p?.tile==='.'&&p.x===16&&p.y===7;}
