// Only scenes created for newly started Corbeau battles are interpreted.
export function rankBSceneStep(w){
 const v=w?.zaRankBZygardeSceneV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>3||Object.keys(v).some(k=>!['version','step'].includes(k)))return null;
 if(w.zaMission30Round!==3||w.zaRoyaleRank!=='C'||!w.zaMission30Started||w.zaMission30Won||w.district!=='lumiose-centrico-route'||!['','richissimeHall'].includes(w.interior||'')||w.combat||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
