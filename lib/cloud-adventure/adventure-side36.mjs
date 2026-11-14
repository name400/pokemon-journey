// Chou is represented near Zone 9's southern approach; precise 2D coordinates are draft.
// https://www.serebii.net/legendsz-a/sidemissions/somefriendlycompetition.shtml
export function side36Available(s={}){return s.zaSide36Started===true||s.zaSide36Won===true||Number(s.zaMission14Stage)>=1||Number(s.zaMission15Stage)>=1||['E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side36Spot(s,p){return s?.area===3&&s.district==='lumiose-estival-approach'&&!s.interior&&p?.tile==='#'&&p.x===16&&p.y===13;}
export function side36RewardsValid(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===2&&Object.keys(p).every(k=>['soothebell','coins'].includes(k))&&[0,1].includes(p.soothebell)&&[0,3000].includes(p.coins);}
