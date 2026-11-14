// Side mission 25: positions in the compact 2D Magenta Sector 4 are drafts.
// https://bulbapedia.bulbagarden.net/wiki/Task_(Legends:_Z-A)
export function side25Available(s){return [1,2].includes(s?.zaSide25Stage)||Number(s?.zaMission10Stage)>=2||s?.zaMission10Complete===true||s?.zaMission11Complete===true||s?.zaMission37Complete===true||['F','E','D','C','B','A','S'].includes(s?.zaRoyaleRank);}
export function side25Cafe(s,p){return s?.district==='lumiose-magenta-sector4'&&!s.interior&&p?.tile==='q'&&p.x===5&&p.y===6;}
export function side25Trash(s,p){return s?.district==='lumiose-magenta-sector4'&&!s.interior&&p?.tile==='^'&&p.x===15&&p.y===10;}
