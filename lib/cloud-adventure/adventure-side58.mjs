// https://www.serebii.net/legendsz-a/sidemissions/bettertodetectthantoprotect.shtml
export function side58Available(s={}){return [1,2,3].includes(s.zaSide58Stage)||s.zaMission19Complete===true||s.zaMission20Started===true||s.zaMission20Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['C','B','A','S'].includes(s.zaRoyaleRank);}
export function side58Spot(s,p){return s?.district==='lumiose-bleu-sector4'&&!s.interior&&p?.tile==='#'&&p.x===3&&p.y===3;}
