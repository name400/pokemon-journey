// Do not consume unknown or future versions of the lab conversation.
export function labLSceneStep(w){
 const v=w?.zaLabLSceneV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>4||Object.keys(v).some(k=>!['version','step'].includes(k)))return null;
 if(w.zaMission35Stage!==4||w.district!=='lumiose-lysandre-lab'||w.interior||w.zaLysandreFloor!==3||w.combat||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
