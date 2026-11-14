// https://www.siliconera.com/where-to-go-in-pokemon-legends-z-a-for-finding-a-place-for-heliolisk/
// Positions within the project's existing 2D boulevard and roof are approximate.
export function side93Available(s={}){return [1,2,3].includes(s.zaSide93Stage)||s.zaMission31Started===true||s.zaMission30Complete===true||s.zaMission37Complete===true||s.zaMission38Complete===true||['A','S'].includes(s.zaRoyaleRank);}
export function side93Person(s,p){return !s?.interior&&s?.district==='lumiose-south-boulevard'&&s.zaVert7RoofUpper!==true&&p?.tile==='#'&&p.x===17&&p.y===11;}
export function side93Roof(s,p){return !s?.interior&&s?.district==='lumiose-screw-magenta1'&&p?.tile==='j'&&p.x===4&&p.y===12;}
