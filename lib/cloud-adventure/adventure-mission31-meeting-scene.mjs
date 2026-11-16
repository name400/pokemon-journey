// Leave unrecognized or future scene records untouched.
export function mission31MeetingSceneStep(w){
 const v=w?.zaMission31MeetingSceneV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>3||Object.keys(v).some(k=>!['version','step'].includes(k)))return null;
 if(w.zaMission31Stage!==2||w.district!=='lumiose'||w.interior!=='hotel'||w.combat||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
