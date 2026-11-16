// Unknown scene versions or extra fields must never be consumed.
export function mission31JettSceneStep(w){
 const v=w?.zaMission31JettSceneV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>4||Object.keys(v).some(k=>!['version','step'].includes(k)))return null;
 if(w.zaMission31Stage!==1||w.district!=='lumiose-quasartico'||w.interior!=='quasarticoOffice'||w.combat||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
