// Server-only factual adapter. Do not import the upstream rules catalog into client UI.
import reference from '../data/rogue-reference.json' with {type:'json'};
import formAppearance from '../data/rogue-form-appearance.json' with {type:'json'};
import extraAppearance from '../data/rogue-form-extra-appearance.json' with {type:'json'};
import {Dex} from '@pkmn/sim';
import {species,makeMon} from './game.mjs';
import {rules,moveNameByKey,configure} from './pokemon-config.mjs';

export const ROGUE_RULE_VERSION=reference.metadata.version;
export const DEFAULT_STARTER_IDS=Object.freeze([...reference.metadata.defaultStarterIds]);
// User-defined initial gift; retain the reference metadata unchanged for provenance.
export const DEFAULT_STARTER_IV=10;
export const STARTER_BUDGET=10;
const byId=new Map(species.map(p=>[p.id,p]));
const byIdentifier=new Map(species.map(p=>[p.identifier,p]));
const byDexKey=new Map();
for(const [id,r] of Object.entries(rules.species).reverse())byDexKey.set(r.key,Number(id));
const abilityNumbers=new Map(Dex.abilities.all().filter(a=>a.num>0).map(a=>[a.num,a.id]));
const moveNumbers=new Map(Dex.moves.all().filter(m=>m.num>0).map(m=>[m.num,moveNameByKey[m.id]||m.name]));
const typeLabels={NORMAL:'노말',FIGHTING:'격투',FLYING:'비행',POISON:'독',GROUND:'땅',ROCK:'바위',BUG:'벌레',GHOST:'고스트',STEEL:'강철',FIRE:'불꽃',WATER:'물',GRASS:'풀',ELECTRIC:'전기',PSYCHIC:'에스퍼',ICE:'얼음',DRAGON:'드래곤',DARK:'악',FAIRY:'페어리',STELLAR:'스텔라'};
const typeNames=Object.fromEntries(Object.entries(reference.enums.PokemonType).map(([k,v])=>[v,typeLabels[k]||'노말']));
const compact=value=>String(value).toLowerCase().replace(/[^a-z0-9]/g,'');
const regions={ALOLA:'alola',GALAR:'galar',HISUI:'hisui',PALDEA:'paldea'};
const formAliases={gigantamax:'gmax','gigantamax-single':'gmax','gigantamax-rapid':'rapidstrikegmax',jumbo:'super',partner:'starter',female:'f','battle-bond':'ash',standard:'',normal:'','white-striped':'whitestriped'};
const formCrosswalk=new Map(formAppearance.forms.map(row=>[`${row.sourceId}:${row.formIndex}`,{...row,...extraAppearance.forms.find(extra=>extra.sourceId===row.sourceId&&extra.formIndex===row.formIndex)}]));
const sourceSpriteUrl=file=>file?`https://raw.githubusercontent.com/smogon/sprites/${formAppearance.metadata.sprites.revision}/${file.path}`:null;
const resolveSourcePokemon=record=>{
 const special={BATTLE_BOND_GRENINJA:"greninja-battle-bond",ETERNAL_FLOETTE:"floette-eternal",BLOODMOON_URSALUNA:"ursaluna-bloodmoon"}[record.enumName];if(special&&byIdentifier.has(special))return byIdentifier.get(special).id;
 if(byId.has(record.sourceId)&&record.sourceId<=1025)return record.sourceId;
 const words=record.enumName.split('_'),region=regions[words[0]];
 if(region){const base=words.slice(1).join('-').toLowerCase(),key=compact(base+region);if(byDexKey.has(key))return byDexKey.get(key);const exact=byIdentifier.get(base+'-'+region);if(exact)return exact.id;const possible=species.filter(p=>p.identifier.startsWith(base+'-'+region));if(possible.length===1)return possible[0].id;
  if(base==='basculin'&&region==='hisui')return byDexKey.get('basculinwhitestriped');
  if(base==='tauros'&&region==='paldea')return byDexKey.get('taurospaldeacombat');
 }
 return byDexKey.get(compact(record.enumName))||null;
};

