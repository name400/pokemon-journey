// Do not interpret unknown future markers as this version of the scene.
export function mission35SceneStep(w){
 const v=w?.zaMission35SceneV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>4||Object.keys(v).some(k=>!['version','step'].includes(k)))return null;
 if(w.zaMission35Stage!==6||w.district!=='lumiose'||w.interior!==(w.zaMission35RoofRequired?'hotelRoof':'hotel')||w.combat||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
