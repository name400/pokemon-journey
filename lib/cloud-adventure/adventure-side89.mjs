// Quest stages retain progress across reconnects; rooftop positions are 2D drafts.
export function side89Available(s={}){return [1,2,3,4,5,6,7,8].includes(s.zaSide89Stage)||(s.zaSide89Stage===undefined&&(s.zaMission30Started===true||s.zaMission30Complete===true||s.zaMission31Started===true||s.zaMission37Complete===true));}
export function side89Point(s={}){if(s.district!=='lumiose-screw-jaune7')return null;if(s.zaSide89Stage===undefined||s.zaSide89Stage===7)return [5,3];return ({1:[17,3],2:[7,3],3:[16,13],4:[6,13],5:[17,13],6:[17,13]})[s.zaSide89Stage]||null;}
export function side89Spot(s={},p){if(s.interior||!side89Available(s)||p?.tile!=='#')return null;const q=side89Point(s);if(!q||p.x!==q[0]||p.y!==q[1])return null;return s.zaSide89Stage===undefined||s.zaSide89Stage===7?'urmand':'emolga';}
export function recordSide89Victory(s,foe){if(s.zaSide89Stage!==6||foe?.adventureMissionId!=='side89-emolga')return false;s.zaSide89Stage=7;return true;}
