import records from '../data/rogue-reviewed-mega-atlases.json' with {type:'json'};
const compact=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function reviewedMegaAtlas(mon){
 if(!mon||mon.sourceAppearanceMissing||mon.primal||mon.ultra||mon.dynamaxed||mon.gigantamax||mon.eternamax)return null;
 const source=mon.rogueSourceId??mon.sourceId,index=mon.rogueFormIndex??mon.formIndex;
 const record=records.find(r=>r.sourceId===source&&r.formIndex===index&&r.formKey===mon.rogueFormKey);
 if(!record)return null;
 for(const value of [mon.battleAppearance,mon.rogueBattleSpecies])if(value&&!record.native.includes(compact(value)))return null;
 if(source===678&&(!['M','F'].includes(mon.gender)||[mon.battleAppearance,mon.rogueBattleSpecies].some(value=>value&&compact(value)!==(mon.gender==='F'?'meowsticfmega':'meowsticmmega'))))return null;
 return record;
}
export function reviewedAtlasRoot(key){return records.some(r=>r.atlas===key)?'/game/pokerogue/pokemon':null;}
export function reviewedAtlasVariant(key,variant){const record=records.find(r=>r.atlas===key);return record?record.variants[variant]??0:null;}
// The pinned new forms are TexturePacker array atlases, while older assets use
// multi-texture JSON. Both formats retain the source frame order and trimming.
export function sourceAtlasFrames(atlas){return atlas?.textures?.[0]?.frames??atlas?.frames??[];}
