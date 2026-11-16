// Only the exact supported marker activates a resumable scene.
export function mission15SceneStep(w){
 const v=w?.zaMission15SceneV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>3||Object.keys(v).some(k=>k!=='version'&&k!=='step'))return null;
 if(w.zaMission15SceneSeen===true||w.combat||w.interior||w.district!=='lumiose-rooftop'||![2,3].includes(w.zaMission15Stage)||w.adventureCatchWindow||w.adventurePendingMoves?.length||![16,17,18].every(n=>w[`zaMission${n}Complete`]===true))return null;
 return v.step;
}
