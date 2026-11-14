// Route coordinates are provisional; the existing Mission 27 lift and bridge are reused.
export function side90Available(s={}){return [1,2,3,4].includes(s.zaSide90Stage)||(s.zaSide90Stage===undefined&&s.zaMission27Complete===true&&(s.zaMission30Complete===true||s.zaMission31Started===true||s.zaMission31Complete===true));}
export function side90Point(s={}){if(s.zaSide90Stage===undefined&&s.district==='lumiose-bleu-sector3')return [5,5];if(s.district==='lumiose-mission27-roof'&&s.zaSide90Stage===1)return [10,3];if(s.district==='lumiose-mission27-roof'&&[2,3].includes(s.zaSide90Stage))return [18,3];return null;}
export function side90Spot(s={},p){if(s.interior||!side90Available(s)||p?.tile!=='#')return false;const point=side90Point(s);return !!point&&p.x===point[0]&&p.y===point[1];}
