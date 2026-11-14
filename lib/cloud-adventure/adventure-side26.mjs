// Side mission 26, not main mission 26. The restaurant frontage is a 2D draft.
// https://www.thonky.com/pokemon-legends-z-a/side-mission-026-burn-litleo-burn
export function side26Available(s={}){return s.zaSide26Won===true||Number(s.zaMission10Stage)>=2||s.zaMission10Complete===true||s.zaMission11Complete===true||s.zaMission37Complete===true||['F','E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side26Spot(s,p){return s?.district==='lumiose-rouge-sector3'&&!s.interior&&p?.tile==='^'&&p.x===14&&p.y===11;}
export function side26ValidRewards(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===4&&Object.keys(p).every(k=>['burnheal','firestone','za-tm057','coins'].includes(k))&&['burnheal','firestone','za-tm057'].every(k=>Number.isSafeInteger(p[k])&&p[k]>=0&&p[k]<=1)&&[0,900].includes(p.coins);}
