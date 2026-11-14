// Vivace is represented beside the existing Bleu 8 salon; tile is provisional.
// https://bulbapedia.bulbagarden.net/wiki/Task_(Legends:_Z-A)
export const SIDE12_FORMS=Object.freeze({669:'red',30103:'yellow',30104:'orange',30105:'blue',30106:'white'});
export const SIDE12_COLORS=Object.freeze(['red','yellow','orange','blue','white']);
export function side12Color(mon){return mon?.speciesId===669?SIDE12_FORMS[mon.id]||null:null;}
export function side12Seen(s){const a=s?.zaSide12SeenV1;return Array.isArray(a)&&a.length<=5&&new Set(a).size===a.length&&a.every(x=>SIDE12_COLORS.includes(x))?a:null;}
export function side12Available(s={}){return s.zaSide12Started===true||s.zaSide12Complete===true||s.zaMission06Complete===true||s.zaMission07Started===true||Number(s.zaMission10Stage)>=1||['X','W','V','F','E','D','C','B','A','S'].includes(s.zaRoyaleRank);}
export function side12Spot(s,p){return s?.area===3&&s.district==='lumiose-bleu-sector8'&&!s.interior&&p?.tile==='#'&&p.x===15&&p.y===14;}
export function side12SalonColorAvailable(s,color){if(![...SIDE12_COLORS,'aqua','purple','passionpink'].includes(color))return true;const seen=side12Seen(s);return !!seen&&(seen.includes(color)||(['aqua','purple','passionpink'].includes(color)&&s.zaSide12Complete===true&&seen.length===5));}
