import {writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Dex} from '@pkmn/sim';
import {classicKnownPersistentFormItem} from '../lib/rogue-transformations.mjs';
const legacy=['leftovers','flameorb','toxicorb','lifeorb','choiceband','choicespecs','choicescarf','eviolite','assaultvest','focussash','blacksludge','rockyhelmet','expertbelt','shellbell','safetygoggles','heavydutyboots','muscleband','wiseglasses'];
// Explicitly reviewed species-dependent hooks without a form-change action.
const reviewedHooks=new Set(['abilityshield','adamantorb','boosterenergy','ejectpack','lightball','lustrousorb','mirrorherb','souldew','whiteherb']);
const items=Dex.items.all().map(item=>{
 const hooks=Object.entries(item).filter(([,value])=>typeof value==='function');
 let reason=legacy.includes(item.id)?'previously-reviewed':reviewedHooks.has(item.id)?'reviewed-general-hook':item.forcedForme||item.megaStone||item.megaEvolves||item.zMove||item.onPlate||item.onDrive||item.onMemory||classicKnownPersistentFormItem(item.id)?'form-or-special-item':item.isNonstandard||item.gen<1||item.gen>9?'outside-current-native-catalog':hooks.some(([,fn])=>/formeChange|formChange|transformInto|species|setType|setAbility|setSpecies|isPrimal|mega/i.test(String(fn)))?'species-or-form-hook-needs-review':!hooks.length&&!item.isBerry?'no-reviewed-held-effect':'general-held-effect';
 return {id:item.id,gen:item.gen,allowed:['previously-reviewed','general-held-effect','reviewed-general-hook'].includes(reason),reason,hooks:hooks.map(([key])=>key)};
}).sort((a,b)=>a.id.localeCompare(b.id));
const pkg=JSON.parse(readFileSync(new URL('../node_modules/@pkmn/sim/package.json',import.meta.url))),source=readFileSync(new URL('../node_modules/@pkmn/sim/build/cjs/data/items.js',import.meta.url));
const output={policy:'reviewed-native-v2',nativeVersion:pkg.version,itemsSha256:createHash('sha256').update(source).digest('hex'),items};
const destination=new URL('../data/rogue-dream-native-item-policy.json',import.meta.url),text=JSON.stringify(output,null,2)+'\n';
if(process.argv.includes('--check')){if(readFileSync(destination,'utf8')!==text)throw Error('Dream item policy must be regenerated and reviewed');}else writeFileSync(destination,text);
console.log(JSON.stringify({total:items.length,allowed:items.filter(i=>i.allowed).length,reasons:Object.fromEntries([...new Set(items.map(i=>i.reason))].map(r=>[r,items.filter(i=>i.reason===r).length]))}));
