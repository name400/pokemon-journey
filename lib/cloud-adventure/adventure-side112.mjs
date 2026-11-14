// Quest and stall coordinates are approximate on the existing 2D Magenta Street.
// https://www.thonky.com/pokemon-legends-z-a/side-mission-112-exploring-the-scents-of-spritzee
// https://altissimo1.github.io/Supplementary-Series/Legends/Legends-Z-A/berry-stalls.html
export const BASIC_BERRIES=Object.freeze(['oranberry','cheriberry','chestoberry','pechaberry','rawstberry','aspearberry','persimberry']);
export function side112Available(s={}){return [1,2,3].includes(s.zaSide112Stage)||s.zaMission37Complete===true||s.zaMission38Started===true||s.zaMission38Complete===true||s.zaMission39Started===true;}
export function side112Spot(s,p){return s?.district==='lumiose-magenta-street'&&!s.interior&&p?.tile===','&&p.x===17&&p.y===9;}
export function basicBerryStall(s,p){return s?.district==='lumiose-magenta-street'&&!s.interior&&p?.tile===','&&p.x===19&&p.y===7;}
