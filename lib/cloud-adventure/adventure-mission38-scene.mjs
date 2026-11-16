// Only the exact supported scene marker is resumable.
export function mission38LobbySceneStep(w){
 const v=w?.zaMission38LobbySceneV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>4||Object.keys(v).some(k=>!['version','step'].includes(k)))return null;
 if(!w.zaMission38Started||w.zaMission38Stage||w.district!=='lumiose'||w.interior!=='hotel'||w.combat||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
