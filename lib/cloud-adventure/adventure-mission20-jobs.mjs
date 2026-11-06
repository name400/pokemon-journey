// Crystal coordinates and trainer moves are provisional; counts and teams follow the source audit.
export const CRYSTAL_POSITIONS=[4,8,12].flatMap(y=>[3,5,7,9,11,13,15,17,19].map(x=>({x,y,key:`${x},${y}`})));
export function clearedCrystals(s){const allowed=new Set(CRYSTAL_POSITIONS.map(p=>p.key));return [...new Set((Array.isArray(s.zaMission20Crystals)?s.zaMission20Crystals:[]).filter(k=>allowed.has(k)))];}
export const MISSION20_FRANCOIS={id:'mission20-francois',name:'François',team:[[444,47],[705,47]]};
export const MISSION20_VIVICA={id:'mission20-vivica',name:'Vivica',team:[[683,48],[685,48]]};
export const MISSION20_SAFETY={id:'mission20-safety',name:'안전 단체 대표',team:[[127,48],[95,48],[362,49]]};
