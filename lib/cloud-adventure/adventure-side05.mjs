// Ismene stands in Magenta Sector 1; this compact 2D position is provisional.
// https://www.serebii.net/legendsz-a/sidemissions/i%27dliketoseeanekans.shtml
export function side05Available(s={}){return s.zaSide05Started===true||s.zaSide05Complete===true||s.zaMission06Started===true||s.zaMission07Started===true||s.zaEmmaMegaSeen===true||Number(s.zaMission10Stage)>=1||['X','W','V','F','E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side05Spot(s,p){return s?.district==='lumiose-magenta-sector1'&&!s.interior&&p?.tile==='#'&&p.x===5&&p.y===11;}
export function side05ValidRewards(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===3&&Object.keys(p).every(k=>['pechaberry','cheriberry','sodapop'].includes(k))&&Number.isSafeInteger(p.pechaberry)&&p.pechaberry>=0&&p.pechaberry<=3&&Number.isSafeInteger(p.cheriberry)&&p.cheriberry>=0&&p.cheriberry<=3&&Number.isSafeInteger(p.sodapop)&&p.sodapop>=0&&p.sodapop<=1;}
