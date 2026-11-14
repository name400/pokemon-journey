// Locations are draft positions on the existing 2D streets.
export function side106Available(s={}){return [1,2,3].includes(s.zaSide106Stage)||Number(s.zaMission35Stage)>=7||s.zaMission35Complete===true||s.zaMission37Complete===true||s.zaMission38Complete===true||['A','S'].includes(s.zaRoyaleRank);}
export function side106Spot(s,p){if(s?.interior)return null;if(s?.district==='lumiose-hibernal-approach'&&p?.x===17&&p.y===7&&p.tile==='.')return 'cadena';if(s?.district==='lumiose-vert-sector9'&&p?.x===17&&p.y===9&&p.tile===','&&[1,2].includes(s.zaSide106Stage))return 'key';return null;}
