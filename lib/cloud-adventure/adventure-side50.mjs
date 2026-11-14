// https://www.serebii.net/legendsz-a/sidemissions/justafewquestionsforyou....shtml
export function side50Available(s={}){return [1,2,3].includes(s.zaSide50Stage)||Number(s.zaMission19Stage)>=1||s.zaMission19Complete===true||s.zaMission20Started===true||s.zaMission20Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side50Spot(s,p){return s?.district==='lumiose-magenta-sector1'&&!s.interior&&p?.tile==='^'&&p.x===15&&p.y===11;}
