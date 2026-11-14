// https://www.serebii.net/legendsz-a/sidemissions/becomingaprofurfroutrimmer.shtml
export function side62Available(s={}){return [1,2,3].includes(s.zaSide62Stage)||([2,3].includes(s.zaSide47Stage)&&(s.zaMission20Started===true||s.zaMission20Complete===true||s.zaMission30Started===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['C','B','A','S'].includes(s.zaRoyaleRank)));}
