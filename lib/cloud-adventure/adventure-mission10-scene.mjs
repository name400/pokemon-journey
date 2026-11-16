// Unknown markers and older completed saves are not migrated automatically.
export function mission10SceneStep(w){
 const v=w?.zaMission10MeetingV1;
 if(!v||typeof v!=='object'||Array.isArray(v)||v.version!==1||!Number.isInteger(v.step)||v.step<1||v.step>4||Object.keys(v).some(k=>!['version','step'].includes(k)))return null;
 if(w.zaMission10Stage!==9||w.district!=='lumiose'||w.interior!=='hotel'||w.combat||w.adventureCatchWindow||w.adventurePendingMoves?.length)return null;
 return v.step;
}
export function mission10StarterStone(w){
 const types={152:'grass',498:'fire',158:'water'};
 const original=types[w?.zaIntroStarterSpecies];
 if(w?.zaIntroStarterSpecies!=null&&!original)return null;
 const type=original||(['grass','fire','water'].includes(w?.zaMission10Starter)?w.zaMission10Starter:null);
 return ({grass:'meganiumite',fire:'emboarite',water:'feraligite'})[type]||null;
}
