import records from '../data/rogue-reviewed-mega-atlases.json' with {type:'json'};
import transformations from '../data/rogue-reviewed-transformation-atlases.json' with {type:'json'};
import ordinary from '../data/rogue-reviewed-form-atlases.json' with {type:'json'};
const allAtlases=new Map([...records,...transformations,...ordinary.flatMap(record=>[record,...(record.femaleAtlas?[{...record,atlas:record.femaleAtlas,variants:record.femaleVariants,backVariants:record.femaleBackVariants}]:[])])].map(record=>[record.atlas,record]));
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
export function reviewedAtlasRoot(key){return allAtlases.has(key)?'/game/pokerogue/pokemon':null;}
export function reviewedAtlasVariant(key,variant,facing='front'){const record=allAtlases.get(key);return record?(facing==='back'&&record.backVariants?record.backVariants:record.variants)[variant]??0:null;}
// The pinned new forms are TexturePacker array atlases, while older assets use
// multi-texture JSON. Both formats retain the source frame order and trimming.
export function sourceAtlasFrames(atlas){const frames=atlas?.textures?.[0]?.frames??atlas?.frames;if(Array.isArray(frames))return frames;if(frames&&typeof frames==='object')return Object.entries(frames).filter(([,frame])=>frame&&typeof frame==='object').map(([filename,frame])=>({...frame,filename}));return [];}
