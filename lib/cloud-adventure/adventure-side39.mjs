// Quille is on South Boulevard; this 2D position is provisional.
// https://www.serebii.net/legendsz-a/sidemissions/slowpokeforslowpoke.shtml
// https://www.thonky.com/pokemon-legends-z-a/side-mission-039-slowpoke-for-slowpoke
export function side39Available(s={}){return s.zaSide39Started===true||s.zaSide39Complete===true||Number(s.zaMission14Stage)>=9||s.zaMission15Started===true||s.zaMission20Complete===true||['E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side39Spot(s,spot){return s?.district==='lumiose-south-boulevard'&&!s.interior&&s.zaVert7RoofUpper!==true&&spot?.tile==='^'&&spot.x===8&&spot.y===11;}
export function side39Eligible(mon){return mon?.id===79&&mon?.speciesId===79&&(mon.formId==null||mon.formId===79);}
