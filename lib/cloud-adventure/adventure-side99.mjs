// https://www.thonky.com/pokemon-legends-z-a/side-mission-099-pleasing-arons-palate
// Placement west of the existing lab is a 2D approximation.
export function side99Available(s={}){return [1,2,3].includes(s.zaSide99Stage)||Number(s.zaMission35Stage)>=2||s.zaMission35Complete===true||s.zaMission37Complete===true||s.zaMission38Complete===true||['A','S'].includes(s.zaRoyaleRank);}
export function side99Spot(s,p){if(s?.district!=='lumiose-floral'||s.interior||p?.tile!=='.')return null;if(p.x===3&&p.y===5)return 'appee';if(p.x===2&&p.y===5&&s.zaSide99Stage===1)return 'scrap';return null;}
