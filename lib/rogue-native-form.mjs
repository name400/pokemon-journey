import {Dex} from '@pkmn/sim';
import {rules} from './pokemon-config.mjs';
// Pinned source forms whose simulator keys/order or Mega classification differ.
// Keep this local: Dex.species is shared with Adventure and must not be patched.
const megaAliases={359:{'mega-z':'absolmegaz'},445:{'mega-z':'garchompmegaz'},448:{'mega-z':'lucariomegaz'},801:{'mega-original':'magearnaoriginalmega'},978:{'mega-curly':'tatsugiricurlymega','mega-droopy':'tatsugiridroopymega','mega-stretchy':'tatsugiristretchymega'}};
const megaIds=new Set([...Object.values(megaAliases).flatMap(Object.values),'meowsticmmega','meowsticfmega']);
export function classicNativeMegaSpecies(native,mon){
 if(!megaIds.has(native.id)||native.isMega)return native;
 // Old standalone female Meowstic could contain the male native alias with no
 // Mega flag. Do not reclassify that ambiguous identity mid-battle: preserve
 // its existing flow until an explicit source-sex reverse/reapply fixes it.
 if(mon&&['meowsticmmega','meowsticfmega'].includes(native.id)&&native.gender!==mon.gender)return native;
 const local=new Dex.Species({...native});local.isMega=true;return local;
}
export function classicNativeForm(record,form,mon){
 if(!record||!form||typeof form.formKey!=='string')return null;
 // The pinned source keeps 10%-origin Complete separate for its later reset.
 // Both Complete variants share the native species, never their saved index.
 if(record.sourceId===718&&form.formKey==='10-complete')return Dex.species.get('zygardecomplete');
 if(record.sourceId===1017&&form.formIndex>=4&&form.formIndex<=7){const native=Dex.species.get(['ogerpontealtera','ogerponwellspringtera','ogerponhearthflametera','ogerponcornerstonetera'][form.formIndex-4]);return native.exists&&['hp','atk','def','spa','spd','spe'].every(k=>native.baseStats[k]===form.baseStats?.[k])?native:null;}
 if(record.sourceId===716&&form.formKey==='active'){const native=Dex.species.get('xerneas');return ['hp','atk','def','spa','spd','spe'].every(k=>native.baseStats[k]===form.baseStats?.[k])?native:null;}
 // Spewpa keeps its Vivillon pattern in the source save, with one native body.
 // Source west Gastrodon is the simulator's unsuffixed west-sea species.
 if(record.sourceId===665&&form.formIndex>0||record.sourceId===423&&form.formKey==='west'){const native=Dex.species.get(record.sourceId===665?'spewpa':'gastrodon');return native.exists&&['hp','atk','def','spa','spd','spe'].every(k=>native.baseStats[k]===form.baseStats?.[k])?native:null;}
 const alias=record.sourceId===678&&form.formKey==='mega'?(mon?.gender==='F'?'meowsticfmega':!mon||mon.gender==='M'?'meowsticmmega':null):megaAliases[record.sourceId]?.[form.formKey];
 if(record.sourceId===678&&form.formKey==='mega'&&!alias)return null;
 if(alias){const native=Dex.species.get(alias),base=Dex.species.get(rules.species[record.pokemonId]?.key);return native.exists&&native.baseSpecies===base.baseSpecies&&['hp','atk','def','spa','spd','spe'].every(k=>native.baseStats[k]===form.baseStats?.[k])?classicNativeMegaSpecies(native):null;}
 if(record.sourceId===892&&form.formKey==='gigantamax-single')return Dex.species.get('urshifugmax');
 if(record.sourceId===892&&form.formKey==='gigantamax-rapid')return Dex.species.get('urshifurapidstrikegmax');
 const base=Dex.species.get(rules.species[record.pokemonId]?.key),mapped=form.pokemonId?Dex.species.get(form.nativeSpecies||rules.species[form.pokemonId]?.key||''):null;if(mapped?.exists&&(form.formIndex===0||form.pokemonId!==record.pokemonId||mapped.id!==base.id))return mapped;
 const suffix=form.formKey.startsWith('gigantamax')?'Gmax':form.formKey,candidate=Dex.species.get(base.name+(suffix?'-'+suffix:''));return candidate.exists&&(candidate.id!==base.id||!form.formKey)?candidate:null;
}
export function classicPersistentFormKind(record,form,mon){
 const native=classicNativeForm(record,form,mon);if(!native)return null;
 if(((record.sourceId===386&&['attack','defense','speed'].includes(form.formKey))||([483,484,487].includes(record.sourceId)&&form.formKey==='origin')||([641,642,645,905].includes(record.sourceId)&&form.formKey==='therian')||(record.sourceId===720&&form.formKey==='unbound')||(record.sourceId===649&&['shock','burn','chill','douse'].includes(form.formKey))||([888,889].includes(record.sourceId)&&form.formKey==='crowned')||(record.sourceId===492&&form.formKey==='sky')||([493,773].includes(record.sourceId)&&form.formIndex>=1&&form.formIndex<=17&&native.types.length===1&&native.types[0].toLowerCase()===form.formKey))&&['hp','atk','def','spa','spd','spe'].every(stat=>native.baseStats[stat]===form.baseStats?.[stat]))return 'item';
 if(form.formKey.startsWith('mega')&&native.isMega)return 'mega';
 if(form.formKey==='primal'&&native.isPrimal)return 'primal';
 if(form.formKey==='ultra'&&native.forme==='Ultra')return 'ultra';
 if(form.formKey.startsWith('gigantamax')&&native.forme.endsWith('Gmax'))return 'gigantamax';
 if(record.sourceId===890&&form.formKey==='eternamax'&&native.id==='eternatuseternamax'&&['hp','atk','def','spa','spd','spe'].every(stat=>native.baseStats[stat]===form.baseStats?.[stat]))return 'eternamax';
 if(({646:['black','white'],800:['dusk-mane','dawn-wings'],898:['ice','shadow']})[record.sourceId]?.includes(form.formKey))return 'combined';
 if(record.sourceId===892&&['single-strike','rapid-strike'].includes(form.formKey))return 'style';
 return null;
}
