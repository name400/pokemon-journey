// https://www.thonky.com/pokemon-legends-z-a/side-mission-065-apartment-block-eeriness
export function side65Available(s={}){return [1,2,3,4,5,6].includes(s.zaSide65Stage)||Number(s.zaMission20Stage)>=5||s.zaMission20Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['C','B','A','S'].includes(s.zaRoyaleRank);}
export function side65DedennePoint(s={}){return ({1:[3,3],2:[9,3],3:[19,2],4:[19,2]})[s.zaSide65Stage]||null;}
export function side65Spot(s,p){if(!s||s.interior||p?.tile!=='#')return null;if(s.district==='lumiose-rouge-sector7'&&p.x===15&&p.y===11)return 'ante';if(s.district!=='lumiose-rouge7-roof')return null;const point=side65DedennePoint(s);return point&&p.x===point[0]&&p.y===point[1]?'dedenne':null;}
