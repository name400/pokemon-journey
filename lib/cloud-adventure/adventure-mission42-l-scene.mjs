// Do not interpret unknown scene versions or change an active battle.
export function mission42LSceneStep(w){
 const v=w?.zaMission42LSceneV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>3||Object.keys(v).some(k=>!['version','step'].includes(k)))return null;
 if(w.zaMission42IntroEligibleV1!==true||w.zaMission42Stage||w.zaMission40Complete!==true||w.zaMission41Complete!==true||w.district!=='lumiose'||(w.interior&&w.interior!=='hotel')||w.combat||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
