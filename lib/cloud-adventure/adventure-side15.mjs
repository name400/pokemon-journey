// Hea is in Rouge Sector 1; the precise tile in the compact map is provisional.
// https://www.serebii.net/legendsz-a/sidemissions/asensitiveaudino.shtml
export function side15Available(s={}){return s.zaSide15Started===true||s.zaSide15Won===true||s.zaMission07Started===true||Number(s.zaMission10Stage)>=1||['W','V','F','E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side15Spot(s,p){return s?.district==='lumiose-rouge-sector1'&&!s.interior&&p?.tile==='#'&&p.x===18&&p.y===11;}
export function side15ValidRewards(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===3&&Object.keys(p).every(k=>['revive','super_potions','coins'].includes(k))&&Number.isSafeInteger(p.revive)&&p.revive>=0&&p.revive<=3&&Number.isSafeInteger(p.super_potions)&&p.super_potions>=0&&p.super_potions<=5&&[0,900].includes(p.coins);}
