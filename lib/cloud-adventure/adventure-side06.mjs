// Distan occupies the Bleu Sector 4 court; the compact 2D position is provisional.
// https://advent.serebii.net/legendsz-a/sidemissions/long-rangemoveshavestyle.shtml
export function side06Available(s={}){return s.zaSide06Started===true||s.zaSide06Won===true||s.zaMission06Started===true||s.zaMission07Started===true||s.zaEmmaMegaSeen===true||Number(s.zaMission10Stage)>=1||['X','W','V','F','E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side06Spot(s,p){return s?.district==='lumiose-bleu-sector4'&&!s.interior&&p?.tile==='#'&&p.x===7&&p.y===3;}
export function side06ValidRewards(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===2&&Object.keys(p).every(k=>['nugget','coins'].includes(k))&&[0,1].includes(p.nugget)&&[0,1000].includes(p.coins);}
