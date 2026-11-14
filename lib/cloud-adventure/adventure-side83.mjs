// https://www.thonky.com/pokemon-legends-z-a/side-mission-083-honedges-cutting-edge
export function side83Available(s={}){return [1,2,3].includes(s.zaSide83Stage)||Number(s.zaMission26Stage)>=3||s.zaMission26Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['B','A','S'].includes(s.zaRoyaleRank);}
export function side83Spot(s,p){return s?.district==='lumiose-rouge-north'&&!s.interior&&p?.tile==='#'&&p.x===18&&p.y===2;}
