import records from '../data/rogue-reviewed-transformation-atlases.json' with {type:'json'};
const compact=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
// A battle appearance is authoritative only with its matching transformation flag.
// Permanent source forms additionally retain their exact source index and key.
export function reviewedTransformationAtlas(mon){
 if(!mon||mon.sourceAppearanceMissing||mon.mega)return null;
 const source=mon.rogueSourceId??mon.sourceId,index=mon.rogueFormIndex??mon.formIndex;
 return records.find(record=>{
  if(record.sourceId!==source)return false;
  const kind=record.formKey.startsWith('gigantamax')?'gigantamax':record.formKey;
  if(['primal','ultra','gigantamax','eternamax'].some(flag=>mon[flag]&&flag!==kind)||mon.dynamaxed&&kind!=='gigantamax')return false;
  const exact=index===record.formIndex&&mon.rogueFormKey===record.formKey;
  const active=!!mon[kind]&&record.native.includes(compact(mon.battleAppearance));
  if(!exact&&!active)return false;
  if(mon.battleAppearance&&!record.native.includes(compact(mon.battleAppearance)))return false;
  if(exact&&mon.rogueBattleSpecies&&!record.native.includes(compact(mon.rogueBattleSpecies)))return false;
  return true;
 })||null;
}
