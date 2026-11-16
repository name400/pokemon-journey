// Resume only a scene whose exact version and fields are understood.
export function mission36SceneStep(w){
 const v=w?.zaMission36SceneV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>4||Object.keys(v).some(k=>!['version','step'].includes(k)))return null;
 if(w.zaMission36Stage!==2||w.district!=='lumiose-centrico-route'||w.interior||w.combat||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
