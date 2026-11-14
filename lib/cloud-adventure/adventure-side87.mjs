// https://www.serebii.net/legendsz-a/sidemissions/becomingapeerlessfurfroutrimmer.shtml
export function side87Available(s={}){return [1,2,3].includes(s.zaSide87Stage)||([2,3].includes(s.zaSide62Stage)&&(s.zaMission30Started===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['B','A','S'].includes(s.zaRoyaleRank)));}
