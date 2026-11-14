// https://bulbapedia.bulbagarden.net/wiki/Mission_(Legends:_Z-A)
export function side64Available(s={}){return [1,2,3].includes(s.zaSide64Stage)||Number(s.zaMission20Stage)>=5||s.zaMission20Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['C','B','A','S'].includes(s.zaRoyaleRank);}
export function side64Spot(s,p){return s?.district==='lumiose-rouge-sector7'&&!s.interior&&p?.tile==='#'&&p.x===19&&p.y===11;}
