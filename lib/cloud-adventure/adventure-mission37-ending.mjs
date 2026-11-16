// Unrecognised scene versions remain untouched.
export function mission37EndingStep(w){
 const v=w?.zaMission37EndingV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>3||Object.keys(v).some(k=>!['version','step'].includes(k)))return null;
 if(w.zaMission37Complete===true||w.zaMission37FinalPhase!==8||w.zaMission37Stage!==7||w.district!=='lumiose-protect'||w.interior||w.combat||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
