// Unknown scene records and already-started legendary missions are never consumed.
export function mission39MemorySceneStep(w){
 const v=w?.zaMission39MemorySceneV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>3||Object.keys(v).some(k=>!['version','step'].includes(k)))return null;
 if(w.zaInfiniteFirstWon!==true||w.zaMission40Started||w.zaMission41Started||w.district!=='lumiose'||w.interior!=='hotel'||w.combat||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
