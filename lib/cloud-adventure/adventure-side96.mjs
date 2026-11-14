// https://www.thonky.com/pokemon-legends-z-a/side-mission-096-let-us-battle-artistically
// Court position is a 2D approximation on the existing Centrico route.
export function side96Available(s={}){return [1,2,3].includes(s.zaSide96Stage)||Number(s.zaMission35Stage)>=1||s.zaMission35Complete===true||s.zaMission37Complete===true||s.zaMission38Complete===true||['A','S'].includes(s.zaRoyaleRank);}
export function side96Spot(s,p){return s?.district==='lumiose-centrico-route'&&!s.interior&&p?.tile==='#'&&p.x===22&&p.y===3;}
