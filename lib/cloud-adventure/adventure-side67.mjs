// The original quest visits five conversations along Coulant Waterway.
// Positions and the compressed two-layer arrangement are 2D approximations.
// https://www.thonky.com/pokemon-legends-z-a/side-mission-067-sylveon-the-soother
// https://allthings.how/how-to-complete-sylveon-the-soother-side-mission-67-in-pokemon-legends-z-a/
export const SIDE67_SPOTS=Object.freeze([
 {id:'calma',x:14,y:12,lower:true},
 {id:'fans',name:'카나리 팬들',x:4,y:0,lower:false},
 {id:'couple',name:'수로 건너편의 연인',x:10,y:16,lower:false},
 {id:'family',name:'다리 아래의 부녀',x:7,y:4,lower:true},
 {id:'syndicate',name:'러스트단 사람들',x:15,y:0,lower:false},
 {id:'trainers',name:'수로의 트레이너들',x:9,y:12,lower:true},
]);
export function side67Available(s={}){return [21,22,23].every(n=>s[`zaMission${n}Complete`]===true)||s.zaMission20Complete===true||s.zaSide67Started===true||s.zaSide67Complete===true;}
export function side67Found(s={}){const ids=SIDE67_SPOTS.slice(1).map(p=>p.id);return [...new Set(Array.isArray(s.zaSide67Found)?s.zaSide67Found.filter(id=>ids.includes(id)):[])];}
export function side67Spot(s,spot){if(s?.district!=='lumiose-coulant-route'||s.interior||spot?.tile!=='^'||!side67Available(s))return null;return SIDE67_SPOTS.find(p=>p.x===spot.x&&p.y===spot.y&&p.lower===(s.zaCoulantLower===true))||null;}
