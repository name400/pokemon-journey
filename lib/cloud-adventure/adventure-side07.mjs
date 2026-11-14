// Axi's taxi is represented on a blocked frontage; exact 2D coordinates are provisional.
// https://www.serebii.net/legendsz-a/sidemissions/afeistychespin.shtml
export function side07Available(s={}){return s.zaSide07Won===true||s.zaMission06Started===true||s.zaMission07Started===true||s.zaEmmaMegaSeen===true||Number(s.zaMission10Stage)>=1||['X','W','V','F','E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side07Spot(s,p){return s?.district==='lumiose-rouge-sector2'&&!s.interior&&p?.tile==='#'&&p.x===18&&p.y===11;}
export function side07ValidPending(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===2&&Object.keys(p).every(k=>['xs','small'].includes(k))&&Number.isSafeInteger(p.xs)&&p.xs>=0&&p.xs<=3&&Number.isSafeInteger(p.small)&&p.small>=0&&p.small<=1;}