export const rogueSpecies=new Map();
export const rogueByPokemonId=new Map();
export const rogueForms=new Map();
const unmapped=[];
for(const raw of Object.values(reference.species)){
 const pokemonId=formCrosswalk.get(raw.sourceId+':0')?.pokemonId||resolveSourcePokemon(raw);
 if(!pokemonId){unmapped.push({sourceId:raw.sourceId,enumName:raw.enumName});continue;}
 const mon=byId.get(pokemonId),abilities=Object.entries(raw.abilities||{}).filter(([,id])=>id>0).map(([slot,id])=>({slot,key:abilityNumbers.get(id),sourceId:id})).filter(a=>a.key);
 const record={...raw,tms:raw.sourceId===312?reference.species[311].tms.filter(id=>![reference.enums.MoveId.SKILL_SWAP,reference.enums.MoveId.EERIE_IMPULSE].includes(id)):raw.tms,pokemonId,artId:mon.artId,name:mon.baseName||mon.name,types:raw.types.map(t=>typeNames[t]),abilities,formList:[]};
 rogueSpecies.set(raw.sourceId,record);rogueByPokemonId.set(pokemonId,record);
 for(const form of raw.forms||[]){const crosswalk=formCrosswalk.get(raw.sourceId+':'+form.formIndex),suffix=formAliases[form.formKey]??form.formKey??'',base=rules.species[pokemonId]?.key||compact(mon.identifier),formId=crosswalk?.pokemonId||(form.formIndex===0||!suffix?pokemonId:byDexKey.get(base+compact(suffix))||species.find(p=>p.speciesId===mon.speciesId&&p.identifier.endsWith('-'+String(suffix)))?.id);const item={...form,sourceId:raw.sourceId,pokemonId:formId||null,nativeSpecies:crosswalk?.nativeSpecies||null,spriteKey:crosswalk?.spriteKey||null,sourceImage:crosswalk?.sourceImage||sourceSpriteUrl(crosswalk?.spriteFiles?.front),sourceBackImage:crosswalk?.sourceBackImage||sourceSpriteUrl(crosswalk?.spriteFiles?.back),sourceShinyImage:crosswalk?.sourceShinyImage||sourceSpriteUrl(crosswalk?.spriteFiles?.shinyFront),sourceShinyBackImage:crosswalk?.sourceShinyBackImage||sourceSpriteUrl(crosswalk?.spriteFiles?.shinyBack),sourceAppearanceMissing:!!crosswalk&&!crosswalk.spriteKey,types:form.types?.map(t=>typeNames[t])||record.types,abilities:Object.entries(form.abilities||{}).filter(([,id])=>id>0).map(([slot,id])=>({slot,key:abilityNumbers.get(id),sourceId:id})).filter(a=>a.key),selectable:form.isStarterSelectable??!form.formKey};record.formList.push(item);if(formId){rogueForms.set(formId,item);if(!rogueByPokemonId.has(formId))rogueByPokemonId.set(formId,record);}}
}
// Cosmetic form records can share simulator species keys. Preserve their source family.
for(const mon of species)if(!rogueByPokemonId.has(mon.id)){const info=rules.species[mon.id],base=rogueSpecies.get(mon.speciesId);if(base&&info)rogueByPokemonId.set(mon.id,base);}

export const ROGUE_REFERENCE_COVERAGE=Object.freeze({version:ROGUE_RULE_VERSION,sourceSpecies:Object.keys(reference.species).length,mappedSpecies:rogueSpecies.size,selectableStarters:[...rogueSpecies.values()].filter(s=>s.isStarter).length,unmapped});
export function sourceSpeciesFor(mon){return rogueSpecies.get(mon.rogueSourceId)||rogueByPokemonId.get(Number(mon.id))||rogueSpecies.get(Number(mon.speciesId))||null;}
export function sourceAbility(id){return abilityNumbers.get(id)||null;}
export function sourceMove(id){return moveNumbers.get(id)||null;}
export function starterMoves(record,level=5,eggMask=0){
 const result=[];for(const [at,id] of record.levelMoves||[])if(at>0&&at<=level){const name=sourceMove(id);if(name&&!result.includes(name))result.push(name);}
 for(const [index,id] of (record.eggMoves||[]).entries())if((eggMask&(1<<index))!==0){const name=sourceMove(id);if(name&&!result.includes(name))result.push(name);}
 return result.length?result:['몸부림'];
}
export function reducedStarterCost(base,reductions=0){let result=base;for(let i=0;i<Math.min(2,reductions);i++)result=result<=1?result/2:result-1;return result;}
export function makeReferenceMon(sourceId,level=5,patch={}){
 const record=rogueSpecies.get(Number(sourceId));if(!record)throw Error('등록되지 않은 포켓로그 포켓몬입니다.');
 if(!Number.isSafeInteger(level)||level<1)throw Error('포켓로그 레벨이 올바르지 않습니다.');
 // The shared cartridge constructor stays capped at100. Classic sets its
 // source level/stats below, independently of Adventure's validation rules.
 const base=makeMon(record.pokemonId,Math.min(100,level)),nature=patch.nature||'hardy';
 const result=configure({...base,rogueSourceId:record.sourceId,rogueBaseStats:{...record.baseStats},rogueTypes:[...record.types],baseExperience:record.baseExp,captureRate:record.catchRate,friendship:record.baseFriendship??base.friendship,moves:starterMoves(record,level).slice(-4),ability:record.abilities[0]?.key||base.ability,evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0},...patch},{level,nature});
 return result;
}
export {reference as rogueReferenceData};
