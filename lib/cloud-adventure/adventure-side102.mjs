// https://www.serebii.net/legendsz-a/sidemissions/achillingchallenge.shtml
// Glace is behind the Zone 12 court; exact tile is a 2D approximation.
export function side102Available(s={}){return [1,2,3].includes(s.zaSide102Stage)||Number(s.zaMission35Stage)>=7||s.zaMission35Complete===true||s.zaMission37Complete===true||s.zaMission38Complete===true||['A','S'].includes(s.zaRoyaleRank);}
export function side102Spot(s,p){return s?.district==='lumiose-zone12'&&!s.interior&&s.zaZone12PondLower!==true&&p?.tile==='.'&&p.x===5&&p.y===2;}
