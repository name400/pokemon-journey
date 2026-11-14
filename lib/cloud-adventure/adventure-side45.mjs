// Durstin repairs the Bleu Sector 7 Holovator after receiving a drink.
// https://www.serebii.net/legendsz-a/sidemissions/onmaintenanceduty.shtml
export function side45Available(s={}){return [1,2,3].includes(s.zaSide45Stage)||Number(s.zaMission19Stage)>=1||s.zaMission19Complete===true||s.zaMission20Started===true||s.zaMission20Complete===true||s.zaMission24Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side45Spot(s,p){return s?.district==='lumiose-bleu-sector7'&&!s.interior&&p?.tile==='j'&&(!s.zaBleu7Upper?p.x===14&&p.y===14:p.x===18&&p.y===12);}
export const SIDE45_DRINKS=Object.freeze(['freshwater','sodapop','lemonade','moomoomilk']);
