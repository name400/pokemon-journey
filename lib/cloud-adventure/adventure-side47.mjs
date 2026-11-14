// Mirte asks to see Slash, then trims Furfrou in Jaune Sector 6.
// https://www.serebii.net/legendsz-a/sidemissions/becomingafurfroutrimmer.shtml
export function side47Available(s={}){return [1,2,3].includes(s.zaSide47Stage)||s.zaMission15Complete===true||Number(s.zaMission15Stage)>=4||Number(s.zaMission19Stage)>=1||s.zaMission19Complete===true||s.zaMission20Started===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side47Spot(s,p){if(s?.district!=='lumiose-jaune-sector6'||s.interior||p?.tile!=='^'||p.y!==11)return null;return p.x===15?'mirte':p.x===16?'dummy':null;}
