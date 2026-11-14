// Maxen and Deb are on Magenta Street, west of Wild Zone 7.
// https://advent.serebii.net/legendsz-a/sidemissions/chasingstatus.shtml
export function side38Available(s={}){return [1,2,3,4].includes(s.zaSide38Stage)||Number(s.zaMission14Stage)>=9||Number(s.zaMission15Stage)>=1||['E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side38Spot(s,p){if(s?.district!=='lumiose-magenta-street'||s.interior||p?.tile!=='^'||p.y!==5)return null;return p.x===15?'maxen':p.x===17?'deb':null;}
