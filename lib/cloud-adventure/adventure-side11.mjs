// Montée in Rouge Sector 1; exact 2D position is provisional.
// https://www.serebii.net/legendsz-a/sidemissions/thekakunamaster.shtml
export function side11Available(s={}){return s.zaSide11Started===true||s.zaSide11Won===true||s.zaMission07Started===true||s.zaMission06Complete===true||Number(s.zaMission10Stage)>=1||['X','W','V','F','E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side11Spot(s,p){return s?.area===3&&s.district==='lumiose-rouge-sector1'&&!s.interior&&p?.tile==='#'&&p.x===15&&p.y===14;}
export function side11ValidRewards(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===3&&Object.keys(p).every(k=>['silverpowder','netball','coins'].includes(k))&&[0,1].includes(p.silverpowder)&&Number.isSafeInteger(p.netball)&&p.netball>=0&&p.netball<=5&&[0,700].includes(p.coins);}
