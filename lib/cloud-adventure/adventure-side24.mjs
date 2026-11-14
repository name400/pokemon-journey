// Bond's position on the compact academy map is provisional.
// https://www.serebii.net/legendsz-a/sidemissions/anabraplaymate.shtml
export function side24Available(s={}){return s.zaSide24Started===true||s.zaSide24Complete===true||Number(s.zaMission10Stage)>=2||s.zaMission10Complete===true||s.zaMission11Complete===true||s.zaMission37Complete===true||['F','E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side24Spot(s,p){return s?.district==='lumiose-rouge-sector6'&&s.zaAcademyCourtyard===true&&!s.interior&&p?.tile==='%'&&p.x===16&&p.y===4;}
export function side24Eligible(mon){return mon?.id===63&&mon?.speciesId===63&&(mon.formId==null||mon.formId===63);}
