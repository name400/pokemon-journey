// The fountain and Croquis positions are schematic in the compact city map.
// https://www.serebii.net/legendsz-a/sidemissions/stumpedatthefountain.shtml
// https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Side_Missions_1-20
export const SIDE13_WAVES={1:[[3,5]],2:[[3,2],[5,2],[7,2]],3:[[3,2],[5,2],[7,2],[3,4],[7,4]]};
export function side13Available(s={}){return s.zaSide13Stage!==undefined||s.zaMission07Started===true||Number(s.zaMission10Stage)>=1||['W','V','F','E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side13Artist(s,p){return s?.district==='lumiose-jaune-sector7'&&!s.interior&&p?.tile==='#'&&p.x===5&&p.y===5;}
export function side13ValidCleared(s={}){const wave=SIDE13_WAVES[s.zaSide13Stage],v=s.zaSide13ClearedV1;return !!wave&&(v===undefined||Array.isArray(v)&&v.length<=wave.length&&new Set(v).size===v.length&&v.every(n=>Number.isInteger(n)&&n>=0&&n<wave.length));}
export function side13Bramble(s,p){if(s?.district!=='lumiose-jaune-sector7'||s.interior||p?.tile!=='r'||!side13ValidCleared(s))return -1;const i=SIDE13_WAVES[s.zaSide13Stage].findIndex(([x,y])=>p.x===x&&p.y===y);return i>=0&&!(s.zaSide13ClearedV1||[]).includes(i)?i:-1;}
