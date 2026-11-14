// https://advent.serebii.net/legendsz-a/sidemissions/themostelectrifyingeelektrik.shtml
export function side53Available(s={}){return [1,2,3].includes(s.zaSide53Stage)||Number(s.zaMission19Stage)>=7||s.zaMission19Complete===true||s.zaMission20Started===true||s.zaMission20Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side53Spot(s,p){return s?.district==='lumiose-bleu-sector5'&&!s.interior&&p?.tile==='^'&&p.x===3&&p.y===10;}
