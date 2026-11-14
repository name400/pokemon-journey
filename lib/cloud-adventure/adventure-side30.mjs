// Arden's Vernal Avenue position is a provisional tile, not an original map coordinate.
// https://www.serebii.net/legendsz-a/sidemissions/showmeamegacamerupt.shtml
export function side30Available(s={}){return s.zaSide30Started===true||s.zaSide30Won===true||!!s.zaMission14Stage||['E','D','C','B','A','S'].includes(s.zaRoyaleRank)||Number(s.zaMission15Stage)>=1;}
export function side30Spot(s,p){return s?.area===3&&s.district==='lumiose-vernal'&&!s.interior&&!s.zaVernalEastRoof&&!s.zaVernalSlowbroBank&&p?.tile==='#'&&p.x===7&&p.y===0;}
