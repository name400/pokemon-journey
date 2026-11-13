// Serebii: Side Mission 74 becomes available when Main Mission 26 begins.
export function side74Available(s){return !!s&&(s.zaMission26Started===true||s.zaMission26Complete===true||Number(s.zaMission26Stage)>0||s.zaMission27Started===true||s.zaMission30Started===true||s.zaMission37Complete===true||['B','A'].includes(s.zaRoyaleRank));}
export function side74Spot(s,spot){return !!s&&!s.interior&&s.district==='lumiose-vert-sector9'&&spot?.tile==='q'&&spot.x===5&&spot.y===6;}
export function recordSide74Victory(s,foe){if(s.zaSide74Stage!==1||foe?.adventureMissionId!=='side74-garbodor')return false;s.zaSide74Stage=2;return true;}
