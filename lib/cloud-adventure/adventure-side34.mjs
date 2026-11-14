// The exact position is a provisional tile in the existing 2D Jaune Sector 8.
// https://www.serebii.net/legendsz-a/sidemissions/movesthatputupawall.shtml
export function side34Available(s={}){return s.zaSide34Won===true||Number(s.zaMission14Stage)>=1||Number(s.zaMission15Stage)>=1||s.zaMission15Started===true||s.zaMission37Complete===true||['E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side34Spot(s,p){return s?.district==='lumiose-jaune-sector8'&&!s.interior&&p?.tile==='^'&&p.x===17&&p.y===5;}
export function side34RewardsValid(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===3&&Object.keys(p).every(k=>['coins','lemonade','za-tm031'].includes(k))&&[0,1100].includes(p.coins)&&['lemonade','za-tm031'].every(k=>Number.isSafeInteger(p[k])&&p[k]>=0&&p[k]<=1);}
