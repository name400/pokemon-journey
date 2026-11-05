import {Dex} from '@pkmn/sim';
import {rules} from './pokemon-config.mjs';
export function classicNativeForm(record,form){
 if(!record||!form||typeof form.formKey!=='string')return null;
 if(record.sourceId===892&&form.formKey==='gigantamax-single')return Dex.species.get('urshifugmax');
 if(record.sourceId===892&&form.formKey==='gigantamax-rapid')return Dex.species.get('urshifurapidstrikegmax');
 const base=Dex.species.get(rules.species[record.pokemonId]?.key),mapped=form.pokemonId?Dex.species.get(form.nativeSpecies||rules.species[form.pokemonId]?.key||''):null;if(mapped?.exists&&(form.formIndex===0||form.pokemonId!==record.pokemonId||mapped.id!==base.id))return mapped;
 const suffix=form.formKey.startsWith('gigantamax')?'Gmax':form.formKey,candidate=Dex.species.get(base.name+(suffix?'-'+suffix:''));return candidate.exists&&(candidate.id!==base.id||!form.formKey)?candidate:null;
}
export function classicPersistentFormKind(record,form){
 const native=classicNativeForm(record,form);if(!native)return null;
 if(form.formKey.startsWith('mega')&&native.isMega)return 'mega';
 if(form.formKey==='primal'&&native.isPrimal)return 'primal';
 if(form.formKey==='ultra'&&native.forme==='Ultra')return 'ultra';
 if(form.formKey.startsWith('gigantamax')&&native.forme.endsWith('Gmax'))return 'gigantamax';
 if(({646:['black','white'],800:['dusk-mane','dawn-wings'],898:['ice','shadow']})[record.sourceId]?.includes(form.formKey))return 'combined';
 if(record.sourceId===892&&['single-strike','rapid-strike'].includes(form.formKey))return 'style';
 return null;
}
