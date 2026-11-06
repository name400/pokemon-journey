import records from '../data/rogue-reviewed-form-atlases.json' with {type:'json'};
const compact=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function reviewedOrdinaryFormRecord(mon){const source=mon?.rogueSourceId??mon?.sourceId,index=mon?.rogueFormIndex??mon?.formIndex;return records.find(r=>r.sourceId===source&&r.formIndex===index&&r.formKey===mon?.rogueFormKey)||null;}
// Asset availability does not grant a form, transformation or fusion permission.
export function reviewedOrdinaryFormAtlas(mon){
 if(!mon||mon.sourceAppearanceMissing||mon.mega||mon.primal||mon.ultra||mon.gigantamax||mon.eternamax)return null;
 const record=reviewedOrdinaryFormRecord(mon);
 if(!record?.native.length){if(mon.rogueTrainerStarmobile===true&&record?.sourceId===966&&record.formIndex>=1&&record.formIndex<=5&&['segin-starmobile','schedar-starmobile','navi-starmobile','ruchbah-starmobile','caph-starmobile'][record.formIndex-1]===record.formKey&&[mon.battleAppearance,mon.rogueBattleSpecies].every(value=>!value||compact(value)==='revavroom'))return record;return null;}
 for(const value of [mon.battleAppearance,mon.rogueBattleSpecies])if(value&&!record.native.includes(compact(value)))return null;
 if(record.genderDiffs){if(!['M','F'].includes(mon.gender))return null;if(mon.gender==='F')return {...record,atlas:record.femaleAtlas};}
 return record;
}
