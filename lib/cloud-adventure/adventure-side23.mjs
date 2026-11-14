// https://www.serebii.net/legendsz-a/sidemissions/underneaththeholovator.shtml
// Position is a draft; later milestones preserve access for old saves.
export function side23Available(s){return [1,2,3].includes(s?.zaSide23Stage)||Number(s?.zaMission10Stage)>=3||s?.zaMission10Complete===true||s?.zaMission11Complete===true||s?.zaMission37Complete===true||['F','E','D','C','B','A','S'].includes(s?.zaRoyaleRank);}
export function side23Spot(s,spot){return s?.district==='lumiose-vernal'&&!s.interior&&!s.zaVernalSlowbroBank&&spot?.tile==='j'&&(s.zaVernalEastRoof===true?spot.x===4&&spot.y===2:spot.x===3&&spot.y===0);}
export function recordSide23Victory(s,foe){if(s.zaSide23Stage!==1||foe?.adventureMissionId!=='side23-diggersby')return false;s.zaSide23Stage=2;return true;}
