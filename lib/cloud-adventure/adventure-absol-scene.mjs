// Unknown scene versions remain untouched, including on older saves.
export function absolSceneStep(w){
 const v=w?.zaAbsolSceneV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>3||typeof v.returnHotel!=='boolean'||Object.keys(v).some(k=>!['version','step','returnHotel'].includes(k)))return null;
 if(w.zaAbsolRewardClaimed!==true||w.zaMysteryTrail!==5||w.combat||w.interior||w.district!=='lumiose-rooftop'||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
