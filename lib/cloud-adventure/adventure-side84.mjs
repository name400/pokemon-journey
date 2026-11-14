// https://ns5.serebii.net/legendsz-a/sidemissions/strikefirsttomake%27emflinch.shtml
export function side84Available(s={}){return [1,2,3].includes(s.zaSide84Stage)||Number(s.zaMission26Stage)>=3||s.zaMission26Complete===true||s.zaMission30Complete===true||s.zaMission37Complete===true||['B','A','S'].includes(s.zaRoyaleRank);}
export function side84Spot(s,p){return s?.district==='lumiose-quasartico'&&!s.interior&&p?.tile==='#'&&p.x===14&&p.y===4;}
