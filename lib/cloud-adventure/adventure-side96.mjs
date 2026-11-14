// https://www.thonky.com/pokemon-legends-z-a/side-mission-096-let-us-battle-artistically
// The Rouge Sector 1 court and NPC coordinate are a 2D approximation.
export function side96Available(s={}){return [1,2,3].includes(s.zaSide96Stage)||Number(s.zaMission35Stage)>=1||s.zaMission35Complete===true||s.zaMission37Complete===true||s.zaMission38Complete===true||['A','S'].includes(s.zaRoyaleRank);}
export function side96Spot(s,p){if(s?.interior)return false;const court=s?.district==='lumiose-rouge-sector1'&&p?.tile==='.'&&p.x===18&&p.y===3;const legacy=[1,2,3].includes(s?.zaSide96Stage)&&s?.district==='lumiose-centrico-route'&&p?.tile==='#'&&p.x===22&&p.y===3;return court||legacy;}
