// https://www.thonky.com/pokemon-legends-z-a/side-mission-100-starmie-on-high
// Canal-side NPC position near the Magenta center is an approximate 2D tile.
export function side100Available(s={}){return [1,2,3].includes(s.zaSide100Stage)||Number(s.zaMission35Stage)>=2||s.zaMission35Complete===true||s.zaMission37Complete===true||s.zaMission38Complete===true||['A','S'].includes(s.zaRoyaleRank);}
export function side100Spot(s,p){return s?.district==='lumiose-magenta-street'&&!s.interior&&p?.tile==='.'&&p.x===9&&p.y===5;}
