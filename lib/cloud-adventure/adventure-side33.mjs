// Quest location is an approximation within the existing Vert Sector 4 map.
// https://www.serebii.net/legendsz-a/sidemissions/whohasthebiggermagikarp.shtml
export function side33Available(s={}){return [1,2,3].includes(s.zaSide33Stage)||Number(s.zaMission14Stage)>=1||Number(s.zaMission15Stage)>=1||s.zaMission15Started===true||s.zaMission37Complete===true||['E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side33Spot(s,p){return s?.district==='lumiose-vert-sector4'&&!s.interior&&!['roof','courtyard'].includes(s.zaVert4Layer)&&p?.tile==='^'&&p.x===14&&p.y===11;}
export function side33ValidRewards(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===3&&Object.keys(p).every(k=>['coins','pearl','za-exp-candy-s'].includes(k))&&[0,1500].includes(p.coins)&&Number.isSafeInteger(p.pearl)&&p.pearl>=0&&p.pearl<=1&&Number.isSafeInteger(p['za-exp-candy-s'])&&p['za-exp-candy-s']>=0&&p['za-exp-candy-s']<=10;}
