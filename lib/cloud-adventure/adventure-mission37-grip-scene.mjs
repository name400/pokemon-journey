// Preserve unsupported versions instead of attempting to resume them.
export function mission37GripSceneStep(w){
 const v=w?.zaMission37GripSceneV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>3||Object.keys(v).some(k=>!['version','step'].includes(k)))return null;
 if(w.zaMission37Stage!==7||w.zaMission37FinalPhase!==7||w.zaMission37Complete===true||w.district!=='lumiose-protect'||w.interior||w.combat||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
