// https://www.thonky.com/pokemon-legends-z-a/side-mission-091-dragon-you-into-battle
// Guivre is northeast of Wild Zone 2. Her exact position is a 2D draft.
export function side91Available(s={}){return [1,2,3].includes(s.zaSide91Stage)||s.zaMission31Started===true||s.zaMission30Complete===true||s.zaMission37Complete===true||s.zaMission38Complete===true||['A','S'].includes(s.zaRoyaleRank);}
export function side91Spot(s,p){return s?.district==='lumiose-vert-sector3'&&!s.interior&&p?.tile==='#'&&p.x===0&&p.y===6;}
