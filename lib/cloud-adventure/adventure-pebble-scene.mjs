// An unknown scene marker is left untouched for future versions.
export function pebbleSceneStep(w){
 const v=w?.zaPebbleSceneV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>3||Object.keys(v).some(k=>!['version','step'].includes(k)))return null;
 if(w.zaMission10Stage!==12||w.zaMission10Complete!==true||w.district!=='lumiose'||w.interior||w.combat||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
