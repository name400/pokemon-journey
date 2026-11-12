// Turn-based approximation: the original sources describe relative damage, not
// numeric values. The separate 100-point gauge uses 5 per flower, 20 per first
// two Zygarde attacks and 30 for Core Enforcer. Flowers cannot be credited twice
// within the same phase, including after a defeat or reconnect.
// https://bulbapedia.bulbagarden.net/wiki/Ange#Hyperrogue_Ange_Floette
const BASE=[100,90,70,60,40,30,0,0];
const FLOWERS=['ange-red','ange-blue'];
function phaseOf(s){const n=s?.zaMission37FinalPhase;return Number.isInteger(n)&&n>=0&&n<BASE.length?n:0;}
export function mission37AngeProgress(s){
 const phase=phaseOf(s),saved=s?.zaMission37AngeV1;
 if(saved&&saved.phase===phase&&Number.isInteger(saved.hp)&&saved.hp>=0&&saved.hp<=BASE[phase]&&Array.isArray(saved.flowers)&&saved.flowers.every(id=>FLOWERS.includes(id))&&new Set(saved.flowers).size===saved.flowers.length){
  const maxDamage=phase%2===0&&phase<6?saved.flowers.length*5:0;
  if(saved.hp===BASE[phase]-maxDamage)return {phase,hp:saved.hp,flowers:[...saved.flowers]};
 }
 return {phase,hp:BASE[phase],flowers:[]};
}
export function mission37RecordFlowers(s,foes){
 const progress=mission37AngeProgress(s);if(progress.phase>=6||progress.phase%2||!Array.isArray(foes))return [];
 const added=[];for(const id of FLOWERS){const foe=foes.find(mon=>mon.boxId===id);if(foe&&foe.hp===0&&!progress.flowers.includes(id)){progress.flowers.push(id);progress.hp-=5;added.push(id);}}
 if(added.length)s.zaMission37AngeV1=progress;return added;
}
export function mission37RecordZygarde(s){
 const progress=mission37AngeProgress(s);if(![1,3,5].includes(progress.phase))return null;
 const nextPhase=progress.phase+1;s.zaMission37AngeV1={phase:nextPhase,hp:BASE[nextPhase],flowers:[]};return BASE[nextPhase];
}
