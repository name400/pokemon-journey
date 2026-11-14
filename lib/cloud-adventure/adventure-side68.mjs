// https://www.serebii.net/legendsz-a/sidemissions/thebestuseforleftovers.shtml
export function side68Available(s={}){return [1,2,3].includes(s.zaSide68Stage)||Number(s.zaMission20Stage)>=6||s.zaMission20Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['C','B','A','S'].includes(s.zaRoyaleRank);}
export function side68Spot(s,p){return s?.district==='lumiose-vert-sector6'&&!s.interior&&p?.tile==='#'&&p.x===19&&p.y===9;}
